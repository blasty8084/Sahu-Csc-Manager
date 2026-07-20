import { Clock, WifiOff, FileText, Receipt, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { LedgerRowActions } from "./LedgerRowActions";

// Re-export so LedgerTable's barrel and any direct imports still work
export { DesktopLedgerRowEdit } from "./LedgerRowEdit";

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
        <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isCredit
            ? <ArrowDownLeft size={17} color={ec} strokeWidth={2.5} />
            : <ArrowUpRight size={17} color={ec} strokeWidth={2.5} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.customerName}</p>
          <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{entry.serviceType}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 900, color: ec, lineHeight: 1 }}>{isCredit ? "+" : "−"}₹{amt.toLocaleString("en-IN")}</p>
          <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>Bal ₹{Number(entry.balance).toLocaleString("en-IN")}</p>
          <LedgerRowActions entry={entry} setReceiptEntry={setReceiptEntry} openEdit={openEdit} setDeleteId={setDeleteId} size="sm" />
        </div>
      </div>
    </div>
  );
}
