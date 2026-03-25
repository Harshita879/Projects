import { PlatformConfig, FieldDefinition, Platform } from './types';

// ============================================================================
// STRIPE CONFIGURATION (From API Documentation)
// ============================================================================

const STRIPE_BALANCE_FIELDS: FieldDefinition[] = [
  // Required
  {
    id: 'id',
    label: 'Transaction ID',
    required: true,
    description: 'Unique balance transaction ID',
    variations: ['id', 'balance_transaction_id', 'transaction id', 'txn_id']
  },
  {
    id: 'amount',
    label: 'Amount (Gross)',
    required: true,
    description: 'Gross amount in cents/pence',
    variations: ['amount', 'gross', 'Amount', 'Gross', 'gross_amount']
  },
  {
    id: 'fee',
    label: 'Fee',
    required: true,
    description: 'Stripe fee in cents/pence',
    variations: ['fee', 'Fee', 'fees', 'stripe_fee', 'processing_fee']
  },
  {
    id: 'net',
    label: 'Net',
    required: true,
    description: 'Net amount (amount - fee)',
    variations: ['net', 'Net', 'net_amount', 'Net Amount']
  },
  {
    id: 'automatic_payout_id',
    label: 'Payout ID',
    required: true,
    description: 'Links transaction to payout (for grouping)',
    variations: ['automatic_payout_id', 'payout_id', 'payout id', 'automatic payout id']
  },
  {
    id: 'available_on',
    label: 'Available On',
    required: true,
    description: 'When funds become available',
    variations: ['available_on', 'Available On (UTC)', 'available on', 'availability_date']
  },
  {
    id: 'currency',
    label: 'Currency',
    required: true,
    description: 'Currency code (lowercase)',
    variations: ['currency', 'Currency', 'curr']
  },
  
  // Optional
  {
    id: 'created',
    label: 'Created',
    required: false,
    description: 'Transaction creation timestamp',
    variations: ['created', 'Created (UTC)', 'created_at', 'timestamp']
  },
  {
    id: 'reporting_category',
    label: 'Reporting Category',
    required: false,
    description: 'Transaction category (charge, refund, etc.)',
    variations: ['reporting_category', 'Reporting Category', 'category', 'type']
  },
  {
    id: 'source',
    label: 'Source',
    required: false,
    description: 'Source object ID (charge ID)',
    variations: ['source', 'Source', 'source_id']
  },
  {
    id: 'description',
    label: 'Description',
    required: false,
    description: 'Transaction description',
    variations: ['description', 'Description', 'desc']
  },
  {
    id: 'automatic_payout_effective_at',
    label: 'Payout Effective At',
    required: false,
    description: 'When payout was/will be sent',
    variations: ['automatic_payout_effective_at', 'payout_effective_at']
  }
];

const STRIPE_PAYOUT_FIELDS: FieldDefinition[] = [
  // Required
  {
    id: 'id',
    label: 'Payout ID',
    required: true,
    description: 'Unique payout identifier',
    variations: ['id', 'payout_id', 'payout id', 'Payout ID']
  },
  {
    id: 'amount',
    label: 'Amount',
    required: true,
    description: 'Payout amount in cents/pence',
    variations: ['amount', 'Amount', 'payout_amount', 'total']
  },
  {
    id: 'arrival_date',
    label: 'Arrival Date',
    required: true,
    description: 'When money arrives in bank',
    variations: ['arrival_date', 'Arrival Date (UTC)', 'arrival date', 'expected_arrival']
  },
  {
    id: 'currency',
    label: 'Currency',
    required: true,
    description: 'Currency code',
    variations: ['currency', 'Currency', 'curr']
  },
  {
    id: 'status',
    label: 'Status',
    required: true,
    description: 'Payout status (paid, pending, failed)',
    variations: ['status', 'Status', 'payout_status']
  },
  
  // Optional
  {
    id: 'created',
    label: 'Created',
    required: false,
    description: 'Payout creation timestamp',
    variations: ['created', 'Created (UTC)', 'created_at']
  },
  {
    id: 'description',
    label: 'Description',
    required: false,
    description: 'Payout description',
    variations: ['description', 'Description', 'desc']
  },
  {
    id: 'automatic',
    label: 'Automatic',
    required: false,
    description: 'Whether automatically created',
    variations: ['automatic', 'Automatic', 'is_automatic']
  }
];

// ============================================================================
// AMAZON CONFIGURATION (From API Documentation)
// ============================================================================

const AMAZON_SETTLEMENT_FIELDS: FieldDefinition[] = [
  // Required
  {
    id: 'settlement-id',
    label: 'Settlement ID',
    required: true,
    description: 'Amazon settlement identifier (for grouping)',
    variations: ['settlement-id', 'settlement_id', 'settlement id']
  },
  {
    id: 'deposit-date',
    label: 'Deposit Date',
    required: true,
    description: 'When money hits bank',
    variations: ['deposit-date', 'deposit_date', 'deposit date']
  },
  {
    id: 'total-amount',
    label: 'Total Amount',
    required: true,
    description: 'Total settlement amount (matches bank deposit)',
    variations: ['total-amount', 'total_amount', 'total amount', 'settlement_total']
  },
  {
    id: 'currency',
    label: 'Currency',
    required: true,
    description: 'Currency code',
    variations: ['currency', 'Currency', 'curr']
  },
  {
    id: 'amount-type',
    label: 'Amount Type',
    required: true,
    description: 'Category (ItemPrice, ItemFees, Tax, etc.)',
    variations: ['amount-type', 'amount_type', 'amount type']
  },
  {
    id: 'amount-description',
    label: 'Amount Description',
    required: true,
    description: 'Detailed description (Principal, Commission, FBA Fee, etc.)',
    variations: ['amount-description', 'amount_description', 'amount description', 'description']
  },
  {
    id: 'amount',
    label: 'Amount',
    required: true,
    description: 'Line item amount (for fee breakdown)',
    variations: ['amount', 'Amount', 'line_amount']
  },
  
  // Optional
  {
    id: 'transaction-type',
    label: 'Transaction Type',
    required: false,
    description: 'Order, Refund, Adjustment, etc.',
    variations: ['transaction-type', 'transaction_type', 'transaction type', 'type']
  },
  {
    id: 'order-id',
    label: 'Order ID',
    required: false,
    description: 'Amazon order identifier',
    variations: ['order-id', 'order_id', 'order id']
  },
  {
    id: 'marketplace-name',
    label: 'Marketplace',
    required: false,
    description: 'Amazon marketplace',
    variations: ['marketplace-name', 'marketplace_name', 'marketplace']
  },
  {
    id: 'posted-date-time',
    label: 'Posted Date Time',
    required: false,
    description: 'Transaction posting timestamp',
    variations: ['posted-date-time', 'posted_date_time', 'posted date time']
  }
];

// ============================================================================
// SHOPIFY CONFIGURATION (From API Documentation)
// ============================================================================

const SHOPIFY_BALANCE_FIELDS: FieldDefinition[] = [
  // Required
  {
    id: 'id',
    label: 'Transaction ID',
    required: true,
    description: 'Unique transaction identifier',
    variations: ['id', 'transaction_id', 'Transaction ID', 'txn_id']
  },
  {
    id: 'payout_id',
    label: 'Payout ID',
    required: true,
    description: 'Links transaction to payout (for grouping)',
    variations: ['payout_id', 'Payout ID', 'payout id', 'PayoutID']
  },
  {
    id: 'type',
    label: 'Type',
    required: true,
    description: 'Transaction type (charge, refund, dispute, etc.)',
    variations: ['type', 'Type', 'transaction_type']
  },
  {
    id: 'amount',
    label: 'Amount (Gross)',
    required: true,
    description: 'Gross transaction amount',
    variations: ['amount', 'Amount', 'gross', 'total']
  },
  {
    id: 'fee',
    label: 'Fee',
    required: true,
    description: 'Shopify processing fee',
    variations: ['fee', 'Fee', 'fees', 'processing_fee']
  },
  {
    id: 'net',
    label: 'Net',
    required: true,
    description: 'Net amount (amount - fee)',
    variations: ['net', 'Net', 'net_amount']
  },
  {
    id: 'currency',
    label: 'Currency',
    required: true,
    description: 'Currency code',
    variations: ['currency', 'Currency', 'curr']
  },
  {
    id: 'processed_at',
    label: 'Processed At',
    required: true,
    description: 'When transaction was processed',
    variations: ['processed_at', 'Transaction Date', 'transaction_date', 'processed at', 'date']
  },
  
  // Optional
  {
    id: 'payout_status',
    label: 'Payout Status',
    required: false,
    description: 'Status of associated payout',
    variations: ['payout_status', 'Payout Status', 'payout status']
  },
  {
    id: 'source_order_id',
    label: 'Order ID',
    required: false,
    description: 'Associated order number',
    variations: ['source_order_id', 'Order ID', 'order_id', 'order id']
  }
];

const SHOPIFY_PAYOUT_FIELDS: FieldDefinition[] = [
  // Required
  {
    id: 'id',
    label: 'Payout ID',
    required: true,
    description: 'Unique payout identifier',
    variations: ['id', 'payout_id', 'Payout ID', 'payout id']
  },
  {
    id: 'status',
    label: 'Status',
    required: true,
    description: 'Payout status (scheduled, in_transit, paid, etc.)',
    variations: ['status', 'Status', 'payout_status']
  },
  {
    id: 'date',
    label: 'Payout Date',
    required: true,
    description: 'When payout was sent to bank',
    variations: ['date', 'Payout Date', 'payout_date', 'payout date']
  },
  {
    id: 'currency',
    label: 'Currency',
    required: true,
    description: 'Currency code',
    variations: ['currency', 'Currency', 'curr']
  },
  {
    id: 'amount',
    label: 'Amount',
    required: true,
    description: 'Total payout amount',
    variations: ['amount', 'Amount', 'payout_amount', 'total']
  },
  
  // Optional (breakdown)
  {
    id: 'charges_gross',
    label: 'Charges Gross',
    required: false,
    description: 'Total sales amount',
    variations: ['charges_gross', 'Charges Gross', 'charges gross']
  },
  {
    id: 'charges_fee',
    label: 'Charges Fee',
    required: false,
    description: 'Fees on sales',
    variations: ['charges_fee', 'Charges Fee', 'charges fee']
  },
  {
    id: 'refunds_gross',
    label: 'Refunds Gross',
    required: false,
    description: 'Total refunded amount (negative)',
    variations: ['refunds_gross', 'Refunds Gross', 'refunds gross']
  },
  {
    id: 'refunds_fee',
    label: 'Refunds Fee',
    required: false,
    description: 'Fees on refunds (negative)',
    variations: ['refunds_fee', 'Refunds Fee', 'refunds fee']
  },
  {
    id: 'adjustments',
    label: 'Adjustments',
    required: false,
    description: 'Manual adjustments',
    variations: ['adjustments', 'Adjustments', 'adjustment']
  }
];

// ============================================================================
// BANK STATEMENT CONFIGURATION
// ============================================================================

const BANK_STATEMENT_FIELDS: FieldDefinition[] = [
  {
    id: 'bank_date',
    label: 'Date',
    required: true,
    description: 'Transaction date',
    variations: ['date', 'Date', 'transaction_date', 'trans_date', 'posting_date']
  },
  {
    id: 'bank_description',
    label: 'Description',
    required: true,
    description: 'Transaction description',
    variations: ['description', 'Description', 'desc', 'details', 'merchant', 'payee']
  },
  {
    id: 'bank_amount',
    label: 'Amount',
    required: true,
    description: 'Transaction amount',
    variations: ['amount', 'Amount', 'value', 'debit', 'credit', 'Paid In', 'paid in']
  },
  {
    id: 'bank_balance',
    label: 'Balance',
    required: false,
    description: 'Running balance',
    variations: ['balance', 'Balance', 'running_balance', 'account_balance']
  }
];

// ============================================================================
// COMPLETE PLATFORM CONFIGURATIONS
// ============================================================================

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    bankKeywords: ['stripe', 'stripe payments', 'stripe*', 'sp*stripe'],
    color: '#635BFF',
    files: [
      {
        key: 'balance',
        label: 'Balance Transactions',
        required: true,
        requiredFields: STRIPE_BALANCE_FIELDS.filter(f => f.required),
        optionalFields: STRIPE_BALANCE_FIELDS.filter(f => !f.required)
      },
      {
        key: 'payouts',
        label: 'Payouts',
        required: true,
        requiredFields: STRIPE_PAYOUT_FIELDS.filter(f => f.required),
        optionalFields: STRIPE_PAYOUT_FIELDS.filter(f => !f.required)
      }
    ]
  },
  
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    bankKeywords: ['amazon', 'amzn', 'amazon mktplace', 'amazon marketplace'],
    color: '#FF9900',
    files: [
      {
        key: 'settlement',
        label: 'Settlement Report',
        required: true,
        delimiter: '\t',  // TAB-DELIMITED
        requiredFields: AMAZON_SETTLEMENT_FIELDS.filter(f => f.required),
        optionalFields: AMAZON_SETTLEMENT_FIELDS.filter(f => !f.required)
      }
    ]
  },
  
  shopify: {
    id: 'shopify',
    name: 'Shopify',
    bankKeywords: ['shopify', 'shopify payments', 'sp*shopify'],
    color: '#96BF48',
    files: [
      {
        key: 'balance',
        label: 'Balance Transactions',
        required: true,
        requiredFields: SHOPIFY_BALANCE_FIELDS.filter(f => f.required),
        optionalFields: SHOPIFY_BALANCE_FIELDS.filter(f => !f.required)
      },
      {
        key: 'payouts',
        label: 'Payouts',
        required: true,
        requiredFields: SHOPIFY_PAYOUT_FIELDS.filter(f => f.required),
        optionalFields: SHOPIFY_PAYOUT_FIELDS.filter(f => !f.required)
      }
    ]
  }
};

export const BANK_CONFIG = {
  id: 'bank',
  name: 'Bank Statement',
  requiredFields: BANK_STATEMENT_FIELDS.filter(f => f.required),
  optionalFields: BANK_STATEMENT_FIELDS.filter(f => !f.required)
};
