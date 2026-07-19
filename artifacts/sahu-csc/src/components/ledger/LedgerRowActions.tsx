import { Receipt, Pencil, Trash2 } from "lucide-react";

interface LedgerRowActionsProps {
  /** "md" = desktop 28×28 px / "sm" = mobile 24×24 px */
  size?: "sm" | "md";
  onReceipt: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Three-button cluster shared by the desktop table row and mobile card row.
 * Buttons: Receipt (view), Edit (pencil), Delete (trash).
 */
export function LedgerRowActions({ size = "md", onReceipt, onEdit, onDelete }: LedgerRowActionsProps) {
  const dim    = size === "sm" ? 24 : 28;
  const radius = size === "sm" ? 6  : 7;
  const icon   = size === "sm" ? 11 : 12;

  return (
    <div style={{ display: "flex", gap: size === "sm" ? 4 : 4, justifyContent: "flex-end" }}>
      <button
        onClick={onReceipt} title="Receipt"
        style={{ width: dim, height: dim, borderRadius: radius, border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      >
        <Receipt size={icon} color="#64748b" />
      </button>
      <button
        onClick={onEdit} title="Edit"
        style={{ width: dim, height: dim, borderRadius: radius, border: "1px solid rgba(11,44,96,0.15)", background: "rgba(11,44,96,0.04)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      >
        <Pencil size={icon} color="#0b2c60" />
      </button>
      <button
        onClick={onDelete} title="Delete"
        style={{ width: dim, height: dim, borderRadius: radius, border: size === "sm" ? "1px solid #fee2e2" : "1px solid rgba(225,29,72,0.2)", background: size === "sm" ? "#fff5f5" : "rgba(225,29,72,0.04)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      >
        <Trash2 size={icon} color="#e11d48" />
      </button>
    </div>
  );
}
