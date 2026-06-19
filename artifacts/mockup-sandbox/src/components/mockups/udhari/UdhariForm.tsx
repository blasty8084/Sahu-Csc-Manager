import { useState } from "react";
import { X, ArrowUpRight, ArrowDownLeft, User, FileText, Calendar, CheckCircle2, IndianRupee } from "lucide-react";

const NAVY = "#0b2c60";
const ORANGE = "#ea580c";
const GREEN = "#059669";

export default function UdhariForm() {
  const [type, setType] = useState<"gave" | "got">("gave");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const isGave = type === "gave";
  const accentColor = isGave ? ORANGE : GREEN;
  const headerGrad = isGave
    ? "linear-gradient(145deg, #7c2d12, #ea580c)"
    : "linear-gradient(145deg, #064e3b, #059669)";
  const accentBg = isGave ? "rgba(234,88,12,0.08)" : "rgba(5,150,105,0.08)";
  const accentBorder = isGave ? "rgba(234,88,12,0.2)" : "rgba(5,150,105,0.2)";

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "rgba(11,44,96,0.5)", minHeight: "100vh", maxWidth: 390, margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>

      <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", overflow: "hidden", boxShadow: "0 -8px 40px rgba(11,44,96,0.18)" }}>

        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
        </div>

        {/* Colored header section */}
        <div style={{ background: headerGrad, margin: "12px 20px 0", borderRadius: 18, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -16, right: -16, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isGave ? <ArrowUpRight size={20} color="#fff" strokeWidth={2.5} /> : <ArrowDownLeft size={20} color="#fff" strokeWidth={2.5} />}
              </div>
              <div>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Udhari Khata</p>
                <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 900, lineHeight: 1.1, marginTop: 2 }}>
                  {isGave ? "You Gave" : "You Got"}
                </h3>
              </div>
            </div>
            <button style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={14} color="#fff" />
            </button>
          </div>

          {/* Customer chip */}
          <div style={{ marginTop: 12, background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={13} color="#fff" />
            </div>
            <div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Customer</p>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 800, marginTop: 1 }}>Ramesh Kumar</p>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 6, padding: "3px 8px" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>Balance: </span>
                <span style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>₹850 owed</span>
              </div>
            </div>
          </div>
        </div>

        {/* You Gave / You Got toggle */}
        <div style={{ margin: "14px 20px 0" }}>
          <div style={{ background: "#f1f5f9", borderRadius: 14, padding: 4, display: "flex", gap: 4 }}>
            <button
              onClick={() => setType("gave")}
              style={{ flex: 1, height: 44, borderRadius: 11, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 14, background: type === "gave" ? ORANGE : "transparent", color: type === "gave" ? "#fff" : "#94a3b8", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: type === "gave" ? "0 2px 10px rgba(234,88,12,0.35)" : "none" }}
            >
              <ArrowUpRight size={16} strokeWidth={2.5} />
              You Gave
            </button>
            <button
              onClick={() => setType("got")}
              style={{ flex: 1, height: 44, borderRadius: 11, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 14, background: type === "got" ? GREEN : "transparent", color: type === "got" ? "#fff" : "#94a3b8", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: type === "got" ? "0 2px 10px rgba(5,150,105,0.35)" : "none" }}
            >
              <ArrowDownLeft size={16} strokeWidth={2.5} />
              You Got
            </button>
          </div>
        </div>

        {/* Amount */}
        <div style={{ margin: "12px 20px 0" }}>
          <div style={{ background: accentBg, border: `2px solid ${accentBorder}`, borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: isGave ? "linear-gradient(135deg, #7c2d12, #ea580c)" : "linear-gradient(135deg, #064e3b, #059669)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 14px ${accentColor}35` }}>
              <IndianRupee size={20} color="#fff" strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>
                {isGave ? "Amount You Gave" : "Amount You Got"}
              </p>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                style={{ width: "100%", fontSize: 28, fontWeight: 900, color: accentColor, background: "transparent", border: "none", outline: "none", padding: 0 }}
              />
            </div>
          </div>
        </div>

        {/* Fields */}
        <div style={{ padding: "12px 20px 0", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Date */}
          <div style={{ position: "relative" }}>
            <Calendar size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ width: "100%", height: 44, paddingLeft: 36, paddingRight: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fafafa", fontSize: 14, color: NAVY, outline: "none", boxSizing: "border-box", fontWeight: 600 }} />
          </div>

          {/* Note */}
          <div style={{ position: "relative" }}>
            <FileText size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: 13 }} />
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note…" rows={2}
              style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 12, paddingBottom: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fafafa", fontSize: 13, color: NAVY, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
        </div>

        {/* New balance preview */}
        <div style={{ margin: "12px 20px 0", background: "#f8fafc", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>New balance after this entry</p>
          <p style={{ fontSize: 14, fontWeight: 900, color: accentColor }}>
            {isGave ? `₹${((850) + (parseFloat(amount) || 0)).toLocaleString("en-IN")} to collect` : `₹${Math.max(0, 850 - (parseFloat(amount) || 0)).toLocaleString("en-IN")} to collect`}
          </p>
        </div>

        {/* Submit */}
        <div style={{ padding: "14px 20px 32px" }}>
          <button style={{
            width: "100%", height: 52, borderRadius: 16, border: "none", cursor: "pointer",
            background: isGave ? "linear-gradient(135deg, #7c2d12, #ea580c)" : "linear-gradient(135deg, #064e3b, #059669)",
            color: "#fff", fontSize: 16, fontWeight: 900, letterSpacing: "0.02em",
            boxShadow: `0 6px 20px ${accentColor}40`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <CheckCircle2 size={18} strokeWidth={2.5} />
            Save — {isGave ? "You Gave" : "You Got"} Entry
          </button>
        </div>
      </div>
    </div>
  );
}
