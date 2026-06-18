import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import QRCode from "react-qr-code";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface ReceiptData {
  receiptNumber: string;
  date: string;
  customerName: string;
  serviceType: string;
  credit: number;
  debit: number;
  description: string;
  createdByName: string | null;
  createdAt: string;
  businessName: string;
}

export default function ReceiptsVerify() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setError("Invalid link"); setLoading(false); return; }
    fetch(`${BASE}/api/receipts/verify/${encodeURIComponent(token)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Receipt not found");
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [token]);

  const verifyUrl = typeof window !== "undefined" ? window.location.href : "";
  const amount = data ? (data.credit > 0 ? data.credit : data.debit) : 0;
  const txType = data?.credit > 0 ? "Credit" : "Debit";
  const amountColor = data?.credit > 0 ? "#059669" : "#e11d48";
  const amountPrefix = data?.credit > 0 ? "+" : "-";

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#0b2c60", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14 }}>Verifying receipt…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 32, textAlign: "center", maxWidth: 360, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0b2c60", marginBottom: 8 }}>Receipt Not Found</h2>
          <p style={{ fontSize: 14, color: "#64748b" }}>This receipt link is invalid or the entry has been deleted.</p>
        </div>
      </div>
    );
  }

  const txDate = new Date(data.date);
  const formattedDate = txDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const issuedAt = new Date(data.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0b2c60 0%, #1a4a9e 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .receipt-card { box-shadow: none !important; max-width: 100% !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Header badge */}
        <div className="no-print" style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "6px 14px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em" }}>VERIFIED RECEIPT</span>
          </div>
        </div>

        {/* Receipt card */}
        <div className="receipt-card" style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
          {/* Navy header */}
          <div style={{ background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", padding: "24px 28px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(249,115,22,0.15)" }} />
            <div style={{ position: "absolute", bottom: -30, left: 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
              <div>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                  {data.businessName}
                </p>
                <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 2 }}>
                  SAHU <span style={{ color: "#f97316" }}>CSC</span>
                </h1>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 10 }}>Common Service Center</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Receipt No.</p>
                <p style={{ color: "#f97316", fontSize: 13, fontWeight: 800, fontFamily: "monospace", letterSpacing: "0.04em" }}>{data.receiptNumber}</p>
              </div>
            </div>
          </div>

          {/* Orange accent stripe */}
          <div style={{ height: 3, background: "linear-gradient(90deg, #f97316, #fb923c, #0b2c60)" }} />

          {/* Body */}
          <div style={{ padding: "24px 28px" }}>
            {/* Amount highlight */}
            <div style={{ background: `${amountColor}10`, border: `1px solid ${amountColor}30`, borderRadius: 12, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>{txType} Amount</p>
                <p style={{ fontSize: 26, fontWeight: 900, color: amountColor }}>
                  {amountPrefix}₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div style={{ background: `${amountColor}15`, borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: amountColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</p>
                <p style={{ fontSize: 11, fontWeight: 800, color: amountColor }}>Completed</p>
              </div>
            </div>

            {/* Details rows */}
            {[
              { label: "Customer Name", value: data.customerName },
              { label: "Service Type", value: data.serviceType },
              { label: "Transaction Date", value: formattedDate },
              { label: "Issued At", value: issuedAt },
              ...(data.createdByName ? [{ label: "Processed By", value: data.createdByName }] : []),
              ...(data.description ? [{ label: "Description", value: data.description }] : []),
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, flexShrink: 0, marginRight: 12 }}>{row.label}</p>
                <p style={{ fontSize: 12, color: "#0b2c60", fontWeight: 600, textAlign: "right", wordBreak: "break-word" }}>{row.value}</p>
              </div>
            ))}

            {/* QR Code */}
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ background: "#fff", padding: 12, borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "inline-block" }}>
                <QRCode value={verifyUrl} size={100} fgColor="#0b2c60" bgColor="#fff" />
              </div>
              <p style={{ fontSize: 9, color: "#94a3b8", textAlign: "center", letterSpacing: "0.04em" }}>
                Scan to verify this receipt online
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "14px 28px", textAlign: "center" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#0b2c60", marginBottom: 2 }}>Thank you for choosing SAHU CSC</p>
            <p style={{ fontSize: 9, color: "#94a3b8" }}>This is a computer-generated receipt and does not require a physical signature.</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "center" }}>
          <button
            onClick={() => window.print()}
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            🖨️ Print
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: `Receipt ${data.receiptNumber}`, url: verifyUrl }).catch(() => {});
              } else {
                navigator.clipboard.writeText(verifyUrl);
              }
            }}
            style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            📤 Share
          </button>
        </div>
      </div>
    </div>
  );
}
