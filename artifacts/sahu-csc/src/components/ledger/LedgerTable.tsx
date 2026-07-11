import { LedgerSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pencil, Trash2, Download, Clock, WifiOff, Receipt, Search, IndianRupee,
  FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Lock,
  ArrowDownLeft, ArrowUpRight,
} from "lucide-react";

// ── Tabs row (Transactions / Receipt History) with counts + status badges ──
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

// ── Pending offline entries + background-sync banners shown above the table ──
export function PendingSyncBanners({ pendingEntries, bgSyncCount }: { pendingEntries: any[]; bgSyncCount: number }) {
  return (
    <>
      {pendingEntries.length > 0 && (
        <div style={{ background: "rgba(251,191,36,0.07)", borderBottom: "1px solid rgba(251,191,36,0.18)", padding: "10px 22px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Clock size={13} style={{ color: "#d97706", flexShrink: 0 }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: "#92400e" }}>
            {pendingEntries.length} offline {pendingEntries.length === 1 ? "entry" : "entries"} pending sync — will upload when reconnected
          </p>
        </div>
      )}
      {bgSyncCount > 0 && (
        <div style={{ background: "rgba(124,58,237,0.06)", borderBottom: "1px solid rgba(124,58,237,0.16)", padding: "10px 22px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Clock size={13} style={{ color: "#7c3aed", flexShrink: 0 }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: "#5b21b6" }}>
            {bgSyncCount} {bgSyncCount === 1 ? "request" : "requests"} queued for background sync — the browser will retry automatically once connectivity is stable
          </p>
        </div>
      )}
    </>
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

// ── Desktop: Transactions table (with row-level inline edit) ──
export function DesktopTransactionsTable({
  activeTab, data, isLoading, page, hasFilters, openCreate, inlineEditId, inlineEdit, setInlineEdit,
  serviceTypes, saveInlineEdit, setInlineEditId, updateMut, getServiceColor, setReceiptEntry, openEdit, setDeleteId,
}: {
  activeTab: "transactions" | "receipts";
  data: any;
  isLoading: boolean;
  page: number;
  hasFilters: boolean;
  openCreate: () => void;
  inlineEditId: number | null;
  inlineEdit: { date: string; customerName: string; serviceType: string; entryType: "credit" | "debit"; amount: string; description: string };
  setInlineEdit: React.Dispatch<React.SetStateAction<{ date: string; customerName: string; serviceType: string; entryType: "credit" | "debit"; amount: string; description: string }>>;
  serviceTypes: string[];
  saveInlineEdit: () => void;
  setInlineEditId: (id: number | null) => void;
  updateMut: { isPending: boolean };
  getServiceColor: (name: string) => string;
  setReceiptEntry: (entry: any) => void;
  openEdit: (entry: any) => void;
  setDeleteId: (id: number | null) => void;
}) {
  return (
    <div style={{ flex: 1, overflowX: "auto", overflowY: "auto", display: activeTab !== "transactions" ? "none" : undefined }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
          <tr style={{ background: "#f8fafc", borderBottom: "2px solid rgba(11,44,96,0.08)" }}>
            {([{ label: "#", w: 44 }, { label: "Receipt No", w: 126 }, { label: "Date", w: 100 }, { label: "Customer" }, { label: "Service", w: 156 }, { label: "Credit", w: 108, right: true }, { label: "Debit", w: 108, right: true }, { label: "Balance", w: 118, right: true }, { label: "Note", w: 130 }, { label: "", w: 100 }] as any[]).map((col: any) => (
              <th key={col.label} style={{ padding: "11px 14px", textAlign: col.right ? "right" : "left", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap", width: col.w }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            [...Array(8)].map((_, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(11,44,96,0.05)" }}>
                {[44, 110, 90, 0, 130, 90, 90, 100, 110, 90].map((w, j) => (
                  <td key={j} style={{ padding: "13px 14px" }}>
                    <div style={{ height: 12, borderRadius: 6, background: "#f1f5f9", width: w || "80%" }} />
                  </td>
                ))}
              </tr>
            ))
          ) : !data?.entries?.length ? (
            <tr>
              <td colSpan={10} style={{ textAlign: "center", padding: "72px 0" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#ffedd5", outline: "6px solid #fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IndianRupee size={28} color="#f97316" strokeWidth={2.5} />
                  </div>
                  <p style={{ fontSize: 17, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>No transactions found</p>
                  <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{hasFilters ? "Try clearing the filters" : "Add your first entry to get started"}</p>
                  {!hasFilters && (
                    <button onClick={openCreate}
                      style={{ background: "#f97316", color: "white", borderRadius: 12, padding: "10px 24px", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", marginTop: 4 }}>
                      + Add New Entry
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            data.entries.map((entry: any, idx: number) => {
              const rowNum = (page - 1) * 15 + idx + 1;
              const balanceNum = Number(entry.balance);
              const isEditing = inlineEditId === entry.id;
              const svcColor = getServiceColor(entry.serviceType);

              if (isEditing) {
                return (
                  <tr key={entry.id} data-testid={`row-ledger-${entry.id}`}
                    style={{ borderBottom: "1px solid rgba(11,44,96,0.1)", background: "rgba(11,44,96,0.025)" }}>
                    <td style={{ padding: "8px 14px", color: "#0b2c60", fontSize: 11, fontWeight: 700 }}>{rowNum}</td>
                    <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: "#f97316", background: "rgba(249,115,22,0.07)", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(249,115,22,0.15)" }}>
                        {entry.receiptNumber ?? `CSC-${new Date(entry.createdAt).getFullYear()}-${String(entry.id).padStart(4, "0")}`}
                      </span>
                    </td>
                    <td style={{ padding: "6px 6px" }}>
                      <input type="date" value={inlineEdit.date} onChange={e => setInlineEdit(p => ({ ...p, date: e.target.value }))}
                        style={{ width: "100%", height: 32, paddingInline: 7, borderRadius: 8, border: "1.5px solid #0b2c60", fontSize: 11, color: "#0b2c60", outline: "none", background: "#fff", fontFamily: "monospace", boxSizing: "border-box" }} />
                    </td>
                    <td style={{ padding: "6px 6px" }}>
                      <input value={inlineEdit.customerName} onChange={e => setInlineEdit(p => ({ ...p, customerName: e.target.value }))}
                        placeholder="Customer" list="ledger-customer-names" autoComplete="off"
                        style={{ width: "100%", height: 32, paddingInline: 8, borderRadius: 8, border: "1.5px solid #0b2c60", fontSize: 12, color: "#0b2c60", outline: "none", background: "#fff", fontWeight: 600, boxSizing: "border-box" }} />
                    </td>
                    <td style={{ padding: "6px 6px" }}>
                      <select value={inlineEdit.serviceType} onChange={e => setInlineEdit(p => ({ ...p, serviceType: e.target.value }))}
                        style={{ width: "100%", height: 32, paddingInline: 7, borderRadius: 8, border: "1.5px solid #0b2c60", fontSize: 11, color: "#0b2c60", outline: "none", background: "#fff", boxSizing: "border-box" }}>
                        {serviceTypes.map((s: string) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td colSpan={2} style={{ padding: "6px 6px" }}>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <button onClick={() => setInlineEdit(p => ({ ...p, entryType: "credit" }))}
                          style={{ flexShrink: 0, height: 32, paddingInline: 9, borderRadius: 8, border: "1.5px solid", borderColor: inlineEdit.entryType === "credit" ? "#059669" : "#e2e8f0", background: inlineEdit.entryType === "credit" ? "rgba(5,150,105,0.1)" : "#fff", color: inlineEdit.entryType === "credit" ? "#059669" : "#94a3b8", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
                          Cr
                        </button>
                        <button onClick={() => setInlineEdit(p => ({ ...p, entryType: "debit" }))}
                          style={{ flexShrink: 0, height: 32, paddingInline: 9, borderRadius: 8, border: "1.5px solid", borderColor: inlineEdit.entryType === "debit" ? "#e11d48" : "#e2e8f0", background: inlineEdit.entryType === "debit" ? "rgba(225,29,72,0.08)" : "#fff", color: inlineEdit.entryType === "debit" ? "#e11d48" : "#94a3b8", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
                          Dr
                        </button>
                        <input type="number" value={inlineEdit.amount} min="0" step="0.01"
                          onChange={e => setInlineEdit(p => ({ ...p, amount: e.target.value }))}
                          placeholder="0.00"
                          style={{ flex: 1, minWidth: 0, height: 32, paddingInline: 8, borderRadius: 8, border: "1.5px solid #0b2c60", fontSize: 12, color: "#0b2c60", outline: "none", background: "#fff", textAlign: "right", fontWeight: 700, boxSizing: "border-box" }} />
                      </div>
                    </td>
                    <td style={{ padding: "8px 14px", textAlign: "right", fontWeight: 900, fontSize: 13, color: balanceNum < 0 ? "#e11d48" : "#94a3b8", whiteSpace: "nowrap" }}>
                      ₹{balanceNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "6px 6px" }}>
                      <input value={inlineEdit.description} onChange={e => setInlineEdit(p => ({ ...p, description: e.target.value }))}
                        placeholder="Note…"
                        style={{ width: "100%", height: 32, paddingInline: 8, borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 11, color: "#0b2c60", outline: "none", background: "#fff", boxSizing: "border-box" }} />
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                        <button onClick={saveInlineEdit} disabled={updateMut.isPending}
                          style={{ height: 30, paddingInline: 13, borderRadius: 8, border: "none", background: "#059669", color: "#fff", fontSize: 12, fontWeight: 800, cursor: updateMut.isPending ? "wait" : "pointer", whiteSpace: "nowrap", opacity: updateMut.isPending ? 0.7 : 1 }}>
                          {updateMut.isPending ? "…" : "Save"}
                        </button>
                        <button onClick={() => setInlineEditId(null)}
                          style={{ height: 30, paddingInline: 10, borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={entry.id} data-testid={`row-ledger-${entry.id}`}
                  style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(11,44,96,0.018)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "14px 14px", color: "#d1d5db", fontSize: 11, fontWeight: 700 }}>{rowNum}</td>
                  <td style={{ padding: "14px 14px", whiteSpace: "nowrap" }}>
                    <code style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: "#f97316", background: "rgba(249,115,22,0.07)", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(249,115,22,0.12)" }}>
                      {entry.receiptNumber ?? `CSC-${new Date(entry.createdAt).getFullYear()}-${String(entry.id).padStart(4, "0")}`}
                    </code>
                  </td>
                  <td style={{ padding: "14px 14px", fontSize: 12, fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" }}>{entry.date}</td>
                  <td style={{ padding: "14px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: svcColor + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: svcColor }}>{(entry.customerName || "?")[0].toUpperCase()}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{entry.customerName}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 14px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: svcColor, background: svcColor + "14", padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap", display: "inline-block" }}>{entry.serviceType}</span>
                  </td>
                  <td style={{ padding: "14px 14px", textAlign: "right", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" }}>
                    {entry.credit > 0 ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669", display: "inline-block", flexShrink: 0 }} />
                        <span style={{ color: "#059669" }}>+₹{entry.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </span>
                    ) : <span style={{ color: "#e2e8f0" }}>—</span>}
                  </td>
                  <td style={{ padding: "14px 14px", textAlign: "right", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" }}>
                    {entry.debit > 0 ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e11d48", display: "inline-block", flexShrink: 0 }} />
                        <span style={{ color: "#e11d48" }}>−₹{entry.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </span>
                    ) : <span style={{ color: "#e2e8f0" }}>—</span>}
                  </td>
                  <td style={{ padding: "14px 14px", textAlign: "right", fontWeight: 900, fontSize: 13, color: balanceNum < 0 ? "#e11d48" : "#0b2c60", whiteSpace: "nowrap" }}>
                    ₹{balanceNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: "14px 14px", fontSize: 11, color: "#94a3b8", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.description || "—"}</td>
                  <td style={{ padding: "14px 10px" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <button onClick={() => setReceiptEntry(entry)} title="Receipt"
                        style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <Receipt size={12} color="#64748b" />
                      </button>
                      <button onClick={() => openEdit(entry)} title="Edit"
                        style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(11,44,96,0.15)", background: "rgba(11,44,96,0.04)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <Pencil size={12} color="#0b2c60" />
                      </button>
                      <button onClick={() => setDeleteId(entry.id)} title="Delete"
                        style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(225,29,72,0.2)", background: "rgba(225,29,72,0.04)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <Trash2 size={12} color="#e11d48" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Desktop: footer summary + pagination + security note ──
export function TableFooterPagination({
  activeTab, data, page, setPage, totalPages,
}: {
  activeTab: "transactions" | "receipts";
  data: any;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}) {
  return (
    <div style={{ display: activeTab !== "transactions" ? "none" : "flex", flexDirection: "column", gap: 0, borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
            {data?.total ? `Showing ${(page - 1) * 15 + 1}–${Math.min(page * 15, data.total)} of ${data.total} transactions` : "Showing 0 of 0 transactions"}
          </p>
          {(data?.entries?.length ?? 0) > 0 && (() => {
            const pCr = (data?.entries ?? []).reduce((s: number, e: any) => s + (Number(e.credit) || 0), 0);
            const pDb = (data?.entries ?? []).reduce((s: number, e: any) => s + (Number(e.debit) || 0), 0);
            const net = pCr - pDb;
            return (
              <span style={{ display: "flex", gap: 10, fontSize: 12, fontWeight: 600 }}>
                <span style={{ color: "#059669" }}>Cr: ₹{pCr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                <span style={{ color: "#cbd5e1" }}>·</span>
                <span style={{ color: "#e11d48" }}>Dr: ₹{pDb.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                <span style={{ color: "#cbd5e1" }}>·</span>
                <span style={{ color: "#0b2c60", fontWeight: 700 }}>Net: {net >= 0 ? "+" : ""}₹{net.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </span>
            );
          })()}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button onClick={() => setPage(1)} disabled={page <= 1}
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid transparent", background: "transparent", color: page <= 1 ? "#cbd5e1" : "#94a3b8", cursor: page <= 1 ? "default" : "pointer" }}>
            <ChevronsLeft size={15} />
          </button>
          <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid transparent", background: "transparent", color: page <= 1 ? "#cbd5e1" : "#94a3b8", cursor: page <= 1 ? "default" : "pointer" }}>
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: Math.min(totalPages || 1, 5) }, (_, i) => {
            const p = (totalPages || 1) <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= (totalPages || 1) - 2 ? (totalPages || 1) - 4 + i : page - 2 + i;
            return (
              <button key={p} onClick={() => setPage(p)}
                style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid", borderColor: p === page ? "#0b2c60" : "transparent", background: p === page ? "#0b2c60" : "transparent", color: p === page ? "#fff" : "#94a3b8", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {p}
              </button>
            );
          })}
          <button onClick={() => setPage(p => p + 1)} disabled={page >= (totalPages || 1)}
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid transparent", background: "transparent", color: page >= (totalPages || 1) ? "#cbd5e1" : "#94a3b8", cursor: page >= (totalPages || 1) ? "default" : "pointer" }}>
            <ChevronRight size={15} />
          </button>
          <button onClick={() => setPage(totalPages || 1)} disabled={page >= (totalPages || 1)}
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid transparent", background: "transparent", color: page >= (totalPages || 1) ? "#cbd5e1" : "#94a3b8", cursor: page >= (totalPages || 1) ? "default" : "pointer" }}>
            <ChevronsRight size={15} />
          </button>
        </div>
      </div>
      {/* Security footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, paddingBottom: 10, color: "#94a3b8", fontSize: 11, fontWeight: 500 }}>
        <Lock size={11} />All your transactions are secure and encrypted
      </div>
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

// ── MOBILE: Date-grouped transaction card list ──
export function MobileTransactionsList({
  activeTab, isLoading, data, groupByDate, fmtDateGroup, t, setReceiptEntry, openEdit, setDeleteId,
}: {
  activeTab: "transactions" | "receipts";
  isLoading: boolean;
  data: any;
  groupByDate: (entries: any[]) => [string, any[]][];
  fmtDateGroup: (d: string, t: (key: string) => string) => string;
  t: (key: string) => string;
  setReceiptEntry: (entry: any) => void;
  openEdit: (entry: any) => void;
  setDeleteId: (id: number | null) => void;
}) {
  return (
    <div className="md:hidden space-y-1 pb-24" style={activeTab === "receipts" ? { display: "none" } : {}}>
      {isLoading ? (
        <LedgerSkeleton />
      ) : !data?.entries?.length ? (
        <div className="text-center text-muted-foreground py-16 text-sm">
          No entries found. Tap <strong>+</strong> to add your first entry.
        </div>
      ) : (
        groupByDate(data.entries).map(([date, txns]) => (
          <div key={date}>
            {/* Date group header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 4px 6px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{fmtDateGroup(date, t)}</p>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>
            {txns.map((entry: any) => {
              const isCredit = entry.credit > 0;
              const amt = isCredit ? entry.credit : entry.debit;
              const ec = isCredit ? "#059669" : "#e11d48";
              const iconBg = isCredit ? "rgba(5,150,105,0.08)" : "rgba(225,29,72,0.08)";
              return (
                <div key={entry.id} data-testid={`row-ledger-${entry.id}`}
                  style={{ background: "#fff", borderRadius: 14, marginBottom: 8, overflow: "hidden", boxShadow: "0 1px 8px rgba(11,44,96,0.07)", display: "flex", border: "1px solid #f1f5f9" }}>
                  <div style={{ width: 4, background: ec, flexShrink: 0 }} />
                  <div style={{ flex: 1, padding: "11px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Icon badge */}
                    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isCredit
                        ? <ArrowDownLeft size={17} color={ec} strokeWidth={2.5} />
                        : <ArrowUpRight size={17} color={ec} strokeWidth={2.5} />}
                    </div>
                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.customerName}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{entry.serviceType}</p>
                    </div>
                    {/* Amount + balance + action buttons */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 900, color: ec, lineHeight: 1 }}>{isCredit ? "+" : "−"}₹{amt.toLocaleString("en-IN")}</p>
                      <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>Bal ₹{Number(entry.balance).toLocaleString("en-IN")}</p>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", marginTop: 5 }}>
                        <button onClick={() => setReceiptEntry(entry)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Receipt size={11} color="#64748b" />
                        </button>
                        <button onClick={() => openEdit(entry)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Pencil size={11} color="#64748b" />
                        </button>
                        <button onClick={() => setDeleteId(entry.id)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #fee2e2", background: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Trash2 size={11} color="#e11d48" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}

// ── MOBILE: pagination controls ──
export function MobilePagination({
  page, setPage, totalPages,
}: {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="md:hidden flex items-center justify-between px-1">
      <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
        <ChevronLeft size={14} className="mr-1" />Prev
      </Button>
      <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
      <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
        Next<ChevronRight size={14} className="ml-1" />
      </Button>
    </div>
  );
}
