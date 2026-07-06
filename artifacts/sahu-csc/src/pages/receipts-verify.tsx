import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import QRCode from "react-qr-code";
import { CheckCircle2, MapPin, Phone, Globe, Download, Share2, Printer, ShieldCheck, ShieldAlert } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const WhatsAppIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface ReceiptData {
  receiptNumber: string;
  date: string;
  customerName: string;
  serviceType: string;
  credit: number;
  debit: number;
  description: string | null;
  createdByName: string | null;
  createdAt: string;
  businessName: string;
  businessAddress: string;
  businessMobile: string;
  businessWebsite: string;
  verified?: boolean;
}

export default function ReceiptsVerify() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sendingWa, setSendingWa] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) { setError("Invalid link"); setLoading(false); return; }
    fetch(`${BASE}/api/receipts/verify/${encodeURIComponent(token)}`)
      .then((r) => { if (!r.ok) throw new Error("Receipt not found"); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [token]);

  const verifyUrl = typeof window !== "undefined" ? window.location.href : "";

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0b2c60 0%, #1a4a9e 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.2)", borderTopColor: "#f97316", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Verifying receipt…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0b2c60 0%, #1a4a9e 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 32, textAlign: "center", maxWidth: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0b2c60", marginBottom: 8 }}>Receipt Not Found</h2>
          <p style={{ fontSize: 13, color: "#64748b" }}>This receipt link is invalid or the entry has been deleted.</p>
        </div>
      </div>
    );
  }

  const isCredit = data.credit > 0;
  const amount = isCredit ? data.credit : data.debit;
  const amountColor = isCredit ? "#059669" : "#e11d48";
  const amountPrefix = isCredit ? "+" : "-";
  const txType = isCredit ? "Credit" : "Debit";

  const formattedDate = new Date(data.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const issuedAt = new Date(data.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const hasContact = data.businessAddress || data.businessMobile || data.businessWebsite;

  const generatePdfBlob = async (): Promise<Blob | null> => {
    const el = cardRef.current;
    if (!el) return null;
    // Fix capture width to 794px (A4 at 96dpi) so PDF fills the full page.
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
      a.href = url;
      a.download = `${data.receiptNumber}.pdf`;
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
        const file = new File([blob], `${data.receiptNumber}.pdf`, { type: "application/pdf" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Receipt ${data.receiptNumber} — SAHU CSC`,
            text: `Transaction receipt for ${data.customerName}`,
          });
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
        const waText = `🧾 Receipt ${data.receiptNumber} — SAHU CSC\n\n📎 ${verifyUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, "_blank");
      }
    } finally {
      setSendingWa(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `Receipt ${data.receiptNumber} — SAHU CSC`, url: verifyUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(verifyUrl);
    }
  };

  const btnBase: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    border: "none", borderRadius: 10, padding: "10px 0",
    fontSize: 12, fontWeight: 600, cursor: "pointer", width: "100%",
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0b2c60 0%, #1a4a9e 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "28px 16px 48px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          #receipt-wrapper { padding: 0 !important; background: #fff !important; }
          #receipt-card { box-shadow: none !important; max-width: 100% !important; border-radius: 0 !important; }
        }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      `}</style>

      {/* Verified badge banner */}
      {data.verified ? (
        <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(34,197,94,0.18)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, padding: "6px 16px", marginBottom: 18 }}>
          <ShieldCheck size={14} color="#22c55e" strokeWidth={2.5} />
          <span style={{ color: "#4ade80", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>CRYPTOGRAPHICALLY VERIFIED</span>
        </div>
      ) : (
        <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.35)", borderRadius: 20, padding: "6px 16px", marginBottom: 18 }}>
          <ShieldAlert size={14} color="#fbbf24" strokeWidth={2.5} />
          <span style={{ color: "#fbbf24", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>LEGACY RECEIPT</span>
        </div>
      )}

      <div id="receipt-wrapper" style={{ width: "100%", maxWidth: 420 }}>
        {/* Receipt card */}
        <div id="receipt-card" style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.28)" }}>
          <div id="receipt-card-inner" ref={cardRef}>
            {/* Navy header */}
            <div style={{ background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", padding: "20px 24px 18px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -18, right: -18, width: 90, height: 90, borderRadius: "50%", background: "rgba(249,115,22,0.18)" }} />
              <div style={{ position: "absolute", bottom: -26, left: 36, width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, position: "relative" }}>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  {data.businessName}
                </p>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" }}>
                  Receipt No.
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative" }}>
                <div>
                  <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 900, letterSpacing: "-0.01em", lineHeight: 1 }}>
                    SAHU <span style={{ color: "#f97316" }}>CSC</span>
                  </h1>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, marginTop: 4 }}>Common Service Center</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: "#f97316", fontSize: 15, fontWeight: 900, fontFamily: "monospace", letterSpacing: "0.03em" }}>
                    {data.receiptNumber}
                  </p>
                  {data.verified ? (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      background: "rgba(34,197,94,0.18)", border: "1px solid rgba(34,197,94,0.4)",
                      borderRadius: 20, padding: "3px 9px", marginTop: 6,
                    }}>
                      <ShieldCheck size={10} color="#22c55e" strokeWidth={2.5} />
                      <span style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", letterSpacing: "0.07em" }}>VERIFIED</span>
                    </div>
                  ) : (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      background: "rgba(251,191,36,0.18)", border: "1px solid rgba(251,191,36,0.4)",
                      borderRadius: 20, padding: "3px 9px", marginTop: 6,
                    }}>
                      <ShieldAlert size={10} color="#fbbf24" strokeWidth={2.5} />
                      <span style={{ fontSize: 9, fontWeight: 700, color: "#fbbf24", letterSpacing: "0.07em" }}>LEGACY</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Accent stripe */}
            <div style={{ height: 3, background: "linear-gradient(90deg, #f97316, #fb923c 60%, #0b2c60)" }} />

            {/* Amount block */}
            <div style={{ padding: "16px 24px 0" }}>
              <div style={{
                background: `${amountColor}0f`,
                border: `1px solid ${amountColor}2a`,
                borderRadius: 14,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>
                    {txType} Amount
                  </p>
                  <p style={{ fontSize: 28, fontWeight: 900, color: amountColor, lineHeight: 1 }}>
                    {amountPrefix}₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: `${amountColor}18`,
                  border: `2px solid ${amountColor}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <CheckCircle2 size={20} color={amountColor} strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Detail rows */}
            <div style={{ padding: "12px 24px" }}>
              {[
                { label: "Customer", value: data.customerName },
                { label: "Service", value: data.serviceType },
                { label: "Date", value: formattedDate },
                { label: "Issued At", value: issuedAt },
                ...(data.createdByName ? [{ label: "Operator", value: data.createdByName }] : []),
                ...(data.description ? [{ label: "Note", value: data.description }] : []),
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "7px 0",
                    borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none",
                    gap: 12,
                  }}
                >
                  <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, flexShrink: 0 }}>{row.label}</p>
                  <p style={{ fontSize: 12, color: "#0b2c60", fontWeight: 700, textAlign: "right", wordBreak: "break-word", maxWidth: "62%" }}>{row.value}</p>
                </div>
              ))}
            </div>

            {/* QR code section */}
            <div style={{ padding: "0 24px 16px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div style={{ flex: 1, paddingRight: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#0b2c60", marginBottom: 4 }}>Scan to open & download</p>
                <p style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.6 }}>
                  Share this QR code with your customer. Scanning opens this receipt for PDF download.
                </p>
              </div>
              <div style={{
                background: "#fff",
                padding: 10,
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
                flexShrink: 0,
              }}>
                <QRCode value={verifyUrl} size={88} fgColor="#0b2c60" bgColor="#fff" />
              </div>
            </div>

            {/* Business contact */}
            {hasContact && (
              <div style={{ borderTop: "1px dashed #e2e8f0", padding: "10px 24px", display: "flex", flexDirection: "column", gap: 5 }}>
                {data.businessAddress && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                    <MapPin size={10} color="#94a3b8" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 10, color: "#64748b" }}>{data.businessAddress}</p>
                  </div>
                )}
                {data.businessMobile && (
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Phone size={10} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: 10, color: "#64748b" }}>+91 {data.businessMobile.replace(/^(\+91|91)/, "").trim()}</p>
                  </div>
                )}
                {data.businessWebsite && (
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Globe size={10} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: 10, color: "#64748b" }}>{data.businessWebsite}</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div style={{ background: "#0b2c60", padding: "12px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
                Thank you for choosing SAHU CSC
              </p>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>
                Computer generated receipt · No signature required
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons — 2×2 grid */}
        <div className="no-print" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
          <button onClick={handlePrint} style={{ ...btnBase, background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}>
            <Printer size={14} /> Print
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={generatingPdf}
            style={{ ...btnBase, background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", opacity: generatingPdf ? 0.7 : 1, cursor: generatingPdf ? "not-allowed" : "pointer" }}
          >
            <Download size={14} /> {generatingPdf ? "Saving…" : "Download PDF"}
          </button>
          <button
            onClick={handleWhatsApp}
            disabled={sendingWa}
            style={{ ...btnBase, background: "#25D366", color: "#fff", opacity: sendingWa ? 0.7 : 1, cursor: sendingWa ? "not-allowed" : "pointer" }}
          >
            <WhatsAppIcon size={14} /> {sendingWa ? "Preparing…" : "WhatsApp PDF"}
          </button>
          <button
            onClick={handleShare}
            style={{ ...btnBase, background: "#f97316", color: "#fff" }}
          >
            <Share2 size={14} /> Share Link
          </button>
        </div>
      </div>
    </div>
  );
}
