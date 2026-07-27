import type { Dispatch, SetStateAction } from "react";

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
      style={{ borderBottom: "1px solid var(--brand-navy-tint-md)", background: "var(--brand-navy-tint-xs)" }}>
      <td style={{ padding: "8px 14px", color: "var(--brand-navy-800)", fontSize: 11, fontWeight: 700 }}>{rowNum}</td>
      <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: "var(--brand-orange)", background: "var(--brand-orange-tint-07)", padding: "3px 8px", borderRadius: 6, border: "1px solid var(--brand-orange-tint-sm)" }}>
          {entry.receiptNumber ?? `CSC-${new Date(entry.createdAt).getFullYear()}-${String(entry.id).padStart(4, "0")}`}
        </span>
      </td>
      <td style={{ padding: "6px 6px" }}>
        <input type="date" value={inlineEdit.date} onChange={e => setInlineEdit(p => ({ ...p, date: e.target.value }))}
          style={{ width: "100%", height: 32, paddingInline: 7, borderRadius: 8, border: "1.5px solid var(--brand-navy-800)", fontSize: 11, color: "var(--brand-navy-800)", outline: "none", background: "#fff", fontFamily: "monospace", boxSizing: "border-box" }} />
      </td>
      <td style={{ padding: "6px 6px" }}>
        <input value={inlineEdit.customerName} onChange={e => setInlineEdit(p => ({ ...p, customerName: e.target.value }))}
          placeholder="Customer" list="ledger-customer-names" autoComplete="off"
          style={{ width: "100%", height: 32, paddingInline: 8, borderRadius: 8, border: "1.5px solid var(--brand-navy-800)", fontSize: 12, color: "var(--brand-navy-800)", outline: "none", background: "#fff", fontWeight: 600, boxSizing: "border-box" }} />
      </td>
      <td style={{ padding: "6px 6px" }}>
        <select value={inlineEdit.serviceType} onChange={e => setInlineEdit(p => ({ ...p, serviceType: e.target.value }))}
          style={{ width: "100%", height: 32, paddingInline: 7, borderRadius: 8, border: "1.5px solid var(--brand-navy-800)", fontSize: 11, color: "var(--brand-navy-800)", outline: "none", background: "#fff", boxSizing: "border-box" }}>
          {serviceTypes.map((s: string) => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
      <td colSpan={2} style={{ padding: "6px 6px" }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button onClick={() => setInlineEdit(p => ({ ...p, entryType: "credit" }))}
            style={{ flexShrink: 0, height: 32, paddingInline: 9, borderRadius: 8, border: "1.5px solid", borderColor: inlineEdit.entryType === "credit" ? "var(--color-success)" : "var(--color-slate-200)", background: inlineEdit.entryType === "credit" ? "rgba(5,150,105,0.1)" : "#fff", color: inlineEdit.entryType === "credit" ? "var(--color-success)" : "var(--color-slate-400)", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
            Cr
          </button>
          <button onClick={() => setInlineEdit(p => ({ ...p, entryType: "debit" }))}
            style={{ flexShrink: 0, height: 32, paddingInline: 9, borderRadius: 8, border: "1.5px solid", borderColor: inlineEdit.entryType === "debit" ? "var(--color-error)" : "var(--color-slate-200)", background: inlineEdit.entryType === "debit" ? "var(--color-error-bg)" : "#fff", color: inlineEdit.entryType === "debit" ? "var(--color-error)" : "var(--color-slate-400)", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
            Dr
          </button>
          <input type="number" value={inlineEdit.amount} min="0" step="0.01"
            onChange={e => setInlineEdit(p => ({ ...p, amount: e.target.value }))}
            placeholder="0.00"
            style={{ flex: 1, minWidth: 0, height: 32, paddingInline: 8, borderRadius: 8, border: "1.5px solid var(--brand-navy-800)", fontSize: 12, color: "var(--brand-navy-800)", outline: "none", background: "#fff", textAlign: "right", fontWeight: 700, boxSizing: "border-box" }} />
        </div>
      </td>
      <td style={{ padding: "8px 14px", textAlign: "right", fontWeight: 900, fontSize: 13, color: balanceNum < 0 ? "var(--color-error)" : "var(--color-slate-400)", whiteSpace: "nowrap" }}>
        ₹{balanceNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </td>
      <td style={{ padding: "6px 6px" }}>
        <input value={inlineEdit.description} onChange={e => setInlineEdit(p => ({ ...p, description: e.target.value }))}
          placeholder="Note…"
          style={{ width: "100%", height: 32, paddingInline: 8, borderRadius: 8, border: "1.5px solid var(--color-slate-200)", fontSize: 11, color: "var(--brand-navy-800)", outline: "none", background: "#fff", boxSizing: "border-box" }} />
      </td>
      <td style={{ padding: "6px 8px" }}>
        <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
          <button onClick={saveInlineEdit} disabled={updateMut.isPending}
            style={{ height: 30, paddingInline: 13, borderRadius: 8, border: "none", background: "var(--color-success)", color: "#fff", fontSize: 12, fontWeight: 800, cursor: updateMut.isPending ? "wait" : "pointer", whiteSpace: "nowrap", opacity: updateMut.isPending ? 0.7 : 1 }}>
            {updateMut.isPending ? "…" : "Save"}
          </button>
          <button onClick={() => setInlineEditId(null)}
            style={{ height: 30, paddingInline: 10, borderRadius: 8, border: "1.5px solid var(--color-slate-200)", background: "var(--color-slate-50)", color: "var(--color-slate-500)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
}
