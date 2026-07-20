import { LedgerSkeleton } from "@/components/skeletons";
import type { Dispatch, SetStateAction } from "react";
import { DesktopLedgerRow, DesktopLedgerRowEdit, MobileLedgerCard } from "./LedgerRow";
import { DesktopLedgerEmptyState } from "./LedgerEmptyState";

// ── Re-exports so existing import sites continue to work unchanged ──
export { TableTabsHeader, PendingSyncBanners } from "./LedgerRow";
export { DesktopReceiptsPanel, MobileReceiptsList } from "./LedgerRowActions";
export { TableFooterPagination, MobilePagination } from "./LedgerPagination";

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
  setInlineEdit: Dispatch<SetStateAction<{ date: string; customerName: string; serviceType: string; entryType: "credit" | "debit"; amount: string; description: string }>>;
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
                <DesktopLedgerEmptyState hasFilters={hasFilters} openCreate={openCreate} />
              </td>
            </tr>
          ) : (
            data.entries.map((entry: any, idx: number) => {
              const rowNum = (page - 1) * 15 + idx + 1;
              if (inlineEditId === entry.id) {
                return (
                  <DesktopLedgerRowEdit key={entry.id} entry={entry} rowNum={rowNum}
                    inlineEdit={inlineEdit} setInlineEdit={setInlineEdit}
                    serviceTypes={serviceTypes} saveInlineEdit={saveInlineEdit}
                    setInlineEditId={setInlineEditId} updateMut={updateMut} />
                );
              }
              return (
                <DesktopLedgerRow key={entry.id} entry={entry} rowNum={rowNum}
                  getServiceColor={getServiceColor} setReceiptEntry={setReceiptEntry}
                  openEdit={openEdit} setDeleteId={setDeleteId} />
              );
            })
          )}
        </tbody>
      </table>
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
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 4px 6px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{fmtDateGroup(date, t)}</p>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>
            {txns.map((entry: any) => (
              <MobileLedgerCard key={entry.id} entry={entry}
                setReceiptEntry={setReceiptEntry} openEdit={openEdit} setDeleteId={setDeleteId} />
            ))}
          </div>
        ))
      )}
    </div>
  );
}
