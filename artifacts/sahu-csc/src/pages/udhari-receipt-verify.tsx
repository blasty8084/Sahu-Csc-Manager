import { useRef, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import {
  Download, Printer, Share2, BookOpen, MapPin, Phone, Globe, AlertCircle, CheckCircle2,
  ArrowUpRight, ArrowDownLeft,
} from "lucide-react";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function fetchUdhariReceipt(token: string) {
  return fetch(`/api/receipts/verify/udhari/${token}`).then(async (r) => {
    if (!r.ok) throw new Error((await r.json()).error ?? "Receipt not found");
    return r.json();
  });
}

export default function UdhariReceiptVerify() {
  const { token } = useParams<{ token: string }>();
  const printRef = useRef<HTMLDivElement>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sendingWa, setSendingWa] = useState(false);

  const { data: receipt, isLoading, isError, error } = useQuery({
    queryKey: ["udhari-receipt-verify", token],
    queryFn: () => fetchUdhariReceipt(token!),
    enabled: !!token,
    retry: false,
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #0b2c60", borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "#64748b", fontFamily: "sans-serif" }}>Loading receipt…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isError || !receipt) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 340 }}>
          <AlertCircle size={40} color="#e11d48" style={{ margin: "0 auto 12px" }} />
          <h2 style={{ fontFamily: "sans-serif", fontWeight: 800, color: "#0b2c60", marginBottom: 8 }}>Receipt Not Found</h2>
          <p style={{ fontFamily: "sans-serif", color: "#64748b", fontSize: 14 }}>
            {(error as Error)?.message ?? "This receipt link is invalid or has expired."}
          </p>
        </div>
      </div>
    );
  }

  const {
    receiptNumber, date, type, amount, note, customerName, customerMobile, customerAddress,
    currentBalance, createdAt, businessName, businessAddress, businessMobile, businessWebsite,
  } = receipt;

  const isGave = type === "gave";
  const accentColor = isGave ? "#ea580c" : "#059669";
  const headerGrad = isGave ? "linear-gradient(135deg,#7c2d12,#ea580c)" : "linear-gradient(135deg,#064e3b,#059669)";
  const stripeGrad = isGave ? "linear-gradient(90deg,#ea580c,#f97316 60%,#0b2c60)" : "linear-gradient(90deg,#059669,#10b981 60%,#0b2c60)";
  const txLabel = isGave ? "You Gave" : "You Got";
  const amountPrefix = isGave ? "+" : "−";

  const balanceColor = currentBalance > 0 ? "#ea580c" : currentBalance < 0 ? "#059669" : "#64748b";
  const balanceLabel = currentBalance > 0 ? "To Collect" : currentBalance < 0 ? "To Pay" : "Settled";

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const issuedAt = new Date(createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const hasContact = businessAddress || businessMobile || businessWebsite;
  const pageUrl = window.location.href;

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
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Udhari Receipt ${receiptNumber}</title>
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
          await navigator.share({ files: [file], title: `Udhari Receipt ${receiptNumber}`, text: `${txLabel} ₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} — ${customerName}` });
          return;
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") { return; }
    } finally {
      setSendingWa(false);
    }
    const mobile = customerMobile?.replace(/\D/g, "") ?? "";
    const num = mobile.length >= 10 ? (mobile.startsWith("91") ? mobile : `91${mobile}`) : "";
    const waText = [
      `📒 *Udhari Khata Receipt — ${txLabel}*`,
      `Receipt No: ${receiptNumber}`,
      `Customer: ${customerName}`,
      ...(customerMobile ? [`📞 ${customerMobile}`] : []),
      `Amount: ₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      `Balance: ${balanceLabel} ₹${Math.abs(currentBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      `Date: ${formattedDate}`,
      ...(note ? [`Note: ${note}`] : []),
      `\n📎 View & download PDF:\n${pageUrl}`,
      `\n— ${businessName}`,
      ...(businessMobile ? [`📞 ${businessMobile}`] : []),
    ].join("\n");
    const waBase = num ? `https://wa.me/${num}` : "https://wa.me/";
    window.open(`${waBase}?text=${encodeURIComponent(waText)}`, "_blank");
    setSendingWa(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `Udhari Receipt ${receiptNumber}`, url: pageUrl }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(pageUrl);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "0 16px" }}>

        {/* Verified badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          <CheckCircle2 size={18} color="#059669" />
          <span style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 700, color: "#059669", letterSpacing: "0.04em" }}>
            AUTHENTIC UDHARI KHATA RECEIPT
          </span>
        </div>

        {/* Receipt card */}
        <div ref={printRef} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 32px rgba(11,44,96,0.12)" }}>

          {/* Header */}
          <div style={{ background: headerGrad, padding: "22px 24px 18px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                {businessName}
              </p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" }}>
                Udhari Khata
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isGave ? <ArrowUpRight size={20} color="#fff" /> : <ArrowDownLeft size={20} color="#fff" />}
                </div>
                <div>
                  <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 900, lineHeight: 1 }}>
                    {txLabel} <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.7 }}>Receipt</span>
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, marginTop: 3 }}>Customer Credit Ledger</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 900, fontFamily: "monospace" }}>{receiptNumber}</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 5, background: "rgba(34,197,94,0.20)", border: "1px solid rgba(34,197,94,0.35)", borderRadius: 20, padding: "3px 10px" }}>
                  <CheckCircle2 size={10} color="#22c55e" />
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#22c55e" }}>VERIFIED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stripe */}
          <div style={{ height: 4, background: stripeGrad }} />

          {/* Amount */}
          <div style={{ padding: "18px 24px 0" }}>
            <div style={{ background: `${accentColor}0f`, border: `1px solid ${accentColor}25`, borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 2 }}>{txLabel} Amount</p>
                <p style={{ fontSize: 28, fontWeight: 900, color: accentColor, lineHeight: 1 }}>
                  {amountPrefix}₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${accentColor}18`, border: `2px solid ${accentColor}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BookOpen size={20} color={accentColor} strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Balance chip */}
          <div style={{ padding: "8px 24px 0", display: "flex", justifyContent: "flex-end" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${balanceColor}10`, border: `1px solid ${balanceColor}25`, borderRadius: 20, padding: "4px 12px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: balanceColor }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: balanceColor }}>
                {balanceLabel}: ₹{Math.abs(currentBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Detail rows */}
          <div style={{ padding: "12px 24px" }}>
            {[
              { label: "Customer", value: customerName },
              ...(customerMobile ? [{ label: "Mobile", value: customerMobile }] : []),
              ...(customerAddress ? [{ label: "Address", value: customerAddress }] : []),
              { label: "Transaction", value: txLabel },
              { label: "Date", value: formattedDate },
              { label: "Issued At", value: issuedAt },
              ...(note ? [{ label: "Note", value: note }] : []),
            ].map((row, i, arr) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none", gap: 12 }}>
                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, flexShrink: 0 }}>{row.label}</p>
                <p style={{ fontSize: 12, color: "#0b2c60", fontWeight: 700, textAlign: "right", wordBreak: "break-word" }}>{row.value}</p>
              </div>
            ))}
          </div>

          {/* QR */}
          <div style={{ padding: "0 24px 16px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ flex: 1, paddingRight: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#0b2c60", marginBottom: 4 }}>Scan to download PDF</p>
              <p style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.6 }}>
                Scan this QR code to open and download this receipt as a PDF.
              </p>
            </div>
            <div style={{ background: "#fff", padding: 10, borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flexShrink: 0 }}>
              <QRCode value={pageUrl} size={80} fgColor="#0b2c60" bgColor="#fff" />
            </div>
          </div>

          {/* Business contact */}
          {hasContact && (
            <div style={{ borderTop: "1px dashed #e2e8f0", padding: "12px 24px", display: "flex", flexDirection: "column", gap: 5 }}>
              {businessAddress && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                  <MapPin size={10} color="#94a3b8" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 10, color: "#64748b" }}>{businessAddress}</p>
                </div>
              )}
              {businessMobile && (
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Phone size={10} color="#94a3b8" />
                  <p style={{ fontSize: 10, color: "#64748b" }}>+91 {businessMobile.replace(/^(\+91|91)/, "").trim()}</p>
                </div>
              )}
              {businessWebsite && (
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Globe size={10} color="#94a3b8" />
                  <p style={{ fontSize: 10, color: "#64748b" }}>{businessWebsite}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ background: "#0b2c60", padding: "12px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Thank you for choosing SAHU CSC</p>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>Udhari Khata receipt · Customer credit ledger</p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer size={15} />Print
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleDownloadPdf} disabled={generatingPdf}>
            <Download size={15} />
            {generatingPdf ? "Generating…" : "Download PDF"}
          </Button>
          <Button className="gap-2" style={{ background: "#25D366", color: "#fff" }} onClick={handleWhatsApp} disabled={sendingWa}>
            <WhatsAppIcon />{sendingWa ? "Preparing…" : "Share via WhatsApp"}
          </Button>
          <Button className="gap-2" style={{ background: "#0b2c60" }} onClick={handleShare}>
            <Share2 size={15} />Share Link
          </Button>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#94a3b8", fontFamily: "sans-serif" }}>
          Powered by SAHU CSC · sahucsc.in
        </p>
      </div>
    </div>
  );
}
