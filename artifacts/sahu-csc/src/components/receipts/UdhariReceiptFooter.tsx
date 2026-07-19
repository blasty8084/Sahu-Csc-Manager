import { MapPin, Phone, Globe } from "lucide-react";

interface UdhariReceiptFooterProps {
  businessAddress?: string;
  businessMobile?: string;
  businessWebsite?: string;
}

/**
 * Business contact block (address, mobile, website) + the dark navy footer bar.
 * Rendered at the bottom of the printable UdhariReceiptCard.
 */
export function UdhariReceiptFooter({ businessAddress, businessMobile, businessWebsite }: UdhariReceiptFooterProps) {
  const hasContact = !!(businessAddress || businessMobile || businessWebsite);
  return (
    <>
      {hasContact && (
        <div style={{ borderTop: "1px dashed #e2e8f0", padding: "12px 24px", display: "flex", flexDirection: "column", gap: 5 }}>
          {businessAddress && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
              <MapPin size={10} color="#94a3b8" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 10, color: "#64748b" }}>{businessAddress}</p>
            </div>
          )}
          {businessMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Phone size={10} color="#94a3b8" />
              <p style={{ fontSize: 10, color: "#64748b" }}>+91 {businessMobile.replace(/^(\+91|91)/, "").trim()}</p>
            </div>
          )}
          {businessWebsite && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Globe size={10} color="#94a3b8" />
              <p style={{ fontSize: 10, color: "#64748b" }}>{businessWebsite}</p>
            </div>
          )}
        </div>
      )}
      {/* Footer bar — CSC ID + document type */}
      <div style={{ background: "#0b2c60", padding: "12px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Thank you for choosing SAHU CSC</p>
        <p style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>Udhari Khata receipt · Customer credit ledger</p>
      </div>
    </>
  );
}
