/**
 * ReportsTable.tsx
 * Data table sections for the Reports page.
 */
import { PIE_COLORS, fmt, formatINR } from "@/hooks/useReports";

// ── Desktop: Services Used Today table ────────────────────────────────────────
export function ServicesUsedTable({ services }: { services: any[] }) {
  return (
    <div className="bg-card rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px var(--brand-navy-tint-md)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--border))" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--foreground))" }}>Services Used Today</p>
        <p style={{ fontSize: 11, color: "var(--color-slate-400)", marginTop: 2 }}>Transaction breakdown by service</p>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "hsl(var(--muted))" }}>
          <tr>
            {["Rank", "Service", "Transactions", "Revenue"].map(h => (
              <th key={h} style={{ padding: "9px 16px", fontSize: 10, color: "var(--color-slate-400)", letterSpacing: "0.07em", fontWeight: 600, textTransform: "uppercase", textAlign: h === "Rank" || h === "Service" ? "left" : "right" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {services.map((s: any, i: number) => (
            <tr key={s.serviceType} style={{ borderTop: "1px solid hsl(var(--border)/0.5)" }}>
              <td style={{ padding: "11px 16px" }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: PIE_COLORS[i % PIE_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "white" }}>{i + 1}</div>
              </td>
              <td style={{ padding: "11px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "hsl(var(--foreground))" }}>{s.serviceType}</span>
                </div>
              </td>
              <td style={{ padding: "11px 16px", textAlign: "right" }}>
                <span style={{ background: "var(--surface-toast-blue)", color: "var(--color-blue-700)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{s.count}</span>
              </td>
              <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "var(--color-success-light)" }}>{fmt(s.revenue)}</td>
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
    <div className="bg-card rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px var(--brand-navy-tint-md)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--border))" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--foreground))" }}>Monthly Summary</p>
        <p style={{ fontSize: 11, color: "var(--color-slate-400)", marginTop: 2 }}>{months[reportMonth - 1]} {reportYear}</p>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {[
          { label: "Total Credits",  value: fmt(totalCredits),  color: "var(--color-blue)" },
          { label: "Total Debits",   value: fmt(totalDebits),   color: "var(--color-rose-300)" },
          { label: "Net Profit",     value: fmt(netProfit),     color: netProfit >= 0 ? "var(--color-success-light)" : "var(--color-error-std)" },
          { label: "Transactions",   value: totalTransactions,  color: "hsl(var(--foreground))" },
        ].map((row, i, arr) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid hsl(var(--border)/0.5)" : "none" }}>
            <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>{row.label}</span>
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
    <div style={{ background: "linear-gradient(135deg,var(--brand-navy-800),var(--brand-navy-700))", borderRadius: 16, padding: "20px 22px" }}>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>{label}</p>
      {[
        { label: "Total Transactions", value: totalTransactions },
        { label: "Total Withdrawn",    value: fmt(totalWithdrawals) },
        { label: "Total Deposited",    value: fmt(totalDeposits) },
        { label: "Net Flow",           value: fmt(netFlow) },
      ].map((row, i, arr) => (
        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--brand-white-low)" : "none" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{row.label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: i === 2 ? "var(--color-success-glow)" : i === 1 ? "var(--color-rose-300)" : "white" }}>{row.value}</span>
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
    <div className="bg-card rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px var(--brand-navy-tint-md)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--border))" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--foreground))" }}>Day-wise Detail</p>
        <p style={{ fontSize: 11, color: "var(--color-slate-400)", marginTop: 2 }}>{aepsStart} → {aepsEnd}</p>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "hsl(var(--muted))" }}>
            <tr>
              {["Date", "Opening Balance", "Withdrawals", "Deposits", "Transactions", "Net Flow"].map(h => (
                <th key={h} style={{ padding: "9px 16px", fontSize: 10, color: "var(--color-slate-400)", letterSpacing: "0.07em", fontWeight: 600, textTransform: "uppercase", textAlign: h === "Date" ? "left" : "right" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any) => (
              <tr key={row.date} style={{ borderTop: "1px solid hsl(var(--border)/0.5)" }}>
                <td style={{ padding: "11px 16px", fontSize: 12, fontWeight: 800, color: "hsl(var(--foreground))" }}>{row.date}</td>
                <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{formatINR(row.openingBalance)}</td>
                <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, color: "var(--color-error-std)" }}>{formatINR(row.withdrawals)}</td>
                <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, color: "var(--color-success-light)" }}>{formatINR(row.deposits)}</td>
                <td style={{ padding: "11px 16px", textAlign: "right" }}>
                  <span style={{ background: "var(--surface-warn-bg)", color: "var(--brand-orange)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{row.transactions}</span>
                </td>
                <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 12, fontWeight: 800, color: row.netFlow >= 0 ? "var(--color-success-light)" : "var(--color-error-std)" }}>{formatINR(row.netFlow)}</td>
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
    <div className="bg-card rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px var(--brand-navy-tint-md)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--border))" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--foreground))" }}>Service Details</p>
        <p style={{ fontSize: 11, color: "var(--color-slate-400)", marginTop: 2 }}>All-time breakdown</p>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "hsl(var(--muted))" }}>
          <tr>
            {["Rank", "Service", "Transactions", "Revenue"].map(h => (
              <th key={h} style={{ padding: "9px 16px", fontSize: 10, color: "var(--color-slate-400)", letterSpacing: "0.07em", fontWeight: 600, textTransform: "uppercase", textAlign: h === "Rank" || h === "Service" ? "left" : "right" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((s: any, i: number) => (
            <tr key={s.serviceType} style={{ borderTop: "1px solid hsl(var(--border)/0.5)" }}>
              <td style={{ padding: "11px 16px" }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: PIE_COLORS[i % PIE_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "white" }}>{i + 1}</div>
              </td>
              <td style={{ padding: "11px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "hsl(var(--foreground))" }}>{s.serviceType}</span>
                </div>
              </td>
              <td style={{ padding: "11px 16px", textAlign: "right" }}>
                <span style={{ background: "var(--surface-toast-blue)", color: "var(--color-blue-700)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{s.count}</span>
              </td>
              <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 13, fontWeight: 800, color: "var(--color-success-light)" }}>{fmt(s.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
