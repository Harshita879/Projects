'use client';

import { ReconciliationResult, PayoutMatch, Platform } from '@/lib/types';
import { formatMoney, formatDateShort } from '@/lib/utils';
import { getClearingAccountCode, getAccount } from '@/lib/accountCodes';

interface AccountingViewTabProps {
  result: ReconciliationResult;
}

interface JournalEntry {
  id: string;
  date: Date | null;
  description: string;
  lines: JournalEntryLine[];
  balanced: boolean;
  total_debit: number;
  total_credit: number;
  metadata: {
    platform: Platform;
    payout_id: string;
    bank_transaction_key?: string;
    status: 'MATCHED' | 'UNMATCHED';
    underlying_count?: number;
  };
}

interface JournalEntryLine {
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  description: string;
}

export default function AccountingViewTab({ result }: AccountingViewTabProps) {
  // Generate journal entries from matched payouts
  const journalEntries = generateJournalEntriesFromMatches(result);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-6">
        <h2 className="text-lg font-medium mb-2">Accounting Entries</h2>
        <p className="text-sm text-[#666]">
          Journal entries showing payout to bank account reconciliation
        </p>
        <div className="mt-4 flex gap-6 text-sm">
          <div>
            <span className="text-[#666]">Total Entries: </span>
            <span className="text-[#e8e8e8] font-medium">{journalEntries.length}</span>
          </div>
          <div>
            <span className="text-[#666]">Balanced: </span>
            <span className="text-[#00D4A3] font-medium">
              {journalEntries.filter(je => je.balanced).length}
            </span>
          </div>
          <div>
            <span className="text-[#666]">Unbalanced: </span>
            <span className="text-[#ff4444] font-medium">
              {journalEntries.filter(je => !je.balanced).length}
            </span>
          </div>
        </div>
      </div>

      {/* Journal Entries */}
      <div className="space-y-4">
        {journalEntries.length === 0 ? (
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-8 text-center">
            <p className="text-[#666]">No matched payouts found. Journal entries are only generated for matched payouts.</p>
          </div>
        ) : (
          journalEntries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} />
          ))
        )}
      </div>

      {/* Export Options */}
      {journalEntries.length > 0 && (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-6">
          <h3 className="text-sm font-medium mb-3">Export Options</h3>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] rounded text-sm transition-colors">
              Export to CSV
            </button>
            <button className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] rounded text-sm transition-colors">
              Export to Xero Format
            </button>
            <button className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] rounded text-sm transition-colors">
              Export to QuickBooks Format
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  return (
    <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium">{entry.id}</h3>
            {entry.date && (
              <span className="text-xs text-[#666]">{formatDateShort(entry.date)}</span>
            )}
            <StatusBadge status={entry.metadata.status} />
          </div>
          <p className="text-sm text-[#666] mt-1">{entry.description}</p>
        </div>
        <div className="text-right">
          {entry.balanced ? (
            <div className="text-[#00D4A3] text-xs font-medium">✓ BALANCED</div>
          ) : (
            <div className="text-[#ff4444] text-xs font-medium">✗ UNBALANCED</div>
          )}
        </div>
      </div>

      {/* Journal Entry Lines Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0a0a0a] text-[#666] text-xs uppercase">
            <tr>
              <th className="text-left px-6 py-3 font-medium">Account Code</th>
              <th className="text-left px-6 py-3 font-medium">Account Name</th>
              <th className="text-right px-6 py-3 font-medium">Debit</th>
              <th className="text-right px-6 py-3 font-medium">Credit</th>
              <th className="text-left px-6 py-3 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {entry.lines.map((line, idx) => (
              <tr key={idx} className="border-b border-[#1a1a1a] hover:bg-[#0a0a0a]">
                <td className="px-6 py-3 text-sm font-mono">{line.account_code}</td>
                <td className="px-6 py-3 text-sm">{line.account_name}</td>
                <td className="px-6 py-3 text-sm text-right font-mono">
                  {line.debit > 0 ? formatMoney(line.debit) : '—'}
                </td>
                <td className="px-6 py-3 text-sm text-right font-mono">
                  {line.credit > 0 ? formatMoney(line.credit) : '—'}
                </td>
                <td className="px-6 py-3 text-sm text-[#666]">{line.description}</td>
              </tr>
            ))}
            {/* Totals Row */}
            <tr className="bg-[#0a0a0a] font-medium">
              <td className="px-6 py-3 text-sm" colSpan={2}>Total</td>
              <td className="px-6 py-3 text-sm text-right font-mono">
                {formatMoney(entry.total_debit)}
              </td>
              <td className="px-6 py-3 text-sm text-right font-mono">
                {formatMoney(entry.total_credit)}
              </td>
              <td className="px-6 py-3"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Metadata Footer */}
      <div className="px-6 py-4 bg-[#0a0a0a] border-t border-[#1a1a1a]">
        <div className="flex gap-6 text-xs text-[#666]">
          <div>
            <span>Platform: </span>
            <span className="text-[#e8e8e8] capitalize">{entry.metadata.platform}</span>
          </div>
          <div>
            <span>Payout ID: </span>
            <span className="text-[#e8e8e8] font-mono">{entry.metadata.payout_id}</span>
          </div>
          {entry.metadata.underlying_count !== undefined && (
            <div>
              <span>Underlying transactions: </span>
              <span className="text-[#e8e8e8]">{entry.metadata.underlying_count}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'MATCHED' | 'UNMATCHED' }) {
  return (
    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
      status === 'MATCHED' 
        ? 'bg-[#00D4A3]/10 text-[#00D4A3]'
        : 'bg-[#666]/10 text-[#666]'
    }`}>
      {status}
    </span>
  );
}

/**
 * Generate journal entries from reconciliation matches
 * Each matched payout → bank gets ONE journal entry
 */
function generateJournalEntriesFromMatches(result: ReconciliationResult): JournalEntry[] {
  const entries: JournalEntry[] = [];
  let entryCounter = 1;

  // Chart of accounts for mapping
  const ACCOUNTS = {
    bank: { code: '1000', name: 'Bank Account' },
    stripe_clearing: { code: '1200', name: 'Stripe Clearing Account' },
    amazon_clearing: { code: '1210', name: 'Amazon Clearing Account' },
    shopify_clearing: { code: '1220', name: 'Shopify Clearing Account' },
  };

  result.platforms.forEach(platform => {
    platform.matches.forEach(match => {
      if (match.status !== 'MATCHED') return; // Only matched entries

      const clearingAccount = ACCOUNTS[`${platform.platform}_clearing` as keyof typeof ACCOUNTS];
      if (!clearingAccount) return; // Skip if platform not supported

      const amount = match.payout.amount;
      const platformName = platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1);

      const entry: JournalEntry = {
        id: `JE-${String(entryCounter).padStart(3, '0')}`,
        date: match.payout.date,
        description: `${platformName} payout ${match.payout.id} → Bank deposit`,
        lines: [
          {
            account_code: ACCOUNTS.bank.code,
            account_name: ACCOUNTS.bank.name,
            debit: amount,
            credit: 0,
            description: 'Payout received in bank'
          },
          {
            account_code: clearingAccount.code,
            account_name: clearingAccount.name,
            debit: 0,
            credit: amount,
            description: `Payout from ${platform.platform}`
          }
        ],
        balanced: true,
        total_debit: amount,
        total_credit: amount,
        metadata: {
          platform: platform.platform,
          payout_id: match.payout.id,
          bank_transaction_key: match.bank?._key,
          status: 'MATCHED',
          underlying_count: platform.pre_payout_validation?.find(
            v => v.payout_id === match.payout.id
          )?.balance_txns_count
        }
      };

      entries.push(entry);
      entryCounter++;
    });
  });

  return entries;
}

