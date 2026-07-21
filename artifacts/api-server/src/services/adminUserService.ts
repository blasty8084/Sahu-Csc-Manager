import { db, ledgerTable, usersTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";

export async function getUserLedger(userId: number, page: number, limit: number) {
  const offset = (page - 1) * limit;
  const [entries, totalResult, user] = await Promise.all([
    db
      .select({
        id: ledgerTable.id, date: ledgerTable.date, customerName: ledgerTable.customerName,
        serviceType: ledgerTable.serviceType, credit: ledgerTable.credit, debit: ledgerTable.debit,
        description: ledgerTable.description, balance: ledgerTable.balance,
        createdBy: ledgerTable.createdBy, createdAt: ledgerTable.createdAt,
      })
      .from(ledgerTable)
      .where(eq(ledgerTable.createdBy, userId))
      .orderBy(desc(ledgerTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(ledgerTable).where(eq(ledgerTable.createdBy, userId)),
    db.select({ username: usersTable.username, fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, userId)),
  ]);
  if (!user[0]) return null;
  return {
    user: user[0],
    entries: entries.map((e) => ({
      id: e.id, date: e.date, customerName: e.customerName,
      serviceType: e.serviceType,
      credit: parseFloat(e.credit ?? "0"),
      debit: parseFloat(e.debit ?? "0"),
      description: e.description,
      balance: parseFloat(e.balance ?? "0"),
      createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
    })),
    total: totalResult[0]?.total ?? 0,
  };
}
