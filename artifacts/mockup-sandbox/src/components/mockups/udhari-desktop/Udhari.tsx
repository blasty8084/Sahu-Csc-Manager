import { useState } from "react";
import {
  BookOpen, LayoutDashboard, Fingerprint, Users, BarChart2, Settings,
  Plus, Search, Phone, ChevronRight, ArrowUpRight, ArrowDownLeft,
  Trash2, Pencil, Bell, LogOut, MessageCircle, FileDown, MoreHorizontal,
  Receipt, SortAsc,
} from "lucide-react";

function fmt(n: number) {
  return `₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: BookOpen, label: "Ledger" },
  { icon: Fingerprint, label: "AePS Cash" },
  { icon: BookOpen, label: "Udhari Khata", active: true },
  { icon: BarChart2, label: "Reports" },
  { icon: Users, label: "Users" },
  { icon: Settings, label: "Settings" },
];

type Customer = { id: number; name: string; mobile: string; balance: number; lastActivity: string; entries: number; address?: string; };
type Entry = { id: number; customerId: number; date: string; type: "gave" | "got"; amount: number; note: string | null; balance: number; };

const CUSTOMERS: Customer[] = [
  { id: 1, name: "Ramesh Kumar Sahu", mobile: "9861234567", balance: 1500, lastActivity: "2026-06-20", entries: 8, address: "Bargarh, Odisha" },
  { id: 2, name: "Sunita Devi Panda", mobile: "9437891234", balance: -800, lastActivity: "2026-06-19", entries: 5, address: "Nuapada" },
  { id: 3, name: "Manoj Mohanty", mobile: "7978123456", balance: 3200, lastActivity: "2026-06-18", entries: 12, address: "Sambalpur" },
  { id: 4, name: "Lalita Nayak", mobile: "8917654321", balance: 0, lastActivity: "2026-06-17", entries: 3 },
  { id: 5, name: "Bijay Rath", mobile: "9090123456", balance: -2400, lastActivity: "2026-06-15", entries: 7, address: "Bolangir" },
  { id: 6, name: "Priya Sahoo", mobile: "9861099876", balance: 600, lastActivity: "2026-06-14", entries: 4 },
  { id: 7, name: "Deepak Das", mobile: "", balance: 950, lastActivity: "2026-06-12", entries: 2, address: "Titlagarh" },
];

const ENTRIES: Entry[] = [
  { id: 1, customerId: 1, date: "2026-06-20", type: "gave", amount: 500, note: "Grocery advance", balance: 1500 },
  { id: 2, customerId: 1, date: "2026-06-18", type: "got", amount: 200, note: "Partial payment", balance: 1000 },
  { id: 3, customerId: 1, date: "2026-06-15", type: "gave", amount: 1200, note: "Festival loan", balance: 1200 },
  { id: 4, customerId: 1, date: "2026-06-10", type: "got", amount: 500, note: null, balance: 0 },
  { id: 5, customerId: 1, date: "2026-06-05", type: "gave", amount: 500, note: "Medicine", balance: 500 },
];

const SUMMARY = {
  toCollect: CUSTOMERS.filter(c => c.balance > 0).reduce((s, c) => s + c.balance, 0),
  toPay: Math.abs(CUSTOMERS.filter(c => c.balance < 0).reduce((s, c) => s + c.balance, 0)),
};

function BalancePill({ balance }: { balance: number }) {
  if (balance > 0) return <span style={{ fontSize: 11, fontWeight: 700, color: "#ea580c", background: "rgba(249,115,22,0.10)", padding: "3px 8px", borderRadius: 6 }}>To Collect {fmt(balance)}</span>;
  if (balance < 0) return <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "rgba(16,185,129,0.10)", padding: "3px 8px", borderRadius: 6 }}>To Pay {fmt(balance)}</span>;
  return <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", background: "#f1f5f9", padding: "3px 8px", borderRadius: 6 }}>Settled ₹0</span>;
}

export function Udhari() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("recent");
  const [selected, setSelected] = useState<Customer | null>(CUSTOMERS[0]);

  const filtered = CUSTOMERS.filter(c =>
    !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.mobile.includes(q)
  ).sort((a, b) => {
    if (sort === "balance_desc") return Math.abs(b.balance) - Math.abs(a.balance);
    if (sort === "alpha") return a.name.localeCompare(b.name);
    return 0;
  });

  const customerEntries = selected ? ENTRIES.filter(e => e.customerId === selected.id) : [];

  return (
    <div className="flex h-screen bg-slate-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside className="flex flex-col w-60 shrink-0 bg-white border-r border-slate-100 h-full"
        style={{ boxShadow: "2px 0 20px rgba(11,44,96,0.05)" }}>
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(11,44,96,0.30)" }}>
              <span style={{ color: "#f97316", fontWeight: 900, fontSize: 13 }}>SC</span>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 900, color: "#0b2c60", lineHeight: 1.1 }}>SAHU</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#f97316", letterSpacing: "0.08em" }}>CSC</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ icon: Icon, label, active }) => (
            <button key={label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left"
              style={{ background: active ? "linear-gradient(135deg,#0b2c60,#1a4a9e)" : "transparent", color: active ? "#fff" : "#64748b" }}>
              <Icon size={16} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: active ? 700 : 500 }}>{label}</span>
              {active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: 3, background: "#f97316" }} />}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#ea580c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff" }}>OP</div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 12, fontWeight: 700, color: "#0b2c60" }}>Operator</p>
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
          <div className="flex items-center gap-3">
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={18} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: "#0b2c60" }}>Udhari Khata</h1>
              <p style={{ fontSize: 11, color: "#94a3b8" }}>Customer Credit Ledger · {CUSTOMERS.length} customers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ color: "#64748b", border: "1px solid #e2e8f0" }}><Bell size={16} /></button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", boxShadow: "0 3px 12px rgba(11,44,96,0.3)" }}>
              <Plus size={15} /> Add Customer
            </button>
          </div>
        </header>

        {/* Summary strip */}
        <div className="flex gap-4 px-7 py-4 bg-white border-b border-slate-100 flex-shrink-0">
          <div className="flex-1 rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.10)", border: "1px solid rgba(249,115,22,0.15)" }}>
            <div style={{ height: 3, background: "linear-gradient(90deg,#f97316,#fb923c)" }} />
            <div className="px-5 py-3 flex items-center justify-between">
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total To Collect</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: "#ea580c", marginTop: 2 }}>{fmt(SUMMARY.toCollect)}</p>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#f97316,#ea580c)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(249,115,22,0.30)" }}>
                <ArrowUpRight size={18} color="#fff" />
              </div>
            </div>
          </div>
          <div className="flex-1 rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 8px rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <div style={{ height: 3, background: "linear-gradient(90deg,#10b981,#34d399)" }} />
            <div className="px-5 py-3 flex items-center justify-between">
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total To Pay</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: "#059669", marginTop: 2 }}>{fmt(SUMMARY.toPay)}</p>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(16,185,129,0.30)" }}>
                <ArrowDownLeft size={18} color="#fff" />
              </div>
            </div>
          </div>
          <div className="flex-1 rounded-xl" style={{ boxShadow: "0 1px 8px rgba(11,44,96,0.06)", border: "1px solid rgba(11,44,96,0.08)", background: "#fff" }}>
            <div style={{ height: 3, background: "linear-gradient(90deg,#8b5cf6,#7c3aed)" }} />
            <div className="px-5 py-3">
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Customers</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#7c3aed", marginTop: 2 }}>{CUSTOMERS.length}</p>
            </div>
          </div>
        </div>

        {/* Two-panel layout */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Customer list panel */}
          <div className="w-80 shrink-0 flex flex-col border-r border-slate-100 bg-white overflow-hidden">
            {/* Search + sort */}
            <div className="px-4 py-3 border-b border-slate-100 flex gap-2 flex-shrink-0">
              <div className="relative flex-1">
                <Search size={12} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"
                  style={{ width: "100%", height: 32, paddingLeft: 26, paddingRight: 8, borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 12, outline: "none", color: "#0b2c60", boxSizing: "border-box" }} />
              </div>
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ height: 32, paddingLeft: 8, paddingRight: 8, borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 11, outline: "none", color: "#0b2c60" }}>
                <option value="recent">Recent</option>
                <option value="balance_desc">Balance ↓</option>
                <option value="alpha">A → Z</option>
              </select>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filtered.map(c => {
                const color = c.balance > 0 ? "#ea580c" : c.balance < 0 ? "#059669" : "#94a3b8";
                const bg = c.balance > 0 ? "rgba(249,115,22,0.08)" : c.balance < 0 ? "rgba(16,185,129,0.08)" : "rgba(148,163,184,0.08)";
                const initials = c.name.slice(0, 2).toUpperCase();
                const isSelected = selected?.id === c.id;
                return (
                  <button key={c.id} onClick={() => setSelected(c)}
                    className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-slate-50"
                    style={{ borderBottom: "1px solid #f8fafc", background: isSelected ? "#f0f4ff" : undefined }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: isSelected ? "linear-gradient(135deg,#0b2c60,#1a4a9e)" : bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 900, color: isSelected ? "#fff" : color }}>{initials}</div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "#0b2c60" : "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                      <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{c.mobile || "No phone"}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <BalancePill balance={c.balance} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer detail panel */}
          {selected ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Customer header */}
              <div className="bg-white border-b border-slate-100 px-7 py-5 flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {(() => {
                      const color = selected.balance > 0 ? "#ea580c" : selected.balance < 0 ? "#059669" : "#94a3b8";
                      const bg = selected.balance > 0 ? "rgba(249,115,22,0.10)" : selected.balance < 0 ? "rgba(16,185,129,0.10)" : "rgba(148,163,184,0.10)";
                      return (
                        <div style={{ width: 52, height: 52, borderRadius: 16, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color }}>
                          {selected.name.slice(0, 2).toUpperCase()}
                        </div>
                      );
                    })()}
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0b2c60" }}>{selected.name}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        {selected.mobile && <span style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} />{selected.mobile}</span>}
                        {selected.address && <span style={{ fontSize: 12, color: "#94a3b8" }}>{selected.address}</span>}
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{selected.entries} entries</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ border: "1px solid #e2e8f0", color: "#059669" }}>
                      <MessageCircle size={13} /> WhatsApp
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ border: "1px solid #e2e8f0", color: "#64748b" }}>
                      <FileDown size={13} /> Export PDF
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ border: "1px solid #e2e8f0", color: "#64748b" }}>
                      <Pencil size={13} /> Edit
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ border: "1px solid #fecdd3", color: "#e11d48" }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>

                {/* Balance banner */}
                <div className="mt-4 rounded-2xl px-6 py-4 text-center"
                  style={{
                    background: selected.balance > 0 ? "linear-gradient(135deg,#fff7ed,#fed7aa)" : selected.balance < 0 ? "linear-gradient(135deg,#f0fdf4,#bbf7d0)" : "#f8fafc",
                    boxShadow: `0 2px 14px ${selected.balance > 0 ? "rgba(249,115,22,0.12)" : selected.balance < 0 ? "rgba(16,185,129,0.12)" : "rgba(0,0,0,0.04)"}`,
                  }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: selected.balance > 0 ? "#ea580c99" : selected.balance < 0 ? "#05966999" : "#94a3b8", marginBottom: 4 }}>
                    {selected.balance > 0 ? "To Collect" : selected.balance < 0 ? "To Pay" : "Settled"}
                  </p>
                  <p style={{ fontSize: 32, fontWeight: 900, color: selected.balance > 0 ? "#ea580c" : selected.balance < 0 ? "#059669" : "#64748b", lineHeight: 1 }}>
                    {fmt(selected.balance)}
                  </p>
                </div>

                {/* Add entry buttons */}
                <div className="flex gap-3 mt-4">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white"
                    style={{ background: "linear-gradient(135deg,#f43f5e,#e11d48)", boxShadow: "0 3px 12px rgba(244,63,94,0.28)" }}>
                    <ArrowUpRight size={15} /> You Gave (Diya)
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white"
                    style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 3px 12px rgba(16,185,129,0.28)" }}>
                    <ArrowDownLeft size={15} /> You Got (Liya)
                  </button>
                </div>
              </div>

              {/* Entries list */}
              <div className="flex-1 overflow-y-auto px-7 py-5">
                <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  Transaction History · {customerEntries.length} entries
                </p>
                <div className="space-y-2">
                  {customerEntries.map((entry, idx) => {
                    const isGave = entry.type === "gave";
                    const ec = isGave ? "#e11d48" : "#059669";
                    const bg = isGave ? "rgba(244,63,94,0.06)" : "rgba(16,185,129,0.06)";
                    return (
                      <div key={entry.id}
                        className="bg-white rounded-2xl flex items-center gap-4 px-5 py-3.5 hover:shadow-md transition-shadow"
                        style={{ boxShadow: "0 1px 8px rgba(11,44,96,0.06)", border: "1px solid rgba(11,44,96,0.05)" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 2px 8px ${ec}22` }}>
                          {isGave ? <ArrowUpRight size={16} color={ec} /> : <ArrowDownLeft size={16} color={ec} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: 11, fontWeight: 700, color: ec, background: isGave ? "rgba(244,63,94,0.08)" : "rgba(16,185,129,0.08)", padding: "2px 7px", borderRadius: 5 }}>
                              {isGave ? "You Gave" : "You Got"}
                            </span>
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>
                              {new Date(entry.date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                          </div>
                          {entry.note && <p style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{entry.note}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p style={{ fontSize: 15, fontWeight: 900, color: ec }}>{isGave ? "+" : "−"}{fmt(entry.amount)}</p>
                          <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>Balance {fmt(entry.balance)}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100" style={{ color: "#94a3b8" }}><Pencil size={12} /></button>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50" style={{ color: "#e11d48" }}><Trash2 size={12} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <BookOpen size={48} style={{ color: "#cbd5e1", margin: "0 auto 12px" }} />
                <p style={{ fontSize: 15, fontWeight: 700, color: "#94a3b8" }}>Select a customer</p>
                <p style={{ fontSize: 12, color: "#cbd5e1", marginTop: 4 }}>Click any customer from the list to view their ledger</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
