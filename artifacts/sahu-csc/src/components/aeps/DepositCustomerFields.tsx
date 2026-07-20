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
        <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: aepsFrequentCustomers.length > 0 ? 6 : 8 }}>Customer Name *</label>
        {aepsFrequentCustomers.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {aepsFrequentCustomers.map(name => (
              <button key={name} type="button" onClick={() => txForm.setValue("customerName", name)}
                style={{ padding: "4px 10px", borderRadius: 12, border: `1px solid ${txCustomerName === name ? "#0b2c60" : "rgba(11,44,96,0.18)"}`, background: txCustomerName === name ? "#0b2c60" : "rgba(11,44,96,0.05)", color: txCustomerName === name ? "#fff" : "#0b2c60", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
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

      {/* Aadhaar */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
          Aadhaar <span style={{ fontSize: 10, fontWeight: 400, color: "#cbd5e1" }}>(12 digits, optional)</span>
        </label>
        <div style={{ position: "relative" }}>
          <Fingerprint size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            inputMode="numeric"
            value={txShowAadhaar ? txAadhaar : displayAadhaar}
            onChange={e => onSetTxAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
            onFocus={() => onSetTxShowAadhaar(true)}
            onBlur={() => onSetTxShowAadhaar(false)}
            placeholder="XXXX XXXX XXXX"
            style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 40, borderRadius: 14, border: `1.5px solid ${isValidAadhaar ? "#0b2c6040" : aadhaarDigits.length > 0 ? "#fca5a5" : "#e2e8f0"}`, fontSize: 13, fontWeight: 700, color: "#0b2c60", letterSpacing: "0.06em", fontFamily: "monospace", outline: "none", boxSizing: "border-box", background: isValidAadhaar ? "rgba(11,44,96,0.03)" : aadhaarDigits.length > 0 && !isValidAadhaar ? "#fff5f5" : "#fff", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
          />
          <button type="button" onMouseDown={() => onSetTxShowAadhaar(true)} onMouseUp={() => onSetTxShowAadhaar(false)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}>
            {txShowAadhaar ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {/* 12-digit progress bar */}
        <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < aadhaarDigits.length ? (isValidAadhaar ? "#0b2c60" : "#e11d48") : "#e2e8f0" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
