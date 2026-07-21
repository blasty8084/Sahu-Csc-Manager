import { Router, type IRouter } from "express";
import { db, ledgerTable, usersTable, settingsTable } from "@workspace/db";
import { eq, and, gte, lte, like, desc, count, sum, sql } from "drizzle-orm";
import {
  CreateLedgerEntryBody, UpdateLedgerEntryBody,
  ListLedgerEntriesQueryParams, GetLedgerSummaryQueryParams,
} from "@workspace/api-zod";
import { requireAuth, requireRole, requirePermission, auditLog, getClientIp } from "../lib/auth";
import { notifyLargeTransaction } from "../services/notificationTemplates";
import { signReceiptToken } from "../lib/jwt";
import { sanitize } from "../lib/sanitize";
import { invalidateLedgerCaches, cached } from "../lib/query-cache";
import crypto from "crypto";
import { asyncHandler } from "../lib/async-handler";
import { logger } from "../lib/logger";
import {
  formatEntry, getUserFilter, recalculateBalances, lockUserEntries,
  generateReceiptNumber, resolveDateRange, entryColumns,
} from "../lib/ledgerHelpers";

const router: IRouter = Router();

router.get("/ledger/balance", requireAuth, requirePermission("ledger:view"), asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const result = await db
    .select({ ledgerBalance: usersTable.ledgerBalance, totalCredits: sum(ledgerTable.credit), totalDebits: sum(ledgerTable.debit) })
    .from(usersTable).leftJoin(ledgerTable, eq(ledgerTable.createdBy, usersTable.id))
    .where(eq(usersTable.id, userId)).groupBy(usersTable.id);
  res.json({
    balance: parseFloat(result[0]?.ledgerBalance ?? "0"),
    totalCredits: parseFloat(result[0]?.totalCredits ?? "0"),
    totalDebits: parseFloat(result[0]?.totalDebits ?? "0"),
  });
}));

router.get("/ledger/summary", requireAuth, requirePermission("ledger:view"), asyncHandler(async (req, res) => {
  const params = GetLedgerSummaryQueryParams.safeParse(req.query);
  const period = params.success ? params.data.period ?? "today" : "today";
  const { startDate, endDate } = resolveDateRange(period, params.success ? params.data : undefined);
  const where = and(getUserFilter(req.session.userId!), gte(ledgerTable.date, startDate), lte(ledgerTable.date, endDate));
  const [r] = await db.select({ totalCredits: sum(ledgerTable.credit), totalDebits: sum(ledgerTable.debit), totalTransactions: count() }).from(ledgerTable).where(where);
  const totalCredits = parseFloat(r?.totalCredits ?? "0");
  const totalDebits = parseFloat(r?.totalDebits ?? "0");
  res.json({ totalTransactions: r?.totalTransactions ?? 0, totalCredits, totalDebits, netChange: totalCredits - totalDebits, period });
}));

router.get("/ledger", requireAuth, requirePermission("ledger:view"), asyncHandler(async (req, res) => {
  const params = ListLedgerEntriesQueryParams.safeParse(req.query);
  const page = params.success && params.data.page ? params.data.page : 1;
  const limit = params.success && params.data.limit ? params.data.limit : 20;
  const conditions: any[] = [getUserFilter(req.session.userId!)];
  if (params.success) {
    if (params.data.startDate) conditions.push(gte(ledgerTable.date, params.data.startDate as string));
    if (params.data.endDate) conditions.push(lte(ledgerTable.date, params.data.endDate as string));
    if (params.data.serviceType) conditions.push(eq(ledgerTable.serviceType, params.data.serviceType as string));
    if (params.data.customerName) conditions.push(like(ledgerTable.customerName, `%${params.data.customerName}%`));
  }
  const where = and(...conditions);
  const [entries, totalResult] = await Promise.all([
    db.select(entryColumns).from(ledgerTable).leftJoin(usersTable, eq(ledgerTable.createdBy, usersTable.id))
      .where(where).orderBy(desc(ledgerTable.createdAt)).limit(limit).offset((page - 1) * limit),
    db.select({ total: count() }).from(ledgerTable).where(where),
  ]);
  res.json({ entries: entries.map((e) => formatEntry(e, e.createdByName)), total: totalResult[0]?.total ?? 0, page, limit });
}));

router.post("/ledger", requireAuth, requirePermission("ledger:create"), asyncHandler(async (req, res) => {
  const parsed = CreateLedgerEntryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { date, serviceType, credit, debit } = parsed.data;
  const customerName = sanitize(parsed.data.customerName);
  const description = parsed.data.description !== undefined ? sanitize(parsed.data.description) : parsed.data.description;
  const userId = req.session.userId!;
  const entry = await db.transaction(async (tx) => {
    const balanceRows = await tx.execute<{ ledger_balance: string }>(
      sql`UPDATE users SET ledger_balance = ledger_balance + ${(credit ?? 0) - (debit ?? 0)} WHERE id = ${userId} RETURNING ledger_balance`
    );
    const newBalance = parseFloat(balanceRows.rows[0]?.ledger_balance ?? "0");
    const receiptNumber = await generateReceiptNumber(tx, userId, new Date(date).getFullYear());
    const uuid = crypto.randomUUID();
    const [e] = await tx.insert(ledgerTable).values({
      date, customerName, serviceType, credit: String(credit ?? 0), debit: String(debit ?? 0),
      description, balance: String(newBalance), createdBy: userId, receiptNumber, receiptToken: uuid,
    }).returning();
    const jwt = await signReceiptToken(uuid, e.id, receiptNumber, "ledger");
    await tx.update(ledgerTable).set({ receiptToken: jwt }).where(eq(ledgerTable.id, e.id));
    e.receiptToken = jwt;
    return e;
  });
  await invalidateLedgerCaches();
  await auditLog(userId, "ledger.create", `Created ledger entry for ${customerName} (${entry.receiptNumber})`, getClientIp(req));
  const amount = (credit ?? 0) + (debit ?? 0);
  const threshold = await cached<number>("settings:largeTransactionThreshold", 30_000, async () => {
    const [row] = await db.select({ value: settingsTable.value }).from(settingsTable).where(eq(settingsTable.key, "largeTransactionThreshold")).limit(1);
    return row ? parseFloat(row.value) : 10_000;
  });
  if (amount >= threshold) {
    notifyLargeTransaction(userId, amount, entry.id).catch((err) => {
      logger.warn({ err, userId, amount, entryId: entry.id }, "Large-transaction notification failed");
    });
  }
  res.status(201).json(formatEntry(entry));
}));

router.get("/ledger/:id", requireAuth, requirePermission("ledger:view"), asyncHandler(async (req, res) => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [entry] = await db.select(entryColumns).from(ledgerTable).leftJoin(usersTable, eq(ledgerTable.createdBy, usersTable.id)).where(eq(ledgerTable.id, id));
  if (!entry) { res.status(404).json({ error: "Not found" }); return; }
  if (entry.createdBy !== req.session.userId && req.session.userRole !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }
  res.json(formatEntry(entry, entry.createdByName));
}));

router.patch("/ledger/:id", requireAuth, requirePermission("ledger:edit"), asyncHandler(async (req, res) => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = UpdateLedgerEntryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [existing] = await db.select().from(ledgerTable).where(eq(ledgerTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (existing.createdBy !== req.session.userId && req.session.userRole !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }
  const u: Record<string, any> = {};
  if (parsed.data.date !== undefined) u.date = parsed.data.date;
  if (parsed.data.customerName !== undefined) u.customerName = sanitize(parsed.data.customerName);
  if (parsed.data.serviceType !== undefined) u.serviceType = parsed.data.serviceType;
  if (parsed.data.credit !== undefined) u.credit = String(parsed.data.credit);
  if (parsed.data.debit !== undefined) u.debit = String(parsed.data.debit);
  if (parsed.data.description !== undefined) u.description = sanitize(parsed.data.description);
  const oldCredit = parseFloat(existing.credit ?? "0"), oldDebit = parseFloat(existing.debit ?? "0");
  const newCredit = parsed.data.credit ?? oldCredit, newDebit = parsed.data.debit ?? oldDebit;
  const balanceDelta = (newCredit - newDebit) - (oldCredit - oldDebit);
  const refreshed = await db.transaction(async (tx: any) => {
    await lockUserEntries(tx, existing.createdBy);
    const [updated] = await tx.update(ledgerTable).set(u).where(eq(ledgerTable.id, id)).returning();
    await recalculateBalances(tx, existing.createdBy);
    if (balanceDelta !== 0) await tx.execute(sql`UPDATE users SET ledger_balance = ledger_balance + ${balanceDelta} WHERE id = ${existing.createdBy}`);
    const [row] = await tx.select().from(ledgerTable).where(eq(ledgerTable.id, id));
    return row ?? updated;
  });
  await invalidateLedgerCaches();
  await auditLog(req.session.userId!, "ledger.update", `Updated ledger entry ${id}`, getClientIp(req));
  res.json(formatEntry(refreshed));
}));

router.delete("/ledger/all", requireRole("admin"), asyncHandler(async (req, res) => {
  await db.delete(ledgerTable);
  await db.execute(sql`UPDATE users SET ledger_balance = 0`);
  await invalidateLedgerCaches();
  await auditLog(req.session.userId!, "ledger.clear", "Deleted ALL ledger transactions", getClientIp(req));
  res.sendStatus(204);
}));

router.delete("/ledger/:id", requireAuth, requirePermission("ledger:edit"), asyncHandler(async (req, res) => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [existing] = await db.select().from(ledgerTable).where(eq(ledgerTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (existing.createdBy !== req.session.userId && req.session.userRole !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }
  const deletedNet = parseFloat(existing.credit ?? "0") - parseFloat(existing.debit ?? "0");
  await db.transaction(async (tx: any) => {
    await lockUserEntries(tx, existing.createdBy);
    await tx.delete(ledgerTable).where(eq(ledgerTable.id, id));
    await recalculateBalances(tx, existing.createdBy);
    await tx.execute(sql`UPDATE users SET ledger_balance = ledger_balance - ${deletedNet} WHERE id = ${existing.createdBy}`);
  });
  await invalidateLedgerCaches();
  await auditLog(req.session.userId!, "ledger.delete", `Deleted ledger entry ${id}`, getClientIp(req));
  res.sendStatus(204);
}));

export default router;
