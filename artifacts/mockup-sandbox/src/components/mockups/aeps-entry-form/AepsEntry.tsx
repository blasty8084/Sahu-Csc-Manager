import { useState } from "react";
import {
  ArrowDownLeft, ArrowUpRight, Fingerprint, User, FileText,
  IndianRupee, CheckCircle2, X, AlertCircle,
} from "lucide-react";

function fmt(n: string) {
  const num = parseFloat(n);
  if (isNaN(num) || n === "") return "0.00";
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2 }).format(num);
}

type TxType = "withdrawal" | "deposit";

function EntryForm({
  type,
  defaultAmount = "",
  defaultCustomer = "",
  defaultDesc = "",
  submitted = false,
}: {
  type: TxType;
  defaultAmount?: string;
  defaultCustomer?: string;
  defaultDesc?: string;
  submitted?: boolean;
}) {
  const [amount, setAmount] = useState(defaultAmount);
  const [customer, setCustomer] = useState(defaultCustomer);
  const [desc, setDesc] = useState(defaultDesc);
  const [isDone, setIsDone] = useState(submitted);

  const isWd = type === "withdrawal";
  const accent = isWd
    ? "linear-gradient(135deg, #f43f5e, #e11d48)"
    : "linear-gradient(135deg, #10b981, #059669)";
  const accentColor = isWd ? "#e11d48" : "#059669";
  const accentLight = isWd ? "rgba(244,63,94,0.08)" : "rgba(16,185,129,0.08)";
  const accentBorder = isWd ? "rgba(244,63,94,0.25)" : "rgba(16,185,129,0.25)";

  const isValid = parseFloat(amount) > 0 && customer.trim().length > 0;

  if (isDone) {
    return (
      <div className="flex-1 flex flex-col bg-white rounded-3xl overflow-hidden"
        style={{ boxShadow: "0 4px 32px rgba(11,44,96,0.12)", border: "1px solid rgba(11,44,96,0.07)" }}>
        <div style={{ height: 4, background: accent }} />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 py-10 text-center">
          <div style={{
            width: 72, height: 72, borderRadius: 22,
            background: accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 8px 24px ${accentColor}40`,
          }}>
            <CheckCircle2 size={36} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 22, fontWeight: 900, color: "#0b2c60" }}>Transaction Saved!</p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>
              {isWd ? "Withdrawal" : "Deposit"} of{" "}
              <span style={{ fontWeight: 800, color: accentColor }}>₹{fmt(amount)}</span>{" "}
              recorded for <span style={{ fontWeight: 700, color: "#0b2c60" }}>{customer}</span>
            </p>
          </div>
          <div className="w-full rounded-2xl px-5 py-4 text-left space-y-2"
            style={{ background: accentLight, border: `1px solid ${accentBorder}` }}>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Type</span>
              <span style={{
                fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                color: accentColor, background: accentLight,
              }}>{isWd ? "AePS Withdrawal" : "AePS Deposit"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Amount</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: accentColor }}>₹{fmt(amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Customer</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0b2c60" }}>{customer}</span>
            </div>
            {desc && (
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Note</span>
                <span style={{ fontSize: 11, color: "#64748b" }}>{desc}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={() => { setIsDone(false); setAmount(""); setCustomer(""); setDesc(""); }}
              className="flex-1 py-3 rounded-xl font-bold text-sm"
              style={{ border: `1.5px solid ${accentBorder}`, color: accentColor, background: accentLight }}>
              + New {isWd ? "Withdrawal" : "Deposit"}
            </button>
            <button className="flex-1 py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", boxShadow: "0 3px 12px rgba(11,44,96,0.25)" }}>
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-3xl overflow-hidden"
      style={{ boxShadow: "0 4px 32px rgba(11,44,96,0.12)", border: "1px solid rgba(11,44,96,0.07)" }}>
      {/* Accent stripe */}
      <div style={{ height: 4, background: accent }} />

      {/* Header */}
      <div className="px-7 pt-6 pb-5 flex items-center gap-4"
        style={{ borderBottom: "1px solid rgba(11,44,96,0.06)" }}>
        <div style={{
          width: 50, height: 50, borderRadius: 16, flexShrink: 0,
          background: accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 6px 20px ${accentColor}38`,
        }}>
          {isWd ? <ArrowDownLeft size={26} color="#fff" /> : <ArrowUpRight size={26} color="#fff" />}
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0b2c60", lineHeight: 1.1 }}>
            {isWd ? "AePS Withdrawal" : "AePS Deposit"}
          </h2>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>
            {isWd
              ? "Record cash given to customer via Aadhaar"
              : "Record cash received from customer via Aadhaar"}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Fingerprint size={18} style={{ color: "#cbd5e1" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#cbd5e1", letterSpacing: "0.06em" }}>AePS</span>
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 px-7 py-6 space-y-5 overflow-y-auto">

        {/* Amount field — prominent */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
            Amount *
          </label>
          <div className="relative">
            <div style={{
              position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
              width: 36, height: 36, borderRadius: 10,
              background: accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 3px 10px ${accentColor}30`,
            }}>
              <IndianRupee size={16} color="#fff" />
            </div>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              style={{
                width: "100%", height: 64, paddingLeft: 66, paddingRight: 20,
                borderRadius: 16,
                border: `2px solid ${amount && parseFloat(amount) > 0 ? accentColor : "#e2e8f0"}`,
                fontSize: 28, fontWeight: 900, color: "#0b2c60",
                outline: "none", boxSizing: "border-box",
                background: amount && parseFloat(amount) > 0 ? accentLight : "#fafbff",
                transition: "border-color 0.15s, background 0.15s",
              }}
            />
            {amount && parseFloat(amount) > 0 && (
              <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: accentColor }}>
                  ₹{fmt(amount)}
                </span>
              </div>
            )}
          </div>
          {/* Quick amount buttons */}
          <div className="flex gap-2 mt-2.5 flex-wrap">
            {[500, 1000, 2000, 5000, 10000].map(v => (
              <button key={v} onClick={() => setAmount(String(v))}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: amount === String(v) ? accent : "#f1f5f9",
                  color: amount === String(v) ? "#fff" : "#64748b",
                  border: amount === String(v) ? "none" : "1px solid #e2e8f0",
                  boxShadow: amount === String(v) ? `0 2px 8px ${accentColor}35` : "none",
                }}>
                ₹{v.toLocaleString("en-IN")}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Name */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
            Customer Name *
          </label>
          <div className="relative">
            <User size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              value={customer}
              onChange={e => setCustomer(e.target.value)}
              placeholder="Enter customer full name"
              style={{
                width: "100%", height: 46, paddingLeft: 36, paddingRight: 14,
                borderRadius: 12,
                border: `1.5px solid ${customer.trim() ? accentColor + "60" : "#e2e8f0"}`,
                fontSize: 14, fontWeight: 600, color: "#0b2c60",
                outline: "none", boxSizing: "border-box",
                background: customer.trim() ? accentLight : "#fff",
                transition: "border-color 0.15s, background 0.15s",
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
            Note / Bank Name <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
          </label>
          <div className="relative">
            <FileText size={14} style={{ position: "absolute", left: 14, top: 16, color: "#94a3b8" }} />
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="e.g. SBI Bank · Aadhaar linked, account no…"
              rows={2}
              style={{
                width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 12, paddingBottom: 12,
                borderRadius: 12, border: "1.5px solid #e2e8f0",
                fontSize: 13, color: "#0b2c60", resize: "none",
                outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                background: "#fff",
              }}
            />
          </div>
        </div>

        {/* Validation hint */}
        {!isValid && (amount !== "" || customer !== "") && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.20)" }}>
            <AlertCircle size={13} style={{ color: "#d97706", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#92400e", fontWeight: 600 }}>
              {parseFloat(amount) <= 0 || amount === "" ? "Enter a valid amount greater than ₹0" : "Customer name is required"}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-7 py-5 flex gap-3 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(11,44,96,0.06)" }}>
        <button className="px-5 py-3 rounded-xl font-bold text-sm"
          style={{ border: "1.5px solid #e2e8f0", color: "#64748b", background: "#f8fafc" }}>
          <X size={14} style={{ display: "inline", marginRight: 6 }} />
          Cancel
        </button>
        <button
          onClick={() => isValid && setIsDone(true)}
          className="flex-1 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
          style={{
            background: isValid ? accent : "#e2e8f0",
            color: isValid ? "#fff" : "#94a3b8",
            boxShadow: isValid ? `0 4px 16px ${accentColor}35` : "none",
            cursor: isValid ? "pointer" : "not-allowed",
            transition: "all 0.15s",
          }}>
          {isWd ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
          Save {isWd ? "Withdrawal" : "Deposit"}
        </button>
      </div>
    </div>
  );
}

export function AepsEntry() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Page header */}
      <div className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between flex-shrink-0"
        style={{ boxShadow: "0 1px 8px rgba(11,44,96,0.06)" }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#0b2c60,#1a4a9e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(11,44,96,0.30)",
          }}>
            <Fingerprint size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 900, color: "#0b2c60", lineHeight: 1.1 }}>AePS Transaction Entry</h1>
            <p style={{ fontSize: 11, color: "#94a3b8" }}>Record withdrawal or deposit via Aadhaar</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Today's Balance</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: "#059669" }}>₹2,000.00</p>
          </div>
          <div style={{ width: 1, height: 36, background: "#e2e8f0" }} />
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* Two forms side by side */}
      <div className="flex-1 flex gap-5 px-8 py-6">
        <EntryForm
          type="withdrawal"
          defaultAmount="5000"
          defaultCustomer="Ramesh Kumar Sahu"
          defaultDesc="SBI Bank · Aadhaar Linked"
        />
        <EntryForm
          type="deposit"
          defaultAmount=""
          defaultCustomer=""
          defaultDesc=""
        />
      </div>
    </div>
  );
}
