// MonthlyBreakdownTable.tsx — AePS and Services tab content panels
import { ReportsSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/reports/ReportsSummaryCards";
import {
  AepsBarChart,
  OpeningBalanceAreaChart,
  ServicesRevenuePieChart,
} from "@/components/reports/ReportsChart";
import {
  AepsDayWiseTable,
  ServicesDetailTable,
} from "@/components/reports/ReportsTable";
import type { FilterState } from "@/hooks/useReports";

// ── AePS tab ──────────────────────────────────────────────────────────────────
export function AepsTabPanel({
  aepsReport,
  filters,
}: {
  aepsReport: { data: any; isLoading: boolean };
  filters: FilterState;
}) {
  return (
    <div className="space-y-5">
      {aepsReport.isLoading ? (
        <ReportsSkeleton />
      ) : aepsReport.data ? (
        <>
          {aepsReport.data.dailyBreakdown?.length > 0 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <AepsBarChart data={aepsReport.data.dailyBreakdown} />
                <OpeningBalanceAreaChart data={aepsReport.data.dailyBreakdown} />
              </div>
              <AepsDayWiseTable
                data={aepsReport.data.dailyBreakdown}
                aepsStart={filters.aepsStart}
                aepsEnd={filters.aepsEnd}
              />
            </>
          )}
        </>
      ) : <EmptyState label="No AePS data found" />}
    </div>
  );
}

// ── Services tab ──────────────────────────────────────────────────────────────
export function ServicesTabPanel({
  breakdown,
}: {
  breakdown: { data: any };
}) {
  return (
    <div className="space-y-5">
      {!breakdown.data?.length ? (
        <EmptyState label="No service data yet" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <ServicesRevenuePieChart data={breakdown.data} />
          <ServicesDetailTable data={breakdown.data} />
        </div>
      )}
    </div>
  );
}
