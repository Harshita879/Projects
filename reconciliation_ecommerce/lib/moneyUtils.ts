/**
 * MONEY UTILITIES
 * All amounts internally stored as MINOR units (cents/pence)
 * No floating point arithmetic for money
 */

/**
 * Parse decimal string to minor units (integer)
 * Handles: "1234.56", "1,234.56", "1.234,56" (EU format), "£1234.56"
 */
export function parseDecimalToMinor(value: string | number, scale: number = 100): number {
  if (typeof value === 'number') {
    return Math.round(value * scale);
  }
  
  // Remove currency symbols and whitespace
  let cleaned = String(value).replace(/[£$€\s]/g, '').trim();
  
  if (!cleaned || cleaned === '-') return 0;
  
  // Handle negative
  const isNegative = cleaned.startsWith('-');
  if (isNegative) cleaned = cleaned.substring(1);
  
  // Determine decimal separator
  // If both comma and dot exist, last one is decimal separator
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');
  
  if (hasComma && hasDot) {
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    
    if (lastDot > lastComma) {
      // Dot is decimal separator (US format: 1,234.56)
      cleaned = cleaned.replace(/,/g, '');
    } else {
      // Comma is decimal separator (EU format: 1.234,56)
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }
  } else if (hasComma) {
    // Only comma - assume decimal separator
    cleaned = cleaned.replace(',', '.');
  }
  
  // Parse as float and convert to minor units
  const amount = parseFloat(cleaned);
  if (isNaN(amount)) return 0;
  
  const minor = Math.round(amount * scale);
  return isNegative ? -minor : minor;
}

/**
 * Parse Stripe integer minor units (already in cents/pence)
 */
export function parseStripeMinor(value: string | number): number {
  const num = typeof value === 'number' ? value : parseInt(String(value), 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Format minor units to decimal string for display
 */
export function formatMinorToDecimal(amountMinor: number, scale: number = 100): string {
  const amount = amountMinor / scale;
  return amount.toFixed(2);
}

/**
 * Format minor units to currency string
 */
export function formatMoney(amountMinor: number, currency: string = 'GBP'): string {
  const amount = amountMinor / 100;
  const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '';
  const formatted = Math.abs(amount).toFixed(2);
  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

/**
 * Add two money amounts (both in minor units)
 */
export function moneyAdd(a: number, b: number): number {
  return a + b;
}

/**
 * Subtract two money amounts
 */
export function moneySubtract(a: number, b: number): number {
  return a - b;
}

/**
 * Check if two amounts are equal within tolerance
 */
export function moneyEquals(a: number, b: number, toleranceMinor: number = 1): boolean {
  return Math.abs(a - b) <= toleranceMinor;
}
