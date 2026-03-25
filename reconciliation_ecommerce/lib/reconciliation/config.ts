/**
 * RECONCILIATION CONFIGURATION
 * Platform-specific reconciliation rules and tolerances
 */

export interface ReconciliationConfig {
  platform: 'stripe' | 'amazon' | 'shopify';
  
  // Amount matching tolerance
  amountTolerance: {
    type: 'percentage' | 'absolute' | 'both';
    percentageTolerance?: number;  // e.g., 0.01 = 1%
    absoluteTolerance?: number;     // e.g., 100 = £1.00 in minor units
    useMinimum: boolean;            // Use more conservative threshold
  };
  
  // Date matching tolerance
  dateTolerance: {
    daysBefore: number;             // Days before expected date
    daysAfter: number;               // Days after expected date
    useBusinessDays: boolean;       // Exclude weekends/holidays
  };
  
  // Confidence scoring weights
  confidenceWeights: {
    amount: number;                 // 0.0 - 1.0
    date: number;                   // 0.0 - 1.0
    metadata: number;               // 0.0 - 1.0 (reference IDs, etc.)
    currency: number;               // 0.0 - 1.0
  };
  
  // Matching behavior
  matchingRules: {
    allowOneToMany: boolean;        // One bank deposit = multiple payouts
    allowManyToOne: boolean;        // Multiple deposits = one payout
    requireExactCurrency: boolean;  // Must currency match exactly
  };
  
  // Auto-matching thresholds
  autoMatchThreshold: number;       // Confidence % for auto-match (e.g., 85)
  suggestMatchThreshold: number;    // Confidence % for suggestion (e.g., 70)
}

// Platform-specific configurations
export const PLATFORM_RECONCILIATION_CONFIGS: Record<string, ReconciliationConfig> = {
  stripe: {
    platform: 'stripe',
    amountTolerance: {
      type: 'absolute',
      absoluteTolerance: 100,      // ±£1.00 (FX rounding)
      useMinimum: true
    },
    dateTolerance: {
      daysBefore: 0,
      daysAfter: 7,                 // Stripe: 1-7 day payout
      useBusinessDays: false
    },
    confidenceWeights: {
      amount: 0.35,
      date: 0.10,
      metadata: 0.45,               // High weight on payout_id
      currency: 0.10
    },
    matchingRules: {
      allowOneToMany: false,
      allowManyToOne: false,
      requireExactCurrency: true
    },
    autoMatchThreshold: 85,
    suggestMatchThreshold: 70
  },
  
  amazon: {
    platform: 'amazon',
    amountTolerance: {
      type: 'absolute',
      absoluteTolerance: 100,      // ±£1.00
      useMinimum: true
    },
    dateTolerance: {
      daysBefore: 0,
      daysAfter: 14,                // Amazon: 7-14 day settlement
      useBusinessDays: true         // Exclude weekends
    },
    confidenceWeights: {
      amount: 0.40,
      date: 0.15,
      metadata: 0.35,
      currency: 0.10
    },
    matchingRules: {
      allowOneToMany: false,
      allowManyToOne: false,
      requireExactCurrency: true
    },
    autoMatchThreshold: 85,
    suggestMatchThreshold: 70
  },
  
  shopify: {
    platform: 'shopify',
    amountTolerance: {
      type: 'absolute',
      absoluteTolerance: 50,       // ±£0.50 (tighter)
      useMinimum: true
    },
    dateTolerance: {
      daysBefore: 0,
      daysAfter: 3,                 // Shopify: 1-3 day payout
      useBusinessDays: false
    },
    confidenceWeights: {
      amount: 0.40,
      date: 0.10,
      metadata: 0.40,
      currency: 0.10
    },
    matchingRules: {
      allowOneToMany: true,         // Shopify may batch payouts
      allowManyToOne: false,
      requireExactCurrency: true
    },
    autoMatchThreshold: 85,
    suggestMatchThreshold: 70
  }
};

