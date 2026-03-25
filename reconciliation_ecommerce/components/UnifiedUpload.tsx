'use client'

import { useState } from 'react'
import type { UploadState, Platform } from '@/lib/types'
import { PLATFORM_CONFIGS } from '@/lib/types'

interface Props {
    uploadState: UploadState
    onUploadChange: (state: UploadState) => void
    onReconcile: () => void
    loading: boolean
}

export default function UnifiedUpload({ uploadState, onUploadChange, onReconcile, loading }: Props) {
    const [expandedPlatforms, setExpandedPlatforms] = useState<Platform[]>(['stripe', 'amazon'])

    const handleBankFileChange = (file: File | null) => {
        onUploadChange({ ...uploadState, bankStatement: file })
    }

    const handlePlatformFileChange = (platform: Platform, fileType: string, file: File | null) => {
        const newPlatforms = { ...uploadState.platforms }
        if (!newPlatforms[platform]) {
            newPlatforms[platform] = {} as any
        }
        (newPlatforms[platform] as any)[fileType] = file
        onUploadChange({ ...uploadState, platforms: newPlatforms })
    }

    const togglePlatform = (platform: Platform) => {
        setExpandedPlatforms(prev =>
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        )
    }

    const canReconcile = uploadState.bankStatement && (
        (uploadState.platforms.stripe?.balanceTransactions && uploadState.platforms.stripe?.payouts) ||
        uploadState.platforms.amazon?.settlementReport
    )

    return (
        <div className="space-y-6">
            {/* Bank Statement - Required */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                        <BankIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Bank Statement</h2>
                        <p className="text-sm text-gray-500">Required — Upload your bank statement CSV</p>
                    </div>
                </div>

                <FileDropzone
                    file={uploadState.bankStatement}
                    onFileSelect={(f) => handleBankFileChange(f)}
                    accept=".csv"
                    placeholder="Drop bank statement CSV here or click to upload"
                />
            </div>

            {/* Payment Platforms */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Payment Platforms</h2>
                <p className="text-sm text-gray-500 mb-6">Upload files from each platform you use. Only upload for platforms you want to reconcile.</p>

                <div className="space-y-4">
                    {/* Stripe */}
                    <PlatformSection
                        platform="stripe"
                        config={PLATFORM_CONFIGS.stripe}
                        expanded={expandedPlatforms.includes('stripe')}
                        onToggle={() => togglePlatform('stripe')}
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <FileDropzone
                                label="Balance Transactions"
                                file={uploadState.platforms.stripe?.balanceTransactions || null}
                                onFileSelect={(f) => handlePlatformFileChange('stripe', 'balanceTransactions', f)}
                                accept=".csv"
                            />
                            <FileDropzone
                                label="Payouts"
                                file={uploadState.platforms.stripe?.payouts || null}
                                onFileSelect={(f) => handlePlatformFileChange('stripe', 'payouts', f)}
                                accept=".csv"
                            />
                        </div>
                    </PlatformSection>

                    {/* Amazon */}
                    <PlatformSection
                        platform="amazon"
                        config={PLATFORM_CONFIGS.amazon}
                        expanded={expandedPlatforms.includes('amazon')}
                        onToggle={() => togglePlatform('amazon')}
                    >
                        <FileDropzone
                            label="Settlement Report"
                            file={uploadState.platforms.amazon?.settlementReport || null}
                            onFileSelect={(f) => handlePlatformFileChange('amazon', 'settlementReport', f)}
                            accept=".csv"
                        />
                    </PlatformSection>

                    {/* PayPal - Coming Soon */}
                    <PlatformSection
                        platform="paypal"
                        config={PLATFORM_CONFIGS.paypal}
                        expanded={false}
                        onToggle={() => { }}
                        disabled
                    >
                        <p className="text-gray-400 text-sm">Coming soon</p>
                    </PlatformSection>
                </div>
            </div>

            {/* Reconcile Button */}
            <button
                onClick={onReconcile}
                disabled={!canReconcile || loading}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition ${canReconcile && !loading
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <Spinner /> Processing...
                    </span>
                ) : (
                    'Reconcile All Platforms'
                )}
            </button>
        </div>
    )
}

// Sub-components

function PlatformSection({
    platform,
    config,
    expanded,
    onToggle,
    disabled = false,
    children
}: {
    platform: Platform
    config: typeof PLATFORM_CONFIGS.stripe
    expanded: boolean
    onToggle: () => void
    disabled?: boolean
    children: React.ReactNode
}) {
    const colorClasses = {
        blue: 'bg-blue-600',
        orange: 'bg-orange-500',
        green: 'bg-green-600',
    }

    return (
        <div className={`border rounded-lg ${disabled ? 'opacity-50' : ''}`}>
            <button
                onClick={onToggle}
                disabled={disabled}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${colorClasses[config.color as keyof typeof colorClasses]} rounded flex items-center justify-center`}>
                        <span className="text-white text-xs font-bold">{config.name[0]}</span>
                    </div>
                    <span className="font-medium">{config.name}</span>
                    {disabled && <span className="text-xs bg-gray-200 px-2 py-1 rounded">Coming Soon</span>}
                </div>
                <ChevronIcon className={`w-5 h-5 transition ${expanded ? 'rotate-180' : ''}`} />
            </button>

            {expanded && !disabled && (
                <div className="p-4 pt-0 border-t bg-gray-50">
                    {children}
                </div>
            )}
        </div>
    )
}

function FileDropzone({
    label,
    file,
    onFileSelect,
    accept,
    placeholder = 'Drop file here or click to upload'
}: {
    label?: string
    file: File | null
    onFileSelect: (file: File | null) => void
    accept: string
    placeholder?: string
}) {
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) onFileSelect(droppedFile)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) onFileSelect(selectedFile)
    }

    const inputId = `file-${label || Math.random()}`

    return (
        <div>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`border-2 border-dashed rounded-lg p-4 text-center transition cursor-pointer hover:border-blue-400 ${file ? 'border-green-400 bg-green-50' : 'border-gray-300'
                    }`}
            >
                <input
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    className="hidden"
                    id={inputId}
                />
                <label htmlFor={inputId} className="cursor-pointer">
                    {file ? (
                        <div className="flex items-center justify-center gap-2 text-green-700">
                            <CheckIcon className="w-5 h-5" />
                            <span className="text-sm">{file.name}</span>
                            <button
                                onClick={(e) => { e.preventDefault(); onFileSelect(null) }}
                                className="text-red-500 hover:text-red-700 ml-2"
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-500">{placeholder}</span>
                    )}
                </label>
            </div>
        </div>
    )
}

// Icon components
function BankIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l9-4 9 4M3 6v14h18V6M3 6l9 4 9-4" /></svg>
}

function ChevronIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
}

function CheckIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
}

function Spinner() {
    return <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
}
