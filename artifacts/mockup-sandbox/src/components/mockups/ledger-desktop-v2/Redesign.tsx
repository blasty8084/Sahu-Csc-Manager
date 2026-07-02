import { useState } from "react";
import "./_group.css";

const NAVY = "#0b2c60";
const SAFFRON = "#f97316";
const GREEN = "#059669";
const RED = "#e11d48";

const MOCK_ENTRIES = [
  { id: 1, receiptNumber: "CSC-2026-0001", date: "Jul 01", customerName: "Ramesh Kumar", serviceType: "PAN Card", credit: 150, debit: 0, balance: 12450.0, note: "" },
  { id: 2, receiptNumber: "CSC-2026-0002", date: "Jul 01", customerName: "Sita Devi", serviceType: "Aadhar Enrolment", credit: 80, debit: 0, balance: 12530.0, note: "Urgent" },
  { id: 3, receiptNumber: "CSC-2026-0003", date: "Jul 02", customerName: "Mohan Patel", serviceType: "Passport Seva", credit: 0, debit: 300, balance: 12230.0, note: "" },
  { id: 4, receiptNumber: "CSC-2026-0004", date: "Jul 02", customerName: "Priya Singh", serviceType: "Income Certificate", credit: 120, debit: 0, balance: 12350.0, note: "" },
  { id: 5, receiptNumber: "CSC-2026-0005", date: "Jul 03", customerName: "Arjun Das", serviceType: "Voter ID", credit: 90, debit: 0, balance: 12440.0, note: "" },
  { id: 6, receiptNumber: "CSC-2026-0006", date: "Jul 03", customerName: "Geeta Nayak", serviceType: "Ration Card", credit: 0, debit: 200, balance: 12240.0, note: "Repeat" },
  { id: 7, receiptNumber: "CSC-2026-0007", date: "Jul 04", customerName: "Suresh Pradhan", serviceType: "PAN Card", credit: 150, debit: 0, balance: 12390.0, note: "" },
  { id: 8, receiptNumber: "CSC-2026-0008", date: "Jul 04", customerName: "Anita Mishra", serviceType: "Death Certificate", credit: 100, debit: 0, balance: 12490.0, note: "" },
];

const SERVICES = ["PAN Card", "Aadhar Enrolment", "Passport Seva", "Income Certificate", "Voter ID", "Ration Card", "Death Certificate"];

const SERVICE_COLORS: Record<string, string> = {
  "PAN Card": "#7c3aed",
  "Aadhar Enrolment": "#0891b2",
  "Passport Seva": "#0b2c60",
  "Income Certificate": "#059669",
  "Voter ID": "#d97706",
  "Ration Card": "#dc2626",
  "Death Certificate": "#64748b",
};

function ServiceBadge({ name }: { name: string }) {
  const color = SERVICE_COLORS[name] || "#475569";
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color, background: color + "14", padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap" as const, display: "inline-block", letterSpacing: "0.01em" }}>
      {name}
    </span>
  );
}

export default function Redesign() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f1f5f9", fontFamily: "Inter, -apple-system, sans-serif", overflow: "hidden" }}>

      {/* ══════════════════════════════════
          LEFT SIDEBAR  (240px)
          ══════════════════════════════════ */}
      <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", background: NAVY, color: "#fff" }}>

        {/* Brand / logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: SAFFRON, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 900 }}>S</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.2px" }}>SAHU CSC</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>Ledger Register</p>
            </div>
          </div>
        </div>

        {/* Balance summary */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Your Balance</p>
          <p style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1, marginBottom: 12 }}>₹12,490</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 10, padding: "8px 10px" }}>
              <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 3 }}>Credits</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#4ade80" }}>+₹19,650</p>
            </div>
            <div style={{ background: "rgba(251,113,133,0.12)", border: "1px solid rgba(251,113,133,0.2)", borderRadius: 10, padding: "8px 10px" }}>
              <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 3 }}>Debits</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#fb7185" }}>−₹7,160</p>
            </div>
          </div>

          {/* New entry CTA */}
          <button style={{ marginTop: 14, width: "100%", height: 42, borderRadius: 12, border: "none", background: SAFFRON, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, letterSpacing: "0.01em", boxShadow: "0 4px 16px rgba(249,115,22,0.5)" }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Entry
          </button>
        </div>

        {/* Filters section */}
        <div style={{ flex: 1, padding: "14px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Filters</p>

          {/* Quick date presets */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["Today", "This Week", "This Month"].map(label => (
              <button key={label} onClick={() => setActiveFilter(activeFilter === label ? null : label)} style={{ padding: "5px 11px", borderRadius: 20, border: `1px solid ${activeFilter === label ? SAFFRON : "rgba(255,255,255,0.15)"}`, background: activeFilter === label ? SAFFRON : "transparent", color: activeFilter === label ? "#fff" : "rgba(255,255,255,0.65)", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, opacity: 0.4 }}>🔍</span>
            <input placeholder="Customer name…" style={{ width: "100%", height: 36, paddingLeft: 28, paddingRight: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", fontSize: 12, color: "#fff", outline: "none", fontWeight: 500 }} />
          </div>

          {/* Date range */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>From</p>
              <input type="date" defaultValue="2026-07-01" style={{ width: "100%", height: 34, paddingInline: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", fontSize: 10, color: "#fff", outline: "none", colorScheme: "dark" }} />
            </div>
            <div>
              <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>To</p>
              <input type="date" defaultValue="2026-07-04" style={{ width: "100%", height: 34, paddingInline: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", fontSize: 10, color: "#fff", outline: "none", colorScheme: "dark" }} />
            </div>
          </div>

          {/* Service filter */}
          <div>
            <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Service type</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {SERVICES.slice(0, 5).map(s => (
                <button key={s} style={{ textAlign: "left", padding: "6px 10px", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: SERVICE_COLORS[s] || "#475569", flexShrink: 0 }} />
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 8 }}>
          <button style={{ height: 38, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            ⬇ Export to Excel
          </button>
          <button style={{ height: 38, borderRadius: 10, border: "1px solid rgba(251,113,133,0.3)", background: "rgba(225,29,72,0.08)", color: "#fb7185", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            🗑 Delete All
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════
          MAIN AREA
          ══════════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ height: 56, background: "#fff", borderBottom: "1px solid #e8edf4", display: "flex", alignItems: "center", paddingInline: 24, gap: 16, flexShrink: 0, boxShadow: "0 1px 4px rgba(11,44,96,0.04)" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, lineHeight: 1 }}>Transactions</p>
            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>8 entries · July 2026</p>
          </div>

          {/* View tabs */}
          <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 3, gap: 2 }}>
            {["Transactions", "Receipts"].map((tab, i) => (
              <button key={tab} style={{ height: 30, paddingInline: 14, borderRadius: 8, border: "none", background: i === 0 ? "#fff" : "transparent", color: i === 0 ? NAVY : "#64748b", fontSize: 12, fontWeight: i === 0 ? 700 : 600, cursor: "pointer", boxShadow: i === 0 ? "0 1px 4px rgba(11,44,96,0.08)" : "none" }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Filter pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: SAFFRON, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.18)", borderRadius: 20, padding: "4px 12px" }}>
              Active filters: 2
            </span>
          </div>

          {/* Avatar */}
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${NAVY},#1a4a9e)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>A</span>
          </div>
        </div>

        {/* Quick-add bar — prominent strip */}
        <div style={{ background: "#fff", borderBottom: "2px solid #e8edf4", padding: "10px 20px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${SAFFRON},#fb923c)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(249,115,22,0.35)" }}>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 900, lineHeight: 1 }}>+</span>
          </div>
          <input type="date" defaultValue="2026-07-04" style={{ height: 36, paddingInline: 10, borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 12, color: NAVY, outline: "none", background: "#fafbff", width: 140, fontFamily: "monospace", fontWeight: 600 }} />
          <input placeholder="Customer name *" style={{ height: 36, paddingInline: 10, borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 12, color: NAVY, outline: "none", background: "#fafbff", flex: 1, fontWeight: 600 }} />
          <select style={{ height: 36, paddingInline: 10, borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 12, color: NAVY, outline: "none", background: "#fafbff", width: 160 }}>
            <option value="">Service type *</option>
            {SERVICES.map(s => <option key={s}>{s}</option>)}
          </select>
          {/* Cr/Dr toggle */}
          <div style={{ display: "flex", borderRadius: 9, overflow: "hidden", border: "1.5px solid #e2e8f0", flexShrink: 0 }}>
            <button style={{ height: 36, paddingInline: 14, border: "none", background: "rgba(5,150,105,0.1)", color: GREEN, fontSize: 12, fontWeight: 800, cursor: "pointer", borderRight: "1px solid #e2e8f0" }}>Cr</button>
            <button style={{ height: 36, paddingInline: 14, border: "none", background: "#fff", color: "#94a3b8", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Dr</button>
          </div>
          <input type="number" placeholder="₹ Amount *" style={{ height: 36, paddingInline: 10, borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, color: NAVY, outline: "none", background: "#fafbff", width: 120, textAlign: "right", fontWeight: 700 }} />
          <input placeholder="Note (optional)" style={{ height: 36, paddingInline: 10, borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 12, color: "#64748b", outline: "none", background: "#fafbff", width: 140 }} />
          <button style={{ height: 36, paddingInline: 18, borderRadius: 9, border: "none", background: `linear-gradient(135deg,${SAFFRON},#fb923c)`, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", flexShrink: 0, boxShadow: "0 2px 10px rgba(249,115,22,0.35)", letterSpacing: "0.02em" }}>
            Add →
          </button>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: "auto", padding: "0 4px" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {[
                  { label: "#", w: 40 },
                  { label: "Receipt", w: 130 },
                  { label: "Date", w: 80 },
                  { label: "Customer", w: undefined },
                  { label: "Service", w: 160 },
                  { label: "Credit", w: 110, right: true },
                  { label: "Debit", w: 110, right: true },
                  { label: "Balance", w: 120, right: true },
                  { label: "Note", w: 120 },
                  { label: "", w: 90 },
                ].map((col, i) => (
                  <th key={i} style={{ padding: "12px 16px", textAlign: col.right ? "right" : "left", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", width: col.w, borderBottom: "2px solid #e8edf4", position: "sticky", top: 0, background: "#f8fafc", zIndex: 1 }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_ENTRIES.map((entry, idx) => (
                <tr key={entry.id} style={{ background: idx % 2 === 0 ? "#fff" : "#fafbfd" }}>
                  <td style={{ padding: "14px 16px", color: "#d1d5db", fontSize: 11, fontWeight: 700, borderBottom: "1px solid #f1f5f9" }}>{idx + 1}</td>
                  <td style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                    <code style={{ fontSize: 11, fontWeight: 700, color: SAFFRON, background: "rgba(249,115,22,0.07)", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(249,115,22,0.12)" }}>{entry.receiptNumber}</code>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>{entry.date}</td>
                  <td style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${NAVY}22,${NAVY}44)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: NAVY }}>{entry.customerName[0]}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: NAVY, whiteSpace: "nowrap" }}>{entry.customerName}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
                    <ServiceBadge name={entry.serviceType} />
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                    {entry.credit > 0 ? (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 800, color: GREEN }}>+₹{entry.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    ) : <span style={{ color: "#e2e8f0", fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                    {entry.debit > 0 ? (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: RED, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 800, color: RED }}>−₹{entry.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    ) : <span style={{ color: "#e2e8f0", fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: NAVY, fontVariantNumeric: "tabular-nums" }}>₹{entry.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
                    {entry.note ? <span style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9", padding: "2px 8px", borderRadius: 6 }}>{entry.note}</span> : <span style={{ color: "#e2e8f0", fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ padding: "14px 10px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <button style={{ width: 28, height: 28, borderRadius: 7, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Edit">✏️</button>
                      <button style={{ width: 28, height: 28, borderRadius: 7, border: "1.5px solid rgba(225,29,72,0.15)", background: "rgba(225,29,72,0.04)", color: RED, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Delete">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / pagination */}
        <div style={{ height: 50, background: "#fff", borderTop: "1px solid #e8edf4", display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 24, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Showing <b style={{ color: NAVY }}>8</b> of 8 entries</p>
            <div style={{ display: "flex", gap: 10, fontSize: 12, fontWeight: 600 }}>
              <span style={{ color: GREEN }}>Credits: ₹690.00</span>
              <span style={{ color: "#cbd5e1" }}>·</span>
              <span style={{ color: RED }}>Debits: ₹500.00</span>
              <span style={{ color: "#cbd5e1" }}>·</span>
              <span style={{ color: NAVY, fontWeight: 700 }}>Net: +₹190.00</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button style={{ height: 30, paddingInline: 12, borderRadius: 7, border: "1.5px solid #e2e8f0", background: "#fff", color: "#94a3b8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>‹ Prev</button>
            <button style={{ height: 30, width: 34, borderRadius: 7, border: "none", background: NAVY, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>1</button>
            <button style={{ height: 30, paddingInline: 12, borderRadius: 7, border: "1.5px solid #e2e8f0", background: "#fff", color: "#94a3b8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Next ›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
