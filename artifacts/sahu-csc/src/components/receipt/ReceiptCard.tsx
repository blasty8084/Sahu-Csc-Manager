import React from "react";
import QRCode from "react-qr-code";
import { MapPin, Phone, Globe, ShieldCheck, CheckCircle2 } from "lucide-react";
import type { ReceiptEntry } from "./receiptTypes";

interface ReceiptCardProps {
  entry: ReceiptEntry;
  containerRef: React.RefObject<HTMLDivElement | null>;
  businessName: string;
  businessAddress: string;
  businessMobile: string;
  businessWebsite: string;
}

/**
 * Printable receipt body. Assigned to `containerRef` so the parent's
 * useReceiptActions hook can capture it as a PDF / open-print-window.
 */
export function ReceiptCard({ entry, containerRef, businessName, businessAddress, businessMobile, businessWebsite }: ReceiptCardProps) {
  const receiptNumber = entry.receiptNumber ?? `CSC-${new Date(entry.createdAt).getFullYear()}-${String(entry.id).padStart(4, "0")}`;
  const receiptToken  = entry.receiptToken;
  const isVerified    = !!receiptToken;
  const isCryptoVerified = !!receiptToken && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(receiptToken);

  const origin   = typeof window !== "undefined" ? window.location.origin : "";
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const verifyUrl = receiptToken
    ? `${origin}${basePath}/receipts/verify/${receiptToken}`
    : `${origin}${basePath}/ledger`;

  const isCredit      = entry.credit > 0;
  const amount        = isCredit ? entry.credit : entry.debit;
  const amountColor   = isCredit ? "#059669" : "#e11d48";
  const amountPrefix  = isCredit ? "+" : "−";
  const txType        = isCredit ? "Credit" : "Debit";
  const amountWhole   = Math.floor(amount).toLocaleString("en-IN");
  const amountDecimal = (amount % 1).toFixed(2).slice(1);

  const txDate       = new Date(entry.date);
  const shortDate    = txDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const issuedAt     = new Date(entry.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const hasContact   = businessAddress || businessMobile || businessWebsite;

  return (
    <div ref={containerRef} style={{ background: "#fff" }}>

      {/* Navy Header */}
      <div style={{ background: "linear-gradient(135deg, #0b2c60 0%, #1a3f7a 55%, #071938 100%)", padding: "22px 24px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.15, pointerEvents: "none", mixBlendMode: "overlay", backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
        <div style={{ position: "absolute", top: -20, right: -20, width: 88, height: 88, borderRadius: "50%", background: "rgba(249,115,22,0.15)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -28, left: 24, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", position: "relative", lineHeight: 1, marginBottom: 4 }}>
          SAHU <span style={{ color: "#f97316" }}>CSC</span>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", position: "relative" }}>Official E-Receipt</p>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #f97316, #fcd34d 50%, #f97316)" }} />
      </div>

      {/* Receipt No + Date row */}
      <div style={{ padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #e2e8f0" }}>
        <div>
          <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 2 }}>Receipt No</p>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#0b2c60", fontFamily: "monospace", letterSpacing: "0.04em" }}>{receiptNumber}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 2 }}>Date</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#0b2c60" }}>{shortDate}</p>
        </div>
      </div>

      {/* Amount hero */}
      <div style={{ padding: "18px 22px 14px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.025, pointerEvents: "none" }}>
          <ShieldCheck size={110} color="#0b2c60" strokeWidth={1} />
        </div>
        <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8, position: "relative" }}>{txType} Amount</p>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2, position: "relative" }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: amountColor, opacity: 0.8 }}>{amountPrefix}₹</span>
          <span style={{ fontSize: 46, fontWeight: 900, color: amountColor, letterSpacing: "-0.03em", lineHeight: 1 }}>{amountWhole}</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: amountColor, opacity: 0.75, alignSelf: "flex-start", marginTop: 10 }}>{amountDecimal}</span>
        </div>
        {isCryptoVerified ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, padding: "4px 10px" }}>
            <ShieldCheck size={11} color="#22c55e" strokeWidth={2.5} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", letterSpacing: "0.07em" }}>CRYPTOGRAPHICALLY VERIFIED</span>
          </div>
        ) : isVerified ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, background: "rgba(148,163,184,0.12)", border: "1px solid rgba(148,163,184,0.3)", borderRadius: 20, padding: "4px 10px" }}>
            <CheckCircle2 size={11} color="#94a3b8" strokeWidth={2.5} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.07em" }}>VERIFIED</span>
          </div>
        ) : null}
      </div>

      {/* Detail rows card */}
      <div style={{ margin: "0 16px 14px", background: "#f8fafc", borderRadius: 16, padding: "12px 16px", border: "1px solid #f1f5f9" }}>
        {[
          { label: "Customer", value: entry.customerName },
          { label: "Service",  value: entry.serviceType },
          { label: "Issued",   value: issuedAt },
          ...(entry.createdByName ? [{ label: "Operator", value: entry.createdByName }] : []),
          ...(entry.description  ? [{ label: "Note",      value: entry.description }]  : []),
        ].map((row, i, arr) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid #e9edf2" : "none", gap: 12 }}>
            <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", flexShrink: 0 }}>{row.label}</p>
            <p style={{ fontSize: 12, color: "#0b2c60", fontWeight: 700, textAlign: "right", wordBreak: "break-word", maxWidth: "62%" }}>{row.value}</p>
          </div>
        ))}
      </div>

      {/* QR code */}
      {receiptToken && (
        <div style={{ margin: "0 16px 14px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ background: "#fff", padding: 8, borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", flexShrink: 0 }}>
            <QRCode value={verifyUrl} size={72} fgColor="#0b2c60" bgColor="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#0b2c60", marginBottom: 4 }}>Scan to open & download</p>
            <p style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.6 }}>Scan QR code to open receipt online. Download PDF or share via WhatsApp from there.</p>
          </div>
        </div>
      )}

      {/* Business contact */}
      {hasContact && (
        <div style={{ margin: "0 16px 14px", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 4 }}>{businessName}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
            {businessAddress && <div style={{ display: "flex", alignItems: "center", gap: 5 }}><MapPin size={9} color="#94a3b8" /><p style={{ fontSize: 9, color: "#64748b" }}>{businessAddress}</p></div>}
            {businessMobile  && <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Phone size={9}  color="#94a3b8" /><p style={{ fontSize: 9, color: "#64748b" }}>+91 {businessMobile.replace(/^(\+91|91)/, "").trim()}</p></div>}
            {businessWebsite && <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Globe size={9}  color="#94a3b8" /><p style={{ fontSize: 9, color: "#64748b" }}>{businessWebsite}</p></div>}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ background: "#f8fafc", borderTop: "1px solid #f1f5f9", padding: "10px 22px", textAlign: "center" }}>
        <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>Computer generated receipt · No signature required</p>
      </div>
    </div>
  );
}
