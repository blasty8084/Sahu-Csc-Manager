import { Router, type IRouter } from "express";
import { db, udhariCustomersTable, udhariEntriesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requirePermission, auditLog, getClientIp } from "../../lib/auth";
import { sanitize } from "../../lib/sanitize";
import { z } from "zod/v4";
import { randomUUID } from "crypto";
import { fmtCustomer, recalcBalance } from "./customers";
import { cached, invalidateUdhariCaches } from "../../lib/query-cache";
import { asyncHandler } from "../../lib/async-handler";

export const router: IRouter = Router();

function fmtEntry(e: any) {
  return { ...e, amount: parseFloat(e.amount ?? "0") };
}

const EntryInput = z.object({
  date: z.string().min(1),
  type: z.enum(["gave", "got"]),
  amount: z.number().positive(),
  note: z.string().max(300).optional(),
});

const EntryUpdate = z.object({
  date: z.string().min(1).optional(),
  type: z.enum(["gave", "got"]).optional(),
  amount: z.number().positive().optional(),
  note: z.string().max(300).optional(),
});

// ── GET /udhari/customers/:customerId/entries ─────────────────────────────────
router.get("/udhari/customers/:customerId/entries", requireAuth, requirePermission("udhari:view"), asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const customerId = parseInt(req.params.customerId as string);
  if (isNaN(customerId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [customer] = await db.select().from(udhariCustomersTable).where(and(eq(udhariCustomersTable.id, customerId), eq(udhariCustomersTable.createdBy, userId)));
  if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

  const entries = await cached(`udhari:customer:${customerId}:entries`, 5_000, async () => {
    const rows = await db.select().from(udhariEntriesTable).where(eq(udhariEntriesTable.customerId, customerId)).orderBy(desc(udhariEntriesTable.date), desc(udhariEntriesTable.createdAt)).limit(500);
    return rows.map(fmtEntry);
  });
  res.json(entries);
}));

// ── POST /udhari/customers/:customerId/entries ────────────────────────────────
router.post("/udhari/customers/:customerId/entries", requireAuth, requirePermission("udhari:manage"), asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const customerId = parseInt(req.params.customerId as string);
  if (isNaN(customerId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = EntryInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", details: parsed.error.issues }); return; }

  const [customer] = await db.select().from(udhariCustomersTable).where(and(eq(udhariCustomersTable.id, customerId), eq(udhariCustomersTable.createdBy, userId)));
  if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

  const { date, type, amount, note } = parsed.data;
  const [entry] = await db.insert(udhariEntriesTable).values({ customerId, date, type, amount: String(amount), note: sanitize(note ?? ""), receiptToken: randomUUID(), createdBy: userId }).returning();

  await recalcBalance(customerId);
  await invalidateUdhariCaches(userId);
  const [updated] = await db.select().from(udhariCustomersTable).where(eq(udhariCustomersTable.id, customerId));
  await auditLog(userId, "udhari.entry.create", `${type === "gave" ? "Gave" : "Got"} ₹${amount} for customer: ${customer.name}`, getClientIp(req));
  res.status(201).json({ entry: fmtEntry(entry), customer: await fmtCustomer(updated) });
}));

// ── PATCH /udhari/customers/:customerId/entries/:entryId ──────────────────────
router.patch("/udhari/customers/:customerId/entries/:entryId", requireAuth, requirePermission("udhari:manage"), asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const customerId = parseInt(req.params.customerId as string);
  const entryId = parseInt(req.params.entryId as string);
  if (isNaN(customerId) || isNaN(entryId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = EntryUpdate.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", details: parsed.error.issues }); return; }

  const [customer] = await db.select().from(udhariCustomersTable).where(and(eq(udhariCustomersTable.id, customerId), eq(udhariCustomersTable.createdBy, userId)));
  if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

  const [existing] = await db.select().from(udhariEntriesTable).where(and(eq(udhariEntriesTable.id, entryId), eq(udhariEntriesTable.customerId, customerId)));
  if (!existing) { res.status(404).json({ error: "Entry not found" }); return; }

  const updateData: any = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.amount !== undefined) updateData.amount = String(parsed.data.amount);
  if (parsed.data.note !== undefined) updateData.note = sanitize(parsed.data.note);

  const [updated] = await db.update(udhariEntriesTable).set(updateData).where(eq(udhariEntriesTable.id, entryId)).returning();
  await recalcBalance(customerId);
  await invalidateUdhariCaches(userId);
  const [updatedCustomer] = await db.select().from(udhariCustomersTable).where(eq(udhariCustomersTable.id, customerId));

  res.json({ entry: fmtEntry(updated), customer: await fmtCustomer(updatedCustomer) });
}));

// ── DELETE /udhari/customers/:customerId/entries/:entryId ─────────────────────
router.delete("/udhari/customers/:customerId/entries/:entryId", requireAuth, requirePermission("udhari:manage"), asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const customerId = parseInt(req.params.customerId as string);
  const entryId = parseInt(req.params.entryId as string);
  if (isNaN(customerId) || isNaN(entryId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [customer] = await db.select().from(udhariCustomersTable).where(and(eq(udhariCustomersTable.id, customerId), eq(udhariCustomersTable.createdBy, userId)));
  if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

  const [existing] = await db.select().from(udhariEntriesTable).where(and(eq(udhariEntriesTable.id, entryId), eq(udhariEntriesTable.customerId, customerId)));
  if (!existing) { res.status(404).json({ error: "Entry not found" }); return; }

  await db.delete(udhariEntriesTable).where(eq(udhariEntriesTable.id, entryId));
  await recalcBalance(customerId);
  await invalidateUdhariCaches(userId);
  const [updatedCustomer] = await db.select().from(udhariCustomersTable).where(eq(udhariCustomersTable.id, customerId));
  res.json({ message: "Entry deleted", customer: await fmtCustomer(updatedCustomer) });
}));

export default router;
