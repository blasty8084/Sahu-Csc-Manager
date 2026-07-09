import { IndianRupee, Calendar, FileText, Tag, User, X, ArrowDownLeft, ArrowUpRight, CheckCircle2, PlusCircle } from "lucide-react";

const navy = "#0b2c60";
const saffron = "#f97316";

export function LedgerEntryForm() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#f0f4fa", display: "flex", overflow: "hidden", position: "relative", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Simulated page background */}
      <div style={{ flex: 1, padding: "32px 28px", overflow: "hidden" }}>
        {/* Fake sidebar strip */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 220, height: "100%", background: navy, opacity: 0.97 }}>
          <div style={{ padding: "28px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 18, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: saffron, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
              </div>
              <span>SAHU <span style={{ color: saffron }}>CSC</span></span>
            </div>
            {["Dashboard", "Ledger", "AePS", "Udhari Khata", "Reports", "Services"].map((item, i) => (
              <div key={item} style={{ padding: "10px 14px", borderRadius: 12, background: i === 1 ? "rgba(249,115,22,0.18)" : "transparent", color: i === 1 ? saffron : "rgba(255,255,255,0.55)", fontWeight: i === 1 ? 700 : 500, fontSize: 13, cursor: "pointer" }}>{item}</div>
            ))}
          </div>
        </div>

        {/* Fake main content */}
        <div style={{ marginLeft: 220, padding: "0 0 0 28px", opacity: 0.35 }}>
          <div style={{ height: 40, background: "#dde4f0", borderRadius: 10, width: 220, marginBottom: 24 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 90, background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(11,44,96,0.08)" }} />)}
          </div>
          <div style={{ height: 320, background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(11,44,96,0.08)" }} />
        </div>
      </div>

      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(11,44,96,0.22)", backdropFilter: "blur(4px)", zIndex: 10 }} />

      {/* Desktop slide-in panel */}
      <div style={{ position: "absolute", right: 0, top: 0, height: "100%", width: 500, background: "#fff", zIndex: 20, boxShadow: "-16px 0 60px rgba(11,44,96,0.22)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Accent stripe */}
        <div style={{ height: 4, background: `linear-gradient(90deg,${navy},${saffron})`, flexShrink: 0 }} />

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg,${navy} 0%,#0f3872 60%,#1a4a9e 100%)`, padding: "22px 28px 20px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -20, left: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(249,115,22,0.12)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: `linear-gradient(135deg,${saffron},#fb923c)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(249,115,22,0.45)" }}>
                <PlusCircle size={22} color="#fff" />
              </div>
              <div>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>New Entry</p>
                <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 900, lineHeight: 1.1 }}>Add Ledger Entry</h2>
              </div>
            </div>
            <button style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={16} color="#fff" />
            </button>
          </div>
          {/* Type toggle */}
          <div style={{ marginTop: 16, background: "rgba(255,255,255,0.10)", borderRadius: 14, padding: 4, display: "flex", gap: 4 }}>
            {[{ label: "Credit (+)", icon: ArrowUpRight, active: true, color: "#10b981" }, { label: "Debit (−)", icon: ArrowDownLeft, active: false, color: "#f43f5e" }].map(({ label, icon: Icon, active, color }) => (
              <button key={label} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 11, fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer", background: active ? `linear-gradient(135deg,#059669,#10b981)` : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.5)", boxShadow: active ? "0 3px 10px rgba(16,185,129,0.45)" : "none", transition: "all 0.18s" }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 8px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Amount */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Amount *</p>
            <div style={{ background: "rgba(16,185,129,0.05)", border: "2px solid rgba(16,185,129,0.30)", borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: "linear-gradient(135deg,#059669,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(16,185,129,0.35)" }}>
                <IndianRupee size={18} color="#fff" />
              </div>
              <input readOnly value="2,500" style={{ flex: 1, fontSize: 32, fontWeight: 900, color: "#059669", background: "transparent", border: "none", outline: "none" }} />
            </div>
          </div>

          {/* 2-col grid: Customer + Date */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Customer Name</p>
              <div style={{ position: "relative" }}>
                <User size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input readOnly value="Ramesh Kumar" style={{ width: "100%", height: 46, paddingLeft: 34, paddingRight: 12, borderRadius: 13, border: "1.5px solid rgba(11,44,96,0.20)", fontSize: 13, fontWeight: 600, color: navy, outline: "none", background: "rgba(11,44,96,0.03)", boxSizing: "border-box" }} />
              </div>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Date</p>
              <div style={{ position: "relative" }}>
                <Calendar size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input readOnly value="2026-06-20" style={{ width: "100%", height: 46, paddingLeft: 34, paddingRight: 12, borderRadius: 13, border: "1.5px solid rgba(11,44,96,0.20)", fontSize: 13, fontWeight: 600, color: navy, outline: "none", background: "rgba(11,44,96,0.03)", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>

          {/* Service Type */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Service Type</p>
            <div style={{ position: "relative" }}>
              <Tag size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <select style={{ width: "100%", height: 46, paddingLeft: 34, paddingRight: 12, borderRadius: 13, border: "1.5px solid rgba(11,44,96,0.20)", fontSize: 13, fontWeight: 600, color: navy, outline: "none", background: "rgba(11,44,96,0.03)", appearance: "none", boxSizing: "border-box", cursor: "pointer" }}>
                <option>Aadhaar Card</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Description <span style={{ fontWeight: 400, textTransform: "none", color: "#cbd5e1" }}>(optional)</span></p>
            <div style={{ position: "relative" }}>
              <FileText size={14} style={{ position: "absolute", left: 12, top: 13, color: "#94a3b8" }} />
              <textarea rows={2} readOnly value="Payment for Aadhaar enrollment" style={{ width: "100%", paddingLeft: 34, paddingRight: 14, paddingTop: 11, paddingBottom: 11, borderRadius: 13, border: "1.5px solid #e2e8f0", fontSize: 13, color: navy, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", lineHeight: 1.5 }} />
            </div>
          </div>

          {/* Balance preview */}
          <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)", borderRadius: 14, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Running balance after this entry</span>
            <span style={{ fontSize: 16, fontWeight: 900, color: "#059669" }}>₹12,750.00</span>
          </div>
        </div>

        {/* Sticky footer */}
        <div style={{ padding: "16px 28px 28px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 12 }}>
          <button style={{ flex: 1, height: 52, borderRadius: 16, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
          <button style={{ flex: 2, height: 52, borderRadius: 16, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#059669,#10b981)", color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(16,185,129,0.35)" }}>
            <CheckCircle2 size={18} /> Save Entry
          </button>
        </div>
      </div>
    </div>
  );
}
