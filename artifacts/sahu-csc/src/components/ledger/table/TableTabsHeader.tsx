import { FileText, Receipt, WifiOff, Clock } from "lucide-react";

export function TableTabsHeader({
  activeTab, setActiveTab, data, page, totalPages, receiptEntries, hasFilters, isOffline, bgSyncCount,
}: {
  activeTab: "transactions" | "receipts";
  setActiveTab: (v: "transactions" | "receipts") => void;
  data: any;
  page: number;
  totalPages: number;
  receiptEntries: any[];
  hasFilters: boolean;
  isOffline: boolean;
  bgSyncCount: number;
}) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", flexShrink: 0, paddingLeft: 4 }}>
      {(["transactions", "receipts"] as const).map(tab => (
        <button key={tab} onClick={() => setActiveTab(tab)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "14px 20px", borderBottom: `2px solid ${activeTab === tab ? "#0b2c60" : "transparent"}`, color: activeTab === tab ? "#0b2c60" : "#94a3b8", fontWeight: activeTab === tab ? 700 : 600, fontSize: 13, background: "transparent", border: "none", cursor: "pointer", transition: "all 0.15s" }}>
          {tab === "transactions" ? <><FileText size={14} strokeWidth={2.5} />Transactions</> : <><Receipt size={14} strokeWidth={2.5} />Receipt History</>}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 16 }}>
        <p style={{ fontSize: 11, color: "#94a3b8" }}>
          {activeTab === "transactions"
            ? `${data?.total ?? 0} entries · Page ${page} of ${Math.max(totalPages, 1)}`
            : `${receiptEntries.length} receipt${receiptEntries.length !== 1 ? "s" : ""}`}
        </p>
        {hasFilters && <span style={{ fontSize: 10, fontWeight: 700, color: "#f97316", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 20, padding: "3px 10px" }}>Filtered</span>}
        {isOffline && <span style={{ fontSize: 10, fontWeight: 700, color: "#d97706", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: 20, padding: "3px 8px", display: "flex", alignItems: "center", gap: 3 }}><WifiOff size={9} />Offline</span>}
        {bgSyncCount > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 20, padding: "3px 8px", display: "flex", alignItems: "center", gap: 3 }}><Clock size={9} />{bgSyncCount} retrying</span>}
      </div>
    </div>
  );
}
