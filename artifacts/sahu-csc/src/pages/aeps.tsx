import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Fingerprint, Plus, Trash2, ArrowDownLeft, ArrowUpRight, Wallet, Pencil, ChevronLeft, ChevronRight, Filter, X, List, CalendarDays, Receipt } from "lucide-react";
import { ReceiptModal } from "@/components/receipt-modal";
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

  const isToday = selectedDate === todayStr();

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Date picker */}
      <div className="flex items-center gap-3">
        <CalendarDays size={16} className="text-muted-foreground" />
        <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-44" />
        {isToday && <Badge variant="outline" className="text-xs">Today</Badge>}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !session ? (
        <Card className="border-dashed border-2 border-amber-300 dark:border-amber-700">
          <CardContent className="py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <Wallet size={28} className="text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-lg">{isToday ? "Day not opened yet" : `No AePS session for ${selectedDate}`}</p>
              <p className="text-muted-foreground text-sm mt-1">Set the opening balance (cash loaded) to start tracking AePS transactions.</p>
            </div>
            <Button onClick={() => setShowOpenDialog(true)} className="gap-2">
              <Plus size={16} /> Set Day Opening Balance
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Opening Balance", value: session.openingBalance,
                accent: "linear-gradient(90deg, #0b2c60, #1a4a9e)", color: "#0b2c60",
                span: "col-span-2 sm:col-span-1",
              },
              {
                label: "Withdrawals", value: session.totalWithdrawals,
                accent: "linear-gradient(90deg, #f43f5e, #fb7185)", color: "#e11d48",
                span: "",
              },
              {
                label: "Deposits", value: session.totalDeposits,
                accent: "linear-gradient(90deg, #10b981, #34d399)", color: "#059669",
                span: "",
              },
              {
                label: "Current Balance", value: session.currentBalance,
                accent: session.currentBalance < 0
                  ? "linear-gradient(90deg, #f43f5e, #fb7185)"
                  : "linear-gradient(90deg, #10b981, #34d399)",
                color: session.currentBalance < 0 ? "#e11d48" : "#059669",
                span: "",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`bg-white rounded-xl overflow-hidden ${item.span}`}
                style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08), 0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div style={{ height: 3, background: item.accent }} />
                <div className="p-4">
                  <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 900, color: item.color, lineHeight: 1.1 }}>
                    ₹{fmt(item.value)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Balance = Opening − Withdrawals + Deposits &nbsp;|&nbsp;
            ₹{fmt(session.openingBalance)} − ₹{fmt(session.totalWithdrawals)} + ₹{fmt(session.totalDeposits)} = <strong>₹{fmt(session.currentBalance)}</strong>
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="destructive" className="gap-2" onClick={() => { setTxType("withdrawal"); txForm.reset(); setShowTxDialog(true); }}>
              <ArrowDownLeft size={16} /> AePS Withdrawal
            </Button>
            <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => { setTxType("deposit"); txForm.reset(); setShowTxDialog(true); }}>
              <ArrowUpRight size={16} /> AePS Deposit
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              openForm.setValue("openingBalance", String(session.openingBalance));
              openForm.setValue("notes", session.notes ?? "");
              setShowOpenDialog(true);
            }}>
              Edit Opening Balance
            </Button>
          </div>

          {/* Transaction list */}
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08), 0 1px 3px rgba(0,0,0,0.04)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid rgba(11,44,96,0.07)" }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60" }}>
                  Transactions — {session.date}
                </p>
                <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{session.transactions.length} entries</p>
              </div>
            </div>

            {session.transactions.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                No transactions yet. Use the buttons above to record AePS activity.
              </div>
            ) : (
              <div>
                {/* Opening row */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ background: "rgba(11,44,96,0.03)", borderBottom: "1px solid rgba(11,44,96,0.06)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: "linear-gradient(135deg, #0b2c60, #1a4a9e)",
                        boxShadow: "0 3px 8px rgba(11,44,96,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 9, fontWeight: 900, letterSpacing: "0.04em",
                      }}
                    >
                      OB
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0b2c60" }}>Day Opening Balance</p>
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
                      className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50"
                      style={{ borderBottom: "1px solid rgba(11,44,96,0.05)" }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          style={{
                            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                            background: isWd
                              ? "linear-gradient(135deg, #f43f5e, #e11d48)"
                              : "linear-gradient(135deg, #10b981, #059669)",
                            boxShadow: isWd
                              ? "0 3px 8px rgba(244,63,94,0.30)"
                              : "0 3px 8px rgba(16,185,129,0.30)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontSize: 11, fontWeight: 800,
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#0b2c60" }} className="truncate">
                              {tx.customerName}
                            </p>
                            <span
                              style={{
                                fontSize: 9, fontWeight: 700,
                                color: isWd ? "#e11d48" : "#059669",
                                background: isWd ? "rgba(244,63,94,0.10)" : "rgba(16,185,129,0.10)",
                                borderRadius: 5, padding: "2px 6px",
                              }}
                            >
                              {isWd ? "Withdrawal" : "Deposit"}
                            </span>
                          </div>
                          {tx.description && (
                            <p style={{ fontSize: 10, color: "#94a3b8" }} className="truncate">{tx.description}</p>
                          )}
                          <p style={{ fontSize: 10, color: "#94a3b8" }}>
                            {new Date(tx.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <div className="text-right mr-1">
                          <p style={{ fontSize: 13, fontWeight: 800, color: isWd ? "#e11d48" : "#059669" }}>
                            {isWd ? "−" : "+"}₹{fmt(tx.amount)}
                          </p>
                          <p style={{ fontSize: 10, fontWeight: 500, color: tx.balance < 0 ? "#e11d48" : "#94a3b8" }}>
                            Bal: ₹{fmt(tx.balance)}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700" title="View Receipt" onClick={() => setReceiptTx(tx)}>
                          <Receipt size={13} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700" onClick={() => openEditDialog(tx)}>
                          <Pencil size={13} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeletingTx(tx)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Closing balance */}
                <div
                  className="flex items-center justify-between px-4 py-3.5"
                  style={{
                    background: session.currentBalance < 0
                      ? "rgba(244,63,94,0.05)"
                      : "rgba(16,185,129,0.06)",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60" }}>Closing Balance</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: session.currentBalance < 0 ? "#e11d48" : "#059669" }}>
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
          <DialogHeader><DialogTitle>Set Day Opening Balance</DialogTitle></DialogHeader>
          <form onSubmit={onOpenSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input value={selectedDate} disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Opening Balance (₹) — Cash loaded for AePS today</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">₹</span>
                <Input type="number" min={0} step={0.01} placeholder="e.g. 50000" {...openForm.register("openingBalance", { required: true })} autoFocus />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Input placeholder="e.g. Loaded from SBI BC account" {...openForm.register("notes")} />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowOpenDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={openMut.isPending}>{openMut.isPending ? "Saving..." : "Confirm & Open Day"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Add Transaction Dialog ── */}
      <Dialog open={showTxDialog} onOpenChange={setShowTxDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={txType === "withdrawal" ? "text-red-600" : "text-green-600"}>
              {txType === "withdrawal" ? "AePS Cash Withdrawal" : "AePS Cash Deposit"}
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
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">₹</span>
                <Input type="number" min={1} step={0.01} placeholder="e.g. 2000" {...txForm.register("amount", { required: true })} />
              </div>
              {session && txType === "withdrawal" && (
                <p className="text-xs text-muted-foreground">
                  Current balance: ₹{fmt(session.currentBalance)} → After: <strong>₹{fmt(session.currentBalance - (parseFloat(txForm.watch("amount")) || 0))}</strong>
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input placeholder="e.g. Aadhaar linked, HDFC Bank" {...txForm.register("description")} />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowTxDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={txMut.isPending}
                className={txType === "deposit" ? "bg-green-600 hover:bg-green-700" : ""}
                variant={txType === "withdrawal" ? "destructive" : "default"}>
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
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">₹</span>
                <Input type="number" min={1} step={0.01} {...editForm.register("amount", { required: true })} />
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

      {/* ── Receipt Modal ── */}
      <ReceiptModal
        open={receiptTx !== null}
        entry={receiptTx ? {
          id: receiptTx.id,
          date: selectedDate,
          customerName: receiptTx.customerName,
          serviceType: "AePS Cash",
          credit: receiptTx.type === "deposit" ? receiptTx.amount : 0,
          debit: receiptTx.type === "withdrawal" ? receiptTx.amount : 0,
          description: receiptTx.description,
          balance: receiptTx.balance,
          receiptNumber: null,
          receiptToken: null,
          createdByName: null,
          createdAt: receiptTx.createdAt,
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
// All Transactions Tab (Ledger style)
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

  const totalW = data?.transactions.filter((t) => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0) ?? 0;
  const totalD = data?.transactions.filter((t) => t.type === "deposit").reduce((s, t) => s + t.amount, 0) ?? 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{total} transaction{total !== 1 ? "s" : ""}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-1.5">
            <Filter size={14} />
            Filters
            {hasFilters && <span className="w-1.5 h-1.5 bg-primary rounded-full" />}
          </Button>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
              <X size={13} />Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardContent className="pt-4 pb-4">
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
          </CardContent>
        </Card>
      )}

      {/* Summary strip (current page) */}
      {data && data.transactions.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Withdrawals (this page)", value: totalW, accent: "linear-gradient(90deg, #f43f5e, #fb7185)", color: "#e11d48", Icon: ArrowDownLeft },
            { label: "Deposits (this page)", value: totalD, accent: "linear-gradient(90deg, #10b981, #34d399)", color: "#059669", Icon: ArrowUpRight },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-xl overflow-hidden"
              style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.08), 0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div style={{ height: 3, background: item.accent }} />
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <item.Icon size={14} style={{ color: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: item.color }}>₹{fmt(item.value)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-border">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : !data || data.transactions.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-center text-muted-foreground">
              <Fingerprint size={36} className="opacity-20" />
              <div>
                <p className="font-medium">{hasFilters ? "No transactions match the filters" : "No AePS transactions yet"}</p>
                <p className="text-xs mt-1">{hasFilters ? "Try adjusting or clearing the filters" : "Open a daily session and record withdrawals/deposits"}</p>
              </div>
              {hasFilters && <Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button>}
            </div>
          ) : (
            <div>
              {data.transactions.map((tx) => {
                const isWd = tx.type === "withdrawal";
                return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                  style={{ borderBottom: "1px solid rgba(11,44,96,0.05)" }}
                >
                  {/* Left: icon + info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: isWd
                          ? "linear-gradient(135deg, #f43f5e, #e11d48)"
                          : "linear-gradient(135deg, #10b981, #059669)",
                        boxShadow: isWd
                          ? "0 3px 8px rgba(244,63,94,0.28)"
                          : "0 3px 8px rgba(16,185,129,0.28)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {isWd
                        ? <ArrowDownLeft size={16} color="#fff" />
                        : <ArrowUpRight size={16} color="#fff" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0b2c60" }} className="truncate">{tx.customerName}</p>
                        <span
                          style={{
                            fontSize: 9, fontWeight: 700,
                            color: isWd ? "#e11d48" : "#059669",
                            background: isWd ? "rgba(244,63,94,0.10)" : "rgba(16,185,129,0.10)",
                            borderRadius: 5, padding: "2px 6px",
                          }}
                        >
                          {isWd ? "Withdrawal" : "Deposit"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tx.date} &nbsp;·&nbsp; {new Date(tx.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {tx.description && <p className="text-xs text-muted-foreground truncate">{tx.description}</p>}
                    </div>
                  </div>

                  {/* Right: amount + actions */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-3">
                    <p style={{ fontSize: 13, fontWeight: 800, color: isWd ? "#e11d48" : "#059669" }}>
                      {isWd ? "−" : "+"}₹{fmt(tx.amount)}
                    </p>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700" title="View Receipt" onClick={() => setReceiptTx(tx)}>
                      <Receipt size={13} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700" onClick={() => openEditDialog(tx)}>
                      <Pencil size={13} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeletingTx(tx)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground text-xs">
            Page {page} of {totalPages} &nbsp;·&nbsp; {total} total
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-8 px-2">
              <ChevronLeft size={15} />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => setPage(p)}>
                  {p}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-8 px-2">
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}

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
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">₹</span>
                <Input type="number" min={1} step={0.01} {...editForm.register("amount", { required: true })} />
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

      {/* ── Receipt Modal ── */}
      <ReceiptModal
        open={receiptTx !== null}
        entry={receiptTx ? {
          id: receiptTx.id,
          date: receiptTx.date,
          customerName: receiptTx.customerName,
          serviceType: "AePS Cash",
          credit: receiptTx.type === "deposit" ? receiptTx.amount : 0,
          debit: receiptTx.type === "withdrawal" ? receiptTx.amount : 0,
          description: receiptTx.description,
          balance: 0,
          receiptNumber: null,
          receiptToken: null,
          createdByName: null,
          createdAt: receiptTx.createdAt,
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
// Main Page
// ─────────────────────────────────────────────────────────
export default function AePS() {
  return (
    <Layout>
      <div className="space-y-5">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <Fingerprint size={22} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AePS Cash Tracker</h2>
            <p className="text-sm text-muted-foreground">Aadhaar-enabled Payment System</p>
          </div>
        </div>

        <Tabs defaultValue="daily">
          <TabsList className="mb-2">
            <TabsTrigger value="daily" className="gap-2">
              <CalendarDays size={14} />
              Daily View
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <List size={14} />
              All Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <DailyTab />
          </TabsContent>

          <TabsContent value="all">
            <AllTransactionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
