import { ShieldCheck, ShieldAlert } from "lucide-react";

/** Top banner pill shown above the receipt card — green "VERIFIED" or amber "LEGACY RECEIPT". */
export function ReceiptVerifyBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--color-success-bg)", border: "1px solid color-mix(in srgb, var(--color-success) 30%, transparent)", borderRadius: 20, padding: "6px 16px", marginBottom: 18 }}>
        <ShieldCheck size={14} color="var(--color-success-soft)" strokeWidth={2.5} />
        <span style={{ color: "#4ade80", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>CRYPTOGRAPHICALLY VERIFIED</span>
      </div>
    );
  }
  return (
    <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.35)", borderRadius: 20, padding: "6px 16px", marginBottom: 18 }}>
      <ShieldAlert size={14} color="var(--brand-orange-300)" strokeWidth={2.5} />
      <span style={{ color: "var(--brand-orange-300)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>LEGACY RECEIPT</span>
    </div>
  );
}
