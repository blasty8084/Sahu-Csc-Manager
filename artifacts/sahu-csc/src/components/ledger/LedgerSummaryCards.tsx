import { Eye, ArrowUpRight, ArrowDownLeft, FileText } from "lucide-react";

interface LedgerSummaryCardsProps {
  balance: any;
  isLoading: boolean;
  data: any;
  t: (key: string) => string;
}

export function LedgerSummaryCards({ balance, isLoading, data, t }: LedgerSummaryCardsProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, flexShrink: 0 }}>
      {/* Current Balance */}
      <div style={{ background: "linear-gradient(135deg,#0b2c60,#1e3a8a)", borderRadius: 20, padding: "18px 20px", position: "relative", overflow: "hidden", boxShadow: "0 4px 20px rgba(11,44,96,0.22)" }}>
        <div style={{ position: "absolute", right: -16, top: -16, width: 110, height: 110, background: "rgba(255,255,255,0.10)", borderRadius: "50%", filter: "blur(20px)", pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, position: "relative", zIndex: 1 }}>
          <span style={{ color: "rgba(255,255,255,0.70)", fontSize: 13, fontWeight: 500 }}>{t("ledger.current_balance")}</span>
          <button style={{ background: "rgba(255,255,255,0.10)", borderRadius: 8, padding: 6, border: "none", cursor: "pointer" }}><Eye size={13} color="rgba(255,255,255,0.90)" /></button>
        </div>
        {balance === undefined
          ? <div style={{ height: 34, background: "rgba(255,255,255,0.08)", borderRadius: 8, marginBottom: 14, width: "65%" }} />
          : <p style={{ fontSize: 26, fontWeight: 900, color: "white", marginBottom: 14, lineHeight: 1, position: "relative", zIndex: 1 }}>₹{(balance?.balance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>}
        <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative", zIndex: 1 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px rgba(52,211,153,0.8)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", fontWeight: 500 }}>Last updated: Just now</span>
        </div>
      </div>

      {/* Total Credits */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>{t("ledger.credits")}</span>
          <div style={{ background: "#d1fae5", border: "1px solid #a7f3d0", borderRadius: 12, padding: 8 }}><ArrowUpRight size={15} color="#059669" strokeWidth={2.5} /></div>
        </div>
        {balance === undefined
          ? <div style={{ height: 32, background: "#f1f5f9", borderRadius: 8, marginBottom: 14, width: "65%" }} />
          : <p style={{ fontSize: 24, fontWeight: 900, color: "#059669", marginBottom: 14, lineHeight: 1 }}>₹{(balance?.totalCredits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fb923c" }} />
          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>This month</span>
        </div>
      </div>

      {/* Total Debits */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>{t("ledger.debits")}</span>
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 12, padding: 8 }}><ArrowDownLeft size={15} color="#ef4444" strokeWidth={2.5} /></div>
        </div>
        {balance === undefined
          ? <div style={{ height: 32, background: "#f1f5f9", borderRadius: 8, marginBottom: 14, width: "65%" }} />
          : <p style={{ fontSize: 24, fontWeight: 900, color: "#ef4444", marginBottom: 14, lineHeight: 1 }}>₹{(balance?.totalDebits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fb923c" }} />
          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>This month</span>
        </div>
      </div>

      {/* Total Transactions */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>Total Transactions</span>
          <div style={{ background: "#dbeafe", border: "1px solid #93c5fd", borderRadius: 12, padding: 8 }}><FileText size={15} color="#2563eb" strokeWidth={2.5} /></div>
        </div>
        {isLoading
          ? <div style={{ height: 32, background: "#f1f5f9", borderRadius: 8, marginBottom: 14, width: "40%" }} />
          : <p style={{ fontSize: 24, fontWeight: 900, color: "#2563eb", marginBottom: 14, lineHeight: 1 }}>{data?.total ?? 0}</p>}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fb923c" }} />
          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>All time</span>
        </div>
      </div>
    </div>
  );
}
