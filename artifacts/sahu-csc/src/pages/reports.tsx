import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGetDailyReport, useGetMonthlyReport, useGetServiceBreakdown } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend,
  LineChart, Line,
} from "recharts";
import {
  Calendar, Download, TrendingUp, TrendingDown, Activity,
  Fingerprint, ChevronRight, BarChart2, Layers, Filter,
  ArrowUpRight, ArrowDownLeft,
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
          ? <Skeleton className="h-5 w-20 mb-1" />
          : <p style={{ fontSize: 15, fontWeight: 900, color: "#0b2c60", lineHeight: 1.1 }}>{value}</p>}
        {sub && <p style={{ fontSize: 9, fontWeight: 600, color: "#94a3b8", marginTop: 3 }} className="truncate">{sub}</p>}
      </div>
    </div>
  );
}

function MobileReports() {
  const [activeTab, setActiveTab] = useState("daily");
  const [showFilter, setShowFilter] = useState(false);
  const filters = useFilterState();
  const { daily, monthly, breakdown, aepsReport } = useReportsData(filters.dailyDate, filters.reportYear, filters.reportMonth, filters.aepsStart, filters.aepsEnd);
  const tab = MOBILE_TABS.find(t => t.id === activeTab)!;

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
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
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
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
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
          ? <Skeleton className="h-8 w-28 mb-2" />
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

function DesktopReports() {
  const [activeTab, setActiveTab] = useState("daily");
  const filters = useFilterState();
  const { daily, monthly, breakdown, aepsReport } = useReportsData(filters.dailyDate, filters.reportYear, filters.reportMonth, filters.aepsStart, filters.aepsEnd);
  const tab = DESKTOP_TABS.find(t => t.id === activeTab)!;

  const exportUrl = activeTab === "aeps"
    ? `${BASE}/api/reports/export?startDate=${filters.aepsStart}&endDate=${filters.aepsEnd}`
    : `${BASE}/api/reports/export?startDate=${filters.monthStart}&endDate=${filters.monthEnd}`;

  // Header subtitle per tab
  const headerSub: Record<string, string> = {
    daily: filters.dailyDate,
    monthly: `${MONTHS[filters.reportMonth - 1]} ${filters.reportYear}`,
    aeps: `${filters.aepsStart} → ${filters.aepsEnd}`,
    services: "All-time breakdown",
  };

  return (
    <div className="flex gap-0 min-h-0" style={{ margin: "-24px -24px -24px", height: "calc(100vh - 64px)" }}>

      {/* ── Navy gradient sidebar ── */}
      <div style={{
        width: 244, flexShrink: 0,
        background: "linear-gradient(160deg,#0b2c60 0%,#0f3872 100%)",
        display: "flex", flexDirection: "column",
        boxShadow: "4px 0 24px rgba(11,44,96,0.18)",
      }}>
        {/* Logo strip */}
        <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#f97316,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BarChart2 size={18} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1.2 }}>SAHU CSC</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em" }}>REPORTS</p>
            </div>
          </div>
        </div>

        {/* Report type nav */}
        <div style={{ padding: "14px 12px 0" }}>
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", padding: "0 8px", marginBottom: 8, textTransform: "uppercase" }}>Report Type</p>
          {DESKTOP_TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1 transition-all"
                style={active
                  ? { background: "rgba(255,255,255,0.13)", color: "white", fontWeight: 700 }
                  : { background: "transparent", color: "rgba(255,255,255,0.55)", fontWeight: 400 }
                }
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: active ? t.grad : "rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <t.Icon size={13} color={active ? "#fff" : "rgba(255,255,255,0.5)"} />
                </div>
                {t.label}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />

        {/* Filters */}
        <div style={{ padding: "0 16px 20px" }}>
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>Filter</p>

          {activeTab === "daily" && (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 600 }}>Report Date</p>
              <input type="date" value={filters.dailyDate} onChange={e => filters.setDailyDate(e.target.value)}
                style={{ width: "100%", height: 36, borderRadius: 10, border: "none", background: "rgba(255,255,255,0.10)", color: "white", padding: "0 12px", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
            </div>
          )}
          {activeTab === "monthly" && (
            <>
              <div style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 600 }}>Month</p>
                <Select value={String(filters.reportMonth)} onValueChange={v => filters.setReportMonth(Number(v))}>
                  <SelectTrigger className="h-9 text-sm" style={{ background: "rgba(255,255,255,0.10)", border: "none", color: "white", borderRadius: 10 }}><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 600 }}>Year</p>
                <input type="number" value={filters.reportYear} onChange={e => filters.setReportYear(Number(e.target.value))}
                  style={{ width: "100%", height: 36, borderRadius: 10, border: "none", background: "rgba(255,255,255,0.10)", color: "white", padding: "0 12px", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
              </div>
            </>
          )}
          {activeTab === "aeps" && (
            <>
              <div style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 600 }}>From</p>
                <input type="date" value={filters.aepsStart} onChange={e => filters.setAepsStart(e.target.value)}
                  style={{ width: "100%", height: 36, borderRadius: 10, border: "none", background: "rgba(255,255,255,0.10)", color: "white", padding: "0 12px", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 600 }}>To</p>
                <input type="date" value={filters.aepsEnd} onChange={e => filters.setAepsEnd(e.target.value)}
                  style={{ width: "100%", height: 36, borderRadius: 10, border: "none", background: "rgba(255,255,255,0.10)", color: "white", padding: "0 12px", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
              </div>
            </>
          )}
          {activeTab === "services" && (
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>All-time service data</p>
          )}

          <a
            href={exportUrl}
            target="_blank"
            className="flex items-center justify-center gap-2 w-full h-9 rounded-xl text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg,#f97316,#fb923c)", textDecoration: "none" }}
          >
            <Download size={13} />Export Excel
          </a>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 overflow-auto" style={{ background: "#f1f5f9", padding: "26px 28px 28px" }}>

        {/* Content header */}
        <div style={{ marginBottom: 22 }}>
          <p style={{ fontSize: 20, fontWeight: 900, color: "#0b2c60", lineHeight: 1.2 }}>{tab.label}</p>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{headerSub[activeTab]} · All data is user-scoped</p>
        </div>

        {/* ─ Daily ─ */}
        {activeTab === "daily" && (
          <div className="space-y-5">
            {daily.isLoading ? (
              <div className="flex gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl flex-1" />)}</div>
            ) : daily.data ? (
              <>
                {/* KPI row — derive 7-day spark from monthly breakdown */}
                {(() => {
                  const bd = monthly.data?.dailyBreakdown ?? [];
                  const last7 = bd.slice(-7);
                  const spkCredits = last7.map((d: any) => ({ v: parseFloat(d.credits) || 0 }));
                  const spkDebits  = last7.map((d: any) => ({ v: parseFloat(d.debits)  || 0 }));
                  const spkNet     = last7.map((d: any) => ({ v: (parseFloat(d.credits) || 0) - (parseFloat(d.debits) || 0) }));
                  return (
                    <div className="flex gap-4">
                      <DesktopStatCard label="Transactions" value={daily.data.transactionCount} sub="Today's total" accentColor="#0b2c60" iconGrad="linear-gradient(135deg,#0b2c60,#1a4a9e)" Icon={Activity} />
                      <DesktopStatCard label="Net Revenue" value={fmt(daily.data.netRevenue)} sub={daily.data.netRevenue >= 0 ? "Profit today" : "Loss today"} accentColor={daily.data.netRevenue >= 0 ? "#10b981" : "#ef4444"} iconGrad={daily.data.netRevenue >= 0 ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)"} Icon={daily.data.netRevenue >= 0 ? TrendingUp : TrendingDown} sparkData={spkNet} sparkColor={daily.data.netRevenue >= 0 ? "#10b981" : "#ef4444"} />
                      <DesktopStatCard label="Credits" value={fmt(daily.data.totalCredits)} sub="Income" accentColor="#10b981" iconGrad="linear-gradient(135deg,#10b981,#059669)" Icon={ArrowDownLeft} sparkData={spkCredits} sparkColor="#10b981" />
                      <DesktopStatCard label="Debits" value={fmt(daily.data.totalDebits)} sub="Expenses" accentColor="#f97316" iconGrad="linear-gradient(135deg,#f97316,#ea580c)" Icon={ArrowUpRight} sparkData={spkDebits} sparkColor="#f97316" />
                    </div>
                  );
                })()}

                {/* Charts row — credits vs debits bar + service pie */}
                {(daily.data.totalCredits > 0 || daily.data.totalDebits > 0) && (
                  <div style={{ display: "grid", gridTemplateColumns: daily.data.topServices?.length ? "1fr 320px" : "1fr", gap: 16 }}>
                    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 20px rgba(11,44,96,0.08)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Today's Cashflow</p>
                          <p style={{ fontSize: 11, color: "#94a3b8" }}>Credits vs Debits</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {[{ l: "Credits", c: "#0b2c60" }, { l: "Debits", c: "#f97316" }].map(x => (
                            <div key={x.l} className="flex items-center gap-1.5">
                              <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
                              <span style={{ fontSize: 11, color: "#94a3b8" }}>{x.l}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={[{ name: filters.dailyDate, credits: daily.data.totalCredits, debits: daily.data.totalDebits }]} barSize={48} barGap={8}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="credits" name="Credits" fill="#0b2c60" radius={[6,6,0,0]} />
                          <Bar dataKey="debits" name="Debits" fill="#f97316" radius={[6,6,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {daily.data.topServices?.length > 0 && (
                      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 20px rgba(11,44,96,0.08)" }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60", marginBottom: 4 }}>Service Mix</p>
                        <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>By revenue share</p>
                        <ResponsiveContainer width="100%" height={160}>
                          <PieChart>
                            <Pie data={daily.data.topServices} dataKey="revenue" nameKey="serviceType" cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3}>
                              {daily.data.topServices.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-1.5 mt-1">
                          {daily.data.topServices.slice(0, 5).map((s: any, i: number) => (
                            <div key={s.serviceType} className="flex items-center gap-2">
                              <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                              <span style={{ fontSize: 11, color: "#334155", flex: 1 }} className="truncate">{s.serviceType}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: PIE_COLORS[i % PIE_COLORS.length] }}>{s.count}tx</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* AePS section */}
                {daily.data.aeps && (
                  <>
                    <SectionLabel label="AePS Cash" accentGrad="linear-gradient(180deg,#f97316,#ea580c)" />
                    <div className="flex gap-4">
                      <DesktopStatCard label="AePS Tx" value={daily.data.aeps.totalTransactions} sub="Transactions" accentColor="#f97316" iconGrad="linear-gradient(135deg,#f97316,#ea580c)" Icon={Fingerprint} />
                      <DesktopStatCard label="Net Flow" value={fmt(daily.data.aeps.netFlow)} accentColor={daily.data.aeps.netFlow >= 0 ? "#10b981" : "#ef4444"} iconGrad={daily.data.aeps.netFlow >= 0 ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)"} Icon={daily.data.aeps.netFlow >= 0 ? TrendingUp : TrendingDown} />
                      <DesktopStatCard label="Withdrawals" value={fmt(daily.data.aeps.totalWithdrawals)} accentColor="#ef4444" iconGrad="linear-gradient(135deg,#ef4444,#dc2626)" Icon={ArrowUpRight} />
                      <DesktopStatCard label="Deposits" value={fmt(daily.data.aeps.totalDeposits)} accentColor="#10b981" iconGrad="linear-gradient(135deg,#10b981,#059669)" Icon={ArrowDownLeft} />
                    </div>
                  </>
                )}

                {/* Top services table */}
                {daily.data.topServices?.length > 0 && (
                  <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 20px rgba(11,44,96,0.08)" }}>
                    <div style={{ height: 4, background: "linear-gradient(90deg,#0b2c60,#f97316)" }} />
                    <div className="p-5">
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60", marginBottom: 16 }}>Services Used Today</p>
                      <table className="w-full">
                        <thead>
                          <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                            {["#","Service","Transactions","Revenue"].map(h => (
                              <th key={h} style={{ textAlign: h === "#" || h === "Service" ? "left" : "right", fontSize: 10, color: "#94a3b8", letterSpacing: "0.08em", padding: "0 8px 10px", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {daily.data.topServices.map((s: any, i: number) => (
                            <tr key={s.serviceType} style={{ borderBottom: "1px solid #f8fafc" }}>
                              <td style={{ padding: "11px 8px" }}>
                                <div style={{ width: 26, height: 26, borderRadius: 8, background: PIE_COLORS[i % PIE_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "white" }}>{i + 1}</div>
                              </td>
                              <td style={{ padding: "11px 8px", fontSize: 13, fontWeight: 600, color: "#334155" }}>{s.serviceType}</td>
                              <td style={{ padding: "11px 8px", textAlign: "right" }}>
                                <span style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{s.count} tx</span>
                              </td>
                              <td style={{ padding: "11px 8px", textAlign: "right", fontSize: 13, fontWeight: 800, color: "#10b981" }}>{fmt(s.revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
              <div className="flex gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl flex-1" />)}</div>
            ) : monthly.data ? (
              <>
                {(() => {
                  const bd = monthly.data.dailyBreakdown ?? [];
                  const last7 = bd.slice(-7);
                  const spkCredits = last7.map((d: any) => ({ v: parseFloat(d.credits) || 0 }));
                  const spkDebits  = last7.map((d: any) => ({ v: parseFloat(d.debits)  || 0 }));
                  const spkNet     = last7.map((d: any) => ({ v: (parseFloat(d.credits) || 0) - (parseFloat(d.debits) || 0) }));
                  return (
                    <div className="flex gap-4">
                      <DesktopStatCard label="Transactions" value={monthly.data.totalTransactions} sub={`${MONTHS[filters.reportMonth - 1]} total`} accentColor="#0b2c60" iconGrad="linear-gradient(135deg,#0b2c60,#1a4a9e)" Icon={Activity} />
                      <DesktopStatCard label="Net Profit" value={fmt(monthly.data.netProfit)} sub={monthly.data.netProfit >= 0 ? "Month profit" : "Month loss"} accentColor={monthly.data.netProfit >= 0 ? "#10b981" : "#ef4444"} iconGrad={monthly.data.netProfit >= 0 ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)"} Icon={monthly.data.netProfit >= 0 ? TrendingUp : TrendingDown} sparkData={spkNet} sparkColor={monthly.data.netProfit >= 0 ? "#10b981" : "#ef4444"} />
                      <DesktopStatCard label="Total Credits" value={fmt(monthly.data.totalCredits)} accentColor="#10b981" iconGrad="linear-gradient(135deg,#10b981,#059669)" Icon={ArrowDownLeft} sparkData={spkCredits} sparkColor="#10b981" />
                      <DesktopStatCard label="Total Debits" value={fmt(monthly.data.totalDebits)} accentColor="#f97316" iconGrad="linear-gradient(135deg,#f97316,#ea580c)" Icon={ArrowUpRight} sparkData={spkDebits} sparkColor="#f97316" />
                    </div>
                  );
                })()}

                {monthly.data.dailyBreakdown?.length > 0 && (
                  <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 20px rgba(11,44,96,0.08)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Daily Revenue Trend</p>
                        <p style={{ fontSize: 11, color: "#94a3b8" }}>Credits vs Debits by day</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {[{ l: "Credits", c: "#0b2c60" }, { l: "Debits", c: "#f97316" }].map(x => (
                          <div key={x.l} className="flex items-center gap-1.5">
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>{x.l}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={monthly.data.dailyBreakdown} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={3}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => v.split("-")[2]} />
                        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="credits" name="Credits" fill="#0b2c60" radius={[4,4,0,0]} />
                        <Bar dataKey="debits" name="Debits" fill="#f97316" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {monthly.data.aeps && (
                  <>
                    <SectionLabel label="AePS Cash" accentGrad="linear-gradient(180deg,#f97316,#ea580c)" />
                    <div className="flex gap-4">
                      <DesktopStatCard label="AePS Tx" value={monthly.data.aeps.totalTransactions} accentColor="#f97316" iconGrad="linear-gradient(135deg,#f97316,#ea580c)" Icon={Fingerprint} />
                      <DesktopStatCard label="Net Flow" value={fmt(monthly.data.aeps.netFlow)} accentColor={monthly.data.aeps.netFlow >= 0 ? "#10b981" : "#ef4444"} iconGrad={monthly.data.aeps.netFlow >= 0 ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)"} Icon={monthly.data.aeps.netFlow >= 0 ? TrendingUp : TrendingDown} />
                      <DesktopStatCard label="Withdrawals" value={fmt(monthly.data.aeps.totalWithdrawals)} accentColor="#ef4444" iconGrad="linear-gradient(135deg,#ef4444,#dc2626)" Icon={ArrowUpRight} />
                      <DesktopStatCard label="Deposits" value={fmt(monthly.data.aeps.totalDeposits)} accentColor="#10b981" iconGrad="linear-gradient(135deg,#10b981,#059669)" Icon={ArrowDownLeft} />
                    </div>
                    {monthly.data.aeps.dailyBreakdown?.length > 0 && (
                      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 20px rgba(11,44,96,0.08)" }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60", marginBottom: 16 }}>AePS Daily Breakdown</p>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={monthly.data.aeps.dailyBreakdown} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => v.split("-")[2]} />
                            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="withdrawals" name="Withdrawals" fill="#ef4444" radius={[4,4,0,0]} />
                            <Bar dataKey="deposits" name="Deposits" fill="#10b981" radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : <EmptyState label="No data for this period" />}
          </div>
        )}

        {/* ─ AePS ─ */}
        {activeTab === "aeps" && (
          <div className="space-y-5">
            {aepsReport.isLoading ? (
              <div className="flex gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl flex-1" />)}</div>
            ) : aepsReport.data ? (
              <>
                {(() => {
                  const bd = aepsReport.data.dailyBreakdown ?? [];
                  const last7 = bd.slice(-7);
                  const spkWithdraw = last7.map((d: any) => ({ v: parseFloat(d.withdrawals) || 0 }));
                  const spkDeposit  = last7.map((d: any) => ({ v: parseFloat(d.deposits)    || 0 }));
                  const spkNet      = last7.map((d: any) => ({ v: parseFloat(d.netFlow)      || 0 }));
                  return (
                    <div className="flex gap-4">
                      <DesktopStatCard label="AePS Transactions" value={aepsReport.data.totalTransactions} sub="In date range" accentColor="#f97316" iconGrad="linear-gradient(135deg,#f97316,#ea580c)" Icon={Fingerprint} />
                      <DesktopStatCard label="Net Flow" value={fmt(aepsReport.data.netFlow)} sub={aepsReport.data.netFlow >= 0 ? "Net positive" : "Net negative"} accentColor={aepsReport.data.netFlow >= 0 ? "#10b981" : "#ef4444"} iconGrad={aepsReport.data.netFlow >= 0 ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)"} Icon={aepsReport.data.netFlow >= 0 ? TrendingUp : TrendingDown} sparkData={spkNet} sparkColor={aepsReport.data.netFlow >= 0 ? "#10b981" : "#ef4444"} />
                      <DesktopStatCard label="Total Withdrawals" value={fmt(aepsReport.data.totalWithdrawals)} accentColor="#ef4444" iconGrad="linear-gradient(135deg,#ef4444,#dc2626)" Icon={ArrowUpRight} sparkData={spkWithdraw} sparkColor="#ef4444" />
                      <DesktopStatCard label="Total Deposits" value={fmt(aepsReport.data.totalDeposits)} accentColor="#10b981" iconGrad="linear-gradient(135deg,#10b981,#059669)" Icon={ArrowDownLeft} sparkData={spkDeposit} sparkColor="#10b981" />
                    </div>
                  );
                })()}

                {aepsReport.data.dailyBreakdown?.length > 0 && (
                  <>
                    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 20px rgba(11,44,96,0.08)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Withdrawals vs Deposits</p>
                          <p style={{ fontSize: 11, color: "#94a3b8" }}>Day-by-day AePS cashflow</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {[{ l: "Withdrawals", c: "#ef4444" }, { l: "Deposits", c: "#10b981" }].map(x => (
                            <div key={x.l} className="flex items-center gap-1.5">
                              <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
                              <span style={{ fontSize: 11, color: "#94a3b8" }}>{x.l}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={aepsReport.data.dailyBreakdown} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={3}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => v.split("-")[2]} />
                          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="withdrawals" name="Withdrawals" fill="#ef4444" radius={[4,4,0,0]} />
                          <Bar dataKey="deposits" name="Deposits" fill="#10b981" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 20px rgba(11,44,96,0.08)" }}>
                      <div style={{ height: 4, background: "linear-gradient(90deg,#f97316,#ea580c)" }} />
                      <div className="p-5">
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60", marginBottom: 16 }}>Day-wise Detail</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                                {["Date","Opening Balance","Withdrawals","Deposits","Transactions","Net Flow"].map(h => (
                                  <th key={h} style={{ textAlign: h === "Date" ? "left" : "right", fontSize: 10, color: "#94a3b8", letterSpacing: "0.07em", padding: "0 8px 10px", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {aepsReport.data.dailyBreakdown.map((row: any) => (
                                <tr key={row.date} style={{ borderBottom: "1px solid #f8fafc" }}>
                                  <td style={{ padding: "11px 8px", fontSize: 12, fontWeight: 800, color: "#0b2c60", fontVariantNumeric: "tabular-nums" }}>{row.date}</td>
                                  <td style={{ padding: "11px 8px", textAlign: "right", fontSize: 12, color: "#64748b" }}>{formatINR(row.openingBalance)}</td>
                                  <td style={{ padding: "11px 8px", textAlign: "right", fontSize: 12, fontWeight: 700, color: "#ef4444" }}>{formatINR(row.withdrawals)}</td>
                                  <td style={{ padding: "11px 8px", textAlign: "right", fontSize: 12, fontWeight: 700, color: "#10b981" }}>{formatINR(row.deposits)}</td>
                                  <td style={{ padding: "11px 8px", textAlign: "right" }}>
                                    <span style={{ background: "#fff7ed", color: "#f97316", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{row.transactions}</span>
                                  </td>
                                  <td style={{ padding: "11px 8px", textAlign: "right", fontSize: 12, fontWeight: 800, color: row.netFlow >= 0 ? "#10b981" : "#ef4444" }}>{formatINR(row.netFlow)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
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
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 20px rgba(11,44,96,0.08)" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60", marginBottom: 4 }}>Revenue by Service</p>
                    <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>All-time share</p>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={breakdown.data} dataKey="revenue" nameKey="serviceType" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={3}>
                          {breakdown.data?.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ fontSize: 11, borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 20px rgba(11,44,96,0.08)" }}>
                    <div style={{ height: 4, background: "linear-gradient(90deg,#0b2c60,#f97316)" }} />
                    <div className="p-5">
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60", marginBottom: 16 }}>Service Details</p>
                      <table className="w-full">
                        <thead>
                          <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                            {["#","Service","Transactions","Revenue"].map(h => (
                              <th key={h} style={{ textAlign: h === "#" || h === "Service" ? "left" : "right", fontSize: 10, color: "#94a3b8", letterSpacing: "0.07em", padding: "0 8px 10px", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {breakdown.data?.map((s: any, i: number) => (
                            <tr key={s.serviceType} style={{ borderBottom: "1px solid #f8fafc" }}>
                              <td style={{ padding: "10px 8px" }}>
                                <div style={{ width: 22, height: 22, borderRadius: 6, background: PIE_COLORS[i % PIE_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "white" }}>{i + 1}</div>
                              </td>
                              <td style={{ padding: "10px 8px" }}>
                                <div className="flex items-center gap-2">
                                  <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                                  <span style={{ fontSize: 12, fontWeight: 500, color: "#334155" }}>{s.serviceType}</span>
                                </div>
                              </td>
                              <td style={{ padding: "10px 8px", textAlign: "right" }}>
                                <span style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{s.count}</span>
                              </td>
                              <td style={{ padding: "10px 8px", textAlign: "right", fontSize: 13, fontWeight: 800, color: "#10b981" }}>{fmt(s.revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
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
