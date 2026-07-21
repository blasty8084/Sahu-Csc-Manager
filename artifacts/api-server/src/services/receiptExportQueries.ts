import { db, ledgerTable, usersTable } from "@workspace/db";
import { eq, and, gte, lte, isNotNull, inArray, asc, count } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import type { BulkExportQuery } from "./receiptExportSchemas";

/** Build the WHERE clause from validated bulk-export query params. */
export function buildBulkConditions(params: BulkExportQuery): SQL | undefined {
  const { startDate, endDate, userId, receiptNumbers: receiptNumbersParam } = params;
  const selectedNumbers = receiptNumbersParam
    ? receiptNumbersParam.split(",").map((s) => s.trim()).filter(Boolean)
    : null;

  const conditions = [
    gte(ledgerTable.date, startDate),
    lte(ledgerTable.date, endDate),
    isNotNull(ledgerTable.receiptNumber),
  ];
  if (userId !== undefined) conditions.push(eq(ledgerTable.createdBy, userId));
  if (selectedNumbers && selectedNumbers.length > 0) {
    conditions.push(inArray(ledgerTable.receiptNumber, selectedNumbers));
  }
  return and(...conditions);
}

/** Count receipts matching a WHERE clause (no row fetch). */
export async function countBulkReceipts(where: SQL | undefined): Promise<number> {
  const [row] = await db.select({ total: count() }).from(ledgerTable).where(where);
  return Number(row?.total ?? 0);
}

const PREVIEW_LIMIT = 200;

/** Count + capped preview list for the confirmation dialog. */
export async function previewBulkReceipts(where: SQL | undefined) {
  const entries = await db
    .select({
      receiptNumber: ledgerTable.receiptNumber,
      date: ledgerTable.date,
      customerName: ledgerTable.customerName,
      serviceType: ledgerTable.serviceType,
      credit: ledgerTable.credit,
      debit: ledgerTable.debit,
      createdByName: usersTable.username,
    })
    .from(ledgerTable)
    .leftJoin(usersTable, eq(ledgerTable.createdBy, usersTable.id))
    .where(where)
    .orderBy(asc(ledgerTable.date), asc(ledgerTable.id))
    .limit(PREVIEW_LIMIT);

  return entries.map((e) => ({
    receiptNumber: e.receiptNumber,
    date: e.date,
    customerName: e.customerName,
    serviceType: e.serviceType,
    amount: parseFloat(e.credit ?? "0") > 0 ? parseFloat(e.credit!) : parseFloat(e.debit ?? "0"),
    type: parseFloat(e.credit ?? "0") > 0 ? ("credit" as const) : ("debit" as const),
    operator: e.createdByName,
  }));
}

/** One page of full receipt rows for ZIP generation. */
export async function fetchBulkReceiptPage(where: SQL | undefined, offset: number, pageSize = 200) {
  return db
    .select({
      id: ledgerTable.id,
      receiptNumber: ledgerTable.receiptNumber,
      date: ledgerTable.date,
      customerName: ledgerTable.customerName,
      serviceType: ledgerTable.serviceType,
      credit: ledgerTable.credit,
      debit: ledgerTable.debit,
      description: ledgerTable.description,
      receiptToken: ledgerTable.receiptToken,
      createdAt: ledgerTable.createdAt,
      createdByName: usersTable.username,
    })
    .from(ledgerTable)
    .leftJoin(usersTable, eq(ledgerTable.createdBy, usersTable.id))
    .where(where)
    .orderBy(asc(ledgerTable.date), asc(ledgerTable.id))
    .limit(pageSize)
    .offset(offset);
}

/** All receipt rows for Excel export (fetched in one shot — caller already checked count). */
export async function fetchAllReceiptsForExcel(where: SQL | undefined) {
  return db
    .select({
      receiptNumber: ledgerTable.receiptNumber,
      date: ledgerTable.date,
      customerName: ledgerTable.customerName,
      serviceType: ledgerTable.serviceType,
      credit: ledgerTable.credit,
      debit: ledgerTable.debit,
      balance: ledgerTable.balance,
      description: ledgerTable.description,
      createdByName: usersTable.username,
    })
    .from(ledgerTable)
    .leftJoin(usersTable, eq(ledgerTable.createdBy, usersTable.id))
    .where(where)
    .orderBy(asc(ledgerTable.date), asc(ledgerTable.id));
}

/** Single receipt row for print/PDF/share actions. */
export async function fetchSingleReceiptEntry(receiptNumber: string) {
  const [entry] = await db
    .select({
      id: ledgerTable.id,
      receiptNumber: ledgerTable.receiptNumber,
      date: ledgerTable.date,
      customerName: ledgerTable.customerName,
      serviceType: ledgerTable.serviceType,
      credit: ledgerTable.credit,
      debit: ledgerTable.debit,
      description: ledgerTable.description,
      balance: ledgerTable.balance,
      receiptToken: ledgerTable.receiptToken,
      createdAt: ledgerTable.createdAt,
      createdByName: usersTable.username,
    })
    .from(ledgerTable)
    .leftJoin(usersTable, eq(ledgerTable.createdBy, usersTable.id))
    .where(eq(ledgerTable.receiptNumber, receiptNumber))
    .limit(1);
  return entry;
}
