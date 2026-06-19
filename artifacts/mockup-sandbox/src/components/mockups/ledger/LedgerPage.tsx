import { useState } from "react";
import { Search, Plus, Filter, ArrowUpRight, ArrowDownLeft, Receipt, Download, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const NAVY = "#0b2c60";
const SAFFRON = "#f97316";
const GREEN = "#059669";
const RED = "#e11d48";

const entries = [
  { id: 1, date: "2026-06-19", customer: "Ramesh Kumar", service: "Aadhar Update", credit: 150, debit: 0, balance: 4850, note: "" },
  { id: 2, date: "2026-06-19", customer: "Sunita Devi", service: "PAN Card", credit: 0, debit: 200, balance: 4650, note: "Urgent" },
  { id: 3, date: "2026-06-18", customer: "Mohan Sahu", service: "Income Certificate", credit: 300, debit: 0, balance: 4950, note: "" },
  { id: 4, date: "2026-06-18", customer: "Poonam Yadav", service: "Voter ID", credit: 120, debit: 0, balance: 5070, note: "" },
  { id: 5, date: "2026-06-17", customer: "Dilip Nayak", service: "Ration Card", credit: 0, debit: 500, balance: 4570, note: "Partial" },
  { id: 6, date: "2026-06-17", customer: "Geeta Mishra", service: "Passport", credit: 800, debit: 0, balance: 5370, note: "" },
  { id: 7, date: "2026-06-16", customer: "Arun Tiwari", service: "Driving Licence", credit: 250, debit: 0, balance: 5620, note: "" },
];

function groupByDate(entries: typeof ENTRIES) {
  const groups: Record<string, typeof ENTRIES> = {};
  entries.forEach(e => {
    if (!groups[e.date]) groups[e.date] = [];
    groups[e.date].push(e);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

const ENTRIES = entries;

function fmtDate(d: string) {
  const date = new Date(d + "T00:00:00");
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (d === today) return "Today";
  if (d === yesterday) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function LedgerPage() {
  const [search, setSearch] = useState("");
  const filtered = ENTRIES.filter(e =>
    e.customer.toLowerCase().includes(search.toLowerCase()) ||
    e.service.toLowerCase().includes(search.toLowerCase())
  );
  const grouped = groupByDate(filtered);
  const totalBalance = 4850;
  const totalCredits = 1620;
  const totalDebits = 700;

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh", maxWidth: 390, margin: "0 auto", position: "relative", overflowX: "hidden" }}>

      {/* Hero Header */}
      <div style={{ background: `linear-gradient(145deg, ${NAVY} 0%, #1a4a9e 100%)`, padding: "20px 20px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(249,115,22,0.12)" }} />
        <div style={{ position: "absolute", bottom: -20, left: 20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, position: "relative" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Ledger</p>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 900, lineHeight: 1.1, marginTop: 2 }}>Transaction Book</h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Download size={16} color="#fff" />
            </button>
            <button style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(249,115,22,0.25)", border: "1px solid rgba(249,115,22,0.4)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Trash2 size={16} color={SAFFRON} />
            </button>
          </div>
        </div>

        {/* Balance + stats */}
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.12)", position: "relative" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Current Balance</p>
          <p style={{ color: "#fff", fontSize: 30, fontWeight: 900, lineHeight: 1, marginBottom: 12 }}>
            ₹{totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ background: "rgba(16,185,129,0.15)", borderRadius: 10, padding: "8px 10px", border: "1px solid rgba(16,185,129,0.25)" }}>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Credits</p>
              <p style={{ color: "#34d399", fontSize: 16, fontWeight: 900, marginTop: 2 }}>
                +₹{totalCredits.toLocaleString("en-IN")}
              </p>
            </div>
            <div style={{ background: "rgba(244,63,94,0.15)", borderRadius: 10, padding: "8px 10px", border: "1px solid rgba(244,63,94,0.25)" }}>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Debits</p>
              <p style={{ color: "#fb7185", fontSize: 16, fontWeight: 900, marginTop: 2 }}>
                −₹{totalDebits.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + filter bar */}
      <div style={{ padding: "14px 16px 8px", background: "#f8fafc" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={14} color="#94a3b8" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customer or service…"
              style={{ width: "100%", height: 40, paddingLeft: 34, paddingRight: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 13, color: "#0b2c60", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <button style={{ width: 40, height: 40, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <Filter size={15} color="#64748b" />
          </button>
        </div>
      </div>

      {/* Transaction list */}
      <div style={{ padding: "4px 16px 100px" }}>
        {grouped.map(([date, txns]) => (
          <div key={date} style={{ marginBottom: 4 }}>
            {/* Date group header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0 6px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>{fmtDate(date)}</p>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>

            {txns.map((e, i) => {
              const isCredit = e.credit > 0;
              const amt = isCredit ? e.credit : e.debit;
              const color = isCredit ? GREEN : RED;
              const bg = isCredit ? "rgba(5,150,105,0.07)" : "rgba(225,29,72,0.07)";
              return (
                <div key={e.id} style={{
                  background: "#fff",
                  borderRadius: 14,
                  marginBottom: 8,
                  overflow: "hidden",
                  boxShadow: "0 1px 8px rgba(11,44,96,0.07), 0 1px 2px rgba(0,0,0,0.04)",
                  display: "flex",
                  border: "1px solid #f1f5f9",
                }}>
                  {/* Left accent stripe */}
                  <div style={{ width: 4, background: color, flexShrink: 0 }} />

                  <div style={{ flex: 1, padding: "11px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isCredit
                        ? <ArrowDownLeft size={17} color={color} strokeWidth={2.5} />
                        : <ArrowUpRight size={17} color={color} strokeWidth={2.5} />}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: NAVY, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.customer}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{e.service}</p>
                    </div>

                    {/* Amount + balance */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 900, color, lineHeight: 1 }}>
                        {isCredit ? "+" : "−"}₹{amt.toLocaleString("en-IN")}
                      </p>
                      <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>Bal ₹{e.balance.toLocaleString("en-IN")}</p>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", marginTop: 4 }}>
                        <button style={{ width: 22, height: 22, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Receipt size={11} color="#64748b" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Pagination */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 8 }}>
          <button style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronLeft size={16} color="#64748b" />
          </button>
          <span style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>Page 1 of 3</span>
          <button style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #e2e8f0", background: NAVY, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronRight size={16} color="#fff" />
          </button>
        </div>
      </div>

      {/* FAB */}
      <button style={{
        position: "fixed", bottom: 24, right: 24,
        width: 56, height: 56, borderRadius: 18,
        background: `linear-gradient(135deg, ${SAFFRON}, #fb923c)`,
        boxShadow: "0 8px 24px rgba(249,115,22,0.45)",
        border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
      }}>
        <Plus size={24} color="#fff" strokeWidth={2.5} />
      </button>
    </div>
  );
}
