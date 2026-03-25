'use client';

import { useState } from 'react';
import { ReconciliationResult, PayoutMatch, Platform, PlatformReconciliation } from '@/lib/types';
import { formatMoney, formatDateShort } from '@/lib/utils';
import ManualMatchDrawer from './ManualMatchDrawer';
import PrePayoutView from './PrePayoutView';
import FeeBreakdown from './FeeBreakdown';
import AccountingViewTab from './AccountingViewTab';

interface ReconciliationResultsProps {
  result: ReconciliationResult;
  onManualMatch: (payoutId: string, platform: Platform, bankKey: string) => void;
  onIgnore: (payoutId: string, platform: Platform, reason: string) => void;
  onMarkPending: (payoutId: string, platform: Platform, reason: string) => void;
  onResolveDeposit: (bankKey: string, action: 'match' | 'other', payoutId?: string) => void;
}

export default function ReconciliationResults({
  result,
  onManualMatch,
  onIgnore,
  onMarkPending,
  onResolveDeposit
}: ReconciliationResultsProps) {
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<Platform>>(new Set());
  const [selectedMatch, setSelectedMatch] = useState<{platform: Platform; match: PayoutMatch} | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'accounting'>('summary');

  function togglePlatform(platform: Platform) {
    const newExpanded = new Set(expandedPlatforms);
    if (newExpanded.has(platform)) {
      newExpanded.delete(platform);
    } else {
      newExpanded.add(platform);
    }
    setExpandedPlatforms(newExpanded);
  }

  function handleMatchClick(platform: Platform, match: PayoutMatch) {
    if (match.status === 'UNMATCHED' || match.status === 'AMBIGUOUS') {
      setSelectedMatch({ platform, match });
      setDrawerOpen(true);
    }
  }

  const overallStatus = 
    result.summary.overall_match_rate === 1 ? 'Reconciled' :
    result.summary.overall_match_rate > 0.5 ? 'Partial' :
    'Needs Review';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8]">
      {/* Header with Tab Navigation */}
      <div className="border-b border-[#1a1a1a] bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Title */}
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-medium">Reconciliation Report</h1>
                <p className="text-[#666] text-sm mt-1">
                  {formatDateShort(result.period_start)} — {formatDateShort(result.period_end)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={overallStatus} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'summary'
                  ? 'text-[#e8e8e8] border-b-2 border-white'
                  : 'text-[#666] hover:text-[#e8e8e8]'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('accounting')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'accounting'
                  ? 'text-[#e8e8e8] border-b-2 border-white'
                  : 'text-[#666] hover:text-[#e8e8e8]'
              }`}
            >
              Accounting View
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
        {/* Summary Card */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-sm font-medium text-[#666] uppercase tracking-wide mb-4">
            Summary
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-[#666] text-xs mb-1">Bank Received</div>
              <div className="text-2xl font-mono">{formatMoney(result.summary.bank_total_minor)}</div>
              <div className="text-[#666] text-xs mt-1">{result.bank.deposit_count} deposits</div>
            </div>
            <div>
              <div className="text-[#666] text-xs mb-1">Platforms Sent</div>
              <div className="text-2xl font-mono">{formatMoney(result.summary.platforms_expected_total_minor)}</div>
              <div className="text-[#666] text-xs mt-1">{result.platforms.length} platforms</div>
            </div>
            <div>
              <div className="text-[#666] text-xs mb-1">Difference</div>
              <div className={`text-2xl font-mono ${
                result.summary.variance_minor === 0 ? 'text-[#00D4A3]' : 'text-[#ffaa00]'
              }`}>
                {formatMoney(result.summary.variance_minor)}
              </div>
              <div className="text-[#666] text-xs mt-1">
                {(result.summary.overall_match_rate * 100).toFixed(0)}% matched
              </div>
            </div>
          </div>
        </div>

        {/* Platforms */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg">
          <div className="p-4 border-b border-[#1a1a1a]">
            <h2 className="text-sm font-medium text-[#666] uppercase tracking-wide">
              Platforms
            </h2>
          </div>

          <table className="w-full">
            <thead className="bg-[#0a0a0a] text-[#666] text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Platform</th>
                <th className="text-right px-4 py-3">Payouts</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-right px-4 py-3">Status</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {result.platforms.map((platform) => (
                <PlatformRow
                  key={platform.platform}
                  platform={platform}
                  expanded={expandedPlatforms.has(platform.platform)}
                  onToggle={() => togglePlatform(platform.platform)}
                  onMatchClick={handleMatchClick}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Unallocated Deposits */}
        {result.unallocated.count > 0 && (
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg">
            <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-[#666] uppercase tracking-wide">
                  Unallocated Deposits
                </h2>
                <p className="text-[#666] text-xs mt-1">
                  {result.unallocated.count} deposits · {formatMoney(result.unallocated.total_minor)}
                </p>
              </div>
            </div>

            <table className="w-full">
              <thead className="bg-[#0a0a0a] text-[#666] text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Description</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {result.unallocated.deposits.map((deposit) => (
                  <tr
                    key={deposit._key}
                    className="border-b border-[#1a1a1a] hover:bg-[#0a0a0a] transition-colors"
                  >
                    <td className="px-4 py-3 text-sm">{formatDateShort(deposit.date)}</td>
                    <td className="px-4 py-3 text-sm">{deposit.description}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {formatMoney(deposit.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onResolveDeposit(deposit._key, 'match')}
                        className="px-3 py-1 bg-[#1a1a1a] hover:bg-[#222] rounded text-xs transition-colors"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
          </div>
        )}

        {activeTab === 'accounting' && (
          <AccountingViewTab result={result} />
        )}
      </div>

      {/* Manual Match Drawer */}
      {selectedMatch && (
        <ManualMatchDrawer
          open={drawerOpen}
          match={selectedMatch.match}
          platform={selectedMatch.platform}
          bankDeposits={result.bank.deposits}
          onClose={() => setDrawerOpen(false)}
          onMatch={(bankKey) => {
            onManualMatch(selectedMatch.match.payout.id, selectedMatch.platform, bankKey);
            setDrawerOpen(false);
          }}
          onIgnore={(reason) => {
            onIgnore(selectedMatch.match.payout.id, selectedMatch.platform, reason);
            setDrawerOpen(false);
          }}
          onMarkPending={(reason) => {
            onMarkPending(selectedMatch.match.payout.id, selectedMatch.platform, reason);
            setDrawerOpen(false);
          }}
        />
      )}
    </div>
  );
}


function PlatformRow({
  platform,
  expanded,
  onToggle,
  onMatchClick
}: {
  platform: PlatformReconciliation;
  expanded: boolean;
  onToggle: () => void;
  onMatchClick: (platform: Platform, match: PayoutMatch) => void;
}) {
  const status = 
    platform.match_rate === 1 ? 'Reconciled' :
    platform.match_rate > 0 ? 'Partial' :
    'Unmatched';

  return (
    <>
      <tr
        onClick={onToggle}
        className="border-b border-[#1a1a1a] hover:bg-[#0a0a0a] cursor-pointer transition-colors"
      >
        <td className="px-4 py-3 text-sm font-medium capitalize">{platform.platform}</td>
        <td className="px-4 py-3 text-sm text-right font-mono">
          {platform.match_count}/{platform.expected_count}
        </td>
        <td className="px-4 py-3 text-sm text-right font-mono">
          {formatMoney(platform.total_expected_minor)}
        </td>
        <td className="px-4 py-3 text-right">
          <StatusBadge status={status} />
        </td>
        <td className="px-4 py-3 text-right">
          <svg
            className={`w-4 h-4 text-[#666] transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={5} className="bg-[#0a0a0a] p-0">
            <div className="p-4 space-y-4">
              {/* Fee Breakdown */}
              <FeeBreakdown breakdown={platform.fee_breakdown} />

              {/* Payout Matches */}
              <div>
                <h3 className="text-xs font-medium text-[#666] uppercase tracking-wide mb-2">
                  Payout Details
                </h3>
                <div className="space-y-1">
                  {platform.matches.map((match: PayoutMatch) => (
                    <PayoutMatchRow
                      key={match.payout.id}
                      match={match}
                      onClick={() => onMatchClick(platform.platform, match)}
                    />
                  ))}
                </div>
              </div>

              {/* Pre-Payout Validation */}
              {platform.pre_payout_validation && platform.pre_payout_validation.length > 0 && (
                <PrePayoutView validations={platform.pre_payout_validation} />
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function PayoutMatchRow({
  match,
  onClick
}: {
  match: PayoutMatch;
  onClick: () => void;
}) {
  const isClickable = match.status === 'UNMATCHED' || match.status === 'AMBIGUOUS';

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`flex items-center justify-between px-3 py-2 bg-[#0f0f0f] border border-[#1a1a1a] rounded text-sm ${
        isClickable ? 'cursor-pointer hover:bg-[#1a1a1a]' : ''
      }`}
    >
      <div className="flex-1">
        <div className="font-medium">{match.payout.label}</div>
        {match.status !== 'MATCHED' && (
          <div className="text-[#666] text-xs mt-1">{match.reason.message}</div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="font-mono text-right">{formatMoney(match.payout.amount)}</div>
        <MatchStatusBadge status={match.status} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    'Reconciled': 'bg-[#00D4A3]/10 text-[#00D4A3]',
    'Partial': 'bg-[#ffaa00]/10 text-[#ffaa00]',
    'Unmatched': 'bg-[#666]/10 text-[#666]',
    'Needs Review': 'bg-[#ff4444]/10 text-[#ff4444]'
  };

  return (
    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-[#666]/10 text-[#666]'}`}>
      {status}
    </span>
  );
}

function MatchStatusBadge({ status }: { status: string }) {
  const colors = {
    'MATCHED': 'bg-[#00D4A3]/10 text-[#00D4A3]',
    'UNMATCHED': 'bg-[#666]/10 text-[#666]',
    'AMBIGUOUS': 'bg-[#ffaa00]/10 text-[#ffaa00]',
    'IGNORED': 'bg-[#666]/10 text-[#666]',
    'PENDING': 'bg-[#ffaa00]/10 text-[#ffaa00]'
  };

  const labels = {
    'MATCHED': 'Matched',
    'UNMATCHED': 'Unmatched',
    'AMBIGUOUS': 'Ambiguous',
    'IGNORED': 'Ignored',
    'PENDING': 'Pending'
  };

  return (
    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-[#666]/10 text-[#666]'}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

