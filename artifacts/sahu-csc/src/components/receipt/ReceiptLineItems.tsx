// receipt/ReceiptLineItems.tsx — amount hero + verification badge + detail rows card
import { ShieldCheck, CheckCircle2 } from "lucide-react";

interface ReceiptLineItemsProps {
  txType: string;
  amountColor: string;
  amountPrefix: string;
  amountWhole: string;
  amountDecimal: string;
  isCryptoVerified: boolean;
  isVerified: boolean;
  customerName: string;
  serviceType: string;
  description: string | null;
  createdByName: string | null;
  issuedAt: string;
}

export function ReceiptLineItems({
  txType, amountColor, amountPrefix, amountWhole, amountDecimal,
  isCryptoVerified, isVerified,
  customerName, serviceType, description, createdByName, issuedAt,
}: ReceiptLineItemsProps) {
  const detailRows = [
    { label: "Customer", value: customerName },
    { label: "Service",  value: serviceType },
    { label: "Issued",   value: issuedAt },
    ...(createdByName ? [{ label: "Operator", value: createdByName }] : []),
    ...(description   ? [{ label: "Note",     value: description }]   : []),
  ];

  return (
    <>
      {/* ── Amount Hero ─────────────────────────────────────────────────────── */}
      <div style={{ padding: "18px 22px 14px", textAlign: "center", position: "relative" }}>
        {/* Watermark */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.025, pointerEvents: "none" }}>
          <ShieldCheck size={110} color="var(--brand-navy-800)" strokeWidth={1} />
        </div>
        <p style={{ fontSize: 9, color: "var(--color-slate-400)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8, position: "relative" }}>
          {txType} Amount
        </p>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2, position: "relative" }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: amountColor, opacity: 0.8 }}>{amountPrefix}₹</span>
          <span style={{ fontSize: 46, fontWeight: 900, color: amountColor, letterSpacing: "-0.03em", lineHeight: 1 }}>{amountWhole}</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: amountColor, opacity: 0.75, alignSelf: "flex-start", marginTop: 10 }}>{amountDecimal}</span>
        </div>
        {isCryptoVerified ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, background: "var(--color-success-bg)", border: "1px solid color-mix(in srgb, var(--color-success) 30%, transparent)", borderRadius: 20, padding: "4px 10px" }}>
            <ShieldCheck size={11} color="var(--color-success-soft)" strokeWidth={2.5} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-success-soft)", letterSpacing: "0.07em" }}>CRYPTOGRAPHICALLY VERIFIED</span>
          </div>
        ) : isVerified ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, background: "rgba(148,163,184,0.12)", border: "1px solid rgba(148,163,184,0.3)", borderRadius: 20, padding: "4px 10px" }}>
            <CheckCircle2 size={11} color="var(--color-slate-400)" strokeWidth={2.5} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-slate-400)", letterSpacing: "0.07em" }}>VERIFIED</span>
          </div>
        ) : null}
      </div>

      {/* ── Detail Rows Card ─────────────────────────────────────────────────── */}
      <div style={{ margin: "0 16px 14px", background: "var(--color-slate-50)", borderRadius: 16, padding: "12px 16px", border: "1px solid var(--color-slate-100)" }}>
        {detailRows.map((row, i, arr) => (
          <div key={row.label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            padding: "7px 0",
            borderBottom: i < arr.length - 1 ? "1px solid #e9edf2" : "none",
            gap: 12,
          }}>
            <p style={{ fontSize: 10, color: "var(--color-slate-400)", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", flexShrink: 0 }}>{row.label}</p>
            <p style={{ fontSize: 12, color: "var(--brand-navy-800)", fontWeight: 700, textAlign: "right", wordBreak: "break-word", maxWidth: "62%" }}>{row.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}
