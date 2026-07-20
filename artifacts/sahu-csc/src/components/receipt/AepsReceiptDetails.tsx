import QRCode from "react-qr-code";
import { CheckCircle2, Fingerprint, ShieldCheck } from "lucide-react";
import type { AepsTxReceipt } from "@/components/aeps-receipt-modal";

interface AepsReceiptDetailsProps {
  tx: AepsTxReceipt;
  receiptNumber: string;
  txLabel: string;
  headerGrad: string;
  stripeGrad: string;
  amountColor: string;
  amountPrefix: string;
  amountWhole: string;
  amountDecimal: string;
  formattedDate: string;
  shortDate: string;
  issuedAt: string;
  hasToken: boolean;
  qrValue: string;
}

export function AepsReceiptDetails({
  tx,
  receiptNumber,
  txLabel,
  headerGrad,
  stripeGrad,
  amountColor,
  amountPrefix,
  amountWhole,
  amountDecimal,
  formattedDate,
  shortDate,
  issuedAt,
  hasToken,
  qrValue,
}: AepsReceiptDetailsProps) {
  return (
    <>
      {/* Colored Header */}
      <div style={{ background: headerGrad, padding: "22px 24px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.12, pointerEvents: "none", mixBlendMode: "overlay", backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
        <div style={{ position: "absolute", top: -20, right: -20, width: 88, height: 88, borderRadius: "50%", background: "rgba(255,255,255,0.12)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -28, left: 24, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
        <div style={{ width: 42, height: 42, borderRadius: 13, background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", position: "relative" }}>
          <Fingerprint size={22} color="#fff" />
        </div>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", position: "relative", lineHeight: 1, marginBottom: 4 }}>AePS {txLabel}</h2>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", position: "relative" }}>Aadhaar Enabled Payment System</p>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: stripeGrad }} />
      </div>

      {/* Receipt Info Row */}
      <div style={{ padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #e2e8f0" }}>
        <div>
          <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 2 }}>Receipt No</p>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#0b2c60", fontFamily: "monospace", letterSpacing: "0.04em" }}>{receiptNumber}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          {hasToken ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, padding: "3px 9px" }}>
              <CheckCircle2 size={10} color="#22c55e" strokeWidth={2.5} />
              <span style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", letterSpacing: "0.06em" }}>VERIFIED</span>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 2 }}>Date</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#0b2c60" }}>{shortDate}</p>
            </>
          )}
        </div>
      </div>

      {/* Amount Hero */}
      <div style={{ padding: "18px 22px 14px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.025, pointerEvents: "none" }}>
          <ShieldCheck size={110} color={amountColor} strokeWidth={1} />
        </div>
        <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8, position: "relative" }}>{txLabel} Amount</p>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2, position: "relative" }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: amountColor, opacity: 0.8 }}>{amountPrefix}₹</span>
          <span style={{ fontSize: 46, fontWeight: 900, color: amountColor, letterSpacing: "-0.03em", lineHeight: 1 }}>{amountWhole}</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: amountColor, opacity: 0.75, alignSelf: "flex-start", marginTop: 10 }}>{amountDecimal}</span>
        </div>
      </div>

      {/* Detail Rows */}
      <div style={{ margin: "0 16px 14px", background: "#f8fafc", borderRadius: 16, padding: "12px 16px", border: "1px solid #f1f5f9" }}>
        {[
          { label: "Customer", value: tx.customerName },
          { label: "Transaction", value: txLabel },
          { label: "Date", value: formattedDate },
          { label: "Issued", value: issuedAt },
          ...(tx.balance !== undefined ? [{ label: "Balance After", value: `₹${tx.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` }] : []),
          ...(tx.description ? [{ label: "Note", value: tx.description }] : []),
        ].map((row, i, arr) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid #e9edf2" : "none", gap: 12 }}>
            <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", flexShrink: 0 }}>{row.label}</p>
            <p style={{ fontSize: 12, color: "#0b2c60", fontWeight: 700, textAlign: "right", wordBreak: "break-word", maxWidth: "62%" }}>{row.value}</p>
          </div>
        ))}
      </div>

      {/* QR Section */}
      <div style={{ margin: "0 16px 14px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ background: "#fff", padding: 8, borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", flexShrink: 0 }}>
          <QRCode value={qrValue} size={72} fgColor="#0b2c60" bgColor="#fff" />
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#0b2c60", marginBottom: 4 }}>{hasToken ? "Scan to open & download" : "Scan for details"}</p>
          <p style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.6 }}>{hasToken ? "Scan QR to open receipt online and download the PDF." : "Scan to view transaction details."}</p>
        </div>
      </div>
    </>
  );
}
