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
