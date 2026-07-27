import { Link } from "wouter";
import { useMemo } from "react";
import { Plus, Fingerprint, Briefcase, BarChart2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function DashboardQuickActions() {
  const { t } = useTranslation();
  const quickActions = useMemo(() => [
    {
      label: t('dashboard.new_entry'), href: "/ledger", Icon: Plus,
      iconGradient: "linear-gradient(135deg, var(--brand-navy-800) 0%, var(--brand-navy-600) 100%)",
      iconShadow: "var(--brand-navy-shadow)",
    },
    {
      label: "AePS", href: "/aeps", Icon: Fingerprint,
      iconGradient: "linear-gradient(135deg, var(--brand-orange) 0%, var(--brand-orange-600) 100%)",
      iconShadow: "var(--brand-orange-tint-soft)",
    },
    {
      label: t('nav.services'), href: "/services", Icon: Briefcase,
      iconGradient: "linear-gradient(135deg, var(--color-blue) 0%, var(--color-blue-700) 100%)",
      iconShadow: "rgba(59,130,246,0.35)",
    },
    {
      label: t('nav.reports'), href: "/reports", Icon: BarChart2,
      iconGradient: "linear-gradient(135deg, var(--color-violet-sm) 0%, var(--color-violet) 100%)",
      iconShadow: "rgba(139,92,246,0.35)",
    },
  ], [t]);

  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, color: "var(--color-slate-400)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
        {t('dashboard.quick_actions')}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {quickActions.map((a) => (
          <Link key={a.label} href={a.href}>
            <div
              className="flex flex-col items-center gap-2.5 py-4 px-1 rounded-2xl cursor-pointer active:scale-95 transition-transform bg-card"
              style={{ boxShadow: "0 2px 10px var(--brand-navy-tint-md), 0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 13, background: a.iconGradient, boxShadow: `0 4px 12px ${a.iconShadow}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <a.Icon size={18} color="#fff" />
              </div>
              <span className="text-foreground" style={{ fontSize: 10, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>
                {a.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
