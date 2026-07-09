import "./_group.css";

const NAVY = "#0b2c60";
const SAFFRON = "#f97316";
const GREEN = "#059669";
const RED = "#e11d48";

const MOCK_ENTRIES = [
  { id: 1, receiptNumber: "CSC-2026-0001", date: "2026-07-01", customerName: "Ramesh Kumar", serviceType: "PAN Card", credit: 150, debit: 0, balance: 12450.0 },
  { id: 2, receiptNumber: "CSC-2026-0002", date: "2026-07-01", customerName: "Sita Devi", serviceType: "Aadhar Enrolment", credit: 80, debit: 0, balance: 12530.0 },
  { id: 3, receiptNumber: "CSC-2026-0003", date: "2026-07-02", customerName: "Mohan Patel", serviceType: "Passport Seva", credit: 0, debit: 300, balance: 12230.0 },
  { id: 4, receiptNumber: "CSC-2026-0004", date: "2026-07-02", customerName: "Priya Singh", serviceType: "Income Certificate", credit: 120, debit: 0, balance: 12350.0 },
  { id: 5, receiptNumber: "CSC-2026-0005", date: "2026-07-03", customerName: "Arjun Das", serviceType: "Voter ID", credit: 90, debit: 0, balance: 12440.0 },
  { id: 6, receiptNumber: "CSC-2026-0006", date: "2026-07-03", customerName: "Geeta Nayak", serviceType: "Ration Card", credit: 0, debit: 200, balance: 12240.0 },
  { id: 7, receiptNumber: "CSC-2026-0007", date: "2026-07-04", customerName: "Suresh Pradhan", serviceType: "PAN Card", credit: 150, debit: 0, balance: 12390.0 },
  { id: 8, receiptNumber: "CSC-2026-0008", date: "2026-07-04", customerName: "Anita Mishra", serviceType: "Death Certificate", credit: 100, debit: 0, balance: 12490.0 },
];

const SERVICES = ["PAN Card", "Aadhar Enrolment", "Passport Seva", "Income Certificate", "Voter ID", "Ration Card", "Death Certificate"];

export default function Current() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f0f4f8", fontFamily: "Inter, -apple-system, sans-serif", overflow: "hidden" }}>

      {/* Top header bar */}
      <div style={{ height: 60, background: "#fff", borderBottom: "1px solid rgba(11,44,96,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 24, flexShrink: 0, boxShadow: "0 1px 8px rgba(11,44,96,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>S</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>Ledger</span>
          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Transaction Register</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>admin</span>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>A</span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: "flex", gap: 16, padding: 16, minHeight: 0 }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{ width: 268, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Balance card */}
          <div style={{ background: "linear-gradient(160deg,#0b2c60 0%,#1a4a9e 60%,#2563eb 100%)", borderRadius: 18, padding: "18px 16px 16px", boxShadow: "0 4px 24px rgba(11,44,96,0.28)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Current Balance</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>₹12,490.00</p>
            <div style={{ display: "flex", gap: 10, marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>Total Credit</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#4ade80" }}>+₹19,650.00</p>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>Total Debit</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#fb7185" }}>−₹7,160.00</p>
              </div>
            </div>
            <button style={{ marginTop: 14, width: "100%", height: 40, borderRadius: 12, border: "none", background: SAFFRON, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 3px 14px rgba(249,115,22,0.45)" }}>
              <span style={{ fontSize: 17, lineHeight: 1 }}>+</span> New Entry
            </button>
          </div>

          {/* Filters card */}
          <div style={{ background: "#fff", borderRadius: 18, padding: "14px 14px", boxShadow: "0 2px 12px rgba(11,44,96,0.07)", border: "1px solid rgba(11,44,96,0.06)", flex: 1, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Filters</p>

            {/* Frequent customers */}
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Frequent</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {["Ramesh Kumar", "Sita Devi", "Mohan Patel"].map((name, i) => (
                  <button key={i} style={{ padding: "3px 9px", borderRadius: 10, border: `1px solid ${i === 0 ? NAVY : "rgba(11,44,96,0.18)"}`, background: i === 0 ? NAVY : "transparent", color: i === 0 ? "#fff" : NAVY, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#94a3b8" }}>🔍</span>
              <input placeholder="Search customer…" style={{ width: "100%", height: 36, paddingLeft: 28, paddingRight: 10, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fafbff", fontSize: 12, color: NAVY, outline: "none", fontWeight: 500 }} />
            </div>

            {/* Date range */}
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>From Date</p>
              <input type="date" defaultValue="2026-07-01" style={{ width: "100%", height: 36, paddingInline: 10, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fafbff", fontSize: 12, color: NAVY, outline: "none", fontWeight: 500 }} />
            </div>
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>To Date</p>
              <input type="date" defaultValue="2026-07-04" style={{ width: "100%", height: 36, paddingInline: 10, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fafbff", fontSize: 12, color: NAVY, outline: "none", fontWeight: 500 }} />
            </div>

            {/* Service select */}
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Service</p>
              <select style={{ width: "100%", height: 36, paddingInline: 8, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fafbff", fontSize: 12, color: NAVY, outline: "none", fontWeight: 500 }}>
                <option>All services</option>
                {SERVICES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              <button style={{ height: 42, borderRadius: 12, border: "1.5px solid rgba(11,44,96,0.15)", background: "#fff", color: NAVY, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 1px 6px rgba(11,44,96,0.05)" }}>
                ⬇ Export to Excel
              </button>
              <button style={{ height: 42, borderRadius: 12, border: "1.5px solid rgba(225,29,72,0.2)", background: "rgba(225,29,72,0.04)", color: RED, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                🗑 Delete All Entries
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT MAIN PANEL ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 20px rgba(11,44,96,0.08)", border: "1px solid rgba(11,44,96,0.06)", flex: 1, display: "flex", flexDirection: "column" }}>

            {/* Tab toolbar */}
            <div style={{ padding: "14px 18px 0", borderBottom: "1px solid rgba(11,44,96,0.07)", flexShrink: 0 }}>
              <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 13, padding: 4, gap: 4, marginBottom: 12 }}>
                {[{ label: "📄 Transactions", active: true }, { label: "🧾 Receipt History", active: false }].map(tab => (
                  <button key={tab.label} style={{ flex: 1, height: 36, borderRadius: 10, border: "none", cursor: "pointer", background: tab.active ? "#fff" : "transparent", color: tab.active ? NAVY : "#64748b", fontWeight: tab.active ? 800 : 600, fontSize: 13, boxShadow: tab.active ? "0 2px 8px rgba(11,44,96,0.10)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {tab.label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12 }}>
                <p style={{ fontSize: 11, color: "#94a3b8" }}>8 total entries · Page 1 of 1</p>
                <span style={{ fontSize: 10, fontWeight: 700, color: SAFFRON, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 20, padding: "4px 12px" }}>Filtered</span>
              </div>
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr style={{ background: "rgba(11,44,96,0.03)", borderBottom: "2px solid rgba(11,44,96,0.08)" }}>
                    {["#", "Receipt No", "Date", "Customer", "Service", "Credit", "Debit", "Balance", "Note", ""].map((label, i) => (
                      <th key={i} style={{ padding: "11px 14px", textAlign: i >= 5 && i <= 7 ? "right" : "left", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Quick-add row */}
                  <tr style={{ borderBottom: "2px solid rgba(11,44,96,0.09)", background: "rgba(249,115,22,0.025)" }}>
                    <td style={{ padding: "8px 14px" }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#f97316,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#fff", fontSize: 14, fontWeight: 900, lineHeight: 1 }}>+</span>
                      </div>
                    </td>
                    <td colSpan={2} style={{ padding: "6px 6px" }}>
                      <input type="date" defaultValue="2026-07-04" style={{ width: "100%", height: 33, paddingInline: 8, borderRadius: 8, border: "1.5px solid rgba(249,115,22,0.35)", fontSize: 11, color: NAVY, outline: "none", background: "#fff", fontFamily: "monospace" }} />
                    </td>
                    <td style={{ padding: "6px 6px" }}>
                      <input placeholder="Customer name *" style={{ width: "100%", height: 33, paddingInline: 8, borderRadius: 8, border: "1.5px solid rgba(249,115,22,0.35)", fontSize: 12, color: NAVY, outline: "none", background: "#fff", fontWeight: 600 }} />
                    </td>
                    <td style={{ padding: "6px 6px" }}>
                      <select style={{ width: "100%", height: 33, paddingInline: 7, borderRadius: 8, border: "1.5px solid rgba(249,115,22,0.35)", fontSize: 11, color: "#94a3b8", outline: "none", background: "#fff" }}>
                        <option value="">Service *</option>
                        {SERVICES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td colSpan={2} style={{ padding: "6px 6px" }}>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <button style={{ flexShrink: 0, height: 33, paddingInline: 10, borderRadius: 8, border: "1.5px solid #059669", background: "rgba(5,150,105,0.1)", color: "#059669", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Cr</button>
                        <button style={{ flexShrink: 0, height: 33, paddingInline: 10, borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#94a3b8", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Dr</button>
                        <input type="number" placeholder="Amount *" style={{ flex: 1, minWidth: 0, height: 33, paddingInline: 8, borderRadius: 8, border: "1.5px solid rgba(249,115,22,0.35)", fontSize: 12, color: NAVY, outline: "none", background: "#fff", textAlign: "right", fontWeight: 700 }} />
                      </div>
                    </td>
                    <td style={{ padding: "8px 14px", textAlign: "right", color: "#cbd5e1", fontSize: 11 }}>—</td>
                    <td style={{ padding: "6px 6px" }}>
                      <input placeholder="Note…" style={{ width: "100%", height: 33, paddingInline: 8, borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 11, color: NAVY, outline: "none", background: "#fff" }} />
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      <button style={{ width: "100%", height: 33, borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f97316,#fb923c)", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(249,115,22,0.35)" }}>Add</button>
                    </td>
                  </tr>

                  {/* Data rows */}
                  {MOCK_ENTRIES.map((entry, idx) => (
                    <tr key={entry.id} style={{ borderBottom: "1px solid rgba(11,44,96,0.05)" }}>
                      <td style={{ padding: "13px 14px", color: "#cbd5e1", fontSize: 11, fontWeight: 700 }}>{idx + 1}</td>
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: SAFFRON, background: "rgba(249,115,22,0.07)", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(249,115,22,0.15)" }}>{entry.receiptNumber}</span>
                      </td>
                      <td style={{ padding: "13px 14px", fontFamily: "monospace", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{entry.date}</td>
                      <td style={{ padding: "13px 14px", fontWeight: 700, fontSize: 13, color: NAVY, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.customerName}</td>
                      <td style={{ padding: "13px 14px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", background: "rgba(71,85,105,0.07)", padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap", display: "inline-block" }}>{entry.serviceType}</span>
                      </td>
                      <td style={{ padding: "13px 14px", textAlign: "right", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" }}>
                        {entry.credit > 0 ? <span style={{ color: GREEN, background: "rgba(5,150,105,0.07)", padding: "3px 8px", borderRadius: 7 }}>+₹{entry.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span> : <span style={{ color: "#e2e8f0" }}>—</span>}
                      </td>
                      <td style={{ padding: "13px 14px", textAlign: "right", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" }}>
                        {entry.debit > 0 ? <span style={{ color: RED, background: "rgba(225,29,72,0.07)", padding: "3px 8px", borderRadius: 7 }}>−₹{entry.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span> : <span style={{ color: "#e2e8f0" }}>—</span>}
                      </td>
                      <td style={{ padding: "13px 14px", textAlign: "right", fontWeight: 900, fontSize: 13, color: NAVY, whiteSpace: "nowrap" }}>₹{entry.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: "13px 14px", fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>—</td>
                      <td style={{ padding: "13px 8px" }}>
                        <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                          <button style={{ height: 30, paddingInline: 10, borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Edit</button>
                          <button style={{ height: 30, paddingInline: 10, borderRadius: 8, border: "none", background: "rgba(225,29,72,0.07)", color: RED, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(11,44,96,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <p style={{ fontSize: 11, color: "#94a3b8" }}>Showing 8 of 8 entries</p>
              <div style={{ display: "flex", gap: 6 }}>
                {[1].map(p => (
                  <button key={p} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: NAVY, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
