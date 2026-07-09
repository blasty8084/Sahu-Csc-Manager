import { ArrowUpRight, ArrowDownLeft, IndianRupee, Calendar, FileText, CheckCircle2, Sparkles, TrendingUp, TrendingDown, History } from "lucide-react";

const navy = "#0b2c60";
const saffron = "#f97316";
const isGave = true;
const accentColor = isGave ? "#ea580c" : "#059669";
const accentGrad = isGave ? "linear-gradient(135deg,#7c2d12,#ea580c)" : "linear-gradient(135deg,#064e3b,#059669)";
const leftGrad = isGave
  ? "linear-gradient(160deg, #7c2d12 0%, #b45309 55%, #ea580c 100%)"
  : "linear-gradient(160deg, #064e3b 0%, #065f46 55%, #059669 100%)";

export function UdhariEntryV2() {
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", fontFamily: "'Inter', system-ui, sans-serif", background: "#f8fafc", overflow: "hidden" }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ width: 380, flexShrink: 0, background: leftGrad, display: "flex", flexDirection: "column", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -70, right: -70, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ position: "absolute", bottom: -50, left: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(0,0,0,0.10)" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, position: "relative" }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,0.20)", border: "1.5px solid rgba(255,255,255,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
          </div>
          <div><span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>SAHU CSC</span></div>
        </div>

        {/* Customer card */}
        <div style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 18, padding: "16px 18px", marginBottom: 24, position: "relative" }}>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Customer</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: "rgba(255,255,255,0.20)", border: "2px solid rgba(255,255,255,0.30)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>SN</span>
            </div>
            <div>
              <p style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>Suresh Nayak</p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>+91 98765 43210</p>
            </div>
          </div>
        </div>

        {/* Balance display */}
        <div style={{ marginBottom: 24, position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 10px", marginBottom: 10 }}>
            <Sparkles size={10} color="#fff" />
            <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Udhari Khata</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, lineHeight: 1.2, marginBottom: 6 }}>{isGave ? "You Gave" : "You Got"}</h1>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 13, lineHeight: 1.6 }}>{isGave ? "Record money you lent to this customer." : "Record money you received from this customer."}</p>
        </div>

        {/* Current balance */}
        <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 16, padding: "18px 20px", marginBottom: 16, position: "relative" }}>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Current Balance</p>
          <p style={{ color: "#fff", fontSize: 30, fontWeight: 900 }}>₹3,200</p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 4 }}>Suresh owes you ₹3,200</p>
        </div>

        {/* Recent entries */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <History size={12} color="rgba(255,255,255,0.45)" />
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Recent</p>
          </div>
          {[{ type: "gave", amount: "₹1,000", date: "18 Jun", note: "Grocery" }, { type: "got", amount: "₹500", date: "15 Jun", note: "Returned" }].map(({ type, amount, date, note }) => (
            <div key={date} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: type === "gave" ? "rgba(244,63,94,0.25)" : "rgba(16,185,129,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {type === "gave" ? <TrendingUp size={11} color="#fca5a5" /> : <TrendingDown size={11} color="#6ee7b7" />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600 }}>{note}</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{date}</p>
              </div>
              <p style={{ color: type === "gave" ? "#fca5a5" : "#6ee7b7", fontSize: 13, fontWeight: 700 }}>{amount}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT FORM ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: navy, margin: 0 }}>{isGave ? "You Gave Entry" : "You Got Entry"}</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>Udhari Khata › Suresh Nayak</p>
          </div>
          {/* Type toggle */}
          <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 14, padding: 4, gap: 4 }}>
            {[
              { label: "You Gave", icon: ArrowUpRight, active: isGave, grad: "linear-gradient(135deg,#7c2d12,#ea580c)", shadow: "rgba(234,88,12,0.35)" },
              { label: "You Got", icon: ArrowDownLeft, active: !isGave, grad: "linear-gradient(135deg,#064e3b,#059669)", shadow: "rgba(5,150,105,0.35)" },
            ].map(({ label, icon: Icon, active, grad, shadow }) => (
              <button key={label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 11, border: "none", cursor: "pointer", background: active ? grad : "transparent", color: active ? "#fff" : "#64748b", fontWeight: 700, fontSize: 13, boxShadow: active ? `0 2px 10px ${shadow}` : "none" }}>
                <Icon size={14} strokeWidth={2.5} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Form body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
          <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Amount — hero */}
            <div style={{ background: isGave ? "linear-gradient(135deg,rgba(234,88,12,0.06),rgba(249,115,22,0.03))" : "linear-gradient(135deg,rgba(5,150,105,0.06),rgba(16,185,129,0.03))", border: `2px solid ${isGave ? "rgba(234,88,12,0.22)" : "rgba(5,150,105,0.22)"}`, borderRadius: 20, padding: "20px 24px" }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>{isGave ? "Amount You Gave (₹)" : "Amount You Got (₹)"}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 15, background: accentGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 14px ${accentColor}35` }}>
                  <IndianRupee size={22} color="#fff" />
                </div>
                <input readOnly value="1,500.00" style={{ flex: 1, fontSize: 38, fontWeight: 900, color: accentColor, background: "transparent", border: "none", outline: "none", letterSpacing: "-0.02em" }} />
              </div>
            </div>

            {/* Date */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Date</label>
              <div style={{ position: "relative" }}>
                <Calendar size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input readOnly value="20 Jun 2026" style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: navy, outline: "none", background: "#fff", boxSizing: "border-box", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }} />
              </div>
            </div>

            {/* Note */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Note <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional)</span></label>
              <div style={{ position: "relative" }}>
                <FileText size={15} style={{ position: "absolute", left: 14, top: 16, color: "#94a3b8" }} />
                <textarea rows={3} readOnly value="Given for grocery and medicine" style={{ width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 14, paddingBottom: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, color: navy, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", lineHeight: 1.6, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }} />
              </div>
            </div>

            {/* Balance preview */}
            <div style={{ background: isGave ? "rgba(234,88,12,0.05)" : "rgba(5,150,105,0.05)", border: `1px solid ${isGave ? "rgba(234,88,12,0.18)" : "rgba(5,150,105,0.18)"}`, borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Balance after this entry</p>
                <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>₹3,200 {isGave ? "+ ₹1,500 you gave" : "− ₹1,500 you got"} = ₹{isGave ? "4,700" : "1,700"}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: accentColor }}>₹{isGave ? "4,700" : "1,700"}</p>
                <p style={{ fontSize: 10, color: "#94a3b8" }}>{isGave ? "Suresh owes you" : "Suresh owes you"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: "#fff", borderTop: "1px solid #f1f5f9", padding: "20px 40px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <button style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
          <button style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: accentGrad, color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 6px 20px ${accentColor}35` }}>
            <CheckCircle2 size={18} /> Save — {isGave ? "You Gave" : "You Got"} ₹1,500
          </button>
        </div>
      </div>
    </div>
  );
}
