/**
 * CSV PARSING DEBUG MODULE
 * Provides context-aware parsing with detailed error messages
 */

import { assertFiniteNumber } from './reconDebug'

export function parseMoneyToMinorDebug(
    raw: any,
    ctx: {
        file: string
        rowIndex: number
        column: string
        platform: string
        field: string
    }
) {
    const s = String(raw ?? '').trim()
    if (!s) {
        throw new Error(
            `RECON_DEBUG_EMPTY_MONEY: ${ctx.platform}.${ctx.field}\n` +
                `file=${ctx.file} row=${ctx.rowIndex} column=${ctx.column} raw=${JSON.stringify(raw)}`
        )
    }

    const cleaned = s.replace(/[£,$]/g, '').replace(/,/g, '').trim()
    const n = Number(cleaned)

    if (!Number.isFinite(n)) {
        throw new Error(
            `RECON_DEBUG_BAD_MONEY: ${ctx.platform}.${ctx.field}\n` +
                `file=${ctx.file} row=${ctx.rowIndex} column=${ctx.column}\n` +
                `raw=${JSON.stringify(raw)} cleaned=${JSON.stringify(cleaned)}`
        )
    }

    const minor = Math.round(n * 100)
    return assertFiniteNumber(minor, `moneyMinor(${ctx.platform}.${ctx.field})`, ctx)
}

export function parseDateDebug(
    raw: any,
    ctx: {
        file: string
        rowIndex: number
        column: string
        platform: string
        field: string
    }
) {
    const s = String(raw ?? '').trim()
    if (!s) return null

    const d = new Date(s)
    if (!Number.isFinite(d.getTime())) {
        throw new Error(
            `RECON_DEBUG_BAD_DATE: ${ctx.platform}.${ctx.field}\n` +
                `file=${ctx.file} row=${ctx.rowIndex} column=${ctx.column}\n` +
                `raw=${JSON.stringify(raw)}`
        )
    }
    return d
}

