import { Router, type IRouter } from "express";
import { db, ledgerTable, usersTable } from "@workspace/db";
import { and, gte, lte, eq, sql, sum, count, desc } from "drizzle-orm";
import { requireAuth, requirePermission } from "../lib/auth";
import { getServiceBreakdownData } from "./reports";
import { cached } from "../lib/query-cache";
import { asyncHandler } from "../lib/async-handler";

const router: IRouter = Router();

router.get("/dashboard", requireAuth, requirePermission("reports:view"), asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const userId = req.session.userId!;
  const userFilter = eq(ledgerTable.createdBy, userId);
  const todayFilter = eq(ledgerTable.date, today);
  const monthFilter = and(gte(ledgerTable.date, monthStart), lte(ledgerTable.date, today));

  const balanceWhere = userFilter;
  const todayWhere = and(userFilter, todayFilter);
  const monthWhere = and(userFilter, monthFilter);

  // Short TTL cache: this endpoint runs 5 grouped aggregate scans over the full
  // ledger table on every hit. A 5s window absorbs repeat dashboard loads
  // (widget refreshes, tab switches) without ever serving more than 5s-stale
  // data, and is invalidated immediately on any ledger write for this user.
  const [balanceResult, todayResult, monthResult, recentEntries, topServices] = await cached(
    `dashboard:${userId}:${today}`,
    5_000,
    () =>
      Promise.all([
        db.select({ totalCredits: sum(ledgerTable.credit), totalDebits: sum(ledgerTable.debit) }).from(ledgerTable).where(balanceWhere),
        db.select({ credits: sum(ledgerTable.credit), debits: sum(ledgerTable.debit), transactions: count() }).from(ledgerTable).where(todayWhere),
        db.select({ credits: sum(ledgerTable.credit), debits: sum(ledgerTable.debit), transactions: count() }).from(ledgerTable).where(monthWhere),
        db.select({
          id: ledgerTable.id, date: ledgerTable.date, customerName: ledgerTable.customerName,
          serviceType: ledgerTable.serviceType, credit: ledgerTable.credit, debit: ledgerTable.debit,
          description: ledgerTable.description, balance: ledgerTable.balance,
          createdBy: ledgerTable.createdBy, createdAt: ledgerTable.createdAt,
          createdByName: usersTable.fullName,
        }).from(ledgerTable).leftJoin(usersTable, eq(ledgerTable.createdBy, usersTable.id)).where(balanceWhere).orderBy(desc(ledgerTable.createdAt)).limit(5),
        getServiceBreakdownData(monthStart, today, userFilter),
      ]),
  );

  const totalCredits = parseFloat(balanceResult[0]?.totalCredits ?? "0");
  const totalDebits = parseFloat(balanceResult[0]?.totalDebits ?? "0");
  const monthCredits = parseFloat(monthResult[0]?.credits ?? "0");
  const monthDebits = parseFloat(monthResult[0]?.debits ?? "0");

  res.json({
    currentBalance: totalCredits - totalDebits,
    todayCredits: parseFloat(todayResult[0]?.credits ?? "0"),
    todayDebits: parseFloat(todayResult[0]?.debits ?? "0"),
    todayTransactions: todayResult[0]?.transactions ?? 0,
    monthCredits, monthDebits,
    monthTransactions: monthResult[0]?.transactions ?? 0,
    netProfitMonth: monthCredits - monthDebits,
    recentEntries: recentEntries.map((e) => ({
      id: e.id, date: e.date, customerName: e.customerName,
      serviceType: e.serviceType, credit: parseFloat(e.credit ?? "0"),
      debit: parseFloat(e.debit ?? "0"), description: e.description,
      balance: parseFloat(e.balance ?? "0"), createdBy: e.createdBy,
      createdByName: e.createdByName ?? null,
      createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
    })),
    topServicesMonth: topServices.slice(0, 5),
  });
}));

export default router;
