import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { ReportsSkeleton } from "@/components/skeletons";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar, Download, TrendingUp, TrendingDown, Activity,
  Fingerprint, BarChart2, Layers, Filter,
  ArrowUpRight, ArrowDownLeft,
} from "lucide-react";

import {
  BASE, MONTHS, PIE_COLORS, fmt, formatINR,
  useFilterState, useReportsData,
} from "@/hooks/useReports";

// Summary cards & empty state
import { MobileStatCard, EmptyState } from "@/components/reports/ReportsSummaryCards";

// Filter panels
import { MobileReportFilters, DesktopReportFilters } from "@/components/reports/ReportsFilters";

// Chart components
import {
  MobileDailyRevenueChart,
  MobileAepsDailyChart,
  MobileServicesPieChart,
  DailyCashflowChart,
  ServiceMixPieChart,
  MonthlyRevenueChart,
  AepsFloatAreaChart,
  AepsBarChart,
  OpeningBalanceAreaChart,
  ServicesRevenuePieChart,
} from "@/components/reports/ReportsChart";

// Table components
import {
  ServicesUsedTable,
  MonthlySummaryCard,
  AepsNavySummary,
  AepsDayWiseTable,
  ServicesDetailTable,
} from "@/components/reports/ReportsTable";

// ══════════════════════════════════════════════════════════════════════════════
// MOBILE REPORTS
// ══════════════════════════════════════════════════════════════════════════════
const MOBILE_TABS = [
  { id: "daily",    label: "Daily",    Icon: Calendar,    accent: "#0b2c60", grad: "linear-gradient(135deg,#0b2c60,#1a4a9e)" },
  { id: "monthly",  label: "Monthly",  Icon: BarChart2,   accent: "#8b5cf6", grad: "linear-gradient(135deg,#8b5cf6,#7c3aed)" },
  { id: "aeps",     label: "AePS",     Icon: Fingerprint, accent: "#f97316", grad: "linear-gradient(135deg,#f97316,#ea580c)" },
  { id: "services", label: "Services", Icon: Layers,      accent: "#10b981", grad: "linear-gradient(135deg,#10b981,#059669)" },
];

function MobileReports() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("daily");
  const [showFilter, setShowFilter] = useState(false);
  const filters = useFilterState();
  const { daily, monthly, breakdown, aepsReport } = useReportsData(
    filters.dailyDate, filters.reportYear, filters.reportMonth, filters.aepsStart, filters.aepsEnd,
  );
  const tab = MOBILE_TABS.find(tab => tab.id === activeTab)!;

  const exportUrl = activeTab === "aeps"
    ? `${BASE}/api/reports/export?startDate=${filters.aepsStart}&endDate=${filters.aepsEnd}`
    : `${BASE}/api/reports/export?startDate=${filters.monthStart}&endDate=${filters.monthEnd}`;

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#0b2c60" }}>Reports</h1>
          <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Business analytics & insights</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilter(v => !v)}
            className="flex items-center gap-1.5 rounded-xl px-3 h-9 text-xs font-semibold border"
            style={{ borderColor: showFilter ? "#0b2c60" : "#e2e8f0", color: showFilter ? "#0b2c60" : "#64748b", background: showFilter ? "rgba(11,44,96,0.06)" : "#fff" }}
          >
            <Filter size={13} />Filters
          </button>
          <a
            href={exportUrl}
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl px-3 h-9 text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)" }}
          >
            <Download size={13} />Excel
          </a>
        </div>
      </div>

      {/* ── Tab chips ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {MOBILE_TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-1.5 rounded-xl px-3 h-9 text-xs font-bold flex-shrink-0 transition-all"
              style={active
                ? { background: t.grad, color: "#fff", boxShadow: `0 4px 12px ${t.accent}55` }
                : { background: "#fff", color: "#64748b", border: "1.5px solid #e2e8f0" }
              }
            >
              <t.Icon size={12} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Filter panel ── */}
      {showFilter && <MobileReportFilters activeTab={activeTab} filters={filters} />}

      {/* ── Daily ── */}
      {activeTab === "daily" && (
        <div className="space-y-4">
          {daily.isLoading ? (
            <ReportsSkeleton />
          ) : daily.data ? (
            <>
              {/* Section label */}
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(180deg,#0b2c60,#1a4a9e)" }} />
                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Ledger Summary</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <MobileStatCard label="Transactions" value={daily.data.transactionCount} sub="Today" accentColor="#0b2c60" iconGrad="linear-gradient(135deg,#0b2c60,#1a4a9e)" Icon={Activity} />
                <MobileStatCard label="Net Revenue" value={fmt(daily.data.netRevenue)} sub={daily.data.netRevenue >= 0 ? "Profit" : "Loss"} accentColor={daily.data.netRevenue >= 0 ? "#10b981" : "#ef4444"} iconGrad={daily.data.netRevenue >= 0 ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)"} Icon={daily.data.netRevenue >= 0 ? TrendingUp : TrendingDown} />
                <MobileStatCard label="Credits" value={fmt(daily.data.totalCredits)} sub="Income" accentColor="#10b981" iconGrad="linear-gradient(135deg,#10b981,#059669)" Icon={ArrowDownLeft} />
                <MobileStatCard label="Debits" value={fmt(daily.data.totalDebits)} sub="Expenses" accentColor="#f97316" iconGrad="linear-gradient(135deg,#f97316,#ea580c)" Icon={ArrowUpRight} />
              </div>

              {daily.data.aeps && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(180deg,#f97316,#ea580c)" }} />
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>AePS Cash</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <MobileStatCard label="AePS Tx" value={daily.data.aeps.totalTransactions} sub="Transactions" accentColor="#f97316" iconGrad="linear-gradient(135deg,#f97316,#ea580c)" Icon={Fingerprint} />
                    <MobileStatCard label="Net Flow" value={fmt(daily.data.aeps.netFlow)} sub={daily.data.aeps.netFlow >= 0 ? "Net in" : "Net out"} accentColor={daily.data.aeps.netFlow >= 0 ? "#10b981" : "#ef4444"} iconGrad={daily.data.aeps.netFlow >= 0 ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)"} Icon={daily.data.aeps.netFlow >= 0 ? TrendingUp : TrendingDown} />
                    <MobileStatCard label="Withdrawals" value={fmt(daily.data.aeps.totalWithdrawals)} accentColor="#ef4444" iconGrad="linear-gradient(135deg,#ef4444,#dc2626)" Icon={ArrowUpRight} />
                    <MobileStatCard label="Deposits" value={fmt(daily.data.aeps.totalDeposits)} accentColor="#10b981" iconGrad="linear-gradient(135deg,#10b981,#059669)" Icon={ArrowDownLeft} />
                  </div>
                </>
              )}

              {daily.data.topServices?.length > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(180deg,#8b5cf6,#7c3aed)" }} />
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Services Used</p>
                  </div>
                  <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)" }}>
                    <div style={{ height: 3, background: "linear-gradient(90deg,#8b5cf6,#7c3aed)" }} />
                    <div className="p-4 space-y-3">
                      {daily.data.topServices.map((s: any, i: number) => (
                        <div key={s.serviceType} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[9px] font-black" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}>
                            {i + 1}
                          </div>
                          <p className="flex-1 text-xs font-semibold text-slate-700 truncate">{s.serviceType}</p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[10px] font-bold text-slate-400">{s.count}tx</span>
                            <span className="text-xs font-black" style={{ color: "#0b2c60" }}>{fmt(s.revenue)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <EmptyState label="No data for selected date" />
          )}
        </div>
      )}

      {/* ── Monthly ── */}
      {activeTab === "monthly" && (
        <div className="space-y-4">
          {monthly.isLoading ? (
            <ReportsSkeleton />
          ) : monthly.data ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(180deg,#8b5cf6,#7c3aed)" }} />
                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Ledger Summary</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <MobileStatCard label="Transactions" value={monthly.data.totalTransactions} accentColor="#0b2c60" iconGrad="linear-gradient(135deg,#0b2c60,#1a4a9e)" Icon={Activity} />
                <MobileStatCard label="Net Profit" value={fmt(monthly.data.netProfit)} sub={monthly.data.netProfit >= 0 ? "Profit" : "Loss"} accentColor={monthly.data.netProfit >= 0 ? "#10b981" : "#ef4444"} iconGrad={monthly.data.netProfit >= 0 ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)"} Icon={monthly.data.netProfit >= 0 ? TrendingUp : TrendingDown} />
                <MobileStatCard label="Total Credits" value={fmt(monthly.data.totalCredits)} accentColor="#10b981" iconGrad="linear-gradient(135deg,#10b981,#059669)" Icon={ArrowDownLeft} />
                <MobileStatCard label="Total Debits" value={fmt(monthly.data.totalDebits)} accentColor="#f97316" iconGrad="linear-gradient(135deg,#f97316,#ea580c)" Icon={ArrowUpRight} />
              </div>

              {monthly.data.dailyBreakdown?.length > 0 && (
                <MobileDailyRevenueChart data={monthly.data.dailyBreakdown} />
              )}

              {monthly.data.aeps && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(180deg,#f97316,#ea580c)" }} />
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>AePS Cash</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <MobileStatCard label="AePS Tx" value={monthly.data.aeps.totalTransactions} accentColor="#f97316" iconGrad="linear-gradient(135deg,#f97316,#ea580c)" Icon={Fingerprint} />
                    <MobileStatCard label="Net Flow" value={fmt(monthly.data.aeps.netFlow)} accentColor={monthly.data.aeps.netFlow >= 0 ? "#10b981" : "#ef4444"} iconGrad={monthly.data.aeps.netFlow >= 0 ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)"} Icon={monthly.data.aeps.netFlow >= 0 ? TrendingUp : TrendingDown} />
                  </div>
                  {monthly.data.aeps.dailyBreakdown?.length > 0 && (
                    <MobileAepsDailyChart data={monthly.data.aeps.dailyBreakdown} height={140} />
                  )}
                </>
              )}
            </>
          ) : (
            <EmptyState label="No data for this period" />
          )}
        </div>
      )}

      {/* ── AePS ── */}
      {activeTab === "aeps" && (
        <div className="space-y-4">
          {aepsReport.isLoading ? (
            <div className="space-y-3">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
          ) : aepsReport.data ? (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <MobileStatCard label="AePS Tx" value={aepsReport.data.totalTransactions} accentColor="#f97316" iconGrad="linear-gradient(135deg,#f97316,#ea580c)" Icon={Fingerprint} />
                <MobileStatCard label="Net Flow" value={fmt(aepsReport.data.netFlow)} accentColor={aepsReport.data.netFlow >= 0 ? "#10b981" : "#ef4444"} iconGrad={aepsReport.data.netFlow >= 0 ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)"} Icon={aepsReport.data.netFlow >= 0 ? TrendingUp : TrendingDown} />
                <MobileStatCard label="Withdrawals" value={fmt(aepsReport.data.totalWithdrawals)} accentColor="#ef4444" iconGrad="linear-gradient(135deg,#ef4444,#dc2626)" Icon={ArrowUpRight} />
                <MobileStatCard label="Deposits" value={fmt(aepsReport.data.totalDeposits)} accentColor="#10b981" iconGrad="linear-gradient(135deg,#10b981,#059669)" Icon={ArrowDownLeft} />
              </div>

              {aepsReport.data.dailyBreakdown?.length > 0 && (
                <>
                  <MobileAepsDailyChart data={aepsReport.data.dailyBreakdown} height={150} />

                  <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)" }}>
                    <div style={{ height: 3, background: "linear-gradient(90deg,#f97316,#ea580c)" }} />
                    <div className="p-4">
                      <p className="text-xs font-bold text-slate-600 mb-3">Day-wise Detail</p>
                      <div className="space-y-2.5">
                        {aepsReport.data.dailyBreakdown.map((row: any) => (
                          <div key={row.date} className="rounded-xl p-3 border border-slate-100" style={{ background: "#f8fafc" }}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-black" style={{ color: "#0b2c60", fontVariantNumeric: "tabular-nums" }}>{row.date}</span>
                              <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full" style={{ background: "#f97316" }}>{row.transactions} tx</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600 }}>Withdrawal</p>
                                <p className="text-xs font-bold text-red-600">{fmt(row.withdrawals)}</p>
                              </div>
                              <div>
                                <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600 }}>Deposit</p>
                                <p className="text-xs font-bold text-emerald-600">{fmt(row.deposits)}</p>
                              </div>
                              <div>
                                <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600 }}>Net Flow</p>
                                <p className={`text-xs font-bold ${row.netFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(row.netFlow)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <EmptyState label="No AePS data found" />
          )}
        </div>
      )}

      {/* ── Services ── */}
      {activeTab === "services" && (
        <div className="space-y-4">
          {!breakdown.data?.length ? (
            <EmptyState label="No service data yet" />
          ) : (
            <>
              <MobileServicesPieChart data={breakdown.data} />

              <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)" }}>
                <div style={{ height: 3, background: "linear-gradient(90deg,#10b981,#059669)" }} />
                <div className="p-4 space-y-3">
                  <p className="text-xs font-bold text-slate-600">Service Details</p>
                  {breakdown.data?.map((s: any, i: number) => (
                    <div key={s.serviceType} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <p className="flex-1 text-xs font-semibold text-slate-700 truncate">{s.serviceType}</p>
                      <span className="text-[10px] font-bold text-slate-400 mr-2">{s.count}tx</span>
                      <span className="text-xs font-black" style={{ color: "#0b2c60" }}>{fmt(s.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DESKTOP REPORTS — Analytics Pro design
// ══════════════════════════════════════════════════════════════════════════════
const DESKTOP_TABS = [
  { id: "daily",    label: "Daily Report",    Icon: Calendar,    accent: "#0b2c60", light: "rgba(11,44,96,0.08)",    grad: "linear-gradient(135deg,#0b2c60,#1a4a9e)" },
  { id: "monthly",  label: "Monthly Report",  Icon: BarChart2,   accent: "#8b5cf6", light: "rgba(139,92,246,0.08)", grad: "linear-gradient(135deg,#8b5cf6,#7c3aed)" },
  { id: "aeps",     label: "AePS Report",     Icon: Fingerprint, accent: "#f97316", light: "rgba(249,115,22,0.08)", grad: "linear-gradient(135deg,#f97316,#ea580c)" },
  { id: "services", label: "Service Analysis",Icon: Layers,      accent: "#10b981", light: "rgba(16,185,129,0.08)", grad: "linear-gradient(135deg,#10b981,#059669)" },
];

function DesktopReports() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("daily");
  const filters = useFilterState();
  const { daily, monthly, breakdown, aepsReport } = useReportsData(
    filters.dailyDate, filters.reportYear, filters.reportMonth, filters.aepsStart, filters.aepsEnd,
  );

  const exportUrl = activeTab === "aeps"
    ? `${BASE}/api/reports/export?startDate=${filters.aepsStart}&endDate=${filters.aepsEnd}`
    : `${BASE}/api/reports/export?startDate=${filters.monthStart}&endDate=${filters.monthEnd}`;

  /* ── Print report ── */
  const printReport = () => {
    const css = `
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1e293b;font-size:12px;padding:20mm 18mm}
      @page{size:A4 portrait;margin:0}
      .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:3px solid #0b2c60;margin-bottom:18px}
      .brand-name{font-size:20px;font-weight:900;color:#0b2c60;letter-spacing:-0.5px}
      .brand-name span{color:#f97316}
      .brand-sub{font-size:10px;color:#94a3b8;letter-spacing:0.08em;margin-top:3px}
      .report-meta{text-align:right}
      .report-title{font-size:15px;font-weight:800;color:#0b2c60}
      .report-date{font-size:10px;color:#94a3b8;margin-top:3px}
      .kpi-row{display:flex;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:18px}
      .kpi-cell{flex:1;padding:12px 16px;background:#f8fafc;border-right:1px solid #e2e8f0}
      .kpi-cell:last-child{border-right:none}
      .kpi-label{font-size:8px;font-weight:700;color:#94a3b8;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:5px}
      .kpi-value{font-size:16px;font-weight:900;color:#0b2c60}
      .kpi-trend{font-size:9px;font-weight:700;margin-top:3px}
      .kpi-pos{color:#10b981} .kpi-neg{color:#ef4444}
      .section-title{font-size:13px;font-weight:800;color:#0b2c60;margin:0 0 10px;padding-bottom:6px;border-bottom:2px solid #f1f5f9}
      table{width:100%;border-collapse:collapse;margin-bottom:18px}
      thead tr{background:#f8fafc}
      th{padding:8px 12px;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.07em;text-align:left;border-bottom:2px solid #e2e8f0}
      th.r{text-align:right}
      td{padding:9px 12px;font-size:11px;color:#334155;border-bottom:1px solid #f1f5f9}
      td.r{text-align:right} td.green{color:#10b981;font-weight:700} td.red{color:#ef4444;font-weight:700} td.navy{color:#0b2c60;font-weight:800}
      .badge{background:#eff6ff;color:#1d4ed8;border-radius:20px;padding:2px 8px;font-size:9px;font-weight:700;display:inline-block}
      .summary-box{background:#0b2c60;color:white;border-radius:10px;padding:14px 18px;margin-bottom:18px}
      .summary-box .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.1)}
      .summary-box .row:last-child{border-bottom:none}
      .summary-box .lbl{color:rgba(255,255,255,0.55);font-size:10px}
      .summary-box .val{color:white;font-weight:700;font-size:12px}
      .summary-box .val.green{color:#34d399} .summary-box .val.red{color:#fca5a5}
      .footer{margin-top:24px;padding-top:10px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;color:#94a3b8;font-size:9px}
    `;

    const now = new Date().toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" });
    const tabLabels: Record<string, string> = {
      daily: "Daily Report", monthly: "Monthly Report", aeps: "AePS Report", services: "Service Analysis",
    };
    const periodLabels: Record<string, string> = {
      daily: filters.dailyDate,
      monthly: `${MONTHS[filters.reportMonth - 1]} ${filters.reportYear}`,
      aeps: `${filters.aepsStart} to ${filters.aepsEnd}`,
      services: "All-time",
    };

    let body = `<div class="header">
      <div>
        <div class="brand-name">SAHU <span>CSC</span></div>
        <div class="brand-sub">COMMON SERVICE CENTER · ODISHA</div>
      </div>
      <div class="report-meta">
        <div class="report-title">${tabLabels[activeTab]}</div>
        <div class="report-date">Period: ${periodLabels[activeTab]}</div>
        <div class="report-date">Generated: ${now}</div>
      </div>
    </div>`;

    if (activeTab === "daily" && daily.data) {
      const d = daily.data;
      const avg = d.transactionCount > 0 ? d.netRevenue / d.transactionCount : 0;
      body += `<div class="kpi-row">
        <div class="kpi-cell"><div class="kpi-label">Total Credits</div><div class="kpi-value">${fmt(d.totalCredits)}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Total Debits</div><div class="kpi-value">${fmt(d.totalDebits)}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Net Revenue</div><div class="kpi-value">${fmt(d.netRevenue)}</div><div class="kpi-trend ${d.netRevenue >= 0 ? "kpi-pos" : "kpi-neg"}">${d.netRevenue >= 0 ? "▲ Profitable" : "▼ Loss"}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Transactions</div><div class="kpi-value">${d.transactionCount}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Avg Ticket</div><div class="kpi-value">${fmt(avg)}</div></div>
      </div>`;
      if (d.topServices?.length) {
        body += `<div class="section-title">Services Used — ${filters.dailyDate}</div><table><thead><tr><th>#</th><th>Service</th><th class="r">Transactions</th><th class="r">Revenue</th></tr></thead><tbody>`;
        d.topServices.forEach((s: any, i: number) => {
          body += `<tr><td class="navy">${i + 1}</td><td>${s.serviceType}</td><td class="r"><span class="badge">${s.count} tx</span></td><td class="r green">${fmt(s.revenue)}</td></tr>`;
        });
        body += `</tbody></table>`;
      }
      if (d.aeps) {
        body += `<div class="section-title">AePS Cash — ${filters.dailyDate}</div><div class="summary-box">
          <div class="row"><span class="lbl">Total Transactions</span><span class="val">${d.aeps.totalTransactions}</span></div>
          <div class="row"><span class="lbl">Total Withdrawn</span><span class="val red">${fmt(d.aeps.totalWithdrawals)}</span></div>
          <div class="row"><span class="lbl">Total Deposited</span><span class="val green">${fmt(d.aeps.totalDeposits)}</span></div>
          <div class="row"><span class="lbl">Net Flow</span><span class="val ${d.aeps.netFlow >= 0 ? "green" : "red"}">${fmt(d.aeps.netFlow)}</span></div>
        </div>`;
      }
    }

    if (activeTab === "monthly" && monthly.data) {
      const m = monthly.data;
      const avg = m.totalTransactions > 0 ? m.netProfit / m.totalTransactions : 0;
      body += `<div class="kpi-row">
        <div class="kpi-cell"><div class="kpi-label">Total Credits</div><div class="kpi-value">${fmt(m.totalCredits)}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Total Debits</div><div class="kpi-value">${fmt(m.totalDebits)}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Net Profit</div><div class="kpi-value">${fmt(m.netProfit)}</div><div class="kpi-trend ${m.netProfit >= 0 ? "kpi-pos" : "kpi-neg"}">${m.netProfit >= 0 ? "▲ Profit" : "▼ Loss"}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Transactions</div><div class="kpi-value">${m.totalTransactions}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Avg Ticket</div><div class="kpi-value">${fmt(avg)}</div></div>
      </div>`;
      if (m.dailyBreakdown?.length) {
        body += `<div class="section-title">Daily Breakdown — ${MONTHS[filters.reportMonth - 1]} ${filters.reportYear}</div><table><thead><tr><th>Date</th><th class="r">Credits</th><th class="r">Debits</th><th class="r">Net</th></tr></thead><tbody>`;
        m.dailyBreakdown.forEach((row: any) => {
          const net = parseFloat(row.credits || 0) - parseFloat(row.debits || 0);
          body += `<tr><td class="navy">${row.date}</td><td class="r green">${fmt(row.credits)}</td><td class="r red">${fmt(row.debits)}</td><td class="r ${net >= 0 ? "green" : "red"}">${fmt(net)}</td></tr>`;
        });
        body += `</tbody></table>`;
      }
      if (m.aeps) {
        body += `<div class="section-title">AePS Summary</div><div class="summary-box">
          <div class="row"><span class="lbl">Total Transactions</span><span class="val">${m.aeps.totalTransactions}</span></div>
          <div class="row"><span class="lbl">Total Withdrawn</span><span class="val red">${fmt(m.aeps.totalWithdrawals)}</span></div>
          <div class="row"><span class="lbl">Total Deposited</span><span class="val green">${fmt(m.aeps.totalDeposits)}</span></div>
          <div class="row"><span class="lbl">Net Flow</span><span class="val ${m.aeps.netFlow >= 0 ? "green" : "red"}">${fmt(m.aeps.netFlow)}</span></div>
        </div>`;
      }
    }

    if (activeTab === "aeps" && aepsReport.data) {
      const a = aepsReport.data;
      body += `<div class="kpi-row">
        <div class="kpi-cell"><div class="kpi-label">AePS Tx</div><div class="kpi-value">${a.totalTransactions}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Withdrawals</div><div class="kpi-value">${fmt(a.totalWithdrawals)}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Deposits</div><div class="kpi-value">${fmt(a.totalDeposits)}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Net Flow</div><div class="kpi-value">${fmt(a.netFlow)}</div><div class="kpi-trend ${a.netFlow >= 0 ? "kpi-pos" : "kpi-neg"}">${a.netFlow >= 0 ? "▲ Net positive" : "▼ Net negative"}</div></div>
      </div>`;
      if (a.dailyBreakdown?.length) {
        body += `<div class="section-title">Day-wise AePS Detail — ${filters.aepsStart} to ${filters.aepsEnd}</div><table><thead><tr><th>Date</th><th class="r">Opening Balance</th><th class="r">Withdrawals</th><th class="r">Deposits</th><th class="r">Transactions</th><th class="r">Net Flow</th></tr></thead><tbody>`;
        a.dailyBreakdown.forEach((row: any) => {
          body += `<tr>
            <td class="navy">${row.date}</td>
            <td class="r">${formatINR(row.openingBalance)}</td>
            <td class="r red">${formatINR(row.withdrawals)}</td>
            <td class="r green">${formatINR(row.deposits)}</td>
            <td class="r"><span class="badge">${row.transactions}</span></td>
            <td class="r ${row.netFlow >= 0 ? "green" : "red"}">${formatINR(row.netFlow)}</td>
          </tr>`;
        });
        body += `</tbody></table>`;
      }
    }

    if (activeTab === "services" && breakdown.data?.length) {
      const totalTx  = breakdown.data.reduce((s: number, r: any) => s + r.count, 0);
      const totalRev = breakdown.data.reduce((s: number, r: any) => s + parseFloat(r.revenue || 0), 0);
      body += `<div class="kpi-row">
        <div class="kpi-cell"><div class="kpi-label">Total Services</div><div class="kpi-value">${breakdown.data.length}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Total Transactions</div><div class="kpi-value">${totalTx}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Total Revenue</div><div class="kpi-value">${fmt(totalRev)}</div></div>
      </div>`;
      body += `<div class="section-title">Service Breakdown — All Time</div><table><thead><tr><th>#</th><th>Service Name</th><th class="r">Transactions</th><th class="r">Revenue</th></tr></thead><tbody>`;
      breakdown.data.forEach((s: any, i: number) => {
        body += `<tr><td class="navy">${i + 1}</td><td>${s.serviceType}</td><td class="r"><span class="badge">${s.count}</span></td><td class="r green">${fmt(s.revenue)}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    body += `<div class="footer"><span>SAHU CSC · Common Service Center · Odisha</span><span>Confidential — For internal use only</span></div>`;

    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${tabLabels[activeTab]} — SAHU CSC</title><style>${css}</style></head><body>${body}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  /* KPI strip values per tab */
  const kpiChips = (() => {
    if (activeTab === "daily" && daily.data) {
      const avg = daily.data.transactionCount > 0 ? daily.data.netRevenue / daily.data.transactionCount : 0;
      return [
        { label: "Total Credits",  value: fmt(daily.data.totalCredits),  trend: undefined,                                                                      pos: undefined },
        { label: "Total Debits",   value: fmt(daily.data.totalDebits),   trend: undefined,                                                                      pos: undefined },
        { label: "Net Revenue",    value: fmt(daily.data.netRevenue),    trend: daily.data.netRevenue >= 0 ? "Profitable day" : "Loss day",   pos: daily.data.netRevenue >= 0 },
        { label: "Transactions",   value: daily.data.transactionCount,   trend: undefined,                                                                      pos: undefined },
        { label: "Avg Ticket",     value: fmt(avg),                      trend: undefined,                                                                      pos: undefined },
      ];
    }
    if (activeTab === "monthly" && monthly.data) {
      const avg = monthly.data.totalTransactions > 0 ? monthly.data.netProfit / monthly.data.totalTransactions : 0;
      return [
        { label: "Total Credits",  value: fmt(monthly.data.totalCredits),  trend: undefined,                                                                        pos: undefined },
        { label: "Total Debits",   value: fmt(monthly.data.totalDebits),   trend: undefined,                                                                        pos: undefined },
        { label: "Net Profit",     value: fmt(monthly.data.netProfit),     trend: monthly.data.netProfit >= 0 ? "Month profit" : "Month loss", pos: monthly.data.netProfit >= 0 },
        { label: "Transactions",   value: monthly.data.totalTransactions,  trend: undefined,                                                                        pos: undefined },
        { label: "Avg Ticket",     value: fmt(avg),                        trend: undefined,                                                                        pos: undefined },
      ];
    }
    if (activeTab === "aeps" && aepsReport.data) {
      return [
        { label: "AePS Tx",     value: aepsReport.data.totalTransactions,          trend: undefined,                                                                                     pos: undefined },
        { label: "Withdrawals", value: fmt(aepsReport.data.totalWithdrawals),       trend: undefined,                                                                                     pos: undefined },
        { label: "Deposits",    value: fmt(aepsReport.data.totalDeposits),          trend: undefined,                                                                                     pos: undefined },
        { label: "Net Flow",    value: fmt(aepsReport.data.netFlow),                trend: aepsReport.data.netFlow >= 0 ? "Net positive" : "Net negative", pos: aepsReport.data.netFlow >= 0 },
      ];
    }
    if (activeTab === "services" && breakdown.data?.length) {
      const totalTx  = breakdown.data.reduce((s: number, r: any) => s + r.count, 0);
      const totalRev = breakdown.data.reduce((s: number, r: any) => s + parseFloat(r.revenue || 0), 0);
      return [
        { label: "Services",      value: breakdown.data.length, trend: undefined, pos: undefined },
        { label: "Total Tx",      value: totalTx,               trend: undefined, pos: undefined },
        { label: "Total Revenue", value: fmt(totalRev),         trend: undefined, pos: undefined },
      ];
    }
    return [];
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", margin: "-24px -24px -24px", height: "calc(100vh - 64px)", overflow: "hidden" }}>

      {/* ── White top nav bar ── */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "stretch", flexShrink: 0 }}>

        {/* Brand */}
        <div style={{ padding: "0 22px", display: "flex", alignItems: "center", gap: 10, borderRight: "1px solid #e2e8f0", minWidth: 210 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#0b2c60,#0f3872)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BarChart2 size={15} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#0b2c60" }}>SAHU CSC</div>
            <div style={{ fontSize: 9, color: "#94a3b8", letterSpacing: "0.06em" }}>Reports Center</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", flex: 1 }}>
          {DESKTOP_TABS.map(t => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "0 20px",
                  background: "none", border: "none", cursor: "pointer",
                  color: active ? "#0b2c60" : "#94a3b8",
                  fontSize: 13, fontWeight: active ? 700 : 400,
                  borderTop: "none", borderLeft: "none", borderRight: "none",
                  outline: "none",
                  borderBottomStyle: "solid",
                  borderBottomWidth: 3,
                  borderBottomColor: active ? "#0b2c60" : "transparent",
                }}
              >
                <t.Icon size={13} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Right: filter controls + export */}
        <DesktopReportFilters
          activeTab={activeTab}
          filters={filters}
          onPrint={printReport}
          exportUrl={exportUrl}
        />
      </div>

      {/* ── Navy KPI strip ── */}
      {kpiChips.length > 0 && (
        <div style={{ background: "#0b2c60", padding: "14px 28px", display: "flex", flexShrink: 0 }}>
          {kpiChips.map((c, i) => (
            <div key={c.label} style={{ flex: 1, padding: "0 20px", borderRight: i < kpiChips.length - 1 ? "1px solid rgba(255,255,255,0.10)" : "none" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", marginBottom: 5, textTransform: "uppercase" }}>{c.label}</div>
              <div style={{ fontSize: 19, fontWeight: 900, color: "white", marginBottom: 3, letterSpacing: "-0.5px" }}>{c.value}</div>
              {c.trend && <div style={{ fontSize: 10, fontWeight: 700, color: c.pos ? "#34d399" : "#fca5a5" }}>{c.trend}</div>}
            </div>
          ))}
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflow: "auto", background: "#f1f5f9", padding: "20px 28px 28px" }}>

        {/* ─ Daily ─ */}
        {activeTab === "daily" && (
          <div className="space-y-5">
            {daily.isLoading ? (
              <ReportsSkeleton />
            ) : daily.data ? (
              <>
                {/* 2-col chart grid */}
                {(daily.data.totalCredits > 0 || daily.data.totalDebits > 0) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <DailyCashflowChart
                      totalCredits={daily.data.totalCredits}
                      totalDebits={daily.data.totalDebits}
                      dailyDate={filters.dailyDate}
                    />

                    {/* Service mix pie */}
                    {daily.data.topServices?.length > 0 ? (
                      <ServiceMixPieChart services={daily.data.topServices} />
                    ) : (
                      daily.data.aeps && (
                        <div style={{ background: "linear-gradient(135deg,#0b2c60,#0f3872)", borderRadius: 16, padding: "20px 22px" }}>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>AePS TODAY</p>
                          {[
                            { label: "Total Tx", value: daily.data.aeps.totalTransactions },
                            { label: "Withdrawals", value: fmt(daily.data.aeps.totalWithdrawals) },
                            { label: "Deposits", value: fmt(daily.data.aeps.totalDeposits) },
                            { label: "Net Flow", value: fmt(daily.data.aeps.netFlow) },
                          ].map((row, i, arr) => (
                            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{row.label}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{row.value}</span>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Services table + AePS summary side-by-side */}
                {daily.data.topServices?.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: daily.data.aeps ? "1fr 300px" : "1fr", gap: 16 }}>
                    <ServicesUsedTable services={daily.data.topServices} />

                    {daily.data.aeps && (
                      <AepsNavySummary
                        label="AePS TODAY"
                        totalTransactions={daily.data.aeps.totalTransactions}
                        totalWithdrawals={daily.data.aeps.totalWithdrawals}
                        totalDeposits={daily.data.aeps.totalDeposits}
                        netFlow={daily.data.aeps.netFlow}
                      />
                    )}
                  </div>
                )}
              </>
            ) : <EmptyState label="No data for selected date" />}
          </div>
        )}

        {/* ─ Monthly ─ */}
        {activeTab === "monthly" && (
          <div className="space-y-5">
            {monthly.isLoading ? (
              <ReportsSkeleton />
            ) : monthly.data ? (
              <>
                {/* 2-col: daily revenue bar + AePS area */}
                <div style={{ display: "grid", gridTemplateColumns: monthly.data.aeps?.dailyBreakdown?.length ? "1fr 1fr" : "1fr", gap: 16 }}>
                  {monthly.data.dailyBreakdown?.length > 0 && (
                    <MonthlyRevenueChart
                      data={monthly.data.dailyBreakdown}
                      reportMonth={filters.reportMonth}
                      reportYear={filters.reportYear}
                      months={MONTHS}
                    />
                  )}

                  {monthly.data.aeps?.dailyBreakdown?.length > 0 && (
                    <AepsFloatAreaChart data={monthly.data.aeps.dailyBreakdown} />
                  )}
                </div>

                {/* Services table + AePS navy summary */}
                {monthly.data.aeps && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
                    <MonthlySummaryCard
                      totalCredits={monthly.data.totalCredits}
                      totalDebits={monthly.data.totalDebits}
                      netProfit={monthly.data.netProfit}
                      totalTransactions={monthly.data.totalTransactions}
                      reportMonth={filters.reportMonth}
                      reportYear={filters.reportYear}
                      months={MONTHS}
                    />

                    <AepsNavySummary
                      label="AePS THIS MONTH"
                      totalTransactions={monthly.data.aeps.totalTransactions}
                      totalWithdrawals={monthly.data.aeps.totalWithdrawals}
                      totalDeposits={monthly.data.aeps.totalDeposits}
                      netFlow={monthly.data.aeps.netFlow}
                    />
                  </div>
                )}
              </>
            ) : <EmptyState label="No data for this period" />}
          </div>
        )}

        {/* ─ AePS ─ */}
        {activeTab === "aeps" && (
          <div className="space-y-5">
            {aepsReport.isLoading ? (
              <ReportsSkeleton />
            ) : aepsReport.data ? (
              <>
                {aepsReport.data.dailyBreakdown?.length > 0 && (
                  <>
                    {/* 2-col: bar chart + opening balance area */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <AepsBarChart data={aepsReport.data.dailyBreakdown} />
                      <OpeningBalanceAreaChart data={aepsReport.data.dailyBreakdown} />
                    </div>

                    {/* Full-width day-wise table */}
                    <AepsDayWiseTable
                      data={aepsReport.data.dailyBreakdown}
                      aepsStart={filters.aepsStart}
                      aepsEnd={filters.aepsEnd}
                    />
                  </>
                )}
              </>
            ) : <EmptyState label="No AePS data found" />}
          </div>
        )}

        {/* ─ Services ─ */}
        {activeTab === "services" && (
          <div className="space-y-5">
            {!breakdown.data?.length ? (
              <EmptyState label="No service data yet" />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <ServicesRevenuePieChart data={breakdown.data} />
                <ServicesDetailTable data={breakdown.data} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ENTRY POINT
// ══════════════════════════════════════════════════════════════════════════════
export default function Reports() {
  const isMobile = useIsMobile();
  return (
    <Layout>
      {isMobile ? <MobileReports /> : <DesktopReports />}
    </Layout>
  );
}
