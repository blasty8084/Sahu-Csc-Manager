// Mobile dialog for AePS transactions (withdrawal & deposit, 3-step flow)
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Fingerprint, ArrowDownLeft, ArrowUpRight, X,
  ChevronLeft, CheckCircle2, IndianRupee, AlertCircle,
  User, Building2, Hash, FileText, Eye, EyeOff,
} from "lucide-react";
import { AutocompleteInput } from "@/components/autocomplete-input";
import { UseFormReturn } from "react-hook-form";
import {
  fmt, maskAadhaar, AEPS_BANKS, AEPS_QUICK_AMOUNTS,
  type AepsSession, type AepsTx,
} from "@/pages/aeps/aeps.constants";

export interface AepsWithdrawalFormProps {
  open: boolean;
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

export function AepsWithdrawalForm({
  open,
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
}: AepsWithdrawalFormProps) {
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
  const displayAadhaar = txShowAadhaar
    ? maskAadhaar(txAadhaar)
    : aadhaarDigits.length > 0 ? "XXXX XXXX " + aadhaarDigits.slice(-4) : "";

  /* ── Success screen ── */
  if (txStep === "success") return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="p-0 overflow-hidden gap-0 max-w-sm">
        <div style={{ background: "linear-gradient(135deg,#0b2c60 0%,#1a4a9e 100%)" }}>
          <div style={{ height: 3, background: accent }} />
          <div className="flex items-center gap-3 px-4 py-3.5">
            <button onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={15} color="#fff" />
            </button>
            <DialogTitle className="text-white text-sm font-black m-0 p-0">Transaction Complete</DialogTitle>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 px-5 py-5">
          <div style={{ width: 68, height: 68, borderRadius: 20, background: accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 24px ${accentColor}40` }}>
            <CheckCircle2 size={34} color="#fff" />
          </div>
          <div className="text-center">
            <p style={{ fontSize: 18, fontWeight: 900, color: "#0b2c60" }}>{isWd ? "Withdrawal" : "Deposit"} Recorded!</p>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>AePS transaction saved successfully</p>
          </div>
          <div className="w-full bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 4px 18px rgba(11,44,96,0.09)", border: "1px solid rgba(11,44,96,0.07)" }}>
            <div style={{ height: 4, background: accent }} />
            <div className="px-4 py-4 space-y-2">
              <div className="text-center py-2 rounded-xl mb-1" style={{ background: accentLight, border: `1px solid ${accentBorder}` }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: "0.07em" }}>Amount {isWd ? "Withdrawn" : "Deposited"}</p>
                <p style={{ fontSize: 26, fontWeight: 900, color: accentColor, lineHeight: 1.1, marginTop: 2 }}>₹{fmt(amtNum)}</p>
              </div>
              {[
                { label: "Customer", value: txCustomerName },
                ...(aadhaarDigits.length === 12 ? [{ label: "Aadhaar", value: "XXXX XXXX " + aadhaarDigits.slice(-4) }] : []),
                { label: "Bank", value: txBankName },
                ...(txAccountNo ? [{ label: "Account No", value: "XX" + txAccountNo.slice(-4) }] : []),
                ...(txNote ? [{ label: "Note", value: txNote }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-3 py-1.5" style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#0b2c60", textAlign: "right" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full flex gap-2">
            <button onClick={onNewTransaction}
              className="flex-1 py-3 rounded-2xl font-bold text-sm"
              style={{ border: `1.5px solid ${accentBorder}`, color: accentColor, background: accentLight }}>
              + New {isWd ? "Withdrawal" : "Deposit"}
            </button>
            <button onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)" }}>
              Done
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  /* ── Confirm screen ── */
  if (txStep === "confirm") return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="p-0 overflow-hidden gap-0 max-w-sm">
        <div style={{ background: "linear-gradient(135deg,#0b2c60 0%,#1a4a9e 100%)" }}>
          <div style={{ height: 3, background: accent }} />
          <div className="flex items-center gap-3 px-4 py-3.5">
            <button onClick={() => onSetTxStep("form")} style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={16} color="#fff" />
            </button>
            <div>
              <DialogTitle className="text-white text-sm font-black m-0 p-0">Confirm Transaction</DialogTitle>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 1 }}>Review before saving</p>
            </div>
          </div>
        </div>
        <div className="px-4 py-4 space-y-3">
          <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 4px 14px rgba(11,44,96,0.09)" }}>
            <div style={{ height: 4, background: accent }} />
            <div className="bg-white px-5 py-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div style={{ width: 28, height: 28, borderRadius: 8, background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isWd ? <ArrowDownLeft size={13} color="#fff" /> : <ArrowUpRight size={13} color="#fff" />}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>AePS {isWd ? "Withdrawal" : "Deposit"}</span>
              </div>
              <p style={{ fontSize: 32, fontWeight: 900, color: accentColor, lineHeight: 1 }}>₹{fmt(amtNum)}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl px-4 py-3 space-y-2" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.07)", border: "1px solid rgba(11,44,96,0.06)" }}>
            <p style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.09em" }}>Customer Details</p>
            {[
              { icon: User, label: "Customer", value: txCustomerName },
              ...(aadhaarDigits.length === 12 ? [{ icon: Fingerprint, label: "Aadhaar", value: "XXXX XXXX " + aadhaarDigits.slice(-4) }] : []),
              { icon: Building2, label: "Bank", value: txBankName },
              ...(txAccountNo ? [{ icon: Hash, label: "Account No", value: "XX" + txAccountNo.slice(-4) }] : []),
              ...(txNote ? [{ icon: FileText, label: "Note", value: txNote }] : []),
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 py-1.5" style={{ borderBottom: "1px solid #f8fafc" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(11,44,96,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={12} style={{ color: "#0b2c60" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#0b2c60", marginTop: 1 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.20)" }}>
            <AlertCircle size={12} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: "#92400e", lineHeight: 1.5 }}>Confirm Aadhaar and amount with the customer before proceeding.</p>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => onSetTxStep("form")} className="px-4 py-3 rounded-2xl font-bold text-sm"
              style={{ border: "1.5px solid #e2e8f0", color: "#64748b", background: "#f8fafc", flexShrink: 0 }}>Edit</button>
            <button disabled={isMutPending}
              onClick={() => {
                const parts = [txBankName];
                if (aadhaarDigits.length === 12) parts.push("Aadhaar XXXX" + aadhaarDigits.slice(-4));
                if (txAccountNo) parts.push("A/C XX" + txAccountNo.slice(-4));
                if (txNote) parts.push(txNote);
                onConfirmSave({ type: txType, amount: amtNum, customerName: txCustomerName, description: parts.join(" · ") });
              }}
              className="flex-1 py-3 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-1.5"
              style={{ background: accent, boxShadow: `0 4px 14px ${accentColor}32`, opacity: isMutPending ? 0.7 : 1 }}>
              {isMutPending ? "Saving…" : <>{isWd ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />} Confirm & Save</>}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  /* ── Form step ── */
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="p-0 overflow-hidden gap-0 max-w-sm">
        <div style={{ background: "linear-gradient(135deg,#0b2c60 0%,#0f3872 60%,#1a4a9e 100%)" }}>
          <div style={{ height: 3, background: "linear-gradient(90deg,#0b2c60,#f97316)" }} />
          <div className="px-4 py-3 flex items-center gap-3">
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={15} color="#fff" />
            </button>
            <div className="flex-1">
              <DialogTitle className="text-white text-sm font-black m-0 p-0">AePS Transaction</DialogTitle>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 1 }}>Aadhaar-enabled Payment System</p>
            </div>
            <Fingerprint size={16} color="rgba(255,255,255,0.65)" />
          </div>
          <div className="px-4 pb-3">
            <div className="flex rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.10)", padding: 4, gap: 4 }}>
              {(["withdrawal", "deposit"] as const).map(t => {
                const active = txType === t;
                const isW = t === "withdrawal";
                return (
                  <button key={t} type="button" onClick={() => onSetTxType(t)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs"
                    style={{ background: active ? (isW ? "linear-gradient(135deg,#f43f5e,#e11d48)" : "linear-gradient(135deg,#10b981,#059669)") : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.48)", boxShadow: active ? `0 3px 10px ${isW ? "rgba(244,63,94,0.45)" : "rgba(16,185,129,0.45)"}` : "none", transition: "all 0.18s" }}>
                    {isW ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                    {isW ? "Withdrawal" : "Deposit"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="overflow-y-auto space-y-3 p-4" style={{ maxHeight: "65vh" }}>
          {/* Amount */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)", border: "1px solid rgba(11,44,96,0.06)" }}>
            <div style={{ height: 3, background: accent }} />
            <div className="px-4 py-3">
              <label style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Amount *</label>
              <div className="relative">
                <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: 10, background: accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 3px 8px ${accentColor}28` }}>
                  <IndianRupee size={14} color="#fff" />
                </div>
                <input type="number" inputMode="decimal" placeholder="0" autoFocus
                  {...txForm.register("amount", { required: true })}
                  style={{ width: "100%", height: 54, paddingLeft: 56, paddingRight: 14, borderRadius: 12, border: `2px solid ${isValidAmount ? accentColor : "#e2e8f0"}`, fontSize: 22, fontWeight: 900, color: "#0b2c60", outline: "none", boxSizing: "border-box", background: isValidAmount ? accentLight : "#fafbff", transition: "all 0.15s" }}
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {AEPS_QUICK_AMOUNTS.map(v => (
                  <button key={v} type="button" onClick={() => txForm.setValue("amount", String(v))}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                    style={{ background: txAmountVal === String(v) ? accent : "#f1f5f9", color: txAmountVal === String(v) ? "#fff" : "#64748b", border: txAmountVal === String(v) ? "none" : "1px solid #e2e8f0" }}>
                    ₹{v >= 1000 ? (v / 1000) + "K" : v}
                  </button>
                ))}
              </div>
              {session && isWd && isValidAmount && (
                <p style={{ fontSize: 10, color: accentColor, marginTop: 5, fontWeight: 600 }}>After: ₹{fmt(session.currentBalance - amtNum)}</p>
              )}
            </div>
          </div>

          {/* Customer details */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)", border: "1px solid rgba(11,44,96,0.06)" }}>
            <div style={{ height: 3, background: "linear-gradient(90deg,#0b2c60,#1a4a9e)" }} />
            <div className="px-4 py-3 space-y-3">
              <p style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Customer Details</p>
              {aepsFrequentCustomers.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {aepsFrequentCustomers.map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => txForm.setValue("customerName", name)}
                      style={{
                        padding: "4px 10px", borderRadius: 16,
                        border: `1px solid ${txCustomerName === name ? "#0b2c60" : "rgba(11,44,96,0.18)"}`,
                        background: txCustomerName === name ? "#0b2c60" : "rgba(11,44,96,0.04)",
                        color: txCustomerName === name ? "#fff" : "#0b2c60",
                        fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 5 }}>Customer Name *</label>
                <div className="relative">
                  <User size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <AutocompleteInput
                    value={txCustomerName}
                    onChange={(val) => txForm.setValue("customerName", val)}
                    suggestions={aepsCustomerNames}
                    placeholder="Full name of customer"
                    style={{ width: "100%", height: 42, paddingLeft: 32, paddingRight: 12, borderRadius: 11, border: `1.5px solid ${isValidName ? "#0b2c6040" : "#e2e8f0"}`, fontSize: 13, fontWeight: 600, color: "#0b2c60", outline: "none", boxSizing: "border-box", background: isValidName ? "rgba(11,44,96,0.03)" : "#fff", transition: "all 0.15s" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 5 }}>Aadhaar Number <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>(12 digits, optional)</span></label>
                <div className="relative">
                  <Fingerprint size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input inputMode="numeric"
                    value={txShowAadhaar ? maskAadhaar(txAadhaar) : displayAadhaar}
                    onChange={e => onSetTxAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
                    onFocus={() => onSetTxShowAadhaar(true)}
                    onBlur={() => onSetTxShowAadhaar(false)}
                    placeholder="XXXX XXXX XXXX"
                    style={{ width: "100%", height: 42, paddingLeft: 32, paddingRight: 38, borderRadius: 11, border: `1.5px solid ${isValidAadhaar ? "#0b2c6040" : aadhaarDigits.length > 0 ? "#fca5a5" : "#e2e8f0"}`, fontSize: 13, fontWeight: 700, color: "#0b2c60", letterSpacing: "0.08em", fontFamily: "monospace", outline: "none", boxSizing: "border-box", background: isValidAadhaar ? "rgba(11,44,96,0.03)" : aadhaarDigits.length > 0 && !isValidAadhaar ? "#fff5f5" : "#fff", transition: "all 0.15s" }}
                  />
                  <button type="button" onMouseDown={() => onSetTxShowAadhaar(true)} onMouseUp={() => onSetTxShowAadhaar(false)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                    {txShowAadhaar ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div className="flex gap-1 mt-1.5">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < aadhaarDigits.length ? (isValidAadhaar ? "#0b2c60" : "#e11d48") : "#e2e8f0", transition: "background 0.1s" }} />
                  ))}
                </div>
                {aadhaarDigits.length > 0 && !isValidAadhaar && (
                  <p style={{ fontSize: 10, color: "#e11d48", marginTop: 3, fontWeight: 600 }}>{12 - aadhaarDigits.length} more digit{12 - aadhaarDigits.length !== 1 ? "s" : ""} needed</p>
                )}
              </div>
            </div>
          </div>

          {/* Bank details */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)", border: "1px solid rgba(11,44,96,0.06)" }}>
            <div style={{ height: 3, background: "linear-gradient(90deg,#8b5cf6,#7c3aed)" }} />
            <div className="px-4 py-3 space-y-3">
              <p style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Bank Details</p>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 5 }}>Bank Name *</label>
                <div className="relative">
                  <Building2 size={13} style={{ position: "absolute", left: 11, top: 14, color: "#94a3b8", zIndex: 1 }} />
                  <select value={txBankName} onChange={e => onSetTxBankName(e.target.value)}
                    style={{ width: "100%", height: 42, paddingLeft: 32, paddingRight: 12, borderRadius: 11, border: `1.5px solid ${isValidBank ? "#0b2c6040" : "#e2e8f0"}`, fontSize: 12, fontWeight: 600, color: txBankName ? "#0b2c60" : "#94a3b8", outline: "none", boxSizing: "border-box", appearance: "none", background: isValidBank ? "rgba(11,44,96,0.03)" : "#fff" }}>
                    <option value="" disabled>Select bank name</option>
                    {AEPS_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              {txType === "deposit" && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 5 }}>Account Number <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
                  <div className="relative">
                    <Hash size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input inputMode="numeric" value={txAccountNo} onChange={e => onSetTxAccountNo(e.target.value.replace(/\D/g, "").slice(0, 18))} placeholder="Bank account number"
                      style={{ width: "100%", height: 42, paddingLeft: 32, paddingRight: 12, borderRadius: 11, border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 600, color: "#0b2c60", outline: "none", boxSizing: "border-box", background: "#fff", fontFamily: "monospace", letterSpacing: "0.05em" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Note */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.05)", border: "1px solid rgba(11,44,96,0.05)" }}>
            <div className="px-4 py-3">
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 5 }}>Note <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
              <div className="relative">
                <FileText size={13} style={{ position: "absolute", left: 11, top: 11, color: "#94a3b8" }} />
                <textarea value={txNote} onChange={e => onSetTxNote(e.target.value)} placeholder="Additional notes…" rows={2}
                  style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 11, border: "1.5px solid #e2e8f0", fontSize: 12, color: "#0b2c60", resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", lineHeight: 1.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Proceed button */}
        <div className="px-4 pb-4 pt-2">
          <button type="button" onClick={() => { if (isFormValid) onSetTxStep("confirm"); }} disabled={!isFormValid}
            className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: isFormValid ? accent : "#f1f5f9", color: isFormValid ? "#fff" : "#94a3b8", boxShadow: isFormValid ? `0 4px 14px ${accentColor}30` : "none", transition: "all 0.18s", cursor: isFormValid ? "pointer" : "not-allowed" }}>
            {isWd ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
            Review Transaction
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
