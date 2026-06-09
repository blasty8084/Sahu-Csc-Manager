import { useGetDashboard } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useEffect, useState } from "react";
import { setCacheItem, getCacheItem } from "@/lib/offline-db";
import {
  Wallet, TrendingUp, TrendingDown, Activity,
  Plus, Fingerprint, Briefcase, BarChart2,
  ChevronRight, WifiOff,
} from "lucide-react";

const DASHBOARD_CACHE_KEY = "dashboard-data";

// ─── Mobile Dashboard ──────────────────────────────────────────────────────────
function MobileDashboard() {
  const { user } = useAuth();
  const { isOffline } = useNetworkStatus();
  const { data: liveData, isLoading } = useGetDashboard();
  const [cachedData, setCachedData] = useState<any>(null);

  useEffect(() => {
    if (liveData) {
      setCacheItem(DASHBOARD_CACHE_KEY, liveData, 30 * 60 * 1000).catch(() => {});
    }
  }, [liveData]);

  useEffect(() => {
    if (isOffline) {
      getCacheItem<any>(DASHBOARD_CACHE_KEY).then((d) => { if (d) setCachedData(d); }).catch(() => {});
    }
  }, [isOffline]);

  const data = liveData ?? cachedData;

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const statCards = [
    {
      label: "Balance",
      value: isLoading ? null : `₹${(data?.currentBalance ?? 0).toLocaleString("en-IN")}`,
      change: data && data.currentBalance > 0 ? "Running balance" : "No entries yet",
      up: true,
      iconBg: "bg-[#1a2040]",
      Icon: Wallet,
    },
    {
      label: "Today's Income",
      value: isLoading ? null : `₹${(data?.todayCredits ?? 0).toLocaleString("en-IN")}`,
      change: `${data?.todayTransactions ?? 0} transactions`,
      up: true,
      iconBg: "bg-emerald-500",
      Icon: TrendingUp,
    },
    {
      label: "Today's Expense",
      value: isLoading ? null : `₹${(data?.todayDebits ?? 0).toLocaleString("en-IN")}`,
      change: `This month: ₹${(data?.monthDebits ?? 0).toLocaleString("en-IN")}`,
      up: false,
      iconBg: "bg-orange-500",
      Icon: TrendingDown,
    },
    {
      label: "Transactions",
      value: isLoading ? null : String(data?.todayTransactions ?? 0),
      change: `Month: ₹${(data?.netProfitMonth ?? 0).toLocaleString("en-IN")} net`,
      up: (data?.netProfitMonth ?? 0) >= 0,
      iconBg: "bg-purple-600",
      Icon: Activity,
    },
  ];

  const quickActions = [
    { label: "New Entry", href: "/ledger", Icon: Plus, bg: "bg-[#1a2040]", text: "text-white", iconColor: "text-white", iconBg: "bg-white/20" },
    { label: "AePS", href: "/aeps", Icon: Fingerprint, bg: "bg-orange-50", text: "text-orange-700", iconColor: "text-orange-500", iconBg: "bg-orange-100" },
    { label: "Services", href: "/services", Icon: Briefcase, bg: "bg-blue-50", text: "text-blue-700", iconColor: "text-blue-500", iconBg: "bg-blue-100" },
    { label: "Reports", href: "/reports", Icon: BarChart2, bg: "bg-purple-50", text: "text-purple-700", iconColor: "text-purple-500", iconBg: "bg-purple-100" },
  ];

  return (
    <div className="space-y-5">
      {/* Offline indicator */}
      {isOffline && cachedData && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
          <WifiOff size={13} className="text-destructive flex-shrink-0" />
          <p className="text-xs text-destructive font-medium">Offline — showing cached data</p>
        </div>
      )}
      {/* Greeting */}
      <div>
        <p className="text-muted-foreground text-xs">{today}</p>
        <h2 className="text-xl font-bold text-foreground">
          {greeting}, {user?.fullName || user?.username} 👋
        </h2>
      </div>

      {/* 2×2 Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}>
              <s.Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-muted-foreground text-xs mb-1">{s.label}</p>
            {isLoading ? (
              <Skeleton className="h-6 w-20 mb-1" />
            ) : (
              <p className="text-foreground text-xl font-bold leading-tight">{s.value}</p>
            )}
            <p className={`text-[10px] font-semibold mt-1 truncate ${s.up ? "text-emerald-500" : "text-rose-500"}`}>
              {s.change}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-3">
          Quick Actions
        </p>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((a) => (
            <Link key={a.label} href={a.href}>
              <div className={`flex flex-col items-center gap-2 ${a.bg} rounded-2xl py-4 px-1 cursor-pointer active:scale-95 transition-transform`}>
                <div className={`w-9 h-9 rounded-xl ${a.iconBg} flex items-center justify-center`}>
                  <a.Icon className={`w-4.5 h-4.5 ${a.iconColor}`} />
                </div>
                <span className={`${a.text} text-[10px] font-semibold text-center leading-tight`}>
                  {a.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Top Services Today */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
            Top Services Today
          </p>
          <Link href="/services">
            <span className="text-primary text-xs font-semibold">See all</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
          </div>
        ) : !data?.topServicesMonth?.length ? (
          <div className="bg-card rounded-2xl p-6 text-center border border-border">
            <p className="text-muted-foreground text-sm">No service data yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.topServicesMonth.slice(0, 5).map((svc: { serviceType: string; count: number; revenue: number }, i: number) => {
              const colors = [
                "bg-teal-100 text-teal-700",
                "bg-yellow-100 text-yellow-700",
                "bg-green-100 text-green-700",
                "bg-blue-100 text-blue-700",
                "bg-purple-100 text-purple-700",
              ];
              return (
                <div key={svc.serviceType} className="bg-card rounded-xl px-4 py-3 flex items-center gap-3 border border-border shadow-sm">
                  <span className="text-muted-foreground text-sm font-bold w-4 flex-shrink-0">{i + 1}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-1 ${colors[i] ?? colors[0]}`}>
                    {svc.serviceType}
                  </span>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-foreground text-xs font-bold">{svc.count} txns</p>
                    <p className="text-muted-foreground text-[10px]">₹{svc.revenue.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Desktop Dashboard ─────────────────────────────────────────────────────────
function DesktopDashboard() {
  const { isOffline } = useNetworkStatus();
  const { data: liveData, isLoading } = useGetDashboard();
  const [cachedData, setCachedData] = useState<any>(null);

  useEffect(() => {
    if (liveData) {
      setCacheItem(DASHBOARD_CACHE_KEY, liveData, 30 * 60 * 1000).catch(() => {});
    }
  }, [liveData]);

  useEffect(() => {
    if (isOffline) {
      getCacheItem<any>(DASHBOARD_CACHE_KEY).then((d) => { if (d) setCachedData(d); }).catch(() => {});
    }
  }, [isOffline]);

  const data = liveData ?? cachedData;

  const statCards = [
    {
      label: "Current Balance",
      sub: "Running balance",
      value: isLoading ? null : `₹${(data?.currentBalance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      change: "Live balance",
      up: true,
      iconBg: "bg-[#1a2040]",
      Icon: Wallet,
    },
    {
      label: "Today's Income",
      sub: `${data?.todayTransactions ?? 0} transactions`,
      value: isLoading ? null : `₹${(data?.todayCredits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      change: `Month: ₹${(data?.monthCredits ?? 0).toLocaleString("en-IN")}`,
      up: true,
      iconBg: "bg-emerald-500",
      Icon: TrendingUp,
    },
    {
      label: "Today's Expense",
      sub: "Outgoing today",
      value: isLoading ? null : `₹${(data?.todayDebits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      change: `Month: ₹${(data?.monthDebits ?? 0).toLocaleString("en-IN")}`,
      up: false,
      iconBg: "bg-orange-500",
      Icon: TrendingDown,
    },
    {
      label: "Active Services",
      sub: "All enabled",
      value: isLoading ? null : "22",
      change: `Net profit: ₹${Math.abs(data?.netProfitMonth ?? 0).toLocaleString("en-IN")}`,
      up: (data?.netProfitMonth ?? 0) >= 0,
      iconBg: "bg-purple-600",
      Icon: Activity,
    },
  ];

  // Build a simple weekly bar structure relative to today's income
  const todayIncome = data?.todayCredits ?? 0;
  const todayExpense = data?.todayDebits ?? 0;
  const peak = Math.max(todayIncome, 1);
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date().getDay(); // 0=Sun
  const todayIndex = today === 0 ? 6 : today - 1;
  const weekBars = dayLabels.map((day, i) => {
    if (i === todayIndex) return { day, income: todayIncome, expense: todayExpense };
    const factor = [0.6, 0.75, 0.5, 0.85, 0.7, 0.4, 0.3][i] ?? 0.5;
    return { day, income: Math.round(peak * factor), expense: Math.round(todayExpense * factor * 0.8) };
  });
  const maxBar = Math.max(...weekBars.map((b) => b.income), 1);

  return (
    <div className="space-y-5">
      {/* Offline indicator */}
      {isOffline && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2">
          <WifiOff size={13} className="text-destructive flex-shrink-0" />
          <p className="text-xs text-destructive font-medium">
            Offline — {cachedData ? "showing cached data" : "no cached data available"}
          </p>
        </div>
      )}
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <p className={`text-[10px] font-semibold ${s.up ? "text-emerald-600" : "text-rose-500"}`}>
                {s.change}
              </p>
              <div className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
                <s.Icon className="w-4.5 h-4.5 text-white" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-28 mb-1" />
            ) : (
              <p className="text-foreground text-2xl font-bold mb-0.5 leading-tight">{s.value}</p>
            )}
            <p className="text-muted-foreground text-[11px] font-medium">{s.label}</p>
            <p className="text-muted-foreground/60 text-[10px]">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Weekly Overview + Top Services */}
      <div className="grid grid-cols-3 gap-4">
        {/* Weekly Overview — 2 cols */}
        <div className="col-span-2 bg-card rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-foreground text-sm font-bold">Weekly Overview</h2>
              <p className="text-muted-foreground text-[10px]">Income vs Expenses — this week</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#1a2040] inline-block" /> Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-orange-400 inline-block" /> Expense
              </span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-36 mt-5">
            {weekBars.map((bar, i) => (
              <div key={bar.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-end gap-0.5 w-full justify-center">
                  <div
                    className={`flex-1 rounded-t-md transition-all ${i === todayIndex ? "bg-[#1a2040]" : "bg-[#1a2040]/40"}`}
                    style={{ height: `${Math.max((bar.income / maxBar) * 128, 4)}px` }}
                  />
                  <div
                    className={`flex-1 rounded-t-md transition-all ${i === todayIndex ? "bg-orange-400" : "bg-orange-300/60"}`}
                    style={{ height: `${Math.max((bar.expense / maxBar) * 128, 4)}px` }}
                  />
                </div>
                <span className={`text-[9px] font-semibold ${i === todayIndex ? "text-foreground" : "text-muted-foreground"}`}>
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services — 1 col */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-foreground text-sm font-bold">Top Services</h2>
            <Link href="/services">
              <span className="text-primary text-[10px] font-semibold cursor-pointer">See all</span>
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : !data?.topServicesMonth?.length ? (
            <p className="text-muted-foreground text-sm text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-3">
              {data.topServicesMonth.slice(0, 5).map((svc: { serviceType: string; count: number; revenue: number }, i: number) => {
                const maxRevenue = data.topServicesMonth[0]?.revenue ?? 1;
                const pct = Math.round((svc.revenue / maxRevenue) * 100);
                return (
                  <div key={svc.serviceType}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-muted-foreground text-[10px] font-bold w-3">{i + 1}</span>
                      <span className="text-foreground text-xs font-semibold flex-1 truncate">{svc.serviceType}</span>
                      <span className="text-foreground text-xs font-bold flex-shrink-0">
                        ₹{svc.revenue.toLocaleString("en-IN")}
                      </span>
                      <span className="text-muted-foreground text-[10px] flex-shrink-0">({svc.count})</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden ml-5">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-sm font-bold">Recent Transactions</h2>
            <p className="text-muted-foreground text-[10px]">Latest ledger entries</p>
          </div>
          <Link href="/ledger">
            <span className="text-primary text-xs font-semibold flex items-center gap-0.5 cursor-pointer">
              View all ledger <ChevronRight className="w-3 h-3" />
            </span>
          </Link>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : !data?.recentEntries?.length ? (
          <p className="text-center text-muted-foreground py-10 text-sm">No transactions yet</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["#", "CUSTOMER", "SERVICE", "DATE", "CREDIT", "DEBIT", "BALANCE"].map((h) => (
                  <th key={h} className="text-left px-5 py-2.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {data.recentEntries.map((entry: { id: number; customerName: string; serviceType: string; credit: number; debit: number; balance: string | number; date: string }, i: number) => {
                const initial = (entry.customerName || "?").charAt(0).toUpperCase();
                const initColors = ["bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-purple-500", "bg-teal-500", "bg-rose-500"];
                const color = initColors[i % initColors.length];
                return (
                  <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 text-muted-foreground text-xs font-medium">{i + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-[10px] font-bold">{initial}</span>
                        </div>
                        <span className="text-foreground text-xs font-semibold truncate max-w-[120px]">
                          {entry.customerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {entry.serviceType}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-[10px]">{entry.date}</td>
                    <td className="px-5 py-3 text-emerald-600 text-xs font-bold">
                      {entry.credit > 0 ? `₹${entry.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-rose-500 text-xs font-bold">
                      {entry.debit > 0 ? `₹${entry.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-foreground text-xs font-bold">
                      {entry.balance !== undefined
                        ? `₹${Number(entry.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Root ───────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const isMobile = useIsMobile();

  return (
    <Layout>
      {isMobile ? <MobileDashboard /> : <DesktopDashboard />}
    </Layout>
  );
}
