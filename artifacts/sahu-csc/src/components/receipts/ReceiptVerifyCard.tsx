import QRCode from "react-qr-code";
import { CheckCircle2, MapPin, Phone, Globe, ShieldCheck, ShieldAlert } from "lucide-react";

export interface ReceiptData {
  receiptNumber: string;
  date: string;
  customerName: string;
  serviceType: string;
  credit: number;
  debit: number;
  description: string | null;
  createdByName: string | null;
  createdAt: string;
  businessName: string;
  businessAddress: string;
  businessMobile: string;
  businessWebsite: string;
  verified?: boolean;
}

interface ReceiptVerifyCardProps {
  data: ReceiptData;
  verifyUrl: string;
  cardRef: React.RefObject<HTMLDivElement | null>;
  formattedDate: string;
  issuedAt: string;
  hasContact: boolean;
  amountColor: string;
  amountPrefix: string;
  txType: string;
  amount: number;
}

/**
 * Full printable receipt card — navy header, amount block, detail rows,
 * inline QR code, business contact footer. Wraps the cardRef div used for PDF capture.
 */
export function ReceiptVerifyCard({
  data, verifyUrl, cardRef, formattedDate, issuedAt,
  hasContact, amountColor, amountPrefix, txType, amount,
}: ReceiptVerifyCardProps) {
  return (
    <div id="receipt-card" style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.28)" }}>
      <div id="receipt-card-inner" ref={cardRef}>

        {/* Navy header */}
        <div style={{ background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", padding: "20px 24px 18px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -18, right: -18, width: 90, height: 90, borderRadius: "50%", background: "rgba(249,115,22,0.18)" }} />
          <div style={{ position: "absolute", bottom: -26, left: 36, width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, position: "relative" }}>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              {data.businessName}
            </p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" }}>
              Receipt No.
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative" }}>
            <div>
              <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 900, letterSpacing: "-0.01em", lineHeight: 1 }}>
                SAHU <span style={{ color: "#f97316" }}>CSC</span>
              </h1>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, marginTop: 4 }}>Common Service Center</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "#f97316", fontSize: 15, fontWeight: 900, fontFamily: "monospace", letterSpacing: "0.03em" }}>
                {data.receiptNumber}
              </p>
              {data.verified ? (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(34,197,94,0.18)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 20, padding: "3px 9px", marginTop: 6 }}>
                  <ShieldCheck size={10} color="#22c55e" strokeWidth={2.5} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", letterSpacing: "0.07em" }}>VERIFIED</span>
                </div>
              ) : (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(251,191,36,0.18)", border: "1px solid rgba(251,191,36,0.4)", borderRadius: 20, padding: "3px 9px", marginTop: 6 }}>
                  <ShieldAlert size={10} color="#fbbf24" strokeWidth={2.5} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#fbbf24", letterSpacing: "0.07em" }}>LEGACY</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Accent stripe */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #f97316, #fb923c 60%, #0b2c60)" }} />

        {/* Amount block */}
        <div style={{ padding: "16px 24px 0" }}>
          <div style={{ background: `${amountColor}0f`, border: `1px solid ${amountColor}2a`, borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>
                {txType} Amount
              </p>
              <p style={{ fontSize: 28, fontWeight: 900, color: amountColor, lineHeight: 1 }}>
                {amountPrefix}₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${amountColor}18`, border: `2px solid ${amountColor}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 size={20} color={amountColor} strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Detail rows */}
        <div style={{ padding: "12px 24px" }}>
          {[
            { label: "Customer", value: data.customerName },
            { label: "Service",  value: data.serviceType },
            { label: "Date",     value: formattedDate },
            { label: "Issued At", value: issuedAt },
            ...(data.createdByName ? [{ label: "Operator", value: data.createdByName }] : []),
            ...(data.description  ? [{ label: "Note",     value: data.description  }] : []),
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none", gap: 12 }}>
              <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, flexShrink: 0 }}>{row.label}</p>
              <p style={{ fontSize: 12, color: "#0b2c60", fontWeight: 700, textAlign: "right", wordBreak: "break-word", maxWidth: "62%" }}>{row.value}</p>
            </div>
          ))}
        </div>

        {/* Inline QR — stays inside cardRef so it appears in the PDF */}
        <div style={{ padding: "0 24px 16px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ flex: 1, paddingRight: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#0b2c60", marginBottom: 4 }}>Scan to open & download</p>
            <p style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.6 }}>
              Share this QR code with your customer. Scanning opens this receipt for PDF download.
            </p>
          </div>
          <div style={{ background: "#fff", padding: 10, borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", flexShrink: 0 }}>
            <QRCode value={verifyUrl} size={88} fgColor="#0b2c60" bgColor="#fff" />
          </div>
        </div>

        {/* Business contact */}
        {hasContact && (
          <div style={{ borderTop: "1px dashed #e2e8f0", padding: "10px 24px", display: "flex", flexDirection: "column", gap: 5 }}>
            {data.businessAddress && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                <MapPin size={10} color="#94a3b8" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 10, color: "#64748b" }}>{data.businessAddress}</p>
              </div>
            )}
            {data.businessMobile && (
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Phone size={10} color="#94a3b8" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: 10, color: "#64748b" }}>+91 {data.businessMobile.replace(/^(\+91|91)/, "").trim()}</p>
              </div>
            )}
            {data.businessWebsite && (
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Globe size={10} color="#94a3b8" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: 10, color: "#64748b" }}>{data.businessWebsite}</p>
              </div>
            )}
          </div>
        )}

        {/* Card footer */}
        <div style={{ background: "#0b2c60", padding: "12px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Thank you for choosing SAHU CSC</p>
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>Computer generated receipt · No signature required</p>
        </div>

      </div>
    </div>
  );
}
