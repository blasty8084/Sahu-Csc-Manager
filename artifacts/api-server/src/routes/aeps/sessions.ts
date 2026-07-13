import { Router, type IRouter } from "express";
import { db, aepsDailyTable, aepsTransactionsTable } from "@workspace/db";
import { eq, and, sum, count, desc } from "drizzle-orm";
import { requireAuth, requireRole, requirePermission, auditLog, getClientIp } from "../../lib/auth";
import { sanitize } from "../../lib/sanitize";
import { z } from "zod";
import { cached, invalidateAepsCaches } from "../../lib/query-cache";

export const router: IRouter = Router();

const UpsertSessionBody = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  openingBalance: z.number().min(0),
  notes: z.string().optional(),
});

export function fmt(n: string | number | null | undefined): number {
  return parseFloat((n ?? "0") as string);
}

// ── GET /aeps/session?date=YYYY-MM-DD ─────────────────────────────────────────
router.get("/aeps/session", requireAuth, requirePermission("aeps:view"), async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const date = (req.query.date as string) || new Date().toISOString().split("T")[0];

  const result = await cached(`aeps:session:${userId}:${date}`, 5_000, async () => {
    const [session] = await db
      .select()
      .from(aepsDailyTable)
      .where(and(eq(aepsDailyTable.date, date), eq(aepsDailyTable.createdBy, userId)));

    if (!session) return null;

    const transactions = await db
      .select()
      .from(aepsTransactionsTable)
      .where(eq(aepsTransactionsTable.dailyId, session.id))
      .orderBy(aepsTransactionsTable.createdAt);

    let runningBalance = fmt(session.openingBalance);
    const txWithBalance = transactions.map((tx) => {
      const amount = fmt(tx.amount);
      runningBalance = tx.type === "withdrawal" ? runningBalance - amount : runningBalance + amount;
      return {
        id: tx.id, type: tx.type, amount,
        customerName: tx.customerName, description: tx.description,
        balance: runningBalance, receiptToken: tx.receiptToken ?? null,
        createdAt: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt,
      };
    });

    const totalWithdrawals = transactions.filter((t) => t.type === "withdrawal").reduce((acc, t) => acc + fmt(t.amount), 0);
    const totalDeposits = transactions.filter((t) => t.type === "deposit").reduce((acc, t) => acc + fmt(t.amount), 0);

    return {
      id: session.id, date: session.date,
      openingBalance: fmt(session.openingBalance), notes: session.notes,
      createdAt: session.createdAt instanceof Date ? session.createdAt.toISOString() : session.createdAt,
      transactions: txWithBalance, totalWithdrawals, totalDeposits,
      currentBalance: fmt(session.openingBalance) - totalWithdrawals + totalDeposits,
    };
  });

  res.json(result);
});

// ── POST /aeps/session ────────────────────────────────────────────────────────
router.post("/aeps/session", requireAuth, requirePermission("aeps:manage"), async (req, res): Promise<void> => {
  const parsed = UpsertSessionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const userId = req.session.userId!;
  const { date, openingBalance } = parsed.data;
  const notes = parsed.data.notes !== undefined ? sanitize(parsed.data.notes) : parsed.data.notes;

  const [existing] = await db
    .select()
    .from(aepsDailyTable)
    .where(and(eq(aepsDailyTable.date, date), eq(aepsDailyTable.createdBy, userId)));

  let session;
  if (existing) {
    [session] = await db
      .update(aepsDailyTable)
      .set({ openingBalance: String(openingBalance), notes: notes ?? existing.notes, updatedAt: new Date() })
      .where(eq(aepsDailyTable.id, existing.id))
      .returning();
  } else {
    [session] = await db
      .insert(aepsDailyTable)
      .values({ date, openingBalance: String(openingBalance), notes, createdBy: userId })
      .returning();
  }

  await invalidateAepsCaches(userId);
  await auditLog(userId, "aeps.session", `AePS day opened for ${date} with ₹${openingBalance}`, getClientIp(req));
  res.json({ id: session.id, date: session.date, openingBalance: fmt(session.openingBalance), notes: session.notes });
});

// ── GET /admin/aeps-overview ──────────────────────────────────────────────────
router.get("/admin/aeps-overview", requireRole("admin"), async (_req, res): Promise<void> => {
  const result = await cached("admin:aeps-overview", 5_000, async () => {
    const sessions = await db
      .select({ id: aepsDailyTable.id, date: aepsDailyTable.date, createdBy: aepsDailyTable.createdBy, openingBalance: aepsDailyTable.openingBalance })
      .from(aepsDailyTable)
      .orderBy(aepsDailyTable.date);

    if (sessions.length === 0) return [];

    const txSummary = await db
      .select({ dailyId: aepsTransactionsTable.dailyId, type: aepsTransactionsTable.type, total: sum(aepsTransactionsTable.amount), txCount: count() })
      .from(aepsTransactionsTable)
      .groupBy(aepsTransactionsTable.dailyId, aepsTransactionsTable.type);

    const map = new Map<number, { w: number; d: number; count: number }>();
    for (const s of sessions) map.set(s.id, { w: 0, d: 0, count: 0 });
    for (const row of txSummary) {
      const e = map.get(row.dailyId);
      if (!e) continue;
      const amt = parseFloat(row.total ?? "0");
      if (row.type === "withdrawal") e.w += amt; else e.d += amt;
      e.count += row.txCount;
    }

    return sessions.map((s) => {
      const e = map.get(s.id)!;
      return {
        date: s.date, createdBy: s.createdBy,
        openingBalance: parseFloat(s.openingBalance ?? "0"),
        totalWithdrawals: e.w, totalDeposits: e.d, transactions: e.count,
        currentBalance: parseFloat(s.openingBalance ?? "0") - e.w + e.d,
      };
    });
  });

  res.json(result);
});

export default router;
