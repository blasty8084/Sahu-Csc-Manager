import { ArrowUpRight, IndianRupee, User, Fingerprint, Building2, Hash, FileText, Eye, Sparkles, Wallet, ShieldCheck, CheckCircle2 } from "lucide-react";

const navy = "#0b2c60";
const saffron = "#f97316";
const accentColor = "#059669";
const accent = "linear-gradient(135deg,#10b981,#059669)";

const BANKS = ["SBI – State Bank of India", "Bank of Baroda", "Punjab National Bank", "Union Bank", "Canara Bank", "HDFC Bank", "ICICI Bank", "Axis Bank"];
const QUICK = [500, 1000, 2000, 5000, 10000, 20000];

export function AepsDepositV2() {
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", fontFamily: "'Inter', system-ui, sans-serif", background: "#f8fafc", overflow: "hidden" }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ width: 380, flexShrink: 0, background: "linear-gradient(160deg,#052e16 0%,#064e3b 50%,#059669 100%)", display: "flex", flexDirection: "column", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(0,0,0,0.12)" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, position: "relative" }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
          </div>
          <div><span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>SAHU CSC</span></div>
        </div>

        {/* Icon + Title */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
            <ArrowUpRight size={30} color="#fff" strokeWidth={2.5} />
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 8, padding: "4px 10px", marginBottom: 10 }}>
            <Sparkles size={10} color="#6ee7b7" />
            <span style={{ color: "#6ee7b7", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>AePS Deposit</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>Aadhaar-Based<br />Cash Deposit</h1>
          <p style={{ color: "rgba(255,255,255,0.58)", fontSize: 13, lineHeight: 1.7 }}>Biometric cash deposit using Aadhaar authentication. Amount added to your AePS daily session.</p>
        </div>

        {/* Session balance */}
        <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 16, padding: "18px 20px", marginBottom: 16, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Wallet size={14} color="rgba(255,255,255,0.55)" />
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Today's Session Balance</p>
          </div>
          <p style={{ color: "#fff", fontSize: 32, fontWeight: 900 }}>₹17,500</p>
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.10)", borderRadius: 8, padding: "8px 10px" }}>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, fontWeight: 600, textTransform: "uppercase" }}>Deposits</p>
              <p style={{ color: "#6ee7b7", fontSize: 13, fontWeight: 800, marginTop: 2 }}>₹3,000</p>
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.10)", borderRadius: 8, padding: "8px 10px" }}>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, fontWeight: 600, textTransform: "uppercase" }}>Total Balance</p>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 800, marginTop: 2 }}>₹20,500</p>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 12, padding: "12px 14px" }}>
          <ShieldCheck size={16} color="rgba(255,255,255,0.7)" />
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, lineHeight: 1.5 }}>Secured by Aadhaar UIDAI biometric authentication</p>
        </div>
      </div>

      {/* ── RIGHT FORM ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: navy, margin: 0 }}>New Deposit</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>AePS · 20 Jun 2026 · Session active</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.18)", borderRadius: 10, padding: "6px 12px" }}>
            <ArrowUpRight size={13} color={accentColor} strokeWidth={2.5} />
            <span style={{ fontSize: 12, fontWeight: 700, color: accentColor }}>Deposit</span>
          </div>
        </div>

        {/* Form body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 40px" }}>
          <div style={{ maxWidth: 620, display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Amount — hero */}
            <div style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.07),rgba(5,150,105,0.03))", border: "2px solid rgba(5,150,105,0.22)", borderRadius: 20, padding: "20px 24px" }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 10 }}>Deposit Amount (₹) *</label>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 15, background: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(16,185,129,0.30)" }}>
                  <IndianRupee size={22} color="#fff" />
                </div>
                <input readOnly value="2,000.00" style={{ flex: 1, fontSize: 38, fontWeight: 900, color: accentColor, background: "transparent", border: "none", outline: "none", letterSpacing: "-0.02em" }} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {QUICK.map(v => (
                  <button key={v} style={{ padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, background: v === 2000 ? accent : "#fff", color: v === 2000 ? "#fff" : "#64748b", border: `1px solid ${v === 2000 ? "transparent" : "#e2e8f0"}`, cursor: "pointer", boxShadow: v === 2000 ? "0 2px 8px rgba(16,185,129,0.25)" : "none" }}>
                    ₹{v >= 1000 ? v / 1000 + "K" : v}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer + Aadhaar */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Customer Name *</label>
                <div style={{ position: "relative" }}>
                  <User size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input readOnly value="Priya Devi" style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: navy, outline: "none", background: "#fff", boxSizing: "border-box", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Aadhaar Number * <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(12 digits)</span></label>
                <div style={{ position: "relative" }}>
                  <Fingerprint size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input readOnly value="XXXX XXXX 7890" style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 40, borderRadius: 14, border: `1.5px solid rgba(11,44,96,0.22)`, fontSize: 14, fontWeight: 700, color: navy, outline: "none", background: "rgba(11,44,96,0.02)", boxSizing: "border-box", fontFamily: "monospace", letterSpacing: "0.05em", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }} />
                  <Eye size={14} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                </div>
                <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
                  {Array.from({ length: 12 }).map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: accentColor }} />)}
                </div>
              </div>
            </div>

            {/* Bank + Account */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Bank Name *</label>
                <div style={{ position: "relative" }}>
                  <Building2 size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", zIndex: 1 }} />
                  <select style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: navy, outline: "none", background: "#fff", appearance: "none", boxSizing: "border-box", boxShadow: "0 1px 4px rgba(11,44,96,0.06)", cursor: "pointer" }}>
                    {BANKS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Account Number <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional)</span></label>
                <div style={{ position: "relative" }}>
                  <Hash size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input readOnly value="XX3456789012" style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: navy, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "monospace", letterSpacing: "0.04em", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }} />
                </div>
              </div>
            </div>

            {/* Note */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Note <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional)</span></label>
              <div style={{ position: "relative" }}>
                <FileText size={15} style={{ position: "absolute", left: 14, top: 16, color: "#94a3b8" }} />
                <textarea rows={2} placeholder="Additional notes…" style={{ width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 14, paddingBottom: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, color: navy, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", lineHeight: 1.5 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: "#fff", borderTop: "1px solid #f1f5f9", padding: "20px 40px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <button style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
          <button style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: accent, color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(16,185,129,0.28)" }}>
            <CheckCircle2 size={18} /> Review Deposit — ₹2,000
          </button>
        </div>
      </div>
    </div>
  );
}
