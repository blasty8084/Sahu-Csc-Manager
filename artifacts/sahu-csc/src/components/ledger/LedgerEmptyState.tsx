import { IndianRupee } from "lucide-react";

// ── Desktop: empty state shown inside the transactions table ──
export function DesktopLedgerEmptyState({
  hasFilters, openCreate,
}: {
  hasFilters: boolean;
  openCreate: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--surface-warn-bg)", outline: "6px solid var(--surface-warn-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IndianRupee size={28} color="var(--brand-orange)" strokeWidth={2.5} />
      </div>
      <p style={{ fontSize: 17, fontWeight: 700, color: "var(--color-slate-800)", marginBottom: 2 }}>No transactions found</p>
      <p style={{ fontSize: 13, color: "var(--color-slate-400)", fontWeight: 500 }}>{hasFilters ? "Try clearing the filters" : "Add your first entry to get started"}</p>
      {!hasFilters && (
        <button onClick={openCreate}
          style={{ background: "var(--brand-orange)", color: "white", borderRadius: 12, padding: "10px 24px", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", marginTop: 4 }}>
          + Add New Entry
        </button>
      )}
    </div>
  );
}
