import './_group.css';
import { useState } from "react";
import {
  Fingerprint, ArrowDownLeft, ArrowUpRight, Wallet,
  Pencil, Trash2, Receipt, CalendarDays, TrendingDown,
  TrendingUp, IndianRupee, Filter, ChevronLeft, ChevronRight, Plus,
} from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });
}

type Tx = {
  id: number;
  type: "withdrawal" | "deposit";
  amount: number;
  customerName: string;
  description: string | null;
  balance: number;
  createdAt: string;
};

const MOCK_TRANSACTIONS: Tx[] = [
  { id: 1, type: "withdrawal", amount: 2000, customerName: "Ramesh Kumar", description: "SBI Bank - Aadhaar", balance: 8000, createdAt: new Date().toISOString() },
  { id: 2, type: "withdrawal", amount: 5000, customerName: "Sunita Devi", description: "PNB - Aadhaar linked", balance: 3000, createdAt: new Date().toISOString() },
  { id: 3, type: "deposit", amount: 1500, customerName: "Manoj Sahu", description: null, balance: 4500, createdAt: new Date().toISOString() },
  { id: 4, type: "withdrawal", amount: 3000, customerName: "Lalita Panda", description: "BOI withdrawal", balance: 1500, createdAt: new Date().toISOString() },
  { id: 5, type: "deposit", amount: 500, customerName: "Bijay Nayak", description: null, balance: 2000, createdAt: new Date().toISOString() },
];

const MOCK_SESSION = {
  id: 1,
  date: todayStr(),
  openingBalance: 10000,
  notes: "Cash loaded from bank",
  transactions: MOCK_TRANSACTIONS,
  totalWithdrawals: MOCK_TRANSACTIONS.filter(t => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0),
  totalDeposits: MOCK_TRANSACTIONS.filter(t => t.type === "deposit").reduce((s, t) => s + t.amount, 0),
  get currentBalance() { return this.openingBalance - this.totalWithdrawals + this.totalDeposits; },
};

function StatCard({ label, value, accent, color, icon: Icon, wide = false }: {
  label: string; value: number; accent: string; color: string;
  icon: React.ElementType; wide?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden ${wide ? "col-span-2 sm:col-span-1" : ""}`}
      style={{ boxShadow: "0 2px 14px rgba(11,44,96,0.09), 0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div style={{ height: 3, background: accent }} />
      <div className="px-4 py-3.5 flex items-center gap-3">
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: accent, boxShadow: `0 4px 10px ${color}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={17} color="#fff" />
        </div>
        <div className="min-w-0">
          <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
            {label}
          </p>
          <p style={{ fontSize: 18, fontWeight: 900, color, lineHeight: 1.1 }}>
            ₹{fmt(value)}
          </p>
        </div>
      </div>
    </div>
  );
}

function DailyTab() {
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const session = MOCK_SESSION;

  return (
    <div className="space-y-4">
      {/* Date Navigator */}
      <div
        className="bg-white rounded-2xl px-4 py-3 flex items-center gap-2"
        style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.07)" }}
      >
        <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100" style={{ color: "#0b2c60" }}>
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 flex items-center justify-center gap-2">
          <CalendarDays size={14} style={{ color: "#94a3b8" }} />
          <span style={{ color: "#0b2c60", fontWeight: 700, fontSize: 14 }}>{fmtDate(selectedDate)}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(249,115,22,0.12)", color: "#f97316" }}>
            TODAY
          </span>
        </div>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center opacity-30 cursor-not-allowed" style={{ color: "#0b2c60" }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Opening Balance" value={session.openingBalance}
          accent="linear-gradient(135deg, #0b2c60, #1a4a9e)" color="#0b2c60" icon={Wallet} wide />
        <StatCard label="Withdrawals" value={session.totalWithdrawals}
          accent="linear-gradient(135deg, #f43f5e, #e11d48)" color="#e11d48" icon={TrendingDown} />
        <StatCard label="Deposits" value={session.totalDeposits}
          accent="linear-gradient(135deg, #10b981, #059669)" color="#059669" icon={TrendingUp} />
        <StatCard label="Current Balance" value={session.currentBalance}
          accent="linear-gradient(135deg, #10b981, #059669)" color="#059669" icon={IndianRupee} />
      </div>

      {/* Balance Formula */}
      <div className="rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1"
        style={{ background: "rgba(11,44,96,0.04)", border: "1px solid rgba(11,44,96,0.08)" }}>
        <span style={{ fontSize: 11, color: "#64748b" }}>Balance formula:</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#0b2c60" }}>₹{fmt(session.openingBalance)}</span>
        <span style={{ fontSize: 11, color: "#e11d48" }}>− ₹{fmt(session.totalWithdrawals)}</span>
        <span style={{ fontSize: 11, color: "#059669" }}>+ ₹{fmt(session.totalDeposits)}</span>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>=</span>
        <span style={{ fontSize: 12, fontWeight: 900, color: "#059669" }}>₹{fmt(session.currentBalance)}</span>
        <button className="ml-auto text-[10px] font-medium px-2 py-1 rounded-md hover:bg-slate-200" style={{ color: "#64748b" }}>
          Edit Opening
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)", boxShadow: "0 4px 16px rgba(244,63,94,0.35)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)" }}>
            <ArrowDownLeft size={22} />
          </div>
          <span className="text-sm">AePS Withdrawal</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 16px rgba(16,185,129,0.35)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)" }}>
            <ArrowUpRight size={22} />
          </div>
          <span className="text-sm">AePS Deposit</span>
        </button>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 14px rgba(11,44,96,0.08)" }}>
        <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid rgba(11,44,96,0.07)" }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60" }}>Transactions</p>
            <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>
              {fmtDate(session.date)} · {session.transactions.length} entries
            </p>
          </div>
        </div>

        {/* Opening row */}
        <div className="flex items-center justify-between px-4 py-3"
          style={{ background: "rgba(11,44,96,0.025)", borderBottom: "1px solid rgba(11,44,96,0.06)" }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: 11, flexShrink: 0,
              background: "linear-gradient(135deg, #0b2c60, #1a4a9e)",
              boxShadow: "0 3px 8px rgba(11,44,96,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 9, fontWeight: 900, letterSpacing: "0.06em",
            }}>OB</div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60" }}>Opening Balance</p>
              <p style={{ fontSize: 10, color: "#94a3b8" }}>{session.notes}</p>
            </div>
          </div>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#0b2c60" }}>₹{fmt(session.openingBalance)}</p>
        </div>

        {/* Transaction rows */}
        {session.transactions.map((tx, idx) => {
          const isWd = tx.type === "withdrawal";
          return (
            <div key={tx.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/80"
              style={{ borderBottom: "1px solid rgba(11,44,96,0.05)" }}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div style={{
                  width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                  background: isWd ? "linear-gradient(135deg, #f43f5e, #e11d48)" : "linear-gradient(135deg, #10b981, #059669)",
                  boxShadow: isWd ? "0 3px 8px rgba(244,63,94,0.30)" : "0 3px 8px rgba(16,185,129,0.30)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isWd ? <ArrowDownLeft size={15} color="#fff" /> : <ArrowUpRight size={15} color="#fff" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0b2c60" }}>{tx.customerName}</p>
                    <span style={{
                      fontSize: 9, fontWeight: 700, borderRadius: 5, padding: "2px 6px",
                      color: isWd ? "#e11d48" : "#059669",
                      background: isWd ? "rgba(244,63,94,0.10)" : "rgba(16,185,129,0.10)",
                    }}>#{idx + 1} · {isWd ? "WD" : "DEP"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {tx.description && <p style={{ fontSize: 10, color: "#94a3b8" }}>{tx.description}</p>}
                    <p style={{ fontSize: 10, color: "#c4c9d4" }}>
                      {new Date(tx.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <div className="text-right mr-1">
                  <p style={{ fontSize: 13, fontWeight: 800, color: isWd ? "#e11d48" : "#059669" }}>
                    {isWd ? "−" : "+"}₹{fmt(tx.amount)}
                  </p>
                  <p style={{ fontSize: 10, fontWeight: 500, color: "#94a3b8" }}>₹{fmt(tx.balance)}</p>
                </div>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100" style={{ color: "#94a3b8" }}>
                  <Receipt size={13} />
                </button>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100" style={{ color: "#94a3b8" }}>
                  <Pencil size={13} />
                </button>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50" style={{ color: "#e11d48" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Closing balance row */}
        <div className="flex items-center justify-between px-4 py-3.5"
          style={{ background: "rgba(16,185,129,0.05)", borderTop: "1px solid rgba(16,185,129,0.12)" }}>
          <div className="flex items-center gap-2">
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <IndianRupee size={13} color="#fff" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>Closing Balance</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 900, color: "#059669" }}>₹{fmt(session.currentBalance)}</span>
        </div>
      </div>
    </div>
  );
}

function AllTransactionsTab() {
  const allTx = [
    ...MOCK_TRANSACTIONS.map(t => ({ ...t, date: todayStr() })),
    { id: 6, type: "withdrawal" as const, amount: 4000, customerName: "Priya Mohanty", description: "BOI", balance: 6000, createdAt: new Date(Date.now() - 86400000).toISOString(), date: new Date(Date.now() - 86400000).toISOString().split("T")[0] },
    { id: 7, type: "deposit" as const, amount: 2000, customerName: "Deepak Rath", description: null, balance: 8000, createdAt: new Date(Date.now() - 86400000).toISOString(), date: new Date(Date.now() - 86400000).toISOString().split("T")[0] },
  ];

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.07)" }}>
        <Filter size={14} style={{ color: "#94a3b8" }} />
        <span style={{ fontSize: 12, color: "#64748b" }}>All time · 7 transactions</span>
        <button className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: "rgba(11,44,96,0.07)", color: "#0b2c60" }}>Filter</button>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 14px rgba(11,44,96,0.08)" }}>
        {allTx.map((tx) => {
          const isWd = tx.type === "withdrawal";
          return (
            <div key={tx.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
              style={{ borderBottom: "1px solid rgba(11,44,96,0.05)" }}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div style={{
                  width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                  background: isWd ? "linear-gradient(135deg, #f43f5e, #e11d48)" : "linear-gradient(135deg, #10b981, #059669)",
                  boxShadow: isWd ? "0 3px 8px rgba(244,63,94,0.28)" : "0 3px 8px rgba(16,185,129,0.28)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isWd ? <ArrowDownLeft size={15} color="#fff" /> : <ArrowUpRight size={15} color="#fff" />}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0b2c60" }}>{tx.customerName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span style={{
                      fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "2px 5px",
                      color: isWd ? "#e11d48" : "#059669",
                      background: isWd ? "rgba(244,63,94,0.09)" : "rgba(16,185,129,0.09)",
                    }}>{isWd ? "Withdrawal" : "Deposit"}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>
                      {new Date(tx.date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <p style={{ fontSize: 13, fontWeight: 800, color: isWd ? "#e11d48" : "#059669", marginRight: 4 }}>
                  {isWd ? "−" : "+"}₹{fmt(tx.amount)}
                </p>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100" style={{ color: "#94a3b8" }}>
                  <Receipt size={13} />
                </button>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100" style={{ color: "#94a3b8" }}>
                  <Pencil size={13} />
                </button>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50" style={{ color: "#e11d48" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Tab = "daily" | "all";

export function AePS() {
  const [tab, setTab] = useState<Tab>("daily");

  return (
    <div className="min-h-screen" style={{ background: "hsl(210 40% 98%)" }}>
      {/* Mobile header */}
      <div style={{ background: "linear-gradient(135deg, #0b2c60 0%, #0f3872 60%, #1a4a9e 100%)", paddingTop: 12, paddingBottom: 0 }}>
        {/* Accent stripe */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #0b2c60, #f97316)", marginBottom: 8 }} />

        {/* Page header */}
        <div className="px-4 pb-4 flex items-center gap-4">
          <div style={{
            width: 48, height: 48, borderRadius: 15, flexShrink: 0,
            background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Fingerprint size={26} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              AePS Cash Management
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
              Aadhaar-enabled Payment System · Daily cash tracking
            </p>
          </div>
        </div>

        {/* Tab strip */}
        <div className="flex" style={{ background: "rgba(11,44,96,0.04)", borderTop: "1px solid rgba(11,44,96,0.09)" }}>
          {([
            { key: "daily" as Tab, label: "Daily Session", icon: CalendarDays },
            { key: "all" as Tab, label: "All Transactions", icon: Filter },
          ]).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold flex-1 justify-center"
              style={{
                color: tab === key ? "#fff" : "rgba(255,255,255,0.5)",
                borderBottom: tab === key ? "2.5px solid #f97316" : "2.5px solid transparent",
                background: tab === key ? "rgba(255,255,255,0.07)" : "transparent",
              }}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {tab === "daily" ? <DailyTab /> : <AllTransactionsTab />}
      </div>
    </div>
  );
}
