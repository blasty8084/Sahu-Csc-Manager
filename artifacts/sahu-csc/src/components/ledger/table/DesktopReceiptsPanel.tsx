import { Search, Receipt, Download } from "lucide-react";

export function DesktopReceiptsPanel({
  activeTab, receiptSearch, setReceiptSearch, receiptEntries, getServiceColor, setReceiptEntry, setAutoDownloadReceipt,
}: {
  activeTab: "transactions" | "receipts";
  receiptSearch: string;
  setReceiptSearch: (v: string) => void;
  receiptEntries: any[];
  getServiceColor: (name: string) => string;
  setReceiptEntry: (entry: any) => void;
  setAutoDownloadReceipt: (v: boolean) => void;
}) {
  if (activeTab !== "receipts") return null;
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ position: "relative" }}>
        <Search size={13} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        <input value={receiptSearch} onChange={(e) => setReceiptSearch(e.target.value)}
          placeholder="Search by receipt no., customer name, or service…"
          style={{ width: "100%", height: 40, paddingLeft: 34, paddingRight: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 13, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 4px rgba(11,44,96,0.05)" }} />
      </div>
      {receiptEntries.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: "rgba(11,44,96,0.06)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Receipt size={26} color="#0b2c60" opacity={0.3} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0b2c60", marginBottom: 6 }}>No receipts found</p>
          <p style={{ fontSize: 12, color: "#94a3b8" }}>{receiptSearch ? "Try a different search term" : "Receipts will appear here after adding entries"}</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(11,44,96,0.03)", borderBottom: "2px solid rgba(11,44,96,0.08)" }}>
                {([{ label: "Receipt No", w: 140 }, { label: "Date", w: 100 }, { label: "Customer" }, { label: "Service", w: 156 }, { label: "Amount", w: 120, right: true }, { label: "Actions", w: 160, right: true }] as any[]).map((col: any) => (
                  <th key={col.label} style={{ padding: "10px 14px", textAlign: col.right ? "right" : "left", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.07em", whiteSpace: "nowrap" as const, width: col.w }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {receiptEntries.map((entry: any) => {
                const isCredit = entry.credit > 0;
                const amt    = isCredit ? entry.credit : entry.debit;
                const ec     = isCredit ? "#059669" : "#e11d48";
                const prefix = isCredit ? "+" : "−";
                return (
                  <tr key={entry.id} style={{ borderBottom: "1px solid rgba(11,44,96,0.05)", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(11,44,96,0.02)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" as const }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: "#f97316", background: "rgba(249,115,22,0.07)", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(249,115,22,0.15)" }}>{entry.receiptNumber}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" as const }}>{entry.date}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 13, color: "#0b2c60", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{entry.customerName}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: getServiceColor(entry.serviceType), background: getServiceColor(entry.serviceType) + "14", padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" as const }}>{entry.serviceType}</span>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 900, fontSize: 14, color: ec, whiteSpace: "nowrap" as const }}>
                      {prefix}₹{amt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button onClick={() => { setReceiptEntry(entry); setAutoDownloadReceipt(false); }} title="View Receipt"
                          style={{ height: 32, paddingInline: 10, borderRadius: 8, border: "1.5px solid rgba(11,44,96,0.15)", background: "rgba(11,44,96,0.04)", color: "#0b2c60", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                          <Receipt size={12} />View
                        </button>
                        <button onClick={() => { setReceiptEntry(entry); setAutoDownloadReceipt(true); }} title="Download PDF"
                          style={{ height: 32, paddingInline: 10, borderRadius: 8, border: "none", background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, boxShadow: "0 2px 8px rgba(11,44,96,0.22)" }}>
                          <Download size={12} />PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
