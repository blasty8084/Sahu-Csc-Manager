import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Lock } from "lucide-react";

// ── Desktop: footer summary + page buttons + security note ───────────────────

export function TableFooterPagination({
  activeTab, data, page, setPage, totalPages,
}: {
  activeTab: "transactions" | "receipts";
  data: any;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}) {
  // Memoised so typing in Quick-Add or any unrelated state change doesn't
  // re-run two .reduce() passes over the current page entries.
  const pageSummary = useMemo(() => {
    const entries: any[] = data?.entries ?? [];
    if (!entries.length) return null;
    const pCr = entries.reduce((s: number, e: any) => s + (Number(e.credit) || 0), 0);
    const pDb = entries.reduce((s: number, e: any) => s + (Number(e.debit)  || 0), 0);
    return { pCr, pDb, net: pCr - pDb };
  }, [data?.entries]);

  const tp = totalPages || 1;

  return (
    <div style={{ display: activeTab !== "transactions" ? "none" : "flex", flexDirection: "column", gap: 0, borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px" }}>
        {/* Summary */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
            {data?.total ? `Showing ${(page - 1) * 15 + 1}–${Math.min(page * 15, data.total)} of ${data.total} transactions` : "Showing 0 of 0 transactions"}
          </p>
          {pageSummary && (
            <span style={{ display: "flex", gap: 10, fontSize: 12, fontWeight: 600 }}>
              <span style={{ color: "#059669" }}>Cr: ₹{pageSummary.pCr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              <span style={{ color: "#cbd5e1" }}>·</span>
              <span style={{ color: "#e11d48" }}>Dr: ₹{pageSummary.pDb.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              <span style={{ color: "#cbd5e1" }}>·</span>
              <span style={{ color: "#0b2c60", fontWeight: 700 }}>Net: {pageSummary.net >= 0 ? "+" : ""}₹{pageSummary.net.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </span>
          )}
        </div>
        {/* Page buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button onClick={() => setPage(1)} disabled={page <= 1}
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid transparent", background: "transparent", color: page <= 1 ? "#cbd5e1" : "#94a3b8", cursor: page <= 1 ? "default" : "pointer" }}>
            <ChevronsLeft size={15} />
          </button>
          <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid transparent", background: "transparent", color: page <= 1 ? "#cbd5e1" : "#94a3b8", cursor: page <= 1 ? "default" : "pointer" }}>
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: Math.min(tp, 5) }, (_, i) => {
            const p = tp <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= tp - 2 ? tp - 4 + i : page - 2 + i;
            return (
              <button key={p} onClick={() => setPage(p)}
                style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid", borderColor: p === page ? "#0b2c60" : "transparent", background: p === page ? "#0b2c60" : "transparent", color: p === page ? "#fff" : "#94a3b8", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {p}
              </button>
            );
          })}
          <button onClick={() => setPage(p => p + 1)} disabled={page >= tp}
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid transparent", background: "transparent", color: page >= tp ? "#cbd5e1" : "#94a3b8", cursor: page >= tp ? "default" : "pointer" }}>
            <ChevronRight size={15} />
          </button>
          <button onClick={() => setPage(tp)} disabled={page >= tp}
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid transparent", background: "transparent", color: page >= tp ? "#cbd5e1" : "#94a3b8", cursor: page >= tp ? "default" : "pointer" }}>
            <ChevronsRight size={15} />
          </button>
        </div>
      </div>
      {/* Security footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, paddingBottom: 10, color: "#94a3b8", fontSize: 11, fontWeight: 500 }}>
        <Lock size={11} />All your transactions are secure and encrypted
      </div>
    </div>
  );
}

// ── Mobile: prev / next pagination controls ───────────────────────────────────

export function MobilePagination({
  page, setPage, totalPages,
}: {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="md:hidden flex items-center justify-between px-1">
      <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
        <ChevronLeft size={14} className="mr-1" />Prev
      </Button>
      <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
      <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
        Next<ChevronRight size={14} className="ml-1" />
      </Button>
    </div>
  );
}
