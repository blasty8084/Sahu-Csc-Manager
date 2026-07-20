// Desktop panel for AePS transactions (withdrawal & deposit, 3-step flow)
import { ArrowDownLeft, ArrowUpRight, X, Building2, Hash, FileText } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { AEPS_BANKS, type AepsSession } from "@/pages/aeps/aeps.constants";
import { useAepsDeposit } from "@/hooks/useAepsDeposit";
import { DepositLeftPanel } from "./DepositLeftPanel";
import { DepositAmountField } from "./DepositAmountField";
import { DepositCustomerFields } from "./DepositCustomerFields";
import { DepositSummaryRow } from "./DepositSummaryRow";
import { DepositSuccessStep } from "./DepositSuccessStep";

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
  txType, txStep, txAadhaar, txShowAadhaar, txBankName, txAccountNo, txNote,
  session, txForm, aepsCustomerNames, aepsFrequentCustomers, isMutPending,
  onClose, onSetTxType, onSetTxStep, onSetTxAadhaar, onSetTxShowAadhaar,
  onSetTxBankName, onSetTxAccountNo, onSetTxNote, onConfirmSave, onNewTransaction,
}: AepsDepositFormProps) {
  const {
    txAmountVal, txCustomerName, aadhaarDigits, amtNum, isWd,
    accent, accentColor, accentLight, accentBorder,
    isValidAmount, isValidName, isValidAadhaar, isValidBank, isFormValid, displayAadhaar,
  } = useAepsDeposit({ txType, txAadhaar, txShowAadhaar, txBankName, txForm });

  return (
    <>
      <div onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(11,44,96,0.40)", backdropFilter: "blur(4px)", zIndex: 49 }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>

        <DepositLeftPanel
          isWd={isWd} txStep={txStep} session={session}
          isValidAmount={isValidAmount} amtNum={amtNum}
        />

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
            <DepositSuccessStep
              isWd={isWd} accent={accent} accentColor={accentColor}
              accentLight={accentLight} accentBorder={accentBorder}
              amtNum={amtNum} txCustomerName={txCustomerName} aadhaarDigits={aadhaarDigits}
              txBankName={txBankName} txAccountNo={txAccountNo} txNote={txNote}
              onNewTransaction={onNewTransaction} onClose={onClose}
            />
          )}

          {/* ── Confirm ── */}
          {txStep === "confirm" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
              <DepositSummaryRow
                isWd={isWd} accent={accent} accentColor={accentColor}
                amtNum={amtNum} txCustomerName={txCustomerName} aadhaarDigits={aadhaarDigits}
                txBankName={txBankName} txAccountNo={txAccountNo} txNote={txNote}
              />
            </div>
          )}

          {/* ── Form Step ── */}
          {txStep === "form" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 24 }}>
                <DepositAmountField
                  txForm={txForm} txAmountVal={txAmountVal}
                  accent={accent} accentColor={accentColor} accentBorder={accentBorder} accentLight={accentLight}
                />
                <DepositCustomerFields
                  txForm={txForm} txCustomerName={txCustomerName}
                  txAadhaar={txAadhaar} txShowAadhaar={txShowAadhaar} displayAadhaar={displayAadhaar}
                  isValidName={isValidName} isValidAadhaar={isValidAadhaar} aadhaarDigits={aadhaarDigits}
                  aepsCustomerNames={aepsCustomerNames} aepsFrequentCustomers={aepsFrequentCustomers}
                  onSetTxAadhaar={onSetTxAadhaar} onSetTxShowAadhaar={onSetTxShowAadhaar}
                />

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
              <button onClick={() => onSetTxStep("form")}
                style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Edit</button>
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
