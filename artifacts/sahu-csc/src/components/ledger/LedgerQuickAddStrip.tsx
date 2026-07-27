export interface QuickAddState {
  date: string;
  customerName: string;
  serviceType: string;
  entryType: "credit" | "debit";
  amount: string;
  description: string;
}

interface LedgerQuickAddStripProps {
  quickAdd: QuickAddState;
  setQuickAdd: React.Dispatch<React.SetStateAction<QuickAddState>>;
  serviceTypes: string[];
  saveQuickAdd: () => void;
  quickAddSaving: boolean;
}

export function LedgerQuickAddStrip({ quickAdd, setQuickAdd, serviceTypes, saveQuickAdd, quickAddSaving }: LedgerQuickAddStripProps) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--color-slate-200)", borderRadius: 20, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <input type="date" value={quickAdd.date} onChange={e => setQuickAdd(p => ({ ...p, date: e.target.value }))}
        style={{ height: 38, paddingInline: 10, borderRadius: 10, border: "1.5px solid var(--color-slate-200)", fontSize: 12, color: "var(--brand-navy-800)", outline: "none", background: "var(--color-slate-50)", width: 138, fontFamily: "monospace", fontWeight: 600, boxSizing: "border-box" }} />
      <input value={quickAdd.customerName} onChange={e => setQuickAdd(p => ({ ...p, customerName: e.target.value }))}
        onKeyDown={e => e.key === "Enter" && saveQuickAdd()}
        placeholder="Customer name *" list="ledger-customer-names" autoComplete="off"
        style={{ height: 38, paddingInline: 10, borderRadius: 10, border: "1.5px solid var(--color-slate-200)", fontSize: 12, color: "var(--brand-navy-800)", outline: "none", background: "var(--color-slate-50)", flex: 1, fontWeight: 600, boxSizing: "border-box" }} />
      <select value={quickAdd.serviceType} onChange={e => setQuickAdd(p => ({ ...p, serviceType: e.target.value }))}
        style={{ height: 38, paddingInline: 10, borderRadius: 10, border: "1.5px solid var(--color-slate-200)", fontSize: 12, color: quickAdd.serviceType ? "var(--brand-navy-800)" : "var(--color-slate-400)", outline: "none", background: "var(--color-slate-50)", width: 156, boxSizing: "border-box" }}>
        <option value="">Service type *</option>
        {serviceTypes.map((s: string) => <option key={s} value={s}>{s}</option>)}
      </select>
      <div style={{ display: "flex", background: "var(--color-slate-50)", borderRadius: 10, border: "1.5px solid var(--color-slate-200)", flexShrink: 0, overflow: "hidden" }}>
        <button onClick={() => setQuickAdd(p => ({ ...p, entryType: "credit" }))}
          style={{ height: 38, paddingInline: 14, border: "none", background: quickAdd.entryType === "credit" ? "var(--color-success-light)" : "transparent", color: quickAdd.entryType === "credit" ? "#fff" : "var(--color-slate-400)", fontSize: 12, fontWeight: 800, cursor: "pointer", borderRight: "1px solid var(--color-slate-200)" }}>
          Cr
        </button>
        <button onClick={() => setQuickAdd(p => ({ ...p, entryType: "debit" }))}
          style={{ height: 38, paddingInline: 14, border: "none", background: quickAdd.entryType === "debit" ? "var(--color-error-std)" : "transparent", color: quickAdd.entryType === "debit" ? "#fff" : "var(--color-slate-400)", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
          Dr
        </button>
      </div>
      <input type="number" value={quickAdd.amount} min="0" step="0.01"
        onChange={e => setQuickAdd(p => ({ ...p, amount: e.target.value }))}
        onKeyDown={e => e.key === "Enter" && saveQuickAdd()}
        placeholder="Amount *"
        style={{ height: 38, paddingInline: 10, borderRadius: 10, border: "1.5px solid var(--color-slate-200)", fontSize: 13, color: "var(--brand-navy-800)", outline: "none", background: "var(--color-slate-50)", width: 116, textAlign: "right", fontWeight: 700, boxSizing: "border-box" }} />
      <input value={quickAdd.description} onChange={e => setQuickAdd(p => ({ ...p, description: e.target.value }))}
        onKeyDown={e => e.key === "Enter" && saveQuickAdd()}
        placeholder="Note (optional)"
        style={{ height: 38, paddingInline: 10, borderRadius: 10, border: "1.5px solid var(--color-slate-200)", fontSize: 12, color: "var(--color-slate-500)", outline: "none", background: "var(--color-slate-50)", flex: 1, boxSizing: "border-box" }} />
      <button onClick={saveQuickAdd} disabled={quickAddSaving} data-testid="button-new-entry"
        style={{ height: 38, paddingInline: 20, borderRadius: 10, border: "none", background: quickAddSaving ? "var(--color-slate-400)" : "var(--brand-orange)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: quickAddSaving ? "wait" : "pointer", flexShrink: 0, boxShadow: quickAddSaving ? "none" : "0 2px 10px var(--brand-orange-tint-soft)" }}>
        {quickAddSaving ? "…" : "Apply"}
      </button>
    </div>
  );
}
