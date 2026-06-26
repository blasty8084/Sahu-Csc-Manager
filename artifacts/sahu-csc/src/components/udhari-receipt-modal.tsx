import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Printer, Share2, MapPin, Phone, Globe, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from "lucide-react";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

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

  const year = new Date(entry.date + "T00:00:00").getFullYear();
  const receiptNumber = `UDH-${year}-${String(entry.id).padStart(4, "0")}`;

  const isGave = entry.type === "gave";
  const accentColor = isGave ? "#ea580c" : "#059669";
  const headerGrad = isGave
    ? "linear-gradient(135deg, #7c2d12, #ea580c)"
    : "linear-gradient(135deg, #064e3b, #059669)";
  const stripeGrad = isGave
    ? "linear-gradient(90deg, #ea580c, #f97316 60%, #0b2c60)"
    : "linear-gradient(90deg, #059669, #10b981 60%, #0b2c60)";
  const txLabel = isGave ? "You Gave" : "You Got";
  const amountPrefix = isGave ? "+" : "−";

  const balanceColor = entry.currentBalance > 0 ? "#ea580c" : entry.currentBalance < 0 ? "#059669" : "#64748b";
  const balanceLabel = entry.currentBalance > 0 ? "To Collect" : entry.currentBalance < 0 ? "To Pay" : "Settled";

  const formattedDate = new Date(entry.date + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  const issuedAt = new Date(entry.createdAt).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const hasContact = businessAddress || businessMobile || businessWebsite;
  const hasToken = !!entry.receiptToken;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const verifyUrl = hasToken
    ? `${origin}${basePath}/receipts/verify/udhari/${entry.receiptToken}`
    : null;

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
      if (err instanceof Error && err.name === "AbortError") { return; }
    } finally {
      setSendingWa(false);
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
      toast({ title: "Receipt link copied to clipboard" });
    } else {
      toast({ title: "Share not available for this entry", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm p-0 overflow-hidden rounded-2xl md:rounded-2xl gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Udhari Receipt {receiptNumber}</DialogTitle>
        </DialogHeader>

        <div ref={printRef} style={{ background: "#fff" }}>
          {/* Colored header */}
          <div style={{
            background: headerGrad,
            padding: "18px 22px 16px",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -16, right: -16, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.10)" }} />
            <div style={{ position: "absolute", bottom: -24, left: 32, width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, position: "relative" }}>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                {businessName}
              </p>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 8, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" }}>
                Udhari Khata
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: "rgba(255,255,255,0.15)",
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isGave
                    ? <ArrowUpRight size={18} color="#fff" />
                    : <ArrowDownLeft size={18} color="#fff" />}
                </div>
                <div>
                  <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 900, letterSpacing: "-0.01em", lineHeight: 1 }}>
                    {txLabel} <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600 }}>Receipt</span>
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, marginTop: 3 }}>Customer Credit Ledger</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 900, fontFamily: "monospace", letterSpacing: "0.03em" }}>
                  {receiptNumber}
                </p>
                {hasToken ? (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: "rgba(34,197,94,0.20)", border: "1px solid rgba(34,197,94,0.35)",
                    borderRadius: 20, padding: "3px 8px", marginTop: 5,
                  }}>
                    <CheckCircle2 size={9} color="#22c55e" strokeWidth={2.5} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", letterSpacing: "0.06em" }}>VERIFIED</span>
                  </div>
                ) : (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 20, padding: "3px 8px", marginTop: 5,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: "0.06em" }}>
                      {isGave ? "YOU GAVE" : "YOU GOT"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Accent stripe */}
          <div style={{ height: 3, background: stripeGrad }} />

          {/* Amount block */}
          <div style={{ padding: "14px 20px 0" }}>
            <div style={{
              background: `${accentColor}0f`,
              border: `1px solid ${accentColor}2a`,
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 2 }}>
                  {txLabel} Amount
                </p>
                <p style={{ fontSize: 24, fontWeight: 900, color: accentColor, lineHeight: 1 }}>
                  {amountPrefix}₹{entry.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `${accentColor}18`,
                border: `2px solid ${accentColor}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {isGave
                  ? <ArrowUpRight size={17} color={accentColor} strokeWidth={2.5} />
                  : <ArrowDownLeft size={17} color={accentColor} strokeWidth={2.5} />}
              </div>
            </div>
          </div>

          {/* Balance chip */}
          <div style={{ padding: "8px 20px 0", display: "flex", justifyContent: "flex-end" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: `${balanceColor}10`,
              border: `1px solid ${balanceColor}25`,
              borderRadius: 20, padding: "4px 10px",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: balanceColor }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: balanceColor }}>
                {balanceLabel}: ₹{Math.abs(entry.currentBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Detail rows */}
          <div style={{ padding: "10px 20px" }}>
            {[
              { label: "Customer", value: entry.customerName },
              ...(entry.customerMobile ? [{ label: "Mobile", value: entry.customerMobile }] : []),
              { label: "Service", value: "Udhari Khata" },
              { label: "Transaction", value: txLabel },
              { label: "Date", value: formattedDate },
              { label: "Issued At", value: issuedAt },
              ...(entry.note ? [{ label: "Note", value: entry.note }] : []),
            ].map((row, i, arr) => (
              <div key={row.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                padding: "6px 0", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none", gap: 8,
              }}>
                <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, flexShrink: 0 }}>{row.label}</p>
                <p style={{ fontSize: 11, color: "#0b2c60", fontWeight: 700, textAlign: "right", wordBreak: "break-word", maxWidth: "62%" }}>
                  {row.value}
                </p>
              </div>
            ))}
          </div>

          {/* QR code */}
          <div style={{ padding: "0 20px 12px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ flex: 1, paddingRight: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#0b2c60", marginBottom: 3 }}>
                {hasToken ? "Scan to open & download" : "Scan for details"}
              </p>
              <p style={{ fontSize: 8, color: "#94a3b8", lineHeight: 1.5 }}>
                {hasToken
                  ? "Scan QR to open receipt online and download the PDF."
                  : "Scan to view entry details. Share as a reminder."}
              </p>
            </div>
            <div style={{
              background: "#fff", padding: 8, borderRadius: 10,
              border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flexShrink: 0,
            }}>
              <QRCode value={qrValue} size={70} fgColor="#0b2c60" bgColor="#fff" />
            </div>
          </div>

          {/* Business contact */}
          {hasContact && (
            <div style={{ borderTop: "1px dashed #e2e8f0", padding: "10px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
              {businessAddress && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <MapPin size={9} color="#94a3b8" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 9, color: "#64748b" }}>{businessAddress}</p>
                </div>
              )}
              {businessMobile && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Phone size={9} color="#94a3b8" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 9, color: "#64748b" }}>+91 {businessMobile.replace(/^(\+91|91)/, "").trim()}</p>
                </div>
              )}
              {businessWebsite && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Globe size={9} color="#94a3b8" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 9, color: "#64748b" }}>{businessWebsite}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ background: "#0b2c60", padding: "10px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Thank you for choosing SAHU CSC</p>
            <p style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>Computer generated receipt · No signature required</p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ padding: "10px 14px 12px", background: "#fff", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handlePrint}>
            <Printer size={13} />Print
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleDownloadPdf} disabled={generatingPdf}>
            <Download size={13} />
            {generatingPdf ? "Generating…" : "PDF"}
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" style={{ background: "#25D366", color: "#fff" }}
            onClick={handleWhatsApp} disabled={sendingWa}>
            <WhatsAppIcon />{sendingWa ? "Preparing…" : "WhatsApp"}
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" style={{ background: "#0b2c60" }} onClick={handleShare}>
            <Share2 size={13} />Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
