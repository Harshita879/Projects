import {
  BankTransaction,
  MatchStatus,
  MatchReason,
  MatchReasonCode,
  Platform
} from './types';
import { datesWithinTolerance } from './dateUtils';
import { moneyEquals } from './moneyUtils';

/**
 * Payout for matching (platform-agnostic)
 */
export interface PayoutForMatching {
  id: string;
  platform: Platform;
  date: Date | null;
  amount_minor: number;
  currency: string;
  description?: string;
}

/**
 * Match candidate with score
 */
interface MatchCandidate {
  bank: BankTransaction;
  score: number;
  amountDelta: number;
  dateDeltaDays: number;
  hasKeyword: boolean;
}

/**
 * Match result
 */
export interface MatchResult {
  status: MatchStatus;
  bank: BankTransaction | null;
  reason: MatchReason;
  confidence: number;
  candidates: Array<{
    bank: BankTransaction;
    score: number;
    reason: string;
  }>;
}

/**
 * Calculate match score for a candidate
 */
function calculateMatchScore(
  expected: PayoutForMatching,
  candidate: BankTransaction,
  platformKeywords: string[]
): MatchCandidate {
  let score = 1.0;
  
  // Amount delta
  const amountDelta = Math.abs(expected.amount_minor - candidate.amount);
  const amountDeltaRatio = amountDelta / Math.max(Math.abs(expected.amount_minor), 1);
  score -= Math.min(0.6, amountDeltaRatio * 0.6);
  
  // Date delta
  let dateDeltaDays = 999;
  if (expected.date && candidate.date) {
    const diffMs = Math.abs(expected.date.getTime() - candidate.date.getTime());
    dateDeltaDays = diffMs / (1000 * 60 * 60 * 24);
    score -= Math.min(0.3, (dateDeltaDays / 3) * 0.3);
  } else if (!expected.date || !candidate.date) {
    score -= 0.3; // Penalty for missing date
  }
  
  // Keyword bonus
  const hasKeyword = platformKeywords.some(keyword =>
    candidate.description.toLowerCase().includes(keyword.toLowerCase())
  );
  if (hasKeyword) {
    score += 0.1;
  }
  
  return {
    bank: candidate,
    score: Math.max(0, Math.min(1, score)),
    amountDelta,
    dateDeltaDays,
    hasKeyword
  };
}

/**
 * Match a payout to bank deposits
 */
export function matchPayoutToBank(
  payout: PayoutForMatching,
  bankDeposits: BankTransaction[],
  usedBankKeys: Set<string>,
  platformKeywords: string[],
  options: {
    dateToleranceDays?: number;
    amountToleranceMinor?: number;
    minimumScore?: number;
    ambiguityThreshold?: number;
  } = {}
): MatchResult {
  const {
    dateToleranceDays = 3,
    amountToleranceMinor = 1,
    minimumScore = 0.70,
    ambiguityThreshold = 0.05
  } = options;
  
  // Filter eligible candidates
  const eligibleCandidates = bankDeposits.filter(bank => {
    // Skip if already matched
    if (usedBankKeys.has(bank._key)) return false;
    
    // Must be deposit (positive amount)
    if (bank.amount <= 0) return false;
    
    // Amount within tolerance
    if (!moneyEquals(payout.amount_minor, bank.amount, amountToleranceMinor)) {
      return false;
    }
    
    // Date within tolerance (if both have dates)
    if (payout.date && bank.date) {
      if (!datesWithinTolerance(payout.date, bank.date, dateToleranceDays)) {
        return false;
      }
    }
    
    return true;
  });
  
  // No candidates
  if (eligibleCandidates.length === 0) {
    return {
      status: 'UNMATCHED',
      bank: null,
      reason: {
        code: 'NO_CANDIDATES',
        message: `No bank deposits found within ±${dateToleranceDays} days and ±${amountToleranceMinor} minor units`
      },
      confidence: 0,
      candidates: []
    };
  }
  
  // Score all candidates
  const scoredCandidates = eligibleCandidates
    .map(candidate => calculateMatchScore(payout, candidate, platformKeywords))
    .sort((a, b) => b.score - a.score);
  
  const bestCandidate = scoredCandidates[0];
  
  // Check if score meets minimum
  if (bestCandidate.score < minimumScore) {
    return {
      status: 'UNMATCHED',
      bank: null,
      reason: {
        code: 'DATE_OUT_OF_TOLERANCE',
        message: `Best match score ${(bestCandidate.score * 100).toFixed(0)}% below threshold ${(minimumScore * 100).toFixed(0)}%`
      },
      confidence: bestCandidate.score,
      candidates: scoredCandidates.slice(0, 5).map(c => ({
        bank: c.bank,
        score: c.score,
        reason: `Amount Δ: ${c.amountDelta}, Date Δ: ${c.dateDeltaDays.toFixed(1)} days`
      }))
    };
  }
  
  // Check for ambiguity (multiple high scores)
  if (scoredCandidates.length > 1) {
    const secondBest = scoredCandidates[1];
    if (secondBest.score > minimumScore && 
        Math.abs(bestCandidate.score - secondBest.score) < ambiguityThreshold) {
      return {
        status: 'AMBIGUOUS',
        bank: null,
        reason: {
          code: 'AMBIGUOUS_CANDIDATES',
          message: `Multiple deposits with similar match scores (${(bestCandidate.score * 100).toFixed(0)}% vs ${(secondBest.score * 100).toFixed(0)}%)`
        },
        confidence: bestCandidate.score,
        candidates: scoredCandidates.slice(0, 5).map(c => ({
          bank: c.bank,
          score: c.score,
          reason: `Amount Δ: ${c.amountDelta}, Date Δ: ${c.dateDeltaDays.toFixed(1)} days${c.hasKeyword ? ', Keyword match' : ''}`
        }))
      };
    }
  }
  
  // Match found
  return {
    status: 'MATCHED',
    bank: bestCandidate.bank,
    reason: {
      code: 'DATE_AMOUNT_MATCH',
      message: `Matched with ${(bestCandidate.score * 100).toFixed(0)}% confidence`,
      details: {
        amountDelta: bestCandidate.amountDelta,
        dateDeltaDays: bestCandidate.dateDeltaDays,
        hasKeyword: bestCandidate.hasKeyword
      }
    },
    confidence: bestCandidate.score,
    candidates: scoredCandidates.slice(0, 5).map(c => ({
      bank: c.bank,
      score: c.score,
      reason: `Amount Δ: ${c.amountDelta}, Date Δ: ${c.dateDeltaDays.toFixed(1)} days`
    }))
  };
}

/**
 * Categorize bank deposits by platform keywords
 */
export function categorizeBankDeposits(
  bankDeposits: BankTransaction[],
  platformKeywords: Record<Platform, string[]>
): Record<Platform | 'unallocated', BankTransaction[]> {
  const categorized: Record<Platform | 'unallocated', BankTransaction[]> = {
    stripe: [],
    amazon: [],
    shopify: [],
    unallocated: []
  };
  
  for (const deposit of bankDeposits) {
    // Only categorize positive amounts (deposits)
    if (deposit.amount <= 0) continue;
    
    const descLower = deposit.description.toLowerCase();
    
    let matched = false;
    for (const [platform, keywords] of Object.entries(platformKeywords)) {
      if (keywords.some(kw => descLower.includes(kw.toLowerCase()))) {
        categorized[platform as Platform].push(deposit);
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      categorized.unallocated.push(deposit);
    }
  }
  
  return categorized;
}

