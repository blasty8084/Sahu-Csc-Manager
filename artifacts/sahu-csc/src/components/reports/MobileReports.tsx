import { useState } from "react";
import { ReportsSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar, Download, TrendingUp, TrendingDown, Activity,
  Fingerprint, BarChart2, Layers, Filter,
  ArrowUpRight, ArrowDownLeft,
} from "lucide-react";

import {
  BASE, PIE_COLORS, fmt,
  useFilterState, useReportsData,
} from "@/hooks/useReports";

import { MobileStatCard, EmptyState } from "@/components/reports/ReportsSummaryCards";
import { MobileReportFilters } from "@/components/reports/ReportsFilters";
import {
  MobileDailyRevenueChart,
  MobileAepsDailyChart,
  MobileServicesPieChart,
} from "@/components/reports/ReportsChart";

const MOBILE_TABS = [
  { id: "daily",    label: "Daily",    Icon: Calendar,    accent: "#0b2c60", grad: "linear-gradient(135deg,#0b2c60,#1a4a9e)" },
  { id: "monthly",  label: "Monthly",  Icon: BarChart2,   accent: "#8b5cf6", grad: "linear-gradient(135deg,#8b5cf6,#7c3aed)" },
  { id: "aeps",     label: "AePS",     Icon: Fingerprint, accent: "#f97316", grad: "linear-gradient(135deg,#f97316,#ea580c)" },
  { id: "services", label: "Services", Icon: Layers,      accent: "#10b981", grad: "linear-gradient(135deg,#10b981,#059669)" },
];

export default function MobileReports() {
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
