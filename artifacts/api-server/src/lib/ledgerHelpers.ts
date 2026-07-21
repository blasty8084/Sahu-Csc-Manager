/**
 * Pure helpers for the ledger route: balance recalculation, receipt
 * numbering, IST date utilities, and shared query fragments.
 * Extracted from routes/ledger.ts so they can be unit-tested and reused.
 */
import { db, ledgerTable, receiptCountersTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { computeRunningBalances, formatReceiptNumber } from "./ledger-utils";

// ── IST date helpers ─────────────────────────────────────────────────────────
// India Standard Time is UTC+5:30 with no DST — a fixed offset is correct and
// avoids pulling in a full tz-database dependency.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Returns a Date whose UTC fields represent the current IST calendar values. */
export function nowInIST(): Date {
  return new Date(Date.now() + IST_OFFSET_MS);
}

/** Formats a Date (already IST-shifted via nowInIST) as YYYY-MM-DD. */
export function istDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

// ── Date range resolver ──────────────────────────────────────────────────────
export interface DateRange { startDate: string; endDate: string }

/**
 * Resolves a named period (today/yesterday/week/month/custom) into a concrete
 * ISO date string range anchored to the current IST calendar date.
 */
export function resolveDateRange(
  period: string,
  custom?: { startDate?: string; endDate?: string },
): DateRange {
  const today = nowInIST();
  if (period === "custom" && custom?.startDate && custom?.endDate) {
    return { startDate: custom.startDate, endDate: custom.endDate };
  }
  if (period === "yesterday") {
    const y = new Date(today);
    y.setUTCDate(y.getUTCDate() - 1);
    const s = istDateStr(y);
    return { startDate: s, endDate: s };
  }
  if (period === "week") {
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - 6);
    return { startDate: istDateStr(start), endDate: istDateStr(today) };
  }
  if (period === "month") {
    const y = today.getUTCFullYear();
    const m = String(today.getUTCMonth() + 1).padStart(2, "0");
    return { startDate: `${y}-${m}-01`, endDate: istDateStr(today) };
  }
  const s = istDateStr(today);
  return { startDate: s, endDate: s };
}

// ── Balance recalculation ────────────────────────────────────────────────────
/**
 * Locks all of a user's ledger rows (FOR UPDATE) within the caller's
 * transaction so concurrent PATCH/DELETE requests for the same user serialize.
 */
export async function lockUserEntries(tx: any, userId: number): Promise<void> {
  await tx.execute(sql`select id from ledger where created_by = ${userId} for update`);
}

/**
 * Recomputes running balances for every entry belonging to userId using a
 * single batched UNNEST UPDATE. Must be called after lockUserEntries within
 * the same transaction.
 */
export async function recalculateBalances(tx: any, userId: number): Promise<void> {
  const entries = (await tx
    .select({ id: ledgerTable.id, credit: ledgerTable.credit, debit: ledgerTable.debit })
    .from(ledgerTable)
    .where(eq(ledgerTable.createdBy, userId))
    .orderBy(ledgerTable.id)) as { id: number; credit: string | null; debit: string | null }[];
  if (entries.length === 0) return;
  const ids = entries.map((e) => e.id);
  const balances = computeRunningBalances(entries).map(String);
  const idsArray = sql.join(ids.map((id) => sql`${id}`), sql`,`);
  const balancesArray = sql.join(balances.map((b) => sql`${b}`), sql`,`);
  await tx.execute(sql`
    UPDATE ledger AS l SET balance = v.balance
    FROM (
      SELECT * FROM UNNEST(ARRAY[${idsArray}]::int[], ARRAY[${balancesArray}]::numeric[]) AS v(id, balance)
    ) AS v
    WHERE l.id = v.id
  `);
}

// ── Receipt number generation ────────────────────────────────────────────────
/** Atomically claims the next receipt sequence number for (userId, year). */
export async function generateReceiptNumber(
  tx: typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0],
  userId: number,
  year: number,
): Promise<string> {
  const [row] = await tx
    .insert(receiptCountersTable)
    .values({ userId, year, lastCount: 1 })
    .onConflictDoUpdate({
      target: [receiptCountersTable.userId, receiptCountersTable.year],
      set: { lastCount: sql`${receiptCountersTable.lastCount} + 1` },
    })
    .returning({ lastCount: receiptCountersTable.lastCount });
  return formatReceiptNumber(year, row.lastCount);
}

// ── Shared column set ────────────────────────────────────────────────────────
/** Drizzle column selection used by GET /ledger and GET /ledger/:id. */
export const entryColumns = {
  id: ledgerTable.id, date: ledgerTable.date, customerName: ledgerTable.customerName,
  serviceType: ledgerTable.serviceType, credit: ledgerTable.credit, debit: ledgerTable.debit,
  description: ledgerTable.description, balance: ledgerTable.balance, createdBy: ledgerTable.createdBy,
  createdAt: ledgerTable.createdAt, createdByName: usersTable.username,
  receiptNumber: ledgerTable.receiptNumber, receiptToken: ledgerTable.receiptToken,
};

// ── Entry formatter ──────────────────────────────────────────────────────────
/** Serialises a raw ledger DB row into the JSON shape the API returns. */
export function formatEntry(entry: any, createdByName?: string | null) {
  return {
    id: entry.id, date: entry.date, customerName: entry.customerName,
    serviceType: entry.serviceType,
    credit: parseFloat(entry.credit ?? "0"), debit: parseFloat(entry.debit ?? "0"),
    description: entry.description, balance: parseFloat(entry.balance ?? "0"),
    createdBy: entry.createdBy, createdByName: createdByName ?? null,
    receiptNumber: entry.receiptNumber ?? null, receiptToken: entry.receiptToken ?? null,
    createdAt: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : entry.createdAt,
  };
}

// ── Filter helper ────────────────────────────────────────────────────────────
/** Returns a drizzle WHERE condition scoping queries to a single user's entries. */
export function getUserFilter(userId: number) {
  return eq(ledgerTable.createdBy, userId);
}
