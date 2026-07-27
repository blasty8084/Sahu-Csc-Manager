import { useRef } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { UdhariReceiptCard } from "@/components/receipts/UdhariReceiptCard";
import { UdhariReceiptActions } from "@/components/receipts/UdhariReceiptActions";

function fetchUdhariReceipt(token: string) {
  return fetch(`/api/receipts/verify/udhari/${token}`).then(async (r) => {
    if (!r.ok) throw new Error((await r.json()).error ?? "Receipt not found");
    return r.json();
  });
}

export default function UdhariReceiptVerify() {
  const { token } = useParams<{ token: string }>();
  const printRef = useRef<HTMLDivElement>(null);

  const { data: receipt, isLoading, isError, error } = useQuery({
    queryKey: ["udhari-receipt-verify", token],
    queryFn: () => fetchUdhariReceipt(token!),
    enabled: !!token,
    retry: false,
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-slate-50)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid var(--brand-navy-800)", borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "var(--color-slate-500)", fontFamily: "sans-serif" }}>Loading receipt…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isError || !receipt) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-slate-50)", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 340 }}>
          <AlertCircle size={40} color="var(--color-error)" style={{ margin: "0 auto 12px" }} />
          <h2 style={{ fontFamily: "sans-serif", fontWeight: 800, color: "var(--brand-navy-800)", marginBottom: 8 }}>Receipt Not Found</h2>
          <p style={{ fontFamily: "sans-serif", color: "var(--color-slate-500)", fontSize: 14 }}>
            {(error as Error)?.message ?? "This receipt link is invalid or has expired."}
          </p>
        </div>
      </div>
    );
  }

  const pageUrl = window.location.href;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-slate-100)", paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "0 16px" }}>

        {/* Verified badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          <CheckCircle2 size={18} color="var(--color-success)" />
          <span style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 700, color: "var(--color-success)", letterSpacing: "0.04em" }}>
            AUTHENTIC UDHARI KHATA RECEIPT
          </span>
        </div>

        <UdhariReceiptCard cardRef={printRef} receipt={receipt} pageUrl={pageUrl} />
        <UdhariReceiptActions cardRef={printRef} receipt={receipt} pageUrl={pageUrl} />

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "var(--color-slate-400)", fontFamily: "sans-serif" }}>
          Powered by SAHU CSC · sahucsc.in
        </p>
      </div>
    </div>
  );
}
