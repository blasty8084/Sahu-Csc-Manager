/**
 * Pure utility functions extracted from ledger.ts so they can be unit-tested
 * independently of the database.  No imports from @workspace/* — these are
 * plain TypeScript functions with no side-effects.
 */

/**
 * Computes per-entry running balances for an ordered sequence of ledger rows.
 *
 * Each element in the returned array is the cumulative balance *after* that
 * entry: balance[i] = Σ(credit[0..i]) − Σ(debit[0..i]).
 *
 * Numeric DB columns arrive as strings from Drizzle — null/undefined coerce
 * to "0" before parseFloat so we never produce a silent NaN.
 */
export function computeRunningBalances(
  entries: { credit: string | null; debit: string | null }[],
): number[] {
  let running = 0;
  return entries.map((e) => {
    running += parseFloat(e.credit ?? "0") - parseFloat(e.debit ?? "0");
    return running;
  });
}

/**
 * Formats an atomically-generated sequence counter into the canonical
 * receipt-number format: CSC-YYYY-NNNN (4-digit zero-padded sequence).
 * Beyond 9999 the sequence grows naturally (no truncation).
 */
export function formatReceiptNumber(year: number, count: number): string {
  return `CSC-${year}-${String(count).padStart(4, "0")}`;
}
