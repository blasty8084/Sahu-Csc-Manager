import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { useGetSettings } from "@workspace/api-client-react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useSync } from "@/hooks/use-sync";
import { addPendingAction, getAllPendingActions, type PendingAction } from "@/lib/offline-db";
import { syncEngine } from "@/lib/sync-engine";
import { apiFetch, todayStr, type AepsTx, type AepsSession, type AllTx, type AllTxResponse } from "@/pages/aeps/aeps.constants";
import { useAepsExport } from "@/hooks/useAepsExport";

export function useDailyTab() {
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
  useSync();
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
    session?.transactions?.forEach((tx: AepsTx) => { if (tx.customerName) names.add(tx.customerName); });
    aepsNamesData?.transactions?.forEach((tx: AllTx) => { if (tx.customerName) names.add(tx.customerName); });
    return Array.from(names).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [session, aepsNamesData]);

  const aepsFrequentCustomers = useMemo(() => {
    const freq: Record<string, number> = {};
    aepsNamesData?.transactions?.forEach((tx: AllTx) => { if (tx.customerName) freq[tx.customerName] = (freq[tx.customerName] || 0) + 1; });
    session?.transactions?.forEach((tx: AepsTx) => { if (tx.customerName) freq[tx.customerName] = (freq[tx.customerName] || 0) + 1; });
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
        domain: "aeps", label: `Open day ₹${bal} — ${selectedDate}`,
        endpoint: "/api/aeps/session", method: "POST",
        body: { date: selectedDate, openingBalance: bal, notes: v.notes || undefined },
        createdAt: Date.now(), retryCount: 0,
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
        endpoint: "/api/aeps/transaction", method: "POST",
        body: { date: selectedDate, type: txType, amount: amt, customerName: v.customerName, description: v.description || undefined },
        createdAt: Date.now(), retryCount: 0,
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
    setTxAadhaar(""); setTxBankName(""); setTxAccountNo(""); setTxNote(""); setTxShowAadhaar(false);
  };
  const openWithdrawal = () => { setTxType("withdrawal"); resetTxForm(); setShowTxDialog(true); };
  const openDeposit = () => { setTxType("deposit"); resetTxForm(); setShowTxDialog(true); };
  const { showExportMenu, setShowExportMenu, exportLoading, generateAepsPDF, shareAepsWhatsApp } = useAepsExport(session);

  const handleConfirmSave = ({ type, amount, customerName, description }: { type: string; amount: number; customerName: string; description: string }) => {
    txMut.mutate({ type, amount, customerName, description });
  };
  const handleNewTransaction = () => { const saved = txType; resetTxForm(); setTxType(saved); };
  const handleCloseTxDialog = () => { resetTxForm(); setShowTxDialog(false); };

  return {
    t, isMobile, isOffline, pendingActions, selectedDate, setSelectedDate, isToday,
    showOpenDialog, setShowOpenDialog, showTxDialog, setShowTxDialog,
    txType, setTxType, editingTx, setEditingTx, deletingTx, setDeletingTx,
    receiptTx, setReceiptTx, txStep, setTxStep,
    txAadhaar, setTxAadhaar, txShowAadhaar, setTxShowAadhaar,
    txBankName, setTxBankName, txAccountNo, setTxAccountNo, txNote, setTxNote,
    session, isLoading, aepsCustomerNames, aepsFrequentCustomers,
    openForm, txForm, editForm, editCustomerName,
    openMut, txMut, editMut, deleteMut,
    onOpenSubmit, onTxSubmit, openEditDialog, onEditSubmit,
    openWithdrawal, openDeposit,
    showExportMenu, setShowExportMenu, exportLoading, generateAepsPDF, shareAepsWhatsApp,
    handleConfirmSave, handleNewTransaction, handleCloseTxDialog,
    businessName, businessAddress, businessMobile, businessWebsite,
  };
}

export type UseDailyTabReturn = ReturnType<typeof useDailyTab>;
