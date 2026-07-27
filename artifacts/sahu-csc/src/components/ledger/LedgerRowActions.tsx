import { Pencil, Trash2, Receipt } from "lucide-react";

// Re-exports so LedgerTable's barrel and any direct imports still work
export { DesktopReceiptsPanel } from "./LedgerReceiptsPanel";
export { MobileReceiptsList } from "./LedgerMobileReceipts";

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
        style={{ width: sz, height: sz, borderRadius: br, border: "1px solid var(--color-slate-200)", background: "var(--color-slate-50)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <Receipt size={iconSz} color="var(--color-slate-500)" />
      </button>
      <button onClick={() => openEdit(entry)} title="Edit"
        style={{ width: sz, height: sz, borderRadius: br, border: size === "md" ? "1px solid var(--brand-navy-tint-md)" : "1px solid var(--color-slate-200)", background: size === "md" ? "var(--brand-navy-tint-sm)" : "var(--color-slate-50)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <Pencil size={iconSz} color={size === "md" ? "var(--brand-navy-800)" : "var(--color-slate-500)"} />
      </button>
      <button onClick={() => setDeleteId(entry.id)} title="Delete"
        style={{ width: sz, height: sz, borderRadius: br, border: size === "md" ? "1px solid rgba(225,29,72,0.2)" : "1px solid var(--color-error-bg)", background: size === "md" ? "rgba(225,29,72,0.04)" : "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <Trash2 size={iconSz} color="var(--color-error)" />
      </button>
    </div>
  );
}
