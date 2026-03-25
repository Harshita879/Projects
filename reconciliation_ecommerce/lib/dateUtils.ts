import { parse } from 'date-fns';

/**
 * DATE UTILITIES
 * Handle multiple date formats from different platforms
 */

/**
 * Safely parse any date format
 * Supports:
 * - Unix timestamps (seconds: 1234567890, milliseconds: 1234567890123)
 * - ISO 8601 (2023-12-06, 2023-12-06T12:30:00Z, 2023-12-06T12:30:00-07:00)
 * - UK format (06/12/2023, 06/12/2023 12:30)
 * - US format (12/06/2023)
 * - Datetime (2023-12-06 12:30:00)
 */
export function parseDateSafe(input: unknown): Date | null {
  if (!input) return null;
  
  // Already a Date
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }
  
  const str = String(input).trim();
  if (!str) return null;
  
  // Unix timestamp (numeric string)
  if (/^\d+$/.test(str)) {
    const num = Number(str);
    // Heuristic: <= 10 digits = seconds, > 10 digits = milliseconds
    const ms = str.length <= 10 ? num * 1000 : num;
    const date = new Date(ms);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // Try UK format: dd/MM/yyyy HH:mm
  const ukDateTime = parse(str, 'dd/MM/yyyy HH:mm', new Date());
  if (!isNaN(ukDateTime.getTime())) return ukDateTime;
  
  // Try UK format: dd/MM/yyyy
  const ukDate = parse(str, 'dd/MM/yyyy', new Date());
  if (!isNaN(ukDate.getTime())) return ukDate;
  
  // Try US format: MM/dd/yyyy
  const usDate = parse(str, 'MM/dd/yyyy', new Date());
  if (!isNaN(usDate.getTime())) return usDate;
  
  // Try ISO / standard formats
  const isoDate = new Date(str);
  if (!isNaN(isoDate.getTime())) return isoDate;
  
  return null;
}

/**
 * Check if two dates are within tolerance (days)
 */
export function datesWithinTolerance(
  date1: Date | null,
  date2: Date | null,
  toleranceDays: number = 3
): boolean {
  if (!date1 || !date2) return false;
  
  const diffMs = Math.abs(date1.getTime() - date2.getTime());
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  return diffDays <= toleranceDays;
}

/**
 * Format date for display
 */
export function formatDateShort(date: Date | null): string {
  if (!date) return '—';
  
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

/**
 * Format date to ISO string
 */
export function formatDateISO(date: Date | null): string {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

/**
 * Check if date is valid
 */
export function isValidDate(date: Date | null): date is Date {
  return date !== null && !isNaN(date.getTime());
}
