import { Printer, Download, Share2, MessageCircle } from "lucide-react";

interface ReceiptActionBarProps {
  generatingPdf: boolean;
  sendingWa: boolean;
  onPrint: () => void;
  onDownload: () => void;
  onWhatsApp: () => void;
  onShare: () => void;
}

/** Print / PDF / WhatsApp / Share action bar shown at the bottom of the receipt modal. */
export function ReceiptActionBar({ generatingPdf, sendingWa, onPrint, onDownload, onWhatsApp, onShare }: ReceiptActionBarProps) {
  const actions = [
    { icon: Printer,      label: "Print",                         onClick: onPrint,    disabled: false,         color: "#475569" },
    { icon: Download,     label: generatingPdf ? "…" : "PDF",    onClick: onDownload, disabled: generatingPdf,  color: "#0b2c60" },
    { icon: MessageCircle,label: sendingWa     ? "…" : "WhatsApp",onClick: onWhatsApp, disabled: sendingWa,      color: "#22c55e" },
    { icon: Share2,       label: "Share",                         onClick: onShare,    disabled: false,         color: "#f97316" },
  ] as const;

  return (
    <div style={{ background: "#fff", borderTop: "1px solid #f1f5f9", padding: "10px 16px 12px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, flexShrink: 0 }}>
      {actions.map(({ icon: Icon, label, onClick, disabled, color }) => (
        <button key={label} onClick={onClick} disabled={disabled}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, padding: "8px 4px", borderRadius: 12, border: "none", background: "#f8fafc", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, transition: "all 0.15s" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.10)", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={16} color={color} />
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        </button>
      ))}
    </div>
  );
}
