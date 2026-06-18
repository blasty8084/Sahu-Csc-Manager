import { Router } from "express";
import { db, udhariCustomersTable, udhariEntriesTable } from "@workspace/db";
import { eq, and, desc, sql, or, ilike } from "drizzle-orm";
import { requireAuth, requirePermission, auditLog, getClientIp } from "../lib/auth";
import { z } from "zod/v4";

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(c: any) {
  return {
    ...c,
    balance: parseFloat(c.balance ?? "0"),
  };
}

function fmtEntry(e: any) {
  return {
    ...e,
    amount: parseFloat(e.amount ?? "0"),
  };
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

// ─── Recalculate customer balance from all entries ────────────────────────────
async function recalcBalance(customerId: number): Promise<void> {
  const entries = await db
    .select({ type: udhariEntriesTable.type, amount: udhariEntriesTable.amount })
    .from(udhariEntriesTable)
    .where(eq(udhariEntriesTable.customerId, customerId));

  let balance = 0;
  for (const e of entries) {
    const amt = parseFloat(e.amount ?? "0");
    if (e.type === "gave") balance += amt;
    else balance -= amt;
  }

  await db
    .update(udhariCustomersTable)
    .set({ balance: String(balance), updatedAt: new Date() })
    .where(eq(udhariCustomersTable.id, customerId));
}

// ─── GET /udhari/summary ──────────────────────────────────────────────────────
router.get(
  "/udhari/summary",
  requireAuth,
  requirePermission("udhari:view"),
  async (req, res): Promise<void> => {
    const userId = req.session.userId!;

    const customers = await db
      .select({ balance: udhariCustomersTable.balance })
      .from(udhariCustomersTable)
      .where(eq(udhariCustomersTable.createdBy, userId));

    let toCollect = 0;
    let toPay = 0;
    for (const c of customers) {
      const b = parseFloat(c.balance ?? "0");
      if (b > 0) toCollect += b;
      else if (b < 0) toPay += Math.abs(b);
    }

    res.json({ toCollect, toPay, totalCustomers: customers.length });
  }
);

// ─── GET /udhari/customers ────────────────────────────────────────────────────
router.get(
  "/udhari/customers",
  requireAuth,
  requirePermission("udhari:view"),
  async (req, res): Promise<void> => {
    const userId = req.session.userId!;
    const { q, sort } = req.query as { q?: string; sort?: string };

    let query = db
      .select()
      .from(udhariCustomersTable)
      .where(eq(udhariCustomersTable.createdBy, userId))
      .$dynamic();

    if (q) {
      query = query.where(
        and(
          eq(udhariCustomersTable.createdBy, userId),
          or(
            ilike(udhariCustomersTable.name, `%${q}%`),
            ilike(udhariCustomersTable.mobile, `%${q}%`)
          )
        )
      );
    }

    const customers = await query.orderBy(desc(udhariCustomersTable.updatedAt));

    const formatted = customers.map(fmt);

    if (sort === "balance_desc") {
      formatted.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
    } else if (sort === "alpha") {
      formatted.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.json(formatted);
  }
);

// ─── POST /udhari/customers ───────────────────────────────────────────────────
router.post(
  "/udhari/customers",
  requireAuth,
  requirePermission("udhari:manage"),
  async (req, res): Promise<void> => {
    const parsed = CustomerInput.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
      return;
    }
    const userId = req.session.userId!;
    const { name, mobile, address, notes } = parsed.data;

    const [customer] = await db
      .insert(udhariCustomersTable)
      .values({ name, mobile, address, notes, createdBy: userId })
      .returning();

    await auditLog(userId, "udhari.customer.create", `Created customer: ${name}`, getClientIp(req));
    res.status(201).json(fmt(customer));
  }
);

// ─── GET /udhari/customers/:customerId ───────────────────────────────────────
router.get(
  "/udhari/customers/:customerId",
  requireAuth,
  requirePermission("udhari:view"),
  async (req, res): Promise<void> => {
    const userId = req.session.userId!;
    const id = parseInt(req.params.customerId as string);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const [customer] = await db
      .select()
      .from(udhariCustomersTable)
      .where(and(eq(udhariCustomersTable.id, id), eq(udhariCustomersTable.createdBy, userId)));

    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }
    res.json(fmt(customer));
  }
);

// ─── PATCH /udhari/customers/:customerId ─────────────────────────────────────
router.patch(
  "/udhari/customers/:customerId",
  requireAuth,
  requirePermission("udhari:manage"),
  async (req, res): Promise<void> => {
    const userId = req.session.userId!;
    const id = parseInt(req.params.customerId as string);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const parsed = CustomerUpdate.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
      return;
    }

    const [existing] = await db
      .select()
      .from(udhariCustomersTable)
      .where(and(eq(udhariCustomersTable.id, id), eq(udhariCustomersTable.createdBy, userId)));

    if (!existing) { res.status(404).json({ error: "Customer not found" }); return; }

    const [updated] = await db
      .update(udhariCustomersTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(udhariCustomersTable.id, id))
      .returning();

    await auditLog(userId, "udhari.customer.update", `Updated customer: ${existing.name}`, getClientIp(req));
    res.json(fmt(updated));
  }
);

// ─── DELETE /udhari/customers/:customerId ────────────────────────────────────
router.delete(
  "/udhari/customers/:customerId",
  requireAuth,
  requirePermission("udhari:manage"),
  async (req, res): Promise<void> => {
    const userId = req.session.userId!;
    const id = parseInt(req.params.customerId as string);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const [existing] = await db
      .select()
      .from(udhariCustomersTable)
      .where(and(eq(udhariCustomersTable.id, id), eq(udhariCustomersTable.createdBy, userId)));

    if (!existing) { res.status(404).json({ error: "Customer not found" }); return; }

    await db.delete(udhariCustomersTable).where(eq(udhariCustomersTable.id, id));
    await auditLog(userId, "udhari.customer.delete", `Deleted customer: ${existing.name}`, getClientIp(req));
    res.json({ message: "Customer deleted" });
  }
);

// ─── GET /udhari/customers/:customerId/entries ────────────────────────────────
router.get(
  "/udhari/customers/:customerId/entries",
  requireAuth,
  requirePermission("udhari:view"),
  async (req, res): Promise<void> => {
    const userId = req.session.userId!;
    const customerId = parseInt(req.params.customerId as string);
    if (isNaN(customerId)) { res.status(400).json({ error: "Invalid id" }); return; }

    const [customer] = await db
      .select()
      .from(udhariCustomersTable)
      .where(and(eq(udhariCustomersTable.id, customerId), eq(udhariCustomersTable.createdBy, userId)));
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const entries = await db
      .select()
      .from(udhariEntriesTable)
      .where(eq(udhariEntriesTable.customerId, customerId))
      .orderBy(desc(udhariEntriesTable.date), desc(udhariEntriesTable.createdAt));

    res.json(entries.map(fmtEntry));
  }
);

// ─── POST /udhari/customers/:customerId/entries ───────────────────────────────
router.post(
  "/udhari/customers/:customerId/entries",
  requireAuth,
  requirePermission("udhari:manage"),
  async (req, res): Promise<void> => {
    const userId = req.session.userId!;
    const customerId = parseInt(req.params.customerId as string);
    if (isNaN(customerId)) { res.status(400).json({ error: "Invalid id" }); return; }

    const parsed = EntryInput.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
      return;
    }

    const [customer] = await db
      .select()
      .from(udhariCustomersTable)
      .where(and(eq(udhariCustomersTable.id, customerId), eq(udhariCustomersTable.createdBy, userId)));
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const { date, type, amount, note } = parsed.data;

    const [entry] = await db
      .insert(udhariEntriesTable)
      .values({ customerId, date, type, amount: String(amount), note: note ?? "", createdBy: userId })
      .returning();

    await recalcBalance(customerId);

    const [updated] = await db.select().from(udhariCustomersTable).where(eq(udhariCustomersTable.id, customerId));
    await auditLog(userId, "udhari.entry.create", `${type === "gave" ? "Gave" : "Got"} ₹${amount} for customer: ${customer.name}`, getClientIp(req));

    res.status(201).json({ entry: fmtEntry(entry), customer: fmt(updated) });
  }
);

// ─── PATCH /udhari/customers/:customerId/entries/:entryId ─────────────────────
router.patch(
  "/udhari/customers/:customerId/entries/:entryId",
  requireAuth,
  requirePermission("udhari:manage"),
  async (req, res): Promise<void> => {
    const userId = req.session.userId!;
    const customerId = parseInt(req.params.customerId as string);
    const entryId = parseInt(req.params.entryId as string);
    if (isNaN(customerId) || isNaN(entryId)) { res.status(400).json({ error: "Invalid id" }); return; }

    const parsed = EntryUpdate.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
      return;
    }

    const [customer] = await db
      .select()
      .from(udhariCustomersTable)
      .where(and(eq(udhariCustomersTable.id, customerId), eq(udhariCustomersTable.createdBy, userId)));
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const [existing] = await db
      .select()
      .from(udhariEntriesTable)
      .where(and(eq(udhariEntriesTable.id, entryId), eq(udhariEntriesTable.customerId, customerId)));
    if (!existing) { res.status(404).json({ error: "Entry not found" }); return; }

    const updateData: any = { ...parsed.data, updatedAt: new Date() };
    if (parsed.data.amount !== undefined) updateData.amount = String(parsed.data.amount);

    const [updated] = await db
      .update(udhariEntriesTable)
      .set(updateData)
      .where(eq(udhariEntriesTable.id, entryId))
      .returning();

    await recalcBalance(customerId);
    const [updatedCustomer] = await db.select().from(udhariCustomersTable).where(eq(udhariCustomersTable.id, customerId));

    res.json({ entry: fmtEntry(updated), customer: fmt(updatedCustomer) });
  }
);

// ─── DELETE /udhari/customers/:customerId/entries/:entryId ────────────────────
router.delete(
  "/udhari/customers/:customerId/entries/:entryId",
  requireAuth,
  requirePermission("udhari:manage"),
  async (req, res): Promise<void> => {
    const userId = req.session.userId!;
    const customerId = parseInt(req.params.customerId as string);
    const entryId = parseInt(req.params.entryId as string);
    if (isNaN(customerId) || isNaN(entryId)) { res.status(400).json({ error: "Invalid id" }); return; }

    const [customer] = await db
      .select()
      .from(udhariCustomersTable)
      .where(and(eq(udhariCustomersTable.id, customerId), eq(udhariCustomersTable.createdBy, userId)));
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const [existing] = await db
      .select()
      .from(udhariEntriesTable)
      .where(and(eq(udhariEntriesTable.id, entryId), eq(udhariEntriesTable.customerId, customerId)));
    if (!existing) { res.status(404).json({ error: "Entry not found" }); return; }

    await db.delete(udhariEntriesTable).where(eq(udhariEntriesTable.id, entryId));
    await recalcBalance(customerId);
    const [updatedCustomer] = await db.select().from(udhariCustomersTable).where(eq(udhariCustomersTable.id, customerId));

    res.json({ message: "Entry deleted", customer: fmt(updatedCustomer) });
  }
);

export default router;
