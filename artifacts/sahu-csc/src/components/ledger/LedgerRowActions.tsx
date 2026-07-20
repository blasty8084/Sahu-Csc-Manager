import { Pencil, Trash2, Download, Receipt, Search } from "lucide-react";

// ── Shared action buttons: receipt view, edit, delete ──
// size="md" → desktop (28 px), size="sm" → mobile (24 px)
export function LedgerRowActions({
  entry, setReceiptEntry, openEdit, setDeleteId, size = "md",
}: {
  entry: any;
  setReceiptEntry: (entry: any) => void;
  openEdit: (entry: any) => void;
  setDeleteId: (id: number | null) => void;
  size?: "md" | "sm";
}) {
  const sz = size === "md" ? 28 : 24;
  const iconSz = size === "md" ? 12 : 11;
  const br = size === "md" ? 7 : 6;
  const mt = size === "md" ? undefined : 5;
  return (
    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", marginTop: mt }}>
      <button onClick={() => setReceiptEntry(entry)} title="Receipt"
        style={{ width: sz, height: sz, borderRadius: br, border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <Receipt size={iconSz} color="#64748b" />
      </button>
      <button onClick={() => openEdit(entry)} title="Edit"
        style={{ width: sz, height: sz, borderRadius: br, border: size === "md" ? "1px solid rgba(11,44,96,0.15)" : "1px solid #e2e8f0", background: size === "md" ? "rgba(11,44,96,0.04)" : "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <Pencil size={iconSz} color={size === "md" ? "#0b2c60" : "#64748b"} />
      </button>
      <button onClick={() => setDeleteId(entry.id)} title="Delete"
        style={{ width: sz, height: sz, borderRadius: br, border: size === "md" ? "1px solid rgba(225,29,72,0.2)" : "1px solid #fee2e2", background: size === "md" ? "rgba(225,29,72,0.04)" : "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <Trash2 size={iconSz} color="#e11d48" />
      </button>
    </div>
  );
}

// ── Desktop: Receipt History tab content ──
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
                const amt = isCredit ? entry.credit : entry.debit;
                const ec = isCredit ? "#059669" : "#e11d48";
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

// ── MOBILE: Receipt History list ──
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
        const amt = isCredit ? entry.credit : entry.debit;
        const ec = isCredit ? "#059669" : "#e11d48";
        const prefix = isCredit ? "+" : "−";
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
