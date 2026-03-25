import type { ClearingEntry, ClearingAccount, ClearingEntryType } from './types'

export type { ClearingEntry }

/**
 * Generate unique ID for clearing entries
 */
export function generateEntryId(type: string, reference: string): string {
    // Use crypto.randomUUID() for production-grade unique IDs
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return `${type}-${reference}-${crypto.randomUUID()}`
    }
    // Fallback for older environments
    return `${type}-${reference}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create a clearing entry for an expected deposit (payout)
 */
export function createExpectedEntry(
    date: string,
    reference: string,
    amount: number,  // in minor units
    description: string,
    sourceData?: any
): ClearingEntry {
    return {
        id: generateEntryId('EXP', reference),
        date,
        type: 'EXPECTED_DEPOSIT',
        reference,
        description,
        debit: amount,
        credit: 0,
        balance: 0,  // Will be calculated later
        status: 'UNMATCHED',
        source_data: sourceData,
        match_status: 'UNMATCHED',
    }
}

/**
 * Create a clearing entry for an actual bank deposit
 */
export function createActualEntry(
    date: string,
    reference: string,
    amount: number,  // in minor units
    description: string,
    sourceData?: any
): ClearingEntry {
    return {
        id: generateEntryId('ACT', reference),
        date,
        type: 'ACTUAL_DEPOSIT',
        reference,
        description,
        debit: 0,
        credit: amount,
        balance: 0,  // Will be calculated later
        status: 'UNMATCHED',
        source_data: sourceData,
        match_status: 'UNMATCHED',
    }
}

/**
 * Match expected entries to actual entries
 * Matching criteria: amount exact match + date within tolerance + description contains platform name
 */
export function matchEntries(
    entries: ClearingEntry[],
    dateTolerance: number = 3,
    platformKeyword: string = 'stripe'
): ClearingEntry[] {
    const expected = entries.filter(e => e.type === 'EXPECTED_DEPOSIT')
    const actual = entries.filter(e => e.type === 'ACTUAL_DEPOSIT')

    const matchedActualIds = new Set<string>()

    for (const exp of expected) {
        // Find matching actual entry
        const match = actual.find(act => {
            if (matchedActualIds.has(act.id)) return false

            const amountMatch = Math.abs(exp.debit - act.credit) < 1  // Within 1 penny
            const dateMatch = isDateWithinRange(exp.date, act.date, dateTolerance)
            const descMatch = act.description.toLowerCase().includes(platformKeyword.toLowerCase())

            return amountMatch && dateMatch && descMatch
        })

        if (match) {
            exp.status = 'MATCHED'
            exp.matched_to = match.id
            match.status = 'MATCHED'
            match.matched_to = exp.id
            matchedActualIds.add(match.id)
        }
    }

    return entries
}

/**
 * Calculate running balance for all entries
 */
export function calculateRunningBalance(
    entries: ClearingEntry[],
    openingBalance: number = 0
): ClearingEntry[] {
    // Sort by date
    const sorted = [...entries].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    let balance = openingBalance

    return sorted.map(entry => {
        balance = balance + entry.debit - entry.credit
        return { ...entry, balance }
    })
}

/**
 * Build complete clearing account from entries
 */
export function buildClearingAccount(
    platform: 'stripe' | 'amazon' | 'shopify' | 'paypal',
    currency: string,
    entries: ClearingEntry[],
    periodStart: string,
    periodEnd: string,
    openingBalance: number = 0
): ClearingAccount {
    // Match entries
    const platformKeyword = platform === 'stripe' ? 'stripe' : 'amazon'
    const matchedEntries = matchEntries(entries, 3, platformKeyword)

    // Calculate running balance
    const withBalance = calculateRunningBalance(matchedEntries, openingBalance)

    // Calculate totals
    const totalExpected = withBalance
        .filter(e => e.type === 'EXPECTED_DEPOSIT')
        .reduce((sum, e) => sum + e.debit, 0)

    const totalReceived = withBalance
        .filter(e => e.type === 'ACTUAL_DEPOSIT')
        .reduce((sum, e) => sum + e.credit, 0)

    const closingBalance = withBalance.length > 0
        ? withBalance[withBalance.length - 1].balance
        : openingBalance

    const unmatched_expected = withBalance.filter(
        e => e.type === 'EXPECTED_DEPOSIT' && e.status === 'UNMATCHED'
    )
    const unmatched_received = withBalance.filter(
        e => e.type === 'ACTUAL_DEPOSIT' && e.status === 'UNMATCHED'
    )

    const matchCount = withBalance.filter(e => e.status === 'MATCHED' && e.type === 'EXPECTED_DEPOSIT').length
    const unmatchCount = unmatched_expected.length + unmatched_received.length

    return {
        platform,
        currency,
        period_start: periodStart,
        period_end: periodEnd,
        opening_balance: openingBalance,
        closing_balance: closingBalance,
        entries: withBalance,
        total_expected: totalExpected,
        total_received: totalReceived,
        variance: closingBalance,
        unmatched_expected,
        unmatched_received,
        match_count: matchCount,
        unmatch_count: unmatchCount,
        match_rate: matchCount > 0 ? (matchCount / (matchCount + unmatched_expected.length)) * 100 : 0,
    }
}

/**
 * Helper: Check if two dates are within N days of each other
 */
function isDateWithinRange(date1: string, date2: string, days: number): boolean {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diffMs = Math.abs(d1.getTime() - d2.getTime())
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return diffDays <= days
}

/**
 * Format amount from pence to pounds for display
 */
export function formatAmount(pence: number, currency: string = 'GBP'): string {
    const pounds = pence / 100
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency,
    }).format(pounds)
}
