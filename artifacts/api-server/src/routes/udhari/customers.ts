import { Router, type IRouter } from "express";
import { db, udhariCustomersTable, udhariEntriesTable } from "@workspace/db";
import { eq, and, desc, or, ilike } from "drizzle-orm";
import { requireAuth, requirePermission, auditLog, getClientIp } from "../../lib/auth";
import { encryptField, decryptField } from "../../lib/encryption";
import { sanitize } from "../../lib/sanitize";
import { z } from "zod/v4";

export const router: IRouter = Router();

// ─── Shared helpers (also used by entries.ts) ─────────────────────────────────
export async function fmtCustomer(c: any) {
  return {
    ...c,
    address: await decryptField(c.address),
    notes: await decryptField(c.notes),
    balance: parseFloat(c.balance ?? "0"),
  };
}

export async function recalcBalance(customerId: number): Promise<void> {
  const entries = await db
    .select({ type: udhariEntriesTable.type, amount: udhariEntriesTable.amount })
    .from(udhariEntriesTable)
    .where(eq(udhariEntriesTable.customerId, customerId));

  let balance = 0;
  for (const e of entries) {
    const amt = parseFloat(e.amount ?? "0");
    if (e.type === "gave") balance += amt; else balance -= amt;
  }

  await db.update(udhariCustomersTable).set({ balance: String(balance), updatedAt: new Date() }).where(eq(udhariCustomersTable.id, customerId));
}

// ─── Validation schemas ───────────────────────────────────────────────────────
const CustomerInput = z.object({
  name: z.string().min(1).max(120),
  mobile: z.string().max(20).optional(),
  address: z.string().max(300).optional(),
  notes: z.string().max(500).optional(),
});

const CustomerUpdate = z.object({
  name: z.string().min(1).max(120).optional(),
  mobile: z.string().max(20).nullable().optional(),
  address: z.string().max(300).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

// ── GET /udhari/summary ───────────────────────────────────────────────────────
router.get("/udhari/summary", requireAuth, requirePermission("udhari:view"), async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const customers = await db.select({ balance: udhariCustomersTable.balance }).from(udhariCustomersTable).where(eq(udhariCustomersTable.createdBy, userId));

  let toCollect = 0;
  let toPay = 0;
  for (const c of customers) {
    const b = parseFloat(c.balance ?? "0");
    if (b > 0) toCollect += b; else if (b < 0) toPay += Math.abs(b);
  }

  res.json({ toCollect, toPay, totalCustomers: customers.length });
});

// ── GET /udhari/customers ─────────────────────────────────────────────────────
router.get("/udhari/customers", requireAuth, requirePermission("udhari:view"), async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const { q, sort } = req.query as { q?: string; sort?: string };

  let query = db.select().from(udhariCustomersTable).where(eq(udhariCustomersTable.createdBy, userId)).$dynamic();
  if (q) {
    query = query.where(and(
      eq(udhariCustomersTable.createdBy, userId),
      or(ilike(udhariCustomersTable.name, `%${q}%`), ilike(udhariCustomersTable.mobile, `%${q}%`))
    ));
  }

  const customers = await query.orderBy(desc(udhariCustomersTable.updatedAt));
  const formatted = await Promise.all(customers.map(fmtCustomer));

  if (sort === "balance_desc") formatted.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
  else if (sort === "alpha") formatted.sort((a, b) => a.name.localeCompare(b.name));

  res.json(formatted);
});

// ── POST /udhari/customers ────────────────────────────────────────────────────
router.post("/udhari/customers", requireAuth, requirePermission("udhari:manage"), async (req, res): Promise<void> => {
  const parsed = CustomerInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", details: parsed.error.issues }); return; }

  const userId = req.session.userId!;
  const { name, mobile, address, notes } = parsed.data;

  const [customer] = await db.insert(udhariCustomersTable).values({
    name: sanitize(name),
    mobile: mobile ? sanitize(mobile) : mobile,
    address: await encryptField(sanitize(address)),
    notes: await encryptField(sanitize(notes)),
    createdBy: userId,
  }).returning();

  await auditLog(userId, "udhari.customer.create", `Created customer: ${name}`, getClientIp(req));
  res.status(201).json(await fmtCustomer(customer));
});

// ── GET /udhari/customers/:customerId ─────────────────────────────────────────
router.get("/udhari/customers/:customerId", requireAuth, requirePermission("udhari:view"), async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const id = parseInt(req.params.customerId as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [customer] = await db.select().from(udhariCustomersTable).where(and(eq(udhariCustomersTable.id, id), eq(udhariCustomersTable.createdBy, userId)));
  if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }
  res.json(await fmtCustomer(customer));
});

// ── PATCH /udhari/customers/:customerId ──────────────────────────────────────
router.patch("/udhari/customers/:customerId", requireAuth, requirePermission("udhari:manage"), async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const id = parseInt(req.params.customerId as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = CustomerUpdate.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", details: parsed.error.issues }); return; }

  const [existing] = await db.select().from(udhariCustomersTable).where(and(eq(udhariCustomersTable.id, id), eq(udhariCustomersTable.createdBy, userId)));
  if (!existing) { res.status(404).json({ error: "Customer not found" }); return; }

  const updateData: any = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.name !== undefined) updateData.name = sanitize(parsed.data.name);
  if (parsed.data.mobile !== undefined) updateData.mobile = parsed.data.mobile ? sanitize(parsed.data.mobile) : parsed.data.mobile;
  if (parsed.data.address !== undefined) updateData.address = await encryptField(sanitize(parsed.data.address));
  if (parsed.data.notes !== undefined) updateData.notes = await encryptField(sanitize(parsed.data.notes));

  const [updated] = await db.update(udhariCustomersTable).set(updateData).where(eq(udhariCustomersTable.id, id)).returning();
  await auditLog(userId, "udhari.customer.update", `Updated customer: ${existing.name}`, getClientIp(req));
  res.json(await fmtCustomer(updated));
});

// ── DELETE /udhari/customers/:customerId ─────────────────────────────────────
router.delete("/udhari/customers/:customerId", requireAuth, requirePermission("udhari:manage"), async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const id = parseInt(req.params.customerId as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [existing] = await db.select().from(udhariCustomersTable).where(and(eq(udhariCustomersTable.id, id), eq(udhariCustomersTable.createdBy, userId)));
  if (!existing) { res.status(404).json({ error: "Customer not found" }); return; }

  await db.delete(udhariCustomersTable).where(eq(udhariCustomersTable.id, id));
  await auditLog(userId, "udhari.customer.delete", `Deleted customer: ${existing.name}`, getClientIp(req));
  res.json({ message: "Customer deleted" });
});

export default router;
