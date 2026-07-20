import { MapPin, Phone, Globe } from "lucide-react";

interface AepsReceiptFooterProps {
  businessName: string;
  businessAddress?: string;
  businessMobile?: string;
  businessWebsite?: string;
  hasContact: boolean;
}

export function AepsReceiptFooter({
  businessName,
  businessAddress,
  businessMobile,
  businessWebsite,
  hasContact,
}: AepsReceiptFooterProps) {
  return (
    <>
      {/* Business contact */}
      {hasContact && (
        <div style={{ margin: "0 16px 14px", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 4 }}>{businessName}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
            {businessAddress && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <MapPin size={9} color="#94a3b8" />
                <p style={{ fontSize: 9, color: "#64748b" }}>{businessAddress}</p>
              </div>
            )}
            {businessMobile && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Phone size={9} color="#94a3b8" />
                <p style={{ fontSize: 9, color: "#64748b" }}>+91 {businessMobile.replace(/^(\+91|91)/, "").trim()}</p>
              </div>
            )}
            {businessWebsite && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Globe size={9} color="#94a3b8" />
                <p style={{ fontSize: 9, color: "#64748b" }}>{businessWebsite}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer bar */}
      <div style={{ background: "#f8fafc", borderTop: "1px solid #f1f5f9", padding: "10px 22px", textAlign: "center" }}>
        <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>
          AePS transaction receipt · Aadhaar-Enabled Payment System
        </p>
      </div>
    </>
  );
}
