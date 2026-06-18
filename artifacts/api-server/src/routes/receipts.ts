import { Router, type IRouter } from "express";
import { db, ledgerTable, usersTable, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

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
    .where(eq(settingsTable.key, "businessName"));

  const businessName = settingsRows.find((r) => r.key === "businessName")?.value ?? "SAHU CSC";

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
    businessName,
  });
});

export default router;
