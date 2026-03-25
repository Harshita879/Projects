/**
 * Shopify Column Mapping Configuration
 * Based on actual Shopify CSV export structure
 */

import type { CanonicalField } from '@/lib/types'

export const SHOPIFY_BALANCE_FIELDS = [
    { id: 'id' as CanonicalField, label: 'Transaction ID', required: true, hint: 'Integer ID from CSV' },
    { id: 'type' as CanonicalField, label: 'Type', required: true, hint: 'charge, refund, dispute' },
    { id: 'payout_id' as CanonicalField, label: 'Payout ID', required: true, hint: 'Integer ID linking to payout' },
    { id: 'amount' as CanonicalField, label: 'Amount (Gross)', required: true, hint: 'Decimal string' },
    { id: 'fee' as CanonicalField, label: 'Fee', required: true, hint: 'Decimal string' },
    { id: 'net' as CanonicalField, label: 'Net Amount', required: true, hint: 'Decimal string' },
    { id: 'currency' as CanonicalField, label: 'Currency', required: true, hint: 'Currency code' },
    { id: 'processed_at' as CanonicalField, label: 'Processed At', required: true, hint: 'ISO 8601 DateTime' },
    { id: 'source_order_id' as CanonicalField, label: 'Order ID', required: false, hint: 'Optional' },
    { id: 'payout_status' as CanonicalField, label: 'Payout Status', required: false, hint: 'Optional' },
]

export const SHOPIFY_PAYOUT_FIELDS = [
    { id: 'id' as CanonicalField, label: 'Payout ID', required: true },
    { id: 'status' as CanonicalField, label: 'Status', required: true },
    { id: 'date' as CanonicalField, label: 'Payout Date', required: true },
    { id: 'currency' as CanonicalField, label: 'Currency', required: true },
    { id: 'amount' as CanonicalField, label: 'Amount', required: true },
    { id: 'charges_gross' as CanonicalField, label: 'Charges Gross', required: false },
    { id: 'charges_fee' as CanonicalField, label: 'Charges Fee', required: false },
    { id: 'refunds_gross' as CanonicalField, label: 'Refunds Gross', required: false },
    { id: 'refunds_fee' as CanonicalField, label: 'Refunds Fee', required: false },
    { id: 'adjustments' as CanonicalField, label: 'Adjustments', required: false },
]
