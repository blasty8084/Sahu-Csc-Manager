import { MONTHS, fmt, formatINR } from "./useReports";

/**
 * Returns a `printReport()` function that builds a fully self-contained HTML
 * page and opens it in a new window for printing. Kept as a hook so it has
 * easy access to the current activeTab and filter/data state — no prop drilling.
 */
export function useReportPrint(
  activeTab: string,
  filters: {
    dailyDate: string;
    reportMonth: number;
    reportYear: number;
    aepsStart: string;
    aepsEnd: string;
    monthStart: string;
    monthEnd: string;
  },
  data: {
    daily: { data: any };
    monthly: { data: any };
    breakdown: { data: any[] | undefined };
    aepsReport: { data: any };
  },
): () => void {
  return function printReport() {
    const css = `
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1e293b;font-size:12px;padding:20mm 18mm}
      @page{size:A4 portrait;margin:0}
      .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:3px solid #0b2c60;margin-bottom:18px}
      .brand-name{font-size:20px;font-weight:900;color:#0b2c60;letter-spacing:-0.5px}
      .brand-name span{color:#f97316}
      .brand-sub{font-size:10px;color:#94a3b8;letter-spacing:0.08em;margin-top:3px}
      .report-meta{text-align:right}
      .report-title{font-size:15px;font-weight:800;color:#0b2c60}
      .report-date{font-size:10px;color:#94a3b8;margin-top:3px}
      .kpi-row{display:flex;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:18px}
      .kpi-cell{flex:1;padding:12px 16px;background:#f8fafc;border-right:1px solid #e2e8f0}
      .kpi-cell:last-child{border-right:none}
      .kpi-label{font-size:8px;font-weight:700;color:#94a3b8;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:5px}
      .kpi-value{font-size:16px;font-weight:900;color:#0b2c60}
      .kpi-trend{font-size:9px;font-weight:700;margin-top:3px}
      .kpi-pos{color:#10b981} .kpi-neg{color:#ef4444}
      .section-title{font-size:13px;font-weight:800;color:#0b2c60;margin:0 0 10px;padding-bottom:6px;border-bottom:2px solid #f1f5f9}
      table{width:100%;border-collapse:collapse;margin-bottom:18px}
      thead tr{background:#f8fafc}
      th{padding:8px 12px;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.07em;text-align:left;border-bottom:2px solid #e2e8f0}
      th.r{text-align:right}
      td{padding:9px 12px;font-size:11px;color:#334155;border-bottom:1px solid #f1f5f9}
      td.r{text-align:right} td.green{color:#10b981;font-weight:700} td.red{color:#ef4444;font-weight:700} td.navy{color:#0b2c60;font-weight:800}
      .badge{background:#eff6ff;color:#1d4ed8;border-radius:20px;padding:2px 8px;font-size:9px;font-weight:700;display:inline-block}
      .summary-box{background:#0b2c60;color:white;border-radius:10px;padding:14px 18px;margin-bottom:18px}
      .summary-box .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.1)}
      .summary-box .row:last-child{border-bottom:none}
      .summary-box .lbl{color:rgba(255,255,255,0.55);font-size:10px}
      .summary-box .val{color:white;font-weight:700;font-size:12px}
      .summary-box .val.green{color:#34d399} .summary-box .val.red{color:#fca5a5}
      .footer{margin-top:24px;padding-top:10px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;color:#94a3b8;font-size:9px}
    `;

    const now = new Date().toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" });
    const tabLabels: Record<string, string> = {
      daily: "Daily Report", monthly: "Monthly Report", aeps: "AePS Report", services: "Service Analysis",
    };
    const periodLabels: Record<string, string> = {
      daily: filters.dailyDate,
      monthly: `${MONTHS[filters.reportMonth - 1]} ${filters.reportYear}`,
      aeps: `${filters.aepsStart} to ${filters.aepsEnd}`,
      services: "All-time",
    };

    let body = `<div class="header">
      <div><div class="brand-name">SAHU <span>CSC</span></div><div class="brand-sub">COMMON SERVICE CENTER · ODISHA</div></div>
      <div class="report-meta">
        <div class="report-title">${tabLabels[activeTab]}</div>
        <div class="report-date">Period: ${periodLabels[activeTab]}</div>
        <div class="report-date">Generated: ${now}</div>
      </div>
    </div>`;

    if (activeTab === "daily" && data.daily.data) {
      const d = data.daily.data;
      const avg = d.transactionCount > 0 ? d.netRevenue / d.transactionCount : 0;
      body += `<div class="kpi-row">
        <div class="kpi-cell"><div class="kpi-label">Total Credits</div><div class="kpi-value">${fmt(d.totalCredits)}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Total Debits</div><div class="kpi-value">${fmt(d.totalDebits)}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Net Revenue</div><div class="kpi-value">${fmt(d.netRevenue)}</div><div class="kpi-trend ${d.netRevenue >= 0 ? "kpi-pos" : "kpi-neg"}">${d.netRevenue >= 0 ? "▲ Profitable" : "▼ Loss"}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Transactions</div><div class="kpi-value">${d.transactionCount}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Avg Ticket</div><div class="kpi-value">${fmt(avg)}</div></div>
      </div>`;
      if (d.topServices?.length) {
        body += `<div class="section-title">Services Used — ${filters.dailyDate}</div><table><thead><tr><th>#</th><th>Service</th><th class="r">Transactions</th><th class="r">Revenue</th></tr></thead><tbody>`;
        d.topServices.forEach((s: any, i: number) => {
          body += `<tr><td class="navy">${i + 1}</td><td>${s.serviceType}</td><td class="r"><span class="badge">${s.count} tx</span></td><td class="r green">${fmt(s.revenue)}</td></tr>`;
        });
        body += `</tbody></table>`;
      }
      if (d.aeps) {
        body += `<div class="section-title">AePS Cash — ${filters.dailyDate}</div><div class="summary-box">
          <div class="row"><span class="lbl">Total Transactions</span><span class="val">${d.aeps.totalTransactions}</span></div>
          <div class="row"><span class="lbl">Total Withdrawn</span><span class="val red">${fmt(d.aeps.totalWithdrawals)}</span></div>
          <div class="row"><span class="lbl">Total Deposited</span><span class="val green">${fmt(d.aeps.totalDeposits)}</span></div>
          <div class="row"><span class="lbl">Net Flow</span><span class="val ${d.aeps.netFlow >= 0 ? "green" : "red"}">${fmt(d.aeps.netFlow)}</span></div>
        </div>`;
      }
    }

    if (activeTab === "monthly" && data.monthly.data) {
      const m = data.monthly.data;
      const avg = m.totalTransactions > 0 ? m.netProfit / m.totalTransactions : 0;
      body += `<div class="kpi-row">
        <div class="kpi-cell"><div class="kpi-label">Total Credits</div><div class="kpi-value">${fmt(m.totalCredits)}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Total Debits</div><div class="kpi-value">${fmt(m.totalDebits)}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Net Profit</div><div class="kpi-value">${fmt(m.netProfit)}</div><div class="kpi-trend ${m.netProfit >= 0 ? "kpi-pos" : "kpi-neg"}">${m.netProfit >= 0 ? "▲ Profit" : "▼ Loss"}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Transactions</div><div class="kpi-value">${m.totalTransactions}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Avg Ticket</div><div class="kpi-value">${fmt(avg)}</div></div>
      </div>`;
      if (m.dailyBreakdown?.length) {
        body += `<div class="section-title">Daily Breakdown — ${MONTHS[filters.reportMonth - 1]} ${filters.reportYear}</div><table><thead><tr><th>Date</th><th class="r">Credits</th><th class="r">Debits</th><th class="r">Net</th></tr></thead><tbody>`;
        m.dailyBreakdown.forEach((row: any) => {
          const net = parseFloat(row.credits || 0) - parseFloat(row.debits || 0);
          body += `<tr><td class="navy">${row.date}</td><td class="r green">${fmt(row.credits)}</td><td class="r red">${fmt(row.debits)}</td><td class="r ${net >= 0 ? "green" : "red"}">${fmt(net)}</td></tr>`;
        });
        body += `</tbody></table>`;
      }
      if (m.aeps) {
        body += `<div class="section-title">AePS Summary</div><div class="summary-box">
          <div class="row"><span class="lbl">Total Transactions</span><span class="val">${m.aeps.totalTransactions}</span></div>
          <div class="row"><span class="lbl">Total Withdrawn</span><span class="val red">${fmt(m.aeps.totalWithdrawals)}</span></div>
          <div class="row"><span class="lbl">Total Deposited</span><span class="val green">${fmt(m.aeps.totalDeposits)}</span></div>
          <div class="row"><span class="lbl">Net Flow</span><span class="val ${m.aeps.netFlow >= 0 ? "green" : "red"}">${fmt(m.aeps.netFlow)}</span></div>
        </div>`;
      }
    }

    if (activeTab === "aeps" && data.aepsReport.data) {
      const a = data.aepsReport.data;
      body += `<div class="kpi-row">
        <div class="kpi-cell"><div class="kpi-label">AePS Tx</div><div class="kpi-value">${a.totalTransactions}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Withdrawals</div><div class="kpi-value">${fmt(a.totalWithdrawals)}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Deposits</div><div class="kpi-value">${fmt(a.totalDeposits)}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Net Flow</div><div class="kpi-value">${fmt(a.netFlow)}</div><div class="kpi-trend ${a.netFlow >= 0 ? "kpi-pos" : "kpi-neg"}">${a.netFlow >= 0 ? "▲ Net positive" : "▼ Net negative"}</div></div>
      </div>`;
      if (a.dailyBreakdown?.length) {
        body += `<div class="section-title">Day-wise AePS Detail — ${filters.aepsStart} to ${filters.aepsEnd}</div><table><thead><tr><th>Date</th><th class="r">Opening Balance</th><th class="r">Withdrawals</th><th class="r">Deposits</th><th class="r">Transactions</th><th class="r">Net Flow</th></tr></thead><tbody>`;
        a.dailyBreakdown.forEach((row: any) => {
          body += `<tr><td class="navy">${row.date}</td><td class="r">${formatINR(row.openingBalance)}</td><td class="r red">${formatINR(row.withdrawals)}</td><td class="r green">${formatINR(row.deposits)}</td><td class="r"><span class="badge">${row.transactions}</span></td><td class="r ${row.netFlow >= 0 ? "green" : "red"}">${formatINR(row.netFlow)}</td></tr>`;
        });
        body += `</tbody></table>`;
      }
    }

    if (activeTab === "services" && data.breakdown.data?.length) {
      const totalTx  = data.breakdown.data.reduce((s: number, r: any) => s + r.count, 0);
      const totalRev = data.breakdown.data.reduce((s: number, r: any) => s + parseFloat(r.revenue || 0), 0);
      body += `<div class="kpi-row">
        <div class="kpi-cell"><div class="kpi-label">Total Services</div><div class="kpi-value">${data.breakdown.data.length}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Total Transactions</div><div class="kpi-value">${totalTx}</div></div>
        <div class="kpi-cell"><div class="kpi-label">Total Revenue</div><div class="kpi-value">${fmt(totalRev)}</div></div>
      </div>`;
      body += `<div class="section-title">Service Breakdown — All Time</div><table><thead><tr><th>#</th><th>Service Name</th><th class="r">Transactions</th><th class="r">Revenue</th></tr></thead><tbody>`;
      data.breakdown.data.forEach((s: any, i: number) => {
        body += `<tr><td class="navy">${i + 1}</td><td>${s.serviceType}</td><td class="r"><span class="badge">${s.count}</span></td><td class="r green">${fmt(s.revenue)}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    body += `<div class="footer"><span>SAHU CSC · Common Service Center · Odisha</span><span>Confidential — For internal use only</span></div>`;

    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${tabLabels[activeTab]} — SAHU CSC</title><style>${css}</style></head><body>${body}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };
}
