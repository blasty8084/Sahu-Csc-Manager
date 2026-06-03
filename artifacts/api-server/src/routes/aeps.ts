import { Router, type IRouter } from "express";
import { db, aepsDailyTable, aepsTransactionsTable } from "@workspace/db";
import { eq, and, sum } from "drizzle-orm";
import { requireAuth, auditLog, getClientIp } from "../lib/auth";
import { z } from "zod";

const router: IRouter = Router();

const UpsertSessionBody = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  openingBalance: z.number().min(0),
  notes: z.string().optional(),
});

const AddTransactionBody = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(["withdrawal", "deposit"]),
  amount: z.number().positive(),
  customerName: z.string().min(1),
  description: z.string().optional(),
});

function fmt(n: any) {
  return parseFloat(n ?? "0");
}

// GET /aeps/session?date=YYYY-MM-DD
router.get("/aeps/session", requireAuth, async (req, res): Promise<void> => {
  const date = (req.query.date as string) || new Date().toISOString().split("T")[0];

  const [session] = await db
    .select()
    .from(aepsDailyTable)
    .where(eq(aepsDailyTable.date, date));

  if (!session) {
    res.json(null);
    return;
  }

  const transactions = await db
    .select()
    .from(aepsTransactionsTable)
    .where(eq(aepsTransactionsTable.dailyId, session.id))
    .orderBy(aepsTransactionsTable.createdAt);

  // Compute running balance
  let runningBalance = fmt(session.openingBalance);
  const txWithBalance = transactions.map((tx) => {
    const amount = fmt(tx.amount);
    if (tx.type === "withdrawal") {
      runningBalance = runningBalance - amount;
    } else {
      runningBalance = runningBalance + amount;
    }
    return {
      id: tx.id,
      type: tx.type,
      amount,
      customerName: tx.customerName,
      description: tx.description,
      balance: runningBalance,
      createdAt: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt,
    };
  });

  // Summary totals
  const totalWithdrawals = transactions
    .filter((t) => t.type === "withdrawal")
    .reduce((acc, t) => acc + fmt(t.amount), 0);
  const totalDeposits = transactions
    .filter((t) => t.type === "deposit")
    .reduce((acc, t) => acc + fmt(t.amount), 0);

  res.json({
    id: session.id,
    date: session.date,
    openingBalance: fmt(session.openingBalance),
    notes: session.notes,
    createdAt: session.createdAt instanceof Date ? session.createdAt.toISOString() : session.createdAt,
    transactions: txWithBalance,
    totalWithdrawals,
    totalDeposits,
    currentBalance: fmt(session.openingBalance) - totalWithdrawals + totalDeposits,
  });
});

// POST /aeps/session — create or update today's day-open balance
router.post("/aeps/session", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpsertSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { date, openingBalance, notes } = parsed.data;

  const [existing] = await db
    .select()
    .from(aepsDailyTable)
    .where(eq(aepsDailyTable.date, date));

  let session;
  if (existing) {
    [session] = await db
      .update(aepsDailyTable)
      .set({
        openingBalance: String(openingBalance),
        notes: notes ?? existing.notes,
        updatedAt: new Date(),
      })
      .where(eq(aepsDailyTable.id, existing.id))
      .returning();
  } else {
    [session] = await db
      .insert(aepsDailyTable)
      .values({ date, openingBalance: String(openingBalance), notes })
      .returning();
  }

  await auditLog(req.session.userId!, "aeps.session", `AePS day opened for ${date} with ₹${openingBalance}`, getClientIp(req));
  res.json({ id: session.id, date: session.date, openingBalance: fmt(session.openingBalance), notes: session.notes });
});

// POST /aeps/transaction — add a withdrawal or deposit
router.post("/aeps/transaction", requireAuth, async (req, res): Promise<void> => {
  const parsed = AddTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { date, type, amount, customerName, description } = parsed.data;

  // Ensure a session exists for this date
  let [session] = await db
    .select()
    .from(aepsDailyTable)
    .where(eq(aepsDailyTable.date, date));

  if (!session) {
    res.status(400).json({ error: "No day session opened for this date. Please set the opening balance first." });
    return;
  }

  const [tx] = await db
    .insert(aepsTransactionsTable)
    .values({ dailyId: session.id, type, amount: String(amount), customerName, description })
    .returning();

  await auditLog(req.session.userId!, "aeps.transaction", `AePS ${type} ₹${amount} for ${customerName}`, getClientIp(req));

  res.status(201).json({
    id: tx.id,
    type: tx.type,
    amount: fmt(tx.amount),
    customerName: tx.customerName,
    description: tx.description,
    createdAt: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt,
  });
});

// PATCH /aeps/transaction/:id — edit a transaction
const EditTransactionBody = z.object({
  type: z.enum(["withdrawal", "deposit"]).optional(),
  amount: z.number().positive().optional(),
  customerName: z.string().min(1).optional(),
  description: z.string().optional(),
});

router.patch("/aeps/transaction/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const parsed = EditTransactionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [existing] = await db.select().from(aepsTransactionsTable).where(eq(aepsTransactionsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  const updates: Record<string, any> = {};
  if (parsed.data.type !== undefined) updates.type = parsed.data.type;
  if (parsed.data.amount !== undefined) updates.amount = String(parsed.data.amount);
  if (parsed.data.customerName !== undefined) updates.customerName = parsed.data.customerName;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;

  const [updated] = await db.update(aepsTransactionsTable).set(updates).where(eq(aepsTransactionsTable.id, id)).returning();
  await auditLog(req.session.userId!, "aeps.edit", `Edited AePS transaction ${id}`, getClientIp(req));

  res.json({
    id: updated.id,
    type: updated.type,
    amount: fmt(updated.amount),
    customerName: updated.customerName,
    description: updated.description,
    createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : updated.createdAt,
  });
});

// DELETE /aeps/transaction/:id — remove a transaction
router.delete("/aeps/transaction/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [tx] = await db.select().from(aepsTransactionsTable).where(eq(aepsTransactionsTable.id, id));
  if (!tx) { res.status(404).json({ error: "Not found" }); return; }

  await db.delete(aepsTransactionsTable).where(eq(aepsTransactionsTable.id, id));
  await auditLog(req.session.userId!, "aeps.delete", `Deleted AePS transaction ${id}`, getClientIp(req));
  res.sendStatus(204);
});

export default router;
