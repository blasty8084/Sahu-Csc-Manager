import { useState } from "react";
import "./_group.css";

/* ─── Design concept: "Accounting Clarity" ───────────────────────────────
   Shifts the balance from the sidebar into a top metric strip so the first
   thing the operator sees is the P&L snapshot. The sidebar becomes a pure
   filter panel. Rows carry a left-edge accent (green/red) so credit/debit
   is scannable without reading the numbers. The inline add-row is pinned
   inside the table itself — zero context switching. Footer summarises the
   current page totals in a compact totals row.
──────────────────────────────────────────────────────────────────────── */

const NAVY    = "#0b2c60";
const SAFFRON = "#f97316";
const GREEN   = "#059669";
const RED     = "#e11d48";

const ENTRIES = [
  { id: 1, rcpt: "CSC-2026-0001", date: "2026-07-01", customer: "Ramesh Kumar",   service: "PAN Card",           credit: 150,  debit: 0,   balance: 12_450,  note: ""       },
  { id: 2, rcpt: "CSC-2026-0002", date: "2026-07-01", customer: "Sita Devi",      service: "Aadhar Enrolment",   credit: 80,   debit: 0,   balance: 12_530,  note: "Urgent" },
  { id: 3, rcpt: "CSC-2026-0003", date: "2026-07-02", customer: "Mohan Patel",    service: "Passport Seva",      credit: 0,    debit: 300, balance: 12_230,  note: ""       },
  { id: 4, rcpt: "CSC-2026-0004", date: "2026-07-02", customer: "Priya Singh",    service: "Income Certificate", credit: 120,  debit: 0,   balance: 12_350,  note: ""       },
  { id: 5, rcpt: "CSC-2026-0005", date: "2026-07-03", customer: "Arjun Das",      service: "Voter ID",           credit: 90,   debit: 0,   balance: 12_440,  note: ""       },
  { id: 6, rcpt: "CSC-2026-0006", date: "2026-07-03", customer: "Geeta Nayak",    service: "Ration Card",        credit: 0,    debit: 200, balance: 12_240,  note: "Repeat" },
  { id: 7, rcpt: "CSC-2026-0007", date: "2026-07-04", customer: "Suresh Pradhan", service: "PAN Card",           credit: 150,  debit: 0,   balance: 12_390,  note: ""       },
  { id: 8, rcpt: "CSC-2026-0008", date: "2026-07-04", customer: "Anita Mishra",   service: "Death Certificate",  credit: 100,  debit: 0,   balance: 12_490,  note: ""       },
];

const SVC_COLOR: Record<string, string> = {
  "PAN Card": "#7c3aed",
  "Aadhar Enrolment": "#0891b2",
  "Passport Seva": "#0b2c60",
  "Income Certificate": "#059669",
  "Voter ID": "#d97706",
  "Ration Card": "#dc2626",
  "Death Certificate": "#64748b",
};
const svcColor = (s: string) => SVC_COLOR[s] ?? "#475569";

const INR = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });

/* ── Metric card ──────────────────────────────────────────── */
function Metric({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  return (
    <div style={{
      flex: 1, padding: "14px 20px",
      borderRight: "1px solid rgba(11,44,96,0.07)",
      display: "flex", flexDirection: "column", gap: 3,
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 900, color: accent, letterSpacing: "-0.5px", fontVariantNumeric: "tabular-nums" }}>{value}</p>
      {sub && <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>{sub}</p>}
    </div>
  );
}

/* ── Service pill ─────────────────────────────────────────── */
function SvcBadge({ name }: { name: string }) {
  const c = svcColor(name);
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, color: c,
      background: c + "18", padding: "3px 9px",
      borderRadius: 20, whiteSpace: "nowrap",
      display: "inline-block", letterSpacing: "0.01em",
    }}>{name}</span>
  );
}

/* ── Customer avatar + name ───────────────────────────────── */
function CustCell({ name }: { name: string }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9,
        background: `linear-gradient(135deg,${NAVY}28,${NAVY}50)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, fontWeight: 900, color: NAVY, letterSpacing: "0.02em" }}>{initials}</span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: NAVY, whiteSpace: "nowrap" }}>{name}</span>
    </div>
  );
}

export default function V3() {
  const [activeTab, setActiveTab] = useState<"tx" | "rcpt">("tx");
  const [activeSvc, setActiveSvc] = useState("");
  const [datePreset, setDatePreset] = useState("");
  const [crDr, setCrDr]   = useState<"credit" | "debit">("credit");

  const pageCr = ENTRIES.reduce((s, e) => s + e.credit, 0);
  const pageDr = ENTRIES.reduce((s, e) => s + e.debit, 0);
  const pageNet = pageCr - pageDr;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", background: "#f1f5f9",
      fontFamily: "Inter, -apple-system, sans-serif",
      overflow: "hidden",
    }}>

      {/* ══════════════════════════════════════════
          TOP METRIC STRIP
          ══════════════════════════════════════════ */}
      <div style={{
        display: "flex", background: "#fff",
        borderBottom: "1px solid rgba(11,44,96,0.08)",
        flexShrink: 0,
        boxShadow: "0 2px 12px rgba(11,44,96,0.06)",
      }}>
        {/* Brand / title */}
        <div style={{
          width: 220, flexShrink: 0,
          display: "flex", alignItems: "center", gap: 10,
          paddingInline: 20,
          borderRight: "1px solid rgba(11,44,96,0.07)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11,
            background: "linear-gradient(135deg,#0b2c60,#1a4a9e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 3px 12px rgba(11,44,96,0.28)",
          }}>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 900 }}>₹</span>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 900, color: NAVY, lineHeight: 1.1 }}>Ledger</p>
            <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>Transaction Register</p>
          </div>
        </div>

        {/* Metrics */}
        <Metric label="Current Balance" value={INR(12_490)} sub="as of today"       accent={NAVY}    />
        <Metric label="Total Credits"   value="+₹19,650"    sub="8 credit entries"  accent={GREEN}   />
        <Metric label="Total Debits"    value="−₹7,160"     sub="2 debit entries"   accent={RED}     />
        <Metric label="Net this page"   value={pageNet >= 0 ? `+${INR(pageNet)}` : INR(pageNet)} sub="8 entries shown" accent={pageNet >= 0 ? GREEN : RED} />

        {/* User */}
        <div style={{
          width: 64, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderLeft: "1px solid rgba(11,44,96,0.07)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg,#0b2c60,#1a4a9e)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 900 }}>A</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BODY ROW
          ══════════════════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

        {/* ── FILTER SIDEBAR (220px, white) ── */}
        <div style={{
          width: 220, flexShrink: 0,
          background: "#fff",
          borderRight: "1px solid rgba(11,44,96,0.07)",
          display: "flex", flexDirection: "column",
          boxShadow: "2px 0 8px rgba(11,44,96,0.04)",
        }}>
          {/* New entry CTA */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(11,44,96,0.07)" }}>
            <button style={{
              width: "100%", height: 44, borderRadius: 13,
              border: "none", background: SAFFRON, color: "#fff",
              fontSize: 13, fontWeight: 900, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 18px rgba(249,115,22,0.42)",
              letterSpacing: "0.01em",
            }}>
              <span style={{ fontSize: 19, lineHeight: 1, marginTop: -1 }}>+</span>
              New Entry
            </button>
          </div>

          {/* Scrollable filter body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Date presets */}
            <div>
              <p style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>Date Range</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {["Today", "This Week", "This Month"].map(label => {
                  const active = datePreset === label;
                  return (
                    <button key={label} onClick={() => setDatePreset(active ? "" : label)} style={{
                      padding: "4px 10px", borderRadius: 20,
                      border: `1px solid ${active ? SAFFRON : "rgba(11,44,96,0.15)"}`,
                      background: active ? SAFFRON : "transparent",
                      color: active ? "#fff" : "#64748b",
                      fontSize: 10, fontWeight: 700, cursor: "pointer",
                    }}>{label}</button>
                  );
                })}
              </div>
              {/* Custom range */}
              <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {["From", "To"].map(lbl => (
                  <div key={lbl}>
                    <p style={{ fontSize: 9, fontWeight: 600, color: "#94a3b8", marginBottom: 3 }}>{lbl}</p>
                    <input type="date" style={{
                      width: "100%", height: 32, paddingInline: 8, borderRadius: 8,
                      border: "1.5px solid #e2e8f0", background: "#fafbff",
                      fontSize: 10, color: NAVY, outline: "none",
                    }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Customer search */}
            <div>
              <p style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>Customer</p>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#94a3b8" }}>🔍</span>
                <input placeholder="Search name…" style={{
                  width: "100%", height: 34, paddingLeft: 26, paddingRight: 9,
                  borderRadius: 9, border: "1.5px solid #e2e8f0",
                  background: "#fafbff", fontSize: 11, color: NAVY, outline: "none",
                }} />
              </div>
              {/* Frequent chips */}
              <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                {["Ramesh Kumar", "Sita Devi", "Mohan Patel"].map((name, i) => (
                  <button key={i} style={{
                    padding: "3px 8px", borderRadius: 9,
                    border: `1px solid ${i === 0 ? NAVY : "rgba(11,44,96,0.15)"}`,
                    background: i === 0 ? NAVY : "transparent",
                    color: i === 0 ? "#fff" : NAVY,
                    fontSize: 9, fontWeight: 700, cursor: "pointer",
                  }}>{name.split(" ")[0]}</button>
                ))}
              </div>
            </div>

            {/* Service type */}
            <div>
              <p style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>Service Type</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {Object.keys(SVC_COLOR).map(s => {
                  const c = svcColor(s);
                  const active = activeSvc === s;
                  return (
                    <button key={s} onClick={() => setActiveSvc(active ? "" : s)} style={{
                      textAlign: "left", padding: "6px 10px", borderRadius: 8,
                      border: `1px solid ${active ? c + "50" : "transparent"}`,
                      background: active ? c + "14" : "rgba(11,44,96,0.02)",
                      color: active ? c : "#475569",
                      fontSize: 11, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, flexShrink: 0 }} />
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom actions */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(11,44,96,0.07)", display: "flex", flexDirection: "column", gap: 7 }}>
            <button style={{
              height: 36, borderRadius: 9,
              border: "1.5px solid rgba(11,44,96,0.15)", background: "#fff",
              color: NAVY, fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              ⬇ Export Excel
            </button>
            <button style={{
              height: 36, borderRadius: 9,
              border: "1.5px solid rgba(225,29,72,0.18)", background: "rgba(225,29,72,0.04)",
              color: RED, fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              🗑 Delete All
            </button>
          </div>
        </div>

        {/* ── MAIN PANEL ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

          {/* Tab strip + count bar */}
          <div style={{
            height: 50, background: "#fff",
            borderBottom: "1px solid rgba(11,44,96,0.07)",
            display: "flex", alignItems: "center",
            paddingInline: 20, gap: 14, flexShrink: 0,
            boxShadow: "0 1px 4px rgba(11,44,96,0.04)",
          }}>
            {/* Tabs */}
            <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 3, gap: 2 }}>
              {[
                { id: "tx",   label: "📄 Transactions" },
                { id: "rcpt", label: "🧾 Receipts"     },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
                  height: 30, paddingInline: 16, borderRadius: 8, border: "none",
                  background: activeTab === tab.id ? "#fff" : "transparent",
                  color: activeTab === tab.id ? NAVY : "#64748b",
                  fontWeight: activeTab === tab.id ? 800 : 600,
                  fontSize: 12, cursor: "pointer",
                  boxShadow: activeTab === tab.id ? "0 1px 6px rgba(11,44,96,0.10)" : "none",
                }}>{tab.label}</button>
              ))}
            </div>

            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
              {activeTab === "tx" ? "8 entries · Page 1 of 1" : "5 receipts found"}
            </p>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, color: SAFFRON,
                background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)",
                borderRadius: 20, padding: "3px 12px",
              }}>Filtered</span>
            </div>
          </div>

          {/* ── Inline quick-add strip ── */}
          <div style={{
            background: "rgba(249,115,22,0.04)",
            borderBottom: "2px solid rgba(249,115,22,0.14)",
            padding: "8px 16px",
            display: "flex", gap: 7, alignItems: "center",
            flexShrink: 0,
          }}>
            {/* Orange + badge */}
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: `linear-gradient(135deg,${SAFFRON},#fb923c)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, boxShadow: "0 2px 8px rgba(249,115,22,0.38)",
            }}>
              <span style={{ color: "#fff", fontSize: 17, fontWeight: 900, lineHeight: 1 }}>+</span>
            </div>
            <input type="date" defaultValue="2026-07-04" style={{
              height: 34, paddingInline: 9, borderRadius: 8,
              border: "1.5px solid rgba(249,115,22,0.3)", background: "#fff",
              fontSize: 11, color: NAVY, outline: "none",
              fontFamily: "monospace", fontWeight: 600, width: 136,
            }} />
            <input placeholder="Customer name *" style={{
              height: 34, paddingInline: 9, borderRadius: 8,
              border: "1.5px solid rgba(249,115,22,0.3)", background: "#fff",
              fontSize: 12, color: NAVY, outline: "none", flex: 1, fontWeight: 600,
            }} />
            <select style={{
              height: 34, paddingInline: 8, borderRadius: 8,
              border: "1.5px solid rgba(249,115,22,0.3)", background: "#fff",
              fontSize: 11, color: "#94a3b8", outline: "none", width: 154,
            }}>
              <option value="">Service type *</option>
              {Object.keys(SVC_COLOR).map(s => <option key={s}>{s}</option>)}
            </select>
            {/* Cr / Dr toggle */}
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1.5px solid #e2e8f0", flexShrink: 0 }}>
              <button onClick={() => setCrDr("credit")} style={{
                height: 34, paddingInline: 12,
                border: "none", borderRight: "1px solid #e2e8f0",
                background: crDr === "credit" ? "rgba(5,150,105,0.10)" : "#fff",
                color: crDr === "credit" ? GREEN : "#94a3b8",
                fontSize: 11, fontWeight: 900, cursor: "pointer",
              }}>Cr</button>
              <button onClick={() => setCrDr("debit")} style={{
                height: 34, paddingInline: 12,
                border: "none",
                background: crDr === "debit" ? "rgba(225,29,72,0.08)" : "#fff",
                color: crDr === "debit" ? RED : "#94a3b8",
                fontSize: 11, fontWeight: 900, cursor: "pointer",
              }}>Dr</button>
            </div>
            <input type="number" placeholder="Amount *" style={{
              height: 34, paddingInline: 9, borderRadius: 8,
              border: "1.5px solid rgba(249,115,22,0.3)", background: "#fff",
              fontSize: 13, color: NAVY, outline: "none",
              width: 110, textAlign: "right", fontWeight: 800,
            }} />
            <input placeholder="Note…" style={{
              height: 34, paddingInline: 9, borderRadius: 8,
              border: "1.5px solid #e2e8f0", background: "#fff",
              fontSize: 11, color: "#64748b", outline: "none", width: 116,
            }} />
            <button style={{
              height: 34, paddingInline: 16, borderRadius: 8, border: "none",
              background: `linear-gradient(135deg,${SAFFRON},#fb923c)`, color: "#fff",
              fontSize: 12, fontWeight: 900, cursor: "pointer", flexShrink: 0,
              boxShadow: "0 2px 10px rgba(249,115,22,0.38)", letterSpacing: "0.03em",
            }}>Add →</button>
          </div>

          {/* ── Table ── */}
          <div style={{ flex: 1, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", position: "sticky", top: 0, zIndex: 2 }}>
                  {[
                    { label: "#",          w: 42              },
                    { label: "Receipt",    w: 128             },
                    { label: "Date",       w: 88              },
                    { label: "Customer",   w: undefined       },
                    { label: "Service",    w: 154             },
                    { label: "Credit",     w: 112, right: true },
                    { label: "Debit",      w: 112, right: true },
                    { label: "Balance",    w: 122, right: true },
                    { label: "Note",       w: 112             },
                    { label: "",           w: 80              },
                  ].map((col, i) => (
                    <th key={i} style={{
                      padding: "11px 14px",
                      textAlign: col.right ? "right" : "left",
                      fontSize: 9, fontWeight: 800, color: "#94a3b8",
                      textTransform: "uppercase", letterSpacing: "0.09em",
                      whiteSpace: "nowrap", width: col.w,
                      borderBottom: "2px solid #e8edf4",
                      background: "#f8fafc",
                    }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ENTRIES.map((entry, idx) => {
                  const isCr   = entry.credit > 0;
                  const accent = isCr ? GREEN : RED;
                  return (
                    <tr key={entry.id} style={{
                      background: idx % 2 === 0 ? "#fff" : "#fafbfd",
                      borderBottom: "1px solid #f0f4f8",
                      // Left-edge accent via box-shadow trick on first cell
                    }}>
                      {/* Row number with left-edge accent */}
                      <td style={{
                        padding: "0 0 0 0", width: 42,
                        borderLeft: `3px solid ${accent}`,
                        paddingLeft: 12, paddingRight: 6,
                      }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#d1d5db" }}>{idx + 1}</span>
                      </td>

                      {/* Receipt */}
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                        <code style={{
                          fontSize: 10, fontWeight: 800, color: SAFFRON,
                          background: "rgba(249,115,22,0.07)", padding: "3px 7px",
                          borderRadius: 6, border: "1px solid rgba(249,115,22,0.14)",
                        }}>{entry.rcpt}</code>
                      </td>

                      {/* Date */}
                      <td style={{ padding: "13px 14px", fontSize: 11, fontWeight: 600, color: "#64748b", whiteSpace: "nowrap", fontFamily: "monospace" }}>
                        {entry.date}
                      </td>

                      {/* Customer */}
                      <td style={{ padding: "13px 14px" }}>
                        <CustCell name={entry.customer} />
                      </td>

                      {/* Service */}
                      <td style={{ padding: "13px 14px" }}>
                        <SvcBadge name={entry.service} />
                      </td>

                      {/* Credit */}
                      <td style={{ padding: "13px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        {entry.credit > 0
                          ? <span style={{ fontSize: 13, fontWeight: 800, color: GREEN, fontVariantNumeric: "tabular-nums" }}>+{INR(entry.credit)}</span>
                          : <span style={{ color: "#e2e8f0", fontSize: 13 }}>—</span>
                        }
                      </td>

                      {/* Debit */}
                      <td style={{ padding: "13px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        {entry.debit > 0
                          ? <span style={{ fontSize: 13, fontWeight: 800, color: RED, fontVariantNumeric: "tabular-nums" }}>−{INR(entry.debit)}</span>
                          : <span style={{ color: "#e2e8f0", fontSize: 13 }}>—</span>
                        }
                      </td>

                      {/* Running balance */}
                      <td style={{ padding: "13px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 13, fontWeight: 900, color: NAVY, fontVariantNumeric: "tabular-nums" }}>{INR(entry.balance)}</span>
                      </td>

                      {/* Note */}
                      <td style={{ padding: "13px 14px" }}>
                        {entry.note
                          ? <span style={{ fontSize: 10, color: "#64748b", background: "#f1f5f9", padding: "2px 7px", borderRadius: 5, fontStyle: "italic" }}>{entry.note}</span>
                          : <span style={{ color: "#e2e8f0", fontSize: 12 }}>—</span>
                        }
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "13px 8px" }}>
                        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                          <button style={{
                            width: 30, height: 30, borderRadius: 8,
                            border: "1.5px solid #e2e8f0", background: "#fff",
                            color: "#64748b", fontSize: 12, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }} title="Edit">✏️</button>
                          <button style={{
                            width: 30, height: 30, borderRadius: 8,
                            border: "1.5px solid rgba(225,29,72,0.15)",
                            background: "rgba(225,29,72,0.04)",
                            color: RED, fontSize: 12, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }} title="Delete">🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Footer / totals + pagination ── */}
          <div style={{
            height: 52, background: "#fff",
            borderTop: "2px solid #e8edf4",
            display: "flex", alignItems: "center",
            paddingInline: 20, flexShrink: 0,
            boxShadow: "0 -1px 6px rgba(11,44,96,0.04)",
          }}>
            {/* Page totals summary */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 20 }}>
              <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
                Showing <b style={{ color: NAVY }}>8</b> of 8 entries
              </p>
              <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: GREEN,
                  background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.18)",
                  borderRadius: 20, padding: "3px 10px",
                }}>+{INR(pageCr)}</span>
                <span style={{ color: "#d1d5db", fontSize: 14 }}>·</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: RED,
                  background: "rgba(225,29,72,0.07)", border: "1px solid rgba(225,29,72,0.18)",
                  borderRadius: 20, padding: "3px 10px",
                }}>−{INR(pageDr)}</span>
                <span style={{ color: "#d1d5db", fontSize: 14 }}>·</span>
                <span style={{
                  fontSize: 11, fontWeight: 800, color: pageNet >= 0 ? GREEN : RED,
                  background: pageNet >= 0 ? "rgba(5,150,105,0.06)" : "rgba(225,29,72,0.06)",
                  border: `1px solid ${pageNet >= 0 ? "rgba(5,150,105,0.18)" : "rgba(225,29,72,0.18)"}`,
                  borderRadius: 20, padding: "3px 10px",
                }}>Net {pageNet >= 0 ? "+" : ""}{INR(pageNet)}</span>
              </div>
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <button style={{
                height: 32, paddingInline: 12, borderRadius: 8,
                border: "1.5px solid #e2e8f0", background: "#fff",
                color: "#94a3b8", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>‹ Prev</button>
              <button style={{
                width: 34, height: 32, borderRadius: 8,
                border: "none", background: NAVY,
                color: "#fff", fontSize: 12, fontWeight: 900, cursor: "pointer",
              }}>1</button>
              <button style={{
                height: 32, paddingInline: 12, borderRadius: 8,
                border: "1.5px solid #e2e8f0", background: "#fff",
                color: "#94a3b8", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>Next ›</button>
            </div>
          </div>

        </div>{/* end MAIN PANEL */}
      </div>{/* end BODY ROW */}
    </div>
  );
}
