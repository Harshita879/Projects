// ============================================================================
// EXACT API DOCUMENTATION TYPES (Zero Deviation)
// ============================================================================

export type Platform = 'stripe' | 'amazon' | 'shopify';

// ============================================================================
// STRIPE BALANCE TRANSACTIONS (From API Docs)
// Columns: id, created, available_on, amount, fee, net, currency,
//          reporting_category, source, customer, automatic_payout_id,
//          automatic_payout_effective_at, description, type
// ============================================================================

export interface StripeBalanceTxn {
  id: string;
  created: Date | null;                    // Unix timestamp or ISO
  available_on: Date | null;               // Unix timestamp or ISO
  amount: number;                          // Gross in MINOR units (cents/pence)
  fee: number;                             // Fee in MINOR units
  net: number;                             // Net in MINOR units
  currency: string;                        // Lowercase (usd, gbp, eur)
  reporting_category: string;              // 'charge', 'refund', 'payout', etc.
  source: string | null;                   // Charge ID
  customer: string | null;                 // Customer ID
  automatic_payout_id: string | null;      // GROUP BY THIS for reconciliation
  automatic_payout_effective_at: Date | null;
  description: string | null;
  type: string | null;
}

// ============================================================================
// STRIPE PAYOUTS (From API Docs)
// Columns: id, amount, arrival_date, created, currency, status, description,
//          destination, failure_code, failure_message, automatic, method,
//          source_type, type
// ============================================================================

export interface StripePayout {
  id: string;
  amount: number;                          // In MINOR units (cents/pence)
  arrival_date: Date | null;               // Unix timestamp or ISO
  created: Date | null;                    // Unix timestamp or ISO
  currency: string;                        // Lowercase
  status: string;                          // 'paid', 'pending', 'failed', etc.
  description: string | null;
  destination: string | null;              // Bank account ID
  failure_code: string | null;
  failure_message: string | null;
  automatic: boolean | null;
  method: string | null;                   // 'standard', 'instant'
  source_type: string | null;
  type: string | null;
}

// ============================================================================
// AMAZON SETTLEMENT (From API Docs - TAB DELIMITED)
// Columns: settlement-id, settlement-start-date, settlement-end-date,
//          deposit-date, total-amount, currency, transaction-type, order-id,
//          merchant-order-id, adjustment-id, marketplace-name, amount-type,
//          amount-description, amount, posted-date, posted-date-time, etc.
// ============================================================================

export interface AmazonSettlementRow {
  'settlement-id': string;                 // GROUP BY THIS
  'settlement-start-date': Date | null;    // ISO 8601 with timezone
  'settlement-end-date': Date | null;
  'deposit-date': Date | null;             // When money hits bank
  'total-amount': number;                  // In MINOR units - MATCH TO BANK
  'currency': string;                      // USD, GBP, EUR
  'transaction-type': string;              // Order, Refund, Adjustment, etc.
  'order-id': string | null;
  'merchant-order-id': string | null;
  'adjustment-id': string | null;
  'marketplace-name': string | null;
  'amount-type': string;                   // ItemPrice, ItemFees, Tax, etc.
  'amount-description': string;            // Principal, Commission, FBA Fee, etc.
  'amount': number;                        // In MINOR units - for fee breakdown
  'posted-date': Date | null;
  'posted-date-time': Date | null;
}

// ============================================================================
// SHOPIFY BALANCE TRANSACTIONS (From API Docs)
// Columns: id, type, test, payout_id, payout_status, currency, amount, fee,
//          net, source_id, source_type, source_order_id, processed_at
// ============================================================================

export interface ShopifyBalanceTxn {
  id: string;
  type: string;                            // 'charge', 'refund', 'dispute', etc.
  test: boolean;
  payout_id: string | null;                // GROUP BY THIS
  payout_status: string | null;            // 'paid', 'pending', etc.
  currency: string;                        // USD, GBP, CAD
  amount: number;                          // Gross in MINOR units
  fee: number;                             // Fee in MINOR units
  net: number;                             // Net in MINOR units
  source_id: string | null;
  source_type: string | null;
  source_order_id: string | null;
  processed_at: Date | null;               // ISO 8601
}

// ============================================================================
// SHOPIFY PAYOUTS (From API Docs)
// Columns: id, status, date, currency, amount, charges_gross, charges_fee,
//          refunds_gross, refunds_fee, adjustments
// NOTE: CSV exports have flat columns, not "summary.*"
// ============================================================================

export interface ShopifyPayout {
  id: string;
  status: string;                          // 'scheduled', 'in_transit', 'paid', etc.
  date: Date | null;                       // ISO 8601 date (not datetime)
  currency: string;
  amount: number;                          // In MINOR units
  charges_gross: number | null;            // Optional breakdown
  charges_fee: number | null;
  refunds_gross: number | null;            // Negative value
  refunds_fee: number | null;              // Negative value
  adjustments: number | null;
}

// ============================================================================
// BANK STATEMENT
// ============================================================================

export interface BankTransaction {
  date: Date | null;
  description: string;
  amount: number;                          // In MINOR units (positive = deposit)
  balance: number | null;                  // Running balance (optional)
  _key: string;                            // Unique identifier for matching
}

// ============================================================================
// COLUMN MAPPING TYPES
// ============================================================================

export type CanonicalField = 
  // Stripe Balance
  | 'id' | 'created' | 'available_on' | 'amount' | 'fee' | 'net' 
  | 'currency' | 'reporting_category' | 'source' | 'customer'
  | 'automatic_payout_id' | 'automatic_payout_effective_at' | 'description' | 'type'
  
  // Stripe Payout
  | 'payout_id' | 'arrival_date' | 'status' | 'automatic' | 'destination'
  | 'failure_code' | 'failure_message' | 'method' | 'source_type'
  
  // Amazon Settlement
  | 'settlement-id' | 'settlement-start-date' | 'settlement-end-date'
  | 'deposit-date' | 'total-amount' | 'transaction-type' | 'order-id'
  | 'merchant-order-id' | 'adjustment-id' | 'marketplace-name'
  | 'amount-type' | 'amount-description' | 'posted-date' | 'posted-date-time'
  
  // Shopify Balance
  | 'payout_id' | 'payout_status' | 'source_id' | 'source_type'
  | 'source_order_id' | 'processed_at' | 'test'
  
  // Shopify Payout
  | 'date' | 'charges_gross' | 'charges_fee' | 'refunds_gross'
  | 'refunds_fee' | 'adjustments'
  
  // Bank
  | 'bank_date' | 'bank_description' | 'bank_amount' | 'bank_balance';

export type ColumnMap = Partial<Record<CanonicalField, string>>;

export interface AutoMapResult {
  mapping: ColumnMap;
  confidence: Record<string, number>;
  unmapped: CanonicalField[];
  suggestions: Record<string, Array<{ header: string; confidence: number }>>;
}

// ============================================================================
// MATCHING & RECONCILIATION TYPES
// ============================================================================

export type MatchStatus = 'MATCHED' | 'UNMATCHED' | 'AMBIGUOUS' | 'IGNORED' | 'PENDING';

export type MatchReasonCode =
  | 'EXACT_MATCH'
  | 'DATE_AMOUNT_MATCH'
  | 'NO_CANDIDATES'
  | 'DATE_OUT_OF_TOLERANCE'
  | 'AMOUNT_OUT_OF_TOLERANCE'
  | 'CURRENCY_MISMATCH'
  | 'ALREADY_MATCHED'
  | 'AMBIGUOUS_CANDIDATES'
  | 'MANUALLY_MATCHED'
  | 'MANUALLY_IGNORED'
  | 'MANUALLY_PENDING';

export interface MatchReason {
  code: MatchReasonCode;
  message: string;
  details?: any;
}

export interface PayoutMatch {
  payout: {
    id: string;
    platform: Platform;
    date: Date | null;
    amount: number;                        // MINOR units
    currency: string;
    label: string;                         // Human-readable label
  };
  bank: BankTransaction | null;
  status: MatchStatus;
  reason: MatchReason;
  confidence: number;                      // 0-1
  candidates?: Array<{                     // For unmatched/ambiguous
    bank: BankTransaction;
    score: number;
    reason: string;
  }>;
}

export interface PlatformReconciliation {
  platform: Platform;
  currency: string;
  
  // Payout-to-Bank Matching
  matches: PayoutMatch[];
  
  // Summary
  total_expected_minor: number;            // Sum of all payouts
  total_received_minor: number;            // Sum of matched bank deposits
  variance_minor: number;                  // Difference
  match_count: number;
  expected_count: number;
  match_rate: number;                      // 0-1
  
  // Fee Breakdown
  fee_breakdown: {
    total_gross_minor: number;
    total_fees_minor: number;
    total_net_minor: number;
    fee_details: Array<{
      type: string;
      amount_minor: number;
    }>;
  };
  
  // Pre-Payout Validation (Balance Txns → Payouts)
  pre_payout_validation?: PrePayoutValidation[];
}

export interface PrePayoutValidation {
  payout_id: string;
  payout_amount_minor: number;
  balance_txns_count: number;
  balance_txns_net_sum_minor: number;
  matches: boolean;
  variance_minor: number;
  balance_txns: Array<{
    id: string;
    type: string;
    amount_minor: number;
    fee_minor: number;
    net_minor: number;
  }>;
}

export interface ReconciliationResult {
  period_start: Date;
  period_end: Date;
  
  // Bank Statement
  bank: {
    total_deposits_minor: number;
    total_withdrawals_minor: number;
    deposit_count: number;
    deposits: BankTransaction[];
  };
  
  // Platform Results
  platforms: PlatformReconciliation[];
  
  // Unallocated Bank Deposits
  unallocated: {
    deposits: BankTransaction[];
    total_minor: number;
    count: number;
  };
  
  // Summary
  summary: {
    bank_total_minor: number;
    platforms_expected_total_minor: number;
    platforms_matched_total_minor: number;
    variance_minor: number;
    overall_match_rate: number;
    platform_count: number;
  };
}

// ============================================================================
// PLATFORM CONFIGURATION (From API Docs)
// ============================================================================

export interface FieldDefinition {
  id: CanonicalField;
  label: string;
  required: boolean;
  description: string;
  variations: string[];                    // For auto-mapping
}

export interface FileTypeConfig {
  key: string;
  label: string;
  required: boolean;
  delimiter?: string;                      // '\t' for Amazon
  requiredFields: FieldDefinition[];
  optionalFields: FieldDefinition[];
}

export interface PlatformConfig {
  id: Platform;
  name: string;
  bankKeywords: string[];
  color: string;
  files: FileTypeConfig[];
}

// ============================================================================
// UPLOAD STATE
// ============================================================================

export interface FileUploadState {
  file: File | null;
  headers: string[];
  columnMap: ColumnMap;
  autoMapResult?: AutoMapResult;
  validationErrors?: string[];
}

export interface UploadState {
  bank: FileUploadState;
  stripe?: {
    balance?: FileUploadState;
    payouts?: FileUploadState;
  };
  amazon?: {
    settlement?: FileUploadState;
  };
  shopify?: {
    balance?: FileUploadState;
    payouts?: FileUploadState;
  };
}

// ============================================================================
// MANUAL OVERRIDE TYPES
// ============================================================================

export interface ManualOverride {
  id: string;
  type: 'MATCH' | 'IGNORE' | 'PENDING';
  payout_id: string;
  platform: Platform;
  bank_key?: string;                       // For MATCH type
  reason?: string;                         // For IGNORE/PENDING
  timestamp: Date;
}
