// ReportDatePicker.tsx — desktop top navigation bar
// Brand logo · report tab strip · filter controls · print/export buttons
import { Calendar, BarChart2, Fingerprint, Layers } from "lucide-react";
import { DesktopReportFilters } from "@/components/reports/ReportsFilters";
import type { FilterState } from "@/hooks/useReports";

export const DESKTOP_TABS = [
  { id: "daily",    label: "Daily Report",    Icon: Calendar,    accent: "#0b2c60", light: "rgba(11,44,96,0.08)",    grad: "linear-gradient(135deg,#0b2c60,#1a4a9e)" },
  { id: "monthly",  label: "Monthly Report",  Icon: BarChart2,   accent: "#8b5cf6", light: "rgba(139,92,246,0.08)", grad: "linear-gradient(135deg,#8b5cf6,#7c3aed)" },
  { id: "aeps",     label: "AePS Report",     Icon: Fingerprint, accent: "#f97316", light: "rgba(249,115,22,0.08)", grad: "linear-gradient(135deg,#f97316,#ea580c)" },
  { id: "services", label: "Service Analysis",Icon: Layers,      accent: "#10b981", light: "rgba(16,185,129,0.08)", grad: "linear-gradient(135deg,#10b981,#059669)" },
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
