import { useState } from "react";
import { Fingerprint, Plus, ArrowUpRight, ArrowDownLeft, Wallet, ChevronLeft, ChevronRight, Receipt, Calendar, Pencil, IndianRupee, CheckCircle2, AlertCircle } from "lucide-react";

const NAVY = "#0b2c60";
const SAFFRON = "#f97316";
const GREEN = "#059669";
const RED = "#dc2626";

const sessionData = {
  date: "2026-06-19",
  openingBalance: 5000,
  currentBalance: 3750,
  totalWithdrawals: 2200,
  totalDeposits: 950,
  transactions: [
    { id: 1, type: "withdrawal", customer: "Ramesh Kumar", aadhaar: "XXXX XXXX 4521", amount: 500, balance: 4500, createdAt: "2026-06-19T09:15:00Z" },
    { id: 2, type: "deposit", customer: "Sunita Devi", aadhaar: null, amount: 300, balance: 4800, createdAt: "2026-06-19T10:30:00Z" },
    { id: 3, type: "withdrawal", customer: "Mohan Sahu", aadhaar: "XXXX XXXX 7803", amount: 800, balance: 4000, createdAt: "2026-06-19T11:45:00Z" },
    { id: 4, type: "deposit", customer: "Poonam Yadav", aadhaar: null, amount: 650, balance: 4650, createdAt: "2026-06-19T12:20:00Z" },
    { id: 5, type: "withdrawal", customer: "Geeta Mishra", aadhaar: "XXXX XXXX 1190", amount: 900, balance: 3750, createdAt: "2026-06-19T14:10:00Z" },
  ],
};

type TxType = "withdrawal" | "deposit";
type ViewMode = "has-session" | "no-session";

function TxRow({ tx }: { tx: (typeof sessionData.transactions)[0] }) {
  const isW = tx.type === "withdrawal";
  const color = isW ? RED : GREEN;
  const bg = isW ? "rgba(220,38,38,0.08)" : "rgba(5,150,105,0.08)";
  const t = new Date(tx.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return (
    <div style={{ background: "#fff", borderRadius: 14, marginBottom: 8, overflow: "hidden", boxShadow: "0 1px 8px rgba(11,44,96,0.06)", display: "flex", border: "1px solid #f1f5f9" }}>
      <div style={{ width: 4, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: "11px 12px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {isW ? <ArrowUpRight size={17} color={color} strokeWidth={2.5} /> : <ArrowDownLeft size={17} color={color} strokeWidth={2.5} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: NAVY, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.customer}</p>
          <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
            {isW ? "Withdrawal" : "Deposit"} · {t}
            {isW && tx.aadhaar && <span style={{ marginLeft: 4, color: "#c7d2fe", fontFamily: "monospace" }}>· {tx.aadhaar}</span>}
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 900, color, lineHeight: 1 }}>{isW ? "−" : "+"}₹{tx.amount.toLocaleString("en-IN")}</p>
          <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>Bal ₹{tx.balance.toLocaleString("en-IN")}</p>
          <button style={{ marginTop: 4, width: 22, height: 22, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "auto", cursor: "pointer" }}>
            <Receipt size={11} color="#64748b" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Opening Balance Setup Card (No Session state) ──────────────────────────────
function OpeningBalanceSetup({ onStart }: { onStart: () => void }) {
  const [balance, setBalance] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const hasBalance = parseFloat(balance) > 0;

  const handleStart = () => {
    if (!hasBalance) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onStart(); }, 1400);
  };

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", background: "#f1f5f9", minHeight: "100vh", maxWidth: 390, margin: "0 auto" }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(145deg,#0b2c60 0%,#1a4a9e 100%)", padding: "24px 20px 36px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(249,115,22,0.12)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4, position: "relative" }}>AePS Cash · 19 Jun 2026</p>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 900, lineHeight: 1.1, margin: "0 0 18px", position: "relative" }}>Start Today's Session</h1>

        {/* Status strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 12, padding: "10px 14px", position: "relative" }}>
          <AlertCircle size={16} color={SAFFRON} />
          <p style={{ fontSize: 12, fontWeight: 700, color: "#fed7aa" }}>No session opened for today. Set your opening cash balance to begin.</p>
        </div>
      </div>

      {/* Setup card — overlaps hero */}
      <div style={{ margin: "-20px 16px 0", background: "#fff", borderRadius: 24, boxShadow: "0 12px 40px rgba(11,44,96,0.12)", overflow: "hidden" }}>

        {/* Cash in hand amount */}
        <div style={{ background: "rgba(249,115,22,0.06)", borderBottom: "1px solid #f1f5f9", padding: "20px 20px 18px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 50, height: 50, borderRadius: 15, background: "linear-gradient(135deg,#c2410c,#f97316)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 6px 18px rgba(249,115,22,0.4)" }}>
            <IndianRupee size={22} color="#fff" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Cash in Hand (Opening Balance)</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: hasBalance ? SAFFRON : "#cbd5e1" }}>₹</span>
              <input
                type="number" min="0" step="0.01" value={balance}
                onChange={e => setBalance(e.target.value)}
                placeholder="0.00"
                style={{ flex: 1, fontSize: 34, fontWeight: 900, color: hasBalance ? SAFFRON : "#94a3b8", background: "transparent", border: "none", outline: "none", padding: 0, minWidth: 0 }}
              />
            </div>
            <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Total cash loaded in hand before starting AePS transactions</p>
          </div>
        </div>

        {/* Notes */}
        <div style={{ padding: "14px 20px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#64748b", marginTop: 2 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Session Note (optional)</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="e.g. Cash loaded from bank, ATM withdrawal…"
              style={{ width: "100%", fontSize: 13, fontWeight: 500, color: NAVY, background: "transparent", border: "none", outline: "none", padding: 0, resize: "none", fontFamily: "inherit", lineHeight: 1.5 }} />
          </div>
        </div>

        {/* What this means */}
        <div style={{ margin: "0 16px 16px", background: "#f8fafc", borderRadius: 12, padding: "12px 14px", border: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 6 }}>How the balance formula works</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 12, color: "#64748b" }}>
            <span style={{ fontWeight: 800, color: SAFFRON }}>₹{hasBalance ? parseFloat(balance).toLocaleString("en-IN") : "Opening"}</span>
            <span style={{ color: "#dc2626", fontWeight: 700 }}>− Withdrawals</span>
            <span style={{ color: GREEN, fontWeight: 700 }}>+ Deposits</span>
            <span style={{ color: "#94a3b8" }}>=</span>
            <span style={{ fontWeight: 800, color: NAVY }}>Current Balance</span>
          </div>
        </div>
      </div>

      {/* Start Session button */}
      <div style={{ padding: "16px 16px 32px" }}>
        <button onClick={handleStart} disabled={!hasBalance || loading}
          style={{ width: "100%", height: 56, borderRadius: 18, border: "none", cursor: hasBalance ? "pointer" : "not-allowed", background: hasBalance ? "linear-gradient(135deg,#c2410c,#f97316)" : "#e2e8f0", color: hasBalance ? "#fff" : "#94a3b8", fontSize: 16, fontWeight: 900, letterSpacing: "0.02em", boxShadow: hasBalance ? "0 8px 24px rgba(249,115,22,0.4)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
          {loading ? (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>Opening Session…</>
          ) : (
            <><CheckCircle2 size={18} strokeWidth={2.5} />Start AePS Session</>
          )}
        </button>
        {!hasBalance && <p style={{ textAlign: "center", fontSize: 11, color: "#f97316", marginTop: 10, fontWeight: 600 }}>⚠ Enter opening cash balance to begin</p>}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AepsPage() {
  const [view, setView] = useState<ViewMode>("has-session");
  const [tab, setTab] = useState<"daily" | "all">("daily");
  const [showForm, setShowForm] = useState<null | TxType>(null);
  const [showEditBalance, setShowEditBalance] = useState(false);
  const [amount, setAmount] = useState("");
  const [customer, setCustomer] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [newBalance, setNewBalance] = useState(String(sessionData.openingBalance));

  const s = sessionData;

  if (view === "no-session") {
    return <OpeningBalanceSetup onStart={() => setView("has-session")} />;
  }

  const txColor = showForm === "withdrawal" ? RED : GREEN;
  const txGrad = showForm === "withdrawal" ? "linear-gradient(135deg,#7f1d1d,#dc2626)" : "linear-gradient(135deg,#064e3b,#059669)";

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", background: "#f8fafc", minHeight: "100vh", maxWidth: 390, margin: "0 auto", overflowX: "hidden" }}>

      {/* Toggle (demo) */}
      <div style={{ position: "fixed", top: 10, right: 10, zIndex: 100 }}>
        <button onClick={() => setView("no-session")}
          style={{ fontSize: 10, fontWeight: 700, background: "#0b2c60", color: "#fff", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer" }}>
          Preview: No Session
        </button>
      </div>

      {/* Hero header */}
      <div style={{ background: "linear-gradient(145deg,#0b2c60 0%,#1a4a9e 100%)", padding: "20px 20px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(249,115,22,0.12)", pointerEvents: "none" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, position: "relative" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>AePS Cash</p>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 900, lineHeight: 1.1, marginTop: 2 }}>Daily Session</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "6px 10px" }}>
            <Calendar size={13} color="#fff" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>19 Jun</span>
          </div>
        </div>

        {/* ── Redesigned Opening Balance section ── */}
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.12)", marginBottom: 14, overflow: "hidden" }}>

          {/* Current balance + opening balance */}
          <div style={{ padding: "14px 16px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Current Cash Balance</p>
              <p style={{ color: "#fff", fontSize: 28, fontWeight: 900, lineHeight: 1, marginBottom: 2 }}>
                ₹{s.currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 600 }}>
                ₹{s.openingBalance.toLocaleString("en-IN")} opened &nbsp;
                <span style={{ color: "#fca5a5" }}>− ₹{s.totalWithdrawals.toLocaleString("en-IN")}</span>
                &nbsp;
                <span style={{ color: "#86efac" }}>+ ₹{s.totalDeposits.toLocaleString("en-IN")}</span>
              </p>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(249,115,22,0.2)", border: "1px solid rgba(249,115,22,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Wallet size={22} color={SAFFRON} />
            </div>
          </div>

          {/* ── Opening balance row with edit ── */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Saffron accent bar */}
              <div style={{ width: 3, height: 32, borderRadius: 2, background: "linear-gradient(180deg,#f97316,#fb923c)", flexShrink: 0 }} />
              <div>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Opening Balance</p>
                <p style={{ color: "#fed7aa", fontSize: 16, fontWeight: 900, marginTop: 1 }}>₹{s.openingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <button onClick={() => setShowEditBalance(true)}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(249,115,22,0.2)", border: "1px solid rgba(249,115,22,0.35)", borderRadius: 9, padding: "6px 10px", cursor: "pointer", color: SAFFRON, fontSize: 11, fontWeight: 700 }}>
              <Pencil size={11} color={SAFFRON} />Edit
            </button>
          </div>

          {/* Stat pills row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "10px 16px 14px" }}>
            <div style={{ background: "rgba(220,38,38,0.15)", borderRadius: 11, padding: "8px 12px", border: "1px solid rgba(220,38,38,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                <ArrowUpRight size={12} color="#fca5a5" />
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Withdrawals</p>
              </div>
              <p style={{ color: "#fca5a5", fontSize: 15, fontWeight: 900 }}>₹{s.totalWithdrawals.toLocaleString("en-IN")}</p>
            </div>
            <div style={{ background: "rgba(5,150,105,0.15)", borderRadius: 11, padding: "8px 12px", border: "1px solid rgba(5,150,105,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                <ArrowDownLeft size={12} color="#86efac" />
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Deposits</p>
              </div>
              <p style={{ color: "#86efac", fontSize: 15, fontWeight: 900 }}>₹{s.totalDeposits.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, position: "relative" }}>
          <button onClick={() => setShowForm("withdrawal")}
            style={{ height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#7f1d1d,#dc2626)", color: "#fff", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: "0 4px 14px rgba(220,38,38,0.4)" }}>
            <ArrowUpRight size={18} strokeWidth={2.5} />Withdrawal
          </button>
          <button onClick={() => setShowForm("deposit")}
            style={{ height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#064e3b,#059669)", color: "#fff", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: "0 4px 14px rgba(5,150,105,0.4)" }}>
            <ArrowDownLeft size={18} strokeWidth={2.5} />Deposit
          </button>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ padding: "14px 16px 8px", background: "#f8fafc" }}>
        <div style={{ background: "#f1f5f9", borderRadius: 12, padding: 4, display: "flex", gap: 4 }}>
          {(["daily", "all"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, height: 36, borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: tab === t ? "#fff" : "transparent", color: tab === t ? NAVY : "#94a3b8", boxShadow: tab === t ? "0 1px 4px rgba(11,44,96,0.1)" : "none" }}>
              {t === "daily" ? "Today's Transactions" : "All Transactions"}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div style={{ padding: "4px 16px 80px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, marginTop: 4 }}>
          {s.transactions.length} transactions
        </p>
        {s.transactions.map(tx => <TxRow key={tx.id} tx={tx as any} />)}
      </div>

      {/* ── Transaction form bottom sheet ── */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(11,44,96,0.55)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 50, maxWidth: 390, margin: "0 auto" }}>
          <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "20px 20px 36px", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
            </div>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: showForm === "withdrawal" ? "rgba(220,38,38,0.1)" : "rgba(5,150,105,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {showForm === "withdrawal" ? <ArrowUpRight size={22} color={RED} /> : <ArrowDownLeft size={22} color={GREEN} />}
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>{showForm === "withdrawal" ? "Cash Withdrawal" : "Cash Deposit"}</h3>
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>AePS Transaction · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
              </div>
            </div>

            {/* Amount */}
            <div style={{ background: showForm === "withdrawal" ? "rgba(220,38,38,0.06)" : "rgba(5,150,105,0.06)", borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${showForm === "withdrawal" ? "rgba(220,38,38,0.18)" : "rgba(5,150,105,0.18)"}`, marginBottom: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Amount</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: txColor }}>₹</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                  style={{ flex: 1, fontSize: 30, fontWeight: 900, color: txColor, background: "transparent", border: "none", outline: "none", padding: 0 }} />
              </div>
            </div>

            {/* Customer */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "11px 14px", marginBottom: 10, background: "#fafafa" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              <input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Customer name (Aadhaar holder)"
                style={{ flex: 1, fontSize: 14, color: NAVY, background: "transparent", border: "none", outline: "none", fontWeight: 600 }} />
            </div>

            {/* Aadhaar (withdrawal only) */}
            {showForm === "withdrawal" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "11px 14px", marginBottom: 10, background: "#fafafa" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M16 10h2" /><path d="M16 14h2" /><circle cx="8" cy="12" r="2" /></svg>
                <input value={aadhaar} onChange={e => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="Aadhaar number (12 digits)" inputMode="numeric" maxLength={12}
                  style={{ flex: 1, fontSize: 14, color: NAVY, background: "transparent", border: "none", outline: "none", fontWeight: 600, fontFamily: "monospace", letterSpacing: "0.06em" }} />
                {aadhaar.length === 12 && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setShowForm(null); setAmount(""); setCustomer(""); setAadhaar(""); }}
                style={{ flex: 1, height: 50, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, fontWeight: 700, color: "#64748b", cursor: "pointer" }}>
                Cancel
              </button>
              <button style={{ flex: 2, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: txGrad, color: "#fff", fontSize: 15, fontWeight: 900, boxShadow: showForm === "withdrawal" ? "0 4px 14px rgba(220,38,38,0.35)" : "0 4px 14px rgba(5,150,105,0.35)" }}>
                Confirm {showForm === "withdrawal" ? "Withdrawal" : "Deposit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Opening Balance bottom sheet ── */}
      {showEditBalance && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(11,44,96,0.55)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 50, maxWidth: 390, margin: "0 auto" }}>
          <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "20px 20px 36px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IndianRupee size={22} color={SAFFRON} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>Edit Opening Balance</h3>
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>Corrects today's starting cash amount</p>
              </div>
            </div>

            {/* Opening balance input */}
            <div style={{ background: "rgba(249,115,22,0.06)", borderRadius: 16, padding: "14px 16px", border: "1.5px solid rgba(249,115,22,0.2)", marginBottom: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Opening Balance (₹)</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: SAFFRON }}>₹</span>
                <input type="number" min="0" step="0.01" value={newBalance} onChange={e => setNewBalance(e.target.value)}
                  style={{ flex: 1, fontSize: 32, fontWeight: 900, color: SAFFRON, background: "transparent", border: "none", outline: "none", padding: 0 }} />
              </div>
            </div>

            {/* New balance preview */}
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "11px 14px", marginBottom: 14, border: "1px solid #e2e8f0" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 6 }}>New balance after this change</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
                <span style={{ fontWeight: 800, color: SAFFRON }}>₹{parseFloat(newBalance || "0").toLocaleString("en-IN")}</span>
                <span style={{ color: RED, fontWeight: 700 }}>− ₹{s.totalWithdrawals.toLocaleString("en-IN")}</span>
                <span style={{ color: GREEN, fontWeight: 700 }}>+ ₹{s.totalDeposits.toLocaleString("en-IN")}</span>
                <span>=</span>
                <span style={{ fontWeight: 900, color: NAVY }}>
                  ₹{(parseFloat(newBalance || "0") - s.totalWithdrawals + s.totalDeposits).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowEditBalance(false)}
                style={{ flex: 1, height: 50, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, fontWeight: 700, color: "#64748b", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={() => setShowEditBalance(false)}
                style={{ flex: 2, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#c2410c,#f97316)", color: "#fff", fontSize: 15, fontWeight: 900, boxShadow: "0 4px 14px rgba(249,115,22,0.4)" }}>
                <CheckCircle2 size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                Save Balance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
