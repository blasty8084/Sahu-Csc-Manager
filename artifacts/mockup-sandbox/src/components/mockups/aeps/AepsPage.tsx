import { useState } from "react";
import { Fingerprint, Plus, ArrowUpRight, ArrowDownLeft, Wallet, ChevronLeft, ChevronRight, Receipt, Calendar } from "lucide-react";

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
    { id: 1, type: "withdrawal", customer: "Ramesh Kumar", amount: 500, balance: 4500, createdAt: "2026-06-19T09:15:00Z" },
    { id: 2, type: "deposit", customer: "Sunita Devi", amount: 300, balance: 4800, createdAt: "2026-06-19T10:30:00Z" },
    { id: 3, type: "withdrawal", customer: "Mohan Sahu", amount: 800, balance: 4000, createdAt: "2026-06-19T11:45:00Z" },
    { id: 4, type: "deposit", customer: "Poonam Yadav", amount: 650, balance: 4650, createdAt: "2026-06-19T12:20:00Z" },
    { id: 5, type: "withdrawal", customer: "Geeta Mishra", amount: 900, balance: 3750, createdAt: "2026-06-19T14:10:00Z" },
  ],
};

type TxType = "withdrawal" | "deposit";

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
          <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{isW ? "Withdrawal" : "Deposit"} · {t}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 900, color, lineHeight: 1 }}>{isW ? "−" : "+"}₹{tx.amount.toLocaleString("en-IN")}</p>
          <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>Bal ₹{tx.balance.toLocaleString("en-IN")}</p>
          <button style={{ marginTop: 4, width: 22, height: 22, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "auto" }}>
            <Receipt size={11} color="#64748b" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AepsPage() {
  const [tab, setTab] = useState<"daily" | "all">("daily");
  const [showForm, setShowForm] = useState<null | TxType>(null);
  const [amount, setAmount] = useState("");
  const [customer, setCustomer] = useState("");

  const s = sessionData;

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh", maxWidth: 390, margin: "0 auto", overflowX: "hidden" }}>

      {/* Hero header */}
      <div style={{ background: `linear-gradient(145deg, ${NAVY} 0%, #1a4a9e 100%)`, padding: "20px 20px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(249,115,22,0.12)" }} />

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

        {/* Balance row */}
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.12)", marginBottom: 14, position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Cash Balance</p>
              <p style={{ color: "#fff", fontSize: 28, fontWeight: 900, lineHeight: 1 }}>₹{s.currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(249,115,22,0.2)", border: "1px solid rgba(249,115,22,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wallet size={22} color={SAFFRON} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
            {[
              { label: "Opening", val: s.openingBalance, color: "rgba(255,255,255,0.8)" },
              { label: "Withdrawals", val: s.totalWithdrawals, color: "#fca5a5" },
              { label: "Deposits", val: s.totalDeposits, color: "#86efac" },
            ].map(item => (
              <div key={item.label} style={{ textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</p>
                <p style={{ color: item.color, fontSize: 12, fontWeight: 900, marginTop: 2 }}>₹{item.val.toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, position: "relative" }}>
          <button
            onClick={() => setShowForm("withdrawal")}
            style={{ height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #7f1d1d, #dc2626)", color: "#fff", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: "0 4px 14px rgba(220,38,38,0.4)" }}
          >
            <ArrowUpRight size={18} strokeWidth={2.5} />
            Withdrawal
          </button>
          <button
            onClick={() => setShowForm("deposit")}
            style={{ height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #064e3b, #059669)", color: "#fff", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: "0 4px 14px rgba(5,150,105,0.4)" }}
          >
            <ArrowDownLeft size={18} strokeWidth={2.5} />
            Deposit
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

      {/* Transaction form overlay */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(11,44,96,0.55)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 50, maxWidth: 390, margin: "0 auto" }}>
          <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "20px 20px 36px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
            </div>
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
            <div style={{ background: showForm === "withdrawal" ? "rgba(220,38,38,0.06)" : "rgba(5,150,105,0.06)", borderRadius: 14, padding: "12px 16px", border: `1.5px solid ${showForm === "withdrawal" ? "rgba(220,38,38,0.15)" : "rgba(5,150,105,0.15)"}`, marginBottom: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Amount</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: showForm === "withdrawal" ? RED : GREEN }}>₹</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                  style={{ flex: 1, fontSize: 28, fontWeight: 900, color: showForm === "withdrawal" ? RED : GREEN, background: "transparent", border: "none", outline: "none", padding: 0 }} />
              </div>
            </div>

            {/* Customer name */}
            <input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Customer name (Aadhaar holder)"
              style={{ width: "100%", height: 46, paddingLeft: 14, paddingRight: 14, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fafafa", fontSize: 14, color: NAVY, outline: "none", boxSizing: "border-box", fontWeight: 600, marginBottom: 12 }} />

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowForm(null)} style={{ flex: 1, height: 50, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, fontWeight: 700, color: "#64748b", cursor: "pointer" }}>Cancel</button>
              <button style={{ flex: 2, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: showForm === "withdrawal" ? "linear-gradient(135deg, #7f1d1d, #dc2626)" : "linear-gradient(135deg, #064e3b, #059669)", color: "#fff", fontSize: 15, fontWeight: 900, boxShadow: showForm === "withdrawal" ? "0 4px 14px rgba(220,38,38,0.35)" : "0 4px 14px rgba(5,150,105,0.35)" }}>
                Confirm {showForm === "withdrawal" ? "Withdrawal" : "Deposit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
