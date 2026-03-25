/**
 * NORMALIZED PLATFORM DATA MODELS
 * All amounts in integer minor units
 * All dates as Date | null (never invalid Date)
 */

import type { Money } from './types'

// Stripe Balance Transaction (normalized)
export interface StripeBalanceTxnNormalized {
    id: string
    created: Date | null
    available_on: Date | null
    currency: string
    amount_minor: number // integer minor units
    fee_minor: number
    net_minor: number
    automatic_payout_id: string | null
    automatic_payout_effective_at: Date | null
    description?: string | null
    reporting_category?: string | null
    source?: string | null
}

// Stripe Payout (normalized)
export interface StripePayoutNormalized {
    id: string
    amount_minor: number // integer minor units
    arrival_date: Date | null
    created: Date | null
    currency: string
    status: string
    description?: string | null
    destination?: string | null
    automatic?: boolean | null
}

// Amazon Settlement Row (normalized)
export interface AmazonSettlementRowNormalized {
    settlement_id: string
    deposit_date: Date | null
    total_amount_minor: number | null // Only meaningful on first row per settlement
    currency: string
    amount_type: string
    amount_description: string
    amount_minor: number
    posted_date_time?: Date | null
    transaction_type?: string | null
    order_id?: string | null
    marketplace_name?: string | null
}

// Shopify Balance Transaction (normalized)
export interface ShopifyBalanceTxnNormalized {
    id: string
    payout_id: string | null
    payout_status: string | null
    currency: string
    amount_minor: number
    fee_minor: number
    net_minor: number
    processed_at: Date | null
    source_type?: string | null
    source_order_id?: string | null
    type?: string | null
}

// Shopify Payout (normalized)
export interface ShopifyPayoutNormalized {
    id: string
    status: string
    date: Date | null
    currency: string
    amount_minor: number
    summary_charges_gross_amount?: number | null
    summary_charges_fee_amount?: number | null
    summary_refunds_gross_amount?: number | null
    summary_refunds_fee_amount?: number | null
    summary_adjustments_gross_amount?: number | null
    summary_adjustments_fee_amount?: number | null
}

// Bank Deposit (normalized)
export interface BankDeposit {
    date: Date | null
    description: string
    amount_minor: number // positive for deposits
    currency: string
    key: string // Stable unique key: ${dateISO}|${amount_minor}|${idx}
    excluded?: boolean
    exclusion_reason?: string
}

// Expected Payout/Settlement (for matching)
export interface ExpectedPayout {
    id: string
    platform: 'stripe' | 'amazon' | 'shopify'
    amount_minor: number
    currency: string
    date: Date | null
    descriptorHints?: string[] // Keywords to help match bank description
    source_data?: any
}

