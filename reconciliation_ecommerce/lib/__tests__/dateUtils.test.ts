import { describe, it, expect } from 'vitest'
import { parseDateSafe, formatDateShort, isValidDate } from '../dateUtils'

describe('parseDateSafe', () => {
    it('should parse unix seconds', () => {
        const date = parseDateSafe('1654494690')
        expect(date).toBeInstanceOf(Date)
        expect(date?.getFullYear()).toBe(2022)
    })

    it('should parse unix milliseconds', () => {
        const date = parseDateSafe('1654494690000')
        expect(date).toBeInstanceOf(Date)
        expect(date?.getFullYear()).toBe(2022)
    })

    it('should parse ISO string', () => {
        const date = parseDateSafe('2025-05-25T00:00:00-0700')
        expect(date).toBeInstanceOf(Date)
        expect(date?.getFullYear()).toBe(2025)
    })

    it('should parse ISO date', () => {
        const date = parseDateSafe('2025-05-25')
        expect(date).toBeInstanceOf(Date)
        expect(date?.getFullYear()).toBe(2025)
    })

    it('should return null for invalid input', () => {
        expect(parseDateSafe(null)).toBeNull()
        expect(parseDateSafe(undefined)).toBeNull()
        expect(parseDateSafe('')).toBeNull()
        expect(parseDateSafe('invalid')).toBeNull()
    })

    it('should handle numeric input', () => {
        const date = parseDateSafe(1654494690)
        expect(date).toBeInstanceOf(Date)
    })
})

describe('formatDateShort', () => {
    it('should format valid date', () => {
        const date = new Date('2025-05-25')
        const formatted = formatDateShort(date)
        expect(formatted).toContain('2025')
    })

    it('should return "—" for null', () => {
        expect(formatDateShort(null)).toBe('—')
    })
})

describe('isValidDate', () => {
    it('should return true for valid date', () => {
        expect(isValidDate(new Date())).toBe(true)
    })

    it('should return false for null', () => {
        expect(isValidDate(null)).toBe(false)
    })
})

