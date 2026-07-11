import { Router, type IRouter } from "express";
import { db, ledgerTable, usersTable, receiptCountersTable } from "@workspace/db";
import { eq, and, gte, lte, like, desc, count, sum, sql } from "drizzle-orm";
import {
  CreateLedgerEntryBody,
  UpdateLedgerEntryBody,
  ListLedgerEntriesQueryParams,
  GetLedgerSummaryQueryParams,
} from "@workspace/api-zod";
import { requireAuth, requireRole, requirePermission, auditLog, getClientIp } from "../lib/auth";
import { notifyLargeTransaction } from "../services/notificationTemplates";
import { signReceiptToken } from "../lib/jwt";
import { sanitize } from "../lib/sanitize";
import { invalidateLedgerCaches } from "../lib/query-cache";
import crypto from "crypto";
import { computeRunningBalances, formatReceiptNumber } from "../lib/ledger-utils";

const router: IRouter = Router();

function formatEntry(entry: any, createdByName?: string | null) {
  return {
    id: entry.id,
    date: entry.date,
    customerName: entry.customerName,
    serviceType: entry.serviceType,
    credit: parseFloat(entry.credit ?? "0"),
    debit: parseFloat(entry.debit ?? "0"),
    description: entry.description,
    balance: parseFloat(entry.balance ?? "0"),
    createdBy: entry.createdBy,
    createdByName: createdByName ?? null,
    receiptNumber: entry.receiptNumber ?? null,
    receiptToken: entry.receiptToken ?? null,
    createdAt: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : entry.createdAt,
  };
}

function getUserFilter(req: any) {
  const userId = req.session.userId!;
  return eq(ledgerTable.createdBy, userId);
}

// Balances are a running total per user, in creation order (matches how new entries
// are appended). Editing or deleting an entry can shift every later balance, so we
// recompute all of a user's balances whenever an entry changes. Must be called with
// a `tx` that already holds a row lock (see lockUserEntries) on the same user's rows
// obtained inside the same transaction as the mutation, so concurrent edits/deletes
// for the same user serialize instead of racing on stale snapshots.
async function recalculateBalances(tx: any, userId: number): Promise<void> {
  const entries = (await tx
    .select({ id: ledgerTable.id, credit: ledgerTable.credit, debit: ledgerTable.debit })
    .from(ledgerTable)
    .where(eq(ledgerTable.createdBy, userId))
    .orderBy(ledgerTable.id)) as { id: number; credit: string | null; debit: string | null }[];

  if (entries.length === 0) return;

  const ids = entries.map((e) => e.id);
  const balances = computeRunningBalances(entries).map(String);

  // Single batched UPDATE (was: one UPDATE per row in a loop) using UNNEST,
  // instead of N round-trips to the database. Arrays are built as fully bound
  // parameters (not string-interpolated literals) to avoid any SQL injection risk.
  const idsArray = sql.join(ids.map((id) => sql`${id}`), sql`,`);
  const balancesArray = sql.join(balances.map((b) => sql`${b}`), sql`,`);
  await tx.execute(sql`
    UPDATE ledger AS l
    SET balance = v.balance
    FROM (
      SELECT * FROM UNNEST(ARRAY[${idsArray}]::int[], ARRAY[${balancesArray}]::numeric[]) AS v(id, balance)
    ) AS v
    WHERE l.id = v.id
  `);
}

// Locks all of a user's ledger rows (FOR UPDATE) within the caller's transaction so
// concurrent PATCH/DELETE requests for the same user cannot interleave their reads
// and balance recomputation.
async function lockUserEntries(tx: any, userId: number): Promise<void> {
  await tx.execute(sql`select id from ledger where created_by = ${userId} for update`);
}

async function generateReceiptNumber(year: number): Promise<string> {
  const [row] = await db
    .insert(receiptCountersTable)
    .values({ year, lastCount: 1 })
    .onConflictDoUpdate({
      target: receiptCountersTable.year,
      set: { lastCount: sql`${receiptCountersTable.lastCount} + 1` },
    })
    .returning({ lastCount: receiptCountersTable.lastCount });
  return formatReceiptNumber(year, row.lastCount);
}

router.get("/ledger/balance", requireAuth, requirePermission("ledger:view"), async (req, res): Promise<void> => {
  const userFilter = getUserFilter(req);
  const result = await db
    .select({ totalCredits: sum(ledgerTable.credit), totalDebits: sum(ledgerTable.debit) })
    .from(ledgerTable)
    .where(userFilter);

  const totalCredits = parseFloat(result[0]?.totalCredits ?? "0");
  const totalDebits = parseFloat(result[0]?.totalDebits ?? "0");
  res.json({
    balance: totalCredits - totalDebits,
    totalCredits,
    totalDebits,
  });
});

router.get("/ledger/summary", requireAuth, requirePermission("ledger:view"), async (req, res): Promise<void> => {
  const params = GetLedgerSummaryQueryParams.safeParse(req.query);
  const period = params.success ? params.data.period ?? "today" : "today";

  let startDate: string;
  let endDate: string;
  const now = new Date();

  if (period === "custom" && params.success && params.data.startDate && params.data.endDate) {
    startDate = params.data.startDate as string;
    endDate = params.data.endDate as string;
  } else if (period === "yesterday") {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    startDate = endDate = y.toISOString().split("T")[0];
  } else if (period === "week") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    startDate = start.toISOString().split("T")[0];
    endDate = now.toISOString().split("T")[0];
  } else if (period === "month") {
    startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    endDate = now.toISOString().split("T")[0];
  } else {
    startDate = endDate = now.toISOString().split("T")[0];
  }

  const userFilter = getUserFilter(req);
  const dateFilter = and(gte(ledgerTable.date, startDate), lte(ledgerTable.date, endDate));
  const whereClause = userFilter ? and(userFilter, dateFilter) : dateFilter;

  const result = await db
    .select({ totalCredits: sum(ledgerTable.credit), totalDebits: sum(ledgerTable.debit), totalTransactions: count() })
    .from(ledgerTable)
    .where(whereClause);

  const totalCredits = parseFloat(result[0]?.totalCredits ?? "0");
  const totalDebits = parseFloat(result[0]?.totalDebits ?? "0");

  res.json({
    totalTransactions: result[0]?.totalTransactions ?? 0,
    totalCredits,
    totalDebits,
    netChange: totalCredits - totalDebits,
    period,
  });
});

router.get("/ledger", requireAuth, requirePermission("ledger:view"), async (req, res): Promise<void> => {
  const params = ListLedgerEntriesQueryParams.safeParse(req.query);
  const page = params.success && params.data.page ? params.data.page : 1;
  const limit = params.success && params.data.limit ? params.data.limit : 20;
  const offset = (page - 1) * limit;

  const userFilter = getUserFilter(req);
  const conditions: any[] = userFilter ? [userFilter] : [];

  if (params.success) {
    if (params.data.startDate) conditions.push(gte(ledgerTable.date, params.data.startDate as string));
    if (params.data.endDate) conditions.push(lte(ledgerTable.date, params.data.endDate as string));
    if (params.data.serviceType) conditions.push(eq(ledgerTable.serviceType, params.data.serviceType as string));
    if (params.data.customerName) conditions.push(like(ledgerTable.customerName, `%${params.data.customerName}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [entries, totalResult] = await Promise.all([
    db.select({
      id: ledgerTable.id, date: ledgerTable.date, customerName: ledgerTable.customerName,
      serviceType: ledgerTable.serviceType, credit: ledgerTable.credit, debit: ledgerTable.debit,
      description: ledgerTable.description, balance: ledgerTable.balance, createdBy: ledgerTable.createdBy,
      createdAt: ledgerTable.createdAt, createdByName: usersTable.username,
      receiptNumber: ledgerTable.receiptNumber, receiptToken: ledgerTable.receiptToken,
    })
      .from(ledgerTable)
      .leftJoin(usersTable, eq(ledgerTable.createdBy, usersTable.id))
      .where(whereClause)
      .orderBy(desc(ledgerTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(ledgerTable).where(whereClause),
  ]);

  res.json({
    entries: entries.map((e: any) => formatEntry(e, e.createdByName)),
    total: totalResult[0]?.total ?? 0,
    page,
    limit,
  });
});

router.post("/ledger", requireAuth, requirePermission("ledger:create"), async (req, res): Promise<void> => {
  const parsed = CreateLedgerEntryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { date, serviceType, credit, debit } = parsed.data;
  const customerName = sanitize(parsed.data.customerName);
  const description = parsed.data.description !== undefined ? sanitize(parsed.data.description) : parsed.data.description;
  const userId = req.session.userId!;

  const balanceResult = await db
    .select({ totalCredits: sum(ledgerTable.credit), totalDebits: sum(ledgerTable.debit) })
    .from(ledgerTable)
    .where(eq(ledgerTable.createdBy, userId));

  const prevCredits = parseFloat(balanceResult[0]?.totalCredits ?? "0");
  const prevDebits = parseFloat(balanceResult[0]?.totalDebits ?? "0");
  const newBalance = prevCredits - prevDebits + (credit ?? 0) - (debit ?? 0);

  const txYear = new Date(date).getFullYear();
  const receiptNumber = await generateReceiptNumber(txYear);
  const uuid = crypto.randomUUID();

  const [entry] = await db
    .insert(ledgerTable)
    .values({
      date, customerName, serviceType,
      credit: String(credit ?? 0),
      debit: String(debit ?? 0),
      description,
      balance: String(newBalance),
      createdBy: userId,
      receiptNumber,
      receiptToken: uuid,
    })
    .returning();

  // Sign a tamper-proof JWT receipt token; store it back so future lookups use it.
  const receiptJwt = await signReceiptToken(uuid, entry.id, receiptNumber, "ledger");
  await db
    .update(ledgerTable)
    .set({ receiptToken: receiptJwt })
    .where(eq(ledgerTable.id, entry.id));
  entry.receiptToken = receiptJwt;

  invalidateLedgerCaches();
  await auditLog(userId, "ledger.create", `Created ledger entry for ${customerName} (${receiptNumber})`, getClientIp(req));

  const amount = (credit ?? 0) + (debit ?? 0);
  if (amount >= 10000) {
    notifyLargeTransaction(userId, amount, entry.id).catch(() => {});
  }

  res.status(201).json(formatEntry(entry));
});

router.get("/ledger/:id", requireAuth, requirePermission("ledger:view"), async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [entry] = await db.select({
    id: ledgerTable.id, date: ledgerTable.date, customerName: ledgerTable.customerName,
    serviceType: ledgerTable.serviceType, credit: ledgerTable.credit, debit: ledgerTable.debit,
    description: ledgerTable.description, balance: ledgerTable.balance, createdBy: ledgerTable.createdBy,
    createdAt: ledgerTable.createdAt, createdByName: usersTable.username,
    receiptNumber: ledgerTable.receiptNumber, receiptToken: ledgerTable.receiptToken,
  })
    .from(ledgerTable)
    .leftJoin(usersTable, eq(ledgerTable.createdBy, usersTable.id))
    .where(eq(ledgerTable.id, id));

  if (!entry) { res.status(404).json({ error: "Not found" }); return; }

  if (entry.createdBy !== req.session.userId && req.session.userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  res.json(formatEntry(entry, entry.createdByName));
});

router.patch("/ledger/:id", requireAuth, requirePermission("ledger:edit"), async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const parsed = UpdateLedgerEntryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [existing] = await db.select().from(ledgerTable).where(eq(ledgerTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  if (existing.createdBy !== req.session.userId && req.session.userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const updateData: Record<string, any> = {};
  if (parsed.data.date !== undefined) updateData.date = parsed.data.date;
  if (parsed.data.customerName !== undefined) updateData.customerName = sanitize(parsed.data.customerName);
  if (parsed.data.serviceType !== undefined) updateData.serviceType = parsed.data.serviceType;
  if (parsed.data.credit !== undefined) updateData.credit = String(parsed.data.credit);
  if (parsed.data.debit !== undefined) updateData.debit = String(parsed.data.debit);
  if (parsed.data.description !== undefined) updateData.description = sanitize(parsed.data.description);

  const refreshed = await db.transaction(async (tx: any) => {
    await lockUserEntries(tx, existing.createdBy);
    const [updated] = await tx.update(ledgerTable).set(updateData).where(eq(ledgerTable.id, id)).returning();
    await recalculateBalances(tx, existing.createdBy);
    const [row] = await tx.select().from(ledgerTable).where(eq(ledgerTable.id, id));
    return row ?? updated;
  });
  invalidateLedgerCaches();
  await auditLog(req.session.userId!, "ledger.update", `Updated ledger entry ${id}`, getClientIp(req));
  res.json(formatEntry(refreshed));
});

router.delete("/ledger/all", requireRole("admin"), async (req, res): Promise<void> => {
  await db.delete(ledgerTable);
  invalidateLedgerCaches();
  await auditLog(req.session.userId!, "ledger.clear", "Deleted ALL ledger transactions", getClientIp(req));
  res.sendStatus(204);
});

router.delete("/ledger/:id", requireAuth, requirePermission("ledger:edit"), async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [existing] = await db.select().from(ledgerTable).where(eq(ledgerTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  if (existing.createdBy !== req.session.userId && req.session.userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.transaction(async (tx: any) => {
    await lockUserEntries(tx, existing.createdBy);
    await tx.delete(ledgerTable).where(eq(ledgerTable.id, id));
    await recalculateBalances(tx, existing.createdBy);
  });
  invalidateLedgerCaches();
  await auditLog(req.session.userId!, "ledger.delete", `Deleted ledger entry ${id}`, getClientIp(req));
  res.sendStatus(204);
});

export default router;
