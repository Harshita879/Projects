/**
 * VALIDATION UTILITIES
 * Pre-reconciliation validation with detailed error messages
 */

import type { UploadState } from './types'
import { getRequiredFields, getOptionalFields } from './columnAutoMapper'
import { readCsvHeaders, detectReportType } from './csvParser'
import { parseDateSafe } from './dateUtils'

export interface ValidationResult {
    valid: boolean
    errors: string[]
    warnings: string[]
}

/**
 * Validate upload state before reconciliation
 */
export async function validateFiles(uploadState: UploadState): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Check bank statement
    if (!uploadState.bankStatement) {
        errors.push('Bank statement file is required')
    }

    // Check at least one platform file
    const hasAnyPlatform = Object.values(uploadState.platforms || {}).some(platform =>
        Object.values(platform || {}).some((fileState: any) => fileState?.file)
    )

    if (!hasAnyPlatform) {
        errors.push('At least one platform file is required')
    }

    // Validate each platform
    const platforms = ['stripe', 'amazon', 'shopify'] as const
    for (const platform of platforms) {
        const platformFiles = uploadState.platforms[platform]
        if (!platformFiles) continue

        // Stripe
        if (platform === 'stripe') {
            if (platformFiles.balanceTransactions?.file) {
                const validation = await validatePlatformFile(
                    platformFiles.balanceTransactions.file,
                    platformFiles.balanceTransactions.columnMap,
                    platform,
                    'balanceTransactions'
                )
                errors.push(...validation.errors)
                warnings.push(...validation.warnings)

                // Check report type
                try {
                    const { reportType } = await readCsvHeaders(platformFiles.balanceTransactions.file)
                    if (reportType !== 'STRIPE_BALANCE' && reportType !== 'UNKNOWN') {
                        errors.push(
                            `Stripe Balance Transactions: Wrong file type detected (${reportType}). Expected STRIPE_BALANCE.`
                        )
                    }
                } catch (e: any) {
                    errors.push(`Stripe Balance Transactions: ${e.message}`)
                }
            }

            if (platformFiles.payouts?.file) {
                const validation = await validatePlatformFile(
                    platformFiles.payouts.file,
                    platformFiles.payouts.columnMap,
                    platform,
                    'payouts'
                )
                errors.push(...validation.errors)
                warnings.push(...validation.warnings)

                try {
                    const { reportType } = await readCsvHeaders(platformFiles.payouts.file)
                    if (reportType !== 'STRIPE_PAYOUTS' && reportType !== 'UNKNOWN') {
                        errors.push(
                            `Stripe Payouts: Wrong file type detected (${reportType}). Expected STRIPE_PAYOUTS.`
                        )
                    }
                } catch (e: any) {
                    errors.push(`Stripe Payouts: ${e.message}`)
                }
            }
        }

        // Amazon
        if (platform === 'amazon') {
            if (platformFiles.settlementReport?.file) {
                const validation = await validatePlatformFile(
                    platformFiles.settlementReport.file,
                    platformFiles.settlementReport.columnMap,
                    platform,
                    'settlementReport'
                )
                errors.push(...validation.errors)
                warnings.push(...validation.warnings)

                try {
                    const { reportType } = await readCsvHeaders(platformFiles.settlementReport.file)
                    if (reportType !== 'AMAZON_SETTLEMENT_V2' && reportType !== 'UNKNOWN') {
                        errors.push(
                            `Amazon Settlement: Wrong file type detected (${reportType}). Expected AMAZON_SETTLEMENT_V2.`
                        )
                    }
                } catch (e: any) {
                    errors.push(`Amazon Settlement: ${e.message}`)
                }
            }
        }

        // Shopify
        if (platform === 'shopify') {
            if (platformFiles.balanceTransactions?.file) {
                const validation = await validatePlatformFile(
                    platformFiles.balanceTransactions.file,
                    platformFiles.balanceTransactions.columnMap,
                    platform,
                    'balanceTransactions'
                )
                errors.push(...validation.errors)
                warnings.push(...validation.warnings)

                try {
                    const { reportType } = await readCsvHeaders(platformFiles.balanceTransactions.file)
                    if (reportType !== 'SHOPIFY_BALANCE_TXNS' && reportType !== 'UNKNOWN') {
                        errors.push(
                            `Shopify Balance Transactions: Wrong file type detected (${reportType}). Expected SHOPIFY_BALANCE_TXNS.`
                        )
                    }
                } catch (e: any) {
                    errors.push(`Shopify Balance Transactions: ${e.message}`)
                }
            }

            if (platformFiles.payouts?.file) {
                const validation = await validatePlatformFile(
                    platformFiles.payouts.file,
                    platformFiles.payouts.columnMap,
                    platform,
                    'payouts'
                )
                errors.push(...validation.errors)
                warnings.push(...validation.warnings)

                try {
                    const { reportType } = await readCsvHeaders(platformFiles.payouts.file)
                    if (reportType !== 'SHOPIFY_PAYOUTS' && reportType !== 'UNKNOWN') {
                        errors.push(
                            `Shopify Payouts: Wrong file type detected (${reportType}). Expected SHOPIFY_PAYOUTS.`
                        )
                    }
                } catch (e: any) {
                    errors.push(`Shopify Payouts: ${e.message}`)
                }
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    }
}

/**
 * Validate a single platform file
 */
async function validatePlatformFile(
    file: File,
    columnMap: Record<string, string>,
    platform: 'stripe' | 'amazon' | 'shopify',
    fileType: string
): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Check required fields are mapped
    const requiredFields = getRequiredFields(platform, fileType) || []
    const mappedFields = Object.keys(columnMap || {})
    const missingFields = Array.isArray(requiredFields) 
        ? requiredFields.filter(field => !mappedFields.includes(field))
        : []

    if (missingFields.length > 0) {
        errors.push(
            `${platform} ${fileType}: Missing required field mappings: ${missingFields.join(', ')}`
        )
    }

    // Test date parsing with sample data
    if (columnMap) {
        const dateFields = requiredFields.filter(f =>
            f.includes('date') || f.includes('created') || f.includes('available') || f.includes('processed')
        )

        for (const dateField of dateFields) {
            const csvHeader = columnMap[dateField]
            if (!csvHeader) continue

            // Try to read a sample row and test date parsing
            try {
                const { headers } = await readCsvHeaders(file)
                if (headers.includes(csvHeader)) {
                    // We can't easily test without parsing the full file, so we'll do a basic check
                    warnings.push(
                        `Date field "${dateField}" mapped to "${csvHeader}". Ensure this column contains valid dates (ISO, Unix timestamp, or common formats).`
                    )
                }
            } catch (e: any) {
                errors.push(`Cannot read headers from ${file.name}: ${e.message}`)
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    }
}

/**
 * Validate files (synchronous version for immediate checks)
 */
export function validateFilesSync(uploadState: UploadState): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!uploadState.bankStatement) {
        errors.push('Bank statement file is required')
    }

    const hasAnyPlatform = Object.values(uploadState.platforms || {}).some(platform =>
        Object.values(platform || {}).some((fileState: any) => fileState?.file)
    )

    if (!hasAnyPlatform) {
        errors.push('At least one platform file is required')
    }

    // Check mappings
    const platforms = ['stripe', 'amazon', 'shopify'] as const
    for (const platform of platforms) {
        const platformFiles = uploadState.platforms[platform]
        if (!platformFiles) continue

        const fileTypes = platform === 'stripe' 
            ? ['balanceTransactions', 'payouts']
            : platform === 'amazon'
            ? ['settlementReport']
            : ['balanceTransactions', 'payouts']

        for (const fileType of fileTypes) {
            const fileState = (platformFiles as any)[fileType]
            if (!fileState?.file) continue

            const requiredFields = getRequiredFields(platform, fileType) || []
            const mappedFields = Object.keys(fileState.columnMap || {})
            const missingFields = Array.isArray(requiredFields)
                ? requiredFields.filter(f => !mappedFields.includes(f))
                : []

            if (missingFields.length > 0) {
                errors.push(
                    `${platform} ${fileType}: Missing required field mappings: ${missingFields.join(', ')}`
                )
            }
            
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    }
}
