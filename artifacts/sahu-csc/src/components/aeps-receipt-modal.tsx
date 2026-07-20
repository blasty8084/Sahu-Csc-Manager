import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AepsReceiptModalProps } from "./aeps-receipt/aepsReceiptTypes";
import { AepsReceiptCard } from "./aeps-receipt/AepsReceiptCard";
import { useAepsReceiptActions } from "./aeps-receipt/useAepsReceiptActions";
import { Printer, Download, Share2, MessageCircle } from "lucide-react";

// Re-export type so existing import sites compile without change
export type { AepsTxReceipt } from "./aeps-receipt/aepsReceiptTypes";

export function AepsReceiptModal({
  tx,
  open,
  onClose,
  businessName = "SAHU CSC Center",
  businessAddress = "",
  businessMobile = "",
  businessWebsite = "",
}: AepsReceiptModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const txDate        = tx ? (tx.date ? new Date(tx.date + "T00:00:00") : new Date(tx.createdAt)) : new Date();
  const year          = txDate.getFullYear();
  const receiptNumber = tx ? `AEPS-${year}-${String(tx.id).padStart(4, "0")}` : "";

  const origin    = typeof window !== "undefined" ? window.location.origin : "";
  const basePath  = typeof window !== "undefined" ? import.meta.env.BASE_URL.replace(/\/$/, "") : "";
  const verifyUrl = tx?.receiptToken
    ? `${origin}${basePath}/receipts/verify/aeps/${tx.receiptToken}`
    : null;

  const { handlePrint, handleDownloadPdf, handleWhatsApp, handleShare, generatingPdf, sendingWa } =
    useAepsReceiptActions(tx, receiptNumber, verifyUrl, businessName, businessMobile, containerRef);

  if (!tx) return null;

  const actions = [
    { icon: Printer,       label: "Print",                         onClick: handlePrint,       disabled: false,        color: "#475569" },
    { icon: Download,      label: generatingPdf ? "…" : "PDF",    onClick: handleDownloadPdf, disabled: generatingPdf, color: "#0b2c60" },
    { icon: MessageCircle, label: sendingWa     ? "…" : "WhatsApp",onClick: handleWhatsApp,   disabled: sendingWa,     color: "#22c55e" },
    { icon: Share2,        label: "Share",                         onClick: handleShare,       disabled: false,        color: "#f97316" },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm p-0 overflow-hidden rounded-2xl md:rounded-2xl gap-0 max-h-[95dvh] flex flex-col [&>button:last-child]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>AePS Receipt {receiptNumber}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-0">
          <AepsReceiptCard
            tx={tx}
            containerRef={containerRef}
            businessName={businessName}
            businessAddress={businessAddress}
            businessMobile={businessMobile}
            businessWebsite={businessWebsite}
          />
        </div>

        {/* Action panel */}
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
      </DialogContent>
    </Dialog>
  );
}
