// Desktop panel for AePS transactions (withdrawal & deposit, 3-step flow)
import {
  Fingerprint, ArrowDownLeft, ArrowUpRight, X,
  CheckCircle2, IndianRupee, AlertCircle,
  User, Building2, Hash, FileText, Eye, EyeOff,
} from "lucide-react";
import { AutocompleteInput } from "@/components/autocomplete-input";
import { UseFormReturn } from "react-hook-form";
import {
  fmt, maskAadhaar, AEPS_BANKS, AEPS_QUICK_AMOUNTS,
  type AepsSession,
} from "@/pages/aeps/aeps.constants";

export interface AepsDepositFormProps {
  txType: "withdrawal" | "deposit";
  txStep: "form" | "confirm" | "success";
  txAadhaar: string;
  txShowAadhaar: boolean;
  txBankName: string;
  txAccountNo: string;
  txNote: string;
  session: AepsSession | undefined;
  txForm: UseFormReturn<{ amount: string; customerName: string; description: string }>;
  aepsCustomerNames: string[];
  aepsFrequentCustomers: string[];
  isMutPending: boolean;
  onClose: () => void;
  onSetTxType: (type: "withdrawal" | "deposit") => void;
  onSetTxStep: (step: "form" | "confirm" | "success") => void;
  onSetTxAadhaar: (v: string) => void;
  onSetTxShowAadhaar: (v: boolean) => void;
  onSetTxBankName: (v: string) => void;
  onSetTxAccountNo: (v: string) => void;
  onSetTxNote: (v: string) => void;
  onConfirmSave: (params: { type: string; amount: number; customerName: string; description: string }) => void;
  onNewTransaction: () => void;
}

export function AepsDepositForm({
  txType,
  txStep,
  txAadhaar,
  txShowAadhaar,
  txBankName,
  txAccountNo,
  txNote,
  session,
  txForm,
  aepsCustomerNames,
  aepsFrequentCustomers,
  isMutPending,
  onClose,
  onSetTxType,
  onSetTxStep,
  onSetTxAadhaar,
  onSetTxShowAadhaar,
  onSetTxBankName,
  onSetTxAccountNo,
  onSetTxNote,
  onConfirmSave,
  onNewTransaction,
}: AepsDepositFormProps) {
  const txAmountVal = txForm.watch("amount");
  const txCustomerName = txForm.watch("customerName");
  const aadhaarDigits = txAadhaar.replace(/\D/g, "");
  const amtNum = parseFloat(txAmountVal);
  const isWd = txType === "withdrawal";
  const accent = isWd ? "linear-gradient(135deg,#f43f5e,#e11d48)" : "linear-gradient(135deg,#10b981,#059669)";
  const accentColor = isWd ? "#e11d48" : "#059669";
  const accentLight = isWd ? "rgba(244,63,94,0.07)" : "rgba(16,185,129,0.07)";
  const accentBorder = isWd ? "rgba(244,63,94,0.22)" : "rgba(16,185,129,0.22)";
  const isValidAmount = !isNaN(amtNum) && amtNum > 0;
  const isValidName = txCustomerName.trim().length >= 2;
  const isValidAadhaar = aadhaarDigits.length === 0 || aadhaarDigits.length === 12;
  const isValidBank = txBankName.trim().length > 0;
  const isFormValid = isValidAmount && isValidName && isValidAadhaar && isValidBank;
  const displayAadhaar = txShowAadhaar ? maskAadhaar(txAadhaar) : aadhaarDigits.length > 0 ? "XXXX XXXX " + aadhaarDigits.slice(-4) : "";

  return (
    <>
      <div onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(11,44,96,0.40)", backdropFilter: "blur(4px)", zIndex: 49 }} />
      {/* V2 — Full-screen split layout */}
      <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>

        {/* LEFT INFO PANEL */}
        <div style={{ width: 380, flexShrink: 0, background: isWd ? "linear-gradient(160deg,#7f1d1d 0%,#b91c1c 55%,#e11d48 100%)" : "linear-gradient(160deg,#064e3b 0%,#047857 55%,#10b981 100%)", display: "flex", flexDirection: "column", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -70, right: -70, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -50, left: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(0,0,0,0.12)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, position: "relative" }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,0.20)", border: "1.5px solid rgba(255,255,255,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
            </div>
            <div><span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>SAHU CSC</span></div>
          </div>

          {/* Icon + title */}
          <div style={{ position: "relative", marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              {isWd ? <ArrowDownLeft size={30} color="#fff" strokeWidth={2.5} /> : <ArrowUpRight size={30} color="#fff" strokeWidth={2.5} />}
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 8, padding: "4px 10px", marginBottom: 10 }}>
              <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>AePS</span>
            </div>
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, lineHeight: 1.2, marginBottom: 8 }}>
              {txStep === "success" ? "Transaction Complete!" : txStep === "confirm" ? "Confirm Transaction" : isWd ? "Cash Withdrawal" : "Cash Deposit"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 13, lineHeight: 1.6 }}>
              {txStep === "form" ? (isWd ? "Customer receives cash using Aadhaar biometric authentication." : "Customer deposits cash into their bank account via AePS.") : txStep === "confirm" ? "Please verify the details carefully before confirming." : "AePS transaction has been recorded successfully."}
            </p>
          </div>

          {/* Session balance stats */}
          {session && (
            <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 16, padding: "16px 18px", marginBottom: 12, position: "relative" }}>
              <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Today's Session</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.60)", fontSize: 12 }}>Current Balance</span>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>₹{fmt(session.currentBalance)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.60)", fontSize: 12 }}>Opening</span>
                  <span style={{ color: "rgba(255,255,255,0.80)", fontWeight: 600, fontSize: 13 }}>₹{fmt(session.openingBalance)}</span>
                </div>
              </div>
              {isWd && isValidAmount && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>After withdrawal</span>
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>₹{fmt(session.currentBalance - amtNum)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: "10px 14px", marginTop: "auto", position: "relative" }}>
            <Fingerprint size={18} color="rgba(255,255,255,0.70)" />
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, lineHeight: 1.5 }}>Secured via NPCI Aadhaar-based biometric authentication</p>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8fafc" }}>
          {/* Top bar */}
          <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0b2c60", margin: 0 }}>
                {txStep === "success" ? "Transaction Recorded" : txStep === "confirm" ? "Confirm Details" : "New AePS Transaction"}
              </h2>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>AePS · {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {txStep === "form" && (
                <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 14, padding: 4, gap: 4 }}>
                  {(["withdrawal", "deposit"] as const).map(t => {
                    const isW = t === "withdrawal";
                    return (
                      <button key={t} type="button" onClick={() => onSetTxType(t)}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 11, border: "none", cursor: "pointer", background: txType === t ? (isW ? "linear-gradient(135deg,#f43f5e,#e11d48)" : "linear-gradient(135deg,#10b981,#059669)") : "transparent", color: txType === t ? "#fff" : "#64748b", fontWeight: 700, fontSize: 13, boxShadow: txType === t ? `0 2px 10px ${isW ? "rgba(225,29,72,0.35)" : "rgba(16,185,129,0.35)"}` : "none", transition: "all 0.15s" }}>
                        {isW ? <><ArrowDownLeft size={13} />Withdrawal</> : <><ArrowUpRight size={13} />Deposit</>}
                      </button>
                    );
                  })}
                </div>
              )}
              <button onClick={onClose}
                style={{ width: 38, height: 38, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={16} color="#64748b" />
              </button>
            </div>
          </div>

          {/* ── Success ── */}
          {txStep === "success" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: 24, background: accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 32px ${accentColor}40` }}>
                <CheckCircle2 size={40} color="#fff" />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 24, fontWeight: 900, color: "#0b2c60" }}>{isWd ? "Withdrawal" : "Deposit"} Recorded!</p>
                <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>AePS transaction saved successfully</p>
              </div>
              <div style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 18px rgba(11,44,96,0.09)", border: "1px solid rgba(11,44,96,0.07)" }}>
                <div style={{ height: 4, background: accent }} />
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ textAlign: "center", padding: "14px 0", borderRadius: 14, marginBottom: 6, background: accentLight, border: `1px solid ${accentBorder}` }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: "0.07em" }}>Amount {isWd ? "Withdrawn" : "Deposited"}</p>
                    <p style={{ fontSize: 32, fontWeight: 900, color: accentColor, lineHeight: 1.1, marginTop: 4 }}>₹{fmt(amtNum)}</p>
                  </div>
                  {[
                    { label: "Customer", value: txCustomerName },
                    ...(aadhaarDigits.length === 12 ? [{ label: "Aadhaar", value: "XXXX XXXX " + aadhaarDigits.slice(-4) }] : []),
                    { label: "Bank", value: txBankName },
                    ...(txAccountNo ? [{ label: "Account No", value: "XX" + txAccountNo.slice(-4) }] : []),
                    ...(txNote ? [{ label: "Note", value: txNote }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0b2c60" }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ width: "100%", maxWidth: 520, display: "flex", gap: 14 }}>
                <button onClick={onNewTransaction}
                  style={{ flex: 1, height: 50, borderRadius: 14, fontWeight: 700, fontSize: 14, border: `1.5px solid ${accentBorder}`, color: accentColor, background: accentLight, cursor: "pointer" }}>
                  + New {isWd ? "Withdrawal" : "Deposit"}
                </button>
                <button onClick={onClose}
                  style={{ flex: 1, height: 50, borderRadius: 14, fontWeight: 700, fontSize: 14, border: "none", color: "#fff", background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", cursor: "pointer" }}>
                  Done
                </button>
              </div>
            </div>
          )}

          {/* ── Confirm ── */}
          {txStep === "confirm" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ maxWidth: 560 }}>
                <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 14px rgba(11,44,96,0.09)", marginBottom: 20 }}>
                  <div style={{ height: 4, background: accent }} />
                  <div style={{ background: "#fff", padding: "20px 24px", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 11, background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {isWd ? <ArrowDownLeft size={16} color="#fff" /> : <ArrowUpRight size={16} color="#fff" />}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>AePS {isWd ? "Withdrawal" : "Deposit"}</span>
                    </div>
                    <p style={{ fontSize: 40, fontWeight: 900, color: accentColor, lineHeight: 1 }}>₹{fmt(amtNum)}</p>
                  </div>
                </div>
                <div style={{ background: "#fff", borderRadius: 18, padding: "18px 22px", boxShadow: "0 2px 12px rgba(11,44,96,0.07)", border: "1px solid rgba(11,44,96,0.06)", display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 4 }}>Customer Details</p>
                  {[
                    { icon: User, label: "Customer", value: txCustomerName },
                    ...(aadhaarDigits.length === 12 ? [{ icon: Fingerprint, label: "Aadhaar", value: "XXXX XXXX " + aadhaarDigits.slice(-4) }] : []),
                    { icon: Building2, label: "Bank", value: txBankName },
                    ...(txAccountNo ? [{ icon: Hash, label: "Account No", value: "XX" + txAccountNo.slice(-4) }] : []),
                    ...(txNote ? [{ icon: FileText, label: "Note", value: txNote }] : []),
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid #f8fafc" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(11,44,96,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={14} style={{ color: "#0b2c60" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0b2c60", marginTop: 2 }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 14, background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.20)" }}>
                  <AlertCircle size={15} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>Confirm Aadhaar and amount with the customer before proceeding.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Form Step ── */}
          {txStep === "form" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Amount — hero */}
                <div style={{ background: accentLight, border: `2px solid ${accentBorder}`, borderRadius: 20, padding: "20px 24px" }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: "uppercase" as const, letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>Amount *</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 15, background: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 14px ${accentColor}35` }}>
                      <IndianRupee size={22} color="#fff" />
                    </div>
                    <input type="number" inputMode="decimal" placeholder="0" autoFocus
                      {...txForm.register("amount", { required: true })}
                      style={{ flex: 1, fontSize: 38, fontWeight: 900, color: accentColor, background: "transparent", border: "none", outline: "none", letterSpacing: "-0.02em" }} />
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {AEPS_QUICK_AMOUNTS.map(v => (
                      <button key={v} type="button" onClick={() => txForm.setValue("amount", String(v))}
                        style={{ padding: "7px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, background: txAmountVal === String(v) ? accent : "#f1f5f9", color: txAmountVal === String(v) ? "#fff" : "#64748b", border: txAmountVal === String(v) ? "none" : "1px solid #e2e8f0", cursor: "pointer" }}>
                        ₹{v >= 1000 ? (v / 1000) + "K" : v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer + Aadhaar */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: aepsFrequentCustomers.length > 0 ? 6 : 8 }}>Customer Name *</label>
                    {aepsFrequentCustomers.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                        {aepsFrequentCustomers.map(name => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => txForm.setValue("customerName", name)}
                            style={{
                              padding: "4px 10px", borderRadius: 12,
                              border: `1px solid ${txCustomerName === name ? "#0b2c60" : "rgba(11,44,96,0.18)"}`,
                              background: txCustomerName === name ? "#0b2c60" : "rgba(11,44,96,0.05)",
                              color: txCustomerName === name ? "#fff" : "#0b2c60",
                              fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                            }}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    )}
                    <div style={{ position: "relative" }}>
                      <User size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                      <AutocompleteInput
                        value={txCustomerName}
                        onChange={(val) => txForm.setValue("customerName", val)}
                        suggestions={aepsCustomerNames}
                        placeholder="Full name"
                        style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: `1.5px solid ${isValidName ? "#0b2c6040" : "#e2e8f0"}`, fontSize: 14, fontWeight: 600, color: "#0b2c60", outline: "none", background: isValidName ? "rgba(11,44,96,0.03)" : "#fff", boxSizing: "border-box", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Aadhaar <span style={{ fontSize: 10, fontWeight: 400, color: "#cbd5e1" }}>(12 digits, optional)</span></label>
                    <div style={{ position: "relative" }}>
                      <Fingerprint size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                      <input inputMode="numeric"
                        value={txShowAadhaar ? maskAadhaar(txAadhaar) : displayAadhaar}
                        onChange={e => onSetTxAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
                        onFocus={() => onSetTxShowAadhaar(true)} onBlur={() => onSetTxShowAadhaar(false)}
                        placeholder="XXXX XXXX XXXX"
                        style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 40, borderRadius: 14, border: `1.5px solid ${isValidAadhaar ? "#0b2c6040" : aadhaarDigits.length > 0 ? "#fca5a5" : "#e2e8f0"}`, fontSize: 13, fontWeight: 700, color: "#0b2c60", letterSpacing: "0.06em", fontFamily: "monospace", outline: "none", boxSizing: "border-box", background: isValidAadhaar ? "rgba(11,44,96,0.03)" : aadhaarDigits.length > 0 && !isValidAadhaar ? "#fff5f5" : "#fff", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }} />
                      <button type="button" onMouseDown={() => onSetTxShowAadhaar(true)} onMouseUp={() => onSetTxShowAadhaar(false)}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}>
                        {txShowAadhaar ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < aadhaarDigits.length ? (isValidAadhaar ? "#0b2c60" : "#e11d48") : "#e2e8f0" }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bank + Account */}
                <div style={{ display: "grid", gridTemplateColumns: txType === "deposit" ? "1fr 1fr" : "1fr", gap: 20 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Bank Name *</label>
                    <div style={{ position: "relative" }}>
                      <Building2 size={15} style={{ position: "absolute", left: 14, top: 17, color: "#94a3b8", zIndex: 1 }} />
                      <select value={txBankName} onChange={e => onSetTxBankName(e.target.value)}
                        style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: `1.5px solid ${isValidBank ? "#0b2c6040" : "#e2e8f0"}`, fontSize: 14, fontWeight: 600, color: txBankName ? "#0b2c60" : "#94a3b8", outline: "none", boxSizing: "border-box", appearance: "none", background: isValidBank ? "rgba(11,44,96,0.03)" : "#fff", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}>
                        <option value="" disabled>Select bank</option>
                        {AEPS_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                  {txType === "deposit" && (
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Account No <span style={{ fontWeight: 400, textTransform: "none" as const, color: "#94a3b8" }}>(optional)</span></label>
                      <div style={{ position: "relative" }}>
                        <Hash size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input inputMode="numeric" value={txAccountNo} onChange={e => onSetTxAccountNo(e.target.value.replace(/\D/g, "").slice(0, 18))} placeholder="Account number"
                          style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 600, color: "#0b2c60", outline: "none", boxSizing: "border-box", background: "#fff", fontFamily: "monospace", letterSpacing: "0.05em", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Note */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Note <span style={{ fontWeight: 400, textTransform: "none" as const, color: "#94a3b8" }}>(optional)</span></label>
                  <div style={{ position: "relative" }}>
                    <FileText size={15} style={{ position: "absolute", left: 14, top: 15, color: "#94a3b8" }} />
                    <textarea value={txNote} onChange={e => onSetTxNote(e.target.value)} placeholder="Additional notes…" rows={2}
                      style={{ width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 13, paddingBottom: 13, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#0b2c60", resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", lineHeight: 1.6, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer — form step */}
          {txStep === "form" && (
            <div style={{ padding: "20px 40px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 14 }}>
              <button type="button" onClick={onClose}
                style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
              <button type="button" onClick={() => { if (isFormValid) onSetTxStep("confirm"); }} disabled={!isFormValid}
                style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: isFormValid ? "pointer" : "not-allowed", background: isFormValid ? accent : "#f1f5f9", color: isFormValid ? "#fff" : "#94a3b8", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: isFormValid ? `0 6px 20px ${accentColor}30` : "none" }}>
                {isWd ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                Review Transaction
              </button>
            </div>
          )}

          {/* Footer — confirm step */}
          {txStep === "confirm" && (
            <div style={{ padding: "20px 40px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 14 }}>
              <button onClick={() => onSetTxStep("form")} style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Edit</button>
              <button disabled={isMutPending}
                onClick={() => {
                  const parts = [txBankName];
                  if (aadhaarDigits.length === 12) parts.push("Aadhaar XXXX" + aadhaarDigits.slice(-4));
                  if (txAccountNo) parts.push("A/C XX" + txAccountNo.slice(-4));
                  if (txNote) parts.push(txNote);
                  onConfirmSave({ type: txType, amount: amtNum, customerName: txCustomerName, description: parts.join(" · ") });
                }}
                style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: accent, color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 14px ${accentColor}32`, opacity: isMutPending ? 0.7 : 1 }}>
                {isMutPending ? "Saving…" : <>{isWd ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />} Confirm & Save</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
