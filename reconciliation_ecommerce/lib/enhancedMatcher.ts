/**
 * ENHANCED MATCHING ENGINE
 * Deterministic, explainable matching with scoring and ambiguity handling
 */

import type { BankDeposit, ExpectedPayout } from './platformModels'
import type { MatchStatus, MatchReasonCode, MatchReason } from './types'
import { parseDateSafe, isValidDate } from './dateUtils'

export interface MatchResult {
    status: MatchStatus
    matched?: BankDeposit
    candidates?: Array<{
        deposit: BankDeposit
        score: number
        reason: string
        amountDeltaMinor: number
        dateDeltaDays: number
    }>
    confidence?: number
    reasonCode?: MatchReasonCode
    reason?: MatchReason
}

export interface MatchOptions {
    dateToleranceDays: number
    amountToleranceMinor: number
    requireCurrencyMatch: boolean
}

/**
 * Match expected payout to bank deposits
 * Returns explainable match result with candidates and scoring
 */
export function matchBankDepositForExpected(
    expected: ExpectedPayout,
    bankDeposits: BankDeposit[],
    usedBankKeys: Set<string>,
    options: MatchOptions
): MatchResult {
    const { dateToleranceDays, amountToleranceMinor, requireCurrencyMatch } = options

    // Hard rejects
    if (expected.date === null) {
        return {
            status: 'UNMATCHED',
            reasonCode: 'DATE_INVALID',
            reason: {
                code: 'DATE_INVALID',
                message: 'Expected payout has no valid date',
                details: { expected_id: expected.id },
            },
            confidence: 0,
        }
    }

    // Find eligible candidates
    const candidates: Array<{
        deposit: BankDeposit
        score: number
        reason: string
        amountDeltaMinor: number
        dateDeltaDays: number
    }> = []

    for (const deposit of bankDeposits) {
        // Skip if already matched
        if (usedBankKeys.has(deposit.key)) {
            continue
        }

        // Skip if excluded
        if (deposit.excluded) {
            continue
        }

        // Currency check
        if (requireCurrencyMatch && deposit.currency && deposit.currency !== expected.currency) {
            continue
        }

        // Amount check
        const amountDeltaMinor = Math.abs(expected.amount_minor - deposit.amount_minor)
        const amountTolerance = Math.max(amountToleranceMinor, 5) // At least 5 minor units tolerance
        if (amountDeltaMinor > amountTolerance) {
            continue
        }

        // Date check
        if (!deposit.date || !isValidDate(deposit.date)) {
            continue
        }

        const dateDeltaMs = Math.abs(expected.date.getTime() - deposit.date.getTime())
        const dateDeltaDays = dateDeltaMs / (1000 * 60 * 60 * 24)

        if (dateDeltaDays > dateToleranceDays) {
            continue
        }

        // Calculate score
        let score = 1.0

        // Amount penalty (0-0.6)
        const amountPenalty = Math.min(
            0.6,
            (amountDeltaMinor / Math.max(1000, Math.abs(expected.amount_minor))) * 0.6
        )
        score -= amountPenalty

        // Date penalty (0-0.3)
        const datePenalty = Math.min(0.3, (dateDeltaDays / dateToleranceDays) * 0.3)
        score -= datePenalty

        // Description bonus (+0.1)
        if (expected.descriptorHints && deposit.description) {
            const descLower = deposit.description.toLowerCase()
            const hasHint = expected.descriptorHints.some(hint =>
                descLower.includes(hint.toLowerCase())
            )
            if (hasHint) {
                score += 0.1
                score = Math.min(1.0, score) // Cap at 1.0
            }
        }

        candidates.push({
            deposit,
            score,
            reason: `Amount delta: ${amountDeltaMinor} minor units, Date delta: ${dateDeltaDays.toFixed(1)} days`,
            amountDeltaMinor,
            dateDeltaDays,
        })
    }

    // Sort by score (descending)
    candidates.sort((a, b) => b.score - a.score)

    // Decision logic
    if (candidates.length === 0) {
        return {
            status: 'UNMATCHED',
            reasonCode: 'NO_CANDIDATES',
            reason: {
                code: 'NO_CANDIDATES',
                message: 'No eligible bank deposits found within tolerance',
                details: {
                    expected_id: expected.id,
                    expected_amount_minor: expected.amount_minor,
                    expected_date: expected.date?.toISOString(),
                    amount_tolerance: amountToleranceMinor,
                    date_tolerance_days: dateToleranceDays,
                },
            },
            confidence: 0,
        }
    }

    const bestCandidate = candidates[0]
    const secondBest = candidates[1]

    // Check for ambiguity (top two within 0.03 score)
    if (secondBest && bestCandidate.score - secondBest.score < 0.03) {
        return {
            status: 'AMBIGUOUS',
            reasonCode: 'AMBIGUOUS_TOP_CANDIDATES',
            reason: {
                code: 'AMBIGUOUS_TOP_CANDIDATES',
                message: `Multiple candidates with similar scores (${bestCandidate.score.toFixed(3)} vs ${secondBest.score.toFixed(3)})`,
                details: {
                    expected_id: expected.id,
                    top_candidates: candidates.slice(0, 2).map(c => ({
                        bank_key: c.deposit.key,
                        score: c.score,
                        amount: c.deposit.amount_minor,
                        date: c.deposit.date?.toISOString(),
                    })),
                },
            },
            candidates: candidates.slice(0, 5), // Top 5 for UI
            confidence: bestCandidate.score,
        }
    }

    // Check if score is too low
    if (bestCandidate.score < 0.75) {
        return {
            status: 'UNMATCHED',
            reasonCode: bestCandidate.amountDeltaMinor > amountToleranceMinor
                ? 'AMOUNT_OUT_OF_TOLERANCE'
                : 'DATE_OUT_OF_TOLERANCE',
            reason: {
                code:
                    bestCandidate.amountDeltaMinor > amountToleranceMinor
                        ? 'AMOUNT_OUT_OF_TOLERANCE'
                        : 'DATE_OUT_OF_TOLERANCE',
                message: `Best candidate score too low: ${bestCandidate.score.toFixed(3)}`,
                details: {
                    expected_id: expected.id,
                    best_candidate: {
                        bank_key: bestCandidate.deposit.key,
                        score: bestCandidate.score,
                        amount_delta: bestCandidate.amountDeltaMinor,
                        date_delta_days: bestCandidate.dateDeltaDays,
                    },
                },
            },
            candidates: candidates.slice(0, 5),
            confidence: bestCandidate.score,
        }
    }

    // Match found!
    return {
        status: 'MATCHED',
        matched: bestCandidate.deposit,
        candidates: candidates.slice(0, 5), // Keep top 5 for reference
        confidence: bestCandidate.score,
        reasonCode: 'MATCHED' as MatchReasonCode, // Will be handled by caller
        reason: {
            code: 'MATCHED' as MatchReasonCode,
            message: `Matched with score ${bestCandidate.score.toFixed(3)}`,
            details: {
                expected_id: expected.id,
                bank_key: bestCandidate.deposit.key,
                amount_delta: bestCandidate.amountDeltaMinor,
                date_delta_days: bestCandidate.dateDeltaDays,
            },
        },
    }
}

/**
 * Attempt split/merged matching (optional)
 * Tries to match sum of 2 bank deposits to expected amount
 * Bounded to max 50 combinations
 */
export function attemptSplitMergedMatch(
    expected: ExpectedPayout,
    bankDeposits: BankDeposit[],
    usedBankKeys: Set<string>,
    options: MatchOptions
): MatchResult | null {
    if (expected.amount_minor <= 0 || expected.date === null) {
        return null
    }

    // Find candidates within date window
    const dateWindowStart = new Date(expected.date)
    dateWindowStart.setDate(dateWindowStart.getDate() - options.dateToleranceDays)
    const dateWindowEnd = new Date(expected.date)
    dateWindowEnd.setDate(dateWindowEnd.getDate() + options.dateToleranceDays)

    const candidates = bankDeposits.filter(dep => {
        if (usedBankKeys.has(dep.key)) return false
        if (dep.excluded) return false
        if (!dep.date || !isValidDate(dep.date)) return false
        if (dep.date < dateWindowStart || dep.date > dateWindowEnd) return false
        if (dep.amount_minor <= 0) return false
        return true
    })

    // Limit combinations
    const maxCombinations = 50
    let tested = 0

    for (let i = 0; i < candidates.length && tested < maxCombinations; i++) {
        for (let j = i + 1; j < candidates.length && tested < maxCombinations; j++) {
            tested++

            const sum = candidates[i].amount_minor + candidates[j].amount_minor
            const delta = Math.abs(expected.amount_minor - sum)

            if (delta <= options.amountToleranceMinor) {
                // Found a split match
                return {
                    status: 'MATCHED',
                    matched: candidates[i], // Return first deposit as primary
                    candidates: [
                        {
                            deposit: candidates[i],
                            score: 0.8, // Lower confidence for split matches
                            reason: `Split match: ${candidates[i].amount_minor} + ${candidates[j].amount_minor} = ${sum}`,
                            amountDeltaMinor: delta,
                            dateDeltaDays: 0,
                        },
                        {
                            deposit: candidates[j],
                            score: 0.8,
                            reason: 'Part of split match',
                            amountDeltaMinor: 0,
                            dateDeltaDays: 0,
                        },
                    ],
                    confidence: 0.8,
                    reasonCode: 'MATCHED' as MatchReasonCode,
                    reason: {
                        code: 'MATCHED' as MatchReasonCode,
                        message: `Split match: two deposits sum to expected amount`,
                        details: {
                            expected_id: expected.id,
                            deposit1_key: candidates[i].key,
                            deposit2_key: candidates[j].key,
                            sum: sum,
                            expected: expected.amount_minor,
                        },
                    },
                }
            }
        }
    }

    return null
}
