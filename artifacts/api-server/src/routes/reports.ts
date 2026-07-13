import { Router, type IRouter } from "express";
import { db, ledgerTable, aepsDailyTable, aepsTransactionsTable, usersTable } from "@workspace/db";
import { and, gte, lte, eq, sql, sum, count, desc } from "drizzle-orm";
import { GetDailyReportQueryParams, GetMonthlyReportQueryParams, GetServiceBreakdownQueryParams, ExportReportQueryParams } from "@workspace/api-zod";
import { requireAuth, requirePermission } from "../lib/auth";
import { cached } from "../lib/query-cache";
import ExcelJS from "exceljs";
import { asyncHandler } from "../lib/async-handler";

const router: IRouter = Router();

function getUserFilter(req: any) {
  const userId = req.session.userId!;
  return eq(ledgerTable.createdBy, userId);
}

export async function getServiceBreakdownData(startDate: string, endDate: string, userFilter?: any) {
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

export async function getAepsData(startDate: string, endDate: string) {
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

router.get("/reports/daily", requireAuth, requirePermission("reports:view"), asyncHandler(async (req, res) => {
  const params = GetDailyReportQueryParams.safeParse(req.query);
  const date = params.success && params.data.date ? params.data.date as string : new Date().toISOString().split("T")[0];

  const userFilter = getUserFilter(req);
  const dateFilter = eq(ledgerTable.date, date);
  const whereClause = userFilter ? and(userFilter, dateFilter) : dateFilter;

  const userId = req.session.userId!;
  const [result, aeps, topServices] = await cached(
    `reports:daily:${userId}:${date}`,
    5_000,
    () =>
      Promise.all([
        db
          .select({ totalCredits: sum(ledgerTable.credit), totalDebits: sum(ledgerTable.debit), totalTransactions: count() })
          .from(ledgerTable)
          .where(whereClause),
        getAepsData(date, date),
        getServiceBreakdownData(date, date, userFilter),
      ]),
  );

  const totalCredits = parseFloat(result[0]?.totalCredits ?? "0");
  const totalDebits = parseFloat(result[0]?.totalDebits ?? "0");

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
}));

router.get("/reports/monthly", requireAuth, requirePermission("reports:view"), asyncHandler(async (req, res) => {
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

  const monthlyUserId = req.session.userId!;
  const [result, dailyRows, topServices, aeps] = await cached(
    `reports:monthly:${monthlyUserId}:${startDate}:${endDate}`,
    5_000,
    () =>
      Promise.all([
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
      ]),
  );

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
}));

router.get("/reports/aeps", requireAuth, requirePermission("reports:view"), asyncHandler(async (req, res) => {
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
}));

router.get("/reports/service-breakdown", requireAuth, requirePermission("reports:view"), asyncHandler(async (req, res) => {
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
}));

router.get("/reports/export", requireAuth, requirePermission("reports:export"), asyncHandler(async (req, res) => {
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

  const wb = new ExcelJS.Workbook();

  const ledgerSheet = wb.addWorksheet("Ledger Report");
  ledgerSheet.addRow(["Date", "Customer Name", "Service Type", "Credit (₹)", "Debit (₹)", "Balance (₹)", "Description"]);
  for (const e of ledgerEntries) {
    ledgerSheet.addRow([
      e.date, e.customerName, e.serviceType,
      parseFloat(e.credit ?? "0"), parseFloat(e.debit ?? "0"), parseFloat(e.balance ?? "0"),
      e.description,
    ]);
  }

  const aepsSheet = wb.addWorksheet("AePS Report");
  aepsSheet.addRow(["Date", "Opening Balance (₹)", "Withdrawals (₹)", "Deposits (₹)", "Transactions", "Net Flow (₹)"]);
  for (const s of aeps.sessions) {
    aepsSheet.addRow([s.date, s.openingBalance, s.withdrawals, s.deposits, s.transactions, s.netFlow]);
  }
  aepsSheet.addRow([]);
  aepsSheet.addRow(["", "TOTAL", aeps.totalWithdrawals, aeps.totalDeposits, aeps.totalTransactions, aeps.totalDeposits - aeps.totalWithdrawals]);

  const buffer = await wb.xlsx.writeBuffer();
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="report_${startDate}_${endDate}.xlsx"`);
  res.send(Buffer.from(buffer));
}));

export default router;
