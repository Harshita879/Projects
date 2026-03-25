'use client';

import { useState } from 'react';
import { PayoutMatch, BankTransaction, Platform } from '@/lib/types';
import { formatMoney, formatDateShort } from '@/lib/utils';

interface ManualMatchDrawerProps {
  open: boolean;
  match: PayoutMatch;
  platform: Platform;
  bankDeposits: BankTransaction[];
  onClose: () => void;
  onMatch: (bankKey: string) => void;
  onIgnore: (reason: string) => void;
  onMarkPending: (reason: string) => void;
}

export default function ManualMatchDrawer({
  open,
  match,
  platform,
  bankDeposits,
  onClose,
  onMatch,
  onIgnore,
  onMarkPending
}: ManualMatchDrawerProps) {
  const [activeTab, setActiveTab] = useState<'match' | 'ignore' | 'pending'>('match');
  const [reason, setReason] = useState('');
  const [selectedBankKey, setSelectedBankKey] = useState<string | null>(null);

  if (!open) return null;

  // Filter to similar deposits
  const candidateDeposits = match.candidates?.map(c => c.bank) || 
    bankDeposits.filter(b => 
      b.amount > 0 && 
      Math.abs(b.amount - match.payout.amount) < match.payout.amount * 0.1
    ).slice(0, 10);

  function handleSubmit() {
    if (activeTab === 'match' && selectedBankKey) {
      onMatch(selectedBankKey);
    } else if (activeTab === 'ignore') {
      onIgnore(reason || 'User ignored');
    } else if (activeTab === 'pending') {
      onMarkPending(reason || 'Marked as pending');
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[600px] bg-[#0f0f0f] border-l border-[#1a1a1a] z-50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Resolve Mismatch</h2>
            <button
              onClick={onClose}
              className="text-[#666] hover:text-[#e8e8e8] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-sm text-[#666]">{match.payout.label}</div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1a1a1a]">
          <button
            onClick={() => setActiveTab('match')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'match'
                ? 'text-[#e8e8e8] border-b-2 border-white'
                : 'text-[#666] hover:text-[#e8e8e8]'
            }`}
          >
            Match Manually
          </button>
          <button
            onClick={() => setActiveTab('ignore')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'ignore'
                ? 'text-[#e8e8e8] border-b-2 border-white'
                : 'text-[#666] hover:text-[#e8e8e8]'
            }`}
          >
            Ignore
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'pending'
                ? 'text-[#e8e8e8] border-b-2 border-white'
                : 'text-[#666] hover:text-[#e8e8e8]'
            }`}
          >
            Mark Pending
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'match' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Expected Payout</h3>
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">Date</span>
                    <span>{formatDateShort(match.payout.date)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">Amount</span>
                    <span className="font-mono">{formatMoney(match.payout.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">Platform</span>
                    <span className="capitalize">{platform}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Why Unmatched</h3>
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3 text-sm text-[#666]">
                  {match.reason.message}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Select Bank Deposit</h3>
                <div className="space-y-1">
                  {candidateDeposits.map((deposit) => (
                    <button
                      key={deposit._key}
                      onClick={() => setSelectedBankKey(deposit._key)}
                      className={`w-full text-left p-3 rounded border transition-colors ${
                        selectedBankKey === deposit._key
                          ? 'bg-white/5 border-white'
                          : 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm">{deposit.description}</div>
                          <div className="text-xs text-[#666] mt-1">
                            {formatDateShort(deposit.date)}
                          </div>
                        </div>
                        <div className="font-mono text-sm">{formatMoney(deposit.amount)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ignore' && (
            <div className="space-y-4">
              <p className="text-sm text-[#666]">
                Ignore this payout. It will not affect reconciliation totals.
              </p>
              <div>
                <label className="text-sm font-medium mb-2 block">Reason (optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="E.g., Already reconciled in previous period"
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3 text-sm resize-none focus:outline-none focus:border-[#0099FF]"
                  rows={4}
                />
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="space-y-4">
              <p className="text-sm text-[#666]">
                Mark this payout as pending. It will be highlighted for future reconciliation.
              </p>
              <div>
                <label className="text-sm font-medium mb-2 block">Reason (optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="E.g., Payment expected next week"
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3 text-sm resize-none focus:outline-none focus:border-[#0099FF]"
                  rows={4}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#1a1a1a] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#666] hover:text-[#e8e8e8] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={activeTab === 'match' && !selectedBankKey}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              (activeTab === 'match' && !selectedBankKey)
                ? 'bg-[#1a1a1a] text-[#666] cursor-not-allowed'
                : 'bg-white text-black hover:bg-[#e8e8e8]'
            }`}
          >
            {activeTab === 'match' ? 'Match' : activeTab === 'ignore' ? 'Ignore' : 'Mark Pending'}
          </button>
        </div>
      </div>
    </>
  );
}

