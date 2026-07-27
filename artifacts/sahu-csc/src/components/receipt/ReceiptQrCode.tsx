// receipt/ReceiptQrCode.tsx — QR verify block + business contact + footer
import QRCode from "react-qr-code";
import { MapPin, Phone, Globe } from "lucide-react";

interface ReceiptQrCodeProps {
  receiptToken: string | null;
  verifyUrl: string;
  businessName?: string;
  businessAddress?: string;
  businessMobile?: string;
  businessWebsite?: string;
}

export function ReceiptQrCode({
  receiptToken,
  verifyUrl,
  businessName = "SAHU CSC Center",
  businessAddress = "",
  businessMobile = "",
  businessWebsite = "",
}: ReceiptQrCodeProps) {
  const hasContact = businessAddress || businessMobile || businessWebsite;

  return (
    <>
      {/* ── QR + Scan hint ───────────────────────────────────────────────────── */}
      {receiptToken && (
        <div style={{ margin: "0 16px 14px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            background: "#fff", padding: 8, borderRadius: 12,
            border: "1px solid var(--color-slate-200)", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", flexShrink: 0,
          }}>
            <QRCode value={verifyUrl} size={72} fgColor="var(--brand-navy-800)" bgColor="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-navy-800)", marginBottom: 4 }}>Scan to open &amp; download</p>
            <p style={{ fontSize: 9, color: "var(--color-slate-400)", lineHeight: 1.6 }}>
              Scan QR code to open receipt online. Download PDF or share via WhatsApp from there.
            </p>
          </div>
        </div>
      )}

      {/* ── Business contact ─────────────────────────────────────────────────── */}
      {hasContact && (
        <div style={{ margin: "0 16px 14px", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-slate-700)", marginBottom: 4 }}>{businessName}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
            {businessAddress && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <MapPin size={9} color="var(--color-slate-400)" />
                <p style={{ fontSize: 9, color: "var(--color-slate-500)" }}>{businessAddress}</p>
              </div>
            )}
            {businessMobile && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Phone size={9} color="var(--color-slate-400)" />
                <p style={{ fontSize: 9, color: "var(--color-slate-500)" }}>+91 {businessMobile.replace(/^(\+91|91)/, "").trim()}</p>
              </div>
            )}
            {businessWebsite && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Globe size={9} color="var(--color-slate-400)" />
                <p style={{ fontSize: 9, color: "var(--color-slate-500)" }}>{businessWebsite}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--color-slate-50)", borderTop: "1px solid var(--color-slate-100)", padding: "10px 22px", textAlign: "center" }}>
        <p style={{ fontSize: 10, color: "var(--color-slate-400)", fontWeight: 600 }}>
          Computer generated receipt · No signature required
        </p>
      </div>
    </>
  );
}
