'use client';

import { useState } from 'react';
import { UploadState, ReconciliationResult, ManualOverride, Platform } from '@/lib/types';
import { runReconciliation } from '@/lib/reconciliation';
import ColumnMapper from '@/components/ColumnMapper';
import ReconciliationResults from '@/components/ReconciliationResults';
import { PLATFORM_CONFIGS, BANK_CONFIG } from '@/lib/platformConfigs';
import { readCSVHeaders } from '@/lib/csvParser';

export default function Home() {
  const [uploadState, setUploadState] = useState<UploadState>({
    bank: {
      file: null,
      headers: [],
      columnMap: {}
    },
    stripe: {
      balance: { file: null, headers: [], columnMap: {} },
      payouts: { file: null, headers: [], columnMap: {} }
    },
    amazon: {
      settlement: { file: null, headers: [], columnMap: {} }
    },
    shopify: {
      balance: { file: null, headers: [], columnMap: {} },
      payouts: { file: null, headers: [], columnMap: {} }
    }
  });

  const [manualOverrides, setManualOverrides] = useState<ManualOverride[]>([]);
  const [results, setResults] = useState<ReconciliationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<Platform>>(new Set());

  // Toggle platform expansion
  function togglePlatform(platform: Platform) {
    const newExpanded = new Set(expandedPlatforms);
    if (newExpanded.has(platform)) {
      newExpanded.delete(platform);
    } else {
      newExpanded.add(platform);
    }
    setExpandedPlatforms(newExpanded);
  }

  // File upload handlers
  async function handleBankUpload(file: File) {
    try {
      const headers = await readCSVHeaders(file);
      setUploadState(prev => ({
        ...prev,
        bank: { file, headers, columnMap: {} }
      }));
    } catch (err) {
      setError('Failed to read bank statement file');
      console.error(err);
    }
  }

  async function handlePlatformFileUpload(
    platform: Platform,
    fileType: 'balance' | 'payouts' | 'settlement',
    file: File
  ) {
    try {
      const delimiter = platform === 'amazon' ? '\t' : ',';
      const headers = await readCSVHeaders(file, delimiter);
      
      setUploadState(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          [fileType]: { file, headers, columnMap: {} }
        }
      }));
    } catch (err) {
      setError(`Failed to read ${platform} file`);
      console.error(err);
    }
  }

  // Column mapping handlers
  function handleBankMappingComplete(columnMap: any) {
    setUploadState(prev => ({
      ...prev,
      bank: { ...prev.bank, columnMap }
    }));
  }

  function handlePlatformMappingComplete(
    platform: Platform,
    fileType: string,
    columnMap: any
  ) {
    setUploadState(prev => {
      const platformData = prev[platform];
      if (!platformData) return prev;
      
      return {
        ...prev,
        [platform]: {
          ...platformData,
          [fileType]: { 
            ...(platformData[fileType as keyof typeof platformData] as any),
            columnMap 
          }
        }
      };
    });
  }

  // Reconciliation
  async function handleReconcile() {
    if (!uploadState.bank.file) {
      setError('Please upload a bank statement');
      return;
    }

    const hasPlatformFiles = 
      (uploadState.stripe?.balance?.file && uploadState.stripe?.payouts?.file) ||
      uploadState.amazon?.settlement?.file ||
      (uploadState.shopify?.balance?.file && uploadState.shopify?.payouts?.file);

    if (!hasPlatformFiles) {
      setError('Please upload files for at least one platform');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await runReconciliation(uploadState, manualOverrides);
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reconciliation failed');
      console.error('Reconciliation error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Manual override handlers
  function handleManualMatch(payoutId: string, platform: Platform, bankKey: string) {
    const override: ManualOverride = {
      id: `${platform}-${payoutId}-${Date.now()}`,
      type: 'MATCH',
      payout_id: payoutId,
      platform,
      bank_key: bankKey,
      timestamp: new Date()
    };
    setManualOverrides(prev => [...prev, override]);
  }

  function handleIgnore(payoutId: string, platform: Platform, reason: string) {
    const override: ManualOverride = {
      id: `${platform}-${payoutId}-${Date.now()}`,
      type: 'IGNORE',
      payout_id: payoutId,
      platform,
      reason,
      timestamp: new Date()
    };
    setManualOverrides(prev => [...prev, override]);
  }

  function handleMarkPending(payoutId: string, platform: Platform, reason: string) {
    const override: ManualOverride = {
      id: `${platform}-${payoutId}-${Date.now()}`,
      type: 'PENDING',
      payout_id: payoutId,
      platform,
      reason,
      timestamp: new Date()
    };
    setManualOverrides(prev => [...prev, override]);
  }

  function handleResolveDeposit(bankKey: string, action: 'match' | 'other', payoutId?: string) {
    console.log('Resolve deposit:', { bankKey, action, payoutId });
  }

  // Show results view
  if (results) {
    return (
      <ReconciliationResults
        result={results}
        onManualMatch={handleManualMatch}
        onIgnore={handleIgnore}
        onMarkPending={handleMarkPending}
        onResolveDeposit={handleResolveDeposit}
      />
    );
  }

  // Show upload view
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#0f0f0f] px-8 py-6">
        <h1 className="text-3xl font-bold">E-commerce Reconciliation</h1>
        <p className="text-[#666] mt-1">
          Match all your payment platforms against your bank statement
        </p>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-[#ff4444]/10 border border-[#ff4444] text-[#ff4444] px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Bank Statement Upload */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg">
          <div className="p-6 border-b border-[#1a1a1a]">
            <h2 className="text-xl font-medium">Bank Statement</h2>
            <p className="text-[#666] text-sm mt-1">Required — Upload your bank statement CSV</p>
          </div>
          <div className="p-6">
            {!uploadState.bank.file ? (
              <label className="block border-2 border-dashed border-[#1a1a1a] rounded-lg p-8 text-center cursor-pointer hover:border-[#333] transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files?.[0] && handleBankUpload(e.target.files[0])}
                  className="hidden"
                />
                <div className="text-[#666]">Drop bank statement CSV here or click to upload</div>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[#0a0a0a] border border-[#1a1a1a] rounded p-4">
                  <div>
                    <div className="font-medium">{uploadState.bank.file.name}</div>
                    <div className="text-sm text-[#666]">
                      {uploadState.bank.headers.length} columns detected
                    </div>
                  </div>
                  <button
                    onClick={() => setUploadState(prev => ({ ...prev, bank: { file: null, headers: [], columnMap: {} } }))}
                    className="text-[#ff4444] text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>

                {uploadState.bank.headers.length > 0 && (
                  <ColumnMapper
                    file={uploadState.bank.file}
                    requiredFields={BANK_CONFIG.requiredFields}
                    optionalFields={BANK_CONFIG.optionalFields}
                    onMappingComplete={handleBankMappingComplete}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Platform Uploads */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg">
          <div className="p-6 border-b border-[#1a1a1a]">
            <h2 className="text-xl font-medium">Payment Platforms</h2>
            <p className="text-[#666] text-sm mt-1">
              Upload files from each platform you use. Only upload for platforms you want to reconcile.
            </p>
          </div>

          <div className="divide-y divide-[#1a1a1a]">
            {/* Stripe */}
            <PlatformSection
              platform="stripe"
              config={PLATFORM_CONFIGS.stripe}
              uploadState={uploadState}
              expanded={expandedPlatforms.has('stripe')}
              onToggle={() => togglePlatform('stripe')}
              onFileUpload={handlePlatformFileUpload}
              onMappingComplete={handlePlatformMappingComplete}
              onRemoveFile={(fileType) => {
                setUploadState(prev => ({
                  ...prev,
                  stripe: {
                    ...prev.stripe!,
                    [fileType]: { file: null, headers: [], columnMap: {} }
                  }
                }));
              }}
            />

            {/* Amazon */}
            <PlatformSection
              platform="amazon"
              config={PLATFORM_CONFIGS.amazon}
              uploadState={uploadState}
              expanded={expandedPlatforms.has('amazon')}
              onToggle={() => togglePlatform('amazon')}
              onFileUpload={handlePlatformFileUpload}
              onMappingComplete={handlePlatformMappingComplete}
              onRemoveFile={(fileType) => {
                setUploadState(prev => ({
                  ...prev,
                  amazon: {
                    ...prev.amazon!,
                    [fileType]: { file: null, headers: [], columnMap: {} }
                  }
                }));
              }}
            />

            {/* Shopify */}
            <PlatformSection
              platform="shopify"
              config={PLATFORM_CONFIGS.shopify}
              uploadState={uploadState}
              expanded={expandedPlatforms.has('shopify')}
              onToggle={() => togglePlatform('shopify')}
              onFileUpload={handlePlatformFileUpload}
              onMappingComplete={handlePlatformMappingComplete}
              onRemoveFile={(fileType) => {
                setUploadState(prev => ({
                  ...prev,
                  shopify: {
                    ...prev.shopify!,
                    [fileType]: { file: null, headers: [], columnMap: {} }
                  }
                }));
              }}
            />
          </div>
        </div>

        {/* Reconcile Button */}
        <div className="flex justify-end">
          <button
            onClick={handleReconcile}
            disabled={loading || !uploadState.bank.file}
            className={`px-6 py-3 rounded font-medium transition-colors ${
              loading || !uploadState.bank.file
                ? 'bg-[#1a1a1a] text-[#666] cursor-not-allowed'
                : 'bg-white text-black hover:bg-[#e8e8e8]'
            }`}
          >
            {loading ? 'Reconciling...' : 'Reconcile'}
          </button>
        </div>
      </div>
    </main>
  );
}

// Platform Section Component
function PlatformSection({
  platform,
  config,
  uploadState,
  expanded,
  onToggle,
  onFileUpload,
  onMappingComplete,
  onRemoveFile
}: {
  platform: Platform;
  config: any;
  uploadState: UploadState;
  expanded: boolean;
  onToggle: () => void;
  onFileUpload: (platform: Platform, fileType: any, file: File) => void;
  onMappingComplete: (platform: Platform, fileType: string, columnMap: any) => void;
  onRemoveFile: (fileType: string) => void;
}) {
  const platformData = uploadState[platform];

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-[#0a0a0a] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: config.color }}
          >
            {config.name[0]}
          </div>
          <div className="text-left">
            <div className="font-medium">{config.name}</div>
            <div className="text-sm text-[#666]">
              {config.files.map((f: any) => f.label).join(' • ')}
            </div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-[#666] transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-6">
          {config.files.map((fileConfig: any) => {
            const fileData = platformData?.[fileConfig.key as keyof typeof platformData] as any;

            return (
              <div key={fileConfig.key}>
                <h3 className="text-sm font-medium mb-3">{fileConfig.label}</h3>
                
                {!fileData?.file ? (
                  <label className="block border-2 border-dashed border-[#1a1a1a] rounded-lg p-6 text-center cursor-pointer hover:border-[#333] transition-colors">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onFileUpload(platform, fileConfig.key, file);
                      }}
                      className="hidden"
                    />
                    <div className="text-[#666] text-sm">Drop file here or click to upload</div>
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3">
                      <div className="text-sm">
                        <div className="font-medium">{fileData.file.name}</div>
                        <div className="text-[#666]">{fileData.headers.length} columns</div>
                      </div>
                      <button
                        onClick={() => onRemoveFile(fileConfig.key)}
                        className="text-[#ff4444] text-xs hover:underline"
                      >
                        Remove
                      </button>
                    </div>

                    {fileData.headers.length > 0 && (
                      <ColumnMapper
                        file={fileData.file}
                        requiredFields={fileConfig.requiredFields}
                        optionalFields={fileConfig.optionalFields}
                        onMappingComplete={(columnMap) => onMappingComplete(platform, fileConfig.key, columnMap)}
                        delimiter={fileConfig.delimiter}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
