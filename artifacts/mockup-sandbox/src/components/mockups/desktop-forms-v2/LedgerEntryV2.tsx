import { IndianRupee, Calendar, FileText, Tag, User, ArrowUpRight, ArrowDownLeft, CheckCircle2, TrendingUp, Wallet, Clock, Sparkles } from "lucide-react";

const navy = "#0b2c60";
const saffron = "#f97316";

export function LedgerEntryV2() {
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", fontFamily: "'Inter', system-ui, sans-serif", background: "#f8fafc", overflow: "hidden" }}>

      {/* ── LEFT INFO PANEL ── */}
      <div style={{ width: 380, flexShrink: 0, background: `linear-gradient(160deg, ${navy} 0%, #0f3872 55%, #1a4a9e 100%)`, display: "flex", flexDirection: "column", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(249,115,22,0.12)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "40%", right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48, position: "relative" }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: `linear-gradient(135deg,${saffron},#fb923c)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(249,115,22,0.40)" }}>
            <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
          </div>
          <div>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>SAHU </span>
            <span style={{ color: saffron, fontWeight: 900, fontSize: 16 }}>CSC</span>
          </div>
        </div>

        {/* Icon + Title */}
        <div style={{ position: "relative", marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: `linear-gradient(135deg,${saffron},#fb923c)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 28px rgba(249,115,22,0.45)", marginBottom: 20 }}>
            <Wallet size={30} color="#fff" />
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(249,115,22,0.18)", border: "1px solid rgba(249,115,22,0.30)", borderRadius: 8, padding: "4px 10px", marginBottom: 12 }}>
            <Sparkles size={10} color={saffron} />
            <span style={{ color: saffron, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>New Entry</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>Add Ledger<br />Transaction</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.7 }}>Record your daily service income and expenses. Every entry updates your running balance instantly.</p>
        </div>

        {/* Stats cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto", position: "relative" }}>
          {[
            { icon: TrendingUp, label: "Today's Credits", value: "₹4,200", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
            { icon: Wallet, label: "Running Balance", value: "₹17,850", color: saffron, bg: "rgba(249,115,22,0.12)" },
            { icon: Clock, label: "Last Entry", value: "2 hrs ago", color: "rgba(255,255,255,0.6)", bg: "rgba(255,255,255,0.07)" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, background: bg, borderRadius: 14, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={16} color={color} />
              </div>
              <div>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
                <p style={{ color: "#fff", fontSize: 15, fontWeight: 800, marginTop: 1 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: navy, margin: 0 }}>New Transaction</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>June 20, 2026 · Admin</p>
          </div>
          {/* Type toggle */}
          <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 14, padding: 4, gap: 4 }}>
            {[{ label: "Credit (+)", active: true, color: "#059669", grad: "linear-gradient(135deg,#059669,#10b981)" }, { label: "Debit (−)", active: false, color: "#e11d48", grad: "linear-gradient(135deg,#f43f5e,#e11d48)" }].map(({ label, active, color, grad }) => (
              <button key={label} style={{ padding: "8px 18px", borderRadius: 11, border: "none", cursor: "pointer", background: active ? grad : "transparent", color: active ? "#fff" : "#64748b", fontWeight: 700, fontSize: 13, transition: "all 0.15s", boxShadow: active ? `0 2px 10px ${color}35` : "none" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable form */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
          <div style={{ maxWidth: 620, display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Amount — hero field */}
            <div style={{ background: "linear-gradient(135deg,rgba(5,150,105,0.06),rgba(16,185,129,0.04))", border: "2px solid rgba(5,150,105,0.22)", borderRadius: 20, padding: "20px 24px" }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>Amount (₹) *</label>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 15, background: "linear-gradient(135deg,#059669,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(16,185,129,0.35)" }}>
                  <IndianRupee size={22} color="#fff" />
                </div>
                <input readOnly value="2,500.00" style={{ flex: 1, fontSize: 38, fontWeight: 900, color: "#059669", background: "transparent", border: "none", outline: "none", letterSpacing: "-0.02em" }} />
              </div>
              {/* Quick amounts */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                {[100, 250, 500, 1000, 2000, 5000].map(v => (
                  <button key={v} style={{ padding: "6px 14px", borderRadius: 9, fontSize: 12, fontWeight: 700, background: v === 2500 ? "linear-gradient(135deg,#059669,#10b981)" : "#fff", color: v === 2500 ? "#fff" : "#64748b", border: `1px solid ${v === 2500 ? "transparent" : "#e2e8f0"}`, cursor: "pointer", boxShadow: v === 2500 ? "0 2px 8px rgba(16,185,129,0.3)" : "none" }}>
                    ₹{v >= 1000 ? v / 1000 + "K" : v}
                  </button>
                ))}
              </div>
            </div>

            {/* 2-col grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Customer Name</label>
                <div style={{ position: "relative" }}>
                  <User size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input readOnly value="Ramesh Kumar" style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: navy, outline: "none", background: "#fff", boxSizing: "border-box", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Date</label>
                <div style={{ position: "relative" }}>
                  <Calendar size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input readOnly value="20 Jun 2026" style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: navy, outline: "none", background: "#fff", boxSizing: "border-box", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }} />
                </div>
              </div>
            </div>

            {/* Service type */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Service Type</label>
              <div style={{ position: "relative" }}>
                <Tag size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <select style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: navy, outline: "none", background: "#fff", appearance: "none", boxSizing: "border-box", boxShadow: "0 1px 4px rgba(11,44,96,0.06)", cursor: "pointer" }}>
                  <option>Aadhaar Card</option>
                  <option>PAN Card</option>
                  <option>Passport</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Description <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8", letterSpacing: 0 }}>(optional)</span></label>
              <div style={{ position: "relative" }}>
                <FileText size={15} style={{ position: "absolute", left: 14, top: 16, color: "#94a3b8" }} />
                <textarea rows={3} readOnly value="Aadhaar enrollment fee — counter service" style={{ width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 14, paddingBottom: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, color: navy, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", lineHeight: 1.6, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }} />
              </div>
            </div>

            {/* Balance preview */}
            <div style={{ background: "linear-gradient(135deg,rgba(11,44,96,0.04),rgba(26,74,158,0.04))", border: "1px solid rgba(11,44,96,0.10)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TrendingUp size={16} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Balance after this entry</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>Current ₹15,350 + Credit ₹2,500</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: "#059669" }}>₹17,850</p>
                <p style={{ fontSize: 10, color: "#94a3b8" }}>New balance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: "#fff", borderTop: "1px solid #f1f5f9", padding: "20px 40px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <button style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
          <button style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#059669,#10b981)", color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(16,185,129,0.35)" }}>
            <CheckCircle2 size={18} /> Save Credit Entry — ₹2,500
          </button>
        </div>
      </div>
    </div>
  );
}
