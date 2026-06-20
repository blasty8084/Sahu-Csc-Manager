import { Users, X, User, Phone, MapPin, CheckCircle2, Star } from "lucide-react";

const navy = "#0b2c60";
const saffron = "#f97316";

export function UdhariAddCustomer() {
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
            <div key={item} style={{ padding: "10px 14px", borderRadius: 12, background: i === 3 ? "rgba(249,115,22,0.18)" : "transparent", color: i === 3 ? saffron : "rgba(255,255,255,0.55)", fontWeight: i === 3 ? 700 : 500, fontSize: 13 }}>{item}</div>
          ))}
        </div>
      </div>

      {/* Fake main content */}
      <div style={{ position: "absolute", left: 220, top: 0, right: 0, bottom: 0, padding: "28px", opacity: 0.3, zIndex: 1 }}>
        <div style={{ height: 40, background: "#dde4f0", borderRadius: 10, width: 200, marginBottom: 20 }} />
        {/* Customer cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ height: 100, background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(11,44,96,0.08)", padding: 16 }}>
              <div style={{ height: 14, width: "60%", background: "#e2e8f0", borderRadius: 6, marginBottom: 8 }} />
              <div style={{ height: 12, width: "40%", background: "#f1f5f9", borderRadius: 6 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(11,44,96,0.22)", backdropFilter: "blur(4px)", zIndex: 10 }} />

      {/* Desktop slide-in panel */}
      <div style={{ position: "absolute", right: 0, top: 0, height: "100%", width: 480, background: "#fff", zIndex: 20, boxShadow: "-16px 0 60px rgba(11,44,96,0.22)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Saffron stripe */}
        <div style={{ height: 4, background: `linear-gradient(90deg,${saffron},#fb923c)`, flexShrink: 0 }} />

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg,${navy} 0%,#0f3872 60%,#1a4a9e 100%)`, padding: "22px 28px 20px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", bottom: -20, left: -20, width: 90, height: 90, borderRadius: "50%", background: "rgba(249,115,22,0.10)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: `linear-gradient(135deg,${saffron},#fb923c)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(249,115,22,0.45)" }}>
                <Users size={22} color="#fff" />
              </div>
              <div>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>Udhari Khata</p>
                <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 900, lineHeight: 1.1 }}>Add New Customer</h2>
              </div>
            </div>
            <button style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={16} color="#fff" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px 8px", display: "flex", flexDirection: "column", gap: 22 }}>

          {/* Name */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Customer Name *</p>
            <div style={{ position: "relative" }}>
              <User size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input readOnly value="Suresh Nayak" style={{ width: "100%", height: 50, paddingLeft: 38, paddingRight: 14, borderRadius: 14, border: `2px solid rgba(11,44,96,0.25)`, fontSize: 14, fontWeight: 600, color: navy, outline: "none", background: "rgba(11,44,96,0.03)", boxSizing: "border-box" }} />
            </div>
          </div>

          {/* Mobile */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Mobile <span style={{ fontWeight: 400, textTransform: "none", color: "#cbd5e1" }}>(optional)</span></p>
            <div style={{ position: "relative" }}>
              <Phone size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input readOnly value="9876543210" style={{ width: "100%", height: 50, paddingLeft: 38, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: navy, outline: "none", background: "#fafafa", boxSizing: "border-box" }} />
            </div>
          </div>

          {/* Address / Notes */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Address / Notes <span style={{ fontWeight: 400, textTransform: "none", color: "#cbd5e1" }}>(optional)</span></p>
            <div style={{ position: "relative" }}>
              <MapPin size={14} style={{ position: "absolute", left: 14, top: 13, color: "#94a3b8" }} />
              <textarea rows={3} readOnly value="Village: Baripada, Near Post Office, Mayurbhanj" style={{ width: "100%", paddingLeft: 38, paddingRight: 14, paddingTop: 12, paddingBottom: 12, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 13, color: navy, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fafafa", lineHeight: 1.6 }} />
            </div>
          </div>

          {/* Info box */}
          <div style={{ background: "rgba(11,44,96,0.04)", border: "1px solid rgba(11,44,96,0.10)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
            <Star size={14} style={{ color: saffron, flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>You can add You Gave / You Got entries after creating the customer. The starting balance will be ₹0.00.</p>
          </div>
        </div>

        {/* Sticky footer */}
        <div style={{ padding: "16px 28px 28px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 12 }}>
          <button style={{ flex: 1, height: 52, borderRadius: 16, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
          <button style={{ flex: 2, height: 52, borderRadius: 16, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${navy},#1a4a9e)`, color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(11,44,96,0.30)" }}>
            <Users size={18} /> Add Customer
          </button>
        </div>
      </div>
    </div>
  );
}
