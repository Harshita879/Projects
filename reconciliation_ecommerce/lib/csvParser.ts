import Papa from 'papaparse';
import {
  ColumnMap,
  StripeBalanceTxn,
  StripePayout,
  AmazonSettlementRow,
  ShopifyBalanceTxn,
  ShopifyPayout,
  BankTransaction
} from './types';
import { parseDateSafe } from './dateUtils';
import { parseDecimalToMinor } from './moneyUtils';

/**
 * Convert any numeric value to minor units
 * Handles: integers, decimals, positives, negatives
 * Always multiplies by 100 and rounds
 */
function toMinorUnits(value: string | number | undefined): number {
  if (value === undefined || value === null || value === '') return 0;
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return 0;
  // Always multiply by 100 and round (handles decimals)
  return Math.round(num * 100);
}

/**
 * Parse raw CSV file
 */
export async function parseRawCSV(
  file: File,
  delimiter: string = ','
): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      delimiter,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as Record<string, string>[]);
      },
      error: (error) => {
        reject(new Error(`CSV parse error: ${error.message}`));
      }
    });
  });
}

/**
 * Read CSV headers only
 */
export async function readCSVHeaders(file: File, delimiter: string = ','): Promise<string[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      delimiter,
      preview: 1,
      complete: (results) => {
        resolve(results.meta.fields || []);
      },
      error: (error) => {
        reject(new Error(`CSV parse error: ${error.message}`));
      }
    });
  });
}

/**
 * Generate unique bank transaction key
 */
function generateBankKey(date: Date | null, amount: number, index: number): string {
  const dateStr = date ? date.toISOString().split('T')[0] : 'no-date';
  return `${dateStr}|${amount}|${index}`;
}

// ============================================================================
// BANK STATEMENT PARSER
// ============================================================================

export async function parseBankStatement(
  file: File,
  columnMap: ColumnMap
): Promise<BankTransaction[]> {
  const rows = await parseRawCSV(file);
  
  const dateCol = columnMap['bank_date'];
  const descCol = columnMap['bank_description'];
  const amountCol = columnMap['bank_amount'];
  const balanceCol = columnMap['bank_balance'];
  
  if (!dateCol || !descCol || !amountCol) {
    throw new Error('Bank statement: Missing required column mappings');
  }
  
  const transactions: BankTransaction[] = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    const date = parseDateSafe(row[dateCol]);
    const description = row[descCol]?.trim() || '';
    const amountMinor = parseDecimalToMinor(row[amountCol]);
    const balanceMinor = balanceCol ? parseDecimalToMinor(row[balanceCol]) : null;
    
    // Skip opening balance rows
    if (description.toLowerCase().includes('opening balance')) continue;
    
    // Skip zero amounts
    if (amountMinor === 0) continue;
    
    transactions.push({
      date,
      description,
      amount: amountMinor,
      balance: balanceMinor,
      _key: generateBankKey(date, amountMinor, i)
    });
  }
  
  return transactions;
}

// ============================================================================
// STRIPE BALANCE TRANSACTIONS PARSER
// ============================================================================

export async function parseStripeBalance(
  file: File,
  columnMap: ColumnMap
): Promise<StripeBalanceTxn[]> {
  const rows = await parseRawCSV(file);
  
  // Required columns
  const idCol = columnMap['id'];
  const amountCol = columnMap['amount'];
  const feeCol = columnMap['fee'];
  const netCol = columnMap['net'];
  const currencyCol = columnMap['currency'];
  const payoutIdCol = columnMap['automatic_payout_id'];
  const availableOnCol = columnMap['available_on'];
  
  if (!idCol || !amountCol || !feeCol || !netCol || !currencyCol || !payoutIdCol || !availableOnCol) {
    throw new Error('Stripe balance: Missing required column mappings');
  }
  
  // Optional columns
  const createdCol = columnMap['created'];
  const reportingCategoryCol = columnMap['reporting_category'];
  const sourceCol = columnMap['source'];
  const customerCol = columnMap['customer'];
  const descriptionCol = columnMap['description'];
  const typeCol = columnMap['type'];
  const effectiveAtCol = columnMap['automatic_payout_effective_at'];
  
  const transactions: StripeBalanceTxn[] = [];
  
  for (const row of rows) {
    // Convert to minor units - CSV has major units (e.g., 100.00, -15.00, 3.2)
    // Always multiply by 100 to convert to minor units
    const amountMinor = toMinorUnits(row[amountCol] || row['gross'] || row['amount']);
    const feeMinor = toMinorUnits(row[feeCol] || row['fee']);
    const netMinor = toMinorUnits(row[netCol] || row['net']);
    
    transactions.push({
      id: row[idCol],
      created: createdCol ? parseDateSafe(row[createdCol]) : null,
      available_on: parseDateSafe(row[availableOnCol]),
      amount: amountMinor,
      fee: feeMinor,
      net: netMinor,
      currency: row[currencyCol].toLowerCase(),
      reporting_category: reportingCategoryCol ? row[reportingCategoryCol] : '',
      source: sourceCol ? row[sourceCol] : null,
      customer: customerCol ? row[customerCol] : null,
      automatic_payout_id: row[payoutIdCol] || null,
      automatic_payout_effective_at: effectiveAtCol ? parseDateSafe(row[effectiveAtCol]) : null,
      description: descriptionCol ? row[descriptionCol] : null,
      type: typeCol ? row[typeCol] : null
    });
  }
  
  return transactions;
}

// ============================================================================
// STRIPE PAYOUTS PARSER
// ============================================================================

export async function parseStripePayouts(
  file: File,
  columnMap: ColumnMap
): Promise<StripePayout[]> {
  const rows = await parseRawCSV(file);
  
  // Required columns
  const idCol = columnMap['id'];
  const amountCol = columnMap['amount'];
  const arrivalDateCol = columnMap['arrival_date'];
  const currencyCol = columnMap['currency'];
  const statusCol = columnMap['status'];
  
  if (!idCol || !amountCol || !arrivalDateCol || !currencyCol || !statusCol) {
    throw new Error('Stripe payouts: Missing required column mappings');
  }
  
  // Optional columns
  const createdCol = columnMap['created'];
  const descriptionCol = columnMap['description'];
  const destinationCol = columnMap['destination'];
  const automaticCol = columnMap['automatic'];
  const methodCol = columnMap['method'];
  const failureCodeCol = columnMap['failure_code'];
  const failureMessageCol = columnMap['failure_message'];
  const sourceTypeCol = columnMap['source_type'];
  const typeCol = columnMap['type'];
  
  const payouts: StripePayout[] = [];
  
  for (const row of rows) {
    // Convert to minor units - CSV has major units
    // Always multiply by 100 to convert to minor units
    const amountMinor = toMinorUnits(row[amountCol] || row['amount']);
    
    payouts.push({
      id: row[idCol],
      amount: amountMinor,
      arrival_date: parseDateSafe(row[arrivalDateCol]),
      created: createdCol ? parseDateSafe(row[createdCol]) : null,
      currency: row[currencyCol].toLowerCase(),
      status: row[statusCol],
      description: descriptionCol ? row[descriptionCol] : null,
      destination: destinationCol ? row[destinationCol] : null,
      automatic: automaticCol ? row[automaticCol].toLowerCase() === 'true' : null,
      method: methodCol ? row[methodCol] : null,
      failure_code: failureCodeCol ? row[failureCodeCol] : null,
      failure_message: failureMessageCol ? row[failureMessageCol] : null,
      source_type: sourceTypeCol ? row[sourceTypeCol] : null,
      type: typeCol ? row[typeCol] : null
    });
  }
  
  return payouts;
}

// ============================================================================
// AMAZON SETTLEMENT PARSER (TAB-DELIMITED)
// ============================================================================

export async function parseAmazonSettlement(
  file: File,
  columnMap: ColumnMap
): Promise<AmazonSettlementRow[]> {
  const rows = await parseRawCSV(file, '\t'); // TAB delimiter
  
  // Required columns (use hyphenated names as per API docs)
  const settlementIdCol = columnMap['settlement-id'];
  const depositDateCol = columnMap['deposit-date'];
  const totalAmountCol = columnMap['total-amount'];
  const currencyCol = columnMap['currency'];
  const amountTypeCol = columnMap['amount-type'];
  const amountDescCol = columnMap['amount-description'];
  const amountCol = columnMap['amount'];
  
  if (!settlementIdCol || !depositDateCol || !totalAmountCol || !currencyCol || 
      !amountTypeCol || !amountDescCol || !amountCol) {
    throw new Error('Amazon settlement: Missing required column mappings');
  }
  
  // Optional columns
  const transactionTypeCol = columnMap['transaction-type'];
  const orderIdCol = columnMap['order-id'];
  const marketplaceCol = columnMap['marketplace-name'];
  const postedDateTimeCol = columnMap['posted-date-time'];
  
  const rows_parsed: AmazonSettlementRow[] = [];
  
  for (const row of rows) {
    rows_parsed.push({
      'settlement-id': row[settlementIdCol],
      'settlement-start-date': null, // Not needed for reconciliation
      'settlement-end-date': null,
      'deposit-date': parseDateSafe(row[depositDateCol]),
      'total-amount': toMinorUnits(row[totalAmountCol]), // Convert to minor units
      'currency': row[currencyCol],
      'transaction-type': transactionTypeCol ? row[transactionTypeCol] : '',
      'order-id': orderIdCol ? row[orderIdCol] : null,
      'merchant-order-id': null,
      'adjustment-id': null,
      'marketplace-name': marketplaceCol ? row[marketplaceCol] : null,
      'amount-type': row[amountTypeCol],
      'amount-description': row[amountDescCol],
      'amount': toMinorUnits(row[amountCol]), // Convert to minor units
      'posted-date': null,
      'posted-date-time': postedDateTimeCol ? parseDateSafe(row[postedDateTimeCol]) : null
    });
  }
  
  return rows_parsed;
}

// ============================================================================
// SHOPIFY BALANCE TRANSACTIONS PARSER
// ============================================================================

export async function parseShopifyBalance(
  file: File,
  columnMap: ColumnMap
): Promise<ShopifyBalanceTxn[]> {
  const rows = await parseRawCSV(file);
  
  // Required columns
  const idCol = columnMap['id'];
  const payoutIdCol = columnMap['payout_id'];
  const typeCol = columnMap['type'];
  const amountCol = columnMap['amount'];
  const feeCol = columnMap['fee'];
  const netCol = columnMap['net'];
  const currencyCol = columnMap['currency'];
  const processedAtCol = columnMap['processed_at'];
  
  if (!idCol || !payoutIdCol || !typeCol || !amountCol || !feeCol || !netCol || 
      !currencyCol || !processedAtCol) {
    throw new Error('Shopify balance: Missing required column mappings');
  }
  
  // Optional columns
  const payoutStatusCol = columnMap['payout_status'];
  const sourceOrderIdCol = columnMap['source_order_id'];
  const testCol = columnMap['test'];
  
  const transactions: ShopifyBalanceTxn[] = [];
  
  for (const row of rows) {
    transactions.push({
      id: row[idCol],
      type: row[typeCol],
      test: testCol ? row[testCol].toLowerCase() === 'true' : false,
      payout_id: row[payoutIdCol] || null,
      payout_status: payoutStatusCol ? row[payoutStatusCol] : null,
      currency: row[currencyCol],
      amount: toMinorUnits(row[amountCol]), // Convert to minor units
      fee: toMinorUnits(row[feeCol]), // Convert to minor units
      net: toMinorUnits(row[netCol]), // Convert to minor units
      source_id: null,
      source_type: null,
      source_order_id: sourceOrderIdCol ? row[sourceOrderIdCol] : null,
      processed_at: parseDateSafe(row[processedAtCol])
    });
  }
  
  return transactions;
}

// ============================================================================
// SHOPIFY PAYOUTS PARSER
// ============================================================================

export async function parseShopifyPayouts(
  file: File,
  columnMap: ColumnMap
): Promise<ShopifyPayout[]> {
  const rows = await parseRawCSV(file);
  
  // Required columns
  const idCol = columnMap['id'];
  const statusCol = columnMap['status'];
  const dateCol = columnMap['date'];
  const currencyCol = columnMap['currency'];
  const amountCol = columnMap['amount'];
  
  if (!idCol || !statusCol || !dateCol || !currencyCol || !amountCol) {
    throw new Error('Shopify payouts: Missing required column mappings');
  }
  
  // Optional columns
  const chargesGrossCol = columnMap['charges_gross'];
  const chargesFeeCol = columnMap['charges_fee'];
  const refundsGrossCol = columnMap['refunds_gross'];
  const refundsFeeCol = columnMap['refunds_fee'];
  const adjustmentsCol = columnMap['adjustments'];
  
  const payouts: ShopifyPayout[] = [];
  
  for (const row of rows) {
    payouts.push({
      id: row[idCol],
      status: row[statusCol],
      date: parseDateSafe(row[dateCol]),
      currency: row[currencyCol],
      amount: toMinorUnits(row[amountCol]), // Convert to minor units
      charges_gross: chargesGrossCol ? toMinorUnits(row[chargesGrossCol]) : null,
      charges_fee: chargesFeeCol ? toMinorUnits(row[chargesFeeCol]) : null,
      refunds_gross: refundsGrossCol ? toMinorUnits(row[refundsGrossCol]) : null,
      refunds_fee: refundsFeeCol ? toMinorUnits(row[refundsFeeCol]) : null,
      adjustments: adjustmentsCol ? toMinorUnits(row[adjustmentsCol]) : null
    });
  }
  
  return payouts;
}

// Legacy exports for backward compatibility
export async function readCsvHeaders(file: File, delimiter: string = ','): Promise<string[]> {
  return readCSVHeaders(file, delimiter);
}

export function detectReportType(headers: string[]): string {
  // Simple detection based on headers
  const headerLower = headers.map(h => h.toLowerCase());
  
  if (headerLower.some(h => h.includes('settlement-id'))) return 'AMAZON_SETTLEMENT_V2';
  if (headerLower.some(h => h.includes('arrival_date') || h.includes('arrival date'))) return 'STRIPE_PAYOUTS';
  if (headerLower.some(h => h.includes('automatic_payout_id') || h.includes('automatic payout id'))) return 'STRIPE_BALANCE';
  if (headerLower.some(h => h.includes('payout_id') || h.includes('payout id')) && headerLower.some(h => h.includes('processed_at'))) return 'SHOPIFY_BALANCE_TXNS';
  if (headerLower.some(h => h.includes('payout_id') || h.includes('payout id')) && headerLower.some(h => h === 'date')) return 'SHOPIFY_PAYOUTS';
  
  return 'UNKNOWN';
}
