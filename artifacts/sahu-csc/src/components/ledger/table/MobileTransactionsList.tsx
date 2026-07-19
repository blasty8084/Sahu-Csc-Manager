import { LedgerSkeleton } from "@/components/skeletons";
import { LedgerMobileRow } from "@/components/ledger/LedgerRow";

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
            {/* Date group header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 4px 6px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{fmtDateGroup(date, t)}</p>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>
            {txns.map((entry: any) => (
              <LedgerMobileRow
                key={entry.id}
                entry={entry}
                onReceipt={() => setReceiptEntry(entry)}
                onEdit={() => openEdit(entry)}
                onDelete={() => setDeleteId(entry.id)}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}
