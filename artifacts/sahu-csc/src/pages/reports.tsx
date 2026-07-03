import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useGetDailyReport, useGetMonthlyReport, useGetServiceBreakdown } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { SectionLoader } from "@/components/section-loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend,
  LineChart, Line, AreaChart, Area,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar, Download, TrendingUp, TrendingDown, Activity,
  Fingerprint, ChevronRight, BarChart2, Layers, Filter,
  ArrowUpRight, ArrowDownLeft, Printer,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const PIE_COLORS = ["#0b2c60","#f97316","#10b981","#8b5cf6","#ef4444","#06b6d4","#f59e0b","#ec4899"];

function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}
function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

// ── Shared data hook ─────────────────────────────────────────────────────────
function useReportsData(dailyDate: string, reportYear: number, reportMonth: number, aepsStart: string, aepsEnd: string) {
  const daily = useGetDailyReport({ date: dailyDate }) as { data: any; isLoading: boolean };
  const monthly = useGetMonthlyReport({ year: reportYear, month: reportMonth }) as { data: any; isLoading: boolean };
  const breakdown = useGetServiceBreakdown({}) as { data: any };
  const aepsReport = useQuery<any>({
    queryKey: ["reports", "aeps", aepsStart, aepsEnd],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/reports/aeps?startDate=${aepsStart}&endDate=${aepsEnd}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
  return { daily, monthly, breakdown, aepsReport };
}

// ── Shared filter state ───────────────────────────────────────────────────────
function useFilterState() {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const [dailyDate, setDailyDate] = useState(today);
  const [reportYear, setReportYear] = useState(now.getFullYear());
  const [reportMonth, setReportMonth] = useState(now.getMonth() + 1);
  const [aepsStart, setAepsStart] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`);
  const [aepsEnd, setAepsEnd] = useState(today);
  const monthStart = `${reportYear}-${String(reportMonth).padStart(2, "0")}-01`;
  const lastDay = new Date(reportYear, reportMonth, 0).getDate();
  const monthEnd = `${reportYear}-${String(reportMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { dailyDate, setDailyDate, reportYear, setReportYear, reportMonth, setReportMonth, aepsStart, setAepsStart, aepsEnd, setAepsEnd, monthStart, monthEnd };
}

// ══════════════════════════════════════════════════════════════════════════════
// MOBILE REPORTS
// ══════════════════════════════════════════════════════════════════════════════
const MOBILE_TABS = [
  { id: "daily",   label: "Daily",    Icon: Calendar,    accent: "#0b2c60", grad: "linear-gradient(135deg,#0b2c60,#1a4a9e)" },
  { id: "monthly", label: "Monthly",  Icon: BarChart2,   accent: "#8b5cf6", grad: "linear-gradient(135deg,#8b5cf6,#7c3aed)" },
  { id: "aeps",    label: "AePS",     Icon: Fingerprint, accent: "#f97316", grad: "linear-gradient(135deg,#f97316,#ea580c)" },
  { id: "services",label: "Services", Icon: Layers,      accent: "#10b981", grad: "linear-gradient(135deg,#10b981,#059669)" },
];

function MobileStatCard({ label, value, sub, accentColor, iconGrad, Icon, isLoading }: any) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden flex-1 min-w-0" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.10)" }}>
      <div style={{ height: 3, background: accentColor }} />
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1.2 }}>{label}</p>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: iconGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={12} color="#fff" />
          </div>
        </div>
        {isLoading
          ? <div className="h-5 w-20 mb-1 rounded bg-slate-100 animate-pulse" />
          : <p style={{ fontSize: 15, fontWeight: 900, color: "#0b2c60", lineHeight: 1.1 }}>{value}</p>}
        {sub && <p style={{ fontSize: 9, fontWeight: 600, color: "#94a3b8", marginTop: 3 }} className="truncate">{sub}</p>}
      </div>
    </div>
  );
}

function MobileReports() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("daily");
  const [showFilter, setShowFilter] = useState(false);
  const filters = useFilterState();
  const { daily, monthly, breakdown, aepsReport } = useReportsData(filters.dailyDate, filters.reportYear, filters.reportMonth, filters.aepsStart, filters.aepsEnd);
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
      {showFilter && (
        <div className="bg-white rounded-2xl p-4 space-y-3 border border-slate-100" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Filter Options</p>
          {activeTab === "daily" && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Date</p>
              <input type="date" value={filters.dailyDate} onChange={e => filters.setDailyDate(e.target.value)}
                className="w-full h-9 border border-slate-200 rounded-xl px-3 text-sm text-slate-800" />
            </div>
          )}
          {activeTab === "monthly" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Month</p>
                <Select value={String(filters.reportMonth)} onValueChange={v => filters.setReportMonth(Number(v))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Year</p>
                <input type="number" value={filters.reportYear} onChange={e => filters.setReportYear(Number(e.target.value))}
                  className="w-full h-9 border border-slate-200 rounded-xl px-3 text-sm text-slate-800" />
              </div>
            </div>
          )}
          {activeTab === "aeps" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">From</p>
                <input type="date" value={filters.aepsStart} onChange={e => filters.setAepsStart(e.target.value)}
                  className="w-full h-9 border border-slate-200 rounded-xl px-3 text-sm text-slate-800" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">To</p>
                <input type="date" value={filters.aepsEnd} onChange={e => filters.setAepsEnd(e.target.value)}
                  className="w-full h-9 border border-slate-200 rounded-xl px-3 text-sm text-slate-800" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Daily ── */}
      {activeTab === "daily" && (
        <div className="space-y-4">
          {daily.isLoading ? (
            <SectionLoader message="Loading daily report…" />
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
            <SectionLoader message="Loading monthly report…" />
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
                <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)" }}>
                  <div style={{ height: 3, background: "linear-gradient(90deg,#8b5cf6,#7c3aed)" }} />
                  <div className="p-4">
                    <p className="text-xs font-bold text-slate-600 mb-3">Daily Revenue</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={monthly.data.dailyBreakdown} margin={{ top: 0, right: 4, left: -28, bottom: 0 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 8, fill: "#94a3b8" }} tickFormatter={v => v.split("-")[2]} />
                        <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} />
                        <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, ""]} labelFormatter={l => `Date: ${l}`} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                        <Bar dataKey="credits" fill="#10b981" name="Credits" radius={[2,2,0,0]} />
                        <Bar dataKey="debits" fill="#f97316" name="Debits" radius={[2,2,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
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
                    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)" }}>
                      <div style={{ height: 3, background: "linear-gradient(90deg,#f97316,#ea580c)" }} />
                      <div className="p-4">
                        <p className="text-xs font-bold text-slate-600 mb-3">AePS Daily Breakdown</p>
                        <ResponsiveContainer width="100%" height={140}>
                          <BarChart data={monthly.data.aeps.dailyBreakdown} margin={{ top: 0, right: 4, left: -28, bottom: 0 }}>
                            <XAxis dataKey="date" tick={{ fontSize: 8, fill: "#94a3b8" }} tickFormatter={v => v.split("-")[2]} />
                            <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} />
                            <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, ""]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                            <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" radius={[2,2,0,0]} />
                            <Bar dataKey="deposits" fill="#10b981" name="Deposits" radius={[2,2,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
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
                  <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)" }}>
                    <div style={{ height: 3, background: "linear-gradient(90deg,#f97316,#ea580c)" }} />
                    <div className="p-4">
                      <p className="text-xs font-bold text-slate-600 mb-3">Withdrawals vs Deposits</p>
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={aepsReport.data.dailyBreakdown} margin={{ top: 0, right: 4, left: -28, bottom: 0 }}>
                          <XAxis dataKey="date" tick={{ fontSize: 8, fill: "#94a3b8" }} tickFormatter={v => v.split("-")[2]} />
                          <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} />
                          <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, ""]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                          <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" radius={[2,2,0,0]} />
                          <Bar dataKey="deposits" fill="#10b981" name="Deposits" radius={[2,2,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

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
              <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)" }}>
                <div style={{ height: 3, background: "linear-gradient(90deg,#10b981,#059669)" }} />
                <div className="p-4">
                  <p className="text-xs font-bold text-slate-600 mb-3">Revenue by Service</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={breakdown.data} dataKey="revenue" nameKey="serviceType" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                        {breakdown.data?.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

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
  { id: "daily",    label: "Daily Report",    Icon: Calendar,    accent: "#0b2c60", light: "rgba(11,44,96,0.08)", grad: "linear-gradient(135deg,#0b2c60,#1a4a9e)" },
  { id: "monthly",  label: "Monthly Report",  Icon: BarChart2,   accent: "#8b5cf6", light: "rgba(139,92,246,0.08)", grad: "linear-gradient(135deg,#8b5cf6,#7c3aed)" },
  { id: "aeps",     label: "AePS Report",     Icon: Fingerprint, accent: "#f97316", light: "rgba(249,115,22,0.08)", grad: "linear-gradient(135deg,#f97316,#ea580c)" },
  { id: "services", label: "Service Analysis",Icon: Layers,      accent: "#10b981", light: "rgba(16,185,129,0.08)", grad: "linear-gradient(135deg,#10b981,#059669)" },
];

function Sparkline({ data, color }: { data: { v: number }[]; color: string }) {
  const trend = data.length >= 2 ? data[data.length - 1].v - data[0].v : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
      <LineChart width={72} height={28} data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} dot={false} isAnimationActive={false} />
      </LineChart>
      <span style={{
        fontSize: 10, fontWeight: 700,
        color: trend >= 0 ? "#10b981" : "#ef4444",
      }}>
        {trend >= 0 ? "▲" : "▼"} 7d
      </span>
    </div>
  );
}

function DesktopStatCard({ label, value, sub, accentColor, iconGrad, Icon, isLoading, sparkData, sparkColor }: any) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden flex-1" style={{ boxShadow: "0 2px 20px rgba(11,44,96,0.10)", borderTop: `4px solid ${accentColor}` }}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: iconGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 12px ${accentColor}44` }}>
            <Icon size={18} color="#fff" />
          </div>
        </div>
        {isLoading
          ? <div className="h-8 w-28 mb-2 rounded-lg bg-slate-100 animate-pulse" />
          : <p style={{ fontSize: 26, fontWeight: 900, color: "#0b2c60", lineHeight: 1 }}>{value}</p>}
        {sub && <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginTop: 6 }}>{sub}</p>}
        {sparkData?.length >= 2 && <Sparkline data={sparkData} color={sparkColor ?? accentColor} />}
      </div>
    </div>
  );
}

function SectionLabel({ label, accentGrad }: { label: string; accentGrad: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-5 rounded-full" style={{ background: accentGrad }} />
      <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", border: "none" }}>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "#334155" }}>{p.name}: <b>₹{Number(p.value).toLocaleString("en-IN")}</b></span>
        </div>
      ))}
    </div>
  );
}

/* ── KPI strip metric chip ─────────────────────────────────────────────────── */
function KpiChip({ label, value, trend, pos }: { label: string; value: string | number; trend?: string; pos?: boolean }) {
  return (
    <div style={{ flex: 1, padding: "0 20px", borderRight: "1px solid rgba(255,255,255,0.10)" }}>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", marginBottom: 5, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 19, fontWeight: 900, color: "white", marginBottom: 3, letterSpacing: "-0.5px" }}>{value}</div>
      {trend && (
        <div style={{ fontSize: 10, fontWeight: 700, color: pos ? "#34d399" : "#fca5a5" }}>{trend}</div>
      )}
    </div>
  );
}

function DesktopReports() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("daily");
  const filters = useFilterState();
  const { daily, monthly, breakdown, aepsReport } = useReportsData(filters.dailyDate, filters.reportYear, filters.reportMonth, filters.aepsStart, filters.aepsEnd);

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
        { label: "Total Credits",  value: fmt(daily.data.totalCredits),  trend: undefined },
        { label: "Total Debits",   value: fmt(daily.data.totalDebits),   trend: undefined },
        { label: "Net Revenue",    value: fmt(daily.data.netRevenue),    trend: daily.data.netRevenue >= 0 ? "Profitable day" : "Loss day", pos: daily.data.netRevenue >= 0 },
        { label: "Transactions",   value: daily.data.transactionCount,   trend: undefined },
        { label: "Avg Ticket",     value: fmt(avg),                      trend: undefined },
      ];
    }
    if (activeTab === "monthly" && monthly.data) {
      const avg = monthly.data.totalTransactions > 0 ? monthly.data.netProfit / monthly.data.totalTransactions : 0;
      return [
        { label: "Total Credits",  value: fmt(monthly.data.totalCredits),  trend: undefined },
        { label: "Total Debits",   value: fmt(monthly.data.totalDebits),   trend: undefined },
        { label: "Net Profit",     value: fmt(monthly.data.netProfit),     trend: monthly.data.netProfit >= 0 ? "Month profit" : "Month loss", pos: monthly.data.netProfit >= 0 },
        { label: "Transactions",   value: monthly.data.totalTransactions,  trend: undefined },
        { label: "Avg Ticket",     value: fmt(avg),                        trend: undefined },
      ];
    }
    if (activeTab === "aeps" && aepsReport.data) {
      return [
        { label: "AePS Tx",        value: aepsReport.data.totalTransactions, trend: undefined },
        { label: "Withdrawals",    value: fmt(aepsReport.data.totalWithdrawals), trend: undefined },
        { label: "Deposits",       value: fmt(aepsReport.data.totalDeposits),    trend: undefined },
        { label: "Net Flow",       value: fmt(aepsReport.data.netFlow), trend: aepsReport.data.netFlow >= 0 ? "Net positive" : "Net negative", pos: aepsReport.data.netFlow >= 0 },
      ];
    }
    if (activeTab === "services" && breakdown.data?.length) {
      const totalTx  = breakdown.data.reduce((s: number, r: any) => s + r.count, 0);
      const totalRev = breakdown.data.reduce((s: number, r: any) => s + parseFloat(r.revenue || 0), 0);
      return [
        { label: "Services",       value: breakdown.data.length,  trend: undefined },
        { label: "Total Tx",       value: totalTx,                trend: undefined },
        { label: "Total Revenue",  value: fmt(totalRev),          trend: undefined },
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
                  borderBottom: active ? `3px solid #0b2c60` : "3px solid transparent",
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
        <div style={{ padding: "0 16px", display: "flex", alignItems: "center", gap: 8, borderLeft: "1px solid #e2e8f0" }}>
          {activeTab === "daily" && (
            <input type="date" value={filters.dailyDate} onChange={e => filters.setDailyDate(e.target.value)}
              style={{ height: 32, borderRadius: 8, border: "1px solid #e2e8f0", padding: "0 10px", fontSize: 12, color: "#334155", outline: "none" }} />
          )}
          {activeTab === "monthly" && (
            <>
              <Select value={String(filters.reportMonth)} onValueChange={v => filters.setReportMonth(Number(v))}>
                <SelectTrigger className="h-8 text-xs w-28" style={{ border: "1px solid #e2e8f0", borderRadius: 8 }}><SelectValue /></SelectTrigger>
                <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>)}</SelectContent>
              </Select>
              <input type="number" value={filters.reportYear} onChange={e => filters.setReportYear(Number(e.target.value))}
                style={{ height: 32, width: 72, borderRadius: 8, border: "1px solid #e2e8f0", padding: "0 10px", fontSize: 12, color: "#334155", outline: "none" }} />
            </>
          )}
          {activeTab === "aeps" && (
            <>
              <input type="date" value={filters.aepsStart} onChange={e => filters.setAepsStart(e.target.value)}
                style={{ height: 32, borderRadius: 8, border: "1px solid #e2e8f0", padding: "0 10px", fontSize: 12, color: "#334155", outline: "none" }} />
              <span style={{ fontSize: 11, color: "#94a3b8" }}>→</span>
              <input type="date" value={filters.aepsEnd} onChange={e => filters.setAepsEnd(e.target.value)}
                style={{ height: 32, borderRadius: 8, border: "1px solid #e2e8f0", padding: "0 10px", fontSize: 12, color: "#334155", outline: "none" }} />
            </>
          )}
          <button
            onClick={printReport}
            style={{ height: 32, borderRadius: 8, background: "white", border: "1px solid #e2e8f0", color: "#0b2c60", fontSize: 12, fontWeight: 700, padding: "0 14px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}
          >
            <Printer size={12} /> Print
          </button>
          <a
            href={exportUrl} target="_blank"
            style={{ height: 32, borderRadius: 8, background: "linear-gradient(135deg,#f97316,#fb923c)", color: "white", fontSize: 12, fontWeight: 700, padding: "0 14px", display: "flex", alignItems: "center", gap: 6, textDecoration: "none", flexShrink: 0 }}
          >
            <Download size={12} /> Export
          </a>
        </div>
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
              <SectionLoader message="Loading daily report…" minHeight={200} />
            ) : daily.data ? (
              <>
                {/* 2-col chart grid */}
                {(daily.data.totalCredits > 0 || daily.data.totalDebits > 0) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {/* Cashflow bar */}
                    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Today's Cashflow</p>
                          <p style={{ fontSize: 11, color: "#94a3b8" }}>Credits vs Debits · {filters.dailyDate}</p>
                        </div>
                        <div style={{ display: "flex", gap: 12 }}>
                          {[{ l: "Credits", c: "#3b82f6" }, { l: "Debits", c: "#fca5a5" }].map(x => (
                            <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
                              <span style={{ fontSize: 10, color: "#94a3b8" }}>{x.l}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={[{ name: "Today", credits: daily.data.totalCredits, debits: daily.data.totalDebits }]} barSize={48} barGap={8}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="credits" name="Credits" fill="#3b82f6" radius={[6,6,0,0]} />
                          <Bar dataKey="debits" name="Debits" fill="#fca5a5" radius={[6,6,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Service mix pie */}
                    {daily.data.topServices?.length > 0 ? (
                      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60", marginBottom: 4 }}>Service Mix</p>
                        <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>By revenue share</p>
                        <ResponsiveContainer width="100%" height={160}>
                          <PieChart>
                            <Pie data={daily.data.topServices} dataKey="revenue" nameKey="serviceType" cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3}>
                              {daily.data.topServices.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 6 }}>
                          {daily.data.topServices.slice(0, 5).map((s: any, i: number) => (
                            <div key={s.serviceType} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                              <span style={{ fontSize: 11, color: "#334155", flex: 1 }}>{s.serviceType}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: PIE_COLORS[i % PIE_COLORS.length] }}>{s.count} tx</span>
                            </div>
                          ))}
                        </div>
                      </div>
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
                    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
                      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Services Used Today</p>
                        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Transaction breakdown by service</p>
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead style={{ background: "#f8fafc" }}>
                          <tr>
                            {["Rank","Service","Transactions","Revenue"].map(h => (
                              <th key={h} style={{ padding: "9px 16px", fontSize: 10, color: "#94a3b8", letterSpacing: "0.07em", fontWeight: 600, textTransform: "uppercase", textAlign: h === "Rank" || h === "Service" ? "left" : "right" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {daily.data.topServices.map((s: any, i: number) => (
                            <tr key={s.serviceType} style={{ borderTop: "1px solid #f8fafc" }}>
                              <td style={{ padding: "11px 16px" }}>
                                <div style={{ width: 24, height: 24, borderRadius: 7, background: PIE_COLORS[i % PIE_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "white" }}>{i + 1}</div>
                              </td>
                              <td style={{ padding: "11px 16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{ width: 6, height: 6, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                                  <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{s.serviceType}</span>
                                </div>
                              </td>
                              <td style={{ padding: "11px 16px", textAlign: "right" }}>
                                <span style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{s.count}</span>
                              </td>
                              <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#10b981" }}>{fmt(s.revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {daily.data.aeps && (
                      <div style={{ background: "linear-gradient(135deg,#0b2c60,#0f3872)", borderRadius: 16, padding: "20px 22px" }}>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>AePS TODAY</p>
                        {[
                          { label: "Total Transactions", value: daily.data.aeps.totalTransactions },
                          { label: "Total Withdrawn", value: fmt(daily.data.aeps.totalWithdrawals) },
                          { label: "Total Deposited", value: fmt(daily.data.aeps.totalDeposits) },
                          { label: "Net Flow", value: fmt(daily.data.aeps.netFlow) },
                        ].map((row, i, arr) => (
                          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{row.label}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: i === 2 ? "#34d399" : i === 1 ? "#fca5a5" : "white" }}>{row.value}</span>
                          </div>
                        ))}
                      </div>
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
              <SectionLoader message="Loading monthly report…" minHeight={200} />
            ) : monthly.data ? (
              <>
                {/* 2-col: daily revenue bar + AePS area */}
                <div style={{ display: "grid", gridTemplateColumns: monthly.data.aeps?.dailyBreakdown?.length ? "1fr 1fr" : "1fr", gap: 16 }}>
                  {monthly.data.dailyBreakdown?.length > 0 && (
                    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Daily Revenue Trend</p>
                          <p style={{ fontSize: 11, color: "#94a3b8" }}>Credits vs Debits · {MONTHS[filters.reportMonth - 1]} {filters.reportYear}</p>
                        </div>
                        <div style={{ display: "flex", gap: 12 }}>
                          {[{ l: "Credits", c: "#3b82f6" }, { l: "Debits", c: "#fca5a5" }].map(x => (
                            <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
                              <span style={{ fontSize: 10, color: "#94a3b8" }}>{x.l}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={monthly.data.dailyBreakdown} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={3}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => v.split("-")[2]} />
                          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="credits" name="Credits" fill="#3b82f6" radius={[4,4,0,0]} />
                          <Bar dataKey="debits" name="Debits" fill="#fca5a5" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {monthly.data.aeps?.dailyBreakdown?.length > 0 && (
                    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>AePS Float — This Month</p>
                        <p style={{ fontSize: 11, color: "#94a3b8" }}>Withdrawals vs Deposits daily</p>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={monthly.data.aeps.dailyBreakdown}>
                          <defs>
                            <linearGradient id="wdGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
                              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="dpGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                          <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => v.split("-")[2]} />
                          <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                          <Tooltip content={<ChartTooltip />} />
                          <Area type="monotone" dataKey="withdrawals" name="Withdrawals" stroke="#ef4444" strokeWidth={2} fill="url(#wdGrad)" dot={false} />
                          <Area type="monotone" dataKey="deposits" name="Deposits" stroke="#10b981" strokeWidth={2} fill="url(#dpGrad)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Services table + AePS navy summary */}
                {monthly.data.aeps && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
                    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
                      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Monthly Summary</p>
                        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{MONTHS[filters.reportMonth - 1]} {filters.reportYear}</p>
                      </div>
                      <div style={{ padding: "16px 20px" }}>
                        {[
                          { label: "Total Credits",  value: fmt(monthly.data.totalCredits),      color: "#3b82f6" },
                          { label: "Total Debits",   value: fmt(monthly.data.totalDebits),       color: "#fca5a5" },
                          { label: "Net Profit",     value: fmt(monthly.data.netProfit),         color: monthly.data.netProfit >= 0 ? "#10b981" : "#ef4444" },
                          { label: "Transactions",   value: monthly.data.totalTransactions,      color: "#0b2c60" },
                        ].map((row, i, arr) => (
                          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid #f8fafc" : "none" }}>
                            <span style={{ fontSize: 13, color: "#64748b" }}>{row.label}</span>
                            <span style={{ fontSize: 15, fontWeight: 800, color: row.color }}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: "linear-gradient(135deg,#0b2c60,#0f3872)", borderRadius: 16, padding: "20px 22px" }}>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>AePS THIS MONTH</p>
                      {[
                        { label: "Total Transactions", value: monthly.data.aeps.totalTransactions },
                        { label: "Total Withdrawn",    value: fmt(monthly.data.aeps.totalWithdrawals) },
                        { label: "Total Deposited",    value: fmt(monthly.data.aeps.totalDeposits) },
                        { label: "Net Flow",           value: fmt(monthly.data.aeps.netFlow) },
                      ].map((row, i, arr) => (
                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{row.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: i === 2 ? "#34d399" : i === 1 ? "#fca5a5" : "white" }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
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
              <SectionLoader message="Loading AePS report…" minHeight={200} />
            ) : aepsReport.data ? (
              <>
                {aepsReport.data.dailyBreakdown?.length > 0 && (
                  <>
                    {/* 2-col: bar chart + day-wise table */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Withdrawals vs Deposits</p>
                            <p style={{ fontSize: 11, color: "#94a3b8" }}>Day-by-day AePS cashflow</p>
                          </div>
                          <div style={{ display: "flex", gap: 12 }}>
                            {[{ l: "Withdrawals", c: "#ef4444" }, { l: "Deposits", c: "#10b981" }].map(x => (
                              <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
                                <span style={{ fontSize: 10, color: "#94a3b8" }}>{x.l}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={aepsReport.data.dailyBreakdown} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={3}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => v.split("-")[2]} />
                            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="withdrawals" name="Withdrawals" fill="#ef4444" radius={[4,4,0,0]} />
                            <Bar dataKey="deposits" name="Deposits" fill="#10b981" radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* AePS area chart — opening float */}
                      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
                        <div style={{ marginBottom: 16 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Opening Balance Trend</p>
                          <p style={{ fontSize: 11, color: "#94a3b8" }}>Daily opening float over period</p>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                          <AreaChart data={aepsReport.data.dailyBreakdown}>
                            <defs>
                              <linearGradient id="obGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => v.split("-")[2]} />
                            <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="openingBalance" name="Opening Balance" stroke="#3b82f6" strokeWidth={2} fill="url(#obGrad)" dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Full-width day-wise table */}
                    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
                      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Day-wise Detail</p>
                        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{filters.aepsStart} → {filters.aepsEnd}</p>
                      </div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead style={{ background: "#f8fafc" }}>
                            <tr>
                              {["Date","Opening Balance","Withdrawals","Deposits","Transactions","Net Flow"].map(h => (
                                <th key={h} style={{ padding: "9px 16px", fontSize: 10, color: "#94a3b8", letterSpacing: "0.07em", fontWeight: 600, textTransform: "uppercase", textAlign: h === "Date" ? "left" : "right" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {aepsReport.data.dailyBreakdown.map((row: any) => (
                              <tr key={row.date} style={{ borderTop: "1px solid #f8fafc" }}>
                                <td style={{ padding: "11px 16px", fontSize: 12, fontWeight: 800, color: "#0b2c60" }}>{row.date}</td>
                                <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 12, color: "#64748b" }}>{formatINR(row.openingBalance)}</td>
                                <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, color: "#ef4444" }}>{formatINR(row.withdrawals)}</td>
                                <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, color: "#10b981" }}>{formatINR(row.deposits)}</td>
                                <td style={{ padding: "11px 16px", textAlign: "right" }}>
                                  <span style={{ background: "#fff7ed", color: "#f97316", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{row.transactions}</span>
                                </td>
                                <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 12, fontWeight: 800, color: row.netFlow >= 0 ? "#10b981" : "#ef4444" }}>{formatINR(row.netFlow)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
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
                <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60", marginBottom: 4 }}>Revenue by Service</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>All-time share</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={breakdown.data} dataKey="revenue" nameKey="serviceType" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={3}>
                        {breakdown.data?.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ fontSize: 11, borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 8 }}>
                    {breakdown.data?.slice(0, 5).map((s: any, i: number) => (
                      <div key={s.serviceType} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: "#334155", flex: 1 }}>{s.serviceType}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: PIE_COLORS[i % PIE_COLORS.length] }}>{s.count} tx</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Service Details</p>
                    <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>All-time breakdown</p>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f8fafc" }}>
                      <tr>
                        {["Rank","Service","Transactions","Revenue"].map(h => (
                          <th key={h} style={{ padding: "9px 16px", fontSize: 10, color: "#94a3b8", letterSpacing: "0.07em", fontWeight: 600, textTransform: "uppercase", textAlign: h === "Rank" || h === "Service" ? "left" : "right" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {breakdown.data?.map((s: any, i: number) => (
                        <tr key={s.serviceType} style={{ borderTop: "1px solid #f8fafc" }}>
                          <td style={{ padding: "11px 16px" }}>
                            <div style={{ width: 24, height: 24, borderRadius: 7, background: PIE_COLORS[i % PIE_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "white" }}>{i + 1}</div>
                          </td>
                          <td style={{ padding: "11px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 6, height: 6, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                              <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{s.serviceType}</span>
                            </div>
                          </td>
                          <td style={{ padding: "11px 16px", textAlign: "right" }}>
                            <span style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{s.count}</span>
                          </td>
                          <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 13, fontWeight: 800, color: "#10b981" }}>{fmt(s.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(11,44,96,0.07)" }}>
        <BarChart2 size={28} style={{ color: "#94a3b8" }} />
      </div>
      <p className="text-sm font-semibold text-slate-400">{label}</p>
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
