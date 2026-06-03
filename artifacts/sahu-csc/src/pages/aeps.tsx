import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Fingerprint, Plus, Trash2, ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";

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

type AepsSession = {
  id: number;
  date: string;
  openingBalance: number;
  notes: string | null;
  transactions: {
    id: number;
    type: "withdrawal" | "deposit";
    amount: number;
    customerName: string;
    description: string | null;
    balance: number;
    createdAt: string;
  }[];
  totalWithdrawals: number;
  totalDeposits: number;
  currentBalance: number;
} | null;

export default function AePS() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showTxDialog, setShowTxDialog] = useState(false);
  const [txType, setTxType] = useState<"withdrawal" | "deposit">("withdrawal");

  const sessionKey = ["aeps-session", selectedDate];

  const { data: session, isLoading } = useQuery<AepsSession>({
    queryKey: sessionKey,
    queryFn: () => apiFetch(`/api/aeps/session?date=${selectedDate}`),
  });

  const openForm = useForm({ defaultValues: { openingBalance: "", notes: "" } });
  const txForm = useForm({ defaultValues: { amount: "", customerName: "", description: "" } });

  const openMut = useMutation({
    mutationFn: (data: { openingBalance: number; notes?: string }) =>
      apiFetch("/api/aeps/session", {
        method: "POST",
        body: JSON.stringify({ date: selectedDate, ...data }),
      }),
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
      apiFetch("/api/aeps/transaction", {
        method: "POST",
        body: JSON.stringify({ date: selectedDate, ...data }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKey });
      setShowTxDialog(false);
      txForm.reset();
      toast({ title: "Transaction recorded" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/aeps/transaction/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKey });
      toast({ title: "Transaction removed" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const onOpenSubmit = openForm.handleSubmit((v) => {
    const bal = parseFloat(v.openingBalance);
    if (isNaN(bal) || bal < 0) {
      toast({ title: "Enter a valid opening balance", variant: "destructive" });
      return;
    }
    openMut.mutate({ openingBalance: bal, notes: v.notes || undefined });
  });

  const onTxSubmit = txForm.handleSubmit((v) => {
    const amt = parseFloat(v.amount);
    if (isNaN(amt) || amt <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    txMut.mutate({ type: txType, amount: amt, customerName: v.customerName, description: v.description || undefined });
  });

  const isToday = selectedDate === todayStr();

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Fingerprint size={22} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AePS Cash Tracker</h2>
              <p className="text-sm text-muted-foreground">Aadhaar-enabled Payment System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !session ? (
          /* ── No session: prompt to open the day ── */
          <Card className="border-dashed border-2 border-amber-300 dark:border-amber-700">
            <CardContent className="py-10 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <Wallet size={28} className="text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {isToday ? "Day not opened yet" : `No AePS session for ${selectedDate}`}
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Set the opening balance (cash loaded) to start tracking AePS transactions.
                </p>
              </div>
              <Button onClick={() => setShowOpenDialog(true)} className="gap-2">
                <Plus size={16} /> Set Day Opening Balance
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* ── Session exists: show tracker ── */
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="col-span-2 sm:col-span-1 bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Opening Balance</p>
                  <p className="text-xl font-bold text-primary">₹{fmt(session.openingBalance)}</p>
                </CardContent>
              </Card>
              <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Withdrawals</p>
                  <p className="text-xl font-bold text-red-600">₹{fmt(session.totalWithdrawals)}</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Deposits</p>
                  <p className="text-xl font-bold text-green-600">₹{fmt(session.totalDeposits)}</p>
                </CardContent>
              </Card>
              <Card className={`${session.currentBalance < 0 ? "bg-red-50 dark:bg-red-950/20 border-red-300" : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200"}`}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
                  <p className={`text-xl font-bold ${session.currentBalance < 0 ? "text-red-600" : "text-emerald-600"}`}>
                    ₹{fmt(session.currentBalance)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Formula hint */}
            <p className="text-xs text-muted-foreground">
              Balance = Opening Balance − Withdrawals + Deposits &nbsp;|&nbsp;
              ₹{fmt(session.openingBalance)} − ₹{fmt(session.totalWithdrawals)} + ₹{fmt(session.totalDeposits)} = <strong>₹{fmt(session.currentBalance)}</strong>
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => { setTxType("withdrawal"); txForm.reset(); setShowTxDialog(true); }}
              >
                <ArrowDownLeft size={16} /> AePS Withdrawal
              </Button>
              <Button
                variant="default"
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => { setTxType("deposit"); txForm.reset(); setShowTxDialog(true); }}
              >
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
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Transactions — {session.date}
                  <span className="ml-2 text-muted-foreground font-normal text-sm">
                    ({session.transactions.length} entries)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {session.transactions.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground text-sm">
                    No transactions yet. Use the buttons above to record AePS activity.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {/* Opening row */}
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          OB
                        </div>
                        <div>
                          <p className="text-sm font-medium">Day Opening Balance</p>
                          {session.notes && <p className="text-xs text-muted-foreground">{session.notes}</p>}
                        </div>
                      </div>
                      <p className="font-bold text-primary text-sm">₹{fmt(session.openingBalance)}</p>
                    </div>

                    {/* Transaction rows */}
                    {session.transactions.map((tx, idx) => (
                      <div key={tx.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${tx.type === "withdrawal" ? "bg-red-100 text-red-600 dark:bg-red-900/30" : "bg-green-100 text-green-600 dark:bg-green-900/30"}`}>
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{tx.customerName}</p>
                              <Badge variant={tx.type === "withdrawal" ? "destructive" : "default"} className={`text-[10px] px-1.5 h-4 ${tx.type === "deposit" ? "bg-green-600" : ""}`}>
                                {tx.type === "withdrawal" ? "Withdrawal" : "Deposit"}
                              </Badge>
                            </div>
                            {tx.description && <p className="text-xs text-muted-foreground">{tx.description}</p>}
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${tx.type === "withdrawal" ? "text-red-600" : "text-green-600"}`}>
                              {tx.type === "withdrawal" ? "−" : "+"}₹{fmt(tx.amount)}
                            </p>
                            <p className={`text-xs font-medium ${tx.balance < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                              Bal: ₹{fmt(tx.balance)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteMut.mutate(tx.id)}
                            disabled={deleteMut.isPending}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Final balance footer */}
                    <div className={`flex items-center justify-between px-4 py-3 font-semibold ${session.currentBalance < 0 ? "bg-red-50 dark:bg-red-950/20" : "bg-emerald-50 dark:bg-emerald-950/20"}`}>
                      <span className="text-sm">Closing Balance</span>
                      <span className={`text-base ${session.currentBalance < 0 ? "text-red-600" : "text-emerald-600"}`}>
                        ₹{fmt(session.currentBalance)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Open Day Dialog */}
      <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Day Opening Balance</DialogTitle>
          </DialogHeader>
          <form onSubmit={onOpenSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input value={selectedDate} disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Opening Balance (₹) — Cash loaded for AePS today</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">₹</span>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="e.g. 50000"
                  {...openForm.register("openingBalance", { required: true })}
                  autoFocus
                />
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

      {/* Add Transaction Dialog */}
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="withdrawal">Withdrawal (Balance decreases)</SelectItem>
                  <SelectItem value="deposit">Deposit (Balance increases)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Customer Name</Label>
              <Input
                placeholder="Customer name"
                {...txForm.register("customerName", { required: true })}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Amount (₹)</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">₹</span>
                <Input
                  type="number"
                  min={1}
                  step={0.01}
                  placeholder="e.g. 2000"
                  {...txForm.register("amount", { required: true })}
                />
              </div>
              {session && (
                <p className="text-xs text-muted-foreground">
                  Current balance: ₹{fmt(session.currentBalance)}
                  {txType === "withdrawal" && (
                    <> → After withdrawal: <strong>₹{fmt(session.currentBalance - (parseFloat(txForm.watch("amount")) || 0))}</strong></>
                  )}
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
                type="submit"
                disabled={txMut.isPending}
                className={txType === "deposit" ? "bg-green-600 hover:bg-green-700" : ""}
                variant={txType === "withdrawal" ? "destructive" : "default"}
              >
                {txMut.isPending ? "Recording..." : `Record ${txType === "withdrawal" ? "Withdrawal" : "Deposit"}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
