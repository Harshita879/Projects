/**
 * RECONCILIATION DEBUG MODULE
 * Provides structured logging and validation for debugging reconciliation issues
 */

type AnyObj = Record<string, any>

export const RECON_DEBUG = true

export function dlog(label: string, data?: any) {
    if (!RECON_DEBUG) return
    if (data === undefined) console.log(label)
    else console.log(label, data)
}

export function dgroup(label: string, fn: () => void) {
    if (!RECON_DEBUG) {
        fn()
        return
    }
    console.groupCollapsed(label)
    try {
        fn()
    } finally {
        console.groupEnd()
    }
}

export function isFiniteNumber(x: any): x is number {
    return typeof x === 'number' && Number.isFinite(x)
}

export function assertFiniteNumber(x: any, path: string, context?: AnyObj): number {
    if (!isFiniteNumber(x)) {
        const msg =
            `RECON_DEBUG_NUMBER_NOT_FINITE: ${path}\n` +
            `value=${JSON.stringify(x)}\n` +
            (context ? `context=${JSON.stringify(context, null, 2)}` : '')
        throw new Error(msg)
    }
    return x
}

export function scanForNaN(obj: any, rootPath: string) {
    const seen = new Set<any>()

    function walk(v: any, path: string) {
        if (v === null || v === undefined) return

        if (typeof v === 'number' && !Number.isFinite(v)) {
            throw new Error(`RECON_DEBUG_NAN_FOUND at ${path}\nvalue=${String(v)}`)
        }

        if (typeof v !== 'object') return

        if (seen.has(v)) return
        seen.add(v)

        if (Array.isArray(v)) {
            for (let i = 0; i < v.length; i++) walk(v[i], `${path}[${i}]`)
            return
        }

        for (const k of Object.keys(v)) walk(v[k], `${path}.${k}`)
    }

    walk(obj, rootPath)
}

export function toSafeString(v: any) {
    try {
        return JSON.stringify(v)
    } catch {
        return String(v)
    }
}

