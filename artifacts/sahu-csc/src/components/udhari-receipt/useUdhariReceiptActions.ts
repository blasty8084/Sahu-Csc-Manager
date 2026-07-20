import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { UdhariEntryReceipt } from "./udhariReceiptTypes";

export function useUdhariReceiptActions(
  entry: UdhariEntryReceipt | null,
  receiptNumber: string,
  verifyUrl: string | null,
  businessName: string,
  businessMobile: string,
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const { toast } = useToast();
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sendingWa,     setSendingWa]     = useState(false);

  const generatePdfBlob = async (): Promise<Blob | null> => {
    const el = containerRef.current;
    if (!el) return null;
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
    const canvas  = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
    const imgData = canvas.toDataURL("image/png");
    const pdf     = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfWidth  = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    return pdf.output("blob");
  };

  const handlePrint = () => {
    const el = containerRef.current;
    if (!el) return;
    const win = window.open("", "_blank", "width=600,height=900");
    if (!win) { toast({ title: "Popup blocked", description: "Please allow popups for printing", variant: "destructive" }); return; }
    win.document.write(`<!DOCTYPE html><html><head><title>Receipt ${receiptNumber}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff}@page{size:A4;margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}svg{display:block}</style></head><body>${el.innerHTML}</body></html>`);
    win.document.close(); win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
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
    if (!entry) return;
    const isGave       = entry.type === "gave";
    const txLabel      = isGave ? "You Gave" : "You Got";
    const balanceColor = entry.currentBalance > 0 ? "To Collect" : entry.currentBalance < 0 ? "To Pay" : "Settled";
    const formattedDate = new Date(entry.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    setSendingWa(true);
    try {
      const blob = await generatePdfBlob();
      if (blob) {
        const file = new File([blob], `${receiptNumber}.pdf`, { type: "application/pdf" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: `Udhari Receipt ${receiptNumber} — SAHU CSC`, text: `${txLabel} ₹${entry.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} — ${entry.customerName}` });
          return;
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") { setSendingWa(false); return; }
    }
    const mobile  = entry.customerMobile?.replace(/\D/g, "") ?? "";
    const num     = mobile.length >= 10 ? (mobile.startsWith("91") ? mobile : `91${mobile}`) : "";
    const waText  = [`📒 *Udhari Khata Receipt — ${txLabel}*`, `Receipt No: ${receiptNumber}`, `Customer: ${entry.customerName}`, ...(entry.customerMobile ? [`📞 ${entry.customerMobile}`] : []), `Amount: ₹${entry.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, `Balance: ${balanceColor} ₹${Math.abs(entry.currentBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, `Date: ${formattedDate}`, ...(entry.note ? [`Note: ${entry.note}`] : []), ...(verifyUrl ? [`\n📎 View & download PDF:\n${verifyUrl}`] : []), `\n— ${businessName}`, ...(businessMobile ? [`📞 ${businessMobile}`] : [])].join("\n");
    window.open(`${num ? `https://wa.me/${num}` : "https://wa.me/"}?text=${encodeURIComponent(waText)}`, "_blank");
    setSendingWa(false);
  };

  const handleShare = async () => {
    if (!entry) return;
    const isGave  = entry.type === "gave";
    const txLabel = isGave ? "You Gave" : "You Got";
    if (navigator.share) {
      try { await navigator.share({ title: `Udhari Receipt ${receiptNumber} — SAHU CSC`, text: `${txLabel} ₹${entry.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} — ${entry.customerName}`, ...(verifyUrl ? { url: verifyUrl } : {}) }); }
      catch { /* user cancelled */ }
    } else if (verifyUrl) {
      await navigator.clipboard.writeText(verifyUrl);
      toast.success("Receipt link copied to clipboard");
    } else { toast({ title: "Share not available for this entry", variant: "destructive" }); }
  };

  return { handlePrint, handleDownloadPdf, handleWhatsApp, handleShare, generatingPdf, sendingWa };
}
