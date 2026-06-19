import { useState } from "react";
import { X, ChevronDown, Calendar, User, FileText, IndianRupee, CheckCircle2 } from "lucide-react";

const NAVY = "#0b2c60";
const SAFFRON = "#f97316";
const GREEN = "#059669";
const RED = "#e11d48";

const services = ["Aadhar Update", "PAN Card", "Income Certificate", "Passport", "Voter ID", "Ration Card", "Driving Licence", "Birth Certificate", "Caste Certificate", "NREGA"];

export default function AddEntryForm() {
  const [type, setType] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("0");
  const [customer, setCustomer] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [serviceOpen, setServiceOpen] = useState(false);

  const isCredit = type === "credit";
  const accentColor = isCredit ? GREEN : RED;
  const accentGrad = isCredit
    ? "linear-gradient(135deg, #064e3b, #059669)"
    : "linear-gradient(135deg, #881337, #e11d48)";
  const accentBg = isCredit ? "rgba(5,150,105,0.08)" : "rgba(225,29,72,0.08)";

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "rgba(11,44,96,0.5)", minHeight: "100vh", maxWidth: 390, margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>

      {/* Bottom sheet */}
      <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", overflow: "hidden", boxShadow: "0 -8px 40px rgba(11,44,96,0.18)" }}>

        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
        </div>

        {/* Header */}
        <div style={{ padding: "12px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>
            {isCredit ? "New Credit Entry" : "New Debit Entry"}
          </h2>
          <button style={{ width: 32, height: 32, borderRadius: 8, background: "#f1f5f9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} color="#64748b" />
          </button>
        </div>

        {/* Credit / Debit toggle */}
        <div style={{ margin: "0 20px 16px", background: "#f1f5f9", borderRadius: 14, padding: 4, display: "flex", gap: 4 }}>
          {(["credit", "debit"] as const).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                flex: 1, height: 40, borderRadius: 11, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, letterSpacing: "0.02em",
                background: type === t
                  ? (t === "credit" ? GREEN : RED)
                  : "transparent",
                color: type === t ? "#fff" : "#94a3b8",
                transition: "all 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              {t === "credit" ? "▲" : "▼"} {t === "credit" ? "Credit (Income)" : "Debit (Expense)"}
            </button>
          ))}
        </div>

        {/* Amount input — big and bold */}
        <div style={{ margin: "0 20px 16px" }}>
          <div style={{ background: accentBg, border: `2px solid ${accentColor}25`, borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: accentGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 12px ${accentColor}30` }}>
              <IndianRupee size={20} color="#fff" strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Amount</p>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{ width: "100%", fontSize: 28, fontWeight: 900, color: accentColor, background: "transparent", border: "none", outline: "none", padding: 0 }}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Fields */}
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Customer name */}
          <div style={{ position: "relative" }}>
            <User size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={customer}
              onChange={e => setCustomer(e.target.value)}
              placeholder="Customer name"
              style={{ width: "100%", height: 44, paddingLeft: 36, paddingRight: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fafafa", fontSize: 14, color: NAVY, outline: "none", boxSizing: "border-box", fontWeight: 600 }}
            />
          </div>

          {/* Service type */}
          <button
            onClick={() => setServiceOpen(!serviceOpen)}
            style={{ width: "100%", height: 44, paddingLeft: 12, paddingRight: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fafafa", fontSize: 14, color: service ? NAVY : "#94a3b8", outline: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: service ? 600 : 400, textAlign: "left" }}
          >
            <span>{service || "Select service type"}</span>
            <ChevronDown size={15} color="#94a3b8" />
          </button>

          {serviceOpen && (
            <div style={{ borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", overflow: "hidden", boxShadow: "0 4px 20px rgba(11,44,96,0.1)" }}>
              {services.map(s => (
                <button key={s} onClick={() => { setService(s); setServiceOpen(false); }}
                  style={{ display: "block", width: "100%", padding: "10px 14px", textAlign: "left", fontSize: 13, fontWeight: 600, color: s === service ? SAFFRON : NAVY, background: s === service ? "rgba(249,115,22,0.07)" : "transparent", border: "none", cursor: "pointer", borderBottom: "1px solid #f1f5f9" }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Date */}
          <div style={{ position: "relative" }}>
            <Calendar size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ width: "100%", height: 44, paddingLeft: 36, paddingRight: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fafafa", fontSize: 14, color: NAVY, outline: "none", boxSizing: "border-box", fontWeight: 600 }}
            />
          </div>

          {/* Note */}
          <div style={{ position: "relative" }}>
            <FileText size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: 14 }} />
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              rows={2}
              style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 12, paddingBottom: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fafafa", fontSize: 13, color: NAVY, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }}
            />
          </div>
        </div>

        {/* Submit */}
        <div style={{ padding: "14px 20px 28px" }}>
          <button style={{
            width: "100%", height: 52, borderRadius: 16, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${accentColor}, ${isCredit ? "#10b981" : "#f43f5e"})`,
            color: "#fff", fontSize: 16, fontWeight: 900, letterSpacing: "0.02em",
            boxShadow: `0 6px 20px ${accentColor}35`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <CheckCircle2 size={18} strokeWidth={2.5} />
            Save {isCredit ? "Credit" : "Debit"} Entry
          </button>
        </div>
      </div>
    </div>
  );
}
