import { Router, type IRouter } from "express";
import { db, aepsDailyTable, aepsTransactionsTable, usersTable, settingsTable } from "@workspace/db";
import { eq, and, desc, gte, lte, ilike, sql, inArray } from "drizzle-orm";
import { requireAuth, requirePermission, auditLog, getClientIp } from "../../lib/auth";
import { sanitize } from "../../lib/sanitize";
import { z } from "zod";
import { randomUUID } from "crypto";
import { fmt } from "./sessions";
import { cached, invalidateAepsCaches } from "../../lib/query-cache";
import { asyncHandler } from "../../lib/async-handler";

export const router: IRouter = Router();

const AddTransactionBody = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(["withdrawal", "deposit"]),
  amount: z.number().positive(),
  customerName: z.string().min(1),
  description: z.string().optional(),
});

const EditTransactionBody = z.object({
  type: z.enum(["withdrawal", "deposit"]).optional(),
  amount: z.number().positive().optional(),
  customerName: z.string().min(1).optional(),
  description: z.string().optional(),
});

// ── GET /aeps/transactions ────────────────────────────────────────────────────
router.get("/aeps/transactions", requireAuth, requirePermission("aeps:view"), asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || "20", 10)));
  const offset = (page - 1) * limit;
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;
  const typeFilter = req.query.type as string | undefined;
  const customerName = req.query.customerName as string | undefined;

  const cacheKey = `aeps:transactions:${userId}:${page}:${limit}:${startDate || ""}:${endDate || ""}:${typeFilter || ""}:${customerName || ""}`;

  const result = await cached(cacheKey, 5_000, async () => {
    const sessionWhere = [eq(aepsDailyTable.createdBy, userId)];
    if (startDate) sessionWhere.push(gte(aepsDailyTable.date, startDate));
    if (endDate) sessionWhere.push(lte(aepsDailyTable.date, endDate));

    const sessions = await db
      .select({ id: aepsDailyTable.id, date: aepsDailyTable.date, openingBalance: aepsDailyTable.openingBalance })
      .from(aepsDailyTable)
      .where(and(...sessionWhere));

    if (sessions.length === 0) return { transactions: [], total: 0, page, limit };

    const sessionMap = new Map(sessions.map((s) => [s.id, s]));
    const sessionIds = sessions.map((s) => s.id);

    const idFilter = sessionIds.length === 1
      ? eq(aepsTransactionsTable.dailyId, sessionIds[0])
      : sql`${aepsTransactionsTable.dailyId} = ANY(ARRAY[${sql.raw(sessionIds.join(","))}])`;
    const txWhere = [idFilter];
    if (typeFilter === "withdrawal" || typeFilter === "deposit") txWhere.push(eq(aepsTransactionsTable.type, typeFilter));
    if (customerName) txWhere.push(ilike(aepsTransactionsTable.customerName, `%${customerName}%`));

    const allTx = await db.select().from(aepsTransactionsTable).where(and(...txWhere)).orderBy(desc(aepsTransactionsTable.createdAt));
    const filtered = allTx.filter((tx) => sessionMap.has(tx.dailyId));
    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      transactions: paginated.map((tx) => {
        const session = sessionMap.get(tx.dailyId)!;
        return {
          id: tx.id, date: session.date, type: tx.type, amount: fmt(tx.amount),
          customerName: tx.customerName, description: tx.description,
          receiptToken: tx.receiptToken ?? null,
          createdAt: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt,
        };
      }),
      total, page, limit,
    };
  });

  res.json(result);
}));

// ── POST /aeps/transaction ────────────────────────────────────────────────────
router.post("/aeps/transaction", requireAuth, requirePermission("aeps:manage"), asyncHandler(async (req, res) => {
  const parsed = AddTransactionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const userId = req.session.userId!;
  const { date, type, amount } = parsed.data;
  const customerName = sanitize(parsed.data.customerName);
  const description = parsed.data.description !== undefined ? sanitize(parsed.data.description) : parsed.data.description;

  const [session] = await db.select().from(aepsDailyTable).where(and(eq(aepsDailyTable.date, date), eq(aepsDailyTable.createdBy, userId)));
  if (!session) {
    res.status(400).json({ error: "No day session opened for this date. Please set the opening balance first." });
    return;
  }

  const receiptToken = randomUUID();
  const [tx] = await db
    .insert(aepsTransactionsTable)
    .values({ dailyId: session.id, type, amount: String(amount), customerName, description, receiptToken })
    .returning();

  await invalidateAepsCaches(userId);
  await auditLog(userId, "aeps.transaction", `AePS ${type} ₹${amount} for ${customerName}`, getClientIp(req));
  res.status(201).json({
    id: tx.id, type: tx.type, amount: fmt(tx.amount),
    customerName: tx.customerName, description: tx.description,
    receiptToken: tx.receiptToken ?? null,
    createdAt: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt,
  });
}));

// ── PATCH /aeps/transaction/:id ───────────────────────────────────────────────
router.patch("/aeps/transaction/:id", requireAuth, requirePermission("aeps:manage"), asyncHandler(async (req, res) => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const parsed = EditTransactionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [existing] = await db.select().from(aepsTransactionsTable).where(eq(aepsTransactionsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  const [session] = await db.select().from(aepsDailyTable).where(eq(aepsDailyTable.id, existing.dailyId));
  if (session && session.createdBy !== req.session.userId && req.session.userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const updates: Record<string, any> = {};
  if (parsed.data.type !== undefined) updates.type = parsed.data.type;
  if (parsed.data.amount !== undefined) updates.amount = String(parsed.data.amount);
  if (parsed.data.customerName !== undefined) updates.customerName = sanitize(parsed.data.customerName);
  if (parsed.data.description !== undefined) updates.description = sanitize(parsed.data.description);

  const [updated] = await db.update(aepsTransactionsTable).set(updates).where(eq(aepsTransactionsTable.id, id)).returning();
  await invalidateAepsCaches(req.session.userId!);
  await auditLog(req.session.userId!, "aeps.edit", `Edited AePS transaction ${id}`, getClientIp(req));

  res.json({
    id: updated.id, type: updated.type, amount: fmt(updated.amount),
    customerName: updated.customerName, description: updated.description,
    receiptToken: updated.receiptToken ?? null,
    createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : updated.createdAt,
  });
}));

// ── DELETE /aeps/transaction/:id ──────────────────────────────────────────────
router.delete("/aeps/transaction/:id", requireAuth, requirePermission("aeps:manage"), asyncHandler(async (req, res) => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [tx] = await db.select().from(aepsTransactionsTable).where(eq(aepsTransactionsTable.id, id));
  if (!tx) { res.status(404).json({ error: "Not found" }); return; }

  const [session] = await db.select().from(aepsDailyTable).where(eq(aepsDailyTable.id, tx.dailyId));
  if (session && session.createdBy !== req.session.userId && req.session.userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.delete(aepsTransactionsTable).where(eq(aepsTransactionsTable.id, id));
  await invalidateAepsCaches(req.session.userId!);
  await auditLog(req.session.userId!, "aeps.delete", `Deleted AePS transaction ${id}`, getClientIp(req));
  res.sendStatus(204);
}));

// ── GET /receipts/verify/aeps/:token (public) ─────────────────────────────────
router.get("/receipts/verify/aeps/:token", asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!token || typeof token !== "string" || token.length < 16) {
    res.status(400).json({ error: "Invalid token" }); return;
  }

  const [tx] = await db
    .select({ id: aepsTransactionsTable.id, dailyId: aepsTransactionsTable.dailyId, type: aepsTransactionsTable.type, amount: aepsTransactionsTable.amount, customerName: aepsTransactionsTable.customerName, description: aepsTransactionsTable.description, receiptToken: aepsTransactionsTable.receiptToken, createdAt: aepsTransactionsTable.createdAt })
    .from(aepsTransactionsTable)
    .where(eq(aepsTransactionsTable.receiptToken, token));

  if (!tx) { res.status(404).json({ error: "Receipt not found" }); return; }

  const [session] = await db
    .select({ id: aepsDailyTable.id, date: aepsDailyTable.date, openingBalance: aepsDailyTable.openingBalance, createdBy: aepsDailyTable.createdBy })
    .from(aepsDailyTable)
    .where(eq(aepsDailyTable.id, tx.dailyId));

  const [operator] = session
    ? await db.select({ username: usersTable.username }).from(usersTable).where(eq(usersTable.id, session.createdBy))
    : [];

  const settingsRows = await db
    .select({ key: settingsTable.key, value: settingsTable.value })
    .from(settingsTable)
    .where(inArray(settingsTable.key, ["businessName", "businessAddress", "businessMobile", "businessWebsite"]));

  const getSetting = (key: string, fallback = "") => settingsRows.find((r) => r.key === key)?.value ?? fallback;
  const year = session ? new Date(session.date).getFullYear() : new Date().getFullYear();

  res.json({
    receiptNumber: `AEPS-${year}-${String(tx.id).padStart(4, "0")}`,
    date: session?.date ?? new Date().toISOString().split("T")[0],
    type: tx.type, amount: parseFloat(tx.amount ?? "0"),
    customerName: tx.customerName, description: tx.description,
    operatorName: operator?.username ?? null,
    createdAt: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt,
    businessName: getSetting("businessName", "SAHU CSC Center"),
    businessAddress: getSetting("businessAddress"),
    businessMobile: getSetting("businessMobile"),
    businessWebsite: getSetting("businessWebsite"),
  });
}));

export default router;
