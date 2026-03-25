import {
  Platform,
  UploadState,
  BankTransaction,
  StripeBalanceTxn,
  StripePayout,
  AmazonSettlementRow,
  ShopifyBalanceTxn,
  ShopifyPayout,
  ReconciliationResult,
  PlatformReconciliation,
  PayoutMatch,
  PrePayoutValidation,
  ManualOverride,
  ColumnMap,
  FeeBreakdown
} from './types';
import { PLATFORM_CONFIGS } from './platformConfigs';
import {
  parseBankStatement,
  parseStripeBalance,
  parseStripePayouts,
  parseAmazonSettlement,
  parseShopifyBalance,
  parseShopifyPayouts
} from './csvParser';
import {
  matchPayoutToBank,
  PayoutForMatching
} from './matcher';

/**
 * Main reconciliation orchestrator
 */
export async function runReconciliation(
  uploadState: UploadState,
  manualOverrides: ManualOverride[] = []
): Promise<ReconciliationResult> {
  
  // Parse bank statement
  const bankDeposits = await parseBankStatement(
    uploadState.bank.file!,
    uploadState.bank.columnMap
  );
  
  // Calculate period
  const allDates = bankDeposits
    .map(d => d.date)
    .filter((d): d is Date => d !== null);
  
  const period_start = allDates.length > 0 
    ? new Date(Math.min(...allDates.map(d => d.getTime())))
    : new Date();
  const period_end = allDates.length > 0
    ? new Date(Math.max(...allDates.map(d => d.getTime())))
    : new Date();
  
  // Separate deposits and withdrawals
  const deposits = bankDeposits.filter(d => d.amount > 0);
  const withdrawals = bankDeposits.filter(d => d.amount < 0);
  
  // Track used bank keys across all platforms
  const usedBankKeys = new Set<string>();
  
  // Process each platform
  const platforms: PlatformReconciliation[] = [];
  
  // STRIPE
  if (uploadState.stripe?.balance?.file && uploadState.stripe?.payouts?.file) {
    const stripeResult = await reconcileStripe(
      uploadState.stripe.balance.file,
      uploadState.stripe.balance.columnMap,
      uploadState.stripe.payouts.file,
      uploadState.stripe.payouts.columnMap,
      deposits,
      usedBankKeys,
      manualOverrides.filter(o => o.platform === 'stripe'),
      period_start,
      period_end
    );
    platforms.push(stripeResult);
  }
  
  // AMAZON
  if (uploadState.amazon?.settlement?.file) {
    const amazonResult = await reconcileAmazon(
      uploadState.amazon.settlement.file,
      uploadState.amazon.settlement.columnMap,
      deposits,
      usedBankKeys,
      manualOverrides.filter(o => o.platform === 'amazon'),
      period_start,
      period_end
    );
    platforms.push(amazonResult);
  }
  
  // SHOPIFY
  if (uploadState.shopify?.balance?.file && uploadState.shopify?.payouts?.file) {
    const shopifyResult = await reconcileShopify(
      uploadState.shopify.balance.file,
      uploadState.shopify.balance.columnMap,
      uploadState.shopify.payouts.file,
      uploadState.shopify.payouts.columnMap,
      deposits,
      usedBankKeys,
      manualOverrides.filter(o => o.platform === 'shopify'),
      period_start,
      period_end
    );
    platforms.push(shopifyResult);
  }
  
  // Unallocated deposits (not matched to any platform)
  const unallocated = deposits.filter(d => !usedBankKeys.has(d._key));
  
  // Summary
  const bank_total_minor = deposits.reduce((sum, d) => sum + d.amount, 0);
  const platforms_expected_total_minor = platforms.reduce(
    (sum, p) => sum + p.total_expected_minor,
    0
  );
  const platforms_matched_total_minor = platforms.reduce(
    (sum, p) => sum + p.total_received_minor,
    0
  );
  const variance_minor = bank_total_minor - platforms_expected_total_minor;
  
  const total_expected_count = platforms.reduce((sum, p) => sum + p.expected_count, 0);
  const total_matched_count = platforms.reduce((sum, p) => sum + p.match_count, 0);
  const overall_match_rate = total_expected_count > 0
    ? total_matched_count / total_expected_count
    : 0;
  
  return {
    period_start,
    period_end,
    bank: {
      total_deposits_minor: bank_total_minor,
      total_withdrawals_minor: Math.abs(withdrawals.reduce((sum, w) => sum + w.amount, 0)),
      deposit_count: deposits.length,
      deposits
    },
    platforms,
    unallocated: {
      deposits: unallocated,
      total_minor: unallocated.reduce((sum, d) => sum + d.amount, 0),
      count: unallocated.length
    },
    summary: {
      bank_total_minor,
      platforms_expected_total_minor,
      platforms_matched_total_minor,
      variance_minor,
      overall_match_rate,
      platform_count: platforms.length
    }
  };
}

// ============================================================================
// STRIPE RECONCILIATION
// ============================================================================

async function reconcileStripe(
  balanceFile: File,
  balanceColumnMap: ColumnMap,
  payoutsFile: File,
  payoutsColumnMap: ColumnMap,
  bankDeposits: BankTransaction[],
  usedBankKeys: Set<string>,
  manualOverrides: ManualOverride[],
  periodStart: Date,
  periodEnd: Date
): Promise<PlatformReconciliation> {
  
  // Parse files
  const balanceTxns = await parseStripeBalance(balanceFile, balanceColumnMap);
  const payouts = await parseStripePayouts(payoutsFile, payoutsColumnMap);
  
  // Filter to paid payouts only
  const paidPayouts = payouts.filter(p => p.status === 'paid' || p.status === 'in_transit');
  
  // Group balance transactions by payout_id
  const txnsByPayout = new Map<string, StripeBalanceTxn[]>();
  for (const txn of balanceTxns) {
    if (!txn.automatic_payout_id) continue;
    if (!txnsByPayout.has(txn.automatic_payout_id)) {
      txnsByPayout.set(txn.automatic_payout_id, []);
    }
    txnsByPayout.get(txn.automatic_payout_id)!.push(txn);
  }
  
  // Pre-payout validation: Check that balance txns sum to payout amount
  const prePayoutValidation: PrePayoutValidation[] = [];
  for (const payout of paidPayouts) {
    const txns = txnsByPayout.get(payout.id) || [];
    const netSum = txns.reduce((sum, t) => sum + t.net, 0);
    
    prePayoutValidation.push({
      payout_id: payout.id,
      payout_amount_minor: payout.amount,
      balance_txns_count: txns.length,
      balance_txns_net_sum_minor: netSum,
      matches: Math.abs(netSum - payout.amount) <= 1, // Within 1 minor unit
      variance_minor: payout.amount - netSum,
      balance_txns: txns.map(t => ({
        id: t.id,
        type: t.reporting_category || t.type || 'unknown',
        amount_minor: t.amount,
        fee_minor: t.fee,
        net_minor: t.net
      }))
    });
  }
  
  // Warn about validation failures (but don't block)
  const failures = prePayoutValidation.filter(v => !v.matches);
  if (failures.length > 0) {
    console.warn('Stripe payout validation warnings:', failures.map(f => ({
      payout_id: f.payout_id,
      variance: f.variance_minor
    })));
  }
  
  // Match payouts to bank deposits
  const matches: PayoutMatch[] = [];
  
  for (const payout of paidPayouts) {
    // Check for manual override first
    const override = manualOverrides.find(o => o.payout_id === payout.id);
    
    if (override && override.type === 'IGNORE') {
      matches.push({
        payout: {
          id: payout.id,
          platform: 'stripe',
          date: payout.arrival_date,
          amount: payout.amount,
          currency: payout.currency,
          label: `Stripe payout ${payout.id}`
        },
        bank: null,
        status: 'IGNORED',
        reason: {
          code: 'MANUALLY_IGNORED',
          message: override.reason || 'Manually ignored'
        },
        confidence: 0
      });
      continue;
    }
    
    if (override && override.type === 'PENDING') {
      matches.push({
        payout: {
          id: payout.id,
          platform: 'stripe',
          date: payout.arrival_date,
          amount: payout.amount,
          currency: payout.currency,
          label: `Stripe payout ${payout.id}`
        },
        bank: null,
        status: 'PENDING',
        reason: {
          code: 'MANUALLY_PENDING',
          message: override.reason || 'Marked as pending'
        },
        confidence: 0
      });
      continue;
    }
    
    // Manual match
    if (override && override.type === 'MATCH' && override.bank_key) {
      const bank = bankDeposits.find(b => b._key === override.bank_key);
      if (bank) {
        matches.push({
          payout: {
            id: payout.id,
            platform: 'stripe',
            date: payout.arrival_date,
            amount: payout.amount,
            currency: payout.currency,
            label: `Stripe payout ${payout.id}`
          },
          bank,
          status: 'MATCHED',
          reason: {
            code: 'MANUALLY_MATCHED',
            message: 'Manually matched'
          },
          confidence: 1.0
        });
        usedBankKeys.add(bank._key);
        continue;
      }
    }
    
    // Auto-match
    const matchResult = matchPayoutToBank(
      {
        id: payout.id,
        platform: 'stripe',
        date: payout.arrival_date,
        amount_minor: payout.amount,
        currency: payout.currency,
        description: payout.description || `Stripe payout ${payout.id}`
      },
      bankDeposits,
      usedBankKeys,
      PLATFORM_CONFIGS.stripe.bankKeywords
    );
    
    matches.push({
      payout: {
        id: payout.id,
        platform: 'stripe',
        date: payout.arrival_date,
        amount: payout.amount,
        currency: payout.currency,
        label: `Stripe payout ${payout.id}`
      },
      bank: matchResult.bank,
      status: matchResult.status,
      reason: matchResult.reason,
      confidence: matchResult.confidence,
      candidates: matchResult.candidates
    });
    
    // Track used bank keys
    if (matchResult.bank && matchResult.status === 'MATCHED') {
      usedBankKeys.add(matchResult.bank._key);
    }
  }
  
  // Calculate fee breakdown from balance transactions
  const feeBreakdown: FeeBreakdown = {
    total_gross_minor: balanceTxns
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0),
    total_fees_minor: balanceTxns.reduce((sum, t) => sum + Math.abs(t.fee), 0),
    total_net_minor: balanceTxns.reduce((sum, t) => sum + t.net, 0),
    fee_details: [
      {
        type: 'Stripe Fees',
        amount_minor: balanceTxns.reduce((sum, t) => sum + Math.abs(t.fee), 0)
      }
    ]
  };
  
  // Calculate summary
  const total_expected_minor = paidPayouts.reduce((sum, p) => sum + p.amount, 0);
  const total_received_minor = matches
    .filter(m => m.status === 'MATCHED')
    .reduce((sum, m) => sum + (m.bank?.amount || 0), 0);
  
  const match_count = matches.filter(m => m.status === 'MATCHED').length;
  const expected_count = paidPayouts.length;
  const match_rate = expected_count > 0 ? match_count / expected_count : 0;
  const variance_minor = total_expected_minor - total_received_minor;
  
  return {
    platform: 'stripe',
    currency: payouts[0]?.currency || 'GBP',
    matches,
    total_expected_minor,
    total_received_minor,
    variance_minor,
    match_count,
    expected_count,
    match_rate,
    fee_breakdown: feeBreakdown,
    pre_payout_validation: prePayoutValidation
  };
}

// ============================================================================
// AMAZON RECONCILIATION
// ============================================================================

async function reconcileAmazon(
  settlementFile: File,
  columnMap: ColumnMap,
  bankDeposits: BankTransaction[],
  usedBankKeys: Set<string>,
  manualOverrides: ManualOverride[],
  periodStart: Date,
  periodEnd: Date
): Promise<PlatformReconciliation> {
  
  // Parse settlement file
  const rows = await parseAmazonSettlement(settlementFile, columnMap);
  
  // Group by settlement-id (each settlement is a payout)
  const settlements = new Map<string, AmazonSettlementRow[]>();
  for (const row of rows) {
    const settlementId = row['settlement-id'];
    if (!settlements.has(settlementId)) {
      settlements.set(settlementId, []);
    }
    settlements.get(settlementId)!.push(row);
  }
  
  // Create payout matches
  const matches: PayoutMatch[] = [];
  
  for (const [settlementId, settlementRows] of settlements) {
    const firstRow = settlementRows[0];
    const payoutAmount = firstRow['total-amount'];
    const depositDate = firstRow['deposit-date'];
    const currency = firstRow.currency.toUpperCase();
    
    // Check for manual override
    const override = manualOverrides.find(o => o.payout_id === settlementId);
    
    if (override && override.type === 'IGNORE') {
      matches.push({
        payout: {
          id: settlementId,
          platform: 'amazon',
          date: depositDate,
          amount: payoutAmount,
          currency,
          label: `Amazon settlement ${settlementId}`
        },
        bank: null,
        status: 'IGNORED',
        reason: {
          code: 'MANUALLY_IGNORED',
          message: override.reason || 'Manually ignored'
        },
        confidence: 0
      });
      continue;
    }
    
    if (override && override.type === 'PENDING') {
      matches.push({
        payout: {
          id: settlementId,
          platform: 'amazon',
          date: depositDate,
          amount: payoutAmount,
          currency,
          label: `Amazon settlement ${settlementId}`
        },
        bank: null,
        status: 'PENDING',
        reason: {
          code: 'MANUALLY_PENDING',
          message: override.reason || 'Marked as pending'
        },
        confidence: 0
      });
      continue;
    }
    
    // Manual match
    if (override && override.type === 'MATCH' && override.bank_key) {
      const bank = bankDeposits.find(b => b._key === override.bank_key);
      if (bank) {
        matches.push({
          payout: {
            id: settlementId,
            platform: 'amazon',
            date: depositDate,
            amount: payoutAmount,
            currency,
            label: `Amazon settlement ${settlementId}`
          },
          bank,
          status: 'MATCHED',
          reason: {
            code: 'MANUALLY_MATCHED',
            message: 'Manually matched'
          },
          confidence: 1.0
        });
        usedBankKeys.add(bank._key);
        continue;
      }
    }
    
    // Auto-match
    const matchResult = matchPayoutToBank(
      {
        id: settlementId,
        platform: 'amazon',
        date: depositDate,
        amount_minor: payoutAmount,
        currency,
        description: `Amazon settlement ${settlementId}`
      },
      bankDeposits,
      usedBankKeys,
      PLATFORM_CONFIGS.amazon.bankKeywords
    );
    
    matches.push({
      payout: {
        id: settlementId,
        platform: 'amazon',
        date: depositDate,
        amount: payoutAmount,
        currency,
        label: `Amazon settlement ${settlementId}`
      },
      bank: matchResult.bank,
      status: matchResult.status,
      reason: matchResult.reason,
      confidence: matchResult.confidence,
      candidates: matchResult.candidates
    });
    
    if (matchResult.bank && matchResult.status === 'MATCHED') {
      usedBankKeys.add(matchResult.bank._key);
    }
  }
  
  // Calculate fee breakdown
  let principal = 0;
  let commission = 0;
  let fbaFees = 0;
  let other = 0;
  
  for (const row of rows) {
    const amount = row.amount;
    const amountType = row['amount-type'];
    const amountDesc = row['amount-description'];
    
    if (amountType === 'ItemPrice' && amountDesc === 'Principal') {
      principal += amount;
    } else if (amountType === 'ItemFees' || amountType === 'FBA Fees') {
      commission += Math.abs(amount);
    } else if (amount < 0) {
      other += Math.abs(amount);
    }
  }
  
  const feeBreakdown: FeeBreakdown = {
    total_gross_minor: principal,
    total_fees_minor: commission + fbaFees + other,
    total_net_minor: principal - commission - fbaFees - other,
    fee_details: [
      { type: 'Commission', amount_minor: commission },
      { type: 'FBA Fees', amount_minor: fbaFees },
      { type: 'Other', amount_minor: other }
    ]
  };
  
  // Summary
  const total_expected_minor = Array.from(settlements.values())
    .reduce((sum, rows) => sum + rows[0]['total-amount'], 0);
  const total_received_minor = matches
    .filter(m => m.status === 'MATCHED')
    .reduce((sum, m) => sum + (m.bank?.amount || 0), 0);
  
  const match_count = matches.filter(m => m.status === 'MATCHED').length;
  const expected_count = settlements.size;
  const match_rate = expected_count > 0 ? match_count / expected_count : 0;
  const variance_minor = total_received_minor - total_expected_minor;
  
  return {
    platform: 'amazon',
    currency: rows[0]?.currency || 'GBP',
    matches,
    total_expected_minor,
    total_received_minor,
    variance_minor,
    match_count,
    expected_count,
    match_rate,
    fee_breakdown: feeBreakdown,
    pre_payout_validation: [] // Amazon doesn't have separate balance transactions
  };
}

// ============================================================================
// SHOPIFY RECONCILIATION
// ============================================================================

async function reconcileShopify(
  balanceFile: File,
  balanceColumnMap: ColumnMap,
  payoutsFile: File,
  payoutsColumnMap: ColumnMap,
  bankDeposits: BankTransaction[],
  usedBankKeys: Set<string>,
  manualOverrides: ManualOverride[],
  periodStart: Date,
  periodEnd: Date
): Promise<PlatformReconciliation> {
  
  // Parse files
  const balanceTxns = await parseShopifyBalance(balanceFile, balanceColumnMap);
  const payouts = await parseShopifyPayouts(payoutsFile, payoutsColumnMap);
  
  // Filter to paid payouts only
  const paidPayouts = payouts.filter(p => p.status === 'paid');
  
  // Group balance transactions by payout_id
  const txnsByPayout = new Map<string, ShopifyBalanceTxn[]>();
  for (const txn of balanceTxns) {
    if (!txn.payout_id) continue;
    if (!txnsByPayout.has(txn.payout_id)) {
      txnsByPayout.set(txn.payout_id, []);
    }
    txnsByPayout.get(txn.payout_id)!.push(txn);
  }
  
  // Pre-payout validation
  const prePayoutValidation: PrePayoutValidation[] = [];
  for (const payout of paidPayouts) {
    const txns = txnsByPayout.get(payout.id) || [];
    const netSum = txns.reduce((sum, t) => sum + t.net, 0);
    
    prePayoutValidation.push({
      payout_id: payout.id,
      payout_amount_minor: payout.amount,
      balance_txns_count: txns.length,
      balance_txns_net_sum_minor: netSum,
      matches: Math.abs(netSum - payout.amount) <= 1,
      variance_minor: payout.amount - netSum,
      balance_txns: txns.map(t => ({
        id: t.id,
        type: t.type || 'unknown',
        amount_minor: t.amount,
        fee_minor: t.fee,
        net_minor: t.net
      }))
    });
  }
  
  // Match payouts to bank deposits
  const matches: PayoutMatch[] = [];
  
  for (const payout of paidPayouts) {
    const override = manualOverrides.find(o => o.payout_id === payout.id);
    
    if (override && override.type === 'IGNORE') {
      matches.push({
        payout: {
          id: payout.id,
          platform: 'shopify',
          date: payout.date,
          amount: payout.amount,
          currency: payout.currency,
          label: `Shopify payout ${payout.id}`
        },
        bank: null,
        status: 'IGNORED',
        reason: {
          code: 'MANUALLY_IGNORED',
          message: override.reason || 'Manually ignored'
        },
        confidence: 0
      });
      continue;
    }
    
    if (override && override.type === 'PENDING') {
      matches.push({
        payout: {
          id: payout.id,
          platform: 'shopify',
          date: payout.date,
          amount: payout.amount,
          currency: payout.currency,
          label: `Shopify payout ${payout.id}`
        },
        bank: null,
        status: 'PENDING',
        reason: {
          code: 'MANUALLY_PENDING',
          message: override.reason || 'Marked as pending'
        },
        confidence: 0
      });
      continue;
    }
    
    if (override && override.type === 'MATCH' && override.bank_key) {
      const bank = bankDeposits.find(b => b._key === override.bank_key);
      if (bank) {
        matches.push({
          payout: {
            id: payout.id,
            platform: 'shopify',
            date: payout.date,
            amount: payout.amount,
            currency: payout.currency,
            label: `Shopify payout ${payout.id}`
          },
          bank,
          status: 'MATCHED',
          reason: {
            code: 'MANUALLY_MATCHED',
            message: 'Manually matched'
          },
          confidence: 1.0
        });
        usedBankKeys.add(bank._key);
        continue;
      }
    }
    
    // Auto-match
    const matchResult = matchPayoutToBank(
      {
        id: payout.id,
        platform: 'shopify',
        date: payout.date,
        amount_minor: payout.amount,
        currency: payout.currency,
        description: payout.description || `Shopify payout ${payout.id}`
      },
      bankDeposits,
      usedBankKeys,
      PLATFORM_CONFIGS.shopify.bankKeywords
    );
    
    matches.push({
      payout: {
        id: payout.id,
        platform: 'shopify',
        date: payout.date,
        amount: payout.amount,
        currency: payout.currency,
        label: `Shopify payout ${payout.id}`
      },
      bank: matchResult.bank,
      status: matchResult.status,
      reason: matchResult.reason,
      confidence: matchResult.confidence,
      candidates: matchResult.candidates
    });
    
    if (matchResult.bank && matchResult.status === 'MATCHED') {
      usedBankKeys.add(matchResult.bank._key);
    }
  }
  
  // Calculate fee breakdown
  const feeBreakdown: FeeBreakdown = {
    total_gross_minor: balanceTxns
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0),
    total_fees_minor: balanceTxns.reduce((sum, t) => sum + Math.abs(t.fee), 0),
    total_net_minor: balanceTxns.reduce((sum, t) => sum + t.net, 0),
    fee_details: [
      {
        type: 'Shopify Fees',
        amount_minor: balanceTxns.reduce((sum, t) => sum + Math.abs(t.fee), 0)
      }
    ]
  };
  
  // Summary
  const total_expected_minor = paidPayouts.reduce((sum, p) => sum + p.amount, 0);
  const total_received_minor = matches
    .filter(m => m.status === 'MATCHED')
    .reduce((sum, m) => sum + (m.bank?.amount || 0), 0);
  
  const match_count = matches.filter(m => m.status === 'MATCHED').length;
  const expected_count = paidPayouts.length;
  const match_rate = expected_count > 0 ? match_count / expected_count : 0;
  const variance_minor = total_expected_minor - total_received_minor;
  
  return {
    platform: 'shopify',
    currency: payouts[0]?.currency || 'GBP',
    matches,
    total_expected_minor,
    total_received_minor,
    variance_minor,
    match_count,
    expected_count,
    match_rate,
    fee_breakdown: feeBreakdown,
    pre_payout_validation: prePayoutValidation
  };
}
