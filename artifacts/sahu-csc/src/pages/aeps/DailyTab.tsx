import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AepsSkeleton } from "@/components/skeletons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, ArrowDownLeft, ArrowUpRight, Wallet,
  ChevronLeft, ChevronRight,
  CalendarDays, TrendingDown, TrendingUp, IndianRupee,
  StickyNote, CheckCircle2, X,
} from "lucide-react";
import { AepsReceiptModal } from "@/components/aeps-receipt-modal";
import { useForm } from "react-hook-form";
import { useGetSettings } from "@workspace/api-client-react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useSync } from "@/hooks/use-sync";
import { addPendingAction, getAllPendingActions, type PendingAction } from "@/lib/offline-db";
import { syncEngine } from "@/lib/sync-engine";
import { apiFetch, fmt, todayStr, shiftDate, fmtDate, OPEN_QUICK_AMOUNTS, type AepsTx, type AepsSession, type AllTx, type AllTxResponse } from "./aeps.constants";
import { StatCard } from "./StatCard";
import { OpeningBalanceHeroCard } from "./OpeningBalanceHeroCard";
import { EditTransactionDialog } from "./EditTransactionDialog";
import { DeleteTransactionDialog } from "./DeleteTransactionDialog";
import { AepsWithdrawalForm } from "@/components/aeps/AepsWithdrawalForm";
import { AepsDepositForm } from "@/components/aeps/AepsDepositForm";
import { AepsTransactionTable } from "@/components/aeps/AepsTransactionTable";

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
      qc.setQueryData<AepsSession>(sessionKey, {
        id: -1, date: selectedDate, openingBalance: bal, notes: v.notes || null,
        transactions: [], totalWithdrawals: 0, totalDeposits: 0, currentBalance: bal,
      });
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

  // ── Export helpers ────────────────────────────────────────────────────────
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportLoading, setExportLoading] = useState<"pdf" | "wa" | null>(null);

  const shareAepsWhatsApp = () => {
    if (!session) return;
    setExportLoading("wa");
    const dateLabel = fmtDate(session.date);
    const lines: string[] = [
      `📊 *SAHU CSC — AePS Daily Summary*`,
      `📅 *Date:* ${dateLabel}`,
      ``,
      `💰 *Opening Balance:* ₹${fmt(session.openingBalance)}`,
      ``,
      `📋 *Transactions (${session.transactions.length}):*`,
    ];
    session.transactions.forEach((tx, i) => {
      const arrow = tx.type === "withdrawal" ? "↓" : "↑";
      const label = tx.type === "withdrawal" ? "Withdrawal" : "Deposit";
      lines.push(
        `${i + 1}. ${arrow} ${label} — ${tx.customerName}: ₹${fmt(tx.amount)} (Bal: ₹${fmt(tx.balance)})`
        + (tx.description ? ` [${tx.description}]` : "")
      );
    });
    lines.push(``);
    lines.push(`📊 *Summary:*`);
    lines.push(`↓ Total Withdrawals: ₹${fmt(session.totalWithdrawals)}`);
    lines.push(`↑ Total Deposits:    ₹${fmt(session.totalDeposits)}`);
    lines.push(``);
    lines.push(`${session.currentBalance < 0 ? "⚠️" : "✅"} *Closing Balance: ₹${fmt(session.currentBalance)}*`);
    lines.push(``);
    lines.push(`_Generated by SAHU CSC_`);
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    setShowExportMenu(false);
    setExportLoading(null);
  };

  const generateAepsPDF = async () => {
    if (!session) return;
    setExportLoading("pdf");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const margin = 18;
      const contentW = pageW - margin * 2;
      let y = 20;

      // Header
      doc.setFillColor(11, 44, 96);
      doc.rect(0, 0, pageW, 28, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("SAHU CSC", margin, 12);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("AePS Daily Summary Report", margin, 19);
      doc.setFontSize(9);
      doc.text(fmtDate(session.date), pageW - margin, 12, { align: "right" });
      y = 36;

      // Summary box
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, y, contentW, 28, 3, 3, "F");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("OPENING BALANCE", margin + 6, y + 8);
      doc.text("TOTAL WITHDRAWALS", margin + contentW / 3 + 3, y + 8);
      doc.text("TOTAL DEPOSITS", margin + (contentW * 2) / 3 + 3, y + 8);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(11, 44, 96);
      doc.text(`Rs.${fmt(session.openingBalance)}`, margin + 6, y + 20);
      doc.setTextColor(225, 29, 72);
      doc.text(`Rs.${fmt(session.totalWithdrawals)}`, margin + contentW / 3 + 3, y + 20);
      doc.setTextColor(5, 150, 105);
      doc.text(`Rs.${fmt(session.totalDeposits)}`, margin + (contentW * 2) / 3 + 3, y + 20);
      y += 36;

      // Transactions table header
      doc.setFillColor(11, 44, 96);
      doc.rect(margin, y, contentW, 8, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("#", margin + 2, y + 5.5);
      doc.text("Time", margin + 8, y + 5.5);
      doc.text("Customer", margin + 28, y + 5.5);
      doc.text("Type", margin + 90, y + 5.5);
      doc.text("Amount", margin + 118, y + 5.5);
      doc.text("Balance", margin + 148, y + 5.5);
      y += 8;

      session.transactions.forEach((tx, i) => {
        if (y > 260) { doc.addPage(); y = 20; }
        const isEven = i % 2 === 0;
        doc.setFillColor(isEven ? 248 : 255, isEven ? 250 : 255, isEven ? 252 : 255);
        doc.rect(margin, y, contentW, 8, "F");
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        const time = new Date(tx.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        doc.text(String(i + 1), margin + 2, y + 5.5);
        doc.text(time, margin + 8, y + 5.5);
        const nameShort = tx.customerName.length > 28 ? tx.customerName.slice(0, 26) + "…" : tx.customerName;
        doc.text(nameShort, margin + 28, y + 5.5);
        doc.setTextColor(tx.type === "withdrawal" ? 225 : 5, tx.type === "withdrawal" ? 29 : 150, tx.type === "withdrawal" ? 72 : 105);
        doc.text(tx.type === "withdrawal" ? "Withdrawal" : "Deposit", margin + 90, y + 5.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`Rs.${fmt(tx.amount)}`, margin + 118, y + 5.5);
        doc.text(`Rs.${fmt(tx.balance)}`, margin + 148, y + 5.5);
        y += 8;
      });

      // Closing balance footer
      y += 4;
      const closingColor = session.currentBalance < 0 ? [225, 29, 72] : [5, 150, 105];
      doc.setFillColor(...(closingColor as [number, number, number]));
      doc.rect(margin, y, contentW, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("CLOSING BALANCE", margin + 4, y + 7);
      doc.text(`Rs.${fmt(session.currentBalance)}`, pageW - margin - 4, y + 7, { align: "right" });

      const fileName = `AePS-Summary-${session.date}.pdf`;
      doc.save(fileName);
      toast({ title: "PDF downloaded", description: fileName });
      setShowExportMenu(false);
    } catch (err) {
      toast({ title: "Failed to generate PDF", variant: "destructive" });
    } finally {
      setExportLoading(null);
    }
  };

  // Shared confirm-save handler for both mobile and desktop transaction forms
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

      {/* ── Open / Edit Day: Mobile Dialog ── */}
      {isMobile && (
        <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
          <DialogContent className="p-0 overflow-hidden gap-0 max-w-sm">
            <div style={{ background: "linear-gradient(135deg,#0b2c60 0%,#1a4a9e 100%)" }}>
              <div style={{ height: 3, background: "linear-gradient(90deg,#f97316,#fb923c)" }} />
              <div className="px-5 py-4 flex items-center gap-3">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(249,115,22,0.20)", border: "1px solid rgba(249,115,22,0.30)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Wallet size={20} color="#f97316" />
                </div>
                <div>
                  <DialogTitle className="text-white text-base font-black m-0 p-0">
                    {session ? "Edit Opening Balance" : "Set Day Opening Balance"}
                  </DialogTitle>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{fmtDate(selectedDate)}</p>
                </div>
              </div>
            </div>
            <form onSubmit={onOpenSubmit} className="px-5 py-4 space-y-4">
              <div className="space-y-2">
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em" }}>Cash Amount (₹) *</label>
                <div className="relative">
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 20, fontWeight: 900, color: "#94a3b8" }}>₹</span>
                  <input type="number" min={0} step={0.01} placeholder="0" autoFocus {...openForm.register("openingBalance", { required: true })}
                    style={{ width: "100%", height: 60, paddingLeft: 36, paddingRight: 14, borderRadius: 14, border: "2px solid #e2e8f0", fontSize: 28, fontWeight: 900, color: "#0b2c60", outline: "none", boxSizing: "border-box", background: "#fafbff", transition: "border-color 0.15s" }}
                    onFocus={e => (e.target.style.borderColor = "#0b2c60")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {OPEN_QUICK_AMOUNTS.map(v => (
                    <button key={v} type="button" onClick={() => openForm.setValue("openingBalance", String(v))}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: "rgba(11,44,96,0.07)", color: "#0b2c60", border: "1px solid rgba(11,44,96,0.10)" }}>
                      ₹{v >= 1000 ? (v / 1000) + "K" : v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em" }}>Note <span style={{ fontWeight: 400, textTransform: "none", fontSize: 11, color: "#94a3b8" }}>(optional)</span></label>
                <div className="relative">
                  <StickyNote size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <Input placeholder="e.g. Loaded from SBI BC account" className="pl-9" {...openForm.register("notes")} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" type="button" className="flex-none" onClick={() => setShowOpenDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={openMut.isPending} className="flex-1 gap-2" style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", color: "#fff" }}>
                  {openMut.isPending ? "Saving…" : <><CheckCircle2 size={15} /> {session ? "Save Changes" : "Open Day"}</>}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Open / Edit Day: Desktop V2 Split Layout ── */}
      {!isMobile && showOpenDialog && (
        <>
          <div onClick={() => setShowOpenDialog(false)} style={{ position: "fixed", inset: 0, background: "rgba(11,44,96,0.40)", backdropFilter: "blur(4px)", zIndex: 49 }} />
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>

            {/* LEFT INFO PANEL */}
            <div style={{ width: 380, flexShrink: 0, background: "linear-gradient(160deg,#0b2c60 0%,#0f3872 55%,#1a4a9e 100%)", display: "flex", flexDirection: "column", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(249,115,22,0.12)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, position: "relative" }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#f97316,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(249,115,22,0.40)" }}>
                  <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
                </div>
                <div><span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>SAHU </span><span style={{ color: "#f97316", fontWeight: 900, fontSize: 16 }}>CSC</span></div>
              </div>
              <div style={{ position: "relative", marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(249,115,22,0.20)", border: "2px solid rgba(249,115,22,0.35)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <Wallet size={30} color="#f97316" />
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 8, padding: "4px 10px", marginBottom: 10 }}>
                  <span style={{ color: "#f97316", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>AePS Cash Management</span>
                </div>
                <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, lineHeight: 1.2, marginBottom: 8 }}>
                  {session ? "Edit Opening Balance" : "Set Opening Balance"}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 13, lineHeight: 1.7 }}>
                  {session
                    ? "Update the cash float you loaded at the start of this session."
                    : "Enter the cash amount you have loaded for today's AePS operations."}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto", position: "relative" }}>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>
                  Session · {fmtDate(selectedDate).split(",")[0]}
                </p>
                {session ? (
                  <>
                    {[
                      { label: "Current Balance", value: `₹${fmt(session.currentBalance)}`, color: "#f97316" },
                      { label: "Opening Balance", value: `₹${fmt(session.openingBalance)}`, color: "#94a3b8" },
                      { label: "Transactions", value: String(session.transactions?.length ?? 0), color: "#10b981" },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "11px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 500 }}>{label}</span>
                        <span style={{ color, fontSize: 14, fontWeight: 800 }}>{value}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)", borderRadius: 14, padding: "16px 18px" }}>
                    <p style={{ color: "#f97316", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>No session yet for this date</p>
                    <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 1.6 }}>Opening the day allows you to record withdrawals and deposits against your cash float.</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT FORM PANEL */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8fafc" }}>
              <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0b2c60", margin: 0 }}>{session ? "Edit Opening Balance" : "Open New Day"}</h2>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>AePS · {fmtDate(selectedDate)}</p>
                </div>
                <button onClick={() => setShowOpenDialog(false)} style={{ width: 38, height: 38, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <X size={16} color="#64748b" />
                </button>
              </div>

              <form onSubmit={onOpenSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 620 }}>

                  {/* Amount hero */}
                  <div style={{ background: "linear-gradient(135deg,rgba(11,44,96,0.05),rgba(26,74,158,0.03))", border: "2px solid rgba(11,44,96,0.14)", borderRadius: 20, padding: "20px 24px" }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#0b2c60", textTransform: "uppercase" as const, letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>Opening Cash Amount (₹) *</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 15, background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(11,44,96,0.30)" }}>
                        <Wallet size={22} color="#fff" />
                      </div>
                      <input type="number" min={0} step={0.01} placeholder="0" autoFocus
                        {...openForm.register("openingBalance", { required: true })}
                        style={{ flex: 1, fontSize: 38, fontWeight: 900, color: "#0b2c60", background: "transparent", border: "none", outline: "none", letterSpacing: "-0.02em" }}
                        onFocus={e => (e.target.style.color = "#0b2c60")} />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {OPEN_QUICK_AMOUNTS.map(v => (
                        <button key={v} type="button" onClick={() => openForm.setValue("openingBalance", String(v))}
                          style={{ padding: "7px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, background: openForm.watch("openingBalance") === String(v) ? "linear-gradient(135deg,#0b2c60,#1a4a9e)" : "#f1f5f9", color: openForm.watch("openingBalance") === String(v) ? "#fff" : "#64748b", border: "none", cursor: "pointer", transition: "all 0.15s" }}>
                          ₹{v >= 1000 ? (v / 1000) + "K" : v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Note <span style={{ fontWeight: 400, textTransform: "none" as const, color: "#94a3b8" }}>(optional)</span></label>
                    <div style={{ position: "relative" }}>
                      <StickyNote size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                      <input placeholder="e.g. Loaded from SBI BC account" {...openForm.register("notes")}
                        style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                        onFocus={e => (e.target.style.borderColor = "#0b2c60")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                    </div>
                  </div>

                  {/* Info card */}
                  <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Wallet size={14} color="#2563eb" />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", marginBottom: 2 }}>Cash Float</p>
                      <p style={{ fontSize: 12, color: "#3b82f6", lineHeight: 1.6 }}>This is the cash you have available for AePS transactions. Each withdrawal reduces this amount, each deposit increases it.</p>
                    </div>
                  </div>
                </div>

                <div style={{ padding: "20px 40px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 14 }}>
                  <button type="button" onClick={() => setShowOpenDialog(false)} style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
                  <button type="submit" disabled={openMut.isPending} style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(11,44,96,0.30)", opacity: openMut.isPending ? 0.7 : 1 }}>
                    <CheckCircle2 size={18} />
                    {openMut.isPending ? "Saving…" : session ? "Save Changes" : "Open Day"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

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
