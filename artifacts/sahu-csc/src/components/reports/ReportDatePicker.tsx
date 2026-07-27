// ReportDatePicker.tsx — desktop top navigation bar
// Brand logo · report tab strip · filter controls · print/export buttons
import { Calendar, BarChart2, Fingerprint, Layers } from "lucide-react";
import { DesktopReportFilters } from "@/components/reports/ReportsFilters";
import type { FilterState } from "@/hooks/useReports";

export const DESKTOP_TABS = [
  { id: "daily",    label: "Daily Report",    Icon: Calendar,    accent: "var(--brand-navy-800)", light: "var(--brand-navy-tint-md)",    grad: "linear-gradient(135deg,var(--brand-navy-800),var(--brand-navy-600))" },
  { id: "monthly",  label: "Monthly Report",  Icon: BarChart2,   accent: "var(--color-violet-sm)", light: "rgba(139,92,246,0.08)", grad: "linear-gradient(135deg,var(--color-violet-sm),var(--color-violet))" },
  { id: "aeps",     label: "AePS Report",     Icon: Fingerprint, accent: "var(--brand-orange)", light: "var(--brand-orange-tint-xs)", grad: "linear-gradient(135deg,var(--brand-orange),var(--brand-orange-600))" },
  { id: "services", label: "Service Analysis",Icon: Layers,      accent: "var(--color-success-light)", light: "var(--color-success-bg)", grad: "linear-gradient(135deg,var(--color-success-light),var(--color-success))" },
];

interface DesktopReportNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  filters: FilterState;
  exportUrl: string;
  onPrint: () => void;
}

export function DesktopReportNav({
  activeTab,
  onTabChange,
  filters,
  exportUrl,
  onPrint,
}: DesktopReportNavProps) {
  return (
    <div style={{ background: "white", borderBottom: "1px solid var(--color-slate-200)", display: "flex", alignItems: "stretch", flexShrink: 0 }}>

      {/* Brand */}
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", gap: 10, borderRight: "1px solid var(--color-slate-200)", minWidth: 210 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,var(--brand-navy-800),var(--brand-navy-700))", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BarChart2 size={15} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--brand-navy-800)" }}>SAHU CSC</div>
          <div style={{ fontSize: 9, color: "var(--color-slate-400)", letterSpacing: "0.06em" }}>Reports Center</div>
        </div>
      </div>

      {/* Tab strip */}
      <div style={{ display: "flex", flex: 1 }}>
        {DESKTOP_TABS.map(t => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 7, padding: "0 20px",
                background: "none", border: "none", cursor: "pointer",
                color: active ? "var(--brand-navy-800)" : "var(--color-slate-400)",
                fontSize: 13, fontWeight: active ? 700 : 400,
                borderTop: "none", borderLeft: "none", borderRight: "none",
                outline: "none",
                borderBottomStyle: "solid",
                borderBottomWidth: 3,
                borderBottomColor: active ? "var(--brand-navy-800)" : "transparent",
              }}
            >
              <t.Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Filter controls + export */}
      <DesktopReportFilters
        activeTab={activeTab}
        filters={filters}
        onPrint={onPrint}
        exportUrl={exportUrl}
      />
    </div>
  );
}
