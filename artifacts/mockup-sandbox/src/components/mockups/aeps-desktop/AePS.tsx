import { useState } from "react";
import {
  BookOpen, LayoutDashboard, Fingerprint, Users, BarChart2, Settings,
  ArrowDownLeft, ArrowUpRight, Wallet, TrendingDown, TrendingUp, IndianRupee,
  CalendarDays, ChevronLeft, ChevronRight, Receipt, Pencil, Trash2,
  Bell, LogOut, Plus, Filter, Search,
} from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2 }).format(n);
}

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: BookOpen, label: "Ledger" },
  { icon: Fingerprint, label: "AePS Cash", active: true },
  { icon: BookOpen, label: "Udhari Khata" },
  { icon: BarChart2, label: "Reports" },
  { icon: Users, label: "Users" },
  { icon: Settings, label: "Settings" },
];

const TODAY = new Date().toISOString().split("T")[0];
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split("T")[0];

type Tx = { id: number; type: "withdrawal" | "deposit"; amount: number; customerName: string; description: string | null; balance: number; time: string; };

const TODAY_TX: Tx[] = [
  { id: 1, type: "withdrawal", amount: 5000, customerName: "Ramesh Kumar Sahu", description: "SBI Bank · Aadhaar Linked", balance: 5000, time: "09:14 AM" },
  { id: 2, type: "withdrawal", amount: 3000, customerName: "Sunita Devi", description: "PNB Bank · Aadhaar Linked", balance: 2000, time: "10:32 AM" },
  { id: 3, type: "deposit", amount: 1500, customerName: "Manoj Sahu", description: null, balance: 3500, time: "11:05 AM" },
  { id: 4, type: "withdrawal", amount: 2000, customerName: "Lalita Panda", description: "BOI · Aadhaar", balance: 1500, time: "12:40 PM" },
  { id: 5, type: "deposit", amount: 500, customerName: "Bijay Nayak", description: null, balance: 2000, time: "01:15 PM" },
];

const ALL_TX = [
  ...TODAY_TX.map(t => ({ ...t, date: TODAY })),
  { id: 6, type: "withdrawal" as const, amount: 4000, customerName: "Priya Mohanty", description: "BOI", balance: 6000, time: "10:20 AM", date: YESTERDAY },
  { id: 7, type: "deposit" as const, amount: 2000, customerName: "Deepak Rath", description: null, balance: 8000, time: "11:45 AM", date: YESTERDAY },
  { id: 8, type: "withdrawal" as const, amount: 6000, customerName: "Anita Sahoo", description: "SBI · Savings", balance: 2000, time: "02:30 PM", date: YESTERDAY },
];

const SESSION = {
  openingBalance: 10000,
  transactions: TODAY_TX,
  get totalWithdrawals() { return this.transactions.filter(t => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0); },
  get totalDeposits() { return this.transactions.filter(t => t.type === "deposit").reduce((s, t) => s + t.amount, 0); },
  get currentBalance() { return this.openingBalance - this.totalWithdrawals + this.totalDeposits; },
};

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
            width: 44, height: 44, borderRadius: 13,
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

type Tab = "daily" | "all";

export function AePS() {
  const [tab, setTab] = useState<Tab>("daily");
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [txSearch, setTxSearch] = useState("");

  const allFiltered = ALL_TX.filter(t =>
    !txSearch || t.customerName.toLowerCase().includes(txSearch.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside className="flex flex-col w-60 shrink-0 bg-white border-r border-slate-100 h-full"
        style={{ boxShadow: "2px 0 20px rgba(11,44,96,0.05)" }}>
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
              <Fingerprint size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: "#0b2c60" }}>AePS Cash Management</h1>
              <p style={{ fontSize: 11, color: "#94a3b8" }}>Aadhaar-enabled Payment System · Daily cash tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ color: "#64748b", border: "1px solid #e2e8f0" }}><Bell size={16} /></button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg,#f43f5e,#e11d48)", boxShadow: "0 3px 12px rgba(244,63,94,0.3)" }}>
              <ArrowDownLeft size={15} /> AePS Withdrawal
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 3px 12px rgba(16,185,129,0.3)" }}>
              <ArrowUpRight size={15} /> AePS Deposit
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">
          {/* Stat cards */}
          <div className="flex gap-4">
            <StatCard label="Opening Balance" value={fmt(SESSION.openingBalance)} sub="Cash loaded today"
              accent="linear-gradient(135deg,#0b2c60,#1a4a9e)" color="#0b2c60" icon={Wallet} />
            <StatCard label="Total Withdrawals" value={fmt(SESSION.totalWithdrawals)} sub={`${TODAY_TX.filter(t => t.type === "withdrawal").length} transactions`}
              accent="linear-gradient(135deg,#f43f5e,#e11d48)" color="#e11d48" icon={TrendingDown} />
            <StatCard label="Total Deposits" value={fmt(SESSION.totalDeposits)} sub={`${TODAY_TX.filter(t => t.type === "deposit").length} transactions`}
              accent="linear-gradient(135deg,#10b981,#059669)" color="#059669" icon={TrendingUp} />
            <StatCard label="Current Balance" value={fmt(SESSION.currentBalance)} sub="Closing cash available"
              accent="linear-gradient(135deg,#0b2c60,#1a4a9e)" color="#059669" icon={IndianRupee} />
          </div>

          {/* Formula bar */}
          <div className="bg-white rounded-2xl px-5 py-3 flex items-center gap-4"
            style={{ boxShadow: "0 1px 8px rgba(11,44,96,0.06)", border: "1px solid rgba(11,44,96,0.06)" }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Balance formula:</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#0b2c60" }}>₹{fmt(SESSION.openingBalance)}</span>
            <span style={{ fontSize: 13, color: "#e11d48", fontWeight: 700 }}>− ₹{fmt(SESSION.totalWithdrawals)}</span>
            <span style={{ fontSize: 13, color: "#059669", fontWeight: 700 }}>+ ₹{fmt(SESSION.totalDeposits)}</span>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>=</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: "#059669" }}>₹{fmt(SESSION.currentBalance)}</span>
            <div className="ml-auto flex items-center gap-3">
              {/* Date nav */}
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-1.5" style={{ border: "1px solid #e2e8f0" }}>
                <button className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white" style={{ color: "#0b2c60" }}><ChevronLeft size={14} /></button>
                <CalendarDays size={13} style={{ color: "#94a3b8" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#0b2c60" }}>
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#f97316", background: "rgba(249,115,22,0.10)", padding: "2px 6px", borderRadius: 5 }}>TODAY</span>
                <button className="w-6 h-6 rounded-lg flex items-center justify-center opacity-30" style={{ color: "#0b2c60" }}><ChevronRight size={14} /></button>
              </div>
              <button style={{ fontSize: 12, fontWeight: 600, color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 10, padding: "6px 14px" }}>
                Edit Opening Balance
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 1px 12px rgba(11,44,96,0.08)", border: "1px solid rgba(11,44,96,0.06)" }}>
            {/* Tab header */}
            <div className="flex items-center border-b border-slate-100 px-2 pt-1">
              {(["daily", "all"] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="flex items-center gap-2 px-5 py-3 text-sm font-semibold"
                  style={{
                    color: tab === t ? "#0b2c60" : "#94a3b8",
                    borderBottom: tab === t ? "2.5px solid #f97316" : "2.5px solid transparent",
                  }}>
                  {t === "daily" ? <><CalendarDays size={14} />Daily Session ({TODAY_TX.length})</> : <><Filter size={14} />All Transactions ({ALL_TX.length})</>}
                </button>
              ))}
              {tab === "all" && (
                <div className="ml-auto mr-4 relative">
                  <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input value={txSearch} onChange={e => setTxSearch(e.target.value)} placeholder="Search customer…"
                    style={{ height: 32, paddingLeft: 28, paddingRight: 10, borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 12, outline: "none", width: 200, color: "#0b2c60" }} />
                </div>
              )}
            </div>

            {/* Opening row */}
            {tab === "daily" && (
              <div className="flex items-center justify-between px-6 py-4" style={{ background: "#fafbff", borderBottom: "1px solid #f1f5f9" }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(11,44,96,0.25)", fontSize: 9, fontWeight: 900, color: "#fff", letterSpacing: "0.06em" }}>OB</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60" }}>Opening Balance</p>
                    <p style={{ fontSize: 11, color: "#94a3b8" }}>Cash loaded from bank at start of day</p>
                  </div>
                </div>
                <p style={{ fontSize: 16, fontWeight: 900, color: "#0b2c60" }}>₹{fmt(SESSION.openingBalance)}</p>
              </div>
            )}

            {/* Transaction table */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #f1f5f9", background: "#fafbff" }}>
                  {["#", "Time / Date", "Customer", "Type", "Amount", "Balance", "Description", ""].map(h => (
                    <th key={h} style={{
                      textAlign: ["Amount", "Balance"].includes(h) ? "right" : "left",
                      padding: "10px 16px", fontSize: 10, fontWeight: 800,
                      color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(tab === "daily" ? SESSION.transactions : allFiltered).map((tx, idx) => {
                  const isWd = tx.type === "withdrawal";
                  const ec = isWd ? "#e11d48" : "#059669";
                  return (
                    <tr key={tx.id}
                      style={{ borderBottom: "1px solid #f8fafc", background: idx % 2 === 0 ? "#fff" : "#fafbff" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f0f4ff")}
                      onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafbff")}>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>#{idx + 1}</span>
                      </td>
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#0b2c60" }}>{tx.time}</p>
                        {"date" in tx && (tx as any).date !== TODAY && (
                          <p style={{ fontSize: 10, color: "#94a3b8" }}>
                            {new Date((tx as any).date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </p>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div className="flex items-center gap-2.5">
                          <div style={{ width: 30, height: 30, borderRadius: 9, background: isWd ? "rgba(244,63,94,0.10)" : "rgba(16,185,129,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {isWd ? <ArrowDownLeft size={14} color={ec} /> : <ArrowUpRight size={14} color={ec} />}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#0b2c60" }}>{tx.customerName}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                          color: ec, background: isWd ? "rgba(244,63,94,0.08)" : "rgba(16,185,129,0.08)",
                        }}>{isWd ? "Withdrawal" : "Deposit"}</span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <span style={{ fontSize: 14, fontWeight: 900, color: ec }}>
                          {isWd ? "−" : "+"}₹{fmt(tx.amount)}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60" }}>₹{fmt(tx.balance)}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{tx.description || "—"}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div className="flex items-center gap-1">
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100" style={{ color: "#94a3b8" }}><Receipt size={12} /></button>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100" style={{ color: "#94a3b8" }}><Pencil size={12} /></button>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50" style={{ color: "#e11d48" }}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Closing row */}
            {tab === "daily" && (
              <div className="flex items-center justify-between px-6 py-4" style={{ background: "rgba(16,185,129,0.04)", borderTop: "1px solid rgba(16,185,129,0.12)" }}>
                <div className="flex items-center gap-2">
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IndianRupee size={14} color="#fff" />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>Closing Balance (Cash on Hand)</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 900, color: "#059669" }}>₹{fmt(SESSION.currentBalance)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
