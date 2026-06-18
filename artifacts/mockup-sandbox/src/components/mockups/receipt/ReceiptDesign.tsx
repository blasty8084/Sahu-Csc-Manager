import QRCode from "react-qr-code";
import { CheckCircle2, Phone, MapPin, Globe } from "lucide-react";

const RECEIPT = {
  receiptNumber: "CSC-2026-0042",
  businessName: "SAHU CSC Center",
  businessAddress: "Village Barada, Boudh, Odisha - 762014",
  businessPhone: "+91 98765 43210",
  businessWeb: "sahucsc.in",
  customerName: "Ramesh Kumar Sahoo",
  serviceType: "Aadhar Card Update",
  date: "18 June 2026",
  issuedAt: "18 Jun 2026, 02:54 PM",
  operator: "admin",
  credit: 500,
  debit: 0,
  description: "Aadhar address correction service",
  verifyUrl: "https://sahucsc.in/receipts/verify/fbe05afd-1234-5678-abcd-ef0123456789",
};

const isCredit = RECEIPT.credit > 0;
const amount = isCredit ? RECEIPT.credit : RECEIPT.debit;
const amountColor = isCredit ? "#059669" : "#e11d48";
const amountPrefix = isCredit ? "+" : "-";
const txType = isCredit ? "Credit" : "Debit";

const rows = [
  { label: "Customer", value: RECEIPT.customerName },
  { label: "Service", value: RECEIPT.serviceType },
  { label: "Date", value: RECEIPT.date },
  { label: "Issued At", value: RECEIPT.issuedAt },
  { label: "Operator", value: RECEIPT.operator },
  { label: "Note", value: RECEIPT.description },
];

export default function ReceiptDesign() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e8eef7 0%, #f0f4fa 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{
        width: 340,
        background: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(11,44,96,0.18), 0 4px 16px rgba(0,0,0,0.08)",
      }}>

        {/* ── Navy header ── */}
        <div style={{
          background: "linear-gradient(135deg, #0b2c60 0%, #1a4a9e 100%)",
          padding: "22px 24px 20px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative blobs */}
          <div style={{ position: "absolute", top: -18, right: -18, width: 84, height: 84, borderRadius: "50%", background: "rgba(249,115,22,0.18)" }} />
          <div style={{ position: "absolute", bottom: -26, left: 28, width: 68, height: 68, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "absolute", top: 10, right: 60, width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

          <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            {/* Brand */}
            <div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
                {RECEIPT.businessName}
              </p>
              <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, letterSpacing: "-0.01em", lineHeight: 1, margin: 0 }}>
                SAHU <span style={{ color: "#f97316" }}>CSC</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, marginTop: 3 }}>Common Service Center</p>
            </div>
            {/* Receipt no */}
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 7.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>RECEIPT NO.</p>
              <p style={{ color: "#f97316", fontSize: 13, fontWeight: 900, fontFamily: "monospace", letterSpacing: "0.04em", marginTop: 4 }}>
                {RECEIPT.receiptNumber}
              </p>
              <div style={{
                marginTop: 6,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "rgba(34,197,94,0.18)",
                border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: 20,
                padding: "2px 8px",
              }}>
                <CheckCircle2 size={9} color="#4ade80" strokeWidth={2.5} />
                <span style={{ fontSize: 8, fontWeight: 800, color: "#4ade80", letterSpacing: "0.05em" }}>VERIFIED</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Accent stripe ── */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #f97316 0%, #fb923c 50%, #0b2c60 100%)" }} />

        {/* ── Amount block ── */}
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{
            background: `${amountColor}0d`,
            border: `1.5px solid ${amountColor}28`,
            borderRadius: 14,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 4px" }}>
                {txType} Amount
              </p>
              <p style={{ fontSize: 26, fontWeight: 900, color: amountColor, lineHeight: 1, margin: 0 }}>
                {amountPrefix}₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: `${amountColor}14`,
              border: `1.5px solid ${amountColor}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <CheckCircle2 size={20} color={amountColor} strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* ── Detail rows ── */}
        <div style={{ padding: "12px 20px 4px" }}>
          {rows.map((row, i, arr) => (
            <div key={row.label} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              padding: "7px 0",
              borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none",
              gap: 8,
            }}>
              <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, flexShrink: 0, margin: 0 }}>{row.label}</p>
              <p style={{ fontSize: 11, color: "#0b2c60", fontWeight: 700, textAlign: "right", wordBreak: "break-word", maxWidth: "60%", margin: 0 }}>{row.value}</p>
            </div>
          ))}
        </div>

        {/* ── QR + verify text ── */}
        <div style={{ padding: "8px 20px 16px", display: "flex", alignItems: "flex-end", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 9.5, fontWeight: 700, color: "#0b2c60", marginBottom: 4 }}>Scan to verify</p>
            <p style={{ fontSize: 8.5, color: "#94a3b8", lineHeight: 1.55, margin: 0 }}>
              Scan the QR code to verify this receipt online. Valid for customer records.
            </p>
          </div>
          <div style={{
            background: "#fff",
            padding: 8,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 10px rgba(11,44,96,0.1)",
            flexShrink: 0,
          }}>
            <QRCode value={RECEIPT.verifyUrl} size={80} fgColor="#0b2c60" bgColor="#fff" level="M" />
          </div>
        </div>

        {/* ── Dashed separator ── */}
        <div style={{ margin: "0 20px", borderTop: "1.5px dashed #e2e8f0" }} />

        {/* ── Business contact footer ── */}
        <div style={{ padding: "12px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {[
              { icon: <MapPin size={9} color="#64748b" />, text: RECEIPT.businessAddress },
              { icon: <Phone size={9} color="#64748b" />, text: RECEIPT.businessPhone },
              { icon: <Globe size={9} color="#64748b" />, text: RECEIPT.businessWeb },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                <span style={{ marginTop: 1, flexShrink: 0 }}>{item.icon}</span>
                <p style={{ fontSize: 8.5, color: "#64748b", margin: 0, lineHeight: 1.4 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom navy footer ── */}
        <div style={{
          background: "linear-gradient(90deg, #0b2c60, #1a4a9e)",
          padding: "10px 20px",
          textAlign: "center",
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#fff", margin: "0 0 2px" }}>
            Thank you for choosing SAHU CSC
          </p>
          <p style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", margin: 0 }}>
            Computer-generated receipt · No signature required
          </p>
        </div>
      </div>
    </div>
  );
}
