import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Fingerprint, Plus, Trash2, ArrowDownLeft, ArrowUpRight, Wallet,
  Pencil, ChevronLeft, ChevronRight, Filter, X, Receipt,
  CalendarDays, TrendingDown, TrendingUp, IndianRupee, ListFilter,
} from "lucide-react";
import { AepsReceiptModal } from "@/components/aeps-receipt-modal";
import { useForm } from "react-hook-form";
import { useGetSettings } from "@workspace/api-client-react";

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

// ─────────────────────────────────────────────────────────
// Daily Tab
// ─────────────────────────────────────────────────────────
function DailyTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: bizSettings } = useGetSettings();
  const businessName = (bizSettings as any)?.businessName ?? "SAHU CSC";
  const businessAddress = (bizSettings as any)?.businessAddress ?? "";
  const businessMobile = (bizSettings as any)?.businessMobile ?? "";
  const businessWebsite = (bizSettings as any)?.businessWebsite ?? "";

  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showTxDialog, setShowTxDialog] = useState(false);
  const [txType, setTxType] = useState<"withdrawal" | "deposit">("withdrawal");
  const [editingTx, setEditingTx] = useState<AepsTx | null>(null);
  const [deletingTx, setDeletingTx] = useState<AepsTx | null>(null);
  const [receiptTx, setReceiptTx] = useState<AepsTx | null>(null);

  const sessionKey = ["aeps-session", selectedDate];
  const isToday = selectedDate === todayStr();

  const { data: session, isLoading } = useQuery<AepsSession>({
    queryKey: sessionKey,
    queryFn: () => apiFetch(`/api/aeps/session?date=${selectedDate}`),
  });

  const openForm = useForm({ defaultValues: { openingBalance: "", notes: "" } });
  const txForm = useForm({ defaultValues: { amount: "", customerName: "", description: "" } });
  const editForm = useForm({ defaultValues: { type: "withdrawal", amount: "", customerName: "", description: "" } });

  const openMut = useMutation({
    mutationFn: (data: { openingBalance: number; notes?: string }) =>
      apiFetch("/api/aeps/session", { method: "POST", body: JSON.stringify({ date: selectedDate, ...data }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKey });
      setShowOpenDialog(false);
      openForm.reset();
      toast({ title: "Day opening balance set" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const txMut = useMutation({
    mutationFn: (data: { type: string; amount: number; customerName: string; description?: string }) =>
      apiFetch("/api/aeps/transaction", { method: "POST", body: JSON.stringify({ date: selectedDate, ...data }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKey });
      qc.invalidateQueries({ queryKey: ["aeps-all-tx"] });
      setShowTxDialog(false);
      txForm.reset();
      toast({ title: "Transaction recorded" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const editMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      apiFetch(`/api/aeps/transaction/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKey });
      qc.invalidateQueries({ queryKey: ["aeps-all-tx"] });
      setEditingTx(null);
      toast({ title: "Transaction updated" });
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

  const onOpenSubmit = openForm.handleSubmit((v) => {
    const bal = parseFloat(v.openingBalance);
    if (isNaN(bal) || bal < 0) { toast({ title: "Enter a valid opening balance", variant: "destructive" }); return; }
    openMut.mutate({ openingBalance: bal, notes: v.notes || undefined });
  });

  const onTxSubmit = txForm.handleSubmit((v) => {
    const amt = parseFloat(v.amount);
    if (isNaN(amt) || amt <= 0) { toast({ title: "Enter a valid amount", variant: "destructive" }); return; }
    txMut.mutate({ type: txType, amount: amt, customerName: v.customerName, description: v.description || undefined });
  });

  const openEditDialog = (tx: AepsTx) => {
    setEditingTx(tx);
    editForm.reset({ type: tx.type, amount: String(tx.amount), customerName: tx.customerName, description: tx.description ?? "" });
  };

  const onEditSubmit = editForm.handleSubmit((v) => {
    if (!editingTx) return;
    const amt = parseFloat(v.amount);
    if (isNaN(amt) || amt <= 0) { toast({ title: "Enter a valid amount", variant: "destructive" }); return; }
    editMut.mutate({ id: editingTx.id, data: { type: v.type, amount: amt, customerName: v.customerName, description: v.description || undefined } });
  });

  const openWithdrawal = () => { setTxType("withdrawal"); txForm.reset(); setShowTxDialog(true); };
  const openDeposit = () => { setTxType("deposit"); txForm.reset(); setShowTxDialog(true); };

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
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
          <Skeleton className="h-12 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>

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

          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Opening Balance" value={session.openingBalance}
              accent="linear-gradient(135deg, #0b2c60, #1a4a9e)"
              color="#0b2c60" icon={Wallet} wide
            />
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
            />
          </div>

          {/* ── Balance formula bar ── */}
          <div
            className="rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1"
            style={{ background: "rgba(11,44,96,0.04)", border: "1px solid rgba(11,44,96,0.08)" }}
          >
            <span style={{ fontSize: 11, color: "#64748b" }}>Balance formula:</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#0b2c60" }}>₹{fmt(session.openingBalance)}</span>
            <span style={{ fontSize: 11, color: "#e11d48" }}>− ₹{fmt(session.totalWithdrawals)}</span>
            <span style={{ fontSize: 11, color: "#059669" }}>+ ₹{fmt(session.totalDeposits)}</span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>=</span>
            <span style={{ fontSize: 12, fontWeight: 900, color: session.currentBalance < 0 ? "#e11d48" : "#059669" }}>
              ₹{fmt(session.currentBalance)}
            </span>
            <button
              type="button"
              className="ml-auto text-[10px] font-medium px-2 py-1 rounded-md hover:bg-slate-200 transition-colors"
              style={{ color: "#64748b" }}
              onClick={() => {
                openForm.setValue("openingBalance", String(session.openingBalance));
                openForm.setValue("notes", session.notes ?? "");
                setShowOpenDialog(true);
              }}
            >
              Edit Opening
            </button>
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
        </div>
      )}

      {/* ── Open Day Dialog ── */}
      <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Day Opening Balance</DialogTitle>
          </DialogHeader>
          <form onSubmit={onOpenSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input value={fmtDate(selectedDate)} disabled className="text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label>Opening Balance (₹) — Cash loaded for AePS today</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                <Input type="number" min={0} step={0.01} placeholder="e.g. 50000" className="pl-7"
                  {...openForm.register("openingBalance", { required: true })} autoFocus />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Input placeholder="e.g. Loaded from SBI BC account" {...openForm.register("notes")} />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowOpenDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={openMut.isPending}>
                {openMut.isPending ? "Saving..." : "Confirm & Open Day"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Add Transaction Dialog ── */}
      <Dialog open={showTxDialog} onOpenChange={setShowTxDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <span className={txType === "withdrawal" ? "text-red-600" : "text-green-600"}>
                {txType === "withdrawal" ? "AePS Cash Withdrawal" : "AePS Cash Deposit"}
              </span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onTxSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Transaction Type</Label>
              <Select value={txType} onValueChange={(v) => setTxType(v as "withdrawal" | "deposit")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="withdrawal">Withdrawal (Balance decreases)</SelectItem>
                  <SelectItem value="deposit">Deposit (Balance increases)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Customer Name</Label>
              <Input placeholder="Customer name" {...txForm.register("customerName", { required: true })} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Amount (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                <Input type="number" min={1} step={0.01} placeholder="e.g. 2000" className="pl-7"
                  {...txForm.register("amount", { required: true })} />
              </div>
              {session && txType === "withdrawal" && (
                <p className="text-xs text-muted-foreground">
                  Current: ₹{fmt(session.currentBalance)} → After: <strong>₹{fmt(session.currentBalance - (parseFloat(txForm.watch("amount")) || 0))}</strong>
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input placeholder="e.g. Aadhaar linked, HDFC Bank" {...txForm.register("description")} />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowTxDialog(false)}>Cancel</Button>
              <Button
                type="submit" disabled={txMut.isPending}
                className={txType === "deposit" ? "bg-green-600 hover:bg-green-700" : ""}
                variant={txType === "withdrawal" ? "destructive" : "default"}
              >
                {txMut.isPending ? "Recording..." : `Record ${txType === "withdrawal" ? "Withdrawal" : "Deposit"}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
              <Input {...editForm.register("customerName", { required: true })} autoFocus />
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

  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (typeFilter && typeFilter !== "all") params.set("type", typeFilter);
  if (customerName) params.set("customerName", customerName);

  const { data, isLoading } = useQuery<AllTxResponse>({
    queryKey: ["aeps-all-tx", page, startDate, endDate, typeFilter, customerName],
    queryFn: () => apiFetch(`/api/aeps/transactions?${params.toString()}`),
  });

  const editMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      apiFetch(`/api/aeps/transaction/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["aeps-all-tx"] });
      setEditingTx(null);
      toast({ title: "Transaction updated" });
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
              <Input placeholder="Search name…" value={customerName} onChange={(e) => { setCustomerName(e.target.value); setPage(1); }} className="h-8 text-sm" />
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
          <div className="divide-y divide-border">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
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
              <Input {...editForm.register("customerName", { required: true })} autoFocus />
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
