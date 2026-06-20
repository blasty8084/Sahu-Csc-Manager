import { Users, User, Phone, MapPin, Sparkles, Star, CheckCircle2, ArrowRight, UserPlus, TrendingUp } from "lucide-react";

const navy = "#0b2c60";
const saffron = "#f97316";

export function UdhariAddCustomerV2() {
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", fontFamily: "'Inter', system-ui, sans-serif", background: "#f8fafc", overflow: "hidden" }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ width: 380, flexShrink: 0, background: `linear-gradient(160deg, #7c2d12 0%, #c2410c 50%, ${saffron} 100%)`, display: "flex", flexDirection: "column", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(11,44,96,0.15)" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48, position: "relative" }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
          </div>
          <div><span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>SAHU </span><span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 900, fontSize: 16 }}>CSC</span></div>
        </div>

        {/* Icon + title */}
        <div style={{ position: "relative", marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,255,255,0.20)", border: "2px solid rgba(255,255,255,0.30)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <UserPlus size={30} color="#fff" />
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 8, padding: "4px 10px", marginBottom: 12 }}>
            <Sparkles size={10} color="#fff" />
            <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Udhari Khata</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>Add New<br />Customer</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.7 }}>Create a customer profile to start tracking what you gave and what you received.</p>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: "auto", position: "relative" }}>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>After adding customer</p>
          {["Add You Gave / You Got entries", "Send WhatsApp payment reminders", "Generate PDF account statement", "Track running balance in real-time"].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.10)" : "none" }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ArrowRight size={11} color="#fff" />
              </div>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: 500 }}>{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT FORM ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: navy, margin: 0 }}>Customer Details</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>Udhari Khata › Add Customer</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.20)", borderRadius: 10, padding: "6px 12px" }}>
            <TrendingUp size={13} color={saffron} />
            <span style={{ fontSize: 12, fontWeight: 700, color: saffron }}>12 Customers</span>
          </div>
        </div>

        {/* Form body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px" }}>
          <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Name — featured */}
            <div style={{ background: "linear-gradient(135deg,rgba(249,115,22,0.05),rgba(251,146,60,0.03))", border: "2px solid rgba(249,115,22,0.20)", borderRadius: 20, padding: "20px 24px" }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: saffron, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 10 }}>Customer Name *</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: `linear-gradient(135deg,${saffron},#fb923c)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(249,115,22,0.35)" }}>
                  <User size={20} color="#fff" />
                </div>
                <input readOnly value="Suresh Nayak" style={{ flex: 1, fontSize: 24, fontWeight: 800, color: navy, background: "transparent", border: "none", outline: "none" }} />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Mobile Number <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional)</span></label>
              <div style={{ position: "relative" }}>
                <Phone size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input readOnly value="+91  98765 43210" style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: navy, outline: "none", background: "#fff", boxSizing: "border-box", boxShadow: "0 1px 4px rgba(11,44,96,0.06)", letterSpacing: "0.03em" }} />
              </div>
            </div>

            {/* Address */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Address / Notes <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional)</span></label>
              <div style={{ position: "relative" }}>
                <MapPin size={15} style={{ position: "absolute", left: 14, top: 16, color: "#94a3b8" }} />
                <textarea rows={4} readOnly value={"Village: Baripada\nNear Post Office\nMayurbhanj, Odisha — 757001"} style={{ width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 14, paddingBottom: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, color: navy, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", lineHeight: 1.7, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }} />
              </div>
            </div>

            {/* Info card */}
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Star size={15} color="#059669" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#065f46", marginBottom: 2 }}>Starting Balance: ₹0.00</p>
                <p style={{ fontSize: 12, color: "#16a34a", lineHeight: 1.6 }}>You can add entries after creating the customer. Their balance will update automatically with each entry.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: "#fff", borderTop: "1px solid #f1f5f9", padding: "20px 40px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <button style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
          <button style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: `linear-gradient(135deg,#7c2d12,${saffron})`, color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(249,115,22,0.35)" }}>
            <UserPlus size={18} /> Add Customer — Suresh Nayak
          </button>
        </div>
      </div>
    </div>
  );
}
