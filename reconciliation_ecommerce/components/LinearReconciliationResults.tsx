/**
 * LINEAR-STYLE RECONCILIATION UI
 * Focus: Mismatch explanations, not payout lists
 * Tone: Neutral, helpful, transparent
 */

'use client'

import React, { useState } from 'react'
import type { UnifiedReconciliationResult, PlatformReconciliation } from '@/lib/types'
import { PLATFORM_CONFIGS } from '@/lib/platformConfigs'
import { buildReconciliationCsv } from '@/lib/exportCsv'
import { formatDateShort } from '@/lib/dateUtils'
import { formatMinorToDecimal } from '@/lib/moneyUtils'

interface ReconciliationResultsProps {
    result: UnifiedReconciliationResult
    onReset?: () => void
    onBackToMapping?: () => void
    onClearStripe?: () => void
    onRetryReconcile?: () => void
    onRetryPlatform?: (platform: string) => void
    onReuploadPlatform?: (platform: string, fileType: string) => void
    onIgnorePlatform?: (platform: string) => void
    onResolveDeposit?: (deposit: { date: string; description: string; amount: number }) => void
}

// Platform icons mapping
const PLATFORM_ICONS: Record<string, string> = {
    stripe: '💳',
    amazon: '📦',
    shopify: '🛒',
    paypal: '💸',
}

interface MismatchGroup {
    reason: string
    count: number
    items: Array<{
        id: string
        date: string | null
        amount: number
        description: string
        platform: string
        details?: any
    }>
}

export function LinearReconciliationResults({
    result,
    onReset,
    onBackToMapping,
    onClearStripe,
    onRetryReconcile,
    onRetryPlatform,
    onReuploadPlatform,
    onIgnorePlatform,
    onResolveDeposit,
}: ReconciliationResultsProps) {
    const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null)
    const [selectedMismatch, setSelectedMismatch] = useState<string | null>(null)
    const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set())
    const [resolvingDeposit, setResolvingDeposit] = useState<{
        date: string
        description: string
        amount: number
    } | null>(null)

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: result.currency || 'GBP',
        }).format(amount)
    }

    const formatDate = (date: string) => {
        try {
            return new Date(date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
            })
        } catch {
            return date
        }
    }

    // Transform platforms data with mismatch focus
    const platforms = result.platforms.map((platform: PlatformReconciliation) => {
        const clearingAccount = platform.clearingAccount
        const platformState = platform.platform_state

        // Handle different platform states
        if (platformState.state === 'NOT_UPLOADED') {
            return {
                name: PLATFORM_CONFIGS[platform.platform]?.name || platform.platform,
                icon: PLATFORM_ICONS[platform.platform] || '📊',
                expectedCount: 0,
                matchedCount: 0,
                expectedAmount: 0,
                status: 'not_uploaded' as const,
                state: platformState,
                mismatches: [],
            }
        }

        if (platformState.state === 'PARSE_FAILED') {
            return {
                name: PLATFORM_CONFIGS[platform.platform]?.name || platform.platform,
                icon: PLATFORM_ICONS[platform.platform] || '📊',
                expectedCount: 0,
                matchedCount: 0,
                expectedAmount: 0,
                status: 'parse_failed' as const,
                state: platformState,
                error: platformState.error,
                mismatches: [],
            }
        }

        if (platformState.state === 'MAPPING_INCOMPLETE') {
            return {
                name: PLATFORM_CONFIGS[platform.platform]?.name || platform.platform,
                icon: PLATFORM_ICONS[platform.platform] || '📊',
                expectedCount: 0,
                matchedCount: 0,
                expectedAmount: 0,
                status: 'mapping_incomplete' as const,
                state: platformState,
                missingFields: platformState.missing_fields,
                mismatches: [],
            }
        }

        if (platformState.state === 'NO_PAYOUTS_FOUND') {
            return {
                name: PLATFORM_CONFIGS[platform.platform]?.name || platform.platform,
                icon: PLATFORM_ICONS[platform.platform] || '📊',
                expectedCount: 0,
                matchedCount: 0,
                expectedAmount: 0,
                status: 'no_payouts' as const,
                state: platformState,
                mismatches: [],
            }
        }

        // READY state
        const matchedCount = clearingAccount.match_count
        const expectedCount = clearingAccount.unmatched_expected.length + matchedCount
        const expectedAmount = clearingAccount.total_expected / 100

        // Extract mismatches (unmatched expected entries)
        const mismatches = clearingAccount.unmatched_expected.map(entry => ({
            id: entry.id,
            date: entry.date,
            amount: entry.debit / 100,
            description: entry.description,
            platform: platform.platform,
            reason: entry.match_reason?.code || 'NO_CANDIDATES',
            reasonMessage: entry.match_reason?.message || 'Not found in bank',
            details: entry.source_data,
        }))

        // Determine status
        let status: 'reconciled' | 'needs_review' | 'not_uploaded' | 'parse_failed' | 'mapping_incomplete' | 'no_payouts'
        if (expectedCount === 0) {
            status = 'no_payouts'
        } else if (matchedCount === expectedCount && Math.abs(clearingAccount.variance) < 100) {
            status = 'reconciled'
        } else if (matchedCount === 0) {
            status = 'needs_review'
        } else {
            status = 'needs_review'
        }

        return {
            name: PLATFORM_CONFIGS[platform.platform]?.name || platform.platform,
            icon: PLATFORM_ICONS[platform.platform] || '📊',
            expectedCount,
            matchedCount,
            expectedAmount,
            status,
            state: platformState,
            mismatches,
        }
    })

    // Group mismatches by reason
    const groupMismatchesByReason = (mismatches: typeof platforms[0]['mismatches']): MismatchGroup[] => {
        const groups = new Map<string, MismatchGroup>()

        for (const mismatch of mismatches) {
            const reason = mismatch.reasonMessage || 'Not found in bank'
            if (!groups.has(reason)) {
                groups.set(reason, {
                    reason,
                    count: 0,
                    items: [],
                })
            }
            const group = groups.get(reason)!
            group.count++
            group.items.push(mismatch)
        }

        return Array.from(groups.values())
    }

    // Transform unallocated deposits
    const unallocated = result.unallocated.deposits.map(deposit => ({
        date: deposit.date,
        description: deposit.description,
        amount: deposit.amount / 100,
    }))

    // Calculate summary
    const bankTotal = result.bankStatement.totalDeposits / 100
    const platformTotal = result.summary.totalExpected / 100
    const variance = result.summary.totalVariance / 100

    // Overall status
    const overallStatus = result.summary.hasExcludedPlatforms
        ? 'needs_attention'
        : platforms.some(p => p.status === 'needs_review' || p.status === 'parse_failed')
        ? 'partial'
        : Math.abs(variance) < 0.01
        ? 'reconciled'
        : 'partial'

    return (
        <div className="max-w-5xl mx-auto p-8 space-y-6 bg-[#0a0a0a] min-h-screen">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-medium text-[#e8e8e8] tracking-tight">
                        Reconciliation Report
                    </h1>
                    <p className="text-sm text-[#666] mt-1">
                        {formatDate(result.periodStart)} – {formatDate(result.periodEnd)}
                    </p>
                </div>

                <div
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                        overallStatus === 'reconciled'
                            ? 'bg-[#00D4A3]/10 text-[#00D4A3]'
                            : overallStatus === 'needs_attention'
                            ? 'bg-[#ffaa00]/10 text-[#ffaa00]'
                            : 'bg-[#ffaa00]/10 text-[#ffaa00]'
                    }`}
                >
                    {overallStatus === 'reconciled'
                        ? 'Reconciled'
                        : overallStatus === 'needs_attention'
                        ? 'Needs attention'
                        : 'Partial'}
                </div>
            </div>

            {/* Summary Card */}
            <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
                <div className="bg-[#0a0a0a] px-5 py-3 border-b border-[#1a1a1a]">
                    <h2 className="text-sm font-medium text-[#e8e8e8]">Summary</h2>
                </div>

                <div className="bg-[#0f0f0f] p-5">
                    <div className="grid grid-cols-3 gap-8">
                        <div>
                            <div className="text-xs text-[#666] mb-1 uppercase tracking-wide">
                                Bank Received
                            </div>
                            <div className="text-xl font-medium text-[#e8e8e8]">
                                {formatAmount(bankTotal)}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-[#666] mb-1 uppercase tracking-wide">
                                Platforms Sent
                            </div>
                            <div className="text-xl font-medium text-[#e8e8e8]">
                                {formatAmount(platformTotal)}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-[#666] mb-1 uppercase tracking-wide">
                                Difference
                            </div>
                            <div
                                className={`text-xl font-medium ${
                                    Math.abs(variance) < 0.01
                                        ? 'text-[#00D4A3]'
                                        : variance < 0
                                        ? 'text-[#ff4444]'
                                        : 'text-[#ffaa00]'
                                }`}
                            >
                                {Math.abs(variance) < 0.01
                                    ? '—'
                                    : formatAmount(Math.abs(variance))}
                            </div>
                            {result.summary.hasExcludedPlatforms && (
                                <div className="text-xs text-[#ffaa00] mt-1">
                                    ⚠ Some platforms were excluded
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Platforms Table */}
            <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
                <div className="bg-[#0a0a0a] px-5 py-3 border-b border-[#1a1a1a]">
                    <h2 className="text-sm font-medium text-[#e8e8e8]">Platforms</h2>
                </div>

                <div className="bg-[#0f0f0f]">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#1a1a1a]">
                                <th className="text-left text-xs font-medium text-[#666] px-5 py-3 uppercase tracking-wide">
                                    Platform
                                </th>
                                <th className="text-right text-xs font-medium text-[#666] px-5 py-3 uppercase tracking-wide">
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {platforms.map((platform) => (
                                <React.Fragment key={platform.name}>
                                    {/* Platform Row */}
                                    <tr
                                        className="border-b border-[#1a1a1a] hover:bg-[#0a0a0a] transition-colors cursor-pointer"
                                        onClick={() =>
                                            setExpandedPlatform(
                                                expandedPlatform === platform.name
                                                    ? null
                                                    : platform.name
                                            )
                                        }
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{platform.icon}</span>
                                                <div>
                                                    <div className="text-sm font-medium text-[#e8e8e8]">
                                                        {platform.name}
                                                    </div>
                                                    {platform.status === 'reconciled' ||
                                                    platform.status === 'needs_review' ? (
                                                        <div className="text-xs text-[#666] mt-0.5">
                                                            {platform.expectedCount} payouts •{' '}
                                                            {formatAmount(platform.expectedAmount)}{' '}
                                                            expected
                                                            {platform.matchedCount > 0 && (
                                                                <>
                                                                    {' • '}
                                                                    {platform.matchedCount} matched
                                                                </>
                                                            )}
                                                            {platform.mismatches.length > 0 && (
                                                                <>
                                                                    {' • '}
                                                                    {platform.mismatches.length} need
                                                                    attention
                                                                </>
                                                            )}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-3 text-right">
                                            {platform.status === 'not_uploaded' ? (
                                                <span className="text-xs px-2 py-1 rounded bg-[#666]/10 text-[#666]">
                                                    Not uploaded
                                                </span>
                                            ) : platform.status === 'parse_failed' ? (
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-xs px-2 py-1 rounded bg-[#ff4444]/10 text-[#ff4444]">
                                                        Parse failed
                                                    </span>
                                                    {platform.error && (
                                                        <span className="text-[10px] text-[#ff4444]/70 max-w-xs text-right">
                                                            {platform.error}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : platform.status === 'mapping_incomplete' ? (
                                                <span className="text-xs px-2 py-1 rounded bg-[#ffaa00]/10 text-[#ffaa00]">
                                                    Needs mapping
                                                </span>
                                            ) : platform.status === 'no_payouts' ? (
                                                <span className="text-xs px-2 py-1 rounded bg-[#666]/10 text-[#666]">
                                                    No payouts
                                                </span>
                                            ) : platform.status === 'reconciled' ? (
                                                <span className="text-xs px-2 py-1 rounded bg-[#00D4A3]/10 text-[#00D4A3]">
                                                    Reconciled
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2 py-1 rounded bg-[#ffaa00]/10 text-[#ffaa00]">
                                                    Needs review
                                                </span>
                                            )}
                                        </td>
                                    </tr>

                                    {/* Expanded: What didn't match */}
                                    {expandedPlatform === platform.name &&
                                        platform.status === 'needs_review' &&
                                        platform.mismatches.length > 0 && (
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    className="bg-[#0a0a0a] px-5 py-4 border-b border-[#1a1a1a]"
                                                >
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h3 className="text-sm font-medium text-[#e8e8e8] mb-1">
                                                                What didn't match ({platform.mismatches.length})
                                                            </h3>
                                                            <p className="text-xs text-[#666]">
                                                                These {platform.name} payouts were expected but not
                                                                found in your bank statement.
                                                            </p>
                                                        </div>

                                                        {/* Grouped mismatches */}
                                                        <div className="space-y-3">
                                                            {groupMismatchesByReason(
                                                                platform.mismatches
                                                            ).map((group, groupIdx) => (
                                                                <div
                                                                    key={groupIdx}
                                                                    className="border border-[#1a1a1a] rounded-lg overflow-hidden"
                                                                >
                                                                    <div className="bg-[#0f0f0f] px-4 py-2 border-b border-[#1a1a1a]">
                                                                        <div className="text-xs font-medium text-[#e8e8e8]">
                                                                            {group.reason} ({group.count})
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-[#0a0a0a] divide-y divide-[#1a1a1a]">
                                                                        {group.items.map((mismatch) => (
                                                                            <MismatchCard
                                                                                key={mismatch.id}
                                                                                mismatch={mismatch}
                                                                                platformName={platform.name}
                                                                                formatAmount={formatAmount}
                                                                                formatDate={formatDate}
                                                                                isExpanded={
                                                                                    expandedDetails.has(
                                                                                        mismatch.id
                                                                                    )
                                                                                }
                                                                                onToggleDetails={() => {
                                                                                    const newSet = new Set(
                                                                                        expandedDetails
                                                                                    )
                                                                                    if (
                                                                                        newSet.has(
                                                                                            mismatch.id
                                                                                        )
                                                                                    ) {
                                                                                        newSet.delete(
                                                                                            mismatch.id
                                                                                        )
                                                                                    } else {
                                                                                        newSet.add(
                                                                                            mismatch.id
                                                                                        )
                                                                                    }
                                                                                    setExpandedDetails(newSet)
                                                                                }}
                                                                                onSelect={() =>
                                                                                    setSelectedMismatch(
                                                                                        selectedMismatch ===
                                                                                            mismatch.id
                                                                                            ? null
                                                                                            : mismatch.id
                                                                                    )
                                                                                }
                                                                                isSelected={
                                                                                    selectedMismatch ===
                                                                                    mismatch.id
                                                                                }
                                                                                bankDeposits={unallocated}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}

                                    {/* Expanded: Parse failed details with actions */}
                                    {expandedPlatform === platform.name &&
                                        platform.status === 'parse_failed' && (
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    className="bg-[#0a0a0a] px-5 py-4 border-b border-[#1a1a1a]"
                                                >
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-sm text-[#e8e8e8] mb-2">
                                                                We couldn't process your {platform.name} balance file.
                                                            </p>
                                                            {platform.error && (
                                                                <div className="bg-[#ff4444]/10 border border-[#ff4444]/20 rounded px-3 py-2 text-xs text-[#ff4444] mb-3">
                                                                    <div className="font-medium mb-1">Reason:</div>
                                                                    <div className="whitespace-pre-wrap font-mono text-[10px]">
                                                                        {platform.error}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <div className="text-xs font-medium text-[#e8e8e8] mb-2">
                                                                What you can do:
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                {onBackToMapping && (
                                                                    <button
                                                                        onClick={onBackToMapping}
                                                                        className="h-8 px-3 text-xs border border-[#1a1a1a] rounded-md bg-[#0f0f0f] hover:bg-[#1a1a1a] text-[#e8e8e8] transition-colors"
                                                                    >
                                                                        Fix mapping
                                                                    </button>
                                                                )}
                                                                {onClearStripe && platform.name.toLowerCase() === 'stripe' && (
                                                                    <button
                                                                        onClick={onClearStripe}
                                                                        className="h-8 px-3 text-xs border border-[#1a1a1a] rounded-md bg-[#0f0f0f] hover:bg-[#1a1a1a] text-[#e8e8e8] transition-colors"
                                                                    >
                                                                        Re-upload Stripe files
                                                                    </button>
                                                                )}
                                                                {onRetryReconcile && (
                                                                    <button
                                                                        onClick={onRetryReconcile}
                                                                        className="h-8 px-3 text-xs border border-[#1a1a1a] rounded-md bg-[#0f0f0f] hover:bg-[#1a1a1a] text-[#e8e8e8] transition-colors"
                                                                    >
                                                                        Retry
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Unallocated Deposits */}
            {unallocated.length > 0 && (
                <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
                    <div className="bg-[#0a0a0a] px-5 py-3 border-b border-[#1a1a1a]">
                        <h2 className="text-sm font-medium text-[#e8e8e8]">
                            Unallocated Deposits ({unallocated.length})
                        </h2>
                    </div>

                    <div className="bg-[#0f0f0f]">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#1a1a1a]">
                                    <th className="text-left text-xs font-medium text-[#666] px-5 py-3 uppercase tracking-wide">
                                        Date
                                    </th>
                                    <th className="text-left text-xs font-medium text-[#666] px-5 py-3 uppercase tracking-wide">
                                        Description
                                    </th>
                                    <th className="text-right text-xs font-medium text-[#666] px-5 py-3 uppercase tracking-wide">
                                        Amount
                                    </th>
                                    {onResolveDeposit && (
                                        <th className="text-right text-xs font-medium text-[#666] px-5 py-3 uppercase tracking-wide">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {unallocated.map((deposit, idx) => (
                                    <tr
                                        key={idx}
                                        className="border-b border-[#1a1a1a] hover:bg-[#0a0a0a] transition-colors"
                                    >
                                        <td className="px-5 py-3">
                                            <span className="text-sm text-[#e8e8e8]">
                                                {deposit.date ? formatDate(deposit.date) : '—'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-sm text-[#e8e8e8]">
                                                {deposit.description}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <span className="text-sm font-mono text-[#e8e8e8]">
                                                {formatAmount(deposit.amount)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            {onResolveDeposit && (
                                                <button
                                                    onClick={() => setResolvingDeposit(deposit)}
                                                    className="h-7 px-3 text-xs border border-[#1a1a1a] rounded hover:bg-[#0f0f0f] text-[#e8e8e8] transition-colors"
                                                >
                                                    Resolve
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Why? Drawer (right side) */}
            {selectedMismatch && (
                <MismatchExplainerDrawer
                    mismatch={platforms
                        .flatMap(p => p.mismatches)
                        .find(m => m.id === selectedMismatch)}
                    onClose={() => setSelectedMismatch(null)}
                    formatAmount={formatAmount}
                    formatDate={formatDate}
                    bankDeposits={unallocated}
                />
            )}

            {/* Resolve Deposit Drawer */}
            {resolvingDeposit && (
                <ResolveDepositDrawer
                    deposit={resolvingDeposit}
                    onClose={() => setResolvingDeposit(null)}
                    formatAmount={formatAmount}
                    formatDate={formatDate}
                    platforms={platforms}
                    onResolve={(action, data) => {
                        if (onResolveDeposit) {
                            onResolveDeposit({ ...resolvingDeposit, ...data })
                        }
                        setResolvingDeposit(null)
                    }}
                />
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
                <button
                    className="text-sm text-[#666] hover:text-[#999] transition-colors flex items-center gap-2"
                    onClick={onReset}
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Upload new files
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const csv = buildReconciliationCsv(result)
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                            const link = document.createElement('a')
                            const url = URL.createObjectURL(blob)
                            link.setAttribute('href', url)
                            link.setAttribute(
                                'download',
                                `reconciliation-${new Date().toISOString().split('T')[0]}.csv`
                            )
                            link.style.visibility = 'hidden'
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                        }}
                        className="h-9 px-4 text-sm border border-[#1a1a1a] rounded-md hover:bg-[#0f0f0f] transition-colors text-[#e8e8e8]"
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={() => {
                            localStorage.setItem('recon:latest', JSON.stringify(result))
                            window.open('/report', '_blank')
                        }}
                        className="h-9 px-4 text-sm bg-[#e8e8e8] text-[#0a0a0a] rounded-md hover:bg-[#fff] transition-colors font-medium"
                    >
                        Generate Report
                    </button>
                </div>
            </div>
        </div>
    )
}

// Mismatch Card Component
function MismatchCard({
    mismatch,
    platformName,
    formatAmount,
    formatDate,
    isExpanded,
    onToggleDetails,
    onSelect,
    isSelected,
    bankDeposits,
}: {
    mismatch: {
        id: string
        date: string | null
        amount: number
        description: string
        reason: string
        reasonMessage: string
        details?: any
    }
    platformName: string
    formatAmount: (amount: number) => string
    formatDate: (date: string) => string
    isExpanded: boolean
    onToggleDetails: () => void
    onSelect: () => void
    isSelected: boolean
    bankDeposits: Array<{ date: string; description: string; amount: number }>
}) {
    return (
        <div
            className={`px-4 py-3 hover:bg-[#0f0f0f] transition-colors ${
                isSelected ? 'bg-[#0f0f0f] ring-1 ring-[#1a1a1a]' : ''
            }`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium text-[#e8e8e8]">
                            {platformName} payout
                        </span>
                        {mismatch.date && (
                            <span className="text-xs text-[#666]">
                                {formatDate(mismatch.date)}
                            </span>
                        )}
                        <span className="text-sm font-mono text-[#e8e8e8]">
                            {formatAmount(mismatch.amount)}
                        </span>
                    </div>
                    <div className="text-xs text-[#666] mb-2">{mismatch.reasonMessage}</div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2">
                        <button
                            onClick={onSelect}
                            className="text-xs px-2 py-1 rounded border border-[#1a1a1a] hover:bg-[#0f0f0f] text-[#e8e8e8] transition-colors"
                        >
                            Why?
                        </button>
                        <button className="text-xs px-2 py-1 rounded border border-[#1a1a1a] hover:bg-[#0f0f0f] text-[#e8e8e8] transition-colors">
                            Match manually
                        </button>
                        <button className="text-xs px-2 py-1 rounded border border-[#1a1a1a] hover:bg-[#0f0f0f] text-[#e8e8e8] transition-colors">
                            Mark as pending
                        </button>
                        <button className="text-xs px-2 py-1 rounded border border-[#1a1a1a] hover:bg-[#0f0f0f] text-[#e8e8e8] transition-colors">
                            Ignore
                        </button>
                    </div>
                </div>
            </div>

            {/* Collapsible Details */}
            <div className="mt-2">
                <button
                    onClick={onToggleDetails}
                    className="text-xs text-[#666] hover:text-[#999] transition-colors flex items-center gap-1"
                >
                    <svg
                        className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                    Details
                </button>
                {isExpanded && (
                    <div className="mt-2 pl-4 space-y-1 text-xs text-[#666]">
                        <div>• Payout ID: {mismatch.id}</div>
                        {mismatch.details && (
                            <div>• Source: {mismatch.details.payout?.id || 'N/A'}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// Mismatch Explainer Drawer
function MismatchExplainerDrawer({
    mismatch,
    onClose,
    formatAmount,
    formatDate,
    bankDeposits,
}: {
    mismatch: any
    onClose: () => void
    formatAmount: (amount: number) => string
    formatDate: (date: string) => string
    bankDeposits: Array<{ date: string; description: string; amount: number }>
}) {
    if (!mismatch) return null

    // Find closest bank deposits by amount
    const closestDeposits = bankDeposits
        .map(dep => ({
            ...dep,
            amountDiff: Math.abs(dep.amount - mismatch.amount),
        }))
        .sort((a, b) => a.amountDiff - b.amountDiff)
        .slice(0, 3)

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-[#0f0f0f] border-l border-[#1a1a1a] shadow-xl z-50 overflow-y-auto">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-[#e8e8e8]">Why?</h3>
                    <button
                        onClick={onClose}
                        className="text-[#666] hover:text-[#999] transition-colors"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Mismatch Info */}
                <div className="border border-[#1a1a1a] rounded-lg p-4 space-y-3">
                    <div>
                        <div className="text-xs text-[#666] mb-1">Expected from {mismatch.platform}</div>
                        <div className="text-sm font-medium text-[#e8e8e8]">
                            {mismatch.date ? formatDate(mismatch.date) : '—'} •{' '}
                            {formatAmount(mismatch.amount)}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs text-[#666] mb-1">We checked your bank for:</div>
                        <ul className="text-xs text-[#999] space-y-1 ml-4 list-disc">
                            <li>Deposits between ±3 days</li>
                            <li>Amounts within £0.01</li>
                        </ul>
                    </div>

                    <div>
                        <div className="text-xs text-[#666] mb-1">Result</div>
                        <div className="text-xs text-[#999]">{mismatch.reasonMessage}</div>
                    </div>

                    {closestDeposits.length > 0 && (
                        <div>
                            <div className="text-xs text-[#666] mb-2">Closest deposits</div>
                            <div className="space-y-2">
                                {closestDeposits.map((dep, idx) => (
                                    <div
                                        key={idx}
                                        className="text-xs text-[#999] border border-[#1a1a1a] rounded px-2 py-1"
                                    >
                                        {dep.date ? formatDate(dep.date) : '—'} •{' '}
                                        {formatAmount(dep.amount)}
                                        <div className="text-[10px] text-[#666] mt-0.5">
                                            {dep.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                    <button className="w-full px-3 py-2 text-xs border border-[#1a1a1a] rounded hover:bg-[#0a0a0a] text-[#e8e8e8] transition-colors">
                        Match to a deposit
                    </button>
                    <button className="w-full px-3 py-2 text-xs border border-[#1a1a1a] rounded hover:bg-[#0a0a0a] text-[#e8e8e8] transition-colors">
                        Mark as expected later
                    </button>
                    <button className="w-full px-3 py-2 text-xs border border-[#1a1a1a] rounded hover:bg-[#0a0a0a] text-[#e8e8e8] transition-colors">
                        Ignore this payout
                    </button>
                </div>
            </div>
        </div>
    )
}

// Resolve Deposit Drawer Component
function ResolveDepositDrawer({
    deposit,
    onClose,
    formatAmount,
    formatDate,
    platforms,
    onResolve,
}: {
    deposit: { date: string; description: string; amount: number }
    onClose: () => void
    formatAmount: (amount: number) => string
    formatDate: (date: string) => string
    platforms: Array<{
        name: string
        mismatches: Array<{
            id: string
            date: string | null
            amount: number
            description: string
        }>
    }>
    onResolve: (action: string, data?: any) => void
}) {
    // Detect platform from description
    const descriptionLower = deposit.description.toLowerCase()
    const detectedPlatform =
        descriptionLower.includes('stripe')
            ? 'stripe'
            : descriptionLower.includes('shopify')
            ? 'shopify'
            : descriptionLower.includes('amazon') || descriptionLower.includes('amzn')
            ? 'amazon'
            : descriptionLower.includes('paypal')
            ? 'paypal'
            : null

    // Find suggested matches (same platform, amount within £0.01, date within ±3 days)
    const suggestedMatches = platforms
        .flatMap(p => p.mismatches)
        .filter(m => {
            if (!m.date) return false
            const amountDiff = Math.abs(m.amount - deposit.amount)
            if (amountDiff > 0.01) return false

            try {
                const depositDate = new Date(deposit.date)
                const mismatchDate = new Date(m.date)
                const daysDiff = Math.abs(
                    (depositDate.getTime() - mismatchDate.getTime()) / (1000 * 60 * 60 * 24)
                )
                return daysDiff <= 3
            } catch {
                return false
            }
        })
        .slice(0, 3)

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-[#0f0f0f] border-l border-[#1a1a1a] shadow-xl z-50 overflow-y-auto">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-[#e8e8e8]">Resolve deposit</h3>
                    <button
                        onClick={onClose}
                        className="text-[#666] hover:text-[#999] transition-colors"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Deposit Info */}
                <div className="border border-[#1a1a1a] rounded-lg p-4 space-y-2">
                    <div className="text-xs text-[#666]">Bank deposit</div>
                    <div className="text-sm font-medium text-[#e8e8e8]">
                        {deposit.date ? formatDate(deposit.date) : '—'} •{' '}
                        {formatAmount(deposit.amount)}
                    </div>
                    <div className="text-xs text-[#999]">{deposit.description}</div>
                </div>

                {/* Detected Platform */}
                {detectedPlatform && (
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3">
                        <div className="text-xs text-[#666] mb-1">Detected platform</div>
                        <div className="text-sm text-[#e8e8e8] capitalize">{detectedPlatform}</div>
                    </div>
                )}

                {/* Suggested Matches */}
                {suggestedMatches.length > 0 && (
                    <div>
                        <div className="text-xs font-medium text-[#e8e8e8] mb-2">
                            Suggested matches
                        </div>
                        <div className="space-y-2">
                            {suggestedMatches.map((match, idx) => (
                                <div
                                    key={idx}
                                    className="border border-[#1a1a1a] rounded-lg p-3 hover:bg-[#0a0a0a] transition-colors cursor-pointer"
                                    onClick={() => onResolve('match_to_payout', { payoutId: match.id })}
                                >
                                    <div className="text-xs text-[#e8e8e8] mb-1">
                                        {match.description}
                                    </div>
                                    <div className="text-xs text-[#666]">
                                        {match.date ? formatDate(match.date) : '—'} •{' '}
                                        {formatAmount(match.amount)}
                                    </div>
                                    <div className="text-[10px] text-[#00D4A3] mt-1">Confidence: High</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div>
                    <div className="text-xs font-medium text-[#e8e8e8] mb-2">
                        What should this be matched to?
                    </div>
                    <div className="space-y-2">
                        {detectedPlatform && (
                            <button
                                onClick={() =>
                                    onResolve('assign_to_platform', { platform: detectedPlatform })
                                }
                                className="w-full px-3 py-2 text-xs border border-[#1a1a1a] rounded hover:bg-[#0a0a0a] text-[#e8e8e8] transition-colors text-left"
                            >
                                Assign to {detectedPlatform} (no payout)
                            </button>
                        )}
                        <button
                            onClick={() => onResolve('match_to_different')}
                            className="w-full px-3 py-2 text-xs border border-[#1a1a1a] rounded hover:bg-[#0a0a0a] text-[#e8e8e8] transition-colors text-left"
                        >
                            Match to a different payout
                        </button>
                        <button
                            onClick={() => onResolve('mark_as_other_income')}
                            className="w-full px-3 py-2 text-xs border border-[#1a1a1a] rounded hover:bg-[#0a0a0a] text-[#e8e8e8] transition-colors text-left"
                        >
                            Mark as non-platform income
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full px-3 py-2 text-xs border border-[#1a1a1a] rounded hover:bg-[#0a0a0a] text-[#e8e8e8] transition-colors text-left"
                        >
                            Leave unresolved
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LinearReconciliationResults
