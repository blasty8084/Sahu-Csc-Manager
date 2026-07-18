import { useState } from "react";
import { Download, Share2, Printer } from "lucide-react";
import type { ReceiptData } from "@/components/receipts/ReceiptVerifyCard";

const WhatsAppIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface ReceiptQrSectionProps {
  data: ReceiptData;
  verifyUrl: string;
  cardRef: React.RefObject<HTMLDivElement | null>;
  txType: string;
  amount: number;
  formattedDate: string;
}

/**
 * Action button grid below the receipt card — Print, Download PDF, WhatsApp PDF, Share Link.
 * Owns the generatePdfBlob logic since it needs cardRef for html2canvas capture.
 */
export function ReceiptQrSection({ data, verifyUrl, cardRef, txType, amount, formattedDate }: ReceiptQrSectionProps) {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sendingWa, setSendingWa] = useState(false);

  const generatePdfBlob = async (): Promise<Blob | null> => {
    const el = cardRef.current;
    if (!el) return null;
    const prevWidth = el.style.width;
    const prevMaxWidth = el.style.maxWidth;
    el.style.width = "794px";
    el.style.maxWidth = "794px";
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pdfW) / canvas.width;
      if (imgH <= pdfH) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfW, imgH);
      } else {
        const scale = pdfH / imgH;
        pdf.addImage(imgData, "PNG", 0, 0, pdfW * scale, pdfH);
      }
      return pdf.output("blob");
    } finally {
      el.style.width = prevWidth;
      el.style.maxWidth = prevMaxWidth;
    }
  };

  const handlePrint = () => window.print();

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      const blob = await generatePdfBlob();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${data.receiptNumber}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } finally { setGeneratingPdf(false); }
  };

  const handleWhatsApp = async () => {
    setSendingWa(true);
    try {
      const blob = await generatePdfBlob();
      if (blob) {
        const file = new File([blob], `${data.receiptNumber}.pdf`, { type: "application/pdf" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: `Receipt ${data.receiptNumber} — SAHU CSC`, text: `Transaction receipt for ${data.customerName}` });
          return;
        }
      }
      const waText = [
        `🧾 *Receipt ${data.receiptNumber}*`,
        `Customer: ${data.customerName}`,
        `Service: ${data.serviceType}`,
        `${txType}: ₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        `Date: ${formattedDate}`,
        `\n📎 View & download PDF:\n${verifyUrl}`,
        `\n— ${data.businessName}`,
      ].join("\n");
      window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, "_blank");
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        window.open(`https://wa.me/?text=${encodeURIComponent(`🧾 Receipt ${data.receiptNumber} — SAHU CSC\n\n📎 ${verifyUrl}`)}`, "_blank");
      }
    } finally { setSendingWa(false); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `Receipt ${data.receiptNumber} — SAHU CSC`, url: verifyUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(verifyUrl);
    }
  };

  const btn: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    border: "none", borderRadius: 10, padding: "10px 0",
    fontSize: 12, fontWeight: 600, cursor: "pointer", width: "100%",
  };

  return (
    <div className="no-print" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
      <button onClick={handlePrint} style={{ ...btn, background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}>
        <Printer size={14} /> Print
      </button>
      <button onClick={handleDownloadPdf} disabled={generatingPdf} style={{ ...btn, background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", opacity: generatingPdf ? 0.7 : 1, cursor: generatingPdf ? "not-allowed" : "pointer" }}>
        <Download size={14} /> {generatingPdf ? "Saving…" : "Download PDF"}
      </button>
      <button onClick={handleWhatsApp} disabled={sendingWa} style={{ ...btn, background: "#25D366", color: "#fff", opacity: sendingWa ? 0.7 : 1, cursor: sendingWa ? "not-allowed" : "pointer" }}>
        <WhatsAppIcon size={14} /> {sendingWa ? "Preparing…" : "WhatsApp PDF"}
      </button>
      <button onClick={handleShare} style={{ ...btn, background: "#f97316", color: "#fff" }}>
        <Share2 size={14} /> Share Link
      </button>
    </div>
  );
}
