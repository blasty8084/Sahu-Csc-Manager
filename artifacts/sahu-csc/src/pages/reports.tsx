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
// DESKTOP REPORTS
// ══════════════════════════════════════════════════════════════════════════════
const DESKTOP_TABS = [
  { id: "daily",    label: "Daily Report",    Icon: Calendar,    accent: "#0b2c60", light: "rgba(11,44,96,0.08)", grad: "linear-gradient(135deg,#0b2c60,#1a4a9e)" },
  { id: "monthly",  label: "Monthly Report",  Icon: BarChart2,   accent: "#8b5cf6", light: "rgba(139,92,246,0.08)", grad: "linear-gradient(135deg,#8b5cf6,#7c3aed)" },
  { id: "aeps",     label: "AePS Report",     Icon: Fingerprint, accent: "#f97316", light: "rgba(249,115,22,0.08)", grad: "linear-gradient(135deg,#f97316,#ea580c)" },
  { id: "services", label: "Service Analysis",Icon: Layers,      accent: "#10b981", light: "rgba(16,185,129,0.08)", grad: "linear-gradient(135deg,#10b981,#059669)" },
];

function DesktopStatCard({ label, value, sub, accentColor, iconGrad, Icon, isLoading }: any) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.09)" }}>
      <div style={{ height: 3, background: accentColor }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: iconGrad, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={16} color="#fff" />
          </div>
        </div>
        {isLoading
          ? <Skeleton className="h-8 w-28 mb-2" />
          : <p style={{ fontSize: 24, fontWeight: 900, color: "#0b2c60", lineHeight: 1 }}>{value}</p>}
        {sub && <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginTop: 6 }}>{sub}</p>}
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

function DesktopReports() {
  const [activeTab, setActiveTab] = useState("daily");
  const filters = useFilterState();
  const { daily, monthly, breakdown, aepsReport } = useReportsData(filters.dailyDate, filters.reportYear, filters.reportMonth, filters.aepsStart, filters.aepsEnd);
  const tab = DESKTOP_TABS.find(t => t.id === activeTab)!;

  const exportUrl = activeTab === "aeps"
    ? `${BASE}/api/reports/export?startDate=${filters.aepsStart}&endDate=${filters.aepsEnd}`
    : `${BASE}/api/reports/export?startDate=${filters.monthStart}&endDate=${filters.monthEnd}`;

  return (
    <div className="flex gap-6 min-h-0">
      {/* ── Left sidebar ── */}
      <div className="w-64 flex-shrink-0 space-y-4">
        {/* Nav */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.09)" }}>
          <div style={{ height: 3, background: "linear-gradient(90deg,#0b2c60,#f97316)" }} />
          <div className="p-2">
            {DESKTOP_TABS.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-0.5"
                  style={active
                    ? { background: t.light, color: t.accent }
                    : { color: "#64748b" }
                  }
                >
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: active ? t.grad : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <t.Icon size={13} color={active ? "#fff" : "#94a3b8"} />
                  </div>
                  {t.label}
                  {active && <ChevronRight size={13} className="ml-auto flex-shrink-0" style={{ color: t.accent }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.09)" }}>
          <div style={{ height: 3, background: tab.grad }} />
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Filter size={13} style={{ color: "#94a3b8" }} />
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Filters</p>
            </div>

            {activeTab === "daily" && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1.5">Report Date</p>
                <input type="date" value={filters.dailyDate} onChange={e => filters.setDailyDate(e.target.value)}
                  className="w-full h-9 border border-slate-200 rounded-xl px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
              </div>
            )}
            {activeTab === "monthly" && (
              <>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1.5">Month</p>
                  <Select value={String(filters.reportMonth)} onValueChange={v => filters.setReportMonth(Number(v))}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1.5">Year</p>
                  <input type="number" value={filters.reportYear} onChange={e => filters.setReportYear(Number(e.target.value))}
                    className="w-full h-9 border border-slate-200 rounded-xl px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                </div>
              </>
            )}
            {(activeTab === "aeps" || activeTab === "services") && activeTab === "aeps" && (
              <>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1.5">From Date</p>
                  <input type="date" value={filters.aepsStart} onChange={e => filters.setAepsStart(e.target.value)}
                    className="w-full h-9 border border-slate-200 rounded-xl px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1.5">To Date</p>
                  <input type="date" value={filters.aepsEnd} onChange={e => filters.setAepsEnd(e.target.value)}
                    className="w-full h-9 border border-slate-200 rounded-xl px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                </div>
              </>
            )}
            {activeTab === "services" && (
              <p className="text-xs text-slate-400">All-time service breakdown</p>
            )}

            <a
              href={exportUrl}
              target="_blank"
              className="flex items-center justify-center gap-2 w-full h-9 rounded-xl text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)" }}
            >
              <Download size={13} />Export Excel
            </a>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* ─ Daily ─ */}
        {activeTab === "daily" && (
          <>
            {daily.isLoading ? (
              <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
            ) : daily.data ? (
              <>
                <SectionLabel label="Ledger Summary" accentGrad="linear-gradient(180deg,#0b2c60,#1a4a9e)" />
                <div className="grid grid-cols-4 gap-4">
                  <DesktopStatCard label="Transactions" value={daily.data.transactionCount} sub="Today's total" accentColor="linear-gradient(90deg,#0b2c60,#1a4a9e)" iconGrad="linear-gradient(135deg,#0b2c60,#1a4a9e)" Icon={Activity} />
                  <DesktopStatCard label="Net Revenue" value={fmt(daily.data.netRevenue)} sub={daily.data.netRevenue >= 0 ? "Profit today" : "Loss today"} accentColor={daily.data.netRevenue >= 0 ? "linear-gradient(90deg,#10b981,#059669)" : "linear-gradient(90deg,#ef4444,#dc2626)"} iconGrad={daily.data.netRevenue >= 0 ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)"} Icon={daily.data.netRevenue >= 0 ? TrendingUp : TrendingDown} />
                  <DesktopStatCard label="Credits" value={fmt(daily.data.totalCredits)} sub="Income" accentColor="linear-gradient(90deg,#10b981,#059669)" iconGrad="linear-gradient(135deg,#10b981,#059669)" Icon={ArrowDownLeft} />
                  <DesktopStatCard label="Debits" value={fmt(daily.data.totalDebits)} sub="Expenses" accentColor="linear-gradient(90deg,#f97316,#ea580c)" iconGrad="linear-gradient(135deg,#f97316,#ea580c)" Icon={ArrowUpRight} />
                </div>

                {daily.data.aeps && (
                  <>
                    <SectionLabel label="AePS Cash" accentGrad="linear-gradient(180deg,#f97316,#ea580c)" />
                    <div className="grid grid-cols-4 gap-4">
                      <DesktopStatCard label="AePS Tx" value={daily.data.aeps.totalTransactions} sub="Transactions" accentColor="linear-gradient(90deg,#f97316,#ea580c)" iconGrad="linear-gradient(135deg,#f97316,#ea580c)" Icon={Fingerprint} />
                      <DesktopStatCard label="Net Flow" value={fmt(daily.data.aeps.netFlow)} accentColor={daily.data.aeps.netFlow >= 0 ? "linear-gradient(90deg,#10b981,#059669)" : "linear-gradient(90deg,#ef4444,#dc2626)"} iconGrad={daily.data.aeps.netFlow >= 0 ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)"} Icon={daily.data.aeps.netFlow >= 0 ? TrendingUp : TrendingDown} />
                      <DesktopStatCard label="Withdrawals" value={fmt(daily.data.aeps.totalWithdrawals)} accentColor="linear-gradient(90deg,#ef4444,#dc2626)" iconGrad="linear-gradient(135deg,#ef4444,#dc2626)" Icon={ArrowUpRight} />
                      <DesktopStatCard label="Deposits" value={fmt(daily.data.aeps.totalDeposits)} accentColor="linear-gradient(90deg,#10b981,#059669)" iconGrad="linear-gradient(135deg,#10b981,#059669)" Icon={ArrowDownLeft} />
                    </div>
                  </>
                )}

                {daily.data.topServices?.length > 0 && (
                  <>
                    <SectionLabel label="Services Used Today" accentGrad="linear-gradient(180deg,#8b5cf6,#7c3aed)" />
                    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.09)" }}>
                      <div style={{ height: 3, background: "linear-gradient(90deg,#8b5cf6,#7c3aed)" }} />
                      <div className="p-5">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-100">
                              <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">#</th>
                              <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Service</th>
                              <th className="text-right py-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Transactions</th>
                              <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Revenue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {daily.data.topServices.map((s: any, i: number) => (
                              <tr key={s.serviceType} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 pr-4">
                                  <div className="w-6 h-6 rounded-lg text-white text-[10px] font-black flex items-center justify-center" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}>{i + 1}</div>
                                </td>
                                <td className="py-3 pr-4 font-semibold text-slate-700">{s.serviceType}</td>
                                <td className="py-3 pr-4 text-right">
                                  <span className="text-xs font-bold text-white px-2.5 py-1 rounded-full" style={{ background: "#8b5cf6" }}>{s.count}tx</span>
                                </td>
                                <td className="py-3 text-right font-black" style={{ color: "#0b2c60" }}>{fmt(s.revenue)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : <EmptyState label="No data for selected date" />}
          </>
        )}

        {/* ─ Monthly ─ */}
        {activeTab === "monthly" && (
          <>
            {monthly.isLoading ? (
              <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
            ) : monthly.data ? (
              <>
                <SectionLabel label={`Ledger — ${MONTHS[filters.reportMonth - 1]} ${filters.reportYear}`} accentGrad="linear-gradient(180deg,#8b5cf6,#7c3aed)" />
                <div className="grid grid-cols-4 gap-4">
                  <DesktopStatCard label="Transactions" value={monthly.data.totalTransactions} accentColor="linear-gradient(90deg,#0b2c60,#1a4a9e)" iconGrad="linear-gradient(135deg,#0b2c60,#1a4a9e)" Icon={Activity} />
                  <DesktopStatCard label="Net Profit" value={fmt(monthly.data.netProfit)} sub={monthly.data.netProfit >= 0 ? "Month profit" : "Month loss"} accentColor={monthly.data.netProfit >= 0 ? "linear-gradient(90deg,#10b981,#059669)" : "linear-gradient(90deg,#ef4444,#dc2626)"} iconGrad={monthly.data.netProfit >= 0 ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)"} Icon={monthly.data.netProfit >= 0 ? TrendingUp : TrendingDown} />
                  <DesktopStatCard label="Total Credits" value={fmt(monthly.data.totalCredits)} accentColor="linear-gradient(90deg,#10b981,#059669)" iconGrad="linear-gradient(135deg,#10b981,#059669)" Icon={ArrowDownLeft} />
                  <DesktopStatCard label="Total Debits" value={fmt(monthly.data.totalDebits)} accentColor="linear-gradient(90deg,#f97316,#ea580c)" iconGrad="linear-gradient(135deg,#f97316,#ea580c)" Icon={ArrowUpRight} />
                </div>

                {monthly.data.dailyBreakdown?.length > 0 && (
                  <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.09)" }}>
                    <div style={{ height: 3, background: "linear-gradient(90deg,#8b5cf6,#7c3aed)" }} />
                    <div className="p-5">
                      <p className="text-sm font-bold text-slate-700 mb-4">Daily Revenue Trend</p>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={monthly.data.dailyBreakdown} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={v => v.split("-")[2]} />
                          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                          <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, ""]} labelFormatter={l => `Date: ${l}`} contentStyle={{ fontSize: 11, borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="credits" fill="#10b981" name="Credits" radius={[3,3,0,0]} />
                          <Bar dataKey="debits" fill="#f97316" name="Debits" radius={[3,3,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {monthly.data.aeps && (
                  <>
                    <SectionLabel label="AePS Cash" accentGrad="linear-gradient(180deg,#f97316,#ea580c)" />
                    <div className="grid grid-cols-4 gap-4">
                      <DesktopStatCard label="AePS Tx" value={monthly.data.aeps.totalTransactions} accentColor="linear-gradient(90deg,#f97316,#ea580c)" iconGrad="linear-gradient(135deg,#f97316,#ea580c)" Icon={Fingerprint} />
                      <DesktopStatCard label="Net Flow" value={fmt(monthly.data.aeps.netFlow)} accentColor={monthly.data.aeps.netFlow >= 0 ? "linear-gradient(90deg,#10b981,#059669)" : "linear-gradient(90deg,#ef4444,#dc2626)"} iconGrad={monthly.data.aeps.netFlow >= 0 ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)"} Icon={monthly.data.aeps.netFlow >= 0 ? TrendingUp : TrendingDown} />
                      <DesktopStatCard label="Withdrawals" value={fmt(monthly.data.aeps.totalWithdrawals)} accentColor="linear-gradient(90deg,#ef4444,#dc2626)" iconGrad="linear-gradient(135deg,#ef4444,#dc2626)" Icon={ArrowUpRight} />
                      <DesktopStatCard label="Deposits" value={fmt(monthly.data.aeps.totalDeposits)} accentColor="linear-gradient(90deg,#10b981,#059669)" iconGrad="linear-gradient(135deg,#10b981,#059669)" Icon={ArrowDownLeft} />
                    </div>
                    {monthly.data.aeps.dailyBreakdown?.length > 0 && (
                      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.09)" }}>
                        <div style={{ height: 3, background: "linear-gradient(90deg,#f97316,#ea580c)" }} />
                        <div className="p-5">
                          <p className="text-sm font-bold text-slate-700 mb-4">AePS Daily Breakdown</p>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={monthly.data.aeps.dailyBreakdown} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={v => v.split("-")[2]} />
                              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                              <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, ""]} contentStyle={{ fontSize: 11, borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }} />
                              <Legend wrapperStyle={{ fontSize: 11 }} />
                              <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" radius={[3,3,0,0]} />
                              <Bar dataKey="deposits" fill="#10b981" name="Deposits" radius={[3,3,0,0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : <EmptyState label="No data for this period" />}
          </>
        )}

        {/* ─ AePS ─ */}
        {activeTab === "aeps" && (
          <>
            {aepsReport.isLoading ? (
              <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
            ) : aepsReport.data ? (
              <>
                <SectionLabel label="AePS Summary" accentGrad="linear-gradient(180deg,#f97316,#ea580c)" />
                <div className="grid grid-cols-4 gap-4">
                  <DesktopStatCard label="AePS Transactions" value={aepsReport.data.totalTransactions} sub="In date range" accentColor="linear-gradient(90deg,#f97316,#ea580c)" iconGrad="linear-gradient(135deg,#f97316,#ea580c)" Icon={Fingerprint} />
                  <DesktopStatCard label="Net Flow" value={fmt(aepsReport.data.netFlow)} sub={aepsReport.data.netFlow >= 0 ? "Net positive" : "Net negative"} accentColor={aepsReport.data.netFlow >= 0 ? "linear-gradient(90deg,#10b981,#059669)" : "linear-gradient(90deg,#ef4444,#dc2626)"} iconGrad={aepsReport.data.netFlow >= 0 ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)"} Icon={aepsReport.data.netFlow >= 0 ? TrendingUp : TrendingDown} />
                  <DesktopStatCard label="Total Withdrawals" value={fmt(aepsReport.data.totalWithdrawals)} accentColor="linear-gradient(90deg,#ef4444,#dc2626)" iconGrad="linear-gradient(135deg,#ef4444,#dc2626)" Icon={ArrowUpRight} />
                  <DesktopStatCard label="Total Deposits" value={fmt(aepsReport.data.totalDeposits)} accentColor="linear-gradient(90deg,#10b981,#059669)" iconGrad="linear-gradient(135deg,#10b981,#059669)" Icon={ArrowDownLeft} />
                </div>

                {aepsReport.data.dailyBreakdown?.length > 0 && (
                  <>
                    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.09)" }}>
                      <div style={{ height: 3, background: "linear-gradient(90deg,#f97316,#ea580c)" }} />
                      <div className="p-5">
                        <p className="text-sm font-bold text-slate-700 mb-4">Withdrawals vs Deposits</p>
                        <ResponsiveContainer width="100%" height={240}>
                          <BarChart data={aepsReport.data.dailyBreakdown} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={v => v.split("-")[2]} />
                            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                            <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, ""]} contentStyle={{ fontSize: 11, borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" radius={[3,3,0,0]} />
                            <Bar dataKey="deposits" fill="#10b981" name="Deposits" radius={[3,3,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.09)" }}>
                      <div style={{ height: 3, background: "linear-gradient(90deg,#f97316,#ea580c)" }} />
                      <div className="p-5">
                        <p className="text-sm font-bold text-slate-700 mb-4">Day-wise Detail</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-100">
                                {["Date","Opening Balance","Withdrawals","Deposits","Transactions","Net Flow"].map(h => (
                                  <th key={h} className={`py-3 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wide ${h === "Date" ? "text-left" : "text-right"}`}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {aepsReport.data.dailyBreakdown.map((row: any) => (
                                <tr key={row.date} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-3 pr-4 font-black text-xs" style={{ color: "#0b2c60", fontVariantNumeric: "tabular-nums" }}>{row.date}</td>
                                  <td className="py-3 pr-4 text-right text-slate-600 font-medium">{formatINR(row.openingBalance)}</td>
                                  <td className="py-3 pr-4 text-right font-bold text-red-600">{formatINR(row.withdrawals)}</td>
                                  <td className="py-3 pr-4 text-right font-bold text-emerald-600">{formatINR(row.deposits)}</td>
                                  <td className="py-3 pr-4 text-right">
                                    <span className="text-xs font-bold text-white px-2.5 py-1 rounded-full" style={{ background: "#f97316" }}>{row.transactions}</span>
                                  </td>
                                  <td className={`py-3 text-right font-black ${row.netFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatINR(row.netFlow)}</td>
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
          </>
        )}

        {/* ─ Services ─ */}
        {activeTab === "services" && (
          <>
            {!breakdown.data?.length ? (
              <EmptyState label="No service data yet" />
            ) : (
              <>
                <SectionLabel label="Service Analysis" accentGrad="linear-gradient(180deg,#10b981,#059669)" />
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.09)" }}>
                    <div style={{ height: 3, background: "linear-gradient(90deg,#10b981,#059669)" }} />
                    <div className="p-5">
                      <p className="text-sm font-bold text-slate-700 mb-4">Revenue by Service</p>
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie data={breakdown.data} dataKey="revenue" nameKey="serviceType" cx="50%" cy="50%" outerRadius={100} innerRadius={50}>
                            {breakdown.data?.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ fontSize: 11, borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.09)" }}>
                    <div style={{ height: 3, background: "linear-gradient(90deg,#10b981,#059669)" }} />
                    <div className="p-5">
                      <p className="text-sm font-bold text-slate-700 mb-4">Service Details</p>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Service</th>
                            <th className="text-right py-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Tx</th>
                            <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {breakdown.data?.map((s: any, i: number) => (
                            <tr key={s.serviceType} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3 pr-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                  <span className="font-semibold text-slate-700 truncate text-xs">{s.serviceType}</span>
                                </div>
                              </td>
                              <td className="py-3 pr-4 text-right">
                                <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}>{s.count}</span>
                              </td>
                              <td className="py-3 text-right font-black text-xs" style={{ color: "#0b2c60" }}>{fmt(s.revenue)}</td>
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
