'use client'

import { CanonicalField, ColumnMap } from '@/lib/types'
import { autoMapColumns, getRequiredFields, getOptionalFields } from '@/lib/columnAutoMapper'
import { SHOPIFY_BALANCE_FIELDS, SHOPIFY_PAYOUT_FIELDS } from './ShopifyColumnMapping'

type FieldConfig = {
    id: CanonicalField
    label: string
    required?: boolean
    hint?: string
}

const STRIPE_BALANCE_FIELDS: FieldConfig[] = [
    { id: 'id', label: 'Transaction ID', required: true, hint: 'Map to CSV "id" column' },
    { id: 'amount', label: 'Amount (Gross)', required: true, hint: 'Map to CSV "Amount" column - this is what customer paid' },
    { id: 'fee', label: 'Fee', required: true, hint: 'Map to CSV "Fee" column' },
    { id: 'net', label: 'Net Amount', required: true, hint: 'Map to CSV "Net" column' },
    { id: 'automatic_payout_id', label: 'Payout ID', required: true, hint: 'Map to CSV "automatic_payout_id" column - used for grouping' },
    { id: 'available_on', label: 'Available On Date', required: true, hint: 'Map to CSV "Available On (UTC)" - this is when funds become available for reconciliation' },
    { id: 'currency', label: 'Currency', required: true },
    { id: 'reporting_category', label: 'Reporting Category', hint: 'Map to CSV "Reporting Category" - used to detect refunds' },
    { id: 'description', label: 'Description' },
    { id: 'created', label: 'Created Date', hint: 'Map to CSV "Created (UTC)"' },
]

const STRIPE_PAYOUT_FIELDS: FieldConfig[] = [
    { id: 'payout_id', label: 'Payout ID', required: true, hint: 'Map to CSV "id" column' },
    { id: 'amount', label: 'Amount', required: true, hint: 'Map to CSV "Amount" column (in pence, will be converted)' },
    { id: 'arrival_date', label: 'Arrival Date', required: true, hint: 'Map to CSV "Arrival Date (UTC)" - this is when money arrives in bank' },
    { id: 'status', label: 'Status', required: true, hint: 'Map to CSV "Status" column' },
    { id: 'currency', label: 'Currency', required: true },
    { id: 'description', label: 'Description' },
]

const AMAZON_SETTLEMENT_FIELDS: FieldConfig[] = [
    { id: 'settlement_id', label: 'Settlement ID', required: true, hint: 'Map to CSV "settlement-id" column - used for grouping' },
    { id: 'total_amount', label: 'Total Amount', required: true, hint: 'Map to CSV "total-amount" column - THIS is matched to bank deposit' },
    { id: 'deposit_date', label: 'Deposit Date', required: true, hint: 'Map to CSV "deposit-date" column - when money arrives' },
    { id: 'currency', label: 'Currency', required: true },
    { id: 'amount', label: 'Amount (Line Item)', required: true, hint: 'Map to CSV "amount" column - used for fee breakdown' },
    { id: 'amount_type', label: 'Amount Type', required: true, hint: 'Map to CSV "amount-type" column - "ItemPrice", "ItemFees", "Other"' },
    { id: 'amount_description', label: 'Amount Description', required: true, hint: 'Map to CSV "amount-description" column - "Principal", "Commission", etc.' },
    { id: 'transaction_type', label: 'Transaction Type', hint: 'Map to CSV "transaction-type" column - "Order", "Refund"' },
    { id: 'order_id', label: 'Order ID', hint: 'Map to CSV "order-id" column' },
    { id: 'merchant_order_id', label: 'Merchant Order ID', hint: 'Map to CSV "merchant-order-id" column' },
]

type ColumnMappingPanelProps = {
    title?: string
    headers: string[]
    value: ColumnMap
    onChange: (map: ColumnMap) => void
    fields?: FieldConfig[]
    fileType?: 'stripe_balance' | 'stripe_payout' | 'amazon_settlement'
    platform?: 'stripe' | 'shopify' | 'amazon'
    showAutoMap?: boolean
}

export function ColumnMappingPanel({
    title = 'Column mapping',
    headers,
    value,
    onChange,
    fields,
    fileType,
    platform,
    showAutoMap = true,
}: ColumnMappingPanelProps) {
    // Determine fields based on file type if not provided
    let displayFields = fields
    if (!displayFields && fileType) {
        switch (fileType) {
            case 'stripe_balance':
                displayFields = STRIPE_BALANCE_FIELDS
                break
            case 'stripe_payout':
                displayFields = STRIPE_PAYOUT_FIELDS
                break
            case 'amazon_settlement':
                displayFields = AMAZON_SETTLEMENT_FIELDS
                break
            case 'shopify_balance':
                displayFields = SHOPIFY_BALANCE_FIELDS
                break
            case 'shopify_payout':
                displayFields = SHOPIFY_PAYOUT_FIELDS
                break
        }
    }
    displayFields = displayFields || STRIPE_BALANCE_FIELDS

    const handleSelect = (fieldId: CanonicalField, headerName: string) => {
        const next: ColumnMap = { ...value }
        if (headerName === '__none__' || !headerName) {
            delete next[fieldId]
        } else {
            next[fieldId] = headerName
        }
        onChange(next)
    }

    const handleAutoMap = () => {
        if (!platform || !fileType) return

        // Determine file type key
        let fileTypeKey = fileType
        if (fileType === 'stripe_balance') fileTypeKey = 'balanceTransactions'
        else if (fileType === 'stripe_payout') fileTypeKey = 'payouts'
        else if (fileType === 'amazon_settlement') fileTypeKey = 'settlementReport'

        const requiredFields = getRequiredFields(platform, fileTypeKey)
        const optionalFields = getOptionalFields(platform, fileTypeKey)

        const autoMapping = autoMapColumns(headers, requiredFields, optionalFields)
        onChange(autoMapping.mapping)
    }

    return (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
                <span className="text-xs font-medium text-slate-700">{title}</span>
                <div className="flex items-center gap-2">
                    {showAutoMap && platform && fileType && (
                        <button
                            type="button"
                            onClick={handleAutoMap}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Auto-map columns
                        </button>
                    )}
                    <span className="text-[10px] text-slate-500">
                        Map your CSV columns to standard fields
                    </span>
                </div>
            </div>

            <div className="max-h-64 overflow-auto">
                <table className="w-full border-separate border-spacing-0 text-xs">
                    <thead>
                        <tr className="bg-slate-50 text-[11px] uppercase text-slate-500">
                            <th className="border-b border-slate-200 px-3 py-2 text-left">
                                Field
                            </th>
                            <th className="border-b border-slate-200 px-3 py-2 text-left">
                                CSV column
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayFields.map((field) => (
                            <tr
                                key={field.id}
                                className="odd:bg-white even:bg-slate-50/40"
                            >
                                <td className="border-b border-slate-100 px-3 py-2 align-middle">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-800">
                                            {field.label}
                                            {field.required && (
                                                <span className="ml-1 text-rose-500">*</span>
                                            )}
                                        </span>
                                        {field.hint && (
                                            <span className="text-[10px] text-slate-500">
                                                {field.hint}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="border-b border-slate-100 px-3 py-2 align-middle">
                                    <select
                                        value={value[field.id] ?? '__none__'}
                                        onChange={(e) =>
                                            handleSelect(field.id, e.target.value)
                                        }
                                        className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-800 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                    >
                                        <option value="__none__">Not used</option>
                                        {headers.map((h) => (
                                            <option key={h} value={h}>
                                                {h}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="border-t border-slate-200 px-3 py-2 text-[10px] text-slate-500">
                Required fields must be mapped before reconciliation.
            </div>
        </div>
    )
}

