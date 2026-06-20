import { useState } from "react";

const icons = {
  user: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  fileText: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  arrowUp: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
    </svg>
  ),
  arrowDown: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
    </svg>
  ),
  rupee: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12M6 8h12M6 13l8.5 8L6 13" /><path d="M6 8a4 4 0 0 0 0 8" />
    </svg>
  ),
  x: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  fingerprint: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" /><path d="M5 19.5C5.5 18 6 15 6 12c0-1.7.7-3.2 1.8-4.3" /><path d="M17.5 4.5C19.1 6 20 8 20 12c0 3.5-.6 6.5-1.8 9" /><path d="M10.5 8.5A4 4 0 0 1 16 12c0 1.5-.2 3-.6 4.5" /><path d="M12 12c0 3-1 5.5-3 8" /><path d="M12 8c2.2 0 4 1.8 4 4" />
    </svg>
  ),
};

type TxType = "withdrawal" | "deposit";

export default function AepsEntryForm() {
  const [txType, setTxType] = useState<TxType>("withdrawal");
  const [amount, setAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isWithdrawal = txType === "withdrawal";

  // Design tokens
  const accentColor = isWithdrawal ? "#e11d48" : "#059669";
  const accentGrad = isWithdrawal
    ? "linear-gradient(135deg,#881337,#e11d48)"
    : "linear-gradient(135deg,#064e3b,#059669)";
  const accentBg = isWithdrawal ? "rgba(225,29,72,0.07)" : "rgba(5,150,105,0.07)";
  const accentBorder = isWithdrawal ? "rgba(225,29,72,0.2)" : "rgba(5,150,105,0.2)";
  const headerGrad = "linear-gradient(145deg,#0b2c60 0%,#1a4a9e 100%)";

  const amtNum = parseFloat(amount) || 0;
  const hasAmount = amtNum > 0;

  const handleSubmit = () => {
    if (!hasAmount || !customerName.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setAmount("");
      setCustomerName("");
      setDescription("");
    }, 2200);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 24, padding: "40px 32px", textAlign: "center", maxWidth: 320, width: "100%", boxShadow: "0 8px 32px rgba(11,44,96,0.1)" }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: isWithdrawal ? "linear-gradient(135deg,#881337,#e11d48)" : "linear-gradient(135deg,#064e3b,#059669)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: `0 8px 24px ${accentColor}40` }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0b2c60", marginBottom: 8 }}>Transaction Recorded!</h2>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>
            {isWithdrawal ? "Withdrawal" : "Deposit"} of <strong style={{ color: accentColor }}>₹{amtNum.toLocaleString("en-IN")}</strong> for <strong>{customerName}</strong> has been saved.
          </p>
          <div style={{ background: accentBg, border: `1.5px solid ${accentBorder}`, borderRadius: 14, padding: "12px 16px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Reference</p>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#0b2c60", fontFamily: "monospace" }}>AEPS-{Date.now().toString().slice(-8)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ── Navy gradient hero header ── */}
      <div style={{ background: headerGrad, padding: "20px 20px 32px", position: "relative", overflow: "hidden" }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(249,115,22,0.12)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: 10, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        {/* Title row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", marginBottom: 20 }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>AePS Cash</p>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 900, lineHeight: 1.05, margin: 0 }}>New Transaction</h1>
          </div>
          <button style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            {icons.x}
          </button>
        </div>

        {/* Withdrawal / Deposit toggle */}
        <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 16, padding: 4, display: "flex", gap: 4, position: "relative" }}>
          {(["withdrawal", "deposit"] as TxType[]).map(t => {
            const active = txType === t;
            const tGrad = t === "withdrawal"
              ? "linear-gradient(135deg,#881337,#e11d48)"
              : "linear-gradient(135deg,#064e3b,#059669)";
            const tGlow = t === "withdrawal" ? "rgba(225,29,72,0.5)" : "rgba(5,150,105,0.5)";
            return (
              <button key={t} onClick={() => setTxType(t)}
                style={{ flex: 1, height: 46, borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, background: active ? tGrad : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.45)", transition: "all 0.18s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: active ? `0 4px 14px ${tGlow}` : "none" }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", color: active ? "#fff" : "rgba(255,255,255,0.4)" }}>
                  {t === "withdrawal" ? icons.arrowUp : icons.arrowDown}
                </span>
                {t === "withdrawal" ? "Withdrawal" : "Deposit"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form card — overlaps the hero */}
      <div style={{ margin: "-16px 16px 0", background: "#fff", borderRadius: 24, boxShadow: "0 8px 32px rgba(11,44,96,0.1)", overflow: "hidden" }}>

        {/* ── Amount field ── */}
        <div style={{ background: accentBg, border: `0`, borderBottom: "1px solid #f1f5f9", padding: "18px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: accentGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 6px 16px ${accentColor}35`, color: "#fff" }}>
            {icons.rupee}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 3 }}>
              {isWithdrawal ? "Withdrawal Amount" : "Deposit Amount"}
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: hasAmount ? accentColor : "#cbd5e1" }}>₹</span>
              <input
                type="number" min="0" step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                style={{ flex: 1, fontSize: 32, fontWeight: 900, color: hasAmount ? accentColor : "#94a3b8", background: "transparent", border: "none", outline: "none", padding: 0, width: "100%", minWidth: 0 }}
              />
            </div>
          </div>
        </div>

        {/* ── Customer Name ── */}
        <div style={{ borderBottom: "1px solid #f1f5f9", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#64748b" }}>
            {icons.user}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Customer Name</p>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              style={{ width: "100%", fontSize: 15, fontWeight: 700, color: "#0b2c60", background: "transparent", border: "none", outline: "none", padding: 0 }}
            />
          </div>
        </div>

        {/* ── Description ── */}
        <div style={{ padding: "14px 20px", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#64748b", marginTop: 2 }}>
            {icons.fileText}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Note (optional)</p>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a note or reference…"
              rows={2}
              style={{ width: "100%", fontSize: 14, fontWeight: 500, color: "#0b2c60", background: "transparent", border: "none", outline: "none", padding: 0, resize: "none", fontFamily: "inherit", lineHeight: 1.5 }}
            />
          </div>
        </div>
      </div>

      {/* ── Biometric / AePS verification hint ── */}
      <div style={{ margin: "14px 16px 0", background: "rgba(11,44,96,0.04)", borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, border: "1.5px dashed rgba(11,44,96,0.14)" }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(11,44,96,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#0b2c60" }}>
          {icons.fingerprint}
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#0b2c60", marginBottom: 1 }}>Biometric Verification</p>
          <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>Customer's Aadhaar fingerprint or IRIS scan required for AePS transactions.</p>
        </div>
      </div>

      {/* ── Live balance preview (when amount entered) ── */}
      {hasAmount && (
        <div style={{ margin: "10px 16px 0", background: "#fff", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(11,44,96,0.05)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
            {isWithdrawal ? "Cash to disburse" : "Cash to collect"}
          </p>
          <p style={{ fontSize: 16, fontWeight: 900, color: accentColor }}>
            ₹{amtNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </div>
      )}

      {/* ── Submit button ── */}
      <div style={{ padding: "16px 16px 32px" }}>
        <button
          onClick={handleSubmit}
          disabled={!hasAmount || !customerName.trim()}
          style={{
            width: "100%", height: 56, borderRadius: 18, border: "none", cursor: (!hasAmount || !customerName.trim()) ? "not-allowed" : "pointer",
            background: (!hasAmount || !customerName.trim()) ? "#e2e8f0" : accentGrad,
            color: (!hasAmount || !customerName.trim()) ? "#94a3b8" : "#fff",
            fontSize: 16, fontWeight: 900, letterSpacing: "0.02em",
            boxShadow: (!hasAmount || !customerName.trim()) ? "none" : `0 8px 24px ${accentColor}40`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.2s",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{icons.check}</span>
          {isWithdrawal ? "Record Withdrawal" : "Record Deposit"}
        </button>

        {/* Quick switch hint */}
        <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 12, fontWeight: 500 }}>
          Wrong type?{" "}
          <button onClick={() => setTxType(isWithdrawal ? "deposit" : "withdrawal")}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#0b2c60", textDecoration: "underline" }}>
            Switch to {isWithdrawal ? "Deposit" : "Withdrawal"}
          </button>
        </p>
      </div>
    </div>
  );
}
