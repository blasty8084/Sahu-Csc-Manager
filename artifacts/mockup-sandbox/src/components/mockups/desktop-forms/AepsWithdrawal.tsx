import { X, ArrowDownLeft, IndianRupee, User, Fingerprint, Building2, FileText, Eye, AlertCircle } from "lucide-react";

const navy = "#0b2c60";
const saffron = "#f97316";
const accentColor = "#e11d48";
const accent = "linear-gradient(135deg,#f43f5e,#e11d48)";
const accentLight = "rgba(244,63,94,0.07)";
const accentBorder = "rgba(244,63,94,0.22)";

const BANKS = ["SBI", "Bank of Baroda", "PNB", "Union Bank", "Canara Bank", "HDFC Bank"];
const QUICK = [500, 1000, 2000, 5000, 10000];

export function AepsWithdrawal() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#f0f4fa", display: "flex", overflow: "hidden", position: "relative", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Sidebar */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 220, height: "100%", background: navy, opacity: 0.97, zIndex: 1 }}>
        <div style={{ padding: "28px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: 18, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: saffron, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
            </div>
            <span>SAHU <span style={{ color: saffron }}>CSC</span></span>
          </div>
          {["Dashboard", "Ledger", "AePS", "Udhari Khata", "Reports", "Services"].map((item, i) => (
            <div key={item} style={{ padding: "10px 14px", borderRadius: 12, background: i === 2 ? "rgba(249,115,22,0.18)" : "transparent", color: i === 2 ? saffron : "rgba(255,255,255,0.55)", fontWeight: i === 2 ? 700 : 500, fontSize: 13 }}>{item}</div>
          ))}
        </div>
      </div>

      {/* Fake AePS content */}
      <div style={{ position: "absolute", left: 220, top: 0, right: 0, bottom: 0, padding: "28px", opacity: 0.3, zIndex: 1 }}>
        <div style={{ height: 36, background: "#dde4f0", borderRadius: 10, width: 160, marginBottom: 20 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div style={{ height: 80, background: "#fff", borderRadius: 16 }} />
          <div style={{ height: 80, background: "#fff", borderRadius: 16 }} />
        </div>
        <div style={{ height: 200, background: "#fff", borderRadius: 16 }} />
      </div>

      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(11,44,96,0.22)", backdropFilter: "blur(4px)", zIndex: 10 }} />

      {/* Desktop slide-in panel */}
      <div style={{ position: "absolute", right: 0, top: 0, height: "100%", width: 560, background: "#fff", zIndex: 20, boxShadow: "-16px 0 60px rgba(11,44,96,0.22)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Accent stripe */}
        <div style={{ height: 4, background: "linear-gradient(90deg,#f43f5e,#e11d48)", flexShrink: 0 }} />

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg,${navy} 0%,#0f3872 60%,#1a4a9e 100%)`, padding: "18px 28px 14px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>AePS Transaction</p>
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 900, lineHeight: 1.1, marginTop: 2 }}>New AePS Withdrawal</h2>
            </div>
            <button style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={16} color="#fff" />
            </button>
          </div>
          {/* Type toggle */}
          <div style={{ display: "flex", borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.10)", padding: 4, gap: 4 }}>
            <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 12, fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#f43f5e,#e11d48)", color: "#fff", boxShadow: "0 3px 10px rgba(244,63,94,0.45)" }}>
              <ArrowDownLeft size={14} /> Withdrawal
            </button>
            <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 12, fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.48)" }}>
              <ArrowDownLeft size={14} style={{ transform: "rotate(180deg)" }} /> Deposit
            </button>
          </div>
        </div>

        {/* Scrollable form */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 8px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Amount card */}
          <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(11,44,96,0.08)", border: "1px solid rgba(11,44,96,0.06)" }}>
            <div style={{ height: 3, background: accent }} />
            <div style={{ padding: "16px 20px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Amount *</p>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: 11, background: accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 3px 8px ${accentColor}28` }}>
                  <IndianRupee size={16} color="#fff" />
                </div>
                <input readOnly value="5000" style={{ width: "100%", height: 58, paddingLeft: 62, paddingRight: 16, borderRadius: 14, border: `2px solid ${accentColor}`, fontSize: 28, fontWeight: 900, color: navy, outline: "none", boxSizing: "border-box", background: accentLight }} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {QUICK.map(v => (
                  <button key={v} style={{ padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, background: v === 5000 ? accent : "#f1f5f9", color: v === 5000 ? "#fff" : "#64748b", border: v === 5000 ? "none" : "1px solid #e2e8f0", cursor: "pointer" }}>
                    ₹{v >= 1000 ? v / 1000 + "K" : v}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: accentColor, marginTop: 8, fontWeight: 600 }}>After withdrawal: ₹12,500.00</p>
            </div>
          </div>

          {/* Customer + Aadhaar side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Customer Name *</p>
              <div style={{ position: "relative" }}>
                <User size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input readOnly value="Ramesh Kumar" style={{ width: "100%", height: 46, paddingLeft: 34, paddingRight: 12, borderRadius: 13, border: `1.5px solid rgba(11,44,96,0.25)`, fontSize: 13, fontWeight: 600, color: navy, outline: "none", background: "rgba(11,44,96,0.03)", boxSizing: "border-box" }} />
              </div>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Aadhaar * <span style={{ fontSize: 9, fontWeight: 400, color: "#cbd5e1" }}>(12 digits)</span></p>
              <div style={{ position: "relative" }}>
                <Fingerprint size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input readOnly value="XXXX XXXX 4521" style={{ width: "100%", height: 46, paddingLeft: 34, paddingRight: 36, borderRadius: 13, border: `1.5px solid rgba(11,44,96,0.25)`, fontSize: 13, fontWeight: 700, color: navy, outline: "none", background: "rgba(11,44,96,0.03)", boxSizing: "border-box", fontFamily: "monospace", letterSpacing: "0.06em" }} />
                <Eye size={13} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              </div>
              <div style={{ display: "flex", gap: 2, marginTop: 5 }}>
                {Array.from({ length: 12 }).map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: navy }} />)}
              </div>
            </div>
          </div>

          {/* Bank */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Bank Name *</p>
            <div style={{ position: "relative" }}>
              <Building2 size={13} style={{ position: "absolute", left: 12, top: 16, color: "#94a3b8", zIndex: 1 }} />
              <select style={{ width: "100%", height: 46, paddingLeft: 34, paddingRight: 12, borderRadius: 13, border: `1.5px solid rgba(11,44,96,0.25)`, fontSize: 13, fontWeight: 600, color: navy, outline: "none", background: "rgba(11,44,96,0.03)", appearance: "none", boxSizing: "border-box", cursor: "pointer" }}>
                <option>SBI – State Bank of India</option>
                {BANKS.slice(1).map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Note <span style={{ fontWeight: 400, textTransform: "none", color: "#cbd5e1" }}>(optional)</span></p>
            <div style={{ position: "relative" }}>
              <FileText size={13} style={{ position: "absolute", left: 12, top: 13, color: "#94a3b8" }} />
              <textarea rows={2} style={{ width: "100%", paddingLeft: 34, paddingRight: 14, paddingTop: 11, paddingBottom: 11, borderRadius: 13, border: "1.5px solid #e2e8f0", fontSize: 13, color: navy, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", lineHeight: 1.5 }} placeholder="Additional notes…" />
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div style={{ padding: "16px 28px 28px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 12 }}>
          <button style={{ flex: 1, height: 52, borderRadius: 16, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
          <button style={{ flex: 2, height: 52, borderRadius: 16, border: "none", cursor: "pointer", background: accent, color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 6px 20px ${accentColor}30` }}>
            <ArrowDownLeft size={16} /> Review Withdrawal
          </button>
        </div>
      </div>
    </div>
  );
}
