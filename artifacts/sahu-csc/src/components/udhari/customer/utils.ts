// ─── Shared helpers for the Udhari customer detail page ───────────────────────

export const today = () => new Date().toISOString().split("T")[0];

export function fmt(n: number) {
  return `₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export function printLedger(customer: any, entries: any[]) {
  const rows = entries.map((e) => `
    <tr>
      <td>${e.date}</td>
      <td style="color:${e.type === 'gave' ? 'var(--brand-orange-600)' : 'var(--color-success)'}">${e.type === 'gave' ? 'You Gave' : 'You Got'}</td>
      <td style="text-align:right;font-weight:bold;color:${e.type === 'gave' ? 'var(--brand-orange-600)' : 'var(--color-success)'}">
        ${e.type === 'gave' ? '+' : '-'}₹${Math.abs(e.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
      <td>${e.note || '—'}</td>
    </tr>`).join("");

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Udhari Khata — ${customer.name}</title>
    <style>
      body{font-family:sans-serif;padding:32px;color:var(--color-slate-800);max-width:700px;margin:0 auto}
      h1{color:var(--brand-navy-800);font-size:22px;margin:0}
      .sub{color:var(--color-slate-500);font-size:12px;margin:4px 0 0}
      .balance{font-size:28px;font-weight:900;margin:16px 0 8px}
      .collect{color:var(--brand-orange-600)}.pay{color:var(--color-success)}.settled{color:var(--color-slate-500)}
      table{width:100%;border-collapse:collapse;margin-top:20px;font-size:13px}
      th{background:var(--color-slate-100);padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--color-slate-500)}
      td{padding:8px 12px;border-bottom:1px solid var(--color-slate-100)}
      @media print{button{display:none}}
    </style></head><body>
    <h1>Udhari Khata — ${customer.name}</h1>
    <p class="sub">${customer.mobile ? `📞 ${customer.mobile}` : ''} ${customer.address ? `· ${customer.address}` : ''}</p>
    <p class="sub">Printed: ${new Date().toLocaleString('en-IN')}</p>
    <p class="balance ${customer.balance > 0 ? 'collect' : customer.balance < 0 ? 'pay' : 'settled'}">
      ${customer.balance > 0 ? 'To Collect' : customer.balance < 0 ? 'To Pay' : 'Settled'}:
      ₹${Math.abs(customer.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
    </p>
    <table>
      <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Note</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <script>window.print()</script>
  </body></html>`);
  win.document.close();
}

export function sendReminder(customer: any) {
  if (!customer.mobile) return;
  const balance = customer.balance;
  const amt = `₹${Math.abs(balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const msg = balance > 0
    ? `Namaste ${customer.name} ji 🙏\n\nYour pending balance in our Udhari Khata is *${amt}* (To Pay).\n\nKindly settle at your earliest convenience.\n\n— SAHU CSC`
    : `Namaste ${customer.name} ji 🙏\n\nWe owe you *${amt}* in our Udhari Khata. We will settle it soon.\n\n— SAHU CSC`;
  const mobile = customer.mobile.replace(/\D/g, "");
  const url = `https://wa.me/${mobile.startsWith("91") ? mobile : `91${mobile}`}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}
