import { useState } from "react";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2 } from "lucide-react";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface AepsReceiptActionsProps {
  cardRef: RefObject<HTMLDivElement | null>;
  receipt: any;
  pageUrl: string;
}

/**
 * Print / Download PDF / Share via WhatsApp / Share Link action buttons.
 * Owns generatingPdf and sendingWa state and all handler logic.
 */
export function AepsReceiptActions({ cardRef, receipt, pageUrl }: AepsReceiptActionsProps) {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sendingWa, setSendingWa] = useState(false);

  const { receiptNumber, type, amount, customerName, businessName, businessMobile: bizMobile } = receipt;
  const isWithdrawal  = type === "withdrawal";
  const txLabel       = isWithdrawal ? "Cash Withdrawal" : "Cash Deposit";
  const formattedDate = receipt.date
    ? new Date(receipt.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const generatePdfBlob = async (): Promise<Blob | null> => {
    const el = cardRef.current;
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
    const el = cardRef.current;
    if (!el) return;
    const win = window.open("", "_blank", "width=600,height=900");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>AePS Receipt ${receiptNumber}</title>
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
    setTimeout(() => { win.print(); win.close(); }, 400);
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
          await navigator.share({ files: [file], title: `AePS Receipt ${receiptNumber}`, text: `AePS ${txLabel} receipt for ${customerName}` });
          return;
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
    } finally {
      setSendingWa(false);
    }
    const waText = [
      `🏦 *AePS ${txLabel} Receipt*`,
      `Receipt No: ${receiptNumber}`,
      `Customer: ${customerName}`,
      `Amount: ₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      `Date: ${formattedDate}`,
      `\n📎 View & download: ${pageUrl}`,
      `\n— ${businessName}`,
      ...(bizMobile ? [`📞 ${bizMobile}`] : []),
    ].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, "_blank");
    setSendingWa(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `AePS Receipt ${receiptNumber}`, url: pageUrl }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(pageUrl);
    }
  };

  return (
    <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <Button variant="outline" className="gap-2" onClick={handlePrint}>
        <Printer size={15} />Print
      </Button>
      <Button variant="outline" className="gap-2" onClick={handleDownloadPdf} disabled={generatingPdf}>
        <Download size={15} />{generatingPdf ? "Generating…" : "Download PDF"}
      </Button>
      <Button className="gap-2" style={{ background: "#25D366", color: "#fff" }} onClick={handleWhatsApp} disabled={sendingWa}>
        <WhatsAppIcon />{sendingWa ? "Preparing…" : "Share via WhatsApp"}
      </Button>
      <Button className="gap-2" style={{ background: "#0b2c60" }} onClick={handleShare}>
        <Share2 size={15} />Share Link
      </Button>
    </div>
  );
}
