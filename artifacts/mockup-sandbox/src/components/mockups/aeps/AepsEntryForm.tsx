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
  idCard: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M16 10h2" /><path d="M16 14h2" /><path d="M6 10h1" /><path d="M6 14a2 2 0 1 1 4 0" /><circle cx="8" cy="7.5" r="2" />
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
  shield: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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

// Format raw digits as XXXX XXXX XXXX
function formatAadhaar(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export default function AepsEntryForm() {
  const [txType, setTxType] = useState<TxType>("withdrawal");
  const [amount, setAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isWithdrawal = txType === "withdrawal";
  const aadhaarDigits = aadhaar.replace(/\D/g, "");
  const aadhaarValid = aadhaarDigits.length === 12;

  const accentColor = isWithdrawal ? "#e11d48" : "#059669";
  const accentGrad = isWithdrawal
    ? "linear-gradient(135deg,#881337,#e11d48)"
    : "linear-gradient(135deg,#064e3b,#059669)";
  const accentBg = isWithdrawal ? "rgba(225,29,72,0.07)" : "rgba(5,150,105,0.07)";
  const accentBorder = isWithdrawal ? "rgba(225,29,72,0.2)" : "rgba(5,150,105,0.2)";
  const headerGrad = "linear-gradient(145deg,#0b2c60 0%,#1a4a9e 100%)";

  const amtNum = parseFloat(amount) || 0;
  const hasAmount = amtNum > 0;
  const canSubmit = hasAmount && customerName.trim() && (!isWithdrawal || aadhaarValid);

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setAmount(""); setCustomerName(""); setAadhaar(""); setDescription("");
    }, 2200);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
        <div style={{ background: "#fff", borderRadius: 24, padding: "40px 28px", textAlign: "center", maxWidth: 340, width: "100%", boxShadow: "0 8px 32px rgba(11,44,96,0.12)" }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: accentGrad, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: `0 8px 24px ${accentColor}40` }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0b2c60", marginBottom: 8 }}>Transaction Recorded!</h2>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
            {isWithdrawal ? "Withdrawal" : "Deposit"} of <strong style={{ color: accentColor }}>₹{amtNum.toLocaleString("en-IN")}</strong><br />for <strong>{customerName}</strong>
          </p>
          <div style={{ background: accentBg, border: `1.5px solid ${accentBorder}`, borderRadius: 12, padding: "10px 14px", marginBottom: 10 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Reference</p>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#0b2c60", fontFamily: "monospace" }}>AEPS-{Date.now().toString().slice(-8)}</p>
          </div>
          {isWithdrawal && (
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "10px 14px", border: "1px solid #e2e8f0" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Aadhaar (masked)</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#0b2c60", fontFamily: "monospace" }}>XXXX XXXX {aadhaarDigits.slice(-4)}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {/* ── Navy gradient hero header ── */}
      <div style={{ background: headerGrad, padding: "20px 20px 32px", position: "relative", overflow: "hidden" }}>
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
            const tGrad = t === "withdrawal" ? "linear-gradient(135deg,#881337,#e11d48)" : "linear-gradient(135deg,#064e3b,#059669)";
            const tGlow = t === "withdrawal" ? "rgba(225,29,72,0.5)" : "rgba(5,150,105,0.5)";
            return (
              <button key={t} onClick={() => setTxType(t)}
                style={{ flex: 1, height: 46, borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, background: active ? tGrad : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.45)", transition: "all 0.18s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: active ? `0 4px 14px ${tGlow}` : "none" }}>
                <span style={{ display: "flex", alignItems: "center", color: active ? "#fff" : "rgba(255,255,255,0.4)" }}>
                  {t === "withdrawal" ? icons.arrowUp : icons.arrowDown}
                </span>
                {t === "withdrawal" ? "Withdrawal" : "Deposit"}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Form card ── */}
      <div style={{ margin: "-16px 16px 0", background: "#fff", borderRadius: 24, boxShadow: "0 8px 32px rgba(11,44,96,0.10)", overflow: "hidden" }}>

        {/* Amount */}
        <div style={{ background: accentBg, borderBottom: "1px solid #f1f5f9", padding: "18px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: accentGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 6px 16px ${accentColor}35`, color: "#fff" }}>
            {icons.rupee}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 3 }}>
              {isWithdrawal ? "Withdrawal Amount" : "Deposit Amount"}
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: hasAmount ? accentColor : "#cbd5e1" }}>₹</span>
              <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                style={{ flex: 1, fontSize: 32, fontWeight: 900, color: hasAmount ? accentColor : "#94a3b8", background: "transparent", border: "none", outline: "none", padding: 0, minWidth: 0 }} />
            </div>
          </div>
        </div>

        {/* Customer Name */}
        <div style={{ borderBottom: "1px solid #f1f5f9", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#64748b" }}>
            {icons.user}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Customer Name</p>
            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
              placeholder="Aadhaar card holder's name"
              style={{ width: "100%", fontSize: 15, fontWeight: 700, color: "#0b2c60", background: "transparent", border: "none", outline: "none", padding: 0 }} />
          </div>
        </div>

        {/* ── Aadhaar Number (Withdrawal only) ── */}
        {isWithdrawal && (
          <div style={{ borderBottom: "1px solid #f1f5f9", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, background: aadhaarValid ? "rgba(11,44,96,0.02)" : "transparent" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: aadhaarValid ? "#0b2c60" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: aadhaarValid ? "#fff" : "#64748b", transition: "all 0.2s" }}>
              {icons.idCard}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Aadhaar Number</p>
                {aadhaarDigits.length > 0 && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: aadhaarValid ? "#059669" : "#f97316", display: "flex", alignItems: "center", gap: 3 }}>
                    {aadhaarValid ? (
                      <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Verified</>
                    ) : (
                      <>{12 - aadhaarDigits.length} digits left</>
                    )}
                  </span>
                )}
              </div>
              <input
                type="text" inputMode="numeric" maxLength={14}
                value={formatAadhaar(aadhaar)}
                onChange={e => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
                placeholder="XXXX XXXX XXXX"
                style={{ width: "100%", fontSize: 20, fontWeight: 900, color: aadhaarValid ? "#0b2c60" : "#0b2c60", background: "transparent", border: "none", outline: "none", padding: 0, letterSpacing: "0.08em", fontFamily: "monospace" }}
              />
            </div>
          </div>
        )}

        {/* Description */}
        <div style={{ padding: "14px 20px", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#64748b", marginTop: 2 }}>
            {icons.fileText}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Note (optional)</p>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              placeholder="Add a note or reference…"
              style={{ width: "100%", fontSize: 14, fontWeight: 500, color: "#0b2c60", background: "transparent", border: "none", outline: "none", padding: 0, resize: "none", fontFamily: "inherit", lineHeight: 1.5 }} />
          </div>
        </div>
      </div>

      {/* ── Aadhaar validation hint (withdrawal, not yet complete) ── */}
      {isWithdrawal && !aadhaarValid && (
        <div style={{ margin: "12px 16px 0", background: "rgba(11,44,96,0.04)", borderRadius: 14, padding: "11px 14px", display: "flex", alignItems: "center", gap: 10, border: "1.5px dashed rgba(11,44,96,0.14)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(11,44,96,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#0b2c60" }}>
            {icons.fingerprint}
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#0b2c60", marginBottom: 1 }}>Biometric + Aadhaar Required</p>
            <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>Enter 12-digit Aadhaar number. Customer's fingerprint/IRIS will be authenticated via NPCI.</p>
          </div>
        </div>
      )}

      {/* ── Security badge (withdrawal, aadhaar valid) ── */}
      {isWithdrawal && aadhaarValid && (
        <div style={{ margin: "12px 16px 0", background: "rgba(5,150,105,0.06)", borderRadius: 14, padding: "11px 14px", display: "flex", alignItems: "center", gap: 10, border: "1.5px solid rgba(5,150,105,0.2)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(5,150,105,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#059669" }}>
            {icons.shield}
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#059669", marginBottom: 1 }}>Aadhaar Verified ✓</p>
            <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>Authenticated via UIDAI. Proceeding with biometric scan.</p>
          </div>
        </div>
      )}

      {/* ── Cash preview ── */}
      {hasAmount && (
        <div style={{ margin: "10px 16px 0", background: "#fff", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(11,44,96,0.05)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>{isWithdrawal ? "Cash to disburse" : "Cash to collect"}</p>
          <p style={{ fontSize: 16, fontWeight: 900, color: accentColor }}>₹{amtNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
        </div>
      )}

      {/* ── Submit ── */}
      <div style={{ padding: "16px 16px 32px" }}>
        <button onClick={handleSubmit} disabled={!canSubmit}
          style={{ width: "100%", height: 56, borderRadius: 18, border: "none", cursor: canSubmit ? "pointer" : "not-allowed", background: canSubmit ? accentGrad : "#e2e8f0", color: canSubmit ? "#fff" : "#94a3b8", fontSize: 16, fontWeight: 900, letterSpacing: "0.02em", boxShadow: canSubmit ? `0 8px 24px ${accentColor}40` : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
          <span style={{ display: "flex", alignItems: "center" }}>{icons.check}</span>
          {isWithdrawal ? "Record Withdrawal" : "Record Deposit"}
        </button>
        {isWithdrawal && !aadhaarValid && aadhaarDigits.length === 0 && (
          <p style={{ textAlign: "center", fontSize: 11, color: "#f97316", marginTop: 10, fontWeight: 600 }}>⚠ Aadhaar number required for withdrawals</p>
        )}
        {isWithdrawal && aadhaarDigits.length > 0 && !aadhaarValid && (
          <p style={{ textAlign: "center", fontSize: 11, color: "#f97316", marginTop: 10, fontWeight: 600 }}>⚠ Aadhaar must be 12 digits ({12 - aadhaarDigits.length} remaining)</p>
        )}
        <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: isWithdrawal ? 6 : 12, fontWeight: 500 }}>
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
