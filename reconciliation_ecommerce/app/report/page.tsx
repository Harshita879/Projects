'use client'

import { useEffect, useState } from 'react'
import type { UnifiedReconciliationResult } from '@/lib/types'
import { formatDateShort } from '@/lib/dateUtils'
import { formatMinorToDecimal } from '@/lib/moneyUtils'

export default function ReportPage() {
    const [result, setResult] = useState<UnifiedReconciliationResult | null>(null)

    useEffect(() => {
        const stored = localStorage.getItem('recon:latest')
        if (stored) {
            try {
                setResult(JSON.parse(stored))
            } catch (e) {
                console.error('Failed to parse stored results:', e)
            }
        }
    }, [])

    if (!result) {
        return (
            <div className="min-h-screen bg-white p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-4">Reconciliation Report</h1>
                    <p className="text-gray-600">No reconciliation data found. Please generate a report from the main page.</p>
                </div>
            </div>
        )
    }

    const formatAmount = (minor: number) => {
        return `£${formatMinorToDecimal(minor)}`
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="min-h-screen bg-white p-8 print:p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 print:mb-4">
                    <h1 className="text-3xl font-bold mb-2">Reconciliation Report</h1>
                    <p className="text-gray-600">
                        Period: {formatDateShort(new Date(result.periodStart))} - {formatDateShort(new Date(result.periodEnd))}
                    </p>
                    <p className="text-gray-600">Currency: {result.currency}</p>
                    <button
                        onClick={handlePrint}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 print:hidden"
                    >
                        Print Report
                    </button>
                </div>

                {/* Summary */}
                <div className="mb-8 print:mb-4 border-b pb-4">
                    <h2 className="text-xl font-semibold mb-4">Summary</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Bank Total Deposits</p>
                            <p className="text-lg font-semibold">
                                {formatAmount(result.summary.bank_total_deposits_minor)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Platforms Expected</p>
                            <p className="text-lg font-semibold">
                                {formatAmount(result.summary.platforms_expected_total_minor)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Matched</p>
                            <p className="text-lg font-semibold text-green-600">
                                {formatAmount(result.summary.bank_matched_deposits_minor)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Unallocated</p>
                            <p className="text-lg font-semibold text-orange-600">
                                {formatAmount(result.summary.bank_unallocated_deposits_minor)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Excluded</p>
                            <p className="text-lg font-semibold text-gray-600">
                                {formatAmount(result.summary.bank_excluded_deposits_minor)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Variance</p>
                            <p
                                className={`text-lg font-semibold ${
                                    Math.abs(result.summary.variance_minor) < 100
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}
                            >
                                {formatAmount(result.summary.variance_minor)}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm text-gray-600">Match Rate</p>
                        <p className="text-lg font-semibold">
                            {result.summary.overallMatchRate.toFixed(1)}%
                        </p>
                    </div>
                </div>

                {/* Platform Breakdown */}
                <div className="mb-8 print:mb-4">
                    <h2 className="text-xl font-semibold mb-4">Platform Breakdown</h2>
                    {result.platforms.map((platform) => (
                        <div key={platform.platform} className="mb-6 border-b pb-4">
                            <h3 className="text-lg font-semibold mb-2 capitalize">{platform.platform}</h3>
                            {platform.platform_state.state === 'READY' ? (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Expected</p>
                                        <p className="font-semibold">
                                            {formatAmount(platform.clearingAccount.total_expected)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Received</p>
                                        <p className="font-semibold">
                                            {formatAmount(platform.clearingAccount.total_received)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Matched</p>
                                        <p className="font-semibold">
                                            {platform.clearingAccount.match_count} /{' '}
                                            {platform.clearingAccount.unmatched_expected.length +
                                                platform.clearingAccount.match_count}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Variance</p>
                                        <p
                                            className={`font-semibold ${
                                                Math.abs(platform.clearingAccount.variance) < 100
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            {formatAmount(platform.clearingAccount.variance)}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-600">
                                    {platform.platform_state.state === 'NOT_UPLOADED'
                                        ? 'Platform files not uploaded'
                                        : platform.platform_state.state === 'PARSE_FAILED'
                                        ? `Parse failed: ${(platform.platform_state as any).error || 'Unknown error'}`
                                        : platform.platform_state.state === 'MAPPING_INCOMPLETE'
                                        ? `Missing fields: ${(platform.platform_state as any).missing_fields?.join(', ') || ''}`
                                        : 'No payouts found'}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Unallocated Deposits */}
                {result.unallocated.deposits.length > 0 && (
                    <div className="mb-8 print:mb-4">
                        <h2 className="text-xl font-semibold mb-4">Unallocated Deposits</h2>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Date</th>
                                    <th className="text-left p-2">Description</th>
                                    <th className="text-right p-2">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.unallocated.deposits.map((deposit) => (
                                    <tr key={deposit.id} className="border-b">
                                        <td className="p-2">
                                            {formatDateShort(new Date(deposit.date))}
                                        </td>
                                        <td className="p-2">{deposit.description}</td>
                                        <td className="p-2 text-right">{formatAmount(deposit.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 print:mt-4 text-sm text-gray-600 border-t pt-4">
                    <p>Generated: {new Date().toLocaleString()}</p>
                </div>
            </div>
        </div>
    )
}

