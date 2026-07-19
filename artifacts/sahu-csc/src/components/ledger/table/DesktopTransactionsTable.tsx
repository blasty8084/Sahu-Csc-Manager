import { LedgerDesktopRow } from "@/components/ledger/LedgerRow";
import { LedgerEmptyState } from "@/components/ledger/LedgerEmptyState";

type InlineEdit = {
  date: string;
  customerName: string;
  serviceType: string;
  entryType: "credit" | "debit";
  amount: string;
  description: string;
};

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
  inlineEdit: InlineEdit;
  setInlineEdit: React.Dispatch<React.SetStateAction<InlineEdit>>;
  serviceTypes: string[];
  saveInlineEdit: () => void;
  setInlineEditId: (id: number | null) => void;
  updateMut: { isPending: boolean };
  getServiceColor: (name: string) => string;
  setReceiptEntry: (entry: any) => void;
  openEdit: (entry: any) => void;
  setDeleteId: (id: number | null) => void;
}) {
  const COLS = [
    { label: "#", w: 44 }, { label: "Receipt No", w: 126 }, { label: "Date", w: 100 },
    { label: "Customer" }, { label: "Service", w: 156 },
    { label: "Credit", w: 108, right: true }, { label: "Debit", w: 108, right: true },
    { label: "Balance", w: 118, right: true }, { label: "Note", w: 130 }, { label: "", w: 100 },
  ] as const;

  return (
    <div style={{ flex: 1, overflowX: "auto", overflowY: "auto", display: activeTab !== "transactions" ? "none" : undefined }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
          <tr style={{ background: "#f8fafc", borderBottom: "2px solid rgba(11,44,96,0.08)" }}>
            {COLS.map((col: any) => (
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
                <LedgerEmptyState hasFilters={hasFilters} onAddEntry={openCreate} />
              </td>
            </tr>
          ) : (
            data.entries.map((entry: any, idx: number) => {
              const rowNum    = (page - 1) * 15 + idx + 1;
              const balanceNum = Number(entry.balance);
              const isEditing = inlineEditId === entry.id;
              const svcColor  = getServiceColor(entry.serviceType);

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
                          style={{ flexShrink: 0, height: 32, paddingInline: 9, borderRadius: 8, border: "1.5px solid", borderColor: inlineEdit.entryType === "credit" ? "#059669" : "#e2e8f0", background: inlineEdit.entryType === "credit" ? "rgba(5,150,105,0.1)" : "#fff", color: inlineEdit.entryType === "credit" ? "#059669" : "#94a3b8", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Cr</button>
                        <button onClick={() => setInlineEdit(p => ({ ...p, entryType: "debit" }))}
                          style={{ flexShrink: 0, height: 32, paddingInline: 9, borderRadius: 8, border: "1.5px solid", borderColor: inlineEdit.entryType === "debit" ? "#e11d48" : "#e2e8f0", background: inlineEdit.entryType === "debit" ? "rgba(225,29,72,0.08)" : "#fff", color: inlineEdit.entryType === "debit" ? "#e11d48" : "#94a3b8", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Dr</button>
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
                <LedgerDesktopRow
                  key={entry.id}
                  entry={entry}
                  rowNum={rowNum}
                  svcColor={svcColor}
                  onReceipt={() => setReceiptEntry(entry)}
                  onEdit={() => openEdit(entry)}
                  onDelete={() => setDeleteId(entry.id)}
                />
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
