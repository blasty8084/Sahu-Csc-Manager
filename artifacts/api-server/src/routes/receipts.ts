import { Router, type IRouter } from "express";
import { db, ledgerTable, usersTable, settingsTable, udhariEntriesTable, udhariCustomersTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

const router: IRouter = Router();

// ── Udhari Khata receipt verify ───────────────────────────────────────────────
// IMPORTANT: must be registered BEFORE /receipts/verify/:token so Express does
// not swallow "udhari" as the :token value.
router.get("/receipts/verify/udhari/:token", async (req, res): Promise<void> => {
  const { token } = req.params;
  if (!token || typeof token !== "string" || token.length < 16) {
    res.status(400).json({ error: "Invalid token" });
    return;
  }

  const [entry] = await db
    .select({
      id: udhariEntriesTable.id,
      customerId: udhariEntriesTable.customerId,
      date: udhariEntriesTable.date,
      type: udhariEntriesTable.type,
      amount: udhariEntriesTable.amount,
      note: udhariEntriesTable.note,
      receiptToken: udhariEntriesTable.receiptToken,
      createdAt: udhariEntriesTable.createdAt,
    })
    .from(udhariEntriesTable)
    .where(eq(udhariEntriesTable.receiptToken, token));

  if (!entry) {
    res.status(404).json({ error: "Receipt not found" });
    return;
  }

  const [customer] = await db
    .select({
      name: udhariCustomersTable.name,
      mobile: udhariCustomersTable.mobile,
      address: udhariCustomersTable.address,
      balance: udhariCustomersTable.balance,
    })
    .from(udhariCustomersTable)
    .where(eq(udhariCustomersTable.id, entry.customerId));

  const settingsRows = await db
    .select({ key: settingsTable.key, value: settingsTable.value })
    .from(settingsTable)
    .where(inArray(settingsTable.key, ["businessName", "businessAddress", "businessMobile", "businessWebsite"]));

  const getSetting = (key: string, fallback = "") =>
    settingsRows.find((r) => r.key === key)?.value ?? fallback;

  const year = new Date(entry.date + "T00:00:00").getFullYear();
  const receiptNumber = `UDH-${year}-${String(entry.id).padStart(4, "0")}`;

  res.json({
    receiptNumber,
    date: entry.date,
    type: entry.type,
    amount: parseFloat(entry.amount ?? "0"),
    note: entry.note,
    customerName: customer?.name ?? "Unknown",
    customerMobile: customer?.mobile ?? null,
    customerAddress: customer?.address ?? null,
    currentBalance: parseFloat(customer?.balance ?? "0"),
    createdAt: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : entry.createdAt,
    businessName: getSetting("businessName", "SAHU CSC Center"),
    businessAddress: getSetting("businessAddress", ""),
    businessMobile: getSetting("businessMobile", ""),
    businessWebsite: getSetting("businessWebsite", ""),
  });
});

// ── Ledger receipt verify ────────────────────────────────────────────────────
router.get("/receipts/verify/:token", async (req, res): Promise<void> => {
  const { token } = req.params;
  if (!token || typeof token !== "string" || token.length < 16) {
    res.status(400).json({ error: "Invalid token" });
    return;
  }

  const [entry] = await db
    .select({
      id: ledgerTable.id,
      date: ledgerTable.date,
      customerName: ledgerTable.customerName,
      serviceType: ledgerTable.serviceType,
      credit: ledgerTable.credit,
      debit: ledgerTable.debit,
      description: ledgerTable.description,
      receiptNumber: ledgerTable.receiptNumber,
      createdAt: ledgerTable.createdAt,
      createdByName: usersTable.username,
    })
    .from(ledgerTable)
    .leftJoin(usersTable, eq(ledgerTable.createdBy, usersTable.id))
    .where(eq(ledgerTable.receiptToken, token));

  if (!entry || !entry.receiptNumber) {
    res.status(404).json({ error: "Receipt not found" });
    return;
  }

  const settingsRows = await db
    .select({ key: settingsTable.key, value: settingsTable.value })
    .from(settingsTable)
    .where(inArray(settingsTable.key, ["businessName", "businessAddress", "businessMobile", "businessWebsite"]));

  const getSetting = (key: string, fallback = "") =>
    settingsRows.find((r) => r.key === key)?.value ?? fallback;

  res.json({
    receiptNumber: entry.receiptNumber,
    date: entry.date,
    customerName: entry.customerName,
    serviceType: entry.serviceType,
    credit: parseFloat(entry.credit ?? "0"),
    debit: parseFloat(entry.debit ?? "0"),
    description: entry.description,
    createdByName: entry.createdByName ?? null,
    createdAt: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : entry.createdAt,
    businessName: getSetting("businessName", "SAHU CSC Center"),
    businessAddress: getSetting("businessAddress", ""),
    businessMobile: getSetting("businessMobile", ""),
    businessWebsite: getSetting("businessWebsite", ""),
  });
});

export default router;
