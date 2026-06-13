import { Router, type IRouter } from "express";
import { db, ledgerTable, aepsDailyTable, aepsTransactionsTable, usersTable } from "@workspace/db";
import { and, gte, lte, eq, sql, sum, count, desc } from "drizzle-orm";
import { GetDailyReportQueryParams, GetMonthlyReportQueryParams, GetServiceBreakdownQueryParams, ExportReportQueryParams } from "@workspace/api-zod";
import { requireAuth, requirePermission } from "../lib/auth";
import * as XLSX from "xlsx";

const router: IRouter = Router();

function getUserFilter(req: any) {
  const userId = req.session.userId!;
  return eq(ledgerTable.createdBy, userId);
}

async function getServiceBreakdownData(startDate: string, endDate: string, userFilter?: any) {
  const dateFilter = and(gte(ledgerTable.date, startDate), lte(ledgerTable.date, endDate));
  const whereClause = userFilter ? and(userFilter, dateFilter) : dateFilter;

  const rows = await db
    .select({
      serviceType: ledgerTable.serviceType,
      count: count(),
      revenue: sum(ledgerTable.credit),
    })
    .from(ledgerTable)
    .where(whereClause)
    .groupBy(ledgerTable.serviceType)
    .orderBy(desc(sum(ledgerTable.credit)));

  return rows.map((r) => ({
    serviceType: r.serviceType,
    count: r.count,
    revenue: parseFloat(r.revenue ?? "0"),
  }));
}

async function getAepsData(startDate: string, endDate: string) {
  const sessions = await db
    .select({ id: aepsDailyTable.id, date: aepsDailyTable.date, openingBalance: aepsDailyTable.openingBalance })
    .from(aepsDailyTable)
    .where(and(gte(aepsDailyTable.date, startDate), lte(aepsDailyTable.date, endDate)));

  if (sessions.length === 0) {
    return { totalWithdrawals: 0, totalDeposits: 0, totalTransactions: 0, sessions: [] };
  }

  const sessionIds = sessions.map((s) => s.id);

  const txRows = await db
    .select({
      dailyId: aepsTransactionsTable.dailyId,
      type: aepsTransactionsTable.type,
      total: sum(aepsTransactionsTable.amount),
      txCount: count(),
    })
    .from(aepsTransactionsTable)
    .where(sql`${aepsTransactionsTable.dailyId} = ANY(ARRAY[${sql.raw(sessionIds.join(","))}])`)
    .groupBy(aepsTransactionsTable.dailyId, aepsTransactionsTable.type);

  const sessionMap = new Map<number, { withdrawals: number; deposits: number; count: number }>();
  for (const s of sessions) sessionMap.set(s.id, { withdrawals: 0, deposits: 0, count: 0 });
  for (const row of txRows) {
    const entry = sessionMap.get(row.dailyId)!;
    const amount = parseFloat(row.total ?? "0");
    if (row.type === "withdrawal") {
      entry.withdrawals += amount;
    } else {
      entry.deposits += amount;
    }
    entry.count += row.txCount;
  }

  let totalWithdrawals = 0;
  let totalDeposits = 0;
  let totalTransactions = 0;

  const sessionList = sessions.map((s) => {
    const entry = sessionMap.get(s.id)!;
    totalWithdrawals += entry.withdrawals;
    totalDeposits += entry.deposits;
    totalTransactions += entry.count;
    return {
      date: s.date,
      openingBalance: parseFloat(s.openingBalance ?? "0"),
      withdrawals: entry.withdrawals,
      deposits: entry.deposits,
      transactions: entry.count,
      netFlow: entry.deposits - entry.withdrawals,
    };
  });

  return { totalWithdrawals, totalDeposits, totalTransactions, sessions: sessionList };
}

router.get("/reports/daily", requireAuth, requirePermission("reports:view"), async (req, res): Promise<void> => {
  const params = GetDailyReportQueryParams.safeParse(req.query);
  const date = params.success && params.data.date ? params.data.date as string : new Date().toISOString().split("T")[0];

  const userFilter = getUserFilter(req);
  const dateFilter = eq(ledgerTable.date, date);
  const whereClause = userFilter ? and(userFilter, dateFilter) : dateFilter;

  const [result, aeps] = await Promise.all([
    db
      .select({ totalCredits: sum(ledgerTable.credit), totalDebits: sum(ledgerTable.debit), totalTransactions: count() })
      .from(ledgerTable)
      .where(whereClause),
    getAepsData(date, date),
  ]);

  const totalCredits = parseFloat(result[0]?.totalCredits ?? "0");
  const totalDebits = parseFloat(result[0]?.totalDebits ?? "0");
  const topServices = await getServiceBreakdownData(date, date, userFilter);

  res.json({
    date,
    transactionCount: result[0]?.totalTransactions ?? 0,
    totalCredits,
    totalDebits,
    netRevenue: totalCredits - totalDebits,
    topServices: topServices.slice(0, 5),
    aeps: {
      totalWithdrawals: aeps.totalWithdrawals,
      totalDeposits: aeps.totalDeposits,
      totalTransactions: aeps.totalTransactions,
      netFlow: aeps.totalDeposits - aeps.totalWithdrawals,
    },
  });
});

router.get("/reports/monthly", requireAuth, requirePermission("reports:view"), async (req, res): Promise<void> => {
  const params = GetMonthlyReportQueryParams.safeParse(req.query);
  const now = new Date();
  const year = params.success && params.data.year ? params.data.year : now.getFullYear();
  const month = params.success && params.data.month ? params.data.month : now.getMonth() + 1;

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const userFilter = getUserFilter(req);
  const dateFilter = and(gte(ledgerTable.date, startDate), lte(ledgerTable.date, endDate));
  const whereClause = userFilter ? and(userFilter, dateFilter) : dateFilter;

  const [result, dailyRows, topServices, aeps] = await Promise.all([
    db
      .select({ totalCredits: sum(ledgerTable.credit), totalDebits: sum(ledgerTable.debit), totalTransactions: count() })
      .from(ledgerTable)
      .where(whereClause),
    db
      .select({ date: ledgerTable.date, credits: sum(ledgerTable.credit), debits: sum(ledgerTable.debit), transactions: count() })
      .from(ledgerTable)
      .where(whereClause)
      .groupBy(ledgerTable.date)
      .orderBy(ledgerTable.date),
    getServiceBreakdownData(startDate, endDate, userFilter),
    getAepsData(startDate, endDate),
  ]);

  const totalCredits = parseFloat(result[0]?.totalCredits ?? "0");
  const totalDebits = parseFloat(result[0]?.totalDebits ?? "0");

  res.json({
    year,
    month,
    totalTransactions: result[0]?.totalTransactions ?? 0,
    totalCredits,
    totalDebits,
    netProfit: totalCredits - totalDebits,
    dailyBreakdown: dailyRows.map((r) => ({
      date: r.date,
      credits: parseFloat(r.credits ?? "0"),
      debits: parseFloat(r.debits ?? "0"),
      transactions: r.transactions,
    })),
    topServices,
    aeps: {
      totalWithdrawals: aeps.totalWithdrawals,
      totalDeposits: aeps.totalDeposits,
      totalTransactions: aeps.totalTransactions,
      netFlow: aeps.totalDeposits - aeps.totalWithdrawals,
      dailyBreakdown: aeps.sessions,
    },
  });
});

router.get("/reports/aeps", requireAuth, requirePermission("reports:view"), async (req, res): Promise<void> => {
  const now = new Date();
  const startDate = (req.query.startDate as string) || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const endDate = (req.query.endDate as string) || now.toISOString().split("T")[0];

  const aeps = await getAepsData(startDate, endDate);
  res.json({
    startDate,
    endDate,
    totalWithdrawals: aeps.totalWithdrawals,
    totalDeposits: aeps.totalDeposits,
    totalTransactions: aeps.totalTransactions,
    netFlow: aeps.totalDeposits - aeps.totalWithdrawals,
    dailyBreakdown: aeps.sessions,
  });
});

router.get("/reports/service-breakdown", requireAuth, requirePermission("reports:view"), async (req, res): Promise<void> => {
  const params = GetServiceBreakdownQueryParams.safeParse(req.query);
  const now = new Date();
  const startDate = params.success && params.data.startDate
    ? params.data.startDate as string
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const endDate = params.success && params.data.endDate
    ? params.data.endDate as string
    : now.toISOString().split("T")[0];

  const userFilter = getUserFilter(req);
  const data = await getServiceBreakdownData(startDate, endDate, userFilter);
  res.json(data);
});

router.get("/reports/export", requireAuth, requirePermission("reports:export"), async (req, res): Promise<void> => {
  const params = ExportReportQueryParams.safeParse(req.query);
  const now = new Date();
  const startDate = params.success && params.data.startDate
    ? params.data.startDate as string
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const endDate = params.success && params.data.endDate
    ? params.data.endDate as string
    : now.toISOString().split("T")[0];

  const userFilter = getUserFilter(req);
  const dateFilter = and(gte(ledgerTable.date, startDate), lte(ledgerTable.date, endDate));
  const whereClause = userFilter ? and(userFilter, dateFilter) : dateFilter;

  const [ledgerEntries, aeps] = await Promise.all([
    db
      .select()
      .from(ledgerTable)
      .where(whereClause)
      .orderBy(ledgerTable.date, ledgerTable.id),
    getAepsData(startDate, endDate),
  ]);

  const wb = XLSX.utils.book_new();

  const ledgerData = [
    ["Date", "Customer Name", "Service Type", "Credit (₹)", "Debit (₹)", "Balance (₹)", "Description"],
    ...ledgerEntries.map((e) => [
      e.date, e.customerName, e.serviceType,
      parseFloat(e.credit ?? "0"), parseFloat(e.debit ?? "0"), parseFloat(e.balance ?? "0"),
      e.description,
    ]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ledgerData), "Ledger Report");

  const aepsData = [
    ["Date", "Opening Balance (₹)", "Withdrawals (₹)", "Deposits (₹)", "Transactions", "Net Flow (₹)"],
    ...aeps.sessions.map((s) => [
      s.date, s.openingBalance, s.withdrawals, s.deposits, s.transactions, s.netFlow,
    ]),
    [],
    ["", "TOTAL", aeps.totalWithdrawals, aeps.totalDeposits, aeps.totalTransactions, aeps.totalDeposits - aeps.totalWithdrawals],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aepsData), "AePS Report");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="report_${startDate}_${endDate}.xlsx"`);
  res.send(buffer);
});

router.get("/dashboard", requireAuth, requirePermission("reports:view"), async (req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const userFilter = getUserFilter(req);

  const todayFilter = eq(ledgerTable.date, today);
  const monthFilter = and(gte(ledgerTable.date, monthStart), lte(ledgerTable.date, today));

  const balanceWhere = userFilter ?? undefined;
  const todayWhere = userFilter ? and(userFilter, todayFilter) : todayFilter;
  const monthWhere = userFilter ? and(userFilter, monthFilter) : monthFilter;

  const [balanceResult, todayResult, monthResult, recentEntries, topServices] = await Promise.all([
    db.select({ totalCredits: sum(ledgerTable.credit), totalDebits: sum(ledgerTable.debit) })
      .from(ledgerTable).where(balanceWhere),
    db.select({ credits: sum(ledgerTable.credit), debits: sum(ledgerTable.debit), transactions: count() })
      .from(ledgerTable).where(todayWhere),
    db.select({ credits: sum(ledgerTable.credit), debits: sum(ledgerTable.debit), transactions: count() })
      .from(ledgerTable).where(monthWhere),
    db.select({
      id: ledgerTable.id, date: ledgerTable.date, customerName: ledgerTable.customerName,
      serviceType: ledgerTable.serviceType, credit: ledgerTable.credit, debit: ledgerTable.debit,
      description: ledgerTable.description, balance: ledgerTable.balance,
      createdBy: ledgerTable.createdBy, createdAt: ledgerTable.createdAt,
      createdByName: usersTable.fullName,
    }).from(ledgerTable)
      .leftJoin(usersTable, eq(ledgerTable.createdBy, usersTable.id))
      .where(balanceWhere).orderBy(desc(ledgerTable.createdAt)).limit(5),
    getServiceBreakdownData(monthStart, today, userFilter),
  ]);

  const totalCredits = parseFloat(balanceResult[0]?.totalCredits ?? "0");
  const totalDebits = parseFloat(balanceResult[0]?.totalDebits ?? "0");
  const monthCredits = parseFloat(monthResult[0]?.credits ?? "0");
  const monthDebits = parseFloat(monthResult[0]?.debits ?? "0");

  res.json({
    currentBalance: totalCredits - totalDebits,
    todayCredits: parseFloat(todayResult[0]?.credits ?? "0"),
    todayDebits: parseFloat(todayResult[0]?.debits ?? "0"),
    todayTransactions: todayResult[0]?.transactions ?? 0,
    monthCredits,
    monthDebits,
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
});

export default router;
