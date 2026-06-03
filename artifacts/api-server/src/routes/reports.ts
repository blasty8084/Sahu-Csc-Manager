import { Router, type IRouter } from "express";
import { db, ledgerTable, servicesTable } from "@workspace/db";
import { and, gte, lte, eq, sql, sum, count, desc } from "drizzle-orm";
import { GetDailyReportQueryParams, GetMonthlyReportQueryParams, GetServiceBreakdownQueryParams, ExportReportQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import * as XLSX from "xlsx";

const router: IRouter = Router();

async function getServiceBreakdownData(startDate: string, endDate: string) {
  const rows = await db
    .select({
      serviceType: ledgerTable.serviceType,
      count: count(),
      revenue: sum(ledgerTable.credit),
    })
    .from(ledgerTable)
    .where(and(gte(ledgerTable.date, startDate), lte(ledgerTable.date, endDate)))
    .groupBy(ledgerTable.serviceType)
    .orderBy(desc(sum(ledgerTable.credit)));

  return rows.map((r) => ({
    serviceType: r.serviceType,
    count: r.count,
    revenue: parseFloat(r.revenue ?? "0"),
  }));
}

router.get("/reports/daily", requireAuth, async (req, res): Promise<void> => {
  const params = GetDailyReportQueryParams.safeParse(req.query);
  const date = params.success && params.data.date ? params.data.date as string : new Date().toISOString().split("T")[0];

  const result = await db
    .select({
      totalCredits: sum(ledgerTable.credit),
      totalDebits: sum(ledgerTable.debit),
      totalTransactions: count(),
    })
    .from(ledgerTable)
    .where(eq(ledgerTable.date, date));

  const totalCredits = parseFloat(result[0]?.totalCredits ?? "0");
  const totalDebits = parseFloat(result[0]?.totalDebits ?? "0");

  const topServices = await getServiceBreakdownData(date, date);

  res.json({
    date,
    transactionCount: result[0]?.totalTransactions ?? 0,
    totalCredits,
    totalDebits,
    netRevenue: totalCredits - totalDebits,
    topServices: topServices.slice(0, 5),
  });
});

router.get("/reports/monthly", requireAuth, async (req, res): Promise<void> => {
  const params = GetMonthlyReportQueryParams.safeParse(req.query);
  const now = new Date();
  const year = params.success && params.data.year ? params.data.year : now.getFullYear();
  const month = params.success && params.data.month ? params.data.month : now.getMonth() + 1;

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const result = await db
    .select({
      totalCredits: sum(ledgerTable.credit),
      totalDebits: sum(ledgerTable.debit),
      totalTransactions: count(),
    })
    .from(ledgerTable)
    .where(and(gte(ledgerTable.date, startDate), lte(ledgerTable.date, endDate)));

  const totalCredits = parseFloat(result[0]?.totalCredits ?? "0");
  const totalDebits = parseFloat(result[0]?.totalDebits ?? "0");

  // Daily breakdown
  const dailyRows = await db
    .select({
      date: ledgerTable.date,
      credits: sum(ledgerTable.credit),
      debits: sum(ledgerTable.debit),
      transactions: count(),
    })
    .from(ledgerTable)
    .where(and(gte(ledgerTable.date, startDate), lte(ledgerTable.date, endDate)))
    .groupBy(ledgerTable.date)
    .orderBy(ledgerTable.date);

  const topServices = await getServiceBreakdownData(startDate, endDate);

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
  });
});

router.get("/reports/service-breakdown", requireAuth, async (req, res): Promise<void> => {
  const params = GetServiceBreakdownQueryParams.safeParse(req.query);
  const now = new Date();
  const startDate = params.success && params.data.startDate
    ? params.data.startDate as string
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const endDate = params.success && params.data.endDate
    ? params.data.endDate as string
    : now.toISOString().split("T")[0];

  const data = await getServiceBreakdownData(startDate, endDate);
  res.json(data);
});

router.get("/reports/export", requireAuth, async (req, res): Promise<void> => {
  const params = ExportReportQueryParams.safeParse(req.query);
  const now = new Date();
  const startDate = params.success && params.data.startDate
    ? params.data.startDate as string
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const endDate = params.success && params.data.endDate
    ? params.data.endDate as string
    : now.toISOString().split("T")[0];

  const entries = await db
    .select()
    .from(ledgerTable)
    .where(and(gte(ledgerTable.date, startDate), lte(ledgerTable.date, endDate)))
    .orderBy(ledgerTable.date, ledgerTable.id);

  const wsData = [
    ["Date", "Customer Name", "Service Type", "Credit (₹)", "Debit (₹)", "Balance (₹)", "Description"],
    ...entries.map((e) => [
      e.date,
      e.customerName,
      e.serviceType,
      parseFloat(e.credit ?? "0"),
      parseFloat(e.debit ?? "0"),
      parseFloat(e.balance ?? "0"),
      e.description,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ledger Report");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="report_${startDate}_${endDate}.xlsx"`);
  res.send(buffer);
});

router.get("/dashboard", requireAuth, async (req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const [balanceResult, todayResult, monthResult, recentEntries, topServices] = await Promise.all([
    db.select({ totalCredits: sum(ledgerTable.credit), totalDebits: sum(ledgerTable.debit) }).from(ledgerTable),
    db.select({ credits: sum(ledgerTable.credit), debits: sum(ledgerTable.debit), transactions: count() })
      .from(ledgerTable).where(eq(ledgerTable.date, today)),
    db.select({ credits: sum(ledgerTable.credit), debits: sum(ledgerTable.debit), transactions: count() })
      .from(ledgerTable).where(and(gte(ledgerTable.date, monthStart), lte(ledgerTable.date, today))),
    db.select({
      id: ledgerTable.id,
      date: ledgerTable.date,
      customerName: ledgerTable.customerName,
      serviceType: ledgerTable.serviceType,
      credit: ledgerTable.credit,
      debit: ledgerTable.debit,
      description: ledgerTable.description,
      balance: ledgerTable.balance,
      createdBy: ledgerTable.createdBy,
      createdAt: ledgerTable.createdAt,
    }).from(ledgerTable).orderBy(desc(ledgerTable.createdAt)).limit(5),
    getServiceBreakdownData(monthStart, today),
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
      createdByName: null,
      createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
    })),
    topServicesMonth: topServices.slice(0, 5),
  });
});

export default router;
