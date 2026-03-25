'use client';

import { formatMoney } from '@/lib/utils';

interface FeeBreakdownProps {
  breakdown: {
    total_gross_minor: number;
    total_fees_minor: number;
    total_net_minor: number;
    fee_details: Array<{
      type: string;
      amount_minor: number;
    }>;
  };
}

export default function FeeBreakdown({ breakdown }: FeeBreakdownProps) {
  return (
    <div>
      <h3 className="text-xs font-medium text-[#666] uppercase tracking-wide mb-2">
        Fee Breakdown
      </h3>
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded p-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#666]">Gross</span>
          <span className="font-mono">{formatMoney(breakdown.total_gross_minor)}</span>
        </div>
        
        {breakdown.fee_details.map((fee, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm pl-4">
            <span className="text-[#666]">— {fee.type}</span>
            <span className="font-mono text-[#ff4444]">
              −{formatMoney(fee.amount_minor)}
            </span>
          </div>
        ))}
        
        <div className="flex items-center justify-between text-sm pt-2 border-t border-[#1a1a1a] font-medium">
          <span>Net</span>
          <span className="font-mono">{formatMoney(breakdown.total_net_minor)}</span>
        </div>
      </div>
    </div>
  );
}

