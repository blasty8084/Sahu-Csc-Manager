/**
 * ReportsTable.tsx
 * Data table sections for the Reports page.
 */
import { PIE_COLORS, fmt, formatINR } from "@/hooks/useReports";

// ── Desktop: Services Used Today table ────────────────────────────────────────
export function ServicesUsedTable({ services }: { services: any[] }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Services Used Today</p>
        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Transaction breakdown by service</p>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#f8fafc" }}>
          <tr>
            {["Rank", "Service", "Transactions", "Revenue"].map(h => (
              <th key={h} style={{ padding: "9px 16px", fontSize: 10, color: "#94a3b8", letterSpacing: "0.07em", fontWeight: 600, textTransform: "uppercase", textAlign: h === "Rank" || h === "Service" ? "left" : "right" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {services.map((s: any, i: number) => (
            <tr key={s.serviceType} style={{ borderTop: "1px solid #f8fafc" }}>
              <td style={{ padding: "11px 16px" }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: PIE_COLORS[i % PIE_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "white" }}>{i + 1}</div>
              </td>
              <td style={{ padding: "11px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{s.serviceType}</span>
                </div>
              </td>
              <td style={{ padding: "11px 16px", textAlign: "right" }}>
                <span style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{s.count}</span>
              </td>
              <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#10b981" }}>{fmt(s.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Desktop: Monthly summary key-value list ───────────────────────────────────
interface MonthlySummaryCardProps {
  totalCredits: number;
  totalDebits: number;
  netProfit: number;
  totalTransactions: number;
  reportMonth: number;
  reportYear: number;
  months: string[];
}
export function MonthlySummaryCard({
  totalCredits, totalDebits, netProfit, totalTransactions, reportMonth, reportYear, months,
}: MonthlySummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Monthly Summary</p>
        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{months[reportMonth - 1]} {reportYear}</p>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {[
          { label: "Total Credits",  value: fmt(totalCredits),  color: "#3b82f6" },
          { label: "Total Debits",   value: fmt(totalDebits),   color: "#fca5a5" },
          { label: "Net Profit",     value: fmt(netProfit),     color: netProfit >= 0 ? "#10b981" : "#ef4444" },
          { label: "Transactions",   value: totalTransactions,  color: "#0b2c60" },
        ].map((row, i, arr) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid #f8fafc" : "none" }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>{row.label}</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: row.color }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Desktop: AePS navy summary panel ─────────────────────────────────────────
interface AepsNavySummaryProps {
  totalTransactions: number;
  totalWithdrawals: number;
  totalDeposits: number;
  netFlow: number;
  label: string;
}
export function AepsNavySummary({ totalTransactions, totalWithdrawals, totalDeposits, netFlow, label }: AepsNavySummaryProps) {
  return (
    <div style={{ background: "linear-gradient(135deg,#0b2c60,#0f3872)", borderRadius: 16, padding: "20px 22px" }}>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>{label}</p>
      {[
        { label: "Total Transactions", value: totalTransactions },
        { label: "Total Withdrawn",    value: fmt(totalWithdrawals) },
        { label: "Total Deposited",    value: fmt(totalDeposits) },
        { label: "Net Flow",           value: fmt(netFlow) },
      ].map((row, i, arr) => (
        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{row.label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: i === 2 ? "#34d399" : i === 1 ? "#fca5a5" : "white" }}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Desktop: AePS day-wise detail table ───────────────────────────────────────
interface AepsDayWiseTableProps {
  data: any[];
  aepsStart: string;
  aepsEnd: string;
}
export function AepsDayWiseTable({ data, aepsStart, aepsEnd }: AepsDayWiseTableProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Day-wise Detail</p>
        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{aepsStart} → {aepsEnd}</p>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              {["Date", "Opening Balance", "Withdrawals", "Deposits", "Transactions", "Net Flow"].map(h => (
                <th key={h} style={{ padding: "9px 16px", fontSize: 10, color: "#94a3b8", letterSpacing: "0.07em", fontWeight: 600, textTransform: "uppercase", textAlign: h === "Date" ? "left" : "right" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any) => (
              <tr key={row.date} style={{ borderTop: "1px solid #f8fafc" }}>
                <td style={{ padding: "11px 16px", fontSize: 12, fontWeight: 800, color: "#0b2c60" }}>{row.date}</td>
                <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 12, color: "#64748b" }}>{formatINR(row.openingBalance)}</td>
                <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, color: "#ef4444" }}>{formatINR(row.withdrawals)}</td>
                <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, color: "#10b981" }}>{formatINR(row.deposits)}</td>
                <td style={{ padding: "11px 16px", textAlign: "right" }}>
                  <span style={{ background: "#fff7ed", color: "#f97316", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{row.transactions}</span>
                </td>
                <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 12, fontWeight: 800, color: row.netFlow >= 0 ? "#10b981" : "#ef4444" }}>{formatINR(row.netFlow)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Desktop: Services detail table ────────────────────────────────────────────
export function ServicesDetailTable({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Service Details</p>
        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>All-time breakdown</p>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#f8fafc" }}>
          <tr>
            {["Rank", "Service", "Transactions", "Revenue"].map(h => (
              <th key={h} style={{ padding: "9px 16px", fontSize: 10, color: "#94a3b8", letterSpacing: "0.07em", fontWeight: 600, textTransform: "uppercase", textAlign: h === "Rank" || h === "Service" ? "left" : "right" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((s: any, i: number) => (
            <tr key={s.serviceType} style={{ borderTop: "1px solid #f8fafc" }}>
              <td style={{ padding: "11px 16px" }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: PIE_COLORS[i % PIE_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "white" }}>{i + 1}</div>
              </td>
              <td style={{ padding: "11px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{s.serviceType}</span>
                </div>
              </td>
              <td style={{ padding: "11px 16px", textAlign: "right" }}>
                <span style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{s.count}</span>
              </td>
              <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 13, fontWeight: 800, color: "#10b981" }}>{fmt(s.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
