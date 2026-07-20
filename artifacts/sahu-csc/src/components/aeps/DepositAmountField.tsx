import { IndianRupee } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { AEPS_QUICK_AMOUNTS } from "@/pages/aeps/aeps.constants";

type AepsFormValues = { amount: string; customerName: string; description: string };

interface DepositAmountFieldProps {
  txForm: UseFormReturn<AepsFormValues>;
  txAmountVal: string;
  accent: string;
  accentColor: string;
  accentBorder: string;
  accentLight: string;
}

/** Amount hero card — large number input + quick-denomination chip buttons. */
export function DepositAmountField({ txForm, txAmountVal, accent, accentColor, accentBorder, accentLight }: DepositAmountFieldProps) {
  return (
    <div style={{ background: accentLight, border: `2px solid ${accentBorder}`, borderRadius: 20, padding: "20px 24px" }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: "uppercase" as const, letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>Amount *</label>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 15, background: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 14px ${accentColor}35` }}>
          <IndianRupee size={22} color="#fff" />
        </div>
        <input
          type="number" inputMode="decimal" placeholder="0" autoFocus
          {...txForm.register("amount", { required: true })}
          style={{ flex: 1, fontSize: 38, fontWeight: 900, color: accentColor, background: "transparent", border: "none", outline: "none", letterSpacing: "-0.02em" }}
        />
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
  );
}
