import { Fingerprint, ArrowDownLeft, ArrowUpRight, User, Building2, Hash, FileText, AlertCircle } from "lucide-react";
import { fmt } from "@/pages/aeps/aeps.constants";

interface DepositSummaryRowProps {
  isWd: boolean;
  accent: string;
  accentColor: string;
  amtNum: number;
  txCustomerName: string;
  aadhaarDigits: string;
  txBankName: string;
  txAccountNo: string;
  txNote: string;
}

/** Before-submit summary card shown in the confirm step — amount hero + detail rows + caution note. */
export function DepositSummaryRow({ isWd, accent, accentColor, amtNum, txCustomerName, aadhaarDigits, txBankName, txAccountNo, txNote }: DepositSummaryRowProps) {
  const rows = [
    { icon: User,        label: "Customer",   value: txCustomerName },
    ...(aadhaarDigits.length === 12 ? [{ icon: Fingerprint, label: "Aadhaar",    value: "XXXX XXXX " + aadhaarDigits.slice(-4) }] : []),
    { icon: Building2,   label: "Bank",       value: txBankName },
    ...(txAccountNo ? [{ icon: Hash,     label: "Account No", value: "XX" + txAccountNo.slice(-4) }] : []),
    ...(txNote      ? [{ icon: FileText, label: "Note",       value: txNote }] : []),
  ];

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Amount hero */}
      <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 14px var(--brand-navy-tint-md)", marginBottom: 20 }}>
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

      {/* Detail rows */}
      <div style={{ background: "#fff", borderRadius: 18, padding: "18px 22px", boxShadow: "0 2px 12px var(--brand-navy-tint-md)", border: "1px solid var(--brand-navy-tint-md)", display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: "var(--color-slate-400)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 4 }}>Customer Details</p>
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--color-slate-50)" }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--brand-navy-tint-md)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={14} style={{ color: "var(--brand-navy-800)" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--color-slate-400)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--brand-navy-800)", marginTop: 2 }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Caution */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 14, background: "var(--color-warning-tint)", border: "1px solid var(--color-warning-border)" }}>
        <AlertCircle size={15} style={{ color: "var(--color-warning)", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 13, color: "var(--color-warning-dark)", lineHeight: 1.6 }}>Confirm Aadhaar and amount with the customer before proceeding.</p>
      </div>
    </div>
  );
}
