/**
 * CONFIDENCE SCORING
 * Calculate match confidence scores (0-100)
 */

import { ReconciliationConfig } from './config';
import { calculateAmountThreshold, calculateDateDifference } from './tolerance';
import { BankTransaction } from '../types';

export interface MatchScore {
  amountScore: number;      // 0-100
  dateScore: number;        // 0-100
  metadataScore: number;    // 0-100
  currencyScore: number;    // 0-100
  confidence: number;       // Weighted average (0-100)
}

export interface PayoutForScoring {
  id: string;
  platform: 'stripe' | 'amazon' | 'shopify';
  date: Date | null;
  amount_minor: number;
  currency: string;
  description?: string;
}

/**
 * Calculate amount match score
 */
export function calculateAmountScore(
  expected: number,
  actual: number,
  config: ReconciliationConfig
): number {
  const diff = Math.abs(expected - actual);
  
  // Perfect match
  if (diff === 0) return 100;
  
  const threshold = calculateAmountThreshold(expected, config.amountTolerance);
  
  if (threshold === 0) {
    // Exact match required
    return diff === 0 ? 100 : 0;
  }
  
  if (diff <= threshold) {
    // Linear decay within tolerance: 70-100
    return 100 - ((diff / threshold) * 30);
  } else {
    // Beyond tolerance: steep decay
    const beyondRatio = diff / threshold;
    return Math.max(0, 70 - (beyondRatio * 70));
  }
}

/**
 * Calculate date match score
 */
export function calculateDateScore(
  expectedDate: Date | null,
  actualDate: Date | null,
  config: ReconciliationConfig
): number {
  if (!expectedDate || !actualDate) {
    // Missing dates: neutral score (50)
    return 50;
  }
  
  const daysDiff = Math.abs(calculateDateDifference(expectedDate, actualDate) || 0);
  
  // Same day
  if (daysDiff === 0) return 100;
  
  const maxTolerance = config.dateTolerance.daysBefore + config.dateTolerance.daysAfter;
  
  if (maxTolerance === 0) {
    // Exact match required
    return daysDiff === 0 ? 100 : 0;
  }
  
  if (daysDiff <= maxTolerance) {
    // Linear decay within tolerance: 80-100
    return 100 - ((daysDiff / maxTolerance) * 20);
  } else {
    // Beyond tolerance: steep decay
    return Math.max(0, 80 - ((daysDiff / maxTolerance) * 80));
  }
}

/**
 * Calculate string similarity (simple Levenshtein-based)
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (!str1 || !str2) return 0;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  // Check if one contains the other
  if (longer.toLowerCase().includes(shorter.toLowerCase())) {
    return 0.7;
  }
  
  // Simple character overlap
  const longerSet = new Set(longer.toLowerCase().split(''));
  const shorterSet = new Set(shorter.toLowerCase().split(''));
  
  let matches = 0;
  shorterSet.forEach(char => {
    if (longerSet.has(char)) matches++;
  });
  
  return matches / Math.max(longerSet.size, shorterSet.size);
}

/**
 * Calculate metadata match score
 */
export function calculateMetadataScore(
  payout: PayoutForScoring,
  bankDeposit: BankTransaction
): number {
  let score = 0;
  let checks = 0;
  
  // Check for payout ID in bank description
  if (payout.id && bankDeposit.description) {
    checks++;
    const payoutIdLower = payout.id.toLowerCase();
    const descLower = bankDeposit.description.toLowerCase();
    
    if (descLower.includes(payoutIdLower)) {
      score += 100;
    } else {
      // Check for partial match
      const similarity = calculateStringSimilarity(payoutIdLower, descLower);
      score += similarity * 100;
    }
  }
  
  // Check for platform keywords in description
  if (bankDeposit.description) {
    checks++;
    const descLower = bankDeposit.description.toLowerCase();
    const platformKeywords = {
      stripe: ['stripe', 'stp'],
      amazon: ['amazon', 'fba'],
      shopify: ['shopify', 'shp']
    };
    
    const keywords = platformKeywords[payout.platform] || [];
    const hasKeyword = keywords.some(kw => descLower.includes(kw));
    
    if (hasKeyword) {
      score += 80;
    } else {
      score += 30; // Neutral if no keyword
    }
  }
  
  return checks > 0 ? score / checks : 50; // Default: neutral
}

/**
 * Calculate currency match score
 */
export function calculateCurrencyScore(
  currency1: string,
  currency2: string
): number {
  if (!currency1 || !currency2) return 50; // Neutral if missing
  
  return currency1.toLowerCase() === currency2.toLowerCase() ? 100 : 0;
}

/**
 * Calculate overall confidence score
 */
export function calculateConfidenceScore(
  payout: PayoutForScoring,
  bankDeposit: BankTransaction,
  config: ReconciliationConfig
): MatchScore {
  const amountScore = calculateAmountScore(
    payout.amount_minor,
    bankDeposit.amount,
    config
  );
  
  const dateScore = calculateDateScore(
    payout.date,
    bankDeposit.date,
    config
  );
  
  const metadataScore = calculateMetadataScore(payout, bankDeposit);
  
  const currencyScore = calculateCurrencyScore(
    payout.currency,
    bankDeposit.currency || 'GBP'
  );
  
  const weights = config.confidenceWeights;
  const confidence = 
    (amountScore * weights.amount) +
    (dateScore * weights.date) +
    (metadataScore * weights.metadata) +
    (currencyScore * weights.currency);
  
  return {
    amountScore: Math.round(amountScore),
    dateScore: Math.round(dateScore),
    metadataScore: Math.round(metadataScore),
    currencyScore: Math.round(currencyScore),
    confidence: Math.round(confidence)
  };
}

