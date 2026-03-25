import { describe, it, expect } from 'vitest'
import {
    parseDecimalToMinor,
    parseStripeMinorInt,
    formatMinorToDecimal,
    moneyAdd,
    moneyAbsMinor,
} from '../moneyUtils'

describe('parseDecimalToMinor', () => {
    it('should parse "95.00" to 9500', () => {
        expect(parseDecimalToMinor('95.00', 'GBP')).toBe(9500)
    })

    it('should parse "95,00" to 9500', () => {
        expect(parseDecimalToMinor('95,00', 'EUR')).toBe(9500)
    })

    it('should parse "1,234.56" to 123456', () => {
        expect(parseDecimalToMinor('1,234.56', 'GBP')).toBe(123456)
    })

    it('should parse "1.234,56" to 123456', () => {
        expect(parseDecimalToMinor('1.234,56', 'EUR')).toBe(123456)
    })

    it('should parse "-0.45" to -45', () => {
        expect(parseDecimalToMinor('-0.45', 'GBP')).toBe(-45)
    })

    it('should handle currency symbols', () => {
        expect(parseDecimalToMinor('£1250.43', 'GBP')).toBe(125043)
        expect(parseDecimalToMinor('$95.00', 'USD')).toBe(9500)
    })
})

describe('parseStripeMinorInt', () => {
    it('should parse number', () => {
        expect(parseStripeMinorInt(125043)).toBe(125043)
    })

    it('should parse string number', () => {
        expect(parseStripeMinorInt('125043')).toBe(125043)
    })

    it('should handle formatted strings', () => {
        expect(parseStripeMinorInt('1,250.43')).toBe(1250) // Stripe amounts are already in minor units
    })
})

describe('formatMinorToDecimal', () => {
    it('should format 125043 to "1250.43"', () => {
        expect(formatMinorToDecimal(125043)).toBe('1250.43')
    })

    it('should format -45 to "-0.45"', () => {
        expect(formatMinorToDecimal(-45)).toBe('-0.45')
    })

    it('should format 0 to "0.00"', () => {
        expect(formatMinorToDecimal(0)).toBe('0.00')
    })
})

describe('moneyAdd', () => {
    it('should add two money values', () => {
        const result = moneyAdd(
            { amountMinor: 1000, currency: 'GBP' },
            { amountMinor: 500, currency: 'GBP' }
        )
        expect(result.amountMinor).toBe(1500)
        expect(result.currency).toBe('GBP')
    })

    it('should throw on currency mismatch', () => {
        expect(() =>
            moneyAdd(
                { amountMinor: 1000, currency: 'GBP' },
                { amountMinor: 500, currency: 'USD' }
            )
        ).toThrow()
    })
})

describe('moneyAbsMinor', () => {
    it('should return absolute value', () => {
        expect(moneyAbsMinor(-100)).toBe(100)
        expect(moneyAbsMinor(100)).toBe(100)
    })
})

