import { useRef, useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Download, Printer, Share2, CheckCircle2, MapPin, Phone, Globe, ShieldCheck, MessageCircle } from "lucide-react";

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface ReceiptEntry {
  id: number;
  date: string;
  customerName: string;
  serviceType: string;
  credit: number;
  debit: number;
  description: string | null;
  balance: number;
  receiptNumber: string | null;
  receiptToken: string | null;
  createdByName: string | null;
  createdAt: string;
}

interface ReceiptModalProps {
  entry: ReceiptEntry | null;
  open: boolean;
  onClose: () => void;
  businessName?: string;
  businessAddress?: string;
  businessMobile?: string;
  businessWebsite?: string;
  autoDownload?: boolean;
  onAutoDownloadComplete?: () => void;
  autoAction?: "print" | "download" | "share" | "whatsapp" | null;
  onAutoActionComplete?: () => void;
}

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
  const { toast } = useToast();
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sendingWa, setSendingWa] = useState(false);

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
            const receiptNum = entry.receiptNumber ?? `CSC-${new Date(entry.createdAt).getFullYear()}-${String(entry.id).padStart(4, "0")}`;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${receiptNum}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
          }
        } else if (action === "print") {
          handlePrint();
        } else if (action === "share") {
          await handleShare();
        } else if (action === "whatsapp") {
          await handleWhatsApp();
        }
        onAutoActionComplete?.();
        onAutoDownloadComplete?.();
      } catch {
        /* silently ignore auto-action failures */
      } finally {
        setGeneratingPdf(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [autoAction, autoDownload, open, entry?.id]);

  if (!entry) return null;

  const receiptToken = entry.receiptToken;
  const receiptNumber = entry.receiptNumber ?? `CSC-${new Date(entry.createdAt).getFullYear()}-${String(entry.id).padStart(4, "0")}`;
  const isVerified = !!receiptToken;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const verifyUrl = receiptToken
    ? `${origin}${basePath}/receipts/verify/${receiptToken}`
    : `${origin}${basePath}/ledger`;

  const isCredit = entry.credit > 0;
  const amount = isCredit ? entry.credit : entry.debit;
  const amountColor = isCredit ? "#059669" : "#e11d48";
  const amountPrefix = isCredit ? "+" : "−";
  const txType = isCredit ? "Credit" : "Debit";

  const txDate = new Date(entry.date);
  const formattedDate = txDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const shortDate = txDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const issuedAt = new Date(entry.createdAt).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const hasContact = businessAddress || businessMobile || businessWebsite;

  const generatePdfBlob = async (): Promise<Blob | null> => {
    const el = printRef.current;
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

  const amountWhole = Math.floor(amount).toLocaleString("en-IN");
  const amountDecimal = (amount % 1).toFixed(2).slice(1);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm p-0 overflow-hidden rounded-2xl md:rounded-2xl gap-0 max-h-[95dvh] flex flex-col [&>button:last-child]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Receipt {receiptNumber}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-0">
          <div ref={printRef} style={{ background: "#fff" }}>

            {/* Premium Navy Header */}
            <div style={{
              background: "linear-gradient(135deg, #0b2c60 0%, #1a3f7a 55%, #071938 100%)",
              padding: "22px 24px 20px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Noise texture */}
              <div style={{
                position: "absolute", inset: 0, opacity: 0.15, pointerEvents: "none", mixBlendMode: "overlay",
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              }} />
              {/* Decorative circles */}
              <div style={{ position: "absolute", top: -20, right: -20, width: 88, height: 88, borderRadius: "50%", background: "rgba(249,115,22,0.15)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -28, left: 24, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />

              <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", position: "relative", lineHeight: 1, marginBottom: 4 }}>
                SAHU <span style={{ color: "#f97316" }}>CSC</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", position: "relative" }}>
                Official E-Receipt
              </p>

              {/* Gold accent stripe */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #f97316, #fcd34d 50%, #f97316)" }} />
            </div>

            {/* Receipt Info Row */}
            <div style={{ padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #e2e8f0" }}>
              <div>
                <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 2 }}>Receipt No</p>
                <p style={{ fontSize: 12, fontWeight: 800, color: "#0b2c60", fontFamily: "monospace", letterSpacing: "0.04em" }}>{receiptNumber}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 2 }}>Date</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#0b2c60" }}>{shortDate}</p>
              </div>
            </div>

            {/* Amount — Hero Typography */}
            <div style={{ padding: "18px 22px 14px", textAlign: "center", position: "relative" }}>
              {/* Watermark */}
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.025, pointerEvents: "none" }}>
                <ShieldCheck size={110} color="#0b2c60" strokeWidth={1} />
              </div>
              <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8, position: "relative" }}>
                {txType} Amount
              </p>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2, position: "relative" }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: amountColor, opacity: 0.8 }}>{amountPrefix}₹</span>
                <span style={{ fontSize: 46, fontWeight: 900, color: amountColor, letterSpacing: "-0.03em", lineHeight: 1 }}>{amountWhole}</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: amountColor, opacity: 0.75, alignSelf: "flex-start", marginTop: 10 }}>{amountDecimal}</span>
              </div>
              {isVerified && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, padding: "4px 10px" }}>
                  <CheckCircle2 size={11} color="#22c55e" strokeWidth={2.5} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", letterSpacing: "0.07em" }}>VERIFIED</span>
                </div>
              )}
            </div>

            {/* Detail Rows — rounded card */}
            <div style={{ margin: "0 16px 14px", background: "#f8fafc", borderRadius: 16, padding: "12px 16px", border: "1px solid #f1f5f9" }}>
              {[
                { label: "Customer", value: entry.customerName },
                { label: "Service", value: entry.serviceType },
                { label: "Issued", value: issuedAt },
                ...(entry.createdByName ? [{ label: "Operator", value: entry.createdByName }] : []),
                ...(entry.description ? [{ label: "Note", value: entry.description }] : []),
              ].map((row, i, arr) => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  padding: "7px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid #e9edf2" : "none",
                  gap: 12,
                }}>
                  <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", flexShrink: 0 }}>{row.label}</p>
                  <p style={{ fontSize: 12, color: "#0b2c60", fontWeight: 700, textAlign: "right", wordBreak: "break-word", maxWidth: "62%" }}>{row.value}</p>
                </div>
              ))}
            </div>

            {/* QR + Verified section */}
            {receiptToken && (
              <div style={{ margin: "0 16px 14px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  background: "#fff", padding: 8, borderRadius: 12,
                  border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", flexShrink: 0,
                }}>
                  <QRCode value={verifyUrl} size={72} fgColor="#0b2c60" bgColor="#fff" />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#0b2c60", marginBottom: 4 }}>Scan to open & download</p>
                  <p style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.6 }}>
                    Scan QR code to open receipt online. Download PDF or share via WhatsApp from there.
                  </p>
                </div>
              </div>
            )}

            {/* Business contact */}
            {hasContact && (
              <div style={{ margin: "0 16px 14px", textAlign: "center" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 4 }}>{businessName}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
                  {businessAddress && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <MapPin size={9} color="#94a3b8" />
                      <p style={{ fontSize: 9, color: "#64748b" }}>{businessAddress}</p>
                    </div>
                  )}
                  {businessMobile && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Phone size={9} color="#94a3b8" />
                      <p style={{ fontSize: 9, color: "#64748b" }}>+91 {businessMobile.replace(/^(\+91|91)/, "").trim()}</p>
                    </div>
                  )}
                  {businessWebsite && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Globe size={9} color="#94a3b8" />
                      <p style={{ fontSize: 9, color: "#64748b" }}>{businessWebsite}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ background: "#f8fafc", borderTop: "1px solid #f1f5f9", padding: "10px 22px", textAlign: "center" }}>
              <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>
                Computer generated receipt · No signature required
              </p>
            </div>
          </div>
        </div>

        {/* Action panel */}
        <div style={{ background: "#fff", borderTop: "1px solid #f1f5f9", padding: "10px 16px 12px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, flexShrink: 0 }}>
          {[
            { icon: Printer, label: "Print", onClick: handlePrint, disabled: false, color: "#475569" },
            { icon: Download, label: generatingPdf ? "…" : "PDF", onClick: handleDownloadPdf, disabled: generatingPdf, color: "#0b2c60" },
            { icon: MessageCircle, label: sendingWa ? "…" : "WhatsApp", onClick: handleWhatsApp, disabled: sendingWa, color: "#22c55e" },
            { icon: Share2, label: "Share", onClick: handleShare, disabled: false, color: "#f97316" },
          ].map(({ icon: Icon, label, onClick, disabled, color }) => (
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
      </DialogContent>
    </Dialog>
  );
}
