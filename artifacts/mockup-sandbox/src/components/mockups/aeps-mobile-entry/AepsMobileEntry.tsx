import { useState } from "react";
import {
  ArrowDownLeft, ArrowUpRight, ChevronLeft, Fingerprint,
  IndianRupee, User, CreditCard, Building2, Hash,
  FileText, CheckCircle2, AlertCircle, Eye, EyeOff,
} from "lucide-react";

type TxType = "withdrawal" | "deposit";

function fmt(n: string | number) {
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (isNaN(num) || n === "") return "0.00";
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2 }).format(num);
}

function maskAadhaar(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 12);
  const groups = [];
  for (let i = 0; i < digits.length; i += 4) groups.push(digits.slice(i, i + 4));
  return groups.join(" ");
}

const BANKS = [
  "State Bank of India (SBI)",
  "Punjab National Bank (PNB)",
  "Bank of India (BOI)",
  "Bank of Baroda (BOB)",
  "Canara Bank",
  "Union Bank of India",
  "Central Bank of India",
  "Indian Bank",
  "UCO Bank",
  "Post Office (IPPB)",
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

type Step = "form" | "confirm" | "success";

export function AepsMobileEntry() {
  const [txType, setTxType] = useState<TxType>("withdrawal");
  const [step, setStep] = useState<Step>("form");

  // Form fields
  const [amount, setAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [note, setNote] = useState("");

  // Validation
  const aadhaarDigits = aadhaar.replace(/\D/g, "");
  const amtNum = parseFloat(amount);
  const isValidAmount = !isNaN(amtNum) && amtNum > 0;
  const isValidName = customerName.trim().length >= 2;
  const isValidAadhaar = aadhaarDigits.length === 12;
  const isValidBank = bankName.trim().length > 0;
  const isFormValid = isValidAmount && isValidName && isValidAadhaar && isValidBank;

  const isWd = txType === "withdrawal";
  const accent = isWd ? "linear-gradient(135deg, #f43f5e, #e11d48)" : "linear-gradient(135deg, #10b981, #059669)";
  const accentColor = isWd ? "#e11d48" : "#059669";
  const accentLight = isWd ? "rgba(244,63,94,0.07)" : "rgba(16,185,129,0.07)";
  const accentBorder = isWd ? "rgba(244,63,94,0.22)" : "rgba(16,185,129,0.22)";

  const resetForm = () => {
    setStep("form");
    setAmount("");
    setCustomerName("");
    setAadhaar("");
    setBankName("");
    setAccountNo("");
    setNote("");
    setShowAadhaar(false);
  };

  const displayAadhaar = showAadhaar
    ? maskAadhaar(aadhaar)
    : aadhaarDigits.length > 0
      ? "XXXX XXXX " + aadhaarDigits.slice(-4)
      : "";

  // ── Success screen ────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#0b2c60 0%,#1a4a9e 100%)" }}>
          <div style={{ height: 3, background: "linear-gradient(90deg,#0b2c60,#f97316)" }} />
          <div className="flex items-center gap-3 px-4 py-4">
            <button onClick={resetForm} style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={18} color="#fff" />
            </button>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Transaction Complete</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 gap-5">
          {/* Success icon */}
          <div style={{ width: 80, height: 80, borderRadius: 24, background: accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 32px ${accentColor}45` }}>
            <CheckCircle2 size={42} color="#fff" />
          </div>

          <div className="text-center">
            <p style={{ fontSize: 22, fontWeight: 900, color: "#0b2c60", lineHeight: 1.1 }}>
              {isWd ? "Withdrawal" : "Deposit"} Recorded!
            </p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>
              AePS transaction saved successfully
            </p>
          </div>

          {/* Receipt card */}
          <div className="w-full bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 4px 24px rgba(11,44,96,0.12)", border: "1px solid rgba(11,44,96,0.07)" }}>
            <div style={{ height: 4, background: accent }} />
            <div className="px-5 py-5 space-y-3">
              {/* Amount highlight */}
              <div className="text-center py-3 rounded-2xl" style={{ background: accentLight, border: `1px solid ${accentBorder}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {isWd ? "Amount Withdrawn" : "Amount Deposited"}
                </p>
                <p style={{ fontSize: 32, fontWeight: 900, color: accentColor, lineHeight: 1.1, marginTop: 4 }}>₹{fmt(amount)}</p>
              </div>

              {[
                { label: "Customer", value: customerName },
                { label: "Aadhaar", value: "XXXX XXXX " + aadhaarDigits.slice(-4) },
                { label: "Bank", value: bankName },
                ...(accountNo ? [{ label: "Account No", value: "XX" + accountNo.slice(-4) }] : []),
                ...(note ? [{ label: "Note", value: note }] : []),
                { label: "Date & Time", value: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-3 py-2"
                  style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#0b2c60", textAlign: "right" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="w-full flex flex-col gap-3">
            <button className="w-full py-4 rounded-2xl font-bold text-white text-sm"
              style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", boxShadow: "0 4px 16px rgba(11,44,96,0.30)" }}>
              Print / Share Receipt
            </button>
            <button onClick={resetForm}
              className="w-full py-3.5 rounded-2xl font-bold text-sm"
              style={{ border: `1.5px solid ${accentBorder}`, color: accentColor, background: accentLight }}>
              + New {isWd ? "Withdrawal" : "Deposit"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Confirm screen ────────────────────────────────────────────────
  if (step === "confirm") {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ background: "linear-gradient(135deg,#0b2c60 0%,#1a4a9e 100%)" }}>
          <div style={{ height: 3, background: "linear-gradient(90deg,#0b2c60,#f97316)" }} />
          <div className="flex items-center gap-3 px-4 py-4">
            <button onClick={() => setStep("form")} style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={18} color="#fff" />
            </button>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Confirm Transaction</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.60)" }}>Review before saving</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-5 space-y-4">
          {/* Amount card */}
          <div className="rounded-3xl overflow-hidden" style={{ boxShadow: "0 4px 20px rgba(11,44,96,0.12)" }}>
            <div style={{ height: 4, background: accent }} />
            <div className="bg-white px-5 py-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div style={{ width: 32, height: 32, borderRadius: 9, background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isWd ? <ArrowDownLeft size={16} color="#fff" /> : <ArrowUpRight size={16} color="#fff" />}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  AePS {isWd ? "Withdrawal" : "Deposit"}
                </span>
              </div>
              <p style={{ fontSize: 38, fontWeight: 900, color: accentColor, lineHeight: 1 }}>₹{fmt(amount)}</p>
            </div>
          </div>

          {/* Details card */}
          <div className="bg-white rounded-3xl px-5 py-4 space-y-3"
            style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.08)", border: "1px solid rgba(11,44,96,0.06)" }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Customer Details</p>
            {[
              { icon: User, label: "Customer Name", value: customerName },
              { icon: Fingerprint, label: "Aadhaar Number", value: "XXXX XXXX " + aadhaarDigits.slice(-4) },
              { icon: Building2, label: "Bank Name", value: bankName },
              ...(accountNo ? [{ icon: Hash, label: "Account No", value: "XX" + accountNo.slice(-4) }] : []),
              ...(note ? [{ icon: FileText, label: "Note", value: note }] : []),
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 py-2.5"
                style={{ borderBottom: "1px solid #f8fafc" }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(11,44,96,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={14} style={{ color: "#0b2c60" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0b2c60", marginTop: 1 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl"
            style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.20)" }}>
            <AlertCircle size={14} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: "#92400e", lineHeight: 1.5 }}>
              Please confirm the Aadhaar number and amount with the customer before proceeding.
            </p>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="px-4 pb-6 pt-2 flex gap-3">
          <button onClick={() => setStep("form")}
            className="px-5 py-4 rounded-2xl font-bold text-sm"
            style={{ border: "1.5px solid #e2e8f0", color: "#64748b", background: "#f8fafc", flex: "0 0 auto" }}>
            Edit
          </button>
          <button onClick={() => setStep("success")}
            className="flex-1 py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2"
            style={{ background: accent, boxShadow: `0 4px 18px ${accentColor}38` }}>
            {isWd ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
            Confirm & Save
          </button>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-slate-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0b2c60 0%,#0f3872 60%,#1a4a9e 100%)" }}>
        <div style={{ height: 3, background: "linear-gradient(90deg,#0b2c60,#f97316)" }} />
        <div className="px-4 py-4 flex items-center gap-3">
          <button style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronLeft size={18} color="#fff" />
          </button>
          <div className="flex-1">
            <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>AePS Transaction</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.60)", marginTop: 1 }}>Aadhaar-enabled Payment System</p>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Fingerprint size={18} color="rgba(255,255,255,0.80)" />
          </div>
        </div>

        {/* Type toggle */}
        <div className="px-4 pb-4">
          <div className="flex rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.10)", padding: 4, gap: 4 }}>
            {(["withdrawal", "deposit"] as TxType[]).map(t => {
              const active = txType === t;
              const isW = t === "withdrawal";
              return (
                <button key={t} onClick={() => { setTxType(t); setStep("form"); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm"
                  style={{
                    background: active
                      ? (isW ? "linear-gradient(135deg,#f43f5e,#e11d48)" : "linear-gradient(135deg,#10b981,#059669)")
                      : "transparent",
                    color: active ? "#fff" : "rgba(255,255,255,0.50)",
                    boxShadow: active ? `0 3px 12px ${isW ? "rgba(244,63,94,0.45)" : "rgba(16,185,129,0.45)"}` : "none",
                    transition: "all 0.2s",
                  }}>
                  {isW ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                  {isW ? "Withdrawal" : "Deposit"}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-32">

        {/* ── Amount ── */}
        <div className="bg-white rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.09)", border: "1px solid rgba(11,44,96,0.06)" }}>
          <div style={{ height: 3, background: accent }} />
          <div className="px-4 py-4">
            <label style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>
              Amount *
            </label>
            <div className="relative">
              <div style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                width: 36, height: 36, borderRadius: 10, background: accent,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 3px 10px ${accentColor}30`,
              }}>
                <IndianRupee size={16} color="#fff" />
              </div>
              <input
                type="number" inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                style={{
                  width: "100%", height: 60, paddingLeft: 62, paddingRight: 16,
                  borderRadius: 14,
                  border: `2px solid ${isValidAmount ? accentColor : "#e2e8f0"}`,
                  fontSize: 26, fontWeight: 900, color: "#0b2c60",
                  outline: "none", boxSizing: "border-box",
                  background: isValidAmount ? accentLight : "#fafbff",
                  transition: "all 0.15s",
                }}
              />
            </div>
            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {QUICK_AMOUNTS.map(v => (
                <button key={v} onClick={() => setAmount(String(v))}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: amount === String(v) ? accent : "#f1f5f9",
                    color: amount === String(v) ? "#fff" : "#64748b",
                    boxShadow: amount === String(v) ? `0 2px 8px ${accentColor}35` : "none",
                    border: amount === String(v) ? "none" : "1px solid #e2e8f0",
                  }}>
                  ₹{v >= 1000 ? (v / 1000) + "K" : v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Customer Details ── */}
        <div className="bg-white rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.09)", border: "1px solid rgba(11,44,96,0.06)" }}>
          <div style={{ height: 3, background: "linear-gradient(90deg,#0b2c60,#1a4a9e)" }} />
          <div className="px-4 py-4 space-y-4">
            <p style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Customer Details
            </p>

            {/* Customer Name */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>
                Customer Name *
              </label>
              <div className="relative">
                <User size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Full name of customer"
                  style={{
                    width: "100%", height: 46, paddingLeft: 36, paddingRight: 14,
                    borderRadius: 12,
                    border: `1.5px solid ${isValidName ? "#0b2c6040" : "#e2e8f0"}`,
                    fontSize: 14, fontWeight: 600, color: "#0b2c60",
                    outline: "none", boxSizing: "border-box",
                    background: isValidName ? "rgba(11,44,96,0.03)" : "#fff",
                    transition: "all 0.15s",
                  }}
                />
              </div>
            </div>

            {/* Aadhaar Number */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>
                Aadhaar Number * <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>(12 digits)</span>
              </label>
              <div className="relative">
                <Fingerprint size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  inputMode="numeric"
                  value={showAadhaar ? maskAadhaar(aadhaar) : displayAadhaar}
                  onChange={e => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  onFocus={() => setShowAadhaar(true)}
                  onBlur={() => setShowAadhaar(false)}
                  placeholder="XXXX XXXX XXXX"
                  style={{
                    width: "100%", height: 46, paddingLeft: 36, paddingRight: 44,
                    borderRadius: 12,
                    border: `1.5px solid ${isValidAadhaar ? "#0b2c6040" : aadhaarDigits.length > 0 ? "#fca5a5" : "#e2e8f0"}`,
                    fontSize: 15, fontWeight: 700, color: "#0b2c60", letterSpacing: "0.10em",
                    fontFamily: "monospace",
                    outline: "none", boxSizing: "border-box",
                    background: isValidAadhaar ? "rgba(11,44,96,0.03)" : aadhaarDigits.length > 0 && !isValidAadhaar ? "#fff5f5" : "#fff",
                    transition: "all 0.15s",
                  }}
                />
                <button
                  type="button"
                  onMouseDown={() => setShowAadhaar(true)}
                  onMouseUp={() => setShowAadhaar(false)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                  {showAadhaar ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Progress dots */}
              <div className="flex gap-1.5 mt-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: i < aadhaarDigits.length
                      ? (isValidAadhaar ? "#0b2c60" : "#e11d48")
                      : "#e2e8f0",
                    transition: "background 0.1s",
                  }} />
                ))}
              </div>
              {aadhaarDigits.length > 0 && !isValidAadhaar && (
                <p style={{ fontSize: 10, color: "#e11d48", marginTop: 4, fontWeight: 600 }}>
                  {12 - aadhaarDigits.length} more digit{12 - aadhaarDigits.length !== 1 ? "s" : ""} needed
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Bank Details ── */}
        <div className="bg-white rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.09)", border: "1px solid rgba(11,44,96,0.06)" }}>
          <div style={{ height: 3, background: "linear-gradient(90deg,#8b5cf6,#7c3aed)" }} />
          <div className="px-4 py-4 space-y-4">
            <p style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Bank Details
            </p>

            {/* Bank Name */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>
                Bank Name *
              </label>
              <div className="relative">
                <Building2 size={14} style={{ position: "absolute", left: 13, top: 16, color: "#94a3b8", zIndex: 1 }} />
                <select
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  style={{
                    width: "100%", height: 46, paddingLeft: 36, paddingRight: 14,
                    borderRadius: 12,
                    border: `1.5px solid ${isValidBank ? "#0b2c6040" : "#e2e8f0"}`,
                    fontSize: 13, fontWeight: 600, color: bankName ? "#0b2c60" : "#94a3b8",
                    outline: "none", boxSizing: "border-box", appearance: "none",
                    background: isValidBank ? "rgba(11,44,96,0.03)" : "#fff",
                    transition: "all 0.15s",
                  }}>
                  <option value="" disabled>Select bank name</option>
                  {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            {/* Account Number (optional) */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>
                Account Number <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>(optional)</span>
              </label>
              <div className="relative">
                <Hash size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  inputMode="numeric"
                  value={accountNo}
                  onChange={e => setAccountNo(e.target.value.replace(/\D/g, "").slice(0, 18))}
                  placeholder="Bank account number"
                  style={{
                    width: "100%", height: 46, paddingLeft: 36, paddingRight: 14,
                    borderRadius: 12, border: "1.5px solid #e2e8f0",
                    fontSize: 14, fontWeight: 600, color: "#0b2c60",
                    outline: "none", boxSizing: "border-box", background: "#fff",
                    fontFamily: "monospace", letterSpacing: "0.06em",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Note ── */}
        <div className="bg-white rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 2px 14px rgba(11,44,96,0.07)", border: "1px solid rgba(11,44,96,0.05)" }}>
          <div className="px-4 py-4">
            <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>
              Note <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>(optional)</span>
            </label>
            <div className="relative">
              <FileText size={14} style={{ position: "absolute", left: 13, top: 14, color: "#94a3b8" }} />
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Any additional notes…"
                rows={2}
                style={{
                  width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 12, paddingBottom: 12,
                  borderRadius: 12, border: "1.5px solid #e2e8f0",
                  fontSize: 13, color: "#0b2c60", resize: "none",
                  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                  background: "#fff", lineHeight: 1.5,
                }}
              />
            </div>
          </div>
        </div>

        {/* Validation summary */}
        {!isFormValid && (customerName || aadhaar || bankName || amount) && (
          <div className="px-4 py-3 rounded-2xl flex items-start gap-2.5"
            style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)" }}>
            <AlertCircle size={14} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 11, color: "#92400e", lineHeight: 1.6 }}>
              {!isValidAmount && <div>• Enter a valid amount greater than ₹0</div>}
              {!isValidName && <div>• Customer name is required</div>}
              {!isValidAadhaar && <div>• Valid 12-digit Aadhaar number required</div>}
              {!isValidBank && <div>• Select the customer's bank</div>}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3"
        style={{ background: "linear-gradient(to top, #f8fafc 70%, rgba(248,250,252,0))" }}>
        <button
          onClick={() => isFormValid && setStep("confirm")}
          className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
          style={{
            background: isFormValid ? accent : "#e2e8f0",
            color: isFormValid ? "#fff" : "#94a3b8",
            boxShadow: isFormValid ? `0 6px 20px ${accentColor}38` : "none",
            cursor: isFormValid ? "pointer" : "not-allowed",
            transition: "all 0.2s", fontSize: 15,
          }}>
          {isWd ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
          {isFormValid ? "Review & Confirm" : "Fill all required fields"}
        </button>
      </div>
    </div>
  );
}
