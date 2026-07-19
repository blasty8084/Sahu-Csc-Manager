import type { RefObject } from "react";
import QRCode from "react-qr-code";
import { ArrowUpRight, ArrowDownLeft, CheckCircle2, BookOpen } from "lucide-react";
import { UdhariReceiptFooter } from "./UdhariReceiptFooter";

interface UdhariReceiptCardProps {
  /** Forwarded ref used by UdhariReceiptActions for html2canvas / print. */
  cardRef: RefObject<HTMLDivElement | null>;
  /** Raw receipt object from /api/receipts/verify/udhari/:token */
  receipt: any;
  /** Current page URL embedded in the QR code. */
  pageUrl: string;
}

/**
 * Printable receipt card — header, amount, balance snapshot, customer details,
 * QR code, business footer. Accepts a forwarded ref so the parent can capture
 * the DOM node for PDF generation and printing.
 */
export function UdhariReceiptCard({ cardRef, receipt, pageUrl }: UdhariReceiptCardProps) {
  const {
    receiptNumber, date, type, amount, note,
    customerName, customerMobile, customerAddress,
    currentBalance, createdAt,
    businessName, businessAddress, businessMobile, businessWebsite,
  } = receipt;

  const isGave = type === "gave";
  const accentColor   = isGave ? "#ea580c" : "#059669";
  const headerGrad    = isGave ? "linear-gradient(135deg,#7c2d12,#ea580c)"         : "linear-gradient(135deg,#064e3b,#059669)";
  const stripeGrad    = isGave ? "linear-gradient(90deg,#ea580c,#f97316 60%,#0b2c60)" : "linear-gradient(90deg,#059669,#10b981 60%,#0b2c60)";
  const txLabel       = isGave ? "You Gave" : "You Got";
  const amountPrefix  = isGave ? "+" : "−";
  const balanceColor  = currentBalance > 0 ? "#ea580c" : currentBalance < 0 ? "#059669" : "#64748b";
  const balanceLabel  = currentBalance > 0 ? "To Collect" : currentBalance < 0 ? "To Pay" : "Settled";
  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const issuedAt      = new Date(createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div ref={cardRef} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 32px rgba(11,44,96,0.12)" }}>

      {/* Header */}
      <div style={{ background: headerGrad, padding: "22px 24px 18px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>{businessName}</p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" }}>Udhari Khata</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isGave ? <ArrowUpRight size={20} color="#fff" /> : <ArrowDownLeft size={20} color="#fff" />}
            </div>
            <div>
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 900, lineHeight: 1 }}>
                {txLabel} <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.7 }}>Receipt</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, marginTop: 3 }}>Customer Credit Ledger</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 900, fontFamily: "monospace" }}>{receiptNumber}</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 5, background: "rgba(34,197,94,0.20)", border: "1px solid rgba(34,197,94,0.35)", borderRadius: 20, padding: "3px 10px" }}>
              <CheckCircle2 size={10} color="#22c55e" />
              <span style={{ fontSize: 9, fontWeight: 700, color: "#22c55e" }}>VERIFIED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accent stripe */}
      <div style={{ height: 4, background: stripeGrad }} />

      {/* Amount */}
      <div style={{ padding: "18px 24px 0" }}>
        <div style={{ background: `${accentColor}0f`, border: `1px solid ${accentColor}25`, borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 2 }}>{txLabel} Amount</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: accentColor, lineHeight: 1 }}>
              {amountPrefix}₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${accentColor}18`, border: `2px solid ${accentColor}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={20} color={accentColor} strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Balance chip */}
      <div style={{ padding: "8px 24px 0", display: "flex", justifyContent: "flex-end" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${balanceColor}10`, border: `1px solid ${balanceColor}25`, borderRadius: 20, padding: "4px 12px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: balanceColor }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: balanceColor }}>
            {balanceLabel}: ₹{Math.abs(currentBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Detail rows */}
      <div style={{ padding: "12px 24px" }}>
        {[
          { label: "Customer",    value: customerName },
          ...(customerMobile  ? [{ label: "Mobile",  value: customerMobile }]  : []),
          ...(customerAddress ? [{ label: "Address", value: customerAddress }] : []),
          { label: "Transaction", value: txLabel },
          { label: "Date",        value: formattedDate },
          { label: "Issued At",   value: issuedAt },
          ...(note ? [{ label: "Note", value: note }] : []),
        ].map((row, i, arr) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none", gap: 12 }}>
            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, flexShrink: 0 }}>{row.label}</p>
            <p style={{ fontSize: 12, color: "#0b2c60", fontWeight: 700, textAlign: "right", wordBreak: "break-word" }}>{row.value}</p>
          </div>
        ))}
      </div>

      {/* QR — scan to download PDF */}
      <div style={{ padding: "0 24px 16px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ flex: 1, paddingRight: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#0b2c60", marginBottom: 4 }}>Scan to download PDF</p>
          <p style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.6 }}>Scan this QR code to open and download this receipt as a PDF.</p>
        </div>
        <div style={{ background: "#fff", padding: 10, borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <QRCode value={pageUrl} size={80} fgColor="#0b2c60" bgColor="#fff" />
        </div>
      </div>

      {/* Business contact + footer bar */}
      <UdhariReceiptFooter
        businessAddress={businessAddress}
        businessMobile={businessMobile}
        businessWebsite={businessWebsite}
      />
    </div>
  );
}
