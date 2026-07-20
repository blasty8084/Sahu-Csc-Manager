import { CheckCircle2 } from "lucide-react";
import { fmt } from "@/pages/aeps/aeps.constants";

interface DepositSuccessStepProps {
  isWd: boolean;
  accent: string;
  accentColor: string;
  accentLight: string;
  accentBorder: string;
  amtNum: number;
  txCustomerName: string;
  aadhaarDigits: string;
  txBankName: string;
  txAccountNo: string;
  txNote: string;
  onNewTransaction: () => void;
  onClose: () => void;
}

/** Full-screen success panel shown after a transaction is recorded. */
export function DepositSuccessStep({ isWd, accent, accentColor, accentLight, accentBorder, amtNum, txCustomerName, aadhaarDigits, txBankName, txAccountNo, txNote, onNewTransaction, onClose }: DepositSuccessStepProps) {
  return (
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
  );
}
