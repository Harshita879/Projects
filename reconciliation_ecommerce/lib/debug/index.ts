/**
 * RUNTIME DEBUG TOOLKIT
 * Single place for all debugging utilities
 */

export const DEBUG = {
    enabled: true,
    trace: true,
    audit: true,
    perf: true,
}

export function dbg(...args: any[]) {
    if (!DEBUG.enabled) return
    console.log(...args)
}

export function group<T>(label: string, fn: () => T): T {
    if (!DEBUG.enabled || !DEBUG.trace) return fn()
    console.groupCollapsed(label)
    const result = fn()
    console.log(`[group] ${label} - result type:`, typeof result, result instanceof Promise ? '(Promise)' : '')
    // If result is a Promise, handle it properly
    if (result instanceof Promise) {
        return result.finally(() => {
        console.groupEnd()
            console.log(`[group] ${label} - Promise resolved`)
        }) as T
    }
    console.groupEnd()
    return result
}

export function time<T>(label: string, fn: () => T): T {
    if (!DEBUG.enabled || !DEBUG.perf) return fn()
    const t0 = performance.now?.() ?? Date.now()
    try {
        return fn()
    } finally {
        const t1 = performance.now?.() ?? Date.now()
        console.log(`[PERF] ${label}: ${(t1 - t0).toFixed(1)}ms`)
    }
}

export function assertFinite(n: any, path: string, ctx?: any): number {
    if (typeof n !== 'number' || !Number.isFinite(n)) {
        throw new Error(
            `DEBUG_NOT_FINITE: ${path}\nvalue=${JSON.stringify(n)}\nctx=${ctx ? JSON.stringify(ctx, null, 2) : '{}'}`
        )
    }
    return n
}

export function scanNaN(obj: any, root = 'root') {
    const seen = new Set<any>()

    const walk = (v: any, path: string) => {
        if (v === null || v === undefined) return

        if (typeof v === 'number' && !Number.isFinite(v)) {
            throw new Error(`DEBUG_NAN_FOUND at ${path} value=${String(v)}`)
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

    walk(obj, root)
}

