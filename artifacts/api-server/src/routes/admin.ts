import { Router, type IRouter } from "express";
import { db, ledgerTable, usersTable } from "@workspace/db";
import { eq, sum, count, desc } from "drizzle-orm";
import { requireRole } from "../lib/auth";

const router: IRouter = Router();

router.get("/admin/users-overview", requireRole("admin"), async (_req, res): Promise<void> => {
  const users = await db.select({ id: usersTable.id, username: usersTable.username, fullName: usersTable.fullName, role: usersTable.role, isActive: usersTable.isActive }).from(usersTable);

  const summaries = await Promise.all(
    users.map(async (user) => {
      const [balance] = await db
        .select({ totalCredits: sum(ledgerTable.credit), totalDebits: sum(ledgerTable.debit), totalTransactions: count() })
        .from(ledgerTable)
        .where(eq(ledgerTable.createdBy, user.id));

      const totalCredits = parseFloat(balance?.totalCredits ?? "0");
      const totalDebits = parseFloat(balance?.totalDebits ?? "0");

      const [recent] = await db
        .select({ date: ledgerTable.date, customerName: ledgerTable.customerName, serviceType: ledgerTable.serviceType, credit: ledgerTable.credit, debit: ledgerTable.debit })
        .from(ledgerTable)
        .where(eq(ledgerTable.createdBy, user.id))
        .orderBy(desc(ledgerTable.createdAt))
        .limit(1);

      return {
        userId: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        balance: totalCredits - totalDebits,
        totalCredits,
        totalDebits,
        totalTransactions: balance?.totalTransactions ?? 0,
        lastEntry: recent
          ? {
              date: recent.date,
              customerName: recent.customerName,
              serviceType: recent.serviceType,
              credit: parseFloat(recent.credit ?? "0"),
              debit: parseFloat(recent.debit ?? "0"),
            }
          : null,
      };
    })
  );

  res.json(summaries);
});

router.get("/admin/users-overview/:userId/ledger", requireRole("admin"), async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(rawId, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }

  const page = parseInt((req.query.page as string) ?? "1", 10);
  const limit = parseInt((req.query.limit as string) ?? "20", 10);
  const offset = (page - 1) * limit;

  const [entries, totalResult, user] = await Promise.all([
    db.select({
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

  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  res.json({
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
    page,
    limit,
  });
});

export default router;
