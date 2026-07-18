import { Link } from "wouter";
import { useMemo } from "react";
import { Plus, Fingerprint, Briefcase, BarChart2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function DashboardQuickActions() {
  const { t } = useTranslation();
  const quickActions = useMemo(() => [
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
  ], [t]);

  return (
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
              <div style={{ width: 42, height: 42, borderRadius: 13, background: a.iconGradient, boxShadow: `0 4px 12px ${a.iconShadow}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
  );
}
