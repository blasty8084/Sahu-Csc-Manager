import { IndianRupee } from "lucide-react";

interface LedgerEmptyStateProps {
  hasFilters: boolean;
  onAddEntry: () => void;
}

/**
 * Empty state shown inside the transactions table when there are no entries.
 * Rendered by DesktopTransactionsTable inside a <tr><td colSpan={10}> wrapper.
 */
export function LedgerEmptyState({ hasFilters, onAddEntry }: LedgerEmptyStateProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#ffedd5", outline: "6px solid #fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IndianRupee size={28} color="#f97316" strokeWidth={2.5} />
      </div>
      <p style={{ fontSize: 17, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>No transactions found</p>
      <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
        {hasFilters ? "Try clearing the filters" : "Add your first entry to get started"}
      </p>
      {!hasFilters && (
        <button
          onClick={onAddEntry}
          style={{ background: "#f97316", color: "white", borderRadius: 12, padding: "10px 24px", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", marginTop: 4 }}
        >
          + Add New Entry
        </button>
      )}
    </div>
  );
}
