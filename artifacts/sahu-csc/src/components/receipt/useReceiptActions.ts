import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ReceiptEntry } from "./receiptTypes";

/**
 * All PDF/print/WhatsApp/Share logic for ReceiptModal.
 * Returns action handlers + loading flags.
 * `containerRef` must be attached to the printable DOM element (ReceiptCard).
 */
export function useReceiptActions(
  entry: ReceiptEntry | null,
  receiptNumber: string,
  verifyUrl: string,
  businessName: string,
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const { toast } = useToast();
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sendingWa,     setSendingWa]     = useState(false);

  const generatePdfBlob = async (): Promise<Blob | null> => {
    const el = containerRef.current;
    if (!el) return null;
    const prevWidth    = el.style.width;
    const prevMaxWidth = el.style.maxWidth;
    el.style.width    = "794px";
    el.style.maxWidth = "794px";
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas  = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf     = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW    = pdf.internal.pageSize.getWidth();
      const pdfH    = pdf.internal.pageSize.getHeight();
      const imgH    = (canvas.height * pdfW) / canvas.width;
      if (imgH <= pdfH) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfW, imgH);
      } else {
        const scale = pdfH / imgH;
        pdf.addImage(imgData, "PNG", 0, 0, pdfW * scale, pdfH);
      }
      return pdf.output("blob");
    } finally {
      el.style.width    = prevWidth;
      el.style.maxWidth = prevMaxWidth;
    }
  };

  const handlePrint = () => {
    const el = containerRef.current;
    if (!el) return;
    const win = window.open("", "_blank", "width=600,height=900");
    if (!win) { toast({ title: "Popup blocked", description: "Please allow popups for printing", variant: "destructive" }); return; }
    win.document.write(`<!DOCTYPE html><html><head><title>Receipt ${receiptNumber}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff}@page{size:A4;margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}svg{display:block}</style>
    </head><body>${el.innerHTML}</body></html>`);
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
    } catch {
      toast({ title: "PDF generation failed", variant: "destructive" });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleWhatsApp = async () => {
    if (!entry) return;
    const isCredit = entry.credit > 0;
    const amount   = isCredit ? entry.credit : entry.debit;
    const txType   = isCredit ? "Credit" : "Debit";
    const formattedDate = new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    setSendingWa(true);
    try {
      const blob = await generatePdfBlob();
      if (blob) {
        const file = new File([blob], `${receiptNumber}.pdf`, { type: "application/pdf" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: `Receipt ${receiptNumber} — SAHU CSC`, text: `Transaction receipt for ${entry.customerName}` });
          return;
        }
      }
      const waText = [
        `🧾 *Receipt ${receiptNumber}*`,
        `Customer: ${entry.customerName}`,
        `Service: ${entry.serviceType}`,
        `${txType}: ₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        `Date: ${formattedDate}`,
        ...(entry.receiptToken ? [`\n📎 View & download PDF: ${verifyUrl}`] : []),
        `\n— ${businessName}`,
      ].join("\n");
      window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, "_blank");
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        const waText = [`🧾 *Receipt ${receiptNumber}*`, `Customer: ${entry.customerName}`, ...(entry.receiptToken ? [`📎 View & download PDF: ${verifyUrl}`] : [])].join("\n");
        window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, "_blank");
      }
    } finally {
      setSendingWa(false);
    }
  };

  const handleShare = async () => {
    if (!entry) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Receipt ${receiptNumber} — SAHU CSC`, text: `Transaction receipt for ${entry.customerName} (${receiptNumber})`, ...(entry.receiptToken ? { url: verifyUrl } : {}) });
      } catch { /* user cancelled */ }
    } else if (entry.receiptToken) {
      try {
        await navigator.clipboard.writeText(verifyUrl);
        toast.success("Receipt link copied to clipboard");
      } catch {
        toast({ title: "Could not copy link", description: "Please copy manually: " + verifyUrl, variant: "destructive" });
      }
    } else {
      toast({ title: "Share not available for this entry", variant: "destructive" });
    }
  };

  return { generatePdfBlob, handlePrint, handleDownloadPdf, handleWhatsApp, handleShare, generatingPdf, sendingWa };
}
