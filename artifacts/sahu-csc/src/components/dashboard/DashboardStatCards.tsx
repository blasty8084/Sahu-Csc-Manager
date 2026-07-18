import { useMemo } from "react";
import { Wallet, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";

// ─── Mobile 2×2 stat cards ────────────────────────────────────────────────────
export function MobileStatCards({ data, isLoading }: { data: any; isLoading: boolean }) {
  const { t } = useTranslation();
  const statCards = useMemo(() => [
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
  ], [t, isLoading, data]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {statCards.map((s) => (
        <div key={s.label} className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08), 0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ height: 3, background: s.accent }} />
          <div className="p-3.5">
            <div className="flex items-start justify-between mb-2.5">
              <p style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: s.iconGradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 3px 8px ${s.accent.includes("0b2c60") ? "rgba(11,44,96,0.30)" : s.accent.includes("10b981") ? "rgba(16,185,129,0.30)" : s.accent.includes("f97316") ? "rgba(249,115,22,0.30)" : "rgba(139,92,246,0.30)"}`, flexShrink: 0 }}>
                <s.Icon size={14} color="#fff" />
              </div>
            </div>
            {isLoading
              ? <div className="h-6 w-20 mb-1 rounded bg-slate-100 animate-pulse" />
              : <p style={{ fontSize: 19, fontWeight: 900, color: "#0b2c60", lineHeight: 1.1 }}>{s.value}</p>
            }
            <p style={{ fontSize: 10, fontWeight: 600, marginTop: 5, color: s.up ? "#10b981" : "#f43f5e" }} className="truncate">
              {s.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Desktop 4-col stat cards ─────────────────────────────────────────────────
export function DesktopStatCards({ data, isLoading }: { data: any; isLoading: boolean }) {
  const { t } = useTranslation();
  const statCards = useMemo(() => [
    {
      label: t('dashboard.current_balance'),
      sub: t('dashboard.running_balance'),
      value: isLoading ? null : `₹${(data?.currentBalance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      change: t('dashboard.live_balance'),
      up: true, iconBg: "bg-[#1a2040]", Icon: Wallet,
    },
    {
      label: t('dashboard.todays_income'),
      sub: `${data?.todayTransactions ?? 0} ${t('dashboard.transactions')}`,
      value: isLoading ? null : `₹${(data?.todayCredits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      change: `Month: ₹${(data?.monthCredits ?? 0).toLocaleString("en-IN")}`,
      up: true, iconBg: "bg-emerald-500", Icon: TrendingUp,
    },
    {
      label: t('dashboard.todays_expense'),
      sub: t('dashboard.outgoing_today'),
      value: isLoading ? null : `₹${(data?.todayDebits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      change: `Month: ₹${(data?.monthDebits ?? 0).toLocaleString("en-IN")}`,
      up: false, iconBg: "bg-orange-500", Icon: TrendingDown,
    },
    {
      label: t('dashboard.active_services'),
      sub: t('dashboard.all_enabled'),
      value: isLoading ? null : "22",
      change: `${t('dashboard.net_profit')}: ₹${Math.abs(data?.netProfitMonth ?? 0).toLocaleString("en-IN")}`,
      up: (data?.netProfitMonth ?? 0) >= 0, iconBg: "bg-purple-600", Icon: Activity,
    },
  ], [t, isLoading, data]);

  return (
    <div className="grid grid-cols-4 gap-4">
      {statCards.map((s) => (
        <div key={s.label} className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className={`text-[10px] font-semibold ${s.up ? "text-emerald-600" : "text-rose-500"}`}>{s.change}</p>
            <div className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
              <s.Icon className="w-4.5 h-4.5 text-white" />
            </div>
          </div>
          {isLoading
            ? <div className="h-8 w-28 mb-1 rounded-lg bg-slate-100 animate-pulse" />
            : <p className="text-foreground text-2xl font-bold mb-0.5 leading-tight">{s.value}</p>
          }
          <p className="text-muted-foreground text-[11px] font-medium">{s.label}</p>
          <p className="text-muted-foreground/60 text-[10px]">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}
