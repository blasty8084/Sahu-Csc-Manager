import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { SectionLoader } from "@/components/section-loader";
import { AepsSkeleton, LedgerSkeleton } from "@/components/skeletons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Fingerprint, Plus, Trash2, ArrowDownLeft, ArrowUpRight, Wallet,
  Pencil, ChevronLeft, ChevronRight, Filter, X, Receipt,
  CalendarDays, TrendingDown, TrendingUp, IndianRupee, ListFilter,
  StickyNote, CheckCircle2, User, Building2, Hash, FileText, Eye, EyeOff, AlertCircle,
  Share2, Download, MessageCircle,
} from "lucide-react";
import { AepsReceiptModal } from "@/components/aeps-receipt-modal";
import { AutocompleteInput } from "@/components/autocomplete-input";
import { useForm } from "react-hook-form";
import { useGetSettings } from "@workspace/api-client-react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useSync } from "@/hooks/use-sync";
import { addPendingAction, getAllPendingActions, type PendingAction } from "@/lib/offline-db";
import { syncEngine } from "@/lib/sync-engine";
import { WifiOff, Clock } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });
}

type AepsTx = {
  id: number;
  type: "withdrawal" | "deposit";
  amount: number;
  customerName: string;
  description: string | null;
  balance: number;
  createdAt: string;
  receiptToken?: string | null;
};

type AepsSession = {
  id: number;
  date: string;
  openingBalance: number;
  notes: string | null;
  transactions: AepsTx[];
  totalWithdrawals: number;
  totalDeposits: number;
  currentBalance: number;
} | null;

type AllTx = {
  id: number;
  date: string;
  type: "withdrawal" | "deposit";
  amount: number;
  customerName: string;
  description: string | null;
  createdAt: string;
  receiptToken?: string | null;
};

type AllTxResponse = {
  transactions: AllTx[];
  total: number;
  page: number;
  limit: number;
};

// ─────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────
function StatCard({
  label, value, accent, color, icon: Icon, wide = false,
}: {
  label: string; value: number; accent: string; color: string;
  icon: React.ElementType; wide?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden ${wide ? "col-span-2 sm:col-span-1" : ""}`}
      style={{ boxShadow: "0 2px 14px rgba(11,44,96,0.09), 0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div style={{ height: 3, background: accent }} />
      <div className="px-4 py-3.5 flex items-center gap-3">
        <div
          style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: accent, boxShadow: `0 4px 10px ${color}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Icon size={17} color="#fff" />
        </div>
        <div className="min-w-0">
          <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
            {label}
          </p>
          <p style={{ fontSize: 18, fontWeight: 900, color, lineHeight: 1.1 }}>
            ₹{fmt(value)}
          </p>
        </div>
      </div>
    </div>
  );
}

const OPEN_QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000, 50000];

const AEPS_BANKS = [
  "State Bank of India (SBI)", "Punjab National Bank (PNB)", "Bank of India (BOI)",
  "Bank of Baroda (BOB)", "Canara Bank", "Union Bank of India",
  "Central Bank of India", "Indian Bank", "UCO Bank", "Post Office (IPPB)",
];
const AEPS_QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

function maskAadhaar(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 12);
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 4) groups.push(digits.slice(i, i + 4));
  return groups.join(" ");
}

// ─────────────────────────────────────────────────────────
// Opening Balance Hero Card
// ─────────────────────────────────────────────────────────
function OpeningBalanceHeroCard({
  session, onEdit,
}: {
  session: NonNullable<AepsSession>;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg,#0b2c60 0%,#0f3872 55%,#1a4a9e 100%)",
        boxShadow: "0 8px 28px rgba(11,44,96,0.28), 0 2px 8px rgba(11,44,96,0.14)",
      }}
    >
      <div style={{ height: 3, background: "linear-gradient(90deg,#f97316,#fb923c,#fde68a)" }} />
      <div className="px-5 py-4">
        {/* Label + edit button */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: "rgba(249,115,22,0.20)", border: "1px solid rgba(249,115,22,0.30)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Wallet size={14} color="#f97316" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.70)", textTransform: "uppercase", letterSpacing: "0.09em" }}>
              {t("aeps.opening_balance")}
            </span>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all active:scale-95"
            style={{
              background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 700,
            }}
          >
            <Pencil size={11} /> {t("common.edit")}
          </button>
        </div>

        {/* Amount */}
        <div className="flex items-end gap-1.5 mb-3">
          <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.50)", marginBottom: 5 }}>₹</span>
          <span style={{ fontSize: 44, fontWeight: 900, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.03em" }}>
            {fmt(session.openingBalance)}
          </span>
        </div>

        {/* Notes pill */}
        {session.notes && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <StickyNote size={11} color="rgba(255,255,255,0.50)" />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.60)", fontStyle: "italic" }}>{session.notes}</span>
          </div>
        )}

        {/* Mini stats row */}
        <div className="flex gap-2">
          {[
            { label: t("common.date"), value: fmtDate(session.date).split(",")[0] },
            { label: t("aeps.active_session"), value: t("common.active") },
            { label: t("dashboard.txns"), value: String(session.transactions.length) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex-1 rounded-xl px-2 py-2 text-center"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.40)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
              <p style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Daily Tab
// ─────────────────────────────────────────────────────────
function DailyTab() {
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

          {/* ── Transaction List ── */}
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 2px 14px rgba(11,44,96,0.08), 0 1px 3px rgba(0,0,0,0.04)" }}
          >
            {/* List header */}
            <div
              className="flex items-center justify-between px-4 py-3.5"
              style={{ borderBottom: "1px solid rgba(11,44,96,0.07)" }}
            >
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60" }}>Transactions</p>
                <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>
                  {fmtDate(session.date)} · {session.transactions.length} {session.transactions.length === 1 ? "entry" : "entries"}
                </p>
              </div>
            </div>

            {session.transactions.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-3 text-center">
                <div
                  style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: "rgba(11,44,96,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Fingerprint size={22} style={{ color: "#0b2c60", opacity: 0.4 }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0b2c60" }}>No transactions yet</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Use the buttons above to record AePS activity</p>
                </div>
              </div>
            ) : (
              <div>
                {/* Opening row */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ background: "rgba(11,44,96,0.025)", borderBottom: "1px solid rgba(11,44,96,0.06)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                        background: "linear-gradient(135deg, #0b2c60, #1a4a9e)",
                        boxShadow: "0 3px 8px rgba(11,44,96,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 9, fontWeight: 900, letterSpacing: "0.06em",
                      }}
                    >
                      OB
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60" }}>Opening Balance</p>
                      {session.notes && <p style={{ fontSize: 10, color: "#94a3b8" }}>{session.notes}</p>}
                    </div>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#0b2c60" }}>₹{fmt(session.openingBalance)}</p>
                </div>

                {/* Transaction rows */}
                {session.transactions.map((tx, idx) => {
                  const isWd = tx.type === "withdrawal";
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50/80"
                      style={{ borderBottom: "1px solid rgba(11,44,96,0.05)" }}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          style={{
                            width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                            background: isWd
                              ? "linear-gradient(135deg, #f43f5e, #e11d48)"
                              : "linear-gradient(135deg, #10b981, #059669)",
                            boxShadow: isWd
                              ? "0 3px 8px rgba(244,63,94,0.30)"
                              : "0 3px 8px rgba(16,185,129,0.30)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          {isWd
                            ? <ArrowDownLeft size={15} color="#fff" />
                            : <ArrowUpRight size={15} color="#fff" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#0b2c60" }} className="truncate max-w-[130px] sm:max-w-none">
                              {tx.customerName}
                            </p>
                            <span style={{
                              fontSize: 9, fontWeight: 700, borderRadius: 5, padding: "2px 6px",
                              color: isWd ? "#e11d48" : "#059669",
                              background: isWd ? "rgba(244,63,94,0.10)" : "rgba(16,185,129,0.10)",
                            }}>
                              #{idx + 1} · {isWd ? "WD" : "DEP"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            {tx.description && (
                              <p style={{ fontSize: 10, color: "#94a3b8" }} className="truncate max-w-[120px]">{tx.description}</p>
                            )}
                            <p style={{ fontSize: 10, color: "#c4c9d4" }}>
                              {new Date(tx.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <div className="text-right mr-1">
                          <p style={{ fontSize: 13, fontWeight: 800, color: isWd ? "#e11d48" : "#059669" }}>
                            {isWd ? "−" : "+"}₹{fmt(tx.amount)}
                          </p>
                          <p style={{ fontSize: 10, fontWeight: 500, color: tx.balance < 0 ? "#e11d48" : "#94a3b8" }}>
                            ₹{fmt(tx.balance)}
                          </p>
                        </div>
                        <button
                          type="button"
                          title="View Receipt"
                          onClick={() => setReceiptTx(tx)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100"
                          style={{ color: "#94a3b8" }}
                        >
                          <Receipt size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditDialog(tx)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100"
                          style={{ color: "#94a3b8" }}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingTx(tx)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
                          style={{ color: "#e11d48" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Closing balance row */}
                <div
                  className="flex items-center justify-between px-4 py-3.5"
                  style={{
                    background: session.currentBalance < 0 ? "rgba(244,63,94,0.04)" : "rgba(16,185,129,0.05)",
                    borderTop: `1px solid ${session.currentBalance < 0 ? "rgba(244,63,94,0.12)" : "rgba(16,185,129,0.12)"}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: session.currentBalance < 0 ? "#e11d48" : "#059669",
                      }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0b2c60" }}>Closing Balance</span>
                  </div>
                  <span style={{
                    fontSize: 15, fontWeight: 900,
                    color: session.currentBalance < 0 ? "#e11d48" : "#059669",
                  }}>
                    ₹{fmt(session.currentBalance)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Export / Share row ── */}
          {session.transactions.length > 0 && (
            <div className="relative">
              <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between" style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.07)" }}>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "#0b2c60" }}>Daily Summary Export</p>
                  <p className="text-[11px] text-muted-foreground">{session.transactions.length} transaction{session.transactions.length !== 1 ? "s" : ""} · {fmtDate(session.date)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExportMenu((v) => !v)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
                  style={{ background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", boxShadow: "0 3px 10px rgba(11,44,96,0.28)" }}
                >
                  <Share2 size={13} />
                  Export
                </button>
              </div>

              {/* Dropdown menu */}
              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                  <div
                    className="absolute right-0 top-full mt-2 z-20 bg-white rounded-2xl overflow-hidden"
                    style={{ minWidth: 200, boxShadow: "0 8px 32px rgba(11,44,96,0.18), 0 2px 8px rgba(0,0,0,0.08)" }}
                  >
                    <div className="px-4 py-2.5 border-b" style={{ background: "rgba(11,44,96,0.03)" }}>
                      <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#94a3b8" }}>Export As</p>
                    </div>
                    <button
                      type="button"
                      onClick={generateAepsPDF}
                      disabled={exportLoading !== null}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #e11d48, #f43f5e)" }}>
                        <Download size={14} color="#fff" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#0b2c60" }}>{exportLoading === "pdf" ? "Generating…" : "Download PDF"}</p>
                        <p className="text-[11px] text-muted-foreground">Full transaction report</p>
                      </div>
                    </button>
                    <div className="border-t" />
                    <button
                      type="button"
                      onClick={shareAepsWhatsApp}
                      disabled={exportLoading !== null}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #25d366, #16a34a)" }}>
                        <MessageCircle size={14} color="#fff" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#0b2c60" }}>Share via WhatsApp</p>
                        <p className="text-[11px] text-muted-foreground">Pre-filled text summary</p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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
      {isMobile && <Dialog open={showTxDialog} onOpenChange={(open) => { if (!open) { resetTxForm(); setShowTxDialog(false); } }}>
        <DialogContent className="p-0 overflow-hidden gap-0 max-w-sm">
          {(() => {
            const txAmountVal = txForm.watch("amount");
            const txCustomerName = txForm.watch("customerName");
            const aadhaarDigits = txAadhaar.replace(/\D/g, "");
            const amtNum = parseFloat(txAmountVal);
            const isWd = txType === "withdrawal";
            const accent = isWd ? "linear-gradient(135deg,#f43f5e,#e11d48)" : "linear-gradient(135deg,#10b981,#059669)";
            const accentColor = isWd ? "#e11d48" : "#059669";
            const accentLight = isWd ? "rgba(244,63,94,0.07)" : "rgba(16,185,129,0.07)";
            const accentBorder = isWd ? "rgba(244,63,94,0.22)" : "rgba(16,185,129,0.22)";
            const isValidAmount = !isNaN(amtNum) && amtNum > 0;
            const isValidName = txCustomerName.trim().length >= 2;
            const isValidAadhaar = aadhaarDigits.length === 12;
            const isValidBank = txBankName.trim().length > 0;
            const isFormValid = isValidAmount && isValidName && isValidAadhaar && isValidBank;
            const displayAadhaar = txShowAadhaar
              ? maskAadhaar(txAadhaar)
              : aadhaarDigits.length > 0 ? "XXXX XXXX " + aadhaarDigits.slice(-4) : "";

            /* ── Success screen ── */
            if (txStep === "success") return (
              <>
                <div style={{ background: "linear-gradient(135deg,#0b2c60 0%,#1a4a9e 100%)" }}>
                  <div style={{ height: 3, background: accent }} />
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <button onClick={() => { resetTxForm(); setShowTxDialog(false); }}
                      style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <X size={15} color="#fff" />
                    </button>
                    <DialogTitle className="text-white text-sm font-black m-0 p-0">Transaction Complete</DialogTitle>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4 px-5 py-5">
                  <div style={{ width: 68, height: 68, borderRadius: 20, background: accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 24px ${accentColor}40` }}>
                    <CheckCircle2 size={34} color="#fff" />
                  </div>
                  <div className="text-center">
                    <p style={{ fontSize: 18, fontWeight: 900, color: "#0b2c60" }}>{isWd ? "Withdrawal" : "Deposit"} Recorded!</p>
                    <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>AePS transaction saved successfully</p>
                  </div>
                  <div className="w-full bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 4px 18px rgba(11,44,96,0.09)", border: "1px solid rgba(11,44,96,0.07)" }}>
                    <div style={{ height: 4, background: accent }} />
                    <div className="px-4 py-4 space-y-2">
                      <div className="text-center py-2 rounded-xl mb-1" style={{ background: accentLight, border: `1px solid ${accentBorder}` }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: "0.07em" }}>Amount {isWd ? "Withdrawn" : "Deposited"}</p>
                        <p style={{ fontSize: 26, fontWeight: 900, color: accentColor, lineHeight: 1.1, marginTop: 2 }}>₹{fmt(amtNum)}</p>
                      </div>
                      {[
                        { label: "Customer", value: txCustomerName },
                        { label: "Aadhaar", value: "XXXX XXXX " + aadhaarDigits.slice(-4) },
                        { label: "Bank", value: txBankName },
                        ...(txAccountNo ? [{ label: "Account No", value: "XX" + txAccountNo.slice(-4) }] : []),
                        ...(txNote ? [{ label: "Note", value: txNote }] : []),
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between gap-3 py-1.5" style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>{label}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#0b2c60", textAlign: "right" }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-full flex gap-2">
                    <button onClick={() => { const t = txType; resetTxForm(); setTxType(t); }}
                      className="flex-1 py-3 rounded-2xl font-bold text-sm"
                      style={{ border: `1.5px solid ${accentBorder}`, color: accentColor, background: accentLight }}>
                      + New {isWd ? "Withdrawal" : "Deposit"}
                    </button>
                    <button onClick={() => { resetTxForm(); setShowTxDialog(false); }}
                      className="flex-1 py-3 rounded-2xl font-bold text-sm text-white"
                      style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)" }}>
                      Done
                    </button>
                  </div>
                </div>
              </>
            );

            /* ── Confirm screen ── */
            if (txStep === "confirm") return (
              <>
                <div style={{ background: "linear-gradient(135deg,#0b2c60 0%,#1a4a9e 100%)" }}>
                  <div style={{ height: 3, background: accent }} />
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <button onClick={() => setTxStep("form")} style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ChevronLeft size={16} color="#fff" />
                    </button>
                    <div>
                      <DialogTitle className="text-white text-sm font-black m-0 p-0">Confirm Transaction</DialogTitle>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 1 }}>Review before saving</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-4 space-y-3">
                  <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 4px 14px rgba(11,44,96,0.09)" }}>
                    <div style={{ height: 4, background: accent }} />
                    <div className="bg-white px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {isWd ? <ArrowDownLeft size={13} color="#fff" /> : <ArrowUpRight size={13} color="#fff" />}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>AePS {isWd ? "Withdrawal" : "Deposit"}</span>
                      </div>
                      <p style={{ fontSize: 32, fontWeight: 900, color: accentColor, lineHeight: 1 }}>₹{fmt(amtNum)}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl px-4 py-3 space-y-2" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.07)", border: "1px solid rgba(11,44,96,0.06)" }}>
                    <p style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.09em" }}>Customer Details</p>
                    {[
                      { icon: User, label: "Customer", value: txCustomerName },
                      { icon: Fingerprint, label: "Aadhaar", value: "XXXX XXXX " + aadhaarDigits.slice(-4) },
                      { icon: Building2, label: "Bank", value: txBankName },
                      ...(txAccountNo ? [{ icon: Hash, label: "Account No", value: "XX" + txAccountNo.slice(-4) }] : []),
                      ...(txNote ? [{ icon: FileText, label: "Note", value: txNote }] : []),
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 py-1.5" style={{ borderBottom: "1px solid #f8fafc" }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(11,44,96,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={12} style={{ color: "#0b2c60" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#0b2c60", marginTop: 1 }}>{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.20)" }}>
                    <AlertCircle size={12} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 11, color: "#92400e", lineHeight: 1.5 }}>Confirm Aadhaar and amount with the customer before proceeding.</p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setTxStep("form")} className="px-4 py-3 rounded-2xl font-bold text-sm"
                      style={{ border: "1.5px solid #e2e8f0", color: "#64748b", background: "#f8fafc", flexShrink: 0 }}>Edit</button>
                    <button disabled={txMut.isPending}
                      onClick={() => {
                        const parts = [txBankName];
                        if (isValidAadhaar) parts.push("Aadhaar XXXX" + aadhaarDigits.slice(-4));
                        if (txAccountNo) parts.push("A/C XX" + txAccountNo.slice(-4));
                        if (txNote) parts.push(txNote);
                        txMut.mutate({ type: txType, amount: amtNum, customerName: txCustomerName, description: parts.join(" · ") });
                      }}
                      className="flex-1 py-3 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-1.5"
                      style={{ background: accent, boxShadow: `0 4px 14px ${accentColor}32`, opacity: txMut.isPending ? 0.7 : 1 }}>
                      {txMut.isPending ? "Saving…" : <>{isWd ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />} Confirm & Save</>}
                    </button>
                  </div>
                </div>
              </>
            );

            /* ── Form step ── */
            return (
              <>
                <div style={{ background: "linear-gradient(135deg,#0b2c60 0%,#0f3872 60%,#1a4a9e 100%)" }}>
                  <div style={{ height: 3, background: "linear-gradient(90deg,#0b2c60,#f97316)" }} />
                  <div className="px-4 py-3 flex items-center gap-3">
                    <button onClick={() => setShowTxDialog(false)} style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <X size={15} color="#fff" />
                    </button>
                    <div className="flex-1">
                      <DialogTitle className="text-white text-sm font-black m-0 p-0">AePS Transaction</DialogTitle>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 1 }}>Aadhaar-enabled Payment System</p>
                    </div>
                    <Fingerprint size={16} color="rgba(255,255,255,0.65)" />
                  </div>
                  <div className="px-4 pb-3">
                    <div className="flex rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.10)", padding: 4, gap: 4 }}>
                      {(["withdrawal", "deposit"] as const).map(t => {
                        const active = txType === t;
                        const isW = t === "withdrawal";
                        return (
                          <button key={t} type="button" onClick={() => setTxType(t)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs"
                            style={{ background: active ? (isW ? "linear-gradient(135deg,#f43f5e,#e11d48)" : "linear-gradient(135deg,#10b981,#059669)") : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.48)", boxShadow: active ? `0 3px 10px ${isW ? "rgba(244,63,94,0.45)" : "rgba(16,185,129,0.45)"}` : "none", transition: "all 0.18s" }}>
                            {isW ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                            {isW ? "Withdrawal" : "Deposit"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="overflow-y-auto space-y-3 p-4" style={{ maxHeight: "65vh" }}>
                  {/* Amount */}
                  <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)", border: "1px solid rgba(11,44,96,0.06)" }}>
                    <div style={{ height: 3, background: accent }} />
                    <div className="px-4 py-3">
                      <label style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Amount *</label>
                      <div className="relative">
                        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: 10, background: accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 3px 8px ${accentColor}28` }}>
                          <IndianRupee size={14} color="#fff" />
                        </div>
                        <input type="number" inputMode="decimal" placeholder="0" autoFocus
                          {...txForm.register("amount", { required: true })}
                          style={{ width: "100%", height: 54, paddingLeft: 56, paddingRight: 14, borderRadius: 12, border: `2px solid ${isValidAmount ? accentColor : "#e2e8f0"}`, fontSize: 22, fontWeight: 900, color: "#0b2c60", outline: "none", boxSizing: "border-box", background: isValidAmount ? accentLight : "#fafbff", transition: "all 0.15s" }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {AEPS_QUICK_AMOUNTS.map(v => (
                          <button key={v} type="button" onClick={() => txForm.setValue("amount", String(v))}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                            style={{ background: txAmountVal === String(v) ? accent : "#f1f5f9", color: txAmountVal === String(v) ? "#fff" : "#64748b", border: txAmountVal === String(v) ? "none" : "1px solid #e2e8f0" }}>
                            ₹{v >= 1000 ? (v / 1000) + "K" : v}
                          </button>
                        ))}
                      </div>
                      {session && isWd && isValidAmount && (
                        <p style={{ fontSize: 10, color: accentColor, marginTop: 5, fontWeight: 600 }}>After: ₹{fmt(session.currentBalance - amtNum)}</p>
                      )}
                    </div>
                  </div>

                  {/* Customer details */}
                  <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)", border: "1px solid rgba(11,44,96,0.06)" }}>
                    <div style={{ height: 3, background: "linear-gradient(90deg,#0b2c60,#1a4a9e)" }} />
                    <div className="px-4 py-3 space-y-3">
                      <p style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Customer Details</p>
                      {aepsFrequentCustomers.length > 0 && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {aepsFrequentCustomers.map(name => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => txForm.setValue("customerName", name)}
                              style={{
                                padding: "4px 10px", borderRadius: 16,
                                border: `1px solid ${txCustomerName === name ? "#0b2c60" : "rgba(11,44,96,0.18)"}`,
                                background: txCustomerName === name ? "#0b2c60" : "rgba(11,44,96,0.04)",
                                color: txCustomerName === name ? "#fff" : "#0b2c60",
                                fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                              }}
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      )}
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 5 }}>Customer Name *</label>
                        <div className="relative">
                          <User size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                          <AutocompleteInput
                            value={txCustomerName}
                            onChange={(val) => txForm.setValue("customerName", val)}
                            suggestions={aepsCustomerNames}
                            placeholder="Full name of customer"
                            style={{ width: "100%", height: 42, paddingLeft: 32, paddingRight: 12, borderRadius: 11, border: `1.5px solid ${isValidName ? "#0b2c6040" : "#e2e8f0"}`, fontSize: 13, fontWeight: 600, color: "#0b2c60", outline: "none", boxSizing: "border-box", background: isValidName ? "rgba(11,44,96,0.03)" : "#fff", transition: "all 0.15s" }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 5 }}>Aadhaar Number * <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>(12 digits)</span></label>
                        <div className="relative">
                          <Fingerprint size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                          <input inputMode="numeric"
                            value={txShowAadhaar ? maskAadhaar(txAadhaar) : displayAadhaar}
                            onChange={e => setTxAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
                            onFocus={() => setTxShowAadhaar(true)}
                            onBlur={() => setTxShowAadhaar(false)}
                            placeholder="XXXX XXXX XXXX"
                            style={{ width: "100%", height: 42, paddingLeft: 32, paddingRight: 38, borderRadius: 11, border: `1.5px solid ${isValidAadhaar ? "#0b2c6040" : aadhaarDigits.length > 0 ? "#fca5a5" : "#e2e8f0"}`, fontSize: 13, fontWeight: 700, color: "#0b2c60", letterSpacing: "0.08em", fontFamily: "monospace", outline: "none", boxSizing: "border-box", background: isValidAadhaar ? "rgba(11,44,96,0.03)" : aadhaarDigits.length > 0 && !isValidAadhaar ? "#fff5f5" : "#fff", transition: "all 0.15s" }}
                          />
                          <button type="button" onMouseDown={() => setTxShowAadhaar(true)} onMouseUp={() => setTxShowAadhaar(false)}
                            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                            {txShowAadhaar ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        <div className="flex gap-1 mt-1.5">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < aadhaarDigits.length ? (isValidAadhaar ? "#0b2c60" : "#e11d48") : "#e2e8f0", transition: "background 0.1s" }} />
                          ))}
                        </div>
                        {aadhaarDigits.length > 0 && !isValidAadhaar && (
                          <p style={{ fontSize: 10, color: "#e11d48", marginTop: 3, fontWeight: 600 }}>{12 - aadhaarDigits.length} more digit{12 - aadhaarDigits.length !== 1 ? "s" : ""} needed</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bank details */}
                  <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)", border: "1px solid rgba(11,44,96,0.06)" }}>
                    <div style={{ height: 3, background: "linear-gradient(90deg,#8b5cf6,#7c3aed)" }} />
                    <div className="px-4 py-3 space-y-3">
                      <p style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Bank Details</p>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 5 }}>Bank Name *</label>
                        <div className="relative">
                          <Building2 size={13} style={{ position: "absolute", left: 11, top: 14, color: "#94a3b8", zIndex: 1 }} />
                          <select value={txBankName} onChange={e => setTxBankName(e.target.value)}
                            style={{ width: "100%", height: 42, paddingLeft: 32, paddingRight: 12, borderRadius: 11, border: `1.5px solid ${isValidBank ? "#0b2c6040" : "#e2e8f0"}`, fontSize: 12, fontWeight: 600, color: txBankName ? "#0b2c60" : "#94a3b8", outline: "none", boxSizing: "border-box", appearance: "none", background: isValidBank ? "rgba(11,44,96,0.03)" : "#fff" }}>
                            <option value="" disabled>Select bank name</option>
                            {AEPS_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                      </div>
                      {txType === "deposit" && (
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 5 }}>Account Number <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
                          <div className="relative">
                            <Hash size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                            <input inputMode="numeric" value={txAccountNo} onChange={e => setTxAccountNo(e.target.value.replace(/\D/g, "").slice(0, 18))} placeholder="Bank account number"
                              style={{ width: "100%", height: 42, paddingLeft: 32, paddingRight: 12, borderRadius: 11, border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 600, color: "#0b2c60", outline: "none", boxSizing: "border-box", background: "#fff", fontFamily: "monospace", letterSpacing: "0.05em" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Note */}
                  <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.05)", border: "1px solid rgba(11,44,96,0.05)" }}>
                    <div className="px-4 py-3">
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 5 }}>Note <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
                      <div className="relative">
                        <FileText size={13} style={{ position: "absolute", left: 11, top: 11, color: "#94a3b8" }} />
                        <textarea value={txNote} onChange={e => setTxNote(e.target.value)} placeholder="Additional notes…" rows={2}
                          style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 11, border: "1.5px solid #e2e8f0", fontSize: 12, color: "#0b2c60", resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", lineHeight: 1.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proceed button */}
                <div className="px-4 pb-4 pt-2">
                  <button type="button" onClick={() => { if (isFormValid) setTxStep("confirm"); }} disabled={!isFormValid}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: isFormValid ? accent : "#f1f5f9", color: isFormValid ? "#fff" : "#94a3b8", boxShadow: isFormValid ? `0 4px 14px ${accentColor}30` : "none", transition: "all 0.18s", cursor: isFormValid ? "pointer" : "not-allowed" }}>
                    {isWd ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                    Review Transaction
                  </button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>}

      {/* ── Add Transaction: Desktop Panel (3-step) ── */}
      {!isMobile && showTxDialog && (() => {
        const txAmountVal = txForm.watch("amount");
        const txCustomerName = txForm.watch("customerName");
        const aadhaarDigits = txAadhaar.replace(/\D/g, "");
        const amtNum = parseFloat(txAmountVal);
        const isWd = txType === "withdrawal";
        const accent = isWd ? "linear-gradient(135deg,#f43f5e,#e11d48)" : "linear-gradient(135deg,#10b981,#059669)";
        const accentColor = isWd ? "#e11d48" : "#059669";
        const accentLight = isWd ? "rgba(244,63,94,0.07)" : "rgba(16,185,129,0.07)";
        const accentBorder = isWd ? "rgba(244,63,94,0.22)" : "rgba(16,185,129,0.22)";
        const isValidAmount = !isNaN(amtNum) && amtNum > 0;
        const isValidName = txCustomerName.trim().length >= 2;
        const isValidAadhaar = aadhaarDigits.length === 12;
        const isValidBank = txBankName.trim().length > 0;
        const isFormValid = isValidAmount && isValidName && isValidAadhaar && isValidBank;
        const displayAadhaar = txShowAadhaar ? maskAadhaar(txAadhaar) : aadhaarDigits.length > 0 ? "XXXX XXXX " + aadhaarDigits.slice(-4) : "";

        return (
          <>
            <div onClick={() => { resetTxForm(); setShowTxDialog(false); }}
              style={{ position: "fixed", inset: 0, background: "rgba(11,44,96,0.40)", backdropFilter: "blur(4px)", zIndex: 49 }} />
            {/* V2 — Full-screen split layout */}
            <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>

              {/* LEFT INFO PANEL */}
              <div style={{ width: 380, flexShrink: 0, background: isWd ? "linear-gradient(160deg,#7f1d1d 0%,#b91c1c 55%,#e11d48 100%)" : "linear-gradient(160deg,#064e3b 0%,#047857 55%,#10b981 100%)", display: "flex", flexDirection: "column", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -70, right: -70, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -50, left: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(0,0,0,0.12)", pointerEvents: "none" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, position: "relative" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,0.20)", border: "1.5px solid rgba(255,255,255,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
                  </div>
                  <div><span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>SAHU CSC</span></div>
                </div>

                {/* Icon + title */}
                <div style={{ position: "relative", marginBottom: 24 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    {isWd ? <ArrowDownLeft size={30} color="#fff" strokeWidth={2.5} /> : <ArrowUpRight size={30} color="#fff" strokeWidth={2.5} />}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 8, padding: "4px 10px", marginBottom: 10 }}>
                    <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>AePS</span>
                  </div>
                  <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, lineHeight: 1.2, marginBottom: 8 }}>
                    {txStep === "success" ? "Transaction Complete!" : txStep === "confirm" ? "Confirm Transaction" : isWd ? "Cash Withdrawal" : "Cash Deposit"}
                  </h1>
                  <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 13, lineHeight: 1.6 }}>
                    {txStep === "form" ? (isWd ? "Customer receives cash using Aadhaar biometric authentication." : "Customer deposits cash into their bank account via AePS.") : txStep === "confirm" ? "Please verify the details carefully before confirming." : "AePS transaction has been recorded successfully."}
                  </p>
                </div>

                {/* Session balance stats */}
                {session && (
                  <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 16, padding: "16px 18px", marginBottom: 12, position: "relative" }}>
                    <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Today's Session</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "rgba(255,255,255,0.60)", fontSize: 12 }}>Current Balance</span>
                        <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>₹{fmt(session.currentBalance)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "rgba(255,255,255,0.60)", fontSize: 12 }}>Opening</span>
                        <span style={{ color: "rgba(255,255,255,0.80)", fontWeight: 600, fontSize: 13 }}>₹{fmt(session.openingBalance)}</span>
                      </div>
                    </div>
                    {isWd && isValidAmount && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>After withdrawal</span>
                          <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>₹{fmt(session.currentBalance - amtNum)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Security badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: "10px 14px", marginTop: "auto", position: "relative" }}>
                  <Fingerprint size={18} color="rgba(255,255,255,0.70)" />
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, lineHeight: 1.5 }}>Secured via NPCI Aadhaar-based biometric authentication</p>
                </div>
              </div>

              {/* RIGHT FORM PANEL */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8fafc" }}>
                {/* Top bar */}
                <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0b2c60", margin: 0 }}>
                      {txStep === "success" ? "Transaction Recorded" : txStep === "confirm" ? "Confirm Details" : "New AePS Transaction"}
                    </h2>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>AePS · {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {txStep === "form" && (
                      <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 14, padding: 4, gap: 4 }}>
                        {(["withdrawal", "deposit"] as const).map(t => {
                          const isW = t === "withdrawal";
                          return (
                            <button key={t} type="button" onClick={() => setTxType(t)}
                              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 11, border: "none", cursor: "pointer", background: txType === t ? (isW ? "linear-gradient(135deg,#f43f5e,#e11d48)" : "linear-gradient(135deg,#10b981,#059669)") : "transparent", color: txType === t ? "#fff" : "#64748b", fontWeight: 700, fontSize: 13, boxShadow: txType === t ? `0 2px 10px ${isW ? "rgba(225,29,72,0.35)" : "rgba(16,185,129,0.35)"}` : "none", transition: "all 0.15s" }}>
                              {isW ? <><ArrowDownLeft size={13} />Withdrawal</> : <><ArrowUpRight size={13} />Deposit</>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <button onClick={() => { resetTxForm(); setShowTxDialog(false); }}
                      style={{ width: 38, height: 38, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <X size={16} color="#64748b" />
                    </button>
                  </div>
                </div>

                {/* ── Success ── */}
                {txStep === "success" && (
                  <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                    <div style={{ width: 80, height: 80, borderRadius: 24, background: accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 32px ${accentColor}40` }}>
                      <CheckCircle2 size={40} color="#fff" />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 24, fontWeight: 900, color: "#0b2c60" }}>{isWd ? "Withdrawal" : "Deposit"} Recorded!</p>
                      <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>AePS transaction saved successfully</p>
                    </div>
                    <div style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 18px rgba(11,44,96,0.09)", border: "1px solid rgba(11,44,96,0.07)" }}>
                      <div style={{ height: 4, background: accent }} />
                      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ textAlign: "center", padding: "14px 0", borderRadius: 14, marginBottom: 6, background: accentLight, border: `1px solid ${accentBorder}` }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: "0.07em" }}>Amount {isWd ? "Withdrawn" : "Deposited"}</p>
                          <p style={{ fontSize: 32, fontWeight: 900, color: accentColor, lineHeight: 1.1, marginTop: 4 }}>₹{fmt(amtNum)}</p>
                        </div>
                        {[
                          { label: "Customer", value: txCustomerName },
                          { label: "Aadhaar", value: "XXXX XXXX " + aadhaarDigits.slice(-4) },
                          { label: "Bank", value: txBankName },
                          ...(txAccountNo ? [{ label: "Account No", value: "XX" + txAccountNo.slice(-4) }] : []),
                          ...(txNote ? [{ label: "Note", value: txNote }] : []),
                        ].map(({ label, value }) => (
                          <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#0b2c60" }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ width: "100%", maxWidth: 520, display: "flex", gap: 14 }}>
                      <button onClick={() => { const t = txType; resetTxForm(); setTxType(t); }}
                        style={{ flex: 1, height: 50, borderRadius: 14, fontWeight: 700, fontSize: 14, border: `1.5px solid ${accentBorder}`, color: accentColor, background: accentLight, cursor: "pointer" }}>
                        + New {isWd ? "Withdrawal" : "Deposit"}
                      </button>
                      <button onClick={() => { resetTxForm(); setShowTxDialog(false); }}
                        style={{ flex: 1, height: 50, borderRadius: 14, fontWeight: 700, fontSize: 14, border: "none", color: "#fff", background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", cursor: "pointer" }}>
                        Done
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Confirm ── */}
                {txStep === "confirm" && (
                  <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ maxWidth: 560 }}>
                      <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 14px rgba(11,44,96,0.09)", marginBottom: 20 }}>
                        <div style={{ height: 4, background: accent }} />
                        <div style={{ background: "#fff", padding: "20px 24px", textAlign: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 11, background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {isWd ? <ArrowDownLeft size={16} color="#fff" /> : <ArrowUpRight size={16} color="#fff" />}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>AePS {isWd ? "Withdrawal" : "Deposit"}</span>
                          </div>
                          <p style={{ fontSize: 40, fontWeight: 900, color: accentColor, lineHeight: 1 }}>₹{fmt(amtNum)}</p>
                        </div>
                      </div>
                      <div style={{ background: "#fff", borderRadius: 18, padding: "18px 22px", boxShadow: "0 2px 12px rgba(11,44,96,0.07)", border: "1px solid rgba(11,44,96,0.06)", display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                        <p style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 4 }}>Customer Details</p>
                        {[
                          { icon: User, label: "Customer", value: txCustomerName },
                          { icon: Fingerprint, label: "Aadhaar", value: "XXXX XXXX " + aadhaarDigits.slice(-4) },
                          { icon: Building2, label: "Bank", value: txBankName },
                          ...(txAccountNo ? [{ icon: Hash, label: "Account No", value: "XX" + txAccountNo.slice(-4) }] : []),
                          ...(txNote ? [{ icon: FileText, label: "Note", value: txNote }] : []),
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid #f8fafc" }}>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(11,44,96,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Icon size={14} style={{ color: "#0b2c60" }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                              <p style={{ fontSize: 13, fontWeight: 600, color: "#0b2c60", marginTop: 2 }}>{value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 14, background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.20)" }}>
                        <AlertCircle size={15} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>Confirm Aadhaar and amount with the customer before proceeding.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Form Step ── */}
                {txStep === "form" && (
                  <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24 }}>
                    <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 24 }}>

                      {/* Amount — hero */}
                      <div style={{ background: accentLight, border: `2px solid ${accentBorder}`, borderRadius: 20, padding: "20px 24px" }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: "uppercase" as const, letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>Amount *</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 15, background: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 14px ${accentColor}35` }}>
                            <IndianRupee size={22} color="#fff" />
                          </div>
                          <input type="number" inputMode="decimal" placeholder="0" autoFocus
                            {...txForm.register("amount", { required: true })}
                            style={{ flex: 1, fontSize: 38, fontWeight: 900, color: accentColor, background: "transparent", border: "none", outline: "none", letterSpacing: "-0.02em" }} />
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {AEPS_QUICK_AMOUNTS.map(v => (
                            <button key={v} type="button" onClick={() => txForm.setValue("amount", String(v))}
                              style={{ padding: "7px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, background: txAmountVal === String(v) ? accent : "#f1f5f9", color: txAmountVal === String(v) ? "#fff" : "#64748b", border: txAmountVal === String(v) ? "none" : "1px solid #e2e8f0", cursor: "pointer" }}>
                              ₹{v >= 1000 ? (v / 1000) + "K" : v}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Customer + Aadhaar */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: aepsFrequentCustomers.length > 0 ? 6 : 8 }}>Customer Name *</label>
                          {aepsFrequentCustomers.length > 0 && (
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                              {aepsFrequentCustomers.map(name => (
                                <button
                                  key={name}
                                  type="button"
                                  onClick={() => txForm.setValue("customerName", name)}
                                  style={{
                                    padding: "4px 10px", borderRadius: 12,
                                    border: `1px solid ${txCustomerName === name ? "#0b2c60" : "rgba(11,44,96,0.18)"}`,
                                    background: txCustomerName === name ? "#0b2c60" : "rgba(11,44,96,0.05)",
                                    color: txCustomerName === name ? "#fff" : "#0b2c60",
                                    fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                                  }}
                                >
                                  {name}
                                </button>
                              ))}
                            </div>
                          )}
                          <div style={{ position: "relative" }}>
                            <User size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                            <AutocompleteInput
                              value={txCustomerName}
                              onChange={(val) => txForm.setValue("customerName", val)}
                              suggestions={aepsCustomerNames}
                              placeholder="Full name"
                              style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: `1.5px solid ${isValidName ? "#0b2c6040" : "#e2e8f0"}`, fontSize: 14, fontWeight: 600, color: "#0b2c60", outline: "none", background: isValidName ? "rgba(11,44,96,0.03)" : "#fff", boxSizing: "border-box", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                            />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Aadhaar * <span style={{ fontSize: 10, fontWeight: 400, color: "#cbd5e1" }}>(12 digits)</span></label>
                          <div style={{ position: "relative" }}>
                            <Fingerprint size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                            <input inputMode="numeric"
                              value={txShowAadhaar ? maskAadhaar(txAadhaar) : displayAadhaar}
                              onChange={e => setTxAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
                              onFocus={() => setTxShowAadhaar(true)} onBlur={() => setTxShowAadhaar(false)}
                              placeholder="XXXX XXXX XXXX"
                              style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 40, borderRadius: 14, border: `1.5px solid ${isValidAadhaar ? "#0b2c6040" : aadhaarDigits.length > 0 ? "#fca5a5" : "#e2e8f0"}`, fontSize: 13, fontWeight: 700, color: "#0b2c60", letterSpacing: "0.06em", fontFamily: "monospace", outline: "none", boxSizing: "border-box", background: isValidAadhaar ? "rgba(11,44,96,0.03)" : aadhaarDigits.length > 0 && !isValidAadhaar ? "#fff5f5" : "#fff", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }} />
                            <button type="button" onMouseDown={() => setTxShowAadhaar(true)} onMouseUp={() => setTxShowAadhaar(false)}
                              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}>
                              {txShowAadhaar ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
                            {Array.from({ length: 12 }).map((_, i) => (
                              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < aadhaarDigits.length ? (isValidAadhaar ? "#0b2c60" : "#e11d48") : "#e2e8f0" }} />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bank + Account */}
                      <div style={{ display: "grid", gridTemplateColumns: txType === "deposit" ? "1fr 1fr" : "1fr", gap: 20 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Bank Name *</label>
                          <div style={{ position: "relative" }}>
                            <Building2 size={15} style={{ position: "absolute", left: 14, top: 17, color: "#94a3b8", zIndex: 1 }} />
                            <select value={txBankName} onChange={e => setTxBankName(e.target.value)}
                              style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: `1.5px solid ${isValidBank ? "#0b2c6040" : "#e2e8f0"}`, fontSize: 14, fontWeight: 600, color: txBankName ? "#0b2c60" : "#94a3b8", outline: "none", boxSizing: "border-box", appearance: "none", background: isValidBank ? "rgba(11,44,96,0.03)" : "#fff", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}>
                              <option value="" disabled>Select bank</option>
                              {AEPS_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                          </div>
                        </div>
                        {txType === "deposit" && (
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Account No <span style={{ fontWeight: 400, textTransform: "none" as const, color: "#94a3b8" }}>(optional)</span></label>
                            <div style={{ position: "relative" }}>
                              <Hash size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                              <input inputMode="numeric" value={txAccountNo} onChange={e => setTxAccountNo(e.target.value.replace(/\D/g, "").slice(0, 18))} placeholder="Account number"
                                style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 600, color: "#0b2c60", outline: "none", boxSizing: "border-box", background: "#fff", fontFamily: "monospace", letterSpacing: "0.05em", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Note */}
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Note <span style={{ fontWeight: 400, textTransform: "none" as const, color: "#94a3b8" }}>(optional)</span></label>
                        <div style={{ position: "relative" }}>
                          <FileText size={15} style={{ position: "absolute", left: 14, top: 15, color: "#94a3b8" }} />
                          <textarea value={txNote} onChange={e => setTxNote(e.target.value)} placeholder="Additional notes…" rows={2}
                            style={{ width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 13, paddingBottom: 13, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#0b2c60", resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", lineHeight: 1.6, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer — form step */}
                {txStep === "form" && (
                  <div style={{ padding: "20px 40px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 14 }}>
                    <button type="button" onClick={() => { resetTxForm(); setShowTxDialog(false); }}
                      style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
                    <button type="button" onClick={() => { if (isFormValid) setTxStep("confirm"); }} disabled={!isFormValid}
                      style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: isFormValid ? "pointer" : "not-allowed", background: isFormValid ? accent : "#f1f5f9", color: isFormValid ? "#fff" : "#94a3b8", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: isFormValid ? `0 6px 20px ${accentColor}30` : "none" }}>
                      {isWd ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      Review Transaction
                    </button>
                  </div>
                )}

                {/* Footer — confirm step */}
                {txStep === "confirm" && (
                  <div style={{ padding: "20px 40px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 14 }}>
                    <button onClick={() => setTxStep("form")} style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Edit</button>
                    <button disabled={txMut.isPending}
                      onClick={() => {
                        const parts = [txBankName];
                        if (isValidAadhaar) parts.push("Aadhaar XXXX" + aadhaarDigits.slice(-4));
                        if (txAccountNo) parts.push("A/C XX" + txAccountNo.slice(-4));
                        if (txNote) parts.push(txNote);
                        txMut.mutate({ type: txType, amount: amtNum, customerName: txCustomerName, description: parts.join(" · ") });
                      }}
                      style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: accent, color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 14px ${accentColor}32`, opacity: txMut.isPending ? 0.7 : 1 }}>
                      {txMut.isPending ? "Saving…" : <>{isWd ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />} Confirm & Save</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Edit Transaction Dialog ── */}
      <Dialog open={!!editingTx} onOpenChange={(open) => { if (!open) setEditingTx(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Transaction</DialogTitle></DialogHeader>
          <form onSubmit={onEditSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Transaction Type</Label>
              <Select value={editForm.watch("type")} onValueChange={(v) => editForm.setValue("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="withdrawal">Withdrawal (Balance decreases)</SelectItem>
                  <SelectItem value="deposit">Deposit (Balance increases)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Customer Name</Label>
              <AutocompleteInput
                value={editCustomerName}
                onChange={(val) => editForm.setValue("customerName", val)}
                suggestions={aepsCustomerNames}
                autoFocus
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Amount (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                <Input type="number" min={1} step={0.01} className="pl-7" {...editForm.register("amount", { required: true })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input placeholder="e.g. Aadhaar linked, HDFC Bank" {...editForm.register("description")} />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setEditingTx(null)}>Cancel</Button>
              <Button type="submit" disabled={editMut.isPending}>{editMut.isPending ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={!!deletingTx} onOpenChange={(open) => { if (!open) setDeletingTx(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the {deletingTx?.type} of <strong>₹{deletingTx ? fmt(deletingTx.amount) : ""}</strong> for <strong>{deletingTx?.customerName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingTx && deleteMut.mutate(deletingTx.id)}
              disabled={deleteMut.isPending}
            >
              {deleteMut.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

// ─────────────────────────────────────────────────────────
// All Transactions Tab
// ─────────────────────────────────────────────────────────
function AllTransactionsTab() {
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

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editingTx} onOpenChange={(open) => { if (!open) setEditingTx(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Transaction</DialogTitle></DialogHeader>
          <form onSubmit={onEditSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Transaction Type</Label>
              <Select value={editForm.watch("type")} onValueChange={(v) => editForm.setValue("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="withdrawal">Withdrawal (Balance decreases)</SelectItem>
                  <SelectItem value="deposit">Deposit (Balance increases)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Customer Name</Label>
              <AutocompleteInput
                value={editCustomerName}
                onChange={(val) => editForm.setValue("customerName", val)}
                suggestions={allTabCustomerNames}
                autoFocus
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Amount (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                <Input type="number" min={1} step={0.01} className="pl-7" {...editForm.register("amount", { required: true })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input placeholder="e.g. Aadhaar linked, HDFC Bank" {...editForm.register("description")} />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setEditingTx(null)}>Cancel</Button>
              <Button type="submit" disabled={editMut.isPending}>{editMut.isPending ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={!!deletingTx} onOpenChange={(open) => { if (!open) setDeletingTx(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the {deletingTx?.type} of <strong>₹{deletingTx ? fmt(deletingTx.amount) : ""}</strong> for <strong>{deletingTx?.customerName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingTx && deleteMut.mutate(deletingTx.id)}
              disabled={deleteMut.isPending}
            >
              {deleteMut.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

// ─────────────────────────────────────────────────────────
// Page Root
// ─────────────────────────────────────────────────────────
type Tab = "daily" | "all";

export default function AePS() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("daily");

  return (
    <Layout>
      <div className="space-y-5">

        {/* ── Page Header ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 4px 20px rgba(11,44,96,0.18)" }}
        >
          <div
            className="px-5 py-5 flex items-center gap-4"
            style={{ background: "linear-gradient(135deg, #0b2c60 0%, #0f3872 60%, #1a4a9e 100%)" }}
          >
            <div
              style={{
                width: 48, height: 48, borderRadius: 15, flexShrink: 0,
                background: "rgba(255,255,255,0.12)",
                border: "1.5px solid rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Fingerprint size={26} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                AePS Cash Management
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
                Aadhaar-enabled Payment System · Daily cash tracking
              </p>
            </div>
          </div>

          {/* Tab strip */}
          <div
            className="flex"
            style={{ background: "rgba(11,44,96,0.04)", borderTop: "1px solid rgba(11,44,96,0.09)" }}
          >
            {([
              { key: "daily" as Tab, label: "Daily Session", icon: CalendarDays },
              { key: "all" as Tab, label: "All Transactions", icon: Filter },
            ]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all flex-1 justify-center"
                style={{
                  color: tab === key ? "#0b2c60" : "#94a3b8",
                  borderBottom: tab === key ? "2.5px solid #0b2c60" : "2.5px solid transparent",
                  background: tab === key ? "rgba(11,44,96,0.05)" : "transparent",
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        {tab === "daily" ? <DailyTab /> : <AllTransactionsTab />}
      </div>
    </Layout>
  );
}
