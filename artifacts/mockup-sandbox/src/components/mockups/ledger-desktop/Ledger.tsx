import { useState } from "react";
import {
  BookOpen, LayoutDashboard, Fingerprint, Users, BarChart2, Settings,
  Plus, Download, Trash2, Search, Filter, X, ChevronLeft, ChevronRight,
  Receipt, Pencil, ArrowDownLeft, ArrowUpRight, IndianRupee, TrendingUp,
  TrendingDown, FileText, Calendar, Bell, LogOut,
} from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2 }).format(n);
}

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: BookOpen, label: "Ledger", active: true },
  { icon: Fingerprint, label: "AePS Cash" },
  { icon: BookOpen, label: "Udhari Khata" },
  { icon: BarChart2, label: "Reports" },
  { icon: Users, label: "Users" },
  { icon: Settings, label: "Settings" },
];

const SERVICES = ["PAN Card", "Aadhaar Update", "Money Transfer", "Insurance", "Recharge", "Water Bill", "Gas Bill", "Railway Booking"];

type Entry = {
  id: number; date: string; receiptNo: string; customerName: string;
  serviceType: string; credit: number; debit: number; balance: number; description: string;
};

const TODAY = new Date().toISOString().split("T")[0];
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split("T")[0];

const ENTRIES: Entry[] = [
  { id: 1, date: TODAY, receiptNo: "CSC-2026-0042", customerName: "Ramesh Kumar Sahu", serviceType: "PAN Card", credit: 150, debit: 0, balance: 12450, description: "PAN correction form" },
  { id: 2, date: TODAY, receiptNo: "CSC-2026-0041", customerName: "Sunita Devi Panda", serviceType: "Money Transfer", credit: 25, debit: 0, balance: 12300, description: "NEFT ₹5000 to SBI" },
  { id: 3, date: TODAY, receiptNo: "CSC-2026-0040", customerName: "Manoj Mohanty", serviceType: "Aadhaar Update", credit: 0, debit: 50, balance: 12275, description: "Address update fee paid" },
  { id: 4, date: TODAY, receiptNo: "CSC-2026-0039", customerName: "Lalita Nayak", serviceType: "Insurance", credit: 500, debit: 0, balance: 12325, description: "LIC premium collection" },
  { id: 5, date: TODAY, receiptNo: "CSC-2026-0038", customerName: "Bijay Rath", serviceType: "Recharge", credit: 20, debit: 0, balance: 11825, description: "Jio ₹299 plan" },
  { id: 6, date: YESTERDAY, receiptNo: "CSC-2026-0037", customerName: "Priya Behera", serviceType: "Water Bill", credit: 15, debit: 0, balance: 11805, description: "OWSSB bill payment" },
  { id: 7, date: YESTERDAY, receiptNo: "CSC-2026-0036", customerName: "Deepak Das", serviceType: "Railway Booking", credit: 40, debit: 0, balance: 11790, description: "HWH-BBS sleeper class" },
  { id: 8, date: YESTERDAY, receiptNo: "CSC-2026-0035", customerName: "Anita Sahoo", serviceType: "Gas Bill", credit: 0, debit: 200, balance: 11750, description: "HP Gas cylinder charge" },
];

function StatCard({ label, value, sub, accent, color, icon: Icon }: {
  label: string; value: string; sub: string; accent: string; color: string; icon: React.ElementType;
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden flex-1"
      style={{ boxShadow: "0 1px 12px rgba(11,44,96,0.08)", border: "1px solid rgba(11,44,96,0.06)" }}>
      <div style={{ height: 3, background: accent }} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>₹{value}</p>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>{sub}</p>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: 13, flexShrink: 0,
            background: accent, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 14px ${color}33`,
          }}>
            <Icon size={20} color="#fff" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Ledger() {
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const filtered = ENTRIES.filter(e => {
    if (search && !e.customerName.toLowerCase().includes(search.toLowerCase()) && !e.serviceType.toLowerCase().includes(search.toLowerCase())) return false;
    if (serviceFilter && e.serviceType !== serviceFilter) return false;
    if (startDate && e.date < startDate) return false;
    if (endDate && e.date > endDate) return false;
    return true;
  });

  const totalCredit = ENTRIES.reduce((s, e) => s + e.credit, 0);
  const totalDebit = ENTRIES.reduce((s, e) => s + e.debit, 0);
  const balance = totalCredit - totalDebit + 10000;
  const hasFilters = !!(search || serviceFilter || startDate || endDate);

  return (
    <div className="flex h-screen bg-slate-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside className="flex flex-col w-60 shrink-0 bg-white border-r border-slate-100 h-full"
        style={{ boxShadow: "2px 0 20px rgba(11,44,96,0.05)" }}>
        {/* Brand */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #0b2c60, #1a4a9e)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(11,44,96,0.30)",
            }}>
              <span style={{ color: "#f97316", fontWeight: 900, fontSize: 13 }}>SC</span>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 900, color: "#0b2c60", lineHeight: 1.1 }}>SAHU</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#f97316", letterSpacing: "0.08em" }}>CSC</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ icon: Icon, label, active }) => (
            <button key={label}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left"
              style={{
                background: active ? "linear-gradient(135deg, #0b2c60, #1a4a9e)" : "transparent",
                color: active ? "#fff" : "#64748b",
              }}>
              <Icon size={16} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: active ? 700 : 500 }}>{label}</span>
              {active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: 3, background: "#f97316" }} />}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 900, color: "#fff",
            }}>OP</div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 12, fontWeight: 700, color: "#0b2c60", lineHeight: 1.2 }}>Operator</p>
              <p style={{ fontSize: 10, color: "#94a3b8" }}>operator@sahu.in</p>
            </div>
            <button style={{ color: "#94a3b8" }}><LogOut size={14} /></button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-100 px-7 h-16 flex items-center justify-between flex-shrink-0"
          style={{ boxShadow: "0 1px 8px rgba(11,44,96,0.05)" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: "#0b2c60", lineHeight: 1 }}>Transaction Ledger</h1>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{filtered.length} entries · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-50" style={{ color: "#64748b", border: "1px solid #e2e8f0" }}>
              <Bell size={16} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", boxShadow: "0 3px 12px rgba(11,44,96,0.3)" }}>
              <Plus size={15} /> New Entry
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">
          {/* Stats Row */}
          <div className="flex gap-4">
            <StatCard label="Current Balance" value={fmt(balance)} sub="Running total" accent="linear-gradient(135deg,#0b2c60,#1a4a9e)" color="#0b2c60" icon={IndianRupee} />
            <StatCard label="Total Credits" value={fmt(totalCredit)} sub="+8 this week" accent="linear-gradient(135deg,#10b981,#059669)" color="#059669" icon={TrendingUp} />
            <StatCard label="Total Debits" value={fmt(totalDebit)} sub="-2 this week" accent="linear-gradient(135deg,#f43f5e,#e11d48)" color="#e11d48" icon={TrendingDown} />
            <StatCard label="Transactions" value={String(ENTRIES.length)} sub="This month" accent="linear-gradient(135deg,#8b5cf6,#7c3aed)" color="#7c3aed" icon={FileText} />
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl px-5 py-4 flex flex-wrap items-center gap-3"
            style={{ boxShadow: "0 1px 10px rgba(11,44,96,0.07)", border: "1px solid rgba(11,44,96,0.06)" }}>
            <div className="relative">
              <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer or service…"
                style={{ height: 36, paddingLeft: 32, paddingRight: 12, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", width: 240, color: "#0b2c60" }} />
            </div>
            <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}
              style={{ height: 36, paddingLeft: 12, paddingRight: 28, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", color: "#0b2c60", background: "#fff" }}>
              <option value="">All Services</option>
              {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <Calendar size={13} style={{ color: "#94a3b8" }} />
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                style={{ height: 36, paddingLeft: 10, paddingRight: 10, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", color: "#0b2c60" }} />
              <span style={{ fontSize: 12, color: "#94a3b8" }}>to</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                style={{ height: 36, paddingLeft: 10, paddingRight: 10, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", color: "#0b2c60" }} />
            </div>
            {hasFilters && (
              <button onClick={() => { setSearch(""); setServiceFilter(""); setStartDate(""); setEndDate(""); }}
                className="flex items-center gap-1.5 text-xs font-medium px-3 h-9 rounded-xl hover:bg-slate-50"
                style={{ color: "#e11d48", border: "1.5px solid #fecdd3" }}>
                <X size={12} /> Clear
              </button>
            )}
            <div className="ml-auto flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-xs font-semibold px-4 h-9 rounded-xl"
                style={{ color: "#0b2c60", border: "1.5px solid #e2e8f0", background: "#fff" }}>
                <Download size={13} /> Export Excel
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 1px 12px rgba(11,44,96,0.08)", border: "1px solid rgba(11,44,96,0.06)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #f1f5f9", background: "#fafbff" }}>
                  {["Receipt No", "Date", "Customer", "Service", "Credit", "Debit", "Balance", "Description", ""].map(h => (
                    <th key={h} style={{
                      textAlign: h === "Credit" || h === "Debit" || h === "Balance" ? "right" : "left",
                      padding: "12px 16px", fontSize: 10, fontWeight: 800,
                      color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, idx) => {
                  const isCredit = entry.credit > 0;
                  const ec = isCredit ? "#059669" : "#e11d48";
                  const isToday = entry.date === TODAY;
                  return (
                    <tr key={entry.id}
                      style={{ borderBottom: "1px solid #f8fafc", background: idx % 2 === 0 ? "#fff" : "#fafbff" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f0f4ff")}
                      onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafbff")}>
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        <div className="flex items-center gap-2">
                          <span style={{
                            fontSize: 10, fontWeight: 700, fontFamily: "monospace",
                            color: "#0b2c60", background: "rgba(11,44,96,0.06)",
                            padding: "3px 7px", borderRadius: 6,
                          }}>{entry.receiptNo}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        <div className="flex items-center gap-1.5">
                          {isToday && <span style={{ fontSize: 9, fontWeight: 700, color: "#f97316", background: "rgba(249,115,22,0.10)", padding: "2px 5px", borderRadius: 4 }}>TODAY</span>}
                          <span style={{ fontSize: 12, color: "#64748b" }}>
                            {new Date(entry.date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div className="flex items-center gap-2.5">
                          <div style={{
                            width: 28, height: 28, borderRadius: 8,
                            background: isCredit ? "rgba(5,150,105,0.10)" : "rgba(225,29,72,0.10)",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}>
                            {isCredit ? <ArrowDownLeft size={13} color={ec} /> : <ArrowUpRight size={13} color={ec} />}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#0b2c60", whiteSpace: "nowrap" }}>{entry.customerName}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: "#475569",
                          background: "#f1f5f9", padding: "3px 8px", borderRadius: 6,
                        }}>{entry.serviceType}</span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        {entry.credit > 0
                          ? <span style={{ fontSize: 13, fontWeight: 800, color: "#059669" }}>+₹{fmt(entry.credit)}</span>
                          : <span style={{ color: "#cbd5e1", fontSize: 13 }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        {entry.debit > 0
                          ? <span style={{ fontSize: 13, fontWeight: 800, color: "#e11d48" }}>−₹{fmt(entry.debit)}</span>
                          : <span style={{ color: "#cbd5e1", fontSize: 13 }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60" }}>₹{fmt(entry.balance)}</span>
                      </td>
                      <td style={{ padding: "12px 16px", maxWidth: 180 }}>
                        <span style={{ fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                          {entry.description || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div className="flex items-center gap-1">
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100" style={{ color: "#94a3b8" }}><Receipt size={13} /></button>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100" style={{ color: "#94a3b8" }}><Pencil size={13} /></button>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50" style={{ color: "#e11d48" }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
              <p style={{ fontSize: 12, color: "#94a3b8" }}>Showing {filtered.length} of {ENTRIES.length} entries</p>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100" style={{ color: "#64748b", border: "1px solid #e2e8f0" }}>
                  <ChevronLeft size={14} />
                </button>
                {[1, 2, 3].map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold"
                    style={{
                      background: page === p ? "linear-gradient(135deg,#0b2c60,#1a4a9e)" : "#f8fafc",
                      color: page === p ? "#fff" : "#64748b",
                      border: page === p ? "none" : "1px solid #e2e8f0",
                    }}>{p}</button>
                ))}
                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100" style={{ color: "#64748b", border: "1px solid #e2e8f0" }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
