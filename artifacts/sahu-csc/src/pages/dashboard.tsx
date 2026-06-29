import { useGetDashboard, useGetUdhariSummary } from "@workspace/api-client-react";
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
  ChevronRight, WifiOff, HandCoins,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const LOGO_URL = "/sahu-logo.png";

const DASHBOARD_CACHE_KEY = "dashboard-data";

// ─── Udhari Summary Card ───────────────────────────────────────────────────────
function UdhariSummaryCard({ mobile = false }: { mobile?: boolean }) {
  const { t } = useTranslation();
  const { data, isLoading } = useGetUdhariSummary();
  const toCollect = data?.toCollect ?? 0;
  const toPay = data?.toPay ?? 0;
  if (!isLoading && toCollect === 0 && toPay === 0 && (data?.totalCustomers ?? 0) === 0) return null;
  return (
    <a href="/udhari" style={{ textDecoration: "none" }}>
      <div
        className={`rounded-2xl overflow-hidden ${mobile ? "" : "border border-border shadow-sm"}`}
        style={mobile ? { boxShadow: "0 2px 12px rgba(11,44,96,0.08)" } : {}}
      >
        <div style={{ height: 3, background: "linear-gradient(90deg,#0b2c60,#f97316)" }} />
        <div className="bg-white px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)" }}>
            <HandCoins size={15} color="#fff" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-muted-foreground">{t('nav.udhari')}</p>
            <p className="text-[10px] text-muted-foreground/60">{t('dashboard.customer_credit_ledger')}</p>
          </div>
          {isLoading ? (
            <div className="flex gap-3">
              <div className="w-16 h-8 rounded bg-muted animate-pulse" />
              <div className="w-16 h-8 rounded bg-muted animate-pulse" />
            </div>
          ) : (
            <div className="flex gap-3 text-right">
              <div>
                <p className="text-[9px] font-semibold text-muted-foreground uppercase">{t('dashboard.to_collect')}</p>
                <p className="text-sm font-black" style={{ color: "#ea580c" }}>
                  ₹{toCollect.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-muted-foreground uppercase">{t('dashboard.to_pay')}</p>
                <p className="text-sm font-black" style={{ color: "#059669" }}>
                  ₹{toPay.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          )}
          <ChevronRight size={13} className="text-muted-foreground flex-shrink-0 ml-1" />
        </div>
      </div>
    </a>
  );
}

// ─── Mobile Dashboard ──────────────────────────────────────────────────────────
function MobileDashboard() {
  const { t } = useTranslation();
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

  const statCards = [
    {
      label: t('dashboard.current_balance'),
      value: isLoading ? null : `₹${(data?.currentBalance ?? 0).toLocaleString("en-IN")}`,
      change: data && data.currentBalance > 0 ? t('dashboard.running_balance') : t('dashboard.no_entries'),
      up: true,
      accent: "linear-gradient(90deg, #0b2c60, #1a4a9e)",
      iconGradient: "linear-gradient(135deg, #0b2c60 0%, #1a4a9e 100%)",
      Icon: Wallet,
    },
    {
      label: t('dashboard.todays_income'),
      value: isLoading ? null : `₹${(data?.todayCredits ?? 0).toLocaleString("en-IN")}`,
      change: `${data?.todayTransactions ?? 0} ${t('dashboard.transactions')}`,
      up: true,
      accent: "linear-gradient(90deg, #10b981, #34d399)",
      iconGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      Icon: TrendingUp,
    },
    {
      label: t('dashboard.todays_expense'),
      value: isLoading ? null : `₹${(data?.todayDebits ?? 0).toLocaleString("en-IN")}`,
      change: `Month: ₹${(data?.monthDebits ?? 0).toLocaleString("en-IN")}`,
      up: false,
      accent: "linear-gradient(90deg, #f97316, #fb923c)",
      iconGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      Icon: TrendingDown,
    },
    {
      label: t('dashboard.transactions'),
      value: isLoading ? null : String(data?.todayTransactions ?? 0),
      change: `${t('common.total')}: ₹${(data?.netProfitMonth ?? 0).toLocaleString("en-IN")} ${t('dashboard.net')}`,
      up: (data?.netProfitMonth ?? 0) >= 0,
      accent: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
      iconGradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      Icon: Activity,
    },
  ];

  const quickActions = [
    {
      label: t('dashboard.new_entry'), href: "/ledger", Icon: Plus,
      iconGradient: "linear-gradient(135deg, #0b2c60 0%, #1a4a9e 100%)",
      iconShadow: "rgba(11,44,96,0.35)",
    },
    {
      label: "AePS", href: "/aeps", Icon: Fingerprint,
      iconGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      iconShadow: "rgba(249,115,22,0.35)",
    },
    {
      label: t('nav.services'), href: "/services", Icon: Briefcase,
      iconGradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      iconShadow: "rgba(59,130,246,0.35)",
    },
    {
      label: t('nav.reports'), href: "/reports", Icon: BarChart2,
      iconGradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      iconShadow: "rgba(139,92,246,0.35)",
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── Logo Hero Banner ─────────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, background: "#0b2c60" }}>
        {/* Hex mesh texture */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.1, pointerEvents: "none" }} preserveAspectRatio="none">
          <defs>
            <pattern id="db-hex" x="0" y="0" width="28" height="24" patternUnits="userSpaceOnUse">
              <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="white" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#db-hex)" />
        </svg>
        {/* Aurora blob */}
        <div style={{ position: "absolute", top: -20, right: -10, width: 100, height: 100, background: "radial-gradient(circle,rgba(249,115,22,0.45),transparent 70%)", filter: "blur(18px)", pointerEvents: "none" }} />
        {/* Orange bottom strip */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#f97316,#ea580c)" }} />

        <div style={{ position: "relative", zIndex: 2, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          {/* Logo */}
          <div style={{ width: 52, height: 52, borderRadius: 16, overflow: "hidden", flexShrink: 0, border: "2px solid rgba(255,255,255,0.25)", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
            <img src={LOGO_URL} alt="SAHU CSC" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          {/* Brand */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ color: "white", fontWeight: 900, fontSize: 18, letterSpacing: 0.5 }}>SAHU</span>
              <span style={{ color: "#f97316", fontWeight: 900, fontSize: 18 }}>CSC</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, letterSpacing: 2, fontWeight: 600, fontFamily: "monospace", textTransform: "uppercase", marginTop: 1 }}>YOUR SERVICE, OUR COMMITMENT</p>
          </div>
          {/* Date badge */}
          <div style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "4px 10px", textAlign: "center", flexShrink: 0 }}>
            <p style={{ color: "white", fontSize: 14, fontWeight: 800, lineHeight: 1 }}>{new Date().getDate()}</p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, fontWeight: 600, letterSpacing: 0.5 }}>
              {new Date().toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}
            </p>
          </div>
        </div>
      </div>

      {/* Offline indicator */}
      {isOffline && cachedData && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
          <WifiOff size={13} className="text-destructive flex-shrink-0" />
          <p className="text-xs text-destructive font-medium">{t('dashboard.offline_cached')}</p>
        </div>
      )}

      {/* 2×2 Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08), 0 1px 3px rgba(0,0,0,0.04)" }}
          >
            {/* Accent stripe */}
            <div style={{ height: 3, background: s.accent }} />
            <div className="p-3.5">
              <div className="flex items-start justify-between mb-2.5">
                <p style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {s.label}
                </p>
                <div
                  style={{
                    width: 30, height: 30, borderRadius: 9,
                    background: s.iconGradient,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 3px 8px ${s.accent.includes("0b2c60") ? "rgba(11,44,96,0.30)" : s.accent.includes("10b981") ? "rgba(16,185,129,0.30)" : s.accent.includes("f97316") ? "rgba(249,115,22,0.30)" : "rgba(139,92,246,0.30)"}`,
                    flexShrink: 0,
                  }}
                >
                  <s.Icon size={14} color="#fff" />
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-20 mb-1" />
              ) : (
                <p style={{ fontSize: 19, fontWeight: 900, color: "#0b2c60", lineHeight: 1.1 }}>{s.value}</p>
              )}
              <p style={{ fontSize: 10, fontWeight: 600, marginTop: 5, color: s.up ? "#10b981" : "#f43f5e" }} className="truncate">
                {s.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Udhari Khata Summary */}
      <UdhariSummaryCard mobile />

      {/* Quick Actions */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
          {t('dashboard.quick_actions')}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((a) => (
            <Link key={a.label} href={a.href}>
              <div
                className="flex flex-col items-center gap-2.5 py-4 px-1 rounded-2xl cursor-pointer active:scale-95 transition-transform bg-white"
                style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.07), 0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div
                  style={{
                    width: 42, height: 42, borderRadius: 13,
                    background: a.iconGradient,
                    boxShadow: `0 4px 12px ${a.iconShadow}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <a.Icon size={18} color="#fff" />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#0b2c60", textAlign: "center", lineHeight: 1.2 }}>
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
            {t('dashboard.top_services_today')}
          </p>
          <Link href="/services">
            <span className="text-primary text-xs font-semibold">{t('dashboard.see_all')}</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
          </div>
        ) : !data?.topServicesMonth?.length ? (
          <div className="bg-card rounded-2xl p-6 text-center border border-border">
            <p className="text-muted-foreground text-sm">{t('dashboard.no_service_data')}</p>
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
                    <p className="text-foreground text-xs font-bold">{svc.count} {t('dashboard.txns')}</p>
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
  const { t } = useTranslation();
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

  const statCards = [
    {
      label: t('dashboard.current_balance'),
      sub: t('dashboard.running_balance'),
      value: isLoading ? null : `₹${(data?.currentBalance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      change: t('dashboard.live_balance'),
      up: true,
      iconBg: "bg-[#1a2040]",
      Icon: Wallet,
    },
    {
      label: t('dashboard.todays_income'),
      sub: `${data?.todayTransactions ?? 0} ${t('dashboard.transactions')}`,
      value: isLoading ? null : `₹${(data?.todayCredits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      change: `Month: ₹${(data?.monthCredits ?? 0).toLocaleString("en-IN")}`,
      up: true,
      iconBg: "bg-emerald-500",
      Icon: TrendingUp,
    },
    {
      label: t('dashboard.todays_expense'),
      sub: t('dashboard.outgoing_today'),
      value: isLoading ? null : `₹${(data?.todayDebits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      change: `Month: ₹${(data?.monthDebits ?? 0).toLocaleString("en-IN")}`,
      up: false,
      iconBg: "bg-orange-500",
      Icon: TrendingDown,
    },
    {
      label: t('dashboard.active_services'),
      sub: t('dashboard.all_enabled'),
      value: isLoading ? null : "22",
      change: `${t('dashboard.net_profit')}: ₹${Math.abs(data?.netProfitMonth ?? 0).toLocaleString("en-IN")}`,
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
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;
  const weekBars = dayLabels.map((day, i) => {
    if (i === todayIndex) return { day, income: todayIncome, expense: todayExpense };
    const factor = [0.6, 0.75, 0.5, 0.85, 0.7, 0.4, 0.3][i] ?? 0.5;
    return { day, income: Math.round(peak * factor), expense: Math.round(todayExpense * factor * 0.8) };
  });
  const maxBar = Math.max(...weekBars.map((b) => b.income), 1);

  const firstName = user?.fullName?.split(" ")[0] ?? user?.username ?? "";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greetingEmoji = hour < 12 ? "☀️" : hour < 17 ? "👋" : "🌙";
  const todayLabel = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-5">

      {/* ── Logo Hero Banner ─────────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, background: "linear-gradient(135deg,#0b2c60 0%,#0f3872 100%)" }}>
        {/* Hex mesh texture */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08, pointerEvents: "none" }} preserveAspectRatio="none">
          <defs>
            <pattern id="db-hex-d" x="0" y="0" width="28" height="24" patternUnits="userSpaceOnUse">
              <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="white" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#db-hex-d)" />
        </svg>
        {/* Aurora blobs */}
        <div style={{ position: "absolute", top: -30, right: 60, width: 160, height: 160, background: "radial-gradient(circle,rgba(249,115,22,0.35),transparent 70%)", filter: "blur(28px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -20, left: 100, width: 120, height: 120, background: "radial-gradient(circle,rgba(99,102,241,0.3),transparent 70%)", filter: "blur(20px)", pointerEvents: "none" }} />
        {/* Orange bottom strip */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#f97316,#ea580c)" }} />

        <div style={{ position: "relative", zIndex: 2, padding: "18px 24px", display: "flex", alignItems: "center", gap: 18 }}>
          {/* Logo */}
          <div style={{ width: 64, height: 64, borderRadius: 18, overflow: "hidden", flexShrink: 0, border: "2px solid rgba(255,255,255,0.2)", boxShadow: "0 6px 24px rgba(0,0,0,0.35)" }}>
            <img src={LOGO_URL} alt="SAHU CSC" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          {/* Brand + greeting */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
              <span style={{ color: "white", fontWeight: 900, fontSize: 22, letterSpacing: 0.5 }}>SAHU</span>
              <span style={{ color: "#f97316", fontWeight: 900, fontSize: 22 }}>CSC</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 500, fontSize: 13, marginLeft: 4 }}>Common Service Center</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500 }}>
              {greetingEmoji} {greeting}{firstName ? `, ${firstName}` : ""}! — {todayLabel}
            </p>
          </div>
          {/* Date badge */}
          <div style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "8px 18px", textAlign: "center", flexShrink: 0 }}>
            <p style={{ color: "white", fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{new Date().getDate()}</p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, letterSpacing: 0.5, marginTop: 2 }}>
              {new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Offline indicator */}
      {isOffline && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2">
          <WifiOff size={13} className="text-destructive flex-shrink-0" />
          <p className="text-xs text-destructive font-medium">
            {cachedData ? t('dashboard.offline_cached') : t('dashboard.offline_no_cache')}
          </p>
        </div>
      )}
      {/* Udhari Khata Summary */}
      <UdhariSummaryCard />

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
              <h2 className="text-foreground text-sm font-bold">{t('dashboard.weekly_overview')}</h2>
              <p className="text-muted-foreground text-[10px]">{t('reports.income_vs_expenses')} — this week</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#1a2040] inline-block" /> {t('common.income')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-orange-400 inline-block" /> {t('common.expense')}
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
            <h2 className="text-foreground text-sm font-bold">{t('dashboard.top_services')}</h2>
            <Link href="/services">
              <span className="text-primary text-[10px] font-semibold cursor-pointer">{t('dashboard.see_all')}</span>
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : !data?.topServicesMonth?.length ? (
            <p className="text-muted-foreground text-sm text-center py-6">{t('dashboard.no_data')}</p>
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
            <h2 className="text-foreground text-sm font-bold">{t('dashboard.recent_transactions')}</h2>
            <p className="text-muted-foreground text-[10px]">Latest ledger entries</p>
          </div>
          <Link href="/ledger">
            <span className="text-primary text-xs font-semibold flex items-center gap-0.5 cursor-pointer">
              {t('dashboard.view_all_ledger')} <ChevronRight className="w-3 h-3" />
            </span>
          </Link>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : !data?.recentEntries?.length ? (
          <p className="text-center text-muted-foreground py-10 text-sm">{t('dashboard.no_transactions')}</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  t('ledger.col_id'), t('ledger.col_customer'), t('ledger.col_service'),
                  t('ledger.col_date'), t('ledger.col_amount'), t('ledger.col_amount'), t('common.balance'),
                ].map((h, idx) => (
                  <th key={idx} className="text-left px-5 py-2.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
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
