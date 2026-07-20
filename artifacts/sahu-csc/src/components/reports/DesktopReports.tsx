import { useState } from "react";
import { Calendar, BarChart2, Fingerprint, Layers } from "lucide-react";

import { MONTHS, useFilterState, useReportsData } from "@/hooks/useReports";
import { useReportPrint } from "@/hooks/useReportPrint";
import { useReportKpis } from "@/hooks/useReportKpis";
import { DesktopReportFilters } from "@/components/reports/ReportsFilters";
import { DesktopReportsContent } from "@/components/reports/DesktopReportsContent";

const BASE = (import.meta as any).env?.BASE_URL?.replace(/\/$/, "") ?? "";

const DESKTOP_TABS = [
  { id: "daily",    label: "Daily Report",    Icon: Calendar,    accent: "#0b2c60" },
  { id: "monthly",  label: "Monthly Report",  Icon: BarChart2,   accent: "#8b5cf6" },
  { id: "aeps",     label: "AePS Report",     Icon: Fingerprint, accent: "#f97316" },
  { id: "services", label: "Service Analysis",Icon: Layers,      accent: "#10b981" },
];

export default function DesktopReports() {
  const [activeTab, setActiveTab] = useState("daily");
  const filters = useFilterState();
  const { daily, monthly, breakdown, aepsReport } = useReportsData(
    filters.dailyDate, filters.reportYear, filters.reportMonth, filters.aepsStart, filters.aepsEnd,
  );

  const exportUrl = activeTab === "aeps"
    ? `${BASE}/api/reports/export?startDate=${filters.aepsStart}&endDate=${filters.aepsEnd}`
    : `${BASE}/api/reports/export?startDate=${filters.monthStart}&endDate=${filters.monthEnd}`;

  const printReport = useReportPrint(activeTab, filters, { daily, monthly, breakdown, aepsReport });
  const kpiChips    = useReportKpis(activeTab, daily, monthly, aepsReport, breakdown);

  return (
    <div style={{ display: "flex", flexDirection: "column", margin: "-24px -24px -24px", height: "calc(100vh - 64px)", overflow: "hidden" }}>

      {/* ── White top nav bar ── */}
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

        {/* Tabs */}
        <div style={{ display: "flex", flex: 1 }}>
          {DESKTOP_TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "0 20px",
                  background: "none", border: "none", cursor: "pointer",
                  color: active ? "#0b2c60" : "#94a3b8",
                  fontSize: 13, fontWeight: active ? 700 : 400,
                  borderTop: "none", borderLeft: "none", borderRight: "none", outline: "none",
                  borderBottomStyle: "solid", borderBottomWidth: 3,
                  borderBottomColor: active ? "#0b2c60" : "transparent",
                }}>
                <tab.Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: filter controls + export */}
        <DesktopReportFilters activeTab={activeTab} filters={filters} onPrint={printReport} exportUrl={exportUrl} />
      </div>

      {/* ── Navy KPI strip ── */}
      {kpiChips.length > 0 && (
        <div style={{ background: "#0b2c60", padding: "14px 28px", display: "flex", flexShrink: 0 }}>
          {kpiChips.map((c, i) => (
            <div key={c.label} style={{ flex: 1, padding: "0 20px", borderRight: i < kpiChips.length - 1 ? "1px solid rgba(255,255,255,0.10)" : "none" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", marginBottom: 5, textTransform: "uppercase" }}>{c.label}</div>
              <div style={{ fontSize: 19, fontWeight: 900, color: "white", marginBottom: 3, letterSpacing: "-0.5px" }}>{c.value}</div>
              {c.trend && <div style={{ fontSize: 10, fontWeight: 700, color: c.pos ? "#34d399" : "#fca5a5" }}>{c.trend}</div>}
            </div>
          ))}
        </div>
      )}

      {/* ── Scrollable tab content ── */}
      <DesktopReportsContent
        activeTab={activeTab}
        daily={daily}
        monthly={monthly}
        aepsReport={aepsReport}
        breakdown={breakdown}
        filters={filters}
        MONTHS={MONTHS}
      />
    </div>
  );
}
