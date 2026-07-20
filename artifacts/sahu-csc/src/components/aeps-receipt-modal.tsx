import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AepsReceiptDetails } from "@/components/receipt/AepsReceiptDetails";
import { AepsReceiptFooter } from "@/components/receipt/AepsReceiptFooter";
import { AepsReceiptActions } from "@/components/receipt/AepsReceiptActions";

export interface AepsTxReceipt {
  id: number;
  type: "withdrawal" | "deposit";
  amount: number;
  customerName: string;
  description: string | null;
  balance?: number;
  createdAt: string;
  date?: string;
  receiptToken?: string | null;
}

interface AepsReceiptModalProps {
  tx: AepsTxReceipt | null;
  open: boolean;
  onClose: () => void;
  businessName?: string;
  businessAddress?: string;
  businessMobile?: string;
  businessWebsite?: string;
}

export function AepsReceiptModal({
  tx,
  open,
  onClose,
  businessName = "SAHU CSC Center",
  businessAddress = "",
  businessMobile = "",
  businessWebsite = "",
}: AepsReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sendingWa, setSendingWa] = useState(false);

  if (!tx) return null;

  const isWithdrawal = tx.type === "withdrawal";
  const amountColor = isWithdrawal ? "#e11d48" : "#059669";
  const amountPrefix = isWithdrawal ? "−" : "+";
  const txLabel = isWithdrawal ? "Cash Withdrawal" : "Cash Deposit";
  const headerGrad = isWithdrawal
    ? "linear-gradient(135deg, #7f1d1d 0%, #be1240 55%, #6b1228 100%)"
    : "linear-gradient(135deg, #064e3b 0%, #059669 55%, #044032 100%)";
  const stripeGrad = isWithdrawal
    ? "linear-gradient(90deg, #e11d48, #f43f5e 50%, #e11d48)"
    : "linear-gradient(90deg, #059669, #34d399 50%, #059669)";

  const txDate = tx.date ? new Date(tx.date + "T00:00:00") : new Date(tx.createdAt);
  const year = txDate.getFullYear();
  const receiptNumber = `AEPS-${year}-${String(tx.id).padStart(4, "0")}`;
  const formattedDate = txDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const shortDate = txDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const issuedAt = new Date(tx.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const hasContact = !!(businessAddress || businessMobile || businessWebsite);
  const hasToken = !!tx.receiptToken;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const verifyUrl = hasToken ? `${origin}${basePath}/receipts/verify/aeps/${tx.receiptToken}` : null;

  const qrValue = verifyUrl ?? [
    `SAHU CSC – AePS Receipt`,
    `Receipt: ${receiptNumber}`,
    `Type: ${txLabel}`,
    `Customer: ${tx.customerName}`,
    `Amount: ₹${tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    `Date: ${formattedDate}`,
  ].join("\n");

  const amountWhole = Math.floor(tx.amount).toLocaleString("en-IN");
  const amountDecimal = (tx.amount % 1).toFixed(2).slice(1);

  const generatePdfBlob = async (): Promise<Blob | null> => {
    const el = printRef.current;
    if (!el) return null;
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    return pdf.output("blob");
  };

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    const win = window.open("", "_blank", "width=600,height=900");
    if (!win) { toast({ title: "Popup blocked", description: "Please allow popups for printing", variant: "destructive" }); return; }
    win.document.write(`<!DOCTYPE html><html><head><title>Receipt ${receiptNumber}</title><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; } @page { size: A4; margin: 0; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } } svg { display: block; }</style></head><body>${el.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      const blob = await generatePdfBlob();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${receiptNumber}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast({ title: "PDF generation failed", variant: "destructive" }); }
    finally { setGeneratingPdf(false); }
  };

  const handleWhatsApp = async () => {
    setSendingWa(true);
    try {
      const blob = await generatePdfBlob();
      if (blob) {
        const file = new File([blob], `${receiptNumber}.pdf`, { type: "application/pdf" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: `AePS Receipt ${receiptNumber} — SAHU CSC`, text: `AePS ${txLabel} receipt for ${tx.customerName}` });
          return;
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") { setSendingWa(false); return; }
    }
    const waText = [
      `🏦 *AePS ${txLabel} Receipt*`,
      `Receipt No: ${receiptNumber}`,
      `Customer: ${tx.customerName}`,
      `Amount: ₹${tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      `Date: ${formattedDate}`,
      ...(verifyUrl ? [`\n📎 View & download PDF:\n${verifyUrl}`] : []),
      `\n— ${businessName}`,
      ...(businessMobile ? [`📞 ${businessMobile}`] : []),
    ].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, "_blank");
    setSendingWa(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `AePS Receipt ${receiptNumber} — SAHU CSC`, text: `AePS ${txLabel} receipt for ${tx.customerName}`, ...(verifyUrl ? { url: verifyUrl } : {}) }); }
      catch { /* user cancelled */ }
    } else if (verifyUrl) {
      await navigator.clipboard.writeText(verifyUrl);
      toast.success("Receipt link copied to clipboard");
    } else {
      toast({ title: "Share not available for this entry", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm p-0 overflow-hidden rounded-2xl md:rounded-2xl gap-0 max-h-[95dvh] flex flex-col [&>button:last-child]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>AePS Receipt {receiptNumber}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 min-h-0">
          <div ref={printRef} style={{ background: "#fff" }}>
            <AepsReceiptDetails
              tx={tx}
              receiptNumber={receiptNumber}
              txLabel={txLabel}
              headerGrad={headerGrad}
              stripeGrad={stripeGrad}
              amountColor={amountColor}
              amountPrefix={amountPrefix}
              amountWhole={amountWhole}
              amountDecimal={amountDecimal}
              formattedDate={formattedDate}
              shortDate={shortDate}
              issuedAt={issuedAt}
              hasToken={hasToken}
              qrValue={qrValue}
            />
            <AepsReceiptFooter
              businessName={businessName}
              businessAddress={businessAddress}
              businessMobile={businessMobile}
              businessWebsite={businessWebsite}
              hasContact={hasContact}
            />
          </div>
        </div>
        <AepsReceiptActions
          generatingPdf={generatingPdf}
          sendingWa={sendingWa}
          onPrint={handlePrint}
          onDownloadPdf={handleDownloadPdf}
          onWhatsApp={handleWhatsApp}
          onShare={handleShare}
        />
      </DialogContent>
    </Dialog>
  );
}
