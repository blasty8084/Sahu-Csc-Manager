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
      <div style={{ background: "linear-gradient(135deg,var(--brand-navy-800),#1e3a8a)", borderRadius: 20, padding: "18px 20px", position: "relative", overflow: "hidden", boxShadow: "0 4px 20px var(--brand-navy-shadow-sm)" }}>
        <div style={{ position: "absolute", right: -16, top: -16, width: 110, height: 110, background: "var(--brand-white-low)", borderRadius: "50%", filter: "blur(20px)", pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, position: "relative", zIndex: 1 }}>
          <span style={{ color: "rgba(255,255,255,0.70)", fontSize: 13, fontWeight: 500 }}>{t("ledger.current_balance")}</span>
          <button style={{ background: "var(--brand-white-low)", borderRadius: 8, padding: 6, border: "none", cursor: "pointer" }}><Eye size={13} color="rgba(255,255,255,0.90)" /></button>
        </div>
        {balance === undefined
          ? <div style={{ height: 34, background: "var(--brand-white-low)", borderRadius: 8, marginBottom: 14, width: "65%" }} />
          : <p style={{ fontSize: 26, fontWeight: 900, color: "white", marginBottom: 14, lineHeight: 1, position: "relative", zIndex: 1 }}>₹{(balance?.balance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>}
        <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative", zIndex: 1 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-success-glow)", boxShadow: "0 0 8px rgba(52,211,153,0.8)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", fontWeight: 500 }}>Last updated: Just now</span>
        </div>
      </div>

      {/* Total Credits */}
      <div style={{ background: "white", border: "1px solid var(--color-slate-200)", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{ color: "var(--color-slate-500)", fontSize: 13, fontWeight: 600 }}>{t("ledger.credits")}</span>
          <div style={{ background: "var(--color-success-bg-light)", border: "1px solid var(--color-success-glow)", borderRadius: 12, padding: 8 }}><ArrowUpRight size={15} color="var(--color-success)" strokeWidth={2.5} /></div>
        </div>
        {balance === undefined
          ? <div style={{ height: 32, background: "var(--color-slate-100)", borderRadius: 8, marginBottom: 14, width: "65%" }} />
          : <p style={{ fontSize: 24, fontWeight: 900, color: "var(--color-success)", marginBottom: 14, lineHeight: 1 }}>₹{(balance?.totalCredits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand-orange-400)" }} />
          <span style={{ fontSize: 11, color: "var(--color-slate-400)", fontWeight: 500 }}>This month</span>
        </div>
      </div>

      {/* Total Debits */}
      <div style={{ background: "white", border: "1px solid var(--color-slate-200)", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{ color: "var(--color-slate-500)", fontSize: 13, fontWeight: 600 }}>{t("ledger.debits")}</span>
          <div style={{ background: "var(--color-error-bg)", border: "1px solid var(--color-rose-300)", borderRadius: 12, padding: 8 }}><ArrowDownLeft size={15} color="var(--color-error-std)" strokeWidth={2.5} /></div>
        </div>
        {balance === undefined
          ? <div style={{ height: 32, background: "var(--color-slate-100)", borderRadius: 8, marginBottom: 14, width: "65%" }} />
          : <p style={{ fontSize: 24, fontWeight: 900, color: "var(--color-error-std)", marginBottom: 14, lineHeight: 1 }}>₹{(balance?.totalDebits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand-orange-400)" }} />
          <span style={{ fontSize: 11, color: "var(--color-slate-400)", fontWeight: 500 }}>This month</span>
        </div>
      </div>

      {/* Total Transactions */}
      <div style={{ background: "white", border: "1px solid var(--color-slate-200)", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{ color: "var(--color-slate-500)", fontSize: 13, fontWeight: 600 }}>Total Transactions</span>
          <div style={{ background: "var(--surface-blue-tint)", border: "1px solid #93c5fd", borderRadius: 12, padding: 8 }}><FileText size={15} color="var(--color-blue-600)" strokeWidth={2.5} /></div>
        </div>
        {isLoading
          ? <div style={{ height: 32, background: "var(--color-slate-100)", borderRadius: 8, marginBottom: 14, width: "40%" }} />
          : <p style={{ fontSize: 24, fontWeight: 900, color: "var(--color-blue-600)", marginBottom: 14, lineHeight: 1 }}>{data?.total ?? 0}</p>}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand-orange-400)" }} />
          <span style={{ fontSize: 11, color: "var(--color-slate-400)", fontWeight: 500 }}>All time</span>
        </div>
      </div>
    </div>
  );
}
