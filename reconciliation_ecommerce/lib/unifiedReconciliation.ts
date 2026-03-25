import { parseBalanceTransactions, parsePayouts, parseBankStatement, parseCSV } from './csvParser'
import { createExpectedEntry, createActualEntry, buildClearingAccount } from './clearingAccount'
import { PLATFORM_CONFIGS } from './platformConfigs'
import type {
    Platform,
    PlatformFiles,
    BankTransaction,
    ClearingEntry,
    UnifiedReconciliationResult,
    PlatformReconciliation,
    UnallocatedDeposit,
    StripeDetails,
    AmazonDetails,
    PayoutSummary,
    AmazonSettlementSummary,
    AmazonSettlementRow,
    BalanceTransaction,
} from './types'

// ============================================
// MAIN RECONCILIATION FUNCTION
// ============================================

export async function reconcileAll(
    bankFile: File,
    platformFiles: PlatformFiles
): Promise<UnifiedReconciliationResult> {
    // 1. Parse bank statement
    const bankTransactions = await parseBankStatement(bankFile)

    // 2. Categorize bank deposits by platform
    const categorizedDeposits = categorizeBankDeposits(bankTransactions)

    // 3. Process each platform that has files uploaded
    const platformResults: PlatformReconciliation[] = []

    // Process Stripe if files provided
    if (platformFiles.stripe?.balanceTransactions && platformFiles.stripe?.payouts) {
        const stripeResult = await processStripe(
            platformFiles.stripe.balanceTransactions,
            platformFiles.stripe.payouts,
            categorizedDeposits.stripe
        )
        platformResults.push(stripeResult)
    }

    // Process Amazon if files provided
    if (platformFiles.amazon?.settlementReport) {
        const amazonResult = await processAmazon(
            platformFiles.amazon.settlementReport,
            categorizedDeposits.amazon
        )
        platformResults.push(amazonResult)
    }

    // 4. Build unallocated deposits list
    const unallocatedDeposits = buildUnallocatedDeposits(categorizedDeposits.unallocated)

    // 5. Calculate unified summary
    const summary = calculateUnifiedSummary(platformResults, unallocatedDeposits, bankTransactions)

    // 6. Determine period from all data
    const allDates = bankTransactions.map(t => parseUKDate(t.Date))
    const periodStart = allDates.length > 0 ? new Date(Math.min(...allDates.map(d => d.getTime()))).toISOString() : new Date().toISOString()
    const periodEnd = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))).toISOString() : new Date().toISOString()

    // Detect currency from platforms (use first platform's currency)
    const detectedCurrency = platformResults.length > 0
        ? platformResults[0].clearingAccount.currency
        : 'GBP'

    return {
        periodStart,
        periodEnd,
        currency: detectedCurrency,
        bankStatement: {
            totalDeposits: bankTransactions
                .reduce((sum, t) => sum + (parseFloat(t['Paid In']) || 0) * 100, 0),
            totalWithdrawals: bankTransactions
                .reduce((sum, t) => sum + (parseFloat(t['Paid Out']) || 0) * 100, 0),
            depositCount: bankTransactions.filter(t => parseFloat(t['Paid In']) > 0).length,
        },
        platforms: platformResults,
        unallocated: {
            deposits: unallocatedDeposits,
            totalAmount: unallocatedDeposits.reduce((sum, d) => sum + d.amount, 0),
            count: unallocatedDeposits.length,
        },
        summary,
    }
}

// ============================================
// BANK DEPOSIT CATEGORIZATION
// ============================================

interface CategorizedDeposits {
    stripe: BankTransaction[]
    amazon: BankTransaction[]
    paypal: BankTransaction[]
    shopify: BankTransaction[]
    unallocated: BankTransaction[]
}

function categorizeBankDeposits(bankTransactions: BankTransaction[]): CategorizedDeposits {
    const result: CategorizedDeposits = {
        stripe: [],
        amazon: [],
        paypal: [],
        shopify: [],
        unallocated: [],
    }

    for (const txn of bankTransactions) {
        // Only process deposits (Paid In > 0)
        const paidIn = parseFloat(txn['Paid In']) || 0
        if (paidIn <= 0) continue

        const description = txn.Description.toLowerCase()
        let matched = false

        // Check each platform's keywords
        for (const [platformId, config] of Object.entries(PLATFORM_CONFIGS)) {
            if (config.bankKeywords.some(keyword => description.includes(keyword.toLowerCase()))) {
                result[platformId as Platform].push(txn)
                matched = true
                break  // Only match to one platform
            }
        }

        if (!matched) {
            result.unallocated.push(txn)
        }
    }

    return result
}

// ============================================
// STRIPE PROCESSING
// ============================================

async function processStripe(
    balanceFile: File,
    payoutsFile: File,
    bankDeposits: BankTransaction[]
): Promise<PlatformReconciliation> {
    const balanceTransactions = await parseBalanceTransactions(balanceFile)
    const payouts = await parsePayouts(payoutsFile)

    // Group transactions by payout_id
    const transactionsByPayout = new Map<string, BalanceTransaction[]>()
    for (const txn of balanceTransactions) {
        const payoutId = txn.automatic_payout_id
        if (!payoutId) continue
        if (!transactionsByPayout.has(payoutId)) {
            transactionsByPayout.set(payoutId, [])
        }
        transactionsByPayout.get(payoutId)!.push(txn)
    }

    // Build payout summaries
    const payoutSummaries: PayoutSummary[] = []
    const clearingEntries: ClearingEntry[] = []
    const matchedBankKeys = new Set<string>()

    // Filter to only paid payouts
    const paidPayouts = payouts.filter(p => p.status === 'paid' || p.status === 'in_transit')

    for (const payout of paidPayouts) {
        const transactions = transactionsByPayout.get(payout.id) || []
        const gross = transactions.reduce((sum, t) => sum + t.gross, 0) / 100
        const fees = transactions.reduce((sum, t) => sum + t.fee, 0) / 100
        const net = transactions.reduce((sum, t) => sum + t.net, 0) / 100
        const payoutAmount = payout.amount / 100

        // Find bank match (excluding already matched deposits)
        const bankMatch = findBankMatch(payoutAmount, payout.arrival_date, bankDeposits, matchedBankKeys)

        if (bankMatch) {
            matchedBankKeys.add(getBankKey(bankMatch))
        }

        payoutSummaries.push({
            payout_id: payout.id,
            payout_date: payout.arrival_date,
            gross_sales: gross,
            stripe_fees: fees,
            net_amount: net,
            transaction_count: transactions.length,
            bank_matched: bankMatch !== null,
            bank_date: bankMatch?.Date || null,
            bank_description: bankMatch?.Description || null,
            status: bankMatch ? 'MATCHED' : 'UNMATCHED',
            transactions,
        })

        // Add expected entry to clearing
        clearingEntries.push(createExpectedEntry(
            payout.arrival_date,
            payout.id,
            payout.amount,
            `Stripe Payout ${payout.id}`,
            payout
        ))
    }

    // Add actual entries from categorized bank deposits
    for (const bankTxn of bankDeposits) {
        const paidIn = parseFloat(bankTxn['Paid In']) || 0
        clearingEntries.push(createActualEntry(
            parseUKDateToISO(bankTxn.Date),
            `BANK-${bankTxn.Date}-${paidIn}`,
            Math.round(paidIn * 100),
            bankTxn.Description,
            bankTxn
        ))
    }

    // Detect currency from payouts
    const currency = (paidPayouts[0]?.currency || 'GBP').toUpperCase()

    // Build clearing account
    const dates = clearingEntries.map(e => new Date(e.date))
    const periodStart = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))).toISOString() : new Date().toISOString()
    const periodEnd = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))).toISOString() : new Date().toISOString()

    const clearingAccount = buildClearingAccount('stripe', currency, clearingEntries, periodStart, periodEnd, 0)

    return {
        platform: 'stripe',
        clearingAccount,
        details: {
            payouts: payoutSummaries,
            totalGross: payoutSummaries.reduce((sum, p) => sum + p.gross_sales, 0),
            totalFees: payoutSummaries.reduce((sum, p) => sum + p.stripe_fees, 0),
            totalNet: payoutSummaries.reduce((sum, p) => sum + p.net_amount, 0),
        } as StripeDetails,
    }
}

// ============================================
// AMAZON PROCESSING
// ============================================

async function processAmazon(
    settlementFile: File,
    bankDeposits: BankTransaction[]
): Promise<PlatformReconciliation> {
    const settlementRows = await parseCSV<AmazonSettlementRow>(settlementFile)

    // Group by settlement-id
    const settlementGroups = new Map<string, AmazonSettlementRow[]>()
    for (const row of settlementRows) {
        const settlementId = row['settlement-id']
        if (!settlementId) continue
        if (!settlementGroups.has(settlementId)) {
            settlementGroups.set(settlementId, [])
        }
        settlementGroups.get(settlementId)!.push(row)
    }

    // Build settlement summaries
    const settlements: AmazonSettlementSummary[] = []
    const clearingEntries: ClearingEntry[] = []
    const matchedBankKeys = new Set<string>()

    for (const [settlementId, rows] of settlementGroups.entries()) {
        if (rows.length === 0) continue
        const firstRow = rows[0]

        // Calculate totals by amount-type
        let principal = 0, commission = 0, fbaFees = 0, shipping = 0, other = 0

        for (const row of rows) {
            const amount = parseFloat(row.amount) || 0
            const amountType = row['amount-type']?.toLowerCase() || ''

            if (amountType.includes('principal')) principal += amount
            else if (amountType.includes('commission')) commission += amount
            else if (amountType.includes('fba') || amountType.includes('fee')) fbaFees += amount
            else if (amountType.includes('shipping')) shipping += amount
            else other += amount
        }

        const totalAmount = parseFloat(firstRow['total-amount']) || (principal + commission + fbaFees + shipping + other)

        // Find bank match (excluding already matched deposits)
        const bankMatch = findBankMatch(totalAmount, firstRow['deposit-date'], bankDeposits, matchedBankKeys)

        if (bankMatch) {
            matchedBankKeys.add(getBankKey(bankMatch))
        }

        settlements.push({
            settlement_id: settlementId,
            deposit_date: firstRow['deposit-date'],
            settlement_start: firstRow['settlement-start-date'],
            settlement_end: firstRow['settlement-end-date'],
            currency: firstRow.currency || 'GBP',
            principal,
            commission,
            fba_fees: fbaFees,
            shipping,
            other,
            total_amount: totalAmount,
            transaction_count: rows.length,
            bank_matched: bankMatch !== null,
            bank_date: bankMatch?.Date || null,
            bank_description: bankMatch?.Description || null,
            status: bankMatch ? 'MATCHED' : 'UNMATCHED',
            transactions: rows,
        })

        // Add expected entry to clearing
        clearingEntries.push(createExpectedEntry(
            firstRow['deposit-date'],
            settlementId,
            Math.round(totalAmount * 100),
            `Amazon Settlement ${settlementId}`,
            { settlementId, totalAmount }
        ))
    }

    // Add actual entries from categorized bank deposits
    for (const bankTxn of bankDeposits) {
        const paidIn = parseFloat(bankTxn['Paid In']) || 0
        clearingEntries.push(createActualEntry(
            parseUKDateToISO(bankTxn.Date),
            `BANK-${bankTxn.Date}-${paidIn}`,
            Math.round(paidIn * 100),
            bankTxn.Description,
            bankTxn
        ))
    }

    // Detect currency from settlements
    const currency = (settlements[0]?.currency || 'GBP').toUpperCase()

    // Build clearing account
    const dates = clearingEntries.map(e => new Date(e.date))
    const periodStart = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))).toISOString() : new Date().toISOString()
    const periodEnd = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))).toISOString() : new Date().toISOString()

    const clearingAccount = buildClearingAccount('amazon', currency, clearingEntries, periodStart, periodEnd, 0)

    return {
        platform: 'amazon',
        clearingAccount,
        details: {
            settlements,
            totalPrincipal: settlements.reduce((sum, s) => sum + s.principal, 0),
            totalFees: settlements.reduce((sum, s) => sum + Math.abs(s.commission) + Math.abs(s.fba_fees), 0),
            totalNet: settlements.reduce((sum, s) => sum + s.total_amount, 0),
        } as AmazonDetails,
    }
}

// ============================================
// UNALLOCATED DEPOSITS
// ============================================

function buildUnallocatedDeposits(bankTransactions: BankTransaction[]): UnallocatedDeposit[] {
    return bankTransactions.map(txn => {
        const paidIn = parseFloat(txn['Paid In']) || 0
        const description = txn.Description.toLowerCase()

        // Try to suggest a platform based on partial matches
        let possiblePlatform: Platform | undefined
        if (description.includes('pay')) possiblePlatform = 'paypal'
        if (description.includes('shop')) possiblePlatform = 'shopify'

        return {
            id: `UNALLOC-${txn.Date}-${paidIn}`,
            date: parseUKDateToISO(txn.Date),
            description: txn.Description,
            amount: Math.round(paidIn * 100),
            possiblePlatform,
        }
    })
}

// ============================================
// UNIFIED SUMMARY
// ============================================

function calculateUnifiedSummary(
    platformResults: PlatformReconciliation[],
    unallocatedDeposits: UnallocatedDeposit[],
    bankTransactions: BankTransaction[]
): UnifiedReconciliationResult['summary'] {
    const totalExpected = platformResults.reduce(
        (sum, p) => sum + p.clearingAccount.total_expected, 0
    )
    const totalReceived = platformResults.reduce(
        (sum, p) => sum + p.clearingAccount.total_received, 0
    )
    const totalUnallocated = unallocatedDeposits.reduce(
        (sum, d) => sum + d.amount, 0
    )
    const totalVariance = platformResults.reduce(
        (sum, p) => sum + Math.abs(p.clearingAccount.variance), 0
    )

    const totalMatched = platformResults.reduce(
        (sum, p) => sum + p.clearingAccount.match_count, 0
    )
    const totalExpectedCount = platformResults.reduce(
        (sum, p) => sum + p.clearingAccount.entries.filter(e => e.type === 'EXPECTED_DEPOSIT').length, 0
    )

    const platformsWithVariance = platformResults
        .filter(p => Math.abs(p.clearingAccount.variance) >= 100)  // £1 threshold
        .map(p => p.platform)

    return {
        totalExpected,
        totalReceived,
        totalUnallocated,
        totalVariance,
        overallMatchRate: totalExpectedCount > 0 ? (totalMatched / totalExpectedCount) * 100 : 0,
        allBalanced: platformsWithVariance.length === 0 && totalUnallocated === 0,
        platformCount: platformResults.length,
        platformsWithVariance,
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function findBankMatch(
    expectedAmount: number,
    expectedDate: string,
    bankDeposits: BankTransaction[],
    excludeKeys?: Set<string>
): BankTransaction | null {
    const expectedDateObj = parseAnyDate(expectedDate)

    for (const bankTxn of bankDeposits) {
        // Skip if already matched
        if (excludeKeys) {
            const key = getBankKey(bankTxn)
            if (excludeKeys.has(key)) continue
        }

        const paidIn = parseFloat(bankTxn['Paid In']) || 0
        const bankDate = parseUKDate(bankTxn.Date)

        const amountMatch = Math.abs(expectedAmount - paidIn) < 0.01
        const dateMatch = isDateWithinRange(expectedDateObj, bankDate, 3)

        if (amountMatch && dateMatch) {
            return bankTxn
        }
    }

    return null
}

function getBankKey(txn: BankTransaction): string {
    return `${txn.Date}|${txn['Paid In']}|${txn.Description}`
}

function parseAnyDate(dateStr: string): Date {
    if (!dateStr) return new Date()

    // ISO format: 2024-11-08 or 2024-11-08T00:00:00
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
        return new Date(dateStr)
    }

    // UK format: 08/11/2024
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/')
        if (parts.length === 3) {
            const [day, month, year] = parts
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        }
    }

    // Fallback
    return new Date(dateStr)
}

function parseUKDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/')
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
}

function parseUKDateToISO(dateStr: string): string {
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function isDateWithinRange(date1: Date, date2: Date, days: number): boolean {
    const diffMs = Math.abs(date1.getTime() - date2.getTime())
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return diffDays <= days
}
