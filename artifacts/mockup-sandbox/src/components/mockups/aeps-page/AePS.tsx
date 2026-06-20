import './_group.css';
import { useState } from "react";
import {
  Fingerprint, ArrowDownLeft, ArrowUpRight, Wallet,
  Pencil, Trash2, Receipt, CalendarDays, TrendingDown,
  TrendingUp, IndianRupee, Filter, ChevronLeft, ChevronRight,
  CheckCircle2, X, StickyNote, Banknote, AlertCircle,
} from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
function todayStr() { return new Date().toISOString().split("T")[0]; }
function fmtDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });
}

type Tx = {
  id: number; type: "withdrawal" | "deposit";
  amount: number; customerName: string;
  description: string | null; balance: number; createdAt: string;
};

const MOCK_TRANSACTIONS: Tx[] = [
  { id: 1, type: "withdrawal", amount: 2000, customerName: "Ramesh Kumar", description: "SBI Bank · Aadhaar", balance: 8000, createdAt: new Date().toISOString() },
  { id: 2, type: "withdrawal", amount: 5000, customerName: "Sunita Devi", description: "PNB · Aadhaar linked", balance: 3000, createdAt: new Date().toISOString() },
  { id: 3, type: "deposit", amount: 1500, customerName: "Manoj Sahu", description: null, balance: 4500, createdAt: new Date().toISOString() },
  { id: 4, type: "withdrawal", amount: 3000, customerName: "Lalita Panda", description: "BOI withdrawal", balance: 1500, createdAt: new Date().toISOString() },
  { id: 5, type: "deposit", amount: 500, customerName: "Bijay Nayak", description: null, balance: 2000, createdAt: new Date().toISOString() },
];

// ── Opening Balance Card ──────────────────────────────────────────────────────
function OpeningBalanceCard({
  opening, notes, onSave,
}: { opening: number; notes: string; onSave: (v: number, n: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(opening));
  const [draftNotes, setDraftNotes] = useState(notes);
  const [saved, setSaved] = useState(false);

  const draftNum = parseFloat(draft);
  const isValid = !isNaN(draftNum) && draftNum >= 0;

  function handleSave() {
    if (!isValid) return;
    onSave(draftNum, draftNotes);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }
  function handleCancel() {
    setDraft(String(opening));
    setDraftNotes(notes);
    setEditing(false);
  }

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg,#0b2c60 0%,#0f3872 55%,#1a4a9e 100%)",
        boxShadow: "0 8px 28px rgba(11,44,96,0.28), 0 2px 8px rgba(11,44,96,0.14)",
      }}>
      {/* Accent stripe */}
      <div style={{ height: 3, background: "linear-gradient(90deg,#f97316,#fb923c,#fde68a)" }} />

      {!editing ? (
        /* ── VIEW mode ── */
        <div className="px-5 py-4">
          {/* Label row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: "rgba(249,115,22,0.20)", border: "1px solid rgba(249,115,22,0.30)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Wallet size={14} color="#f97316" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.70)", textTransform: "uppercase", letterSpacing: "0.09em" }}>
                Opening Balance
              </span>
            </div>
            {saved ? (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{ background: "rgba(16,185,129,0.20)", border: "1px solid rgba(16,185,129,0.35)" }}>
                <CheckCircle2 size={12} color="#34d399" />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#34d399" }}>Saved</span>
              </div>
            ) : (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)",
                  color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 700, cursor: "pointer",
                }}>
                <Pencil size={11} />
                Edit
              </button>
            )}
          </div>

          {/* Amount */}
          <div className="flex items-end gap-2 mb-3">
            <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>₹</span>
            <span style={{ fontSize: 42, fontWeight: 900, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.03em" }}>
              {fmt(opening)}
            </span>
          </div>

          {/* Notes */}
          {notes && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <StickyNote size={11} color="rgba(255,255,255,0.50)" />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.60)", fontStyle: "italic" }}>{notes}</span>
            </div>
          )}

          {/* Mini stat row */}
          <div className="flex gap-2 mt-3">
            {[
              { label: "Date", value: fmtDate(todayStr()).split(",")[0] },
              { label: "Session", value: "Active" },
              { label: "Txns", value: String(MOCK_TRANSACTIONS.length) },
            ].map(({ label, value }) => (
              <div key={label} className="flex-1 rounded-xl px-3 py-2 text-center"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.40)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                <p style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── EDIT mode ── */
        <div className="px-5 py-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(249,115,22,0.20)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Banknote size={14} color="#f97316" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.70)", textTransform: "uppercase", letterSpacing: "0.09em" }}>
                Edit Opening Balance
              </span>
            </div>
            <button onClick={handleCancel} style={{ color: "rgba(255,255,255,0.45)", cursor: "pointer" }}>
              <X size={18} />
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.50)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Cash Amount (₹)
            </label>
            <div className="relative">
              <span style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                fontSize: 20, fontWeight: 900, color: "rgba(255,255,255,0.40)",
              }}>₹</span>
              <input
                type="number" inputMode="decimal" autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                style={{
                  width: "100%", height: 56, paddingLeft: 34, paddingRight: 14,
                  borderRadius: 14, boxSizing: "border-box",
                  border: `2px solid ${isValid ? "rgba(249,115,22,0.55)" : "rgba(239,68,68,0.55)"}`,
                  background: "rgba(255,255,255,0.10)", color: "#fff",
                  fontSize: 28, fontWeight: 900, outline: "none",
                }}
              />
            </div>
            {!isValid && draft.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <AlertCircle size={11} color="#fca5a5" />
                <span style={{ fontSize: 10, color: "#fca5a5", fontWeight: 600 }}>Enter a valid amount (0 or more)</span>
              </div>
            )}
          </div>

          {/* Notes input */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.50)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Note <span style={{ fontWeight: 400, textTransform: "none", fontSize: 10 }}>(optional)</span>
            </label>
            <div className="relative">
              <StickyNote size={13} style={{ position: "absolute", left: 13, top: 12, color: "rgba(255,255,255,0.35)" }} />
              <input
                value={draftNotes}
                onChange={e => setDraftNotes(e.target.value)}
                placeholder="e.g. Cash loaded from bank…"
                style={{
                  width: "100%", height: 44, paddingLeft: 36, paddingRight: 14,
                  borderRadius: 12, boxSizing: "border-box",
                  border: "1.5px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.08)", color: "#fff",
                  fontSize: 13, fontWeight: 500, outline: "none",
                }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button onClick={handleCancel}
              className="flex-1 py-3 rounded-2xl font-bold text-sm"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.12)" }}>
              Cancel
            </button>
            <button onClick={handleSave}
              className="flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
              style={{
                background: isValid ? "linear-gradient(135deg,#f97316,#ea580c)" : "rgba(255,255,255,0.12)",
                color: isValid ? "#fff" : "rgba(255,255,255,0.30)",
                boxShadow: isValid ? "0 4px 14px rgba(249,115,22,0.40)" : "none",
                cursor: isValid ? "pointer" : "not-allowed",
              }}>
              <CheckCircle2 size={15} />
              Save Balance
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Balance Formula Bar ───────────────────────────────────────────────────────
function BalanceFormula({ opening, withdrawals, deposits, current }: {
  opening: number; withdrawals: number; deposits: number; current: number;
}) {
  const steps = [
    { label: "Opening", value: opening, color: "#0b2c60", bg: "rgba(11,44,96,0.08)" },
    { label: "symbol", value: "−", color: "#e11d48" },
    { label: "Withdrawn", value: withdrawals, color: "#e11d48", bg: "rgba(244,63,94,0.08)" },
    { label: "symbol", value: "+", color: "#059669" },
    { label: "Deposited", value: deposits, color: "#059669", bg: "rgba(16,185,129,0.08)" },
    { label: "symbol", value: "=", color: "#64748b" },
    { label: "Balance", value: current, color: "#059669", bg: "rgba(16,185,129,0.10)", bold: true },
  ];

  return (
    <div className="rounded-2xl px-4 py-3 overflow-hidden"
      style={{ background: "#fff", boxShadow: "0 2px 12px rgba(11,44,96,0.07)", border: "1px solid rgba(11,44,96,0.07)" }}>
      <p style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 10 }}>
        Balance Calculation
      </p>
      <div className="flex items-center gap-1 flex-wrap">
        {steps.map((s, i) =>
          s.label === "symbol" ? (
            <span key={i} style={{ fontSize: 16, fontWeight: 900, color: s.color, paddingInline: 2 }}>{s.value as string}</span>
          ) : (
            <div key={i} className="px-2.5 py-1.5 rounded-xl flex flex-col items-center"
              style={{ background: s.bg, minWidth: 54 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: s.color + "aa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {s.label}
              </span>
              <span style={{ fontSize: (s as any).bold ? 14 : 12, fontWeight: 900, color: s.color, lineHeight: 1.1, marginTop: 2 }}>
                ₹{fmt(s.value as number)}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ── Stat Cards ────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent, color, icon: Icon }: {
  label: string; value: number; accent: string; color: string; icon: React.ElementType;
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)" }}>
      <div style={{ height: 3, background: accent }} />
      <div className="px-4 py-3.5 flex items-center gap-3">
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: accent, boxShadow: `0 4px 10px ${color}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={16} color="#fff" />
        </div>
        <div className="min-w-0">
          <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
            {label}
          </p>
          <p style={{ fontSize: 16, fontWeight: 900, color, lineHeight: 1.1 }}>₹{fmt(value)}</p>
        </div>
      </div>
    </div>
  );
}

// ── Daily Tab ─────────────────────────────────────────────────────────────────
function DailyTab() {
  const [opening, setOpening] = useState(10000);
  const [notes, setNotes] = useState("Cash loaded from bank");
  const [date] = useState(todayStr());

  const totalWithdrawals = MOCK_TRANSACTIONS.filter(t => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0);
  const totalDeposits = MOCK_TRANSACTIONS.filter(t => t.type === "deposit").reduce((s, t) => s + t.amount, 0);
  const currentBalance = opening - totalWithdrawals + totalDeposits;

  return (
    <div className="space-y-3">
      {/* Date Navigator */}
      <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-2"
        style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.07)" }}>
        <button style={{ width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "#0b2c60", background: "rgba(11,44,96,0.05)" }}>
          <ChevronLeft size={17} />
        </button>
        <div className="flex-1 flex items-center justify-center gap-2">
          <CalendarDays size={13} style={{ color: "#94a3b8" }} />
          <span style={{ color: "#0b2c60", fontWeight: 700, fontSize: 13 }}>{fmtDate(date)}</span>
          <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 8, background: "rgba(249,115,22,0.12)", color: "#f97316" }}>TODAY</span>
        </div>
        <button style={{ width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "#0b2c60", opacity: 0.25 }}>
          <ChevronRight size={17} />
        </button>
      </div>

      {/* ── REDESIGNED Opening Balance ── */}
      <OpeningBalanceCard
        opening={opening}
        notes={notes}
        onSave={(v, n) => { setOpening(v); setNotes(n); }}
      />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Withdrawals" value={totalWithdrawals}
          accent="linear-gradient(135deg,#f43f5e,#e11d48)" color="#e11d48" icon={TrendingDown} />
        <StatCard label="Deposits" value={totalDeposits}
          accent="linear-gradient(135deg,#10b981,#059669)" color="#059669" icon={TrendingUp} />
      </div>

      {/* ── Balance Formula Bar ── */}
      <BalanceFormula opening={opening} withdrawals={totalWithdrawals} deposits={totalDeposits} current={currentBalance} />

      {/* ── Action Buttons ── */}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white"
          style={{ background: "linear-gradient(135deg,#f43f5e,#e11d48)", boxShadow: "0 4px 16px rgba(244,63,94,0.32)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowDownLeft size={22} />
          </div>
          <span className="text-sm">AePS Withdrawal</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white"
          style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 16px rgba(16,185,129,0.32)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowUpRight size={22} />
          </div>
          <span className="text-sm">AePS Deposit</span>
        </button>
      </div>

      {/* ── Transaction List ── */}
      <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 2px 14px rgba(11,44,96,0.09)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5"
          style={{ borderBottom: "1px solid rgba(11,44,96,0.07)" }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60" }}>Today's Transactions</p>
            <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{MOCK_TRANSACTIONS.length} entries</p>
          </div>
        </div>

        {/* Session Start marker */}
        <div className="px-4 py-3 flex items-center gap-3"
          style={{ background: "linear-gradient(90deg,rgba(11,44,96,0.04),transparent)", borderBottom: "1px dashed rgba(11,44,96,0.10)" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: "linear-gradient(135deg,#0b2c60,#1a4a9e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 3px 8px rgba(11,44,96,0.22)",
          }}>
            <Wallet size={13} color="#fff" />
          </div>
          <div className="flex-1">
            <p style={{ fontSize: 12, fontWeight: 700, color: "#0b2c60" }}>Session Started — ₹{fmt(opening)}</p>
            {notes && <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{notes}</p>}
          </div>
          <span style={{
            fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 7,
            background: "rgba(11,44,96,0.08)", color: "#0b2c60", letterSpacing: "0.05em",
          }}>START</span>
        </div>

        {/* Transaction rows */}
        {MOCK_TRANSACTIONS.map((tx, idx) => {
          const isWd = tx.type === "withdrawal";
          return (
            <div key={tx.id} className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(11,44,96,0.05)" }}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div style={{
                  width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                  background: isWd ? "linear-gradient(135deg,#f43f5e,#e11d48)" : "linear-gradient(135deg,#10b981,#059669)",
                  boxShadow: isWd ? "0 3px 8px rgba(244,63,94,0.28)" : "0 3px 8px rgba(16,185,129,0.28)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isWd ? <ArrowDownLeft size={15} color="#fff" /> : <ArrowUpRight size={15} color="#fff" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0b2c60" }}>{tx.customerName}</p>
                    <span style={{
                      fontSize: 9, fontWeight: 700, borderRadius: 5, padding: "2px 5px",
                      color: isWd ? "#e11d48" : "#059669",
                      background: isWd ? "rgba(244,63,94,0.09)" : "rgba(16,185,129,0.09)",
                    }}>#{idx + 1} {isWd ? "WD" : "DEP"}</span>
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
                  <p style={{ fontSize: 10, color: "#94a3b8" }}>Bal ₹{fmt(tx.balance)}</p>
                </div>
                <button style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", background: "#f8fafc" }}>
                  <Receipt size={13} />
                </button>
                <button style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", background: "#f8fafc" }}>
                  <Pencil size={13} />
                </button>
                <button style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#e11d48", background: "#fff0f0" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Closing balance */}
        <div className="flex items-center justify-between px-4 py-3.5"
          style={{ background: "rgba(16,185,129,0.04)", borderTop: "1.5px solid rgba(16,185,129,0.15)" }}>
          <div className="flex items-center gap-2">
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IndianRupee size={13} color="#fff" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>Closing Balance</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 900, color: "#059669" }}>₹{fmt(currentBalance)}</span>
        </div>
      </div>
    </div>
  );
}

// ── All Transactions Tab ──────────────────────────────────────────────────────
function AllTransactionsTab() {
  const allTx = [
    ...MOCK_TRANSACTIONS.map(t => ({ ...t, date: todayStr() })),
    { id: 6, type: "withdrawal" as const, amount: 4000, customerName: "Priya Mohanty", description: "BOI", balance: 6000, createdAt: new Date(Date.now() - 86400000).toISOString(), date: new Date(Date.now() - 86400000).toISOString().split("T")[0] },
    { id: 7, type: "deposit" as const, amount: 2000, customerName: "Deepak Rath", description: null, balance: 8000, createdAt: new Date(Date.now() - 86400000).toISOString(), date: new Date(Date.now() - 86400000).toISOString().split("T")[0] },
  ];

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.07)" }}>
        <Filter size={14} style={{ color: "#94a3b8" }} />
        <span style={{ fontSize: 12, color: "#64748b" }}>All time · {allTx.length} transactions</span>
        <button className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(11,44,96,0.07)", color: "#0b2c60" }}>Filter</button>
      </div>
      <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 2px 14px rgba(11,44,96,0.08)" }}>
        {allTx.map((tx) => {
          const isWd = tx.type === "withdrawal";
          return (
            <div key={tx.id} className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(11,44,96,0.05)" }}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div style={{
                  width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                  background: isWd ? "linear-gradient(135deg,#f43f5e,#e11d48)" : "linear-gradient(135deg,#10b981,#059669)",
                  boxShadow: isWd ? "0 3px 8px rgba(244,63,94,0.26)" : "0 3px 8px rgba(16,185,129,0.26)",
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
                <button style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", background: "#f8fafc" }}>
                  <Receipt size={13} />
                </button>
                <button style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", background: "#f8fafc" }}>
                  <Pencil size={13} />
                </button>
                <button style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#e11d48", background: "#fff0f0" }}>
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
    <div className="min-h-screen" style={{ background: "hsl(210 40% 98%)", fontFamily: "'Inter',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0b2c60 0%,#0f3872 60%,#1a4a9e 100%)" }}>
        <div style={{ height: 3, background: "linear-gradient(90deg,#0b2c60,#f97316)" }} />
        <div className="px-4 pt-3 pb-4 flex items-center gap-4">
          <div style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
            background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Fingerprint size={24} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 17, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              AePS Cash Management
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.60)", marginTop: 2 }}>
              Aadhaar-enabled Payment System · Daily cash tracking
            </p>
          </div>
        </div>
        <div className="flex" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
          {([
            { key: "daily" as Tab, label: "Daily Session", icon: CalendarDays },
            { key: "all" as Tab, label: "All Transactions", icon: Filter },
          ]).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold flex-1 justify-center"
              style={{
                color: tab === key ? "#fff" : "rgba(255,255,255,0.45)",
                borderBottom: tab === key ? "2.5px solid #f97316" : "2.5px solid transparent",
                background: tab === key ? "rgba(255,255,255,0.07)" : "transparent",
                transition: "all 0.15s",
              }}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {tab === "daily" ? <DailyTab /> : <AllTransactionsTab />}
      </div>
    </div>
  );
}
