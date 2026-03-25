# E-commerce Reconciliation App

**Unified multi-platform payment reconciliation** with clearing account ledger for proper double-entry bookkeeping. Upload one bank statement, reconcile all your payment platforms at once.

## Key Features

### Unified Reconciliation
- **Single bank statement** shared across all platforms
- **Multi-platform support**: Stripe, Amazon, PayPal (coming soon), Shopify (coming soon)
- **Smart categorization**: Automatically allocates bank deposits to platforms by description
- **Unallocated tracking**: Identifies deposits that don't match any platform
- **Unified dashboard**: See all platforms at a glance

### Clearing Account Ledger
- **Double-entry bookkeeping**: Track expected deposits (debits) vs actual deposits (credits)
- **Running balance**: See balance after each transaction
- **Variance detection**: Automatically flags unbalanced accounts (closing balance ≠ 0)
- **Matched entries**: Links expected payouts to actual bank deposits
- **Per-platform ledgers**: Each platform has its own clearing account

### Intelligent Matching
- Automatic three-way reconciliation
- Match by: amount (±£0.01) + date (±3 days) + description keywords
- Detailed transaction breakdown (expandable rows)
- Summary statistics (match rate, totals, fees)
- Support for multiple currencies (auto-detected from data)

## Supported Platforms

### Stripe
- Upload: Balance Transactions CSV + Payouts CSV
- Groups transactions by payout_id
- Calculates gross sales, fees, and net amounts
- Bank keywords: "stripe", "stripe payments"

### Amazon Marketplace
- Upload: Settlement Report CSV
- Groups transactions by settlement-id
- Breaks down Principal, Commission, FBA Fees, Shipping
- Bank keywords: "amazon", "amazon marketplace", "amzn"

### PayPal (Coming Soon)
- Upload: Transaction Report CSV
- Bank keywords: "paypal"

### Shopify Payments (Coming Soon)
- Upload: Payouts CSV
- Bank keywords: "shopify", "shpfy"

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## CSV Formats

### Stripe
**Balance Transactions**: balance_transaction_id, gross, fee, net, automatic_payout_id (amounts in pence)
**Payouts**: id, amount, arrival_date (amount in pence)

### Amazon
**Settlement Report**: settlement-id, deposit-date, amount-type, amount, total-amount

### Bank Statement (Common)
**Format**: Date (DD/MM/YYYY), Description, Paid In (amount in pounds)


## How It Works

### Unified Reconciliation Flow

```
┌─────────────────────┐
│  Bank Statement     │  ← Upload once
│  (Single CSV)       │
└──────────┬──────────┘
           │
    ┌──────┴──────┬──────────┬──────────┐
    │             │          │          │
    ▼             ▼          ▼          ▼
┌────────┐  ┌─────────┐  ┌────────┐  ┌──────────┐
│ Stripe │  │ Amazon  │  │ PayPal │  │Unallocated│
│Clearing│  │Clearing │  │Clearing│  │ Deposits  │
└────────┘  └─────────┘  └────────┘  └──────────┘
    │             │          │
    └──────┬──────┴──────────┘
           │
           ▼
    ┌─────────────┐
    │   Unified   │
    │   Summary   │
    └─────────────┘
```

### Bank Deposit Categorization

The system automatically categorizes each bank deposit:

1. **Stripe**: Description contains "stripe" or "stripe payments"
2. **Amazon**: Description contains "amazon", "amazon marketplace", or "amzn"
3. **PayPal**: Description contains "paypal"
4. **Shopify**: Description contains "shopify" or "shpfy"
5. **Unallocated**: Doesn't match any platform keywords

### Clearing Account Logic

Each platform has its own clearing account:

1. **Expected Deposits (Debits)**: When platform schedules a payout, it's recorded as a debit
2. **Actual Deposits (Credits)**: When money arrives in your bank, it's recorded as a credit
3. **Matching**: System matches expected to actual by amount, date (±3 days), and description
4. **Balance**: Running balance shows funds in transit. Should be £0 when fully reconciled

**Example:**
```
Date       | Description              | Debit   | Credit  | Balance
-----------|--------------------------|---------|---------|--------
2024-12-01 | Stripe Payout po_123     | £100.00 |         | £100.00  (in transit)
2024-12-03 | STRIPE PAYMENTS UK       |         | £100.00 | £0.00    (✓ matched)
```

### Test Data

Sample CSV files are provided in `reconciliation_data/`:
- `bank_statement_unified.csv` - Combined bank statement with Stripe, Amazon, and unallocated deposits
- `stripe_balance_transactions_REAL_SCHEMA.csv`
- `stripe_payouts_REAL_SCHEMA.csv`
- `amazon_settlement_report_sample.csv`

### Technical Improvements

1. **Unique ID Generation**: Uses `crypto.randomUUID()` for production-grade unique IDs
2. **Currency Auto-Detection**: Automatically detects currency from payout/settlement data
3. **Smart Bank Categorization**: Automatically allocates deposits to platforms by keywords
4. **Unallocated Detection**: Identifies deposits that don't match any platform
5. **Unified Summary**: Aggregates data across all platforms for complete picture
