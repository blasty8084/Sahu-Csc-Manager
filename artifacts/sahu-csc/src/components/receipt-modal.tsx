import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Printer, Share2, CheckCircle2, MapPin, Phone, Globe } from "lucide-react";

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
}

export function ReceiptModal({
  entry,
  open,
  onClose,
  businessName = "SAHU CSC Center",
  businessAddress = "",
  businessMobile = "",
  businessWebsite = "",
}: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [generatingPdf, setGeneratingPdf] = useState(false);

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
  const amountPrefix = isCredit ? "+" : "-";
  const txType = isCredit ? "Credit" : "Debit";

  const txDate = new Date(entry.date);
  const formattedDate = txDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const issuedAt = new Date(entry.createdAt).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const hasContact = businessAddress || businessMobile || businessWebsite;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const win = window.open("", "_blank", "width=600,height=900");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Receipt ${receiptNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; }
        @page { size: A5; margin: 0; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head><body>${printContent.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const handleDownloadPdf = async () => {
    const el = printRef.current;
    if (!el) return;
    setGeneratingPdf(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${receiptNumber}.pdf`);
    } catch {
      toast({ title: "PDF generation failed", variant: "destructive" });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleShare = async () => {
    if (!receiptToken) {
      toast({ title: "Receipt link not available for this entry", variant: "destructive" });
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: `Receipt ${receiptNumber} — SAHU CSC`, text: `Transaction receipt for ${entry.customerName} (${receiptNumber})`, url: verifyUrl });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(verifyUrl);
      toast({ title: "Receipt link copied to clipboard" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm p-0 overflow-hidden rounded-2xl md:rounded-2xl gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Receipt {receiptNumber}</DialogTitle>
        </DialogHeader>

        <div ref={printRef} style={{ background: "#fff" }}>
          {/* Navy header */}
          <div style={{
            background: "linear-gradient(135deg, #0b2c60, #1a4a9e)",
            padding: "18px 22px 16px",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -16, right: -16, width: 80, height: 80, borderRadius: "50%", background: "rgba(249,115,22,0.18)" }} />
            <div style={{ position: "absolute", bottom: -24, left: 32, width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />

            {/* Top label row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, position: "relative" }}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                {businessName}
              </p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 8, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" }}>
                Receipt No.
              </p>
            </div>

            {/* Brand + receipt number row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative" }}>
              <div>
                <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 900, letterSpacing: "-0.01em", lineHeight: 1 }}>
                  SAHU <span style={{ color: "#f97316" }}>CSC</span>
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, marginTop: 3 }}>Common Service Center</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: "#f97316", fontSize: 13, fontWeight: 900, fontFamily: "monospace", letterSpacing: "0.03em" }}>
                  {receiptNumber}
                </p>
                {isVerified && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: "rgba(34,197,94,0.18)", border: "1px solid rgba(34,197,94,0.4)",
                    borderRadius: 20, padding: "3px 8px", marginTop: 5,
                  }}>
                    <CheckCircle2 size={10} color="#22c55e" strokeWidth={2.5} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", letterSpacing: "0.06em" }}>VERIFIED</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Accent stripe */}
          <div style={{ height: 3, background: "linear-gradient(90deg, #f97316, #fb923c 60%, #0b2c60)" }} />

          {/* Amount block */}
          <div style={{ padding: "14px 20px 0" }}>
            <div style={{
              background: `${amountColor}0f`,
              border: `1px solid ${amountColor}2a`,
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 2 }}>
                  {txType} Amount
                </p>
                <p style={{ fontSize: 24, fontWeight: 900, color: amountColor, lineHeight: 1 }}>
                  {amountPrefix}₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `${amountColor}18`,
                border: `2px solid ${amountColor}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <CheckCircle2 size={18} color={amountColor} strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Detail rows */}
          <div style={{ padding: "10px 20px" }}>
            {[
              { label: "Customer", value: entry.customerName },
              { label: "Service", value: entry.serviceType },
              { label: "Date", value: formattedDate },
              { label: "Issued At", value: issuedAt },
              ...(entry.createdByName ? [{ label: "Operator", value: entry.createdByName }] : []),
              ...(entry.description ? [{ label: "Note", value: entry.description }] : []),
            ].map((row, i, arr) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "6px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none",
                  gap: 8,
                }}
              >
                <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, flexShrink: 0 }}>{row.label}</p>
                <p style={{ fontSize: 11, color: "#0b2c60", fontWeight: 700, textAlign: "right", wordBreak: "break-word", maxWidth: "62%" }}>{row.value}</p>
              </div>
            ))}
          </div>

          {/* QR code */}
          {receiptToken && (
            <div style={{ padding: "0 20px 12px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div style={{ flex: 1, paddingRight: 14 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#0b2c60", marginBottom: 3 }}>Scan to verify</p>
                <p style={{ fontSize: 8, color: "#94a3b8", lineHeight: 1.5 }}>
                  Scan the QR code to verify this receipt online. Valid for the customer's records.
                </p>
              </div>
              <div style={{
                background: "#fff",
                padding: 8,
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                flexShrink: 0,
              }}>
                <QRCode value={verifyUrl} size={70} fgColor="#0b2c60" bgColor="#fff" />
              </div>
            </div>
          )}

          {/* Business contact row */}
          {hasContact && (
            <div style={{
              borderTop: "1px dashed #e2e8f0",
              padding: "10px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}>
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
          <div style={{
            background: "#0b2c60",
            padding: "10px 20px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
              Thank you for choosing SAHU CSC
            </p>
            <p style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>
              Computer generated receipt · No signature required
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ padding: "10px 14px", background: "#fff", display: "flex", gap: 8 }}>
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={handlePrint}>
            <Printer size={13} />Print
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={handleDownloadPdf} disabled={generatingPdf}>
            <Download size={13} />
            {generatingPdf ? "Generating…" : "PDF"}
          </Button>
          <Button size="sm" className="flex-1 gap-1.5 text-xs" style={{ background: "#0b2c60" }} onClick={handleShare}>
            <Share2 size={13} />Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
