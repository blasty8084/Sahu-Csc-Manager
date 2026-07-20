// receipt/ReceiptDownloadButton.tsx
// Owns: generatePdfBlob, handlePrint, handleDownloadPdf, handleWhatsApp, handleShare,
//       the auto-action useEffect, and the four action-panel buttons.
import { useEffect, useState } from "react";
import { Download, Printer, Share2, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Minimal slice of ReceiptEntry that the action handlers actually need.
// receipt-modal.tsx passes the full ReceiptEntry; structural typing satisfies this.
interface ActionEntry {
  id: number;
  createdAt: string;
  customerName: string;
  serviceType: string;
}

export interface ReceiptDownloadButtonProps {
  printRef: React.RefObject<HTMLDivElement | null>;
  entry: ActionEntry;
  receiptNumber: string;
  receiptToken: string | null;
  verifyUrl: string;
  businessName: string;
  txType: string;
  amount: number;
  formattedDate: string;
  open: boolean;
  autoAction?: "print" | "download" | "share" | "whatsapp" | null;
  autoDownload?: boolean;
  onAutoActionComplete?: () => void;
  onAutoDownloadComplete?: () => void;
}

export function ReceiptDownloadButton({
  printRef, entry, receiptNumber, receiptToken, verifyUrl,
  businessName, txType, amount, formattedDate,
  open, autoAction = null, autoDownload = false,
  onAutoActionComplete, onAutoDownloadComplete,
}: ReceiptDownloadButtonProps) {
  const { toast } = useToast();
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sendingWa, setSendingWa]         = useState(false);

  // ── PDF blob ─────────────────────────────────────────────────────────────────
  const generatePdfBlob = async (): Promise<Blob | null> => {
    const el = printRef.current;
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

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
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
    </head><body>${printContent.innerHTML}</body></html>`);
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
      const a   = document.createElement("a");
      a.href     = url;
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
            title: `Receipt ${receiptNumber} — SAHU CSC`,
            text: `Transaction receipt for ${entry.customerName}`,
          });
          return;
        }
      }
      const waText = [
        `🧾 *Receipt ${receiptNumber}*`,
        `Customer: ${entry.customerName}`,
        `Service: ${entry.serviceType}`,
        `${txType}: ₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        `Date: ${formattedDate}`,
        ...(receiptToken ? [`\n📎 View & download PDF: ${verifyUrl}`] : []),
        `\n— ${businessName}`,
      ].join("\n");
      window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, "_blank");
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        const waText = [
          `🧾 *Receipt ${receiptNumber}*`,
          `Customer: ${entry.customerName}`,
          ...(receiptToken ? [`📎 View & download PDF: ${verifyUrl}`] : []),
        ].join("\n");
        window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, "_blank");
      }
    } finally {
      setSendingWa(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt ${receiptNumber} — SAHU CSC`,
          text: `Transaction receipt for ${entry.customerName} (${receiptNumber})`,
          ...(receiptToken ? { url: verifyUrl } : {}),
        });
      } catch { /* user cancelled */ }
    } else if (receiptToken) {
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

  // ── Auto-action effect ────────────────────────────────────────────────────────
  useEffect(() => {
    const action = autoAction ?? (autoDownload ? "download" : null);
    if (!action || !open || !entry) return;
    const timer = setTimeout(async () => {
      if (!printRef.current) return;
      try {
        if (action === "download") {
          setGeneratingPdf(true);
          const blob = await generatePdfBlob();
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a   = document.createElement("a");
            a.href     = url;
            a.download = `${receiptNumber}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
          }
        } else if (action === "print")    { handlePrint(); }
        else if (action === "share")      { await handleShare(); }
        else if (action === "whatsapp")   { await handleWhatsApp(); }
        onAutoActionComplete?.();
        onAutoDownloadComplete?.();
      } catch {
        /* silently ignore auto-action failures */
      } finally {
        setGeneratingPdf(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [autoAction, autoDownload, open, entry?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Action-panel buttons ──────────────────────────────────────────────────────
  const actions = [
    { Icon: Printer,      label: "Print",                         onClick: handlePrint,       disabled: false,          color: "#475569" },
    { Icon: Download,     label: generatingPdf ? "…" : "PDF",    onClick: handleDownloadPdf, disabled: generatingPdf,  color: "#0b2c60" },
    { Icon: MessageCircle, label: sendingWa ? "…" : "WhatsApp",  onClick: handleWhatsApp,    disabled: sendingWa,      color: "#22c55e" },
    { Icon: Share2,       label: "Share",                         onClick: handleShare,       disabled: false,          color: "#f97316" },
  ];

  return (
    <div style={{ background: "#fff", borderTop: "1px solid #f1f5f9", padding: "10px 16px 12px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, flexShrink: 0 }}>
      {actions.map(({ Icon, label, onClick, disabled, color }) => (
        <button
          key={label}
          onClick={onClick}
          disabled={disabled}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 5, padding: "8px 4px", borderRadius: 12, border: "none", background: "#f8fafc",
            cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1,
            transition: "all 0.15s",
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: "50%", background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.10)", border: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon size={16} color={color} />
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        </button>
      ))}
    </div>
  );
}
