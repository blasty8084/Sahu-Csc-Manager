import { fmt } from "./useReports";

interface KpiChip {
  label: string;
  value: string | number;
  trend: string | undefined;
  pos: boolean | undefined;
}

/**
 * Derives the navy KPI strip chips for the currently active reports tab.
 * Returns an empty array when the selected tab has no data yet.
 */
export function useReportKpis(
  activeTab: string,
  daily: { data: any },
  monthly: { data: any },
  aepsReport: { data: any },
  breakdown: { data: any[] | undefined },
): KpiChip[] {
  if (activeTab === "daily" && daily.data) {
    const avg = daily.data.transactionCount > 0 ? daily.data.netRevenue / daily.data.transactionCount : 0;
    return [
      { label: "Total Credits", value: fmt(daily.data.totalCredits),    trend: undefined,                                                                    pos: undefined },
      { label: "Total Debits",  value: fmt(daily.data.totalDebits),     trend: undefined,                                                                    pos: undefined },
      { label: "Net Revenue",   value: fmt(daily.data.netRevenue),      trend: daily.data.netRevenue >= 0 ? "Profitable day" : "Loss day", pos: daily.data.netRevenue >= 0 },
      { label: "Transactions",  value: daily.data.transactionCount,     trend: undefined,                                                                    pos: undefined },
      { label: "Avg Ticket",    value: fmt(avg),                        trend: undefined,                                                                    pos: undefined },
    ];
  }
  if (activeTab === "monthly" && monthly.data) {
    const avg = monthly.data.totalTransactions > 0 ? monthly.data.netProfit / monthly.data.totalTransactions : 0;
    return [
      { label: "Total Credits", value: fmt(monthly.data.totalCredits),   trend: undefined,                                                                        pos: undefined },
      { label: "Total Debits",  value: fmt(monthly.data.totalDebits),    trend: undefined,                                                                        pos: undefined },
      { label: "Net Profit",    value: fmt(monthly.data.netProfit),      trend: monthly.data.netProfit >= 0 ? "Month profit" : "Month loss", pos: monthly.data.netProfit >= 0 },
      { label: "Transactions",  value: monthly.data.totalTransactions,   trend: undefined,                                                                        pos: undefined },
      { label: "Avg Ticket",    value: fmt(avg),                         trend: undefined,                                                                        pos: undefined },
    ];
  }
  if (activeTab === "aeps" && aepsReport.data) {
    return [
      { label: "AePS Tx",     value: aepsReport.data.totalTransactions,    trend: undefined,                                                                                   pos: undefined },
      { label: "Withdrawals", value: fmt(aepsReport.data.totalWithdrawals), trend: undefined,                                                                                   pos: undefined },
      { label: "Deposits",    value: fmt(aepsReport.data.totalDeposits),    trend: undefined,                                                                                   pos: undefined },
      { label: "Net Flow",    value: fmt(aepsReport.data.netFlow),           trend: aepsReport.data.netFlow >= 0 ? "Net positive" : "Net negative", pos: aepsReport.data.netFlow >= 0 },
    ];
  }
  if (activeTab === "services" && breakdown.data?.length) {
    const totalTx  = breakdown.data.reduce((s: number, r: any) => s + r.count, 0);
    const totalRev = breakdown.data.reduce((s: number, r: any) => s + parseFloat(r.revenue || 0), 0);
    return [
      { label: "Services",      value: breakdown.data.length, trend: undefined, pos: undefined },
      { label: "Total Tx",      value: totalTx,               trend: undefined, pos: undefined },
      { label: "Total Revenue", value: fmt(totalRev),         trend: undefined, pos: undefined },
    ];
  }
  return [];
}
