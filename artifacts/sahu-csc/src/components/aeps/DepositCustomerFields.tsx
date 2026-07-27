import { User, Fingerprint, Eye, EyeOff } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { AutocompleteInput } from "@/components/autocomplete-input";

type AepsFormValues = { amount: string; customerName: string; description: string };

interface DepositCustomerFieldsProps {
  txForm: UseFormReturn<AepsFormValues>;
  txCustomerName: string;
  txAadhaar: string;
  txShowAadhaar: boolean;
  displayAadhaar: string;
  isValidName: boolean;
  isValidAadhaar: boolean;
  aadhaarDigits: string;
  aepsCustomerNames: string[];
  aepsFrequentCustomers: string[];
  onSetTxAadhaar: (v: string) => void;
  onSetTxShowAadhaar: (v: boolean) => void;
}

/** Customer name autocomplete + Aadhaar number input with masking and digit progress bar. */
export function DepositCustomerFields({ txForm, txCustomerName, txAadhaar, txShowAadhaar, displayAadhaar, isValidName, isValidAadhaar, aadhaarDigits, aepsCustomerNames, aepsFrequentCustomers, onSetTxAadhaar, onSetTxShowAadhaar }: DepositCustomerFieldsProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Customer Name */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-slate-600)", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: aepsFrequentCustomers.length > 0 ? 6 : 8 }}>Customer Name *</label>
        {aepsFrequentCustomers.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {aepsFrequentCustomers.map(name => (
              <button key={name} type="button" onClick={() => txForm.setValue("customerName", name)}
                style={{ padding: "4px 10px", borderRadius: 12, border: `1px solid ${txCustomerName === name ? "var(--brand-navy-800)" : "var(--brand-navy-border-md)"}`, background: txCustomerName === name ? "var(--brand-navy-800)" : "var(--brand-navy-tint-sm)", color: txCustomerName === name ? "#fff" : "var(--brand-navy-800)", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                {name}
              </button>
            ))}
          </div>
        )}
        <div style={{ position: "relative" }}>
          <User size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-slate-400)" }} />
          <AutocompleteInput
            value={txCustomerName}
            onChange={(val) => txForm.setValue("customerName", val)}
            suggestions={aepsCustomerNames}
            placeholder="Full name"
            style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: `1.5px solid ${isValidName ? "var(--brand-navy-800)40" : "var(--color-slate-200)"}`, fontSize: 14, fontWeight: 600, color: "var(--brand-navy-800)", outline: "none", background: isValidName ? "var(--brand-navy-tint-sm)" : "#fff", boxSizing: "border-box", boxShadow: "0 1px 4px var(--brand-navy-tint-md)" }}
          />
        </div>
      </div>

      {/* Aadhaar */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-slate-600)", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
          Aadhaar <span style={{ fontSize: 10, fontWeight: 400, color: "var(--color-slate-300)" }}>(12 digits, optional)</span>
        </label>
        <div style={{ position: "relative" }}>
          <Fingerprint size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-slate-400)" }} />
          <input
            inputMode="numeric"
            value={txShowAadhaar ? txAadhaar : displayAadhaar}
            onChange={e => onSetTxAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
            onFocus={() => onSetTxShowAadhaar(true)}
            onBlur={() => onSetTxShowAadhaar(false)}
            placeholder="XXXX XXXX XXXX"
            style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 40, borderRadius: 14, border: `1.5px solid ${isValidAadhaar ? "var(--brand-navy-800)40" : aadhaarDigits.length > 0 ? "var(--color-rose-300)" : "var(--color-slate-200)"}`, fontSize: 13, fontWeight: 700, color: "var(--brand-navy-800)", letterSpacing: "0.06em", fontFamily: "monospace", outline: "none", boxSizing: "border-box", background: isValidAadhaar ? "var(--brand-navy-tint-sm)" : aadhaarDigits.length > 0 && !isValidAadhaar ? "#fff5f5" : "#fff", boxShadow: "0 1px 4px var(--brand-navy-tint-md)" }}
          />
          <button type="button" onMouseDown={() => onSetTxShowAadhaar(true)} onMouseUp={() => onSetTxShowAadhaar(false)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-slate-400)", background: "none", border: "none", cursor: "pointer" }}>
            {txShowAadhaar ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {/* 12-digit progress bar */}
        <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < aadhaarDigits.length ? (isValidAadhaar ? "var(--brand-navy-800)" : "var(--color-error)") : "var(--color-slate-200)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
