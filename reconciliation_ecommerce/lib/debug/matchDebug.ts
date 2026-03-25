/**
 * DETERMINISTIC MATCHING DEBUG
 * Explains why a payout did or didn't match
 */

import { dbg, group, assertFinite } from './index'
import { differenceInCalendarDays } from 'date-fns'

export function debugMatch(
    expected: {
        platform: string
        id: string
        amount_minor: number
        date: Date | null
    },
    bankDeposits: Array<{
        key: string
        amount_minor: number
        date: Date | null
        description: string
    }>,
    used: Set<string>,
    opts: { amountTolMinor: number; dateTolDays: number }
) {
    return group(`[MATCH] ${expected.platform} ${expected.id}`, () => {
        assertFinite(expected.amount_minor, `${expected.platform}.expected.amount_minor`, { id: expected.id })

        const candidates = bankDeposits.map(d => {
            const amountDelta = d.amount_minor - expected.amount_minor
            const dayDelta =
                expected.date && d.date ? Math.abs(differenceInCalendarDays(d.date, expected.date)) : null

            const reasons: string[] = []
            if (used.has(d.key)) reasons.push('ALREADY_USED')
            if (Math.abs(amountDelta) > opts.amountTolMinor) reasons.push('AMOUNT_OUT_OF_TOL')
            if (dayDelta === null) reasons.push('DATE_MISSING')
            else if (dayDelta > opts.dateTolDays) reasons.push('DATE_OUT_OF_TOL')

            return {
                key: d.key,
                date: d.date ? d.date.toISOString().slice(0, 10) : null,
                amount_minor: d.amount_minor,
                desc: d.description,
                amountDelta,
                dayDelta,
                rejected: reasons.length ? reasons : null,
            }
        })

        candidates.sort((a, b) => {
            const ad = Math.abs(a.amountDelta)
            const bd = Math.abs(b.amountDelta)
            if (ad !== bd) return ad - bd
            return (a.dayDelta ?? 999) - (b.dayDelta ?? 999)
        })

        dbg('expected', {
            amount_minor: expected.amount_minor,
            date: expected.date ? expected.date.toISOString().slice(0, 10) : null,
            tol: opts,
        })
        dbg('topCandidates', candidates.slice(0, 10))

        return candidates
    })
}

