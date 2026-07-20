import { Clock, WifiOff, FileText, Receipt, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { LedgerRowActions } from "./LedgerRowActions";

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

// ── Desktop: single data row (non-editing) ──
export function DesktopLedgerRow({
  entry, rowNum, getServiceColor, setReceiptEntry, openEdit, setDeleteId,
}: {
  entry: any;
  rowNum: number;
  getServiceColor: (name: string) => string;
  setReceiptEntry: (entry: any) => void;
  openEdit: (entry: any) => void;
  setDeleteId: (id: number | null) => void;
}) {
  const balanceNum = Number(entry.balance);
  const svcColor = getServiceColor(entry.serviceType);
  return (
    <tr data-testid={`row-ledger-${entry.id}`}
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
        <LedgerRowActions entry={entry} setReceiptEntry={setReceiptEntry} openEdit={openEdit} setDeleteId={setDeleteId} size="md" />
      </td>
    </tr>
  );
}

// ── Desktop: inline-editing row ──
export function DesktopLedgerRowEdit({
  entry, rowNum, inlineEdit, setInlineEdit, serviceTypes, saveInlineEdit, setInlineEditId, updateMut,
}: {
  entry: any;
  rowNum: number;
  inlineEdit: { date: string; customerName: string; serviceType: string; entryType: "credit" | "debit"; amount: string; description: string };
  setInlineEdit: Dispatch<SetStateAction<{ date: string; customerName: string; serviceType: string; entryType: "credit" | "debit"; amount: string; description: string }>>;
  serviceTypes: string[];
  saveInlineEdit: () => void;
  setInlineEditId: (id: number | null) => void;
  updateMut: { isPending: boolean };
}) {
  const balanceNum = Number(entry.balance);
  return (
    <tr data-testid={`row-ledger-${entry.id}`}
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

// ── MOBILE: single transaction card ──
export function MobileLedgerCard({
  entry, setReceiptEntry, openEdit, setDeleteId,
}: {
  entry: any;
  setReceiptEntry: (entry: any) => void;
  openEdit: (entry: any) => void;
  setDeleteId: (id: number | null) => void;
}) {
  const isCredit = entry.credit > 0;
  const amt = isCredit ? entry.credit : entry.debit;
  const ec = isCredit ? "#059669" : "#e11d48";
  const iconBg = isCredit ? "rgba(5,150,105,0.08)" : "rgba(225,29,72,0.08)";
  return (
    <div data-testid={`row-ledger-${entry.id}`}
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
          <LedgerRowActions entry={entry} setReceiptEntry={setReceiptEntry} openEdit={openEdit} setDeleteId={setDeleteId} size="sm" />
        </div>
      </div>
    </div>
  );
}
