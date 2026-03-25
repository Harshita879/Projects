import { differenceInCalendarDays } from "date-fns";

type BankDeposit = {
  key: string;
  date: Date | null;
  dateStr?: string;
  amount_minor: number;
  description: string;
};

type Payout = {
  id: string;
  date: Date | null;
  amount_minor: number;
  currency?: string;
};

type BalanceTxn = {
  payout_id: string | null;
  gross_minor?: number;
  fee_minor?: number;
  net_minor?: number;
};

function money(minor: number) {
  const sign = minor < 0 ? "-" : "";
  const abs = Math.abs(minor);
  return `${sign}£${(abs / 100).toFixed(2)}`;
}

function assertFinite(n: any, label: string) {
  if (typeof n !== "number" || !Number.isFinite(n)) {
    throw new Error(`AUDIT_NOT_FINITE: ${label} value=${JSON.stringify(n)}`);
  }
  return n;
}

function findBankExact(bank: BankDeposit[], used: Set<string>, payout: Payout) {
  for (const d of bank) {
    if (used.has(d.key)) continue;
    if (!d.date || !payout.date) continue;
    const sameDay = d.date.toISOString().slice(0, 10) === payout.date.toISOString().slice(0, 10);
    if (!sameDay) continue;
    if (d.amount_minor === payout.amount_minor) return d;
  }
  return null;
}

function findBankClosest(bank: BankDeposit[], payout: Payout) {
  const out = bank.map(d => {
    const dayDelta =
      payout.date && d.date ? Math.abs(differenceInCalendarDays(d.date, payout.date)) : null;
    const amountDelta = d.amount_minor - payout.amount_minor;
    return { key: d.key, desc: d.description, date: d.date?.toISOString().slice(0,10) ?? null, amount_minor: d.amount_minor, dayDelta, amountDelta };
  }).sort((a,b) => {
    const ad = Math.abs(a.amountDelta);
    const bd = Math.abs(b.amountDelta);
    if (ad !== bd) return ad - bd;
    return (a.dayDelta ?? 999) - (b.dayDelta ?? 999);
  });
  return out.slice(0, 5);
}

export function runReconAudit(args: {
  bankDeposits: BankDeposit[];
  platforms: Array<{
    platform: string;
    payouts: Payout[];
    balanceTxns?: BalanceTxn[];
  }>;
  resultSummary?: { totalExpected: number; totalReceived: number; totalVariance: number };
}) {
  const report: any = { bank: {}, platforms: [], summary: {} };

  // Bank stats
  const bankTotal = assertFinite(args.bankDeposits.reduce((s,d)=>s + d.amount_minor, 0), "bank.total");
  report.bank = {
    deposit_count: args.bankDeposits.length,
    total_minor: bankTotal,
    total: money(bankTotal),
    sample: args.bankDeposits.slice(0, 5).map(d => ({
      key: d.key,
      date: d.date?.toISOString().slice(0,10) ?? null,
      amount: money(d.amount_minor),
      desc: d.description
    })),
  };

  // Per-platform audits
  let platformsExpected = 0;

  for (const p of args.platforms) {
    const used = new Set<string>();

    const expectedTotal = assertFinite(p.payouts.reduce((s,x)=>s + x.amount_minor, 0), `${p.platform}.expectedTotal`);
    platformsExpected += expectedTotal;

    // bank <-> payout exact match check
    const matches = [];
    const unmatched = [];
    for (const pay of p.payouts) {
      const exact = findBankExact(args.bankDeposits, used, pay);
      if (exact) {
        used.add(exact.key);
        matches.push({ payout_id: pay.id, payout_date: pay.date?.toISOString().slice(0,10) ?? null, payout_amount: money(pay.amount_minor), bank_key: exact.key, bank_desc: exact.description });
      } else {
        unmatched.push({
          payout_id: pay.id,
          payout_date: pay.date?.toISOString().slice(0,10) ?? null,
          payout_amount: money(pay.amount_minor),
          closest: findBankClosest(args.bankDeposits, pay),
        });
      }
    }

    // payout <-> balance tie-out check (if provided)
    let tieout: any[] = [];
    if (p.balanceTxns?.length) {
      const byPayout = new Map<string, { gross: number; fee: number; net: number; n: number }>();
      for (const t of p.balanceTxns) {
        if (!t.payout_id) continue;
        const cur = byPayout.get(t.payout_id) ?? { gross: 0, fee: 0, net: 0, n: 0 };
        cur.gross += (t.gross_minor ?? 0);
        cur.fee += (t.fee_minor ?? 0);
        cur.net += (t.net_minor ?? 0);
        cur.n += 1;
        byPayout.set(t.payout_id, cur);
      }

      tieout = p.payouts.map(pay => {
        const agg = byPayout.get(pay.id) ?? { gross: 0, fee: 0, net: 0, n: 0 };
        return {
          payout_id: pay.id,
          payout_amount: money(pay.amount_minor),
          balance_count: agg.n,
          balance_gross: money(agg.gross),
          balance_fee: money(agg.fee),
          balance_net: money(agg.net),
          payout_minus_balance_net: money(pay.amount_minor - agg.net),
        };
      });
    }

    report.platforms.push({
      platform: p.platform,
      payout_count: p.payouts.length,
      expected_total: money(expectedTotal),
      expected_total_minor: expectedTotal,
      bank_match: {
        matched: matches.length,
        unmatched: unmatched.length,
        unmatched_samples: unmatched.slice(0, 5),
      },
      payout_balance_tieout_samples: tieout.slice(0, 5),
      payout_balance_tieout_all_mismatches: tieout.filter(x => x.payout_minus_balance_net !== money(0)),
    });
  }

  // Summary recompute check
  const diff = assertFinite(bankTotal - platformsExpected, "summary.diff");
  report.summary = {
    bank_total: money(bankTotal),
    platforms_expected: money(platformsExpected),
    computed_difference: money(diff),
    computed_platforms_expected_minor: platformsExpected,
    computed_difference_minor: diff,
    result_summary: args.resultSummary ?? null,
  };

  console.log("[RECON_AUDIT_REPORT]", report);
  return report;
}

