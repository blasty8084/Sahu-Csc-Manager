import type { RefObject } from "react";
import QRCode from "react-qr-code";
import { Fingerprint, CheckCircle2 } from "lucide-react";
import { AepsReceiptFooter } from "./AepsReceiptFooter";

interface AepsReceiptCardProps {
  /** Forwarded ref used by AepsReceiptActions for html2canvas / print. */
  cardRef: RefObject<HTMLDivElement | null>;
  /** Raw receipt object from /api/receipts/verify/aeps/:token */
  receipt: any;
  /** Current page URL embedded in the QR code. */
  pageUrl: string;
}

/**
 * Printable AePS receipt card — coloured header, accent stripe, amount box,
 * transaction detail rows, QR code, and agent/business footer.
 * Accepts a forwarded ref so the parent can capture the DOM node for PDF / print.
 */
export function AepsReceiptCard({ cardRef, receipt, pageUrl }: AepsReceiptCardProps) {
  const {
    receiptNumber, date, type, amount, customerName, description,
    operatorName, createdAt,
    businessName, businessAddress, businessMobile, businessWebsite,
  } = receipt;

  const isWithdrawal = type === "withdrawal";
  const amountColor  = isWithdrawal ? "var(--color-error)" : "var(--color-success)";
  const amountPrefix = isWithdrawal ? "−" : "+";
  const txLabel      = isWithdrawal ? "Cash Withdrawal" : "Cash Deposit";
  const headerGrad   = isWithdrawal ? "linear-gradient(135deg,#7f1d1d,var(--color-error))" : "linear-gradient(135deg,#064e3b,var(--color-success))";
  const stripeGrad   = isWithdrawal ? "linear-gradient(90deg,var(--color-error),var(--color-error-soft),var(--brand-navy-800))" : "linear-gradient(90deg,var(--color-success),var(--color-success-light),var(--brand-navy-800))";

  const formattedDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const issuedAt = createdAt
    ? new Date(createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div ref={cardRef} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 32px var(--brand-navy-border)" }}>

      {/* Header */}
      <div style={{ background: headerGrad, padding: "22px 24px 18px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "var(--brand-white-low)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            {businessName}
          </p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" }}>
            AePS Receipt
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--brand-white-mid)", border: "1.5px solid var(--brand-white-25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Fingerprint size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 900, lineHeight: 1 }}>
                AePS <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.7 }}>{txLabel}</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, marginTop: 3 }}>Aadhaar Enabled Payment System</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 900, fontFamily: "monospace" }}>{receiptNumber}</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 5, background: "var(--color-success-bg)", border: "1px solid color-mix(in srgb, var(--color-success) 35%, transparent)", borderRadius: 20, padding: "3px 10px" }}>
              <CheckCircle2 size={10} color="var(--color-success-soft)" />
              <span style={{ fontSize: 9, fontWeight: 700, color: "var(--color-success-soft)" }}>VERIFIED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accent stripe */}
      <div style={{ height: 4, background: stripeGrad }} />

      {/* Amount */}
      <div style={{ padding: "18px 24px 0" }}>
        <div style={{ background: `${amountColor}0f`, border: `1px solid ${amountColor}25`, borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--color-slate-400)", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 2 }}>{txLabel} Amount</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: amountColor, lineHeight: 1 }}>
              {amountPrefix}₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${amountColor}18`, border: `2px solid ${amountColor}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Fingerprint size={20} color={amountColor} strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Detail rows */}
      <div style={{ padding: "12px 24px" }}>
        {[
          { label: "Customer",    value: customerName },
          { label: "Transaction", value: txLabel },
          { label: "Date",        value: formattedDate },
          { label: "Issued At",   value: issuedAt },
          ...(operatorName  ? [{ label: "Operator", value: operatorName }]  : []),
          ...(description   ? [{ label: "Details",  value: description }]   : []),
        ].map((row, i, arr) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--color-slate-100)" : "none", gap: 12 }}>
            <p style={{ fontSize: 11, color: "var(--color-slate-400)", fontWeight: 600, flexShrink: 0 }}>{row.label}</p>
            <p style={{ fontSize: 12, color: "var(--brand-navy-800)", fontWeight: 700, textAlign: "right", wordBreak: "break-word" }}>{row.value}</p>
          </div>
        ))}
      </div>

      {/* QR — scan to download PDF */}
      <div style={{ padding: "0 24px 16px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ flex: 1, paddingRight: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-navy-800)", marginBottom: 4 }}>Scan to download PDF</p>
          <p style={{ fontSize: 9, color: "var(--color-slate-400)", lineHeight: 1.6 }}>
            Scan this QR code to open and download this receipt as a PDF. Share with customer for their records.
          </p>
        </div>
        <div style={{ background: "#fff", padding: 10, borderRadius: 12, border: "1px solid var(--color-slate-200)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <QRCode value={pageUrl} size={80} fgColor="var(--brand-navy-800)" bgColor="#fff" />
        </div>
      </div>

      {/* Agent info + footer bar */}
      <AepsReceiptFooter
        businessAddress={businessAddress}
        businessMobile={businessMobile}
        businessWebsite={businessWebsite}
      />
    </div>
  );
}
