import React from "react";
import QRCode from "react-qr-code";
import { MapPin, Phone, Globe, ShieldCheck, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import type { UdhariEntryReceipt } from "./udhariReceiptTypes";

interface Props {
  entry: UdhariEntryReceipt;
  containerRef: React.RefObject<HTMLDivElement | null>;
  businessName: string;
  businessAddress: string;
  businessMobile: string;
  businessWebsite: string;
}

/** Printable udhari receipt body. */
export function UdhariReceiptCard({ entry, containerRef, businessName, businessAddress, businessMobile, businessWebsite }: Props) {
  const year          = new Date(entry.date + "T00:00:00").getFullYear();
  const receiptNumber = `UDH-${year}-${String(entry.id).padStart(4, "0")}`;
  const isGave        = entry.type === "gave";
  const accentColor   = isGave ? "#ea580c" : "#059669";
  const headerGrad    = isGave ? "linear-gradient(135deg, #7c2d12 0%, #c2410c 55%, #6b2400 100%)" : "linear-gradient(135deg, #064e3b 0%, #059669 55%, #044032 100%)";
  const stripeGrad    = isGave ? "linear-gradient(90deg, #ea580c, #f97316 50%, #ea580c)" : "linear-gradient(90deg, #059669, #34d399 50%, #059669)";
  const txLabel       = isGave ? "You Gave" : "You Got";
  const amountPrefix  = isGave ? "+" : "−";
  const balanceColor  = entry.currentBalance > 0 ? "#ea580c" : entry.currentBalance < 0 ? "#059669" : "#64748b";
  const balanceLabel  = entry.currentBalance > 0 ? "To Collect" : entry.currentBalance < 0 ? "To Pay" : "Settled";

  const formattedDate = new Date(entry.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const shortDate     = new Date(entry.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const issuedAt      = new Date(entry.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const hasContact = businessAddress || businessMobile || businessWebsite;
  const hasToken   = !!entry.receiptToken;
  const origin     = typeof window !== "undefined" ? window.location.origin : "";
  const basePath   = import.meta.env.BASE_URL.replace(/\/$/, "");
  const verifyUrl  = hasToken ? `${origin}${basePath}/receipts/verify/udhari/${entry.receiptToken}` : null;
  const qrValue    = verifyUrl ?? [`SAHU CSC – Udhari Khata Receipt`, `Receipt No: ${receiptNumber}`, `Type: ${txLabel}`, `Customer: ${entry.customerName}`, `Amount: ₹${entry.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, `Balance: ${balanceLabel} ₹${Math.abs(entry.currentBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, `Date: ${formattedDate}`, `Issued: ${issuedAt}`, ...(entry.note ? [`Note: ${entry.note}`] : []), businessName ? `Center: ${businessName}` : ""].filter(Boolean).join("\n");
  const amountWhole   = Math.floor(entry.amount).toLocaleString("en-IN");
  const amountDecimal = (entry.amount % 1).toFixed(2).slice(1);

  return (
    <div ref={containerRef} style={{ background: "#fff" }}>
      {/* Header */}
      <div style={{ background: headerGrad, padding: "22px 24px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.12, pointerEvents: "none", mixBlendMode: "overlay", backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
        <div style={{ position: "absolute", top: -20, right: -20, width: 88, height: 88, borderRadius: "50%", background: "rgba(255,255,255,0.12)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -28, left: 24, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
        <div style={{ width: 42, height: 42, borderRadius: 13, background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", position: "relative" }}>
          {isGave ? <ArrowUpRight size={22} color="#fff" strokeWidth={2.5} /> : <ArrowDownLeft size={22} color="#fff" strokeWidth={2.5} />}
        </div>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", position: "relative", lineHeight: 1, marginBottom: 4 }}>{txLabel}</h2>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", position: "relative" }}>Udhari Khata · Customer Credit Ledger</p>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: stripeGrad }} />
      </div>

      {/* Receipt No + verified/date row */}
      <div style={{ padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #e2e8f0" }}>
        <div>
          <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 2 }}>Receipt No</p>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#0b2c60", fontFamily: "monospace", letterSpacing: "0.04em" }}>{receiptNumber}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          {hasToken
            ? <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, padding: "3px 9px" }}>
                <ShieldCheck size={10} color="#22c55e" strokeWidth={2.5} />
                <span style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", letterSpacing: "0.06em" }}>VERIFIED</span>
              </div>
            : <><p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 2 }}>Date</p><p style={{ fontSize: 12, fontWeight: 700, color: "#0b2c60" }}>{shortDate}</p></>}
        </div>
      </div>

      {/* Amount hero */}
      <div style={{ padding: "18px 22px 8px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.025, pointerEvents: "none" }}><ShieldCheck size={110} color={accentColor} strokeWidth={1} /></div>
        <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8, position: "relative" }}>{txLabel} Amount</p>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2, position: "relative" }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: accentColor, opacity: 0.8 }}>{amountPrefix}₹</span>
          <span style={{ fontSize: 46, fontWeight: 900, color: accentColor, letterSpacing: "-0.03em", lineHeight: 1 }}>{amountWhole}</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: accentColor, opacity: 0.75, alignSelf: "flex-start", marginTop: 10 }}>{amountDecimal}</span>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, background: `${balanceColor}12`, border: `1px solid ${balanceColor}28`, borderRadius: 20, padding: "4px 12px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: balanceColor, flexShrink: 0 }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: balanceColor }}>{balanceLabel}: ₹{Math.abs(entry.currentBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Detail rows */}
      <div style={{ margin: "14px 16px", background: "#f8fafc", borderRadius: 16, padding: "12px 16px", border: "1px solid #f1f5f9" }}>
        {[{ label: "Customer", value: entry.customerName }, ...(entry.customerMobile ? [{ label: "Mobile", value: entry.customerMobile }] : []), { label: "Transaction", value: txLabel }, { label: "Date", value: formattedDate }, { label: "Issued", value: issuedAt }, ...(entry.note ? [{ label: "Note", value: entry.note }] : [])].map((row, i, arr) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid #e9edf2" : "none", gap: 12 }}>
            <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", flexShrink: 0 }}>{row.label}</p>
            <p style={{ fontSize: 12, color: "#0b2c60", fontWeight: 700, textAlign: "right", wordBreak: "break-word", maxWidth: "62%" }}>{row.value}</p>
          </div>
        ))}
      </div>

      {/* QR section */}
      <div style={{ margin: "0 16px 14px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ background: "#fff", padding: 8, borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", flexShrink: 0 }}>
          <QRCode value={qrValue} size={72} fgColor="#0b2c60" bgColor="#fff" />
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#0b2c60", marginBottom: 4 }}>{hasToken ? "Scan to open & download" : "Scan for details"}</p>
          <p style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.6 }}>{hasToken ? "Scan QR code to open receipt online and download PDF." : "Share QR as a payment reminder to the customer."}</p>
        </div>
      </div>

      {/* Business contact */}
      {(businessAddress || businessMobile || businessWebsite) && (
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
