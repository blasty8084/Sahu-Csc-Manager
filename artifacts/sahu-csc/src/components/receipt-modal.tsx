import { useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ReceiptModalProps } from "./receipt/receiptTypes";
import { ReceiptCard } from "./receipt/ReceiptCard";
import { ReceiptActionBar } from "./receipt/ReceiptActionBar";
import { useReceiptActions } from "./receipt/useReceiptActions";

export function ReceiptModal({
  entry,
  open,
  onClose,
  businessName = "SAHU CSC Center",
  businessAddress = "",
  businessMobile = "",
  businessWebsite = "",
  autoDownload = false,
  onAutoDownloadComplete,
  autoAction = null,
  onAutoActionComplete,
}: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const receiptNumber = entry
    ? (entry.receiptNumber ?? `CSC-${new Date(entry.createdAt).getFullYear()}-${String(entry.id).padStart(4, "0")}`)
    : "";

  const origin   = typeof window !== "undefined" ? window.location.origin : "";
  const basePath = typeof window !== "undefined" ? import.meta.env.BASE_URL.replace(/\/$/, "") : "";
  const verifyUrl = entry?.receiptToken
    ? `${origin}${basePath}/receipts/verify/${entry.receiptToken}`
    : `${origin}${basePath}/ledger`;

  const { handlePrint, handleDownloadPdf, handleWhatsApp, handleShare, generatingPdf, sendingWa } =
    useReceiptActions(entry, receiptNumber, verifyUrl, businessName, printRef);

  // Auto-trigger print/download/share/whatsapp when the modal opens
  useEffect(() => {
    const action = autoAction ?? (autoDownload ? "download" : null);
    if (!action || !open || !entry) return;
    const timer = setTimeout(async () => {
      try {
        if      (action === "download")  await handleDownloadPdf();
        else if (action === "print")     handlePrint();
        else if (action === "share")     await handleShare();
        else if (action === "whatsapp")  await handleWhatsApp();
        onAutoActionComplete?.();
        onAutoDownloadComplete?.();
      } catch { /* silently ignore auto-action failures */ }
    }, 400);
    return () => clearTimeout(timer);
  }, [autoAction, autoDownload, open, entry?.id]);

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm p-0 overflow-hidden rounded-2xl md:rounded-2xl gap-0 max-h-[95dvh] flex flex-col [&>button:last-child]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Receipt {receiptNumber}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-0">
          <ReceiptCard
            entry={entry}
            containerRef={printRef}
            businessName={businessName}
            businessAddress={businessAddress}
            businessMobile={businessMobile}
            businessWebsite={businessWebsite}
          />
        </div>

        <ReceiptActionBar
          generatingPdf={generatingPdf}
          sendingWa={sendingWa}
          onPrint={handlePrint}
          onDownload={handleDownloadPdf}
          onWhatsApp={handleWhatsApp}
          onShare={handleShare}
        />
      </DialogContent>
    </Dialog>
  );
}
