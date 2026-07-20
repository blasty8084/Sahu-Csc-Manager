// IncomeExpenseChart.tsx — Daily and Monthly tab content panels
import { ReportsSkeleton } from "@/components/skeletons";
import { fmt, MONTHS } from "@/hooks/useReports";
import { EmptyState } from "@/components/reports/ReportsSummaryCards";
import {
  DailyCashflowChart,
  ServiceMixPieChart,
  MonthlyRevenueChart,
  AepsFloatAreaChart,
} from "@/components/reports/ReportsChart";
import {
  ServicesUsedTable,
  MonthlySummaryCard,
  AepsNavySummary,
} from "@/components/reports/ReportsTable";
import type { FilterState } from "@/hooks/useReports";

// ── Daily tab ─────────────────────────────────────────────────────────────────
export function DailyTabPanel({
  daily,
  filters,
}: {
  daily: { data: any; isLoading: boolean };
  filters: FilterState;
}) {
  return (
    <div className="space-y-5">
      {daily.isLoading ? (
        <ReportsSkeleton />
      ) : daily.data ? (
        <>
          {(daily.data.totalCredits > 0 || daily.data.totalDebits > 0) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <DailyCashflowChart
                totalCredits={daily.data.totalCredits}
                totalDebits={daily.data.totalDebits}
                dailyDate={filters.dailyDate}
              />
              {daily.data.topServices?.length > 0 ? (
                <ServiceMixPieChart services={daily.data.topServices} />
              ) : (
                daily.data.aeps && (
                  <div style={{ background: "linear-gradient(135deg,#0b2c60,#0f3872)", borderRadius: 16, padding: "20px 22px" }}>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>AePS TODAY</p>
                    {[
                      { label: "Total Tx", value: daily.data.aeps.totalTransactions },
                      { label: "Withdrawals", value: fmt(daily.data.aeps.totalWithdrawals) },
                      { label: "Deposits", value: fmt(daily.data.aeps.totalDeposits) },
                      { label: "Net Flow", value: fmt(daily.data.aeps.netFlow) },
                    ].map((row, i, arr) => (
                      <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{row.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
          {daily.data.topServices?.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: daily.data.aeps ? "1fr 300px" : "1fr", gap: 16 }}>
              <ServicesUsedTable services={daily.data.topServices} />
              {daily.data.aeps && (
                <AepsNavySummary
                  label="AePS TODAY"
                  totalTransactions={daily.data.aeps.totalTransactions}
                  totalWithdrawals={daily.data.aeps.totalWithdrawals}
                  totalDeposits={daily.data.aeps.totalDeposits}
                  netFlow={daily.data.aeps.netFlow}
                />
              )}
            </div>
          )}
        </>
      ) : <EmptyState label="No data for selected date" />}
    </div>
  );
}

// ── Monthly tab ───────────────────────────────────────────────────────────────
export function MonthlyTabPanel({
  monthly,
  filters,
}: {
  monthly: { data: any; isLoading: boolean };
  filters: FilterState;
}) {
  return (
    <div className="space-y-5">
      {monthly.isLoading ? (
        <ReportsSkeleton />
      ) : monthly.data ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: monthly.data.aeps?.dailyBreakdown?.length ? "1fr 1fr" : "1fr", gap: 16 }}>
            {monthly.data.dailyBreakdown?.length > 0 && (
              <MonthlyRevenueChart
                data={monthly.data.dailyBreakdown}
                reportMonth={filters.reportMonth}
                reportYear={filters.reportYear}
                months={MONTHS}
              />
            )}
            {monthly.data.aeps?.dailyBreakdown?.length > 0 && (
              <AepsFloatAreaChart data={monthly.data.aeps.dailyBreakdown} />
            )}
          </div>
          {monthly.data.aeps && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
              <MonthlySummaryCard
                totalCredits={monthly.data.totalCredits}
                totalDebits={monthly.data.totalDebits}
                netProfit={monthly.data.netProfit}
                totalTransactions={monthly.data.totalTransactions}
                reportMonth={filters.reportMonth}
                reportYear={filters.reportYear}
                months={MONTHS}
              />
              <AepsNavySummary
                label="AePS THIS MONTH"
                totalTransactions={monthly.data.aeps.totalTransactions}
                totalWithdrawals={monthly.data.aeps.totalWithdrawals}
                totalDeposits={monthly.data.aeps.totalDeposits}
                netFlow={monthly.data.aeps.netFlow}
              />
            </div>
          )}
        </>
      ) : <EmptyState label="No data for this period" />}
    </div>
  );
}
