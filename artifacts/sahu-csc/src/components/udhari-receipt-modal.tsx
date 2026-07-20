import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UdhariReceiptDetails } from "./receipt/UdhariReceiptDetails";
import { UdhariReceiptFooter } from "./receipt/UdhariReceiptFooter";
import { UdhariReceiptActions } from "./receipt/UdhariReceiptActions";

export interface UdhariEntryReceipt {
  id: number;
  type: "gave" | "got";
  amount: number;
  customerName: string;
  customerMobile?: string | null;
  customerAddress?: string | null;
  note: string | null;
  date: string;
  createdAt: string;
  currentBalance: number;
  receiptToken?: string | null;
}

interface UdhariReceiptModalProps {
  entry: UdhariEntryReceipt | null;
  open: boolean;
  onClose: () => void;
  businessName?: string;
  businessAddress?: string;
  businessMobile?: string;
  businessWebsite?: string;
}

export function UdhariReceiptModal({
  entry,
  open,
  onClose,
  businessName = "SAHU CSC Center",
  businessAddress = "",
  businessMobile = "",
  businessWebsite = "",
}: UdhariReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sendingWa, setSendingWa] = useState(false);

  if (!entry) return null;

  // ── Derived values ─────────────────────────────────────────────────────────
  const year = new Date(entry.date + "T00:00:00").getFullYear();
  const receiptNumber = `UDH-${year}-${String(entry.id).padStart(4, "0")}`;

  const isGave = entry.type === "gave";
  const accentColor = isGave ? "#ea580c" : "#059669";
  const headerGrad = isGave
    ? "linear-gradient(135deg, #7c2d12 0%, #c2410c 55%, #6b2400 100%)"
    : "linear-gradient(135deg, #064e3b 0%, #059669 55%, #044032 100%)";
  const stripeGrad = isGave
    ? "linear-gradient(90deg, #ea580c, #f97316 50%, #ea580c)"
    : "linear-gradient(90deg, #059669, #34d399 50%, #059669)";
  const txLabel = isGave ? "You Gave" : "You Got";
  const amountPrefix = isGave ? "+" : "−";

  const balanceColor = entry.currentBalance > 0 ? "#ea580c" : entry.currentBalance < 0 ? "#059669" : "#64748b";
  const balanceLabel = entry.currentBalance > 0 ? "To Collect" : entry.currentBalance < 0 ? "To Pay" : "Settled";

  const formattedDate = new Date(entry.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const shortDate = new Date(entry.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const issuedAt = new Date(entry.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const hasContact = !!(businessAddress || businessMobile || businessWebsite);
  const hasToken = !!entry.receiptToken;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const verifyUrl = hasToken ? `${origin}${basePath}/receipts/verify/udhari/${entry.receiptToken}` : null;

  const qrValue = verifyUrl ?? [
    `SAHU CSC – Udhari Khata Receipt`,
    `Receipt No: ${receiptNumber}`,
    `Type: ${txLabel}`,
    `Customer: ${entry.customerName}`,
    `Amount: ₹${entry.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    `Balance: ${balanceLabel} ₹${Math.abs(entry.currentBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    `Date: ${formattedDate}`,
    `Issued: ${issuedAt}`,
    ...(entry.note ? [`Note: ${entry.note}`] : []),
    businessName ? `Center: ${businessName}` : "",
  ].filter(Boolean).join("\n");

  const amountWhole = Math.floor(entry.amount).toLocaleString("en-IN");
  const amountDecimal = (entry.amount % 1).toFixed(2).slice(1);

  // ── Handlers ───────────────────────────────────────────────────────────────
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
    if (!win) {
      toast({ title: "Popup blocked", description: "Please allow popups for printing", variant: "destructive" });
      return;
    }
    win.document.write(`<!DOCTYPE html><html><head><title>Receipt ${receiptNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; }
        @page { size: A4; margin: 0; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        svg { display: block; }
      </style>
    </head><body>${el.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      const blob = await generatePdfBlob();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${receiptNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "PDF generation failed", variant: "destructive" });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleWhatsApp = async () => {
    setSendingWa(true);
    try {
      const blob = await generatePdfBlob();
      if (blob) {
        const file = new File([blob], `${receiptNumber}.pdf`, { type: "application/pdf" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Udhari Receipt ${receiptNumber} — SAHU CSC`,
            text: `${txLabel} ₹${entry.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} — ${entry.customerName}`,
          });
          return;
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") { setSendingWa(false); return; }
    }
    const mobile = entry.customerMobile?.replace(/\D/g, "") ?? "";
    const num = mobile.length >= 10 ? (mobile.startsWith("91") ? mobile : `91${mobile}`) : "";
    const waText = [
      `📒 *Udhari Khata Receipt — ${txLabel}*`,
      `Receipt No: ${receiptNumber}`,
      `Customer: ${entry.customerName}`,
      ...(entry.customerMobile ? [`📞 ${entry.customerMobile}`] : []),
      `Amount: ₹${entry.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      `Balance: ${balanceLabel} ₹${Math.abs(entry.currentBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      `Date: ${formattedDate}`,
      ...(entry.note ? [`Note: ${entry.note}`] : []),
      ...(verifyUrl ? [`\n📎 View & download PDF:\n${verifyUrl}`] : []),
      `\n— ${businessName}`,
      ...(businessMobile ? [`📞 ${businessMobile}`] : []),
    ].join("\n");
    const waBase = num ? `https://wa.me/${num}` : "https://wa.me/";
    window.open(`${waBase}?text=${encodeURIComponent(waText)}`, "_blank");
    setSendingWa(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Udhari Receipt ${receiptNumber} — SAHU CSC`,
          text: `${txLabel} ₹${entry.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} — ${entry.customerName}`,
          ...(verifyUrl ? { url: verifyUrl } : {}),
        });
      } catch { /* user cancelled */ }
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
          <DialogTitle>Udhari Receipt {receiptNumber}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-0">
          <div ref={printRef} style={{ background: "#fff" }}>
            <UdhariReceiptDetails
              isGave={isGave} accentColor={accentColor} headerGrad={headerGrad} stripeGrad={stripeGrad}
              txLabel={txLabel} amountPrefix={amountPrefix}
              receiptNumber={receiptNumber} shortDate={shortDate} hasToken={hasToken}
              amountWhole={amountWhole} amountDecimal={amountDecimal}
              balanceColor={balanceColor} balanceLabel={balanceLabel} currentBalance={entry.currentBalance}
              customerName={entry.customerName} customerMobile={entry.customerMobile} note={entry.note}
              formattedDate={formattedDate} issuedAt={issuedAt} qrValue={qrValue}
            />
            <UdhariReceiptFooter
              hasContact={hasContact}
              businessName={businessName} businessAddress={businessAddress}
              businessMobile={businessMobile} businessWebsite={businessWebsite}
            />
          </div>
        </div>

        <UdhariReceiptActions
          generatingPdf={generatingPdf} sendingWa={sendingWa} accentColor={accentColor}
          onPrint={handlePrint} onDownloadPdf={handleDownloadPdf}
          onWhatsApp={handleWhatsApp} onShare={handleShare}
        />
      </DialogContent>
    </Dialog>
  );
}
