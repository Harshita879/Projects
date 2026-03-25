/**
 * TOLERANCE CALCULATORS
 * Calculate matching thresholds for amounts and dates
 */

import { ReconciliationConfig } from './config';

/**
 * Calculate amount threshold for matching
 */
export function calculateAmountThreshold(
  expectedAmount: number,
  config: ReconciliationConfig['amountTolerance']
): number {
  const absExpected = Math.abs(expectedAmount);
  
  if (config.type === 'percentage' && config.percentageTolerance) {
    return absExpected * config.percentageTolerance;
  }
  
  if (config.type === 'absolute' && config.absoluteTolerance) {
    return config.absoluteTolerance;
  }
  
  if (config.type === 'both' && config.percentageTolerance && config.absoluteTolerance) {
    const percentageThreshold = absExpected * config.percentageTolerance;
    const absoluteThreshold = config.absoluteTolerance;
    
    // Use more conservative (smaller) threshold
    return config.useMinimum 
      ? Math.min(percentageThreshold, absoluteThreshold)
      : Math.max(percentageThreshold, absoluteThreshold);
  }
  
  return 0; // Exact match only
}

/**
 * Check if date is within tolerance window
 */
export function isWithinDateTolerance(
  expectedDate: Date | null,
  actualDate: Date | null,
  config: ReconciliationConfig['dateTolerance']
): boolean {
  if (!expectedDate || !actualDate) {
    // If either date is missing, allow match (date is optional)
    return true;
  }
  
  const daysDiff = Math.floor(
    (actualDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Check if within tolerance window
  return daysDiff >= -config.daysBefore && daysDiff <= config.daysAfter;
}

/**
 * Calculate days difference between dates
 */
export function calculateDateDifference(
  expectedDate: Date | null,
  actualDate: Date | null
): number | null {
  if (!expectedDate || !actualDate) {
    return null;
  }
  
  return Math.floor(
    (actualDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

