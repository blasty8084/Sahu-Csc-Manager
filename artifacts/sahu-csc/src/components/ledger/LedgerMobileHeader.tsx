import { Download, Trash2, FileText, Receipt } from "lucide-react";

interface LedgerMobileHeaderProps {
  balance: any;
  t: (key: string) => string;
  activeTab: "transactions" | "receipts";
  setActiveTab: (v: "transactions" | "receipts") => void;
  onDeleteAll: () => void;
}

export function LedgerMobileHeader({ balance, t, activeTab, setActiveTab, onDeleteAll }: LedgerMobileHeaderProps) {
  return (
    <>
      {/* ── MOBILE: Navy gradient hero header ── */}
      <div className="md:hidden rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg,#0b2c60 0%,#1a4a9e 100%)", padding: "20px 20px 24px", position: "relative" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(249,115,22,0.12)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -20, left: 20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, position: "relative" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>{t("ledger.title")}</p>
            <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 900, lineHeight: 1.1, marginTop: 2 }}>{t("ledger.subtitle")}</h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <a href="/api/reports/export" target="_blank" style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              <Download size={15} color="#fff" />
            </a>
            <button onClick={onDeleteAll} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(249,115,22,0.18)", border: "1px solid rgba(249,115,22,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", outline: "none" }}>
              <Trash2 size={15} color="#f97316" />
            </button>
          </div>
        </div>
        {/* Balance card */}
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.12)", position: "relative" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{t("ledger.current_balance")}</p>
          {balance === undefined
            ? <div style={{ height: 30, background: "rgba(255,255,255,0.1)", borderRadius: 8, marginBottom: 12, width: "55%" }} />
            : <p style={{ color: "#fff", fontSize: 26, fontWeight: 900, lineHeight: 1, marginBottom: 12 }}>₹{(balance?.balance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ background: "rgba(16,185,129,0.15)", borderRadius: 10, padding: "8px 10px", border: "1px solid rgba(16,185,129,0.25)" }}>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t("ledger.credits")}</p>
              {balance === undefined
                ? <div style={{ height: 16, background: "rgba(255,255,255,0.12)", borderRadius: 4, marginTop: 4, width: "70%" }} />
                : <p style={{ color: "#34d399", fontSize: 15, fontWeight: 900, marginTop: 2 }}>+₹{(balance?.totalCredits ?? 0).toLocaleString("en-IN")}</p>}
            </div>
            <div style={{ background: "rgba(244,63,94,0.15)", borderRadius: 10, padding: "8px 10px", border: "1px solid rgba(244,63,94,0.25)" }}>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t("ledger.debits")}</p>
              {balance === undefined
                ? <div style={{ height: 16, background: "rgba(255,255,255,0.12)", borderRadius: 4, marginTop: 4, width: "70%" }} />
                : <p style={{ color: "#fb7185", fontSize: 15, fontWeight: 900, marginTop: 2 }}>−₹{(balance?.totalDebits ?? 0).toLocaleString("en-IN")}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE: Tab switcher ── */}
      <div className="md:hidden" style={{ display: "flex", background: "#f1f5f9", borderRadius: 14, padding: 4, gap: 4 }}>
        {(["transactions", "receipts"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, height: 38, borderRadius: 11, border: "none", cursor: "pointer",
              background: activeTab === tab ? "#fff" : "transparent",
              color: activeTab === tab ? "#0b2c60" : "#64748b",
              fontWeight: activeTab === tab ? 800 : 600,
              fontSize: 13,
              boxShadow: activeTab === tab ? "0 2px 8px rgba(11,44,96,0.12)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.15s",
            }}
          >
            {tab === "transactions" ? <><FileText size={13} />{t("dashboard.transactions")}</> : <><Receipt size={13} />{t("ledger.receipts_tab")}</>}
          </button>
        ))}
      </div>
    </>
  );
}
