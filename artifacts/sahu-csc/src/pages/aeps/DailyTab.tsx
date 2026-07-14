import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AepsSkeleton } from "@/components/skeletons";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, ArrowDownLeft, ArrowUpRight, Wallet,
  ChevronLeft, ChevronRight,
  CalendarDays, TrendingDown, TrendingUp, IndianRupee,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { AepsReceiptModal } from "@/components/aeps-receipt-modal";
import { useForm } from "react-hook-form";
import { useGetSettings } from "@workspace/api-client-react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useSync } from "@/hooks/use-sync";
import { addPendingAction, getAllPendingActions, type PendingAction } from "@/lib/offline-db";
import { syncEngine } from "@/lib/sync-engine";
import { apiFetch, todayStr, shiftDate, fmtDate, type AepsTx, type AepsSession, type AllTx, type AllTxResponse } from "./aeps.constants";
import { StatCard } from "./StatCard";
import { OpeningBalanceHeroCard } from "./OpeningBalanceHeroCard";
import { EditTransactionDialog } from "./EditTransactionDialog";
import { DeleteTransactionDialog } from "./DeleteTransactionDialog";
import { AepsWithdrawalForm } from "@/components/aeps/AepsWithdrawalForm";
import { AepsDepositForm } from "@/components/aeps/AepsDepositForm";
import { AepsTransactionTable } from "@/components/aeps/AepsTransactionTable";
import { OpenDayDialog } from "@/components/aeps/OpenDayDialog";
import { useAepsExport } from "@/hooks/useAepsExport";

// ─────────────────────────────────────────────────────────
// Daily Tab
// ─────────────────────────────────────────────────────────
export function DailyTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: bizSettings } = useGetSettings();
  const businessName = (bizSettings as any)?.businessName ?? "SAHU CSC";
  const businessAddress = (bizSettings as any)?.businessAddress ?? "";
  const businessMobile = (bizSettings as any)?.businessMobile ?? "";
  const businessWebsite = (bizSettings as any)?.businessWebsite ?? "";

  const isMobile = useIsMobile();
  const { isOffline } = useNetworkStatus();
  const { bgSyncCount } = useSync();
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showTxDialog, setShowTxDialog] = useState(false);
  const [txType, setTxType] = useState<"withdrawal" | "deposit">("withdrawal");
  const [editingTx, setEditingTx] = useState<AepsTx | null>(null);
  const [deletingTx, setDeletingTx] = useState<AepsTx | null>(null);
  const [receiptTx, setReceiptTx] = useState<AepsTx | null>(null);
  const [txStep, setTxStep] = useState<"form" | "confirm" | "success">("form");
  const [txAadhaar, setTxAadhaar] = useState("");
  const [txShowAadhaar, setTxShowAadhaar] = useState(false);
  const [txBankName, setTxBankName] = useState("");
  const [txAccountNo, setTxAccountNo] = useState("");
  const [txNote, setTxNote] = useState("");

  const sessionKey = ["aeps-session", selectedDate];
  const isToday = selectedDate === todayStr();

  const refreshPendingActions = async () => {
    try {
      const actions = await getAllPendingActions("aeps");
      setPendingActions(actions.filter((a) => a.body?.date === selectedDate).sort((a, b) => a.createdAt - b.createdAt));
    } catch {}
  };

  useEffect(() => {
    refreshPendingActions();
    const handler = () => refreshPendingActions();
    window.addEventListener("sahu-sync-complete", handler);
    window.addEventListener("online", handler);
    return () => {
      window.removeEventListener("sahu-sync-complete", handler);
      window.removeEventListener("online", handler);
    };
  }, [selectedDate]);

  const { data: session, isLoading } = useQuery<AepsSession>({
    queryKey: sessionKey,
    queryFn: () => apiFetch(`/api/aeps/session?date=${selectedDate}`),
  });

  const { data: aepsNamesData } = useQuery<AllTxResponse>({
    queryKey: ["aeps-customer-names"],
    queryFn: () => apiFetch(`/api/aeps/transactions?limit=500`),
    staleTime: 5 * 60 * 1000,
  });

  const aepsCustomerNames = useMemo(() => {
    const names = new Set<string>();
    session?.transactions?.forEach((t: AepsTx) => { if (t.customerName) names.add(t.customerName); });
    aepsNamesData?.transactions?.forEach((t: AllTx) => { if (t.customerName) names.add(t.customerName); });
    return Array.from(names).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [session, aepsNamesData]);

  const aepsFrequentCustomers = useMemo(() => {
    const freq: Record<string, number> = {};
    aepsNamesData?.transactions?.forEach((t: AllTx) => { if (t.customerName) freq[t.customerName] = (freq[t.customerName] || 0) + 1; });
    session?.transactions?.forEach((t: AepsTx) => { if (t.customerName) freq[t.customerName] = (freq[t.customerName] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name]) => name);
  }, [aepsNamesData, session]);

  const openForm = useForm({ defaultValues: { openingBalance: "", notes: "" } });
  const txForm = useForm({ defaultValues: { amount: "", customerName: "", description: "" } });
  const editForm = useForm({ defaultValues: { type: "withdrawal", amount: "", customerName: "", description: "" } });
  const editCustomerName = editForm.watch("customerName");

  const openMut = useMutation({
    mutationFn: (data: { openingBalance: number; notes?: string }) =>
      apiFetch("/api/aeps/session", { method: "POST", body: JSON.stringify({ date: selectedDate, ...data }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKey });
      setShowOpenDialog(false);
      openForm.reset();
      toast({ title: t("aeps.toast_day_opened") });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const txMut = useMutation({
    mutationFn: (data: { type: string; amount: number; customerName: string; description?: string }) =>
      apiFetch("/api/aeps/transaction", { method: "POST", body: JSON.stringify({ date: selectedDate, ...data }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKey });
      qc.invalidateQueries({ queryKey: ["aeps-all-tx"] });
      setTxStep("success");
    },
    onError: (e: Error) => { toast({ title: e.message, variant: "destructive" }); setTxStep("confirm"); },
  });

  const editMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      apiFetch(`/api/aeps/transaction/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKey });
      qc.invalidateQueries({ queryKey: ["aeps-all-tx"] });
      setEditingTx(null);
      toast({ title: t("aeps.toast_updated") });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/aeps/transaction/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKey });
      qc.invalidateQueries({ queryKey: ["aeps-all-tx"] });
      setDeletingTx(null);
      toast({ title: "Transaction deleted" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const onOpenSubmit = openForm.handleSubmit(async (v) => {
    const bal = parseFloat(v.openingBalance);
    if (isNaN(bal) || bal < 0) { toast({ title: "Enter a valid opening balance", variant: "destructive" }); return; }
    if (isOffline) {
      await addPendingAction({
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        domain: "aeps",
        label: `Open day ₹${bal} — ${selectedDate}`,
        endpoint: "/api/aeps/session",
        method: "POST",
        body: { date: selectedDate, openingBalance: bal, notes: v.notes || undefined },
        createdAt: Date.now(),
        retryCount: 0,
      });
      await syncEngine.markPendingAdded();
      await refreshPendingActions();
      qc.setQueryData<AepsSession>(sessionKey, () => ({
        id: -1, date: selectedDate, openingBalance: bal, notes: v.notes || null,
        transactions: [], totalWithdrawals: 0, totalDeposits: 0, currentBalance: bal,
      }));
      setShowOpenDialog(false);
      openForm.reset();
      toast({ title: "Saved offline — will open when reconnected" });
      return;
    }
    openMut.mutate({ openingBalance: bal, notes: v.notes || undefined });
  });

  const onTxSubmit = txForm.handleSubmit(async (v) => {
    const amt = parseFloat(v.amount);
    if (isNaN(amt) || amt <= 0) { toast({ title: "Enter a valid amount", variant: "destructive" }); return; }
    if (isOffline) {
      if (!session) { toast({ title: "Open the day before adding transactions", variant: "destructive" }); return; }
      await addPendingAction({
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        domain: "aeps",
        label: `${txType === "withdrawal" ? "Withdrawal" : "Deposit"} ₹${amt} — ${v.customerName}`,
        endpoint: "/api/aeps/transaction",
        method: "POST",
        body: { date: selectedDate, type: txType, amount: amt, customerName: v.customerName, description: v.description || undefined },
        createdAt: Date.now(),
        retryCount: 0,
      });
      await syncEngine.markPendingAdded();
      await refreshPendingActions();
      qc.setQueryData<AepsSession>(sessionKey, (prev) => {
        if (!prev) return prev;
        const delta = txType === "withdrawal" ? -amt : amt;
        const syntheticTx: AepsTx = {
          id: -Date.now(), type: txType, amount: amt, customerName: v.customerName,
          description: v.description || null, balance: prev.currentBalance + delta,
          createdAt: new Date().toISOString(),
        };
        return {
          ...prev,
          transactions: [...prev.transactions, syntheticTx],
          totalWithdrawals: prev.totalWithdrawals + (txType === "withdrawal" ? amt : 0),
          totalDeposits: prev.totalDeposits + (txType === "deposit" ? amt : 0),
          currentBalance: prev.currentBalance + delta,
        };
      });
      setTxStep("success");
      return;
    }
    txMut.mutate({ type: txType, amount: amt, customerName: v.customerName, description: v.description || undefined });
  });

  const openEditDialog = (tx: AepsTx) => {
    setEditingTx(tx);
    editForm.reset({ type: tx.type, amount: String(tx.amount), customerName: tx.customerName, description: tx.description ?? "" });
  };

  const onEditSubmit = editForm.handleSubmit((v) => {
    if (!editingTx) return;
    if (editingTx.id < 0) { toast({ title: "This entry is still pending sync — try again once it uploads", variant: "destructive" }); return; }
    if (isOffline) { toast({ title: "Editing requires a connection — try again once you're back online", variant: "destructive" }); return; }
    const amt = parseFloat(v.amount);
    if (isNaN(amt) || amt <= 0) { toast({ title: "Enter a valid amount", variant: "destructive" }); return; }
    editMut.mutate({ id: editingTx.id, data: { type: v.type, amount: amt, customerName: v.customerName, description: v.description || undefined } });
  });

  const resetTxForm = () => {
    txForm.reset();
    setTxStep("form");
    setTxAadhaar("");
    setTxBankName("");
    setTxAccountNo("");
    setTxNote("");
    setTxShowAadhaar(false);
  };
  const openWithdrawal = () => { setTxType("withdrawal"); resetTxForm(); setShowTxDialog(true); };
  const openDeposit = () => { setTxType("deposit"); resetTxForm(); setShowTxDialog(true); };

  // ── Export helpers (PDF + WhatsApp) ───────────────────────────────────────
  const { showExportMenu, setShowExportMenu, exportLoading, generateAepsPDF, shareAepsWhatsApp } = useAepsExport(session);

  // ── Shared confirm-save + dialog handlers ─────────────────────────────────
  const handleConfirmSave = ({ type, amount, customerName, description }: { type: string; amount: number; customerName: string; description: string }) => {
    txMut.mutate({ type, amount, customerName, description });
  };

  const handleNewTransaction = () => {
    const savedType = txType;
    resetTxForm();
    setTxType(savedType);
  };

  const handleCloseTxDialog = () => {
    resetTxForm();
    setShowTxDialog(false);
  };

  return (
    <div className="space-y-4">

      {/* ── Date Navigator ── */}
      <div
        className="bg-white rounded-2xl px-4 py-3 flex items-center gap-2"
        style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.07)" }}
      >
        <button
          type="button"
          onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100"
          style={{ color: "#0b2c60" }}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
          <CalendarDays size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-8 text-sm text-center border-0 shadow-none bg-transparent p-0 focus-visible:ring-0 w-36"
            style={{ color: "#0b2c60", fontWeight: 700 }}
          />
          {isToday && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(249,115,22,0.12)", color: "#f97316" }}
            >
              TODAY
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
          disabled={selectedDate >= todayStr()}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: "#0b2c60" }}
        >
          <ChevronRight size={18} />
        </button>

        {!isToday && (
          <button
            type="button"
            onClick={() => setSelectedDate(todayStr())}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors"
            style={{ background: "rgba(11,44,96,0.07)", color: "#0b2c60" }}
          >
            Today
          </button>
        )}
      </div>

      {/* ── Loading ── */}
      {isLoading ? (
        <AepsSkeleton />
      ) : !session ? (
        /* ── No session ── */
        <div
          className="rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 2px 14px rgba(11,44,96,0.09)" }}
        >
          <div style={{ height: 4, background: "linear-gradient(90deg, #f59e0b, #fbbf24)" }} />
          <div className="bg-white px-6 py-10 flex flex-col items-center gap-4 text-center">
            <div
              style={{
                width: 64, height: 64, borderRadius: 18,
                background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                boxShadow: "0 6px 20px rgba(245,158,11,0.30)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Wallet size={30} color="#fff" />
            </div>
            <div>
              <p className="font-bold text-lg" style={{ color: "#0b2c60" }}>
                {isToday ? "Today's session not opened" : `No session for ${fmtDate(selectedDate)}`}
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Set the opening balance (cash loaded in hand) to start recording AePS transactions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowOpenDialog(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", boxShadow: "0 4px 14px rgba(11,44,96,0.35)" }}
            >
              <Plus size={16} /> Set Opening Balance
            </button>
          </div>
        </div>

      ) : (
        <div className="space-y-4">

          {/* ── Opening Balance Hero Card ── */}
          <OpeningBalanceHeroCard
            session={session}
            onEdit={() => {
              openForm.setValue("openingBalance", String(session.openingBalance));
              openForm.setValue("notes", session.notes ?? "");
              setShowOpenDialog(true);
            }}
          />

          {/* ── Summary Cards — Withdrawals / Deposits / Balance ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard
              label="Withdrawals" value={session.totalWithdrawals}
              accent="linear-gradient(135deg, #f43f5e, #e11d48)"
              color="#e11d48" icon={TrendingDown}
            />
            <StatCard
              label="Deposits" value={session.totalDeposits}
              accent="linear-gradient(135deg, #10b981, #059669)"
              color="#059669" icon={TrendingUp}
            />
            <StatCard
              label="Current Balance" value={session.currentBalance}
              accent={session.currentBalance < 0
                ? "linear-gradient(135deg, #f43f5e, #e11d48)"
                : "linear-gradient(135deg, #10b981, #059669)"}
              color={session.currentBalance < 0 ? "#e11d48" : "#059669"}
              icon={IndianRupee}
              wide
            />
          </div>

          {/* ── Action Buttons ── */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={openWithdrawal}
              className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg, #f43f5e, #e11d48)",
                boxShadow: "0 4px 16px rgba(244,63,94,0.35)",
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)" }}>
                <ArrowDownLeft size={22} />
              </div>
              <span className="text-sm">AePS Withdrawal</span>
            </button>

            <button
              type="button"
              onClick={openDeposit}
              className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 4px 16px rgba(16,185,129,0.35)",
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)" }}>
                <ArrowUpRight size={22} />
              </div>
              <span className="text-sm">AePS Deposit</span>
            </button>
          </div>

          {/* ── Transaction List + Export ── */}
          <AepsTransactionTable
            session={session}
            showExportMenu={showExportMenu}
            exportLoading={exportLoading}
            onSetShowExportMenu={setShowExportMenu}
            onViewReceipt={setReceiptTx}
            onEdit={openEditDialog}
            onDelete={setDeletingTx}
            onGeneratePDF={generateAepsPDF}
            onShareWhatsApp={shareAepsWhatsApp}
          />
        </div>
      )}

      {/* ── Open / Edit Day Dialog (mobile + desktop) ── */}
      <OpenDayDialog
        open={showOpenDialog}
        onClose={() => setShowOpenDialog(false)}
        isMobile={isMobile}
        session={session}
        selectedDate={selectedDate}
        openForm={openForm}
        onSubmit={onOpenSubmit}
        isPending={openMut.isPending}
      />

      {/* ── Add Transaction: Mobile Dialog (3-step) ── */}
      {isMobile && (
        <AepsWithdrawalForm
          open={showTxDialog}
          txType={txType}
          txStep={txStep}
          txAadhaar={txAadhaar}
          txShowAadhaar={txShowAadhaar}
          txBankName={txBankName}
          txAccountNo={txAccountNo}
          txNote={txNote}
          session={session}
          txForm={txForm}
          aepsCustomerNames={aepsCustomerNames}
          aepsFrequentCustomers={aepsFrequentCustomers}
          isMutPending={txMut.isPending}
          onClose={handleCloseTxDialog}
          onSetTxType={setTxType}
          onSetTxStep={setTxStep}
          onSetTxAadhaar={setTxAadhaar}
          onSetTxShowAadhaar={setTxShowAadhaar}
          onSetTxBankName={setTxBankName}
          onSetTxAccountNo={setTxAccountNo}
          onSetTxNote={setTxNote}
          onConfirmSave={handleConfirmSave}
          onNewTransaction={handleNewTransaction}
        />
      )}

      {/* ── Add Transaction: Desktop Panel (3-step) ── */}
      {!isMobile && showTxDialog && (
        <AepsDepositForm
          txType={txType}
          txStep={txStep}
          txAadhaar={txAadhaar}
          txShowAadhaar={txShowAadhaar}
          txBankName={txBankName}
          txAccountNo={txAccountNo}
          txNote={txNote}
          session={session}
          txForm={txForm}
          aepsCustomerNames={aepsCustomerNames}
          aepsFrequentCustomers={aepsFrequentCustomers}
          isMutPending={txMut.isPending}
          onClose={handleCloseTxDialog}
          onSetTxType={setTxType}
          onSetTxStep={setTxStep}
          onSetTxAadhaar={setTxAadhaar}
          onSetTxShowAadhaar={setTxShowAadhaar}
          onSetTxBankName={setTxBankName}
          onSetTxAccountNo={setTxAccountNo}
          onSetTxNote={setTxNote}
          onConfirmSave={handleConfirmSave}
          onNewTransaction={handleNewTransaction}
        />
      )}

      <EditTransactionDialog
        open={!!editingTx}
        onOpenChange={(open) => { if (!open) setEditingTx(null); }}
        editForm={editForm}
        editCustomerName={editCustomerName}
        suggestions={aepsCustomerNames}
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
          balance: receiptTx.balance,
          createdAt: receiptTx.createdAt,
          date: selectedDate,
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

export default DailyTab;
