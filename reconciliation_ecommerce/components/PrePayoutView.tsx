'use client';

import { useState } from 'react';
import { PrePayoutValidation } from '@/lib/types';
import { formatMoney } from '@/lib/utils';

interface PrePayoutViewProps {
  validations: PrePayoutValidation[];
}

export default function PrePayoutView({ validations }: PrePayoutViewProps) {
  const [expandedPayouts, setExpandedPayouts] = useState<Set<string>>(new Set());

  function togglePayout(payoutId: string) {
    const newExpanded = new Set(expandedPayouts);
    if (newExpanded.has(payoutId)) {
      newExpanded.delete(payoutId);
    } else {
      newExpanded.add(payoutId);
    }
    setExpandedPayouts(newExpanded);
  }

  const mismatches = validations.filter(v => !v.matches);

  if (mismatches.length === 0) {
    return (
      <div>
        <h3 className="text-xs font-medium text-[#666] uppercase tracking-wide mb-2">
          Pre-Payout Validation
        </h3>
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded p-3 text-sm text-[#00D4A3]">
          ✓ All payouts match balance transactions
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-medium text-[#666] uppercase tracking-wide mb-2">
        Pre-Payout Validation
      </h3>
      <div className="space-y-1">
        {mismatches.map((validation) => (
          <div key={validation.payout_id}>
            <button
              onClick={() => togglePayout(validation.payout_id)}
              className="w-full text-left bg-[#0f0f0f] border border-[#1a1a1a] rounded p-3 hover:bg-[#1a1a1a] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium">Payout {validation.payout_id}</div>
                  <div className="text-xs text-[#ff4444] mt-1">
                    Variance: {formatMoney(Math.abs(validation.variance_minor))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-mono">{formatMoney(validation.payout_amount_minor)}</div>
                  <svg
                    className={`w-4 h-4 text-[#666] transition-transform ${
                      expandedPayouts.has(validation.payout_id) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {expandedPayouts.has(validation.payout_id) && (
              <div className="mt-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Payout Amount</span>
                  <span className="font-mono">{formatMoney(validation.payout_amount_minor)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Balance Txns Sum</span>
                  <span className="font-mono">{formatMoney(validation.balance_txns_net_sum_minor)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium pt-2 border-t border-[#1a1a1a]">
                  <span>Variance</span>
                  <span className="font-mono text-[#ff4444]">
                    {formatMoney(Math.abs(validation.variance_minor))}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#1a1a1a]">
                  <div className="text-xs text-[#666] mb-2">
                    Balance Transactions ({validation.balance_txns_count})
                  </div>
                  <div className="space-y-1">
                    {validation.balance_txns.map((txn) => (
                      <div key={txn.id} className="flex justify-between text-xs">
                        <span className="text-[#666]">{txn.type}</span>
                        <div className="flex gap-3">
                          <span className="font-mono w-16 text-right">{formatMoney(txn.amount_minor)}</span>
                          <span className="font-mono w-16 text-right text-[#ff4444]">−{formatMoney(txn.fee_minor)}</span>
                          <span className="font-mono w-16 text-right">{formatMoney(txn.net_minor)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

