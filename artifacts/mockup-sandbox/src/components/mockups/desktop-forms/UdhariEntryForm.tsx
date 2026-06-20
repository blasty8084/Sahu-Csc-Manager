import { X, ArrowUpRight, ArrowDownLeft, CheckCircle2, Calendar, FileText, IndianRupee } from "lucide-react";

const navy = "#0b2c60";
const saffron = "#f97316";

export function UdhariEntryForm() {
  const isGave = true;
  const accentColor = isGave ? "#ea580c" : "#059669";
  const accentGrad = isGave ? "linear-gradient(135deg,#7c2d12,#ea580c)" : "linear-gradient(135deg,#064e3b,#059669)";
  const accentBg = isGave ? "rgba(234,88,12,0.06)" : "rgba(5,150,105,0.06)";
  const accentBorder = isGave ? "rgba(234,88,12,0.25)" : "rgba(5,150,105,0.25)";
  const headerGrad = isGave ? "linear-gradient(135deg,#7c2d12 0%,#c2410c 60%,#ea580c 100%)" : "linear-gradient(135deg,#064e3b 0%,#065f46 60%,#059669 100%)";

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

      {/* Fake content */}
      <div style={{ position: "absolute", left: 220, top: 0, right: 0, bottom: 0, padding: "28px", opacity: 0.3, zIndex: 1 }}>
        <div style={{ height: 36, background: "#dde4f0", borderRadius: 10, width: 180, marginBottom: 16 }} />
        <div style={{ height: 80, background: "#fff", borderRadius: 16, marginBottom: 14 }} />
        {[1,2,3,4].map(i => <div key={i} style={{ height: 56, background: "#fff", borderRadius: 12, marginBottom: 8 }} />)}
      </div>

      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(11,44,96,0.22)", backdropFilter: "blur(4px)", zIndex: 10 }} />

      {/* Desktop slide-in panel */}
      <div style={{ position: "absolute", right: 0, top: 0, height: "100%", width: 500, background: "#fff", zIndex: 20, boxShadow: "-16px 0 60px rgba(11,44,96,0.22)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Accent stripe */}
        <div style={{ height: 4, background: isGave ? "linear-gradient(90deg,#ea580c,#f97316)" : "linear-gradient(90deg,#059669,#10b981)", flexShrink: 0 }} />

        {/* Header */}
        <div style={{ background: headerGrad, padding: "22px 28px 20px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: "rgba(255,255,255,0.20)", border: "1.5px solid rgba(255,255,255,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isGave ? <ArrowUpRight size={22} color="#fff" strokeWidth={2.5} /> : <ArrowDownLeft size={22} color="#fff" strokeWidth={2.5} />}
              </div>
              <div>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>Udhari Khata</p>
                <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 900, lineHeight: 1.1 }}>{isGave ? "You Gave" : "You Got"}</h2>
              </div>
            </div>
            <button style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={16} color="#fff" />
            </button>
          </div>
          {/* Customer chip */}
          <div style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,0.20)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>SN</span>
            </div>
            <div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Customer</p>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Suresh Nayak</p>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Current Balance</p>
              <p style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>₹3,200 (Owes You)</p>
            </div>
          </div>
          {/* Type toggle */}
          <div style={{ marginTop: 14, background: "rgba(255,255,255,0.10)", borderRadius: 14, padding: 4, display: "flex", gap: 4 }}>
            {[{ label: "You Gave", icon: ArrowUpRight, active: isGave }, { label: "You Got", icon: ArrowDownLeft, active: !isGave }].map(({ label, icon: Icon, active }) => (
              <button key={label} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 11, fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer", background: active ? "rgba(255,255,255,0.22)" : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.48)" }}>
                <Icon size={14} strokeWidth={2.5} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 8px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Amount */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Amount *</p>
            <div style={{ background: accentBg, border: `2px solid ${accentBorder}`, borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: accentGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 12px ${accentColor}35` }}>
                <IndianRupee size={18} color="#fff" />
              </div>
              <input readOnly value="1,500" style={{ flex: 1, fontSize: 32, fontWeight: 900, color: accentColor, background: "transparent", border: "none", outline: "none" }} />
            </div>
          </div>

          {/* Date */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Date</p>
            <div style={{ position: "relative" }}>
              <Calendar size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input readOnly value="2026-06-20" style={{ width: "100%", height: 48, paddingLeft: 38, paddingRight: 14, borderRadius: 13, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: navy, outline: "none", background: "#fafafa", boxSizing: "border-box" }} />
            </div>
          </div>

          {/* Note */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Note <span style={{ fontWeight: 400, textTransform: "none", color: "#cbd5e1" }}>(optional)</span></p>
            <div style={{ position: "relative" }}>
              <FileText size={14} style={{ position: "absolute", left: 14, top: 13, color: "#94a3b8" }} />
              <textarea rows={2} readOnly value="Gave money for grocery shopping" style={{ width: "100%", paddingLeft: 38, paddingRight: 14, paddingTop: 12, paddingBottom: 12, borderRadius: 13, border: "1.5px solid #e2e8f0", fontSize: 13, color: navy, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fafafa", lineHeight: 1.5 }} />
            </div>
          </div>

          {/* Balance preview */}
          <div style={{ background: accentBg, border: `1px solid ${accentBorder}`, borderRadius: 14, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>New balance after this entry</p>
              <p style={{ fontSize: 10, fontWeight: 500, color: "#94a3b8", marginTop: 2 }}>Suresh Nayak will owe you ₹4,700</p>
            </div>
            <p style={{ fontSize: 18, fontWeight: 900, color: accentColor }}>₹4,700</p>
          </div>
        </div>

        {/* Sticky footer */}
        <div style={{ padding: "16px 28px 28px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 12 }}>
          <button style={{ flex: 1, height: 52, borderRadius: 16, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
          <button style={{ flex: 2, height: 52, borderRadius: 16, border: "none", cursor: "pointer", background: accentGrad, color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 6px 20px ${accentColor}35` }}>
            <CheckCircle2 size={18} /> Save — You Gave
          </button>
        </div>
      </div>
    </div>
  );
}
