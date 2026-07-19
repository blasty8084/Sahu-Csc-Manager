import { useRef } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { AepsReceiptCard } from "@/components/receipts/AepsReceiptCard";
import { AepsReceiptActions } from "@/components/receipts/AepsReceiptActions";

function fetchAepsReceipt(token: string) {
  return fetch(`/api/receipts/verify/aeps/${token}`).then(async (r) => {
    if (!r.ok) throw new Error((await r.json()).error ?? "Receipt not found");
    return r.json();
  });
}

export default function AepsReceiptVerify() {
  const { token } = useParams<{ token: string }>();
  const printRef = useRef<HTMLDivElement>(null);

  const { data: receipt, isLoading, isError, error } = useQuery({
    queryKey: ["aeps-receipt-verify", token],
    queryFn: () => fetchAepsReceipt(token!),
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

  const pageUrl = window.location.href;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "0 16px" }}>

        {/* Verified badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          <CheckCircle2 size={18} color="#059669" />
          <span style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 700, color: "#059669", letterSpacing: "0.04em" }}>
            AUTHENTIC AEPS RECEIPT
          </span>
        </div>

        <AepsReceiptCard cardRef={printRef} receipt={receipt} pageUrl={pageUrl} />
        <AepsReceiptActions cardRef={printRef} receipt={receipt} pageUrl={pageUrl} />

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#94a3b8", fontFamily: "sans-serif" }}>
          Powered by SAHU CSC · sahucsc.in
        </p>
      </div>
    </div>
  );
}
