import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import { ReceiptVerifyBadge } from "@/components/receipts/ReceiptVerifyBadge";
import { ReceiptVerifyCard } from "@/components/receipts/ReceiptVerifyCard";
import { ReceiptQrSection } from "@/components/receipts/ReceiptQrSection";
import type { ReceiptData } from "@/components/receipts/ReceiptVerifyCard";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function ReceiptsVerify() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) { setError("Invalid link"); setLoading(false); return; }
    fetch(`${BASE}/api/receipts/verify/${encodeURIComponent(token)}`)
      .then((r) => { if (!r.ok) throw new Error("Receipt not found"); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [token]);

  const verifyUrl = typeof window !== "undefined" ? window.location.href : "";

  const bg = { minHeight: "100vh", background: "linear-gradient(135deg, #0b2c60 0%, #1a4a9e 100%)", display: "flex" as const };

  if (loading) return (
    <div style={{ ...bg, alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.2)", borderTopColor: "#f97316", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Verifying receipt…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (error || !data) return (
    <div style={{ ...bg, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, textAlign: "center", maxWidth: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0b2c60", marginBottom: 8 }}>Receipt Not Found</h2>
        <p style={{ fontSize: 13, color: "#64748b" }}>This receipt link is invalid or the entry has been deleted.</p>
      </div>
    </div>
  );

  const isCredit = data.credit > 0;
  const amount = isCredit ? data.credit : data.debit;
  const amountColor = isCredit ? "#059669" : "#e11d48";
  const amountPrefix = isCredit ? "+" : "-";
  const txType = isCredit ? "Credit" : "Debit";
  const formattedDate = new Date(data.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const issuedAt = new Date(data.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const hasContact = !!(data.businessAddress || data.businessMobile || data.businessWebsite);

  return (
    <div style={{ ...bg, flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "28px 16px 48px" }}>
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

      <ReceiptVerifyBadge verified={data.verified ?? false} />

      <div id="receipt-wrapper" style={{ width: "100%", maxWidth: 420 }}>
        <ReceiptVerifyCard
          data={data} verifyUrl={verifyUrl} cardRef={cardRef}
          formattedDate={formattedDate} issuedAt={issuedAt} hasContact={hasContact}
          amountColor={amountColor} amountPrefix={amountPrefix} txType={txType} amount={amount}
        />
        <ReceiptQrSection
          data={data} verifyUrl={verifyUrl} cardRef={cardRef}
          txType={txType} amount={amount} formattedDate={formattedDate}
        />
      </div>
    </div>
  );
}
