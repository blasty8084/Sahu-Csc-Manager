import { useState } from "react";
import { BASE, useFilterState, useReportsData } from "@/hooks/useReports";
import { DesktopReportNav } from "./ReportDatePicker";
import { DesktopKpiStrip } from "./ReportSummaryCards";
import { DailyTabPanel, MonthlyTabPanel } from "./IncomeExpenseChart";
import { AepsTabPanel, ServicesTabPanel } from "./MonthlyBreakdownTable";
import { useDesktopPrint } from "./useDesktopPrint";

export default function DesktopReports() {
  const [activeTab, setActiveTab] = useState("daily");
  const filters = useFilterState();
  const { daily, monthly, breakdown, aepsReport } = useReportsData(
    filters.dailyDate, filters.reportYear, filters.reportMonth, filters.aepsStart, filters.aepsEnd,
  );

  const exportUrl = activeTab === "aeps"
    ? `${BASE}/api/reports/export?startDate=${filters.aepsStart}&endDate=${filters.aepsEnd}`
    : `${BASE}/api/reports/export?startDate=${filters.monthStart}&endDate=${filters.monthEnd}`;

  const { printReport } = useDesktopPrint({ activeTab, filters, daily, monthly, aepsReport, breakdown });

  return (
    <div style={{ display: "flex", flexDirection: "column", margin: "-24px -24px -24px", height: "calc(100vh - 64px)", overflow: "hidden" }}>

      <DesktopReportNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filters={filters}
        exportUrl={exportUrl}
        onPrint={printReport}
      />

      <DesktopKpiStrip
        activeTab={activeTab}
        daily={daily}
        monthly={monthly}
        aepsReport={aepsReport}
        breakdown={breakdown}
      />

      <div style={{ flex: 1, overflow: "auto", background: "#f1f5f9", padding: "20px 28px 28px" }}>
        {activeTab === "daily"    && <DailyTabPanel    daily={daily}           filters={filters} />}
        {activeTab === "monthly"  && <MonthlyTabPanel  monthly={monthly}       filters={filters} />}
        {activeTab === "aeps"     && <AepsTabPanel     aepsReport={aepsReport} filters={filters} />}
        {activeTab === "services" && <ServicesTabPanel breakdown={breakdown} />}
      </div>

    </div>
  );
}
