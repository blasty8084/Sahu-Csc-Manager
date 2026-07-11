import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { LedgerSkeleton } from "@/components/skeletons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Trash2, ArrowDownLeft, ArrowUpRight, Pencil, ChevronLeft, ChevronRight,
  Filter, X, Receipt, ListFilter, Fingerprint, TrendingDown, TrendingUp,
} from "lucide-react";
import { AepsReceiptModal } from "@/components/aeps-receipt-modal";
import { AutocompleteInput } from "@/components/autocomplete-input";
import { useForm } from "react-hook-form";
import { useGetSettings } from "@workspace/api-client-react";
import { apiFetch, fmt, fmtDate, type AllTx, type AllTxResponse } from "./aeps.constants";
import { EditTransactionDialog } from "./EditTransactionDialog";
import { DeleteTransactionDialog } from "./DeleteTransactionDialog";

// ─────────────────────────────────────────────────────────
// All Transactions Tab
// ─────────────────────────────────────────────────────────
export function AllTransactionsTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: bizSettings } = useGetSettings();
  const businessName = (bizSettings as any)?.businessName ?? "SAHU CSC";
  const businessAddress = (bizSettings as any)?.businessAddress ?? "";
  const businessMobile = (bizSettings as any)?.businessMobile ?? "";
  const businessWebsite = (bizSettings as any)?.businessWebsite ?? "";

  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [customerName, setCustomerName] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [editingTx, setEditingTx] = useState<AllTx | null>(null);
  const [deletingTx, setDeletingTx] = useState<AllTx | null>(null);
  const [receiptTx, setReceiptTx] = useState<AllTx | null>(null);

  const editForm = useForm({ defaultValues: { type: "withdrawal", amount: "", customerName: "", description: "" } });
  const editCustomerName = editForm.watch("customerName");

  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (typeFilter && typeFilter !== "all") params.set("type", typeFilter);
  if (customerName) params.set("customerName", customerName);

  const { data, isLoading } = useQuery<AllTxResponse>({
    queryKey: ["aeps-all-tx", page, startDate, endDate, typeFilter, customerName],
    queryFn: () => apiFetch(`/api/aeps/transactions?${params.toString()}`),
  });

  const allTabCustomerNames = useMemo(() => {
    const names = new Set<string>();
    data?.transactions?.forEach((t: AllTx) => { if (t.customerName) names.add(t.customerName); });
    return Array.from(names).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const editMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      apiFetch(`/api/aeps/transaction/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["aeps-all-tx"] });
      setEditingTx(null);
      toast({ title: t("aeps.toast_updated") });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/aeps/transaction/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["aeps-all-tx"] });
      setDeletingTx(null);
      toast({ title: "Transaction deleted" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const openEditDialog = (tx: AllTx) => {
    setEditingTx(tx);
    editForm.reset({ type: tx.type, amount: String(tx.amount), customerName: tx.customerName, description: tx.description ?? "" });
  };

  const onEditSubmit = editForm.handleSubmit((v) => {
    if (!editingTx) return;
    const amt = parseFloat(v.amount);
    if (isNaN(amt) || amt <= 0) { toast({ title: "Enter a valid amount", variant: "destructive" }); return; }
    editMut.mutate({ id: editingTx.id, data: { type: v.type, amount: amt, customerName: v.customerName, description: v.description || undefined } });
  });

  const clearFilters = () => { setStartDate(""); setEndDate(""); setTypeFilter("all"); setCustomerName(""); setPage(1); };
  const hasFilters = !!(startDate || endDate || (typeFilter && typeFilter !== "all") || customerName);
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const pageWithdrawals = data?.transactions.filter((t) => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0) ?? 0;
  const pageDeposits = data?.transactions.filter((t) => t.type === "deposit").reduce((s, t) => s + t.amount, 0) ?? 0;

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <p style={{ fontSize: 12, color: "#94a3b8" }}>
          {total} transaction{total !== 1 ? "s" : ""}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5 h-8 text-xs"
          >
            <ListFilter size={13} />
            Filters
            {hasFilters && <span className="w-1.5 h-1.5 bg-primary rounded-full" />}
          </Button>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground h-8 text-xs">
              <X size={12} />Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div
          className="bg-white rounded-2xl p-4"
          style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.07)", border: "1px solid rgba(11,44,96,0.08)" }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">From Date</Label>
              <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To Date</Label>
              <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Customer Name</Label>
              <div style={{ position: "relative" }}>
                <AutocompleteInput
                  value={customerName}
                  onChange={(val) => { setCustomerName(val); setPage(1); }}
                  suggestions={allTabCustomerNames}
                  placeholder="Search name…"
                  className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page summary strip */}
      {data && data.transactions.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Withdrawals (this page)", value: pageWithdrawals, accent: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "#e11d48", Icon: TrendingDown },
            { label: "Deposits (this page)", value: pageDeposits, accent: "linear-gradient(135deg, #10b981, #059669)", color: "#059669", Icon: TrendingUp },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-xl overflow-hidden"
              style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.07)" }}
            >
              <div style={{ height: 3, background: item.accent }} />
              <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <item.Icon size={13} style={{ color: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }} className="truncate">{item.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: item.color, flexShrink: 0 }}>₹{fmt(item.value)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction list */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 2px 14px rgba(11,44,96,0.08)" }}
      >
        {isLoading ? (
          <LedgerSkeleton />
        ) : !data || data.transactions.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <div style={{
              width: 52, height: 52, borderRadius: 15,
              background: "rgba(11,44,96,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Fingerprint size={24} style={{ color: "#0b2c60", opacity: 0.35 }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#0b2c60" }}>
                {hasFilters ? "No transactions match the filters" : "No AePS transactions yet"}
              </p>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                {hasFilters ? "Try adjusting or clearing the filters" : "Open a daily session and record withdrawals/deposits"}
              </p>
            </div>
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs h-8">Clear Filters</Button>
            )}
          </div>
        ) : (
          <div>
            {data.transactions.map((tx) => {
              const isWd = tx.type === "withdrawal";
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/80 transition-colors"
                  style={{ borderBottom: "1px solid rgba(11,44,96,0.05)" }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div style={{
                      width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                      background: isWd
                        ? "linear-gradient(135deg, #f43f5e, #e11d48)"
                        : "linear-gradient(135deg, #10b981, #059669)",
                      boxShadow: isWd
                        ? "0 3px 8px rgba(244,63,94,0.28)"
                        : "0 3px 8px rgba(16,185,129,0.28)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isWd
                        ? <ArrowDownLeft size={15} color="#fff" />
                        : <ArrowUpRight size={15} color="#fff" />}
                    </div>
                    <div className="min-w-0">
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0b2c60" }} className="truncate max-w-[140px] sm:max-w-none">
                        {tx.customerName}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <span style={{
                          fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "2px 5px",
                          color: isWd ? "#e11d48" : "#059669",
                          background: isWd ? "rgba(244,63,94,0.09)" : "rgba(16,185,129,0.09)",
                        }}>
                          {isWd ? "Withdrawal" : "Deposit"}
                        </span>
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>
                          {new Date(tx.date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </span>
                        {tx.description && (
                          <span style={{ fontSize: 10, color: "#94a3b8" }} className="hidden sm:inline truncate max-w-[100px]">
                            {tx.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <p style={{ fontSize: 13, fontWeight: 800, color: isWd ? "#e11d48" : "#059669", marginRight: 4 }}>
                      {isWd ? "−" : "+"}₹{fmt(tx.amount)}
                    </p>
                    <button
                      type="button"
                      title="View Receipt"
                      onClick={() => setReceiptTx(tx)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
                      style={{ color: "#94a3b8" }}
                    >
                      <Receipt size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditDialog(tx)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
                      style={{ color: "#94a3b8" }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingTx(tx)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                      style={{ color: "#e11d48" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid rgba(11,44,96,0.07)" }}>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                  Page {page} of {totalPages} · {total} total
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft size={12} />Prev
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                    Next<ChevronRight size={12} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <EditTransactionDialog
        open={!!editingTx}
        onOpenChange={(open) => { if (!open) setEditingTx(null); }}
        editForm={editForm}
        editCustomerName={editCustomerName}
        suggestions={allTabCustomerNames}
        onSubmit={onEditSubmit}
        isPending={editMut.isPending}
      />

      <DeleteTransactionDialog
        tx={deletingTx}
        onOpenChange={(open) => { if (!open) setDeletingTx(null); }}
        onConfirm={() => deletingTx && deleteMut.mutate(deletingTx.id)}
        isPending={deleteMut.isPending}
      />

      {/* ── AePS Receipt Modal ── */}
      <AepsReceiptModal
        open={receiptTx !== null}
        tx={receiptTx ? {
          id: receiptTx.id,
          type: receiptTx.type,
          amount: receiptTx.amount,
          customerName: receiptTx.customerName,
          description: receiptTx.description,
          balance: 0,
          createdAt: receiptTx.createdAt,
          date: receiptTx.date,
          receiptToken: receiptTx.receiptToken,
        } : null}
        onClose={() => setReceiptTx(null)}
        businessName={businessName}
        businessAddress={businessAddress}
        businessMobile={businessMobile}
        businessWebsite={businessWebsite}
      />
    </div>
  );
}

export default AllTransactionsTab;
