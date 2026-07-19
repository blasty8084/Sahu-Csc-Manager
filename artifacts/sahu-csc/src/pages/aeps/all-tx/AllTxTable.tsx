import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LedgerSkeleton } from "@/components/skeletons";
import { AepsReceiptModal } from "@/components/aeps-receipt-modal";
import {
  Trash2, ArrowDownLeft, ArrowUpRight, Pencil, ChevronLeft, ChevronRight,
  Receipt, Fingerprint,
} from "lucide-react";
import { apiFetch, fmt, type AllTx, type AllTxResponse } from "../aeps.constants";
import { EditTransactionDialog } from "../EditTransactionDialog";
import { DeleteTransactionDialog } from "../DeleteTransactionDialog";
import { AllTxSummaryStrip } from "./AllTxSummaryStrip";

interface AllTxTableProps {
  data: AllTxResponse | undefined;
  isLoading: boolean;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  total: number;
  totalPages: number;
  hasFilters: boolean;
  clearFilters: () => void;
  pageWithdrawals: number;
  pageDeposits: number;
  allTabCustomerNames: string[];
  businessName: string;
  businessAddress: string;
  businessMobile: string;
  businessWebsite: string;
}

/** Paginated transaction list with page summary strip, edit/delete/receipt actions, and their dialogs. */
export function AllTxTable({
  data, isLoading, page, setPage,
  total, totalPages, hasFilters, clearFilters,
  pageWithdrawals, pageDeposits,
  allTabCustomerNames,
  businessName, businessAddress, businessMobile, businessWebsite,
}: AllTxTableProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [editingTx, setEditingTx] = useState<AllTx | null>(null);
  const [deletingTx, setDeletingTx] = useState<AllTx | null>(null);
  const [receiptTx, setReceiptTx] = useState<AllTx | null>(null);

  const editForm = useForm({ defaultValues: { type: "withdrawal", amount: "", customerName: "", description: "" } });
  const editCustomerName = editForm.watch("customerName");

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

  return (
    <>
      {/* Page summary strip */}
      {data && data.transactions.length > 0 && (
        <AllTxSummaryStrip pageWithdrawals={pageWithdrawals} pageDeposits={pageDeposits} />
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
                      background: isWd ? "linear-gradient(135deg, #f43f5e, #e11d48)" : "linear-gradient(135deg, #10b981, #059669)",
                      boxShadow: isWd ? "0 3px 8px rgba(244,63,94,0.28)" : "0 3px 8px rgba(16,185,129,0.28)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isWd ? <ArrowDownLeft size={15} color="#fff" /> : <ArrowUpRight size={15} color="#fff" />}
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
                    <button type="button" title="View Receipt" onClick={() => setReceiptTx(tx)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
                      style={{ color: "#94a3b8" }}>
                      <Receipt size={13} />
                    </button>
                    <button type="button" onClick={() => openEditDialog(tx)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
                      style={{ color: "#94a3b8" }}>
                      <Pencil size={13} />
                    </button>
                    <button type="button" onClick={() => setDeletingTx(tx)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                      style={{ color: "#e11d48" }}>
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
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft size={12} />Prev
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
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

      <AepsReceiptModal
        open={receiptTx !== null}
        tx={receiptTx ? {
          id: receiptTx.id, type: receiptTx.type, amount: receiptTx.amount,
          customerName: receiptTx.customerName, description: receiptTx.description,
          balance: 0, createdAt: receiptTx.createdAt, date: receiptTx.date,
          receiptToken: receiptTx.receiptToken,
        } : null}
        onClose={() => setReceiptTx(null)}
        businessName={businessName}
        businessAddress={businessAddress}
        businessMobile={businessMobile}
        businessWebsite={businessWebsite}
      />
    </>
  );
}
