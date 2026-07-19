import { Search, Receipt, Download } from "lucide-react";

export function MobileReceiptsList({
  activeTab, receiptSearch, setReceiptSearch, receiptEntries, setReceiptEntry, setAutoDownloadReceipt,
}: {
  activeTab: "transactions" | "receipts";
  receiptSearch: string;
  setReceiptSearch: (v: string) => void;
  receiptEntries: any[];
  setReceiptEntry: (entry: any) => void;
  setAutoDownloadReceipt: (v: boolean) => void;
}) {
  if (activeTab !== "receipts") return null;
  return (
    <div className="md:hidden space-y-3 pb-24">
      <div style={{ position: "relative" }}>
        <Search size={13} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        <input
          value={receiptSearch}
          onChange={(e) => setReceiptSearch(e.target.value)}
          placeholder="Search receipt no., customer, or service…"
          style={{ width: "100%", height: 42, paddingLeft: 34, paddingRight: 12, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 13, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 6px rgba(11,44,96,0.06)" }}
        />
      </div>
      {receiptEntries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(11,44,96,0.06)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <Receipt size={22} color="#0b2c60" opacity={0.3} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60", marginBottom: 4 }}>No receipts yet</p>
          <p style={{ fontSize: 12, color: "#94a3b8" }}>{receiptSearch ? "No receipts match your search" : "Receipts appear here after you add entries"}</p>
        </div>
      ) : receiptEntries.map((entry: any) => {
        const isCredit = entry.credit > 0;
        const amt      = isCredit ? entry.credit : entry.debit;
        const ec       = isCredit ? "#059669" : "#e11d48";
        const prefix   = isCredit ? "+" : "−";
        return (
          <div key={entry.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 8px rgba(11,44,96,0.07)", border: "1px solid #f1f5f9" }}>
            <div style={{ height: 3, background: "linear-gradient(90deg,#f97316,#0b2c60)" }} />
            <div style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: "#f97316", background: "rgba(249,115,22,0.08)", padding: "3px 9px", borderRadius: 7, border: "1px solid rgba(249,115,22,0.18)" }}>
                  {entry.receiptNumber}
                </span>
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                  {new Date(entry.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60", marginBottom: 2 }}>{entry.customerName}</p>
              <p style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>{entry.serviceType}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: 18, fontWeight: 900, color: ec }}>{prefix}₹{amt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { setReceiptEntry(entry); setAutoDownloadReceipt(false); }}
                    style={{ height: 34, paddingInline: 12, borderRadius: 10, border: "1.5px solid rgba(11,44,96,0.15)", background: "rgba(11,44,96,0.04)", color: "#0b2c60", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    <Receipt size={13} />View
                  </button>
                  <button
                    onClick={() => { setReceiptEntry(entry); setAutoDownloadReceipt(true); }}
                    style={{ height: 34, paddingInline: 12, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, boxShadow: "0 2px 10px rgba(11,44,96,0.25)" }}>
                    <Download size={13} />PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
