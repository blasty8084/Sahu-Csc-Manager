import { db, ledgerTable, usersTable, settingsTable } from "@workspace/db";
import { eq, and, gte, lte, isNotNull, inArray, asc } from "drizzle-orm";
import { createRequire } from "node:module";
import { generateReceiptPdf, type BizInfo } from "./pdf";

const _require = createRequire(import.meta.url);
const { ZipArchive } = _require("archiver") as typeof import("archiver");

export async function buildMonthlyZip(year: number, month: number): Promise<Buffer> {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  const settingsRows = await db
    .select({ key: settingsTable.key, value: settingsTable.value })
    .from(settingsTable)
    .where(inArray(settingsTable.key, ["businessName", "businessAddress", "businessMobile", "businessWebsite"]));
  const get = (k: string, fb = "") => settingsRows.find((r) => r.key === k)?.value ?? fb;
  const biz: BizInfo = {
    businessName: get("businessName", "SAHU CSC Center"),
    businessAddress: get("businessAddress"),
    businessMobile: get("businessMobile"),
    businessWebsite: get("businessWebsite"),
  };

  const entries = await db
    .select({
      id: ledgerTable.id, receiptNumber: ledgerTable.receiptNumber,
      date: ledgerTable.date, customerName: ledgerTable.customerName,
      serviceType: ledgerTable.serviceType, credit: ledgerTable.credit,
      debit: ledgerTable.debit, description: ledgerTable.description,
      createdAt: ledgerTable.createdAt, createdByName: usersTable.username,
    })
    .from(ledgerTable)
    .leftJoin(usersTable, eq(ledgerTable.createdBy, usersTable.id))
    .where(and(gte(ledgerTable.date, startDate), lte(ledgerTable.date, endDate), isNotNull(ledgerTable.receiptNumber)))
    .orderBy(asc(ledgerTable.date), asc(ledgerTable.id));

  const pdfs: Array<{ name: string; buf: Buffer }> = [];
  for (const entry of entries) {
    const buf = await generateReceiptPdf(
      {
        receiptNumber: entry.receiptNumber!,
        date: entry.date,
        customerName: entry.customerName,
        serviceType: entry.serviceType,
        credit: parseFloat(entry.credit ?? "0"),
        debit: parseFloat(entry.debit ?? "0"),
        description: entry.description ?? null,
        createdByName: entry.createdByName ?? null,
        createdAt: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : (entry.createdAt ?? new Date().toISOString()),
      },
      biz
    );
    pdfs.push({ name: `${entry.receiptNumber}.pdf`, buf });
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const archive = new ZipArchive({ zlib: { level: 6 } });
    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);
    for (const { name, buf } of pdfs) archive.append(buf, { name });
    archive.finalize();
  });
}
