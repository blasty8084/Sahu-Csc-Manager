import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useListLedgerEntries, useCreateLedgerEntry, useUpdateLedgerEntry, useDeleteLedgerEntry,
  useGetBalance, useListServices, useGetSettings,
  getListLedgerEntriesQueryKey, getGetBalanceQueryKey
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { Plus, Pencil, Trash2, Download, Filter, X, ChevronLeft, ChevronRight, Clock, WifiOff, Receipt, Search, IndianRupee, User, FileText, Calendar, CheckCircle2, ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import { addPendingEntry, getAllPendingEntries, type PendingLedgerEntry } from "@/lib/offline-db";
import { syncEngine } from "@/lib/sync-engine";
import { ReceiptModal } from "@/components/receipt-modal";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface EntryForm {
  date: string;
  customerName: string;
  serviceType: string;
  credit: number;
  debit: number;
  description: string;
}

export default function Ledger() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const isMobile = useIsMobile();
  const { isOffline } = useNetworkStatus();
  const [pendingEntries, setPendingEntries] = useState<PendingLedgerEntry[]>([]);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [receiptEntry, setReceiptEntry] = useState<any>(null);
  const [entryType, setEntryType] = useState<"credit" | "debit">("credit");
  const [rawAmount, setRawAmount] = useState("0");

  const refreshPending = async () => {
    try {
      const entries = await getAllPendingEntries();
      setPendingEntries(entries.sort((a, b) => b.createdAt - a.createdAt));
    } catch {}
  };

  useEffect(() => {
    refreshPending();
    const handler = () => refreshPending();
    window.addEventListener("sahu-sync-complete", handler);
    window.addEventListener("online", handler);
    return () => {
      window.removeEventListener("sahu-sync-complete", handler);
      window.removeEventListener("online", handler);
    };
  }, []);

  const params = {
    page,
    limit: 15,
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(customerName && { customerName }),
    ...(serviceFilter && serviceFilter !== "all" && { serviceType: serviceFilter }),
  };

  const { data, isLoading } = useListLedgerEntries(params);
  const { data: balance } = useGetBalance();
  const { data: services } = useListServices();
  const { data: settings } = useGetSettings();
  const businessName = (settings as any)?.businessName ?? "SAHU CSC";
  const businessAddress = (settings as any)?.businessAddress ?? "";
  const businessMobile = (settings as any)?.businessMobile ?? "";
  const businessWebsite = (settings as any)?.businessWebsite ?? "";
  const createMut = useCreateLedgerEntry();
  const updateMut = useUpdateLedgerEntry();
  const deleteMut = useDeleteLedgerEntry();

  const deleteAllMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/ledger/all`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListLedgerEntriesQueryKey() });
      qc.invalidateQueries({ queryKey: getGetBalanceQueryKey() });
      setShowDeleteAll(false);
      setPage(1);
      toast({ title: "All transactions deleted. Balance reset to ₹0." });
    },
    onError: () => toast({ title: "Failed to delete all transactions", variant: "destructive" }),
  });

  const form = useForm<EntryForm>({
    defaultValues: { date: new Date().toISOString().split("T")[0], customerName: "", serviceType: "", credit: 0, debit: 0, description: "" }
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListLedgerEntriesQueryKey(params) });
    qc.invalidateQueries({ queryKey: getGetBalanceQueryKey() });
  };

  const openCreate = () => {
    setEditEntry(null);
    setEntryType("credit");
    setRawAmount("0");
    form.reset({ date: new Date().toISOString().split("T")[0], customerName: "", serviceType: "", credit: 0, debit: 0, description: "" });
    setShowForm(true);
  };

  const openEdit = (entry: any) => {
    setEditEntry(entry);
    const etype = entry.credit > 0 ? "credit" : "debit";
    setEntryType(etype);
    setRawAmount(String(entry.credit > 0 ? entry.credit : entry.debit));
    form.reset({ date: entry.date, customerName: entry.customerName, serviceType: entry.serviceType, credit: entry.credit, debit: entry.debit, description: entry.description });
    setShowForm(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editEntry) {
        await updateMut.mutateAsync({ id: editEntry.id, data: values });
        toast({ title: "Entry updated" });
        setShowForm(false);
        invalidate();
      } else if (isOffline) {
        const pending: PendingLedgerEntry = {
          id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          date: values.date,
          customerName: values.customerName,
          serviceType: values.serviceType,
          credit: Number(values.credit) || 0,
          debit: Number(values.debit) || 0,
          description: values.description || "",
          createdAt: Date.now(),
          retryCount: 0,
        };
        await addPendingEntry(pending);
        await syncEngine.markPendingAdded();
        await refreshPending();
        setShowForm(false);
        toast({
          title: "Saved offline",
          description: "Will sync automatically when connected",
        });
      } else {
        await createMut.mutateAsync({ data: values });
        toast({ title: "Entry created" });
        setShowForm(false);
        invalidate();
      }
    } catch {
      toast({ title: "Failed to save entry", variant: "destructive" });
    }
  });

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMut.mutateAsync({ id: deleteId });
      toast({ title: "Entry deleted" });
      setDeleteId(null);
      invalidate();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const clearFilters = () => { setStartDate(""); setEndDate(""); setCustomerName(""); setServiceFilter(""); setPage(1); };
  const hasFilters = !!(startDate || endDate || customerName || serviceFilter);
  const serviceTypes = services?.map((s: any) => s.name) ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / 15);

  // Sync rawAmount + entryType → form credit/debit fields
  useEffect(() => {
    const amt = parseFloat(rawAmount) || 0;
    if (entryType === "credit") {
      form.setValue("credit", amt);
      form.setValue("debit", 0);
    } else {
      form.setValue("credit", 0);
      form.setValue("debit", amt);
    }
  }, [entryType, rawAmount]);

  // Accent colors for Add Entry form
  const accentColor = entryType === "credit" ? "#059669" : "#e11d48";
  const accentGrad = entryType === "credit"
    ? "linear-gradient(135deg, #064e3b, #059669)"
    : "linear-gradient(135deg, #881337, #e11d48)";
  const accentBg = entryType === "credit" ? "rgba(5,150,105,0.08)" : "rgba(225,29,72,0.08)";

  // Date grouping helpers for mobile
  const groupByDate = (entries: any[]) => {
    const groups: Record<string, any[]> = {};
    entries?.forEach((e: any) => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  };
  const fmtDateGroup = (d: string) => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (d === today) return "Today";
    if (d === yesterday) return "Yesterday";
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* ── MOBILE: Navy gradient hero header ── */}
        <div className="md:hidden rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg,#0b2c60 0%,#1a4a9e 100%)", padding: "20px 20px 24px", position: "relative" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(249,115,22,0.12)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -20, left: 20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, position: "relative" }}>
            <div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>My Ledger</p>
              <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 900, lineHeight: 1.1, marginTop: 2 }}>Transaction Book</h1>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href="/api/reports/export" target="_blank" style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                <Download size={15} color="#fff" />
              </a>
              <button onClick={() => setShowDeleteAll(true)} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(249,115,22,0.18)", border: "1px solid rgba(249,115,22,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", outline: "none" }}>
                <Trash2 size={15} color="#f97316" />
              </button>
            </div>
          </div>
          {/* Balance card */}
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.12)", position: "relative" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Current Balance</p>
            {balance === undefined
              ? <div style={{ height: 30, background: "rgba(255,255,255,0.1)", borderRadius: 8, marginBottom: 12, width: "55%" }} />
              : <p style={{ color: "#fff", fontSize: 26, fontWeight: 900, lineHeight: 1, marginBottom: 12 }}>₹{(balance?.balance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: "rgba(16,185,129,0.15)", borderRadius: 10, padding: "8px 10px", border: "1px solid rgba(16,185,129,0.25)" }}>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Credits</p>
                {balance === undefined
                  ? <div style={{ height: 16, background: "rgba(255,255,255,0.12)", borderRadius: 4, marginTop: 4, width: "70%" }} />
                  : <p style={{ color: "#34d399", fontSize: 15, fontWeight: 900, marginTop: 2 }}>+₹{(balance?.totalCredits ?? 0).toLocaleString("en-IN")}</p>}
              </div>
              <div style={{ background: "rgba(244,63,94,0.15)", borderRadius: 10, padding: "8px 10px", border: "1px solid rgba(244,63,94,0.25)" }}>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Debits</p>
                {balance === undefined
                  ? <div style={{ height: 16, background: "rgba(255,255,255,0.12)", borderRadius: 4, marginTop: 4, width: "70%" }} />
                  : <p style={{ color: "#fb7185", fontSize: 15, fontWeight: 900, marginTop: 2 }}>−₹{(balance?.totalDebits ?? 0).toLocaleString("en-IN")}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE: Search bar ── */}
        <div className="md:hidden" style={{ position: "relative" }}>
          <Search size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            value={customerName}
            onChange={(e) => { setCustomerName(e.target.value); setPage(1); }}
            placeholder="Search customer or service…"
            style={{ width: "100%", height: 44, paddingLeft: 34, paddingRight: 46, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 13, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 6px rgba(11,44,96,0.06)" }}
          />
          <button onClick={() => setShowFilters(!showFilters)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: 8, background: hasFilters ? "#0b2c60" : "#f1f5f9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", outline: "none" }}>
            <Filter size={13} color={hasFilters ? "#fff" : "#64748b"} />
          </button>
        </div>

        {/* ── DESKTOP: Header ── */}
        <div className="hidden md:flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-bold">Ledger</h2>
            <p className="text-xs text-muted-foreground">{data?.total ?? 0} transactions</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="/api/reports/export" target="_blank"><Download size={14} className="mr-1.5" />Export</a>
            </Button>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground" onClick={() => setShowDeleteAll(true)}>
              <Trash2 size={14} className="mr-1.5" />Delete All
            </Button>
            <Button size="sm" onClick={openCreate} data-testid="button-new-entry">
              <Plus size={14} className="mr-1.5" />New Entry
            </Button>
          </div>
        </div>

        {/* ── DESKTOP: Balance Summary ── */}
        <div className="hidden md:grid grid-cols-3 gap-3">
          {([
            { label: "Current Balance", value: balance?.balance, accent: "linear-gradient(135deg,#0b2c60,#1a4a9e)", color: "#0b2c60", icon: Wallet, sub: "Running total" },
            { label: "Total Credits", value: balance?.totalCredits, accent: "linear-gradient(135deg,#10b981,#059669)", color: "#059669", icon: TrendingUp, sub: "All income" },
            { label: "Total Debits", value: balance?.totalDebits, accent: "linear-gradient(135deg,#f43f5e,#e11d48)", color: "#e11d48", icon: TrendingDown, sub: "All expenses" },
          ] as any[]).map((item) => (
            <div key={item.label} className="bg-white rounded-2xl overflow-hidden flex-1"
              style={{ boxShadow: "0 1px 12px rgba(11,44,96,0.08)", border: "1px solid rgba(11,44,96,0.06)" }}>
              <div style={{ height: 3, background: item.accent }} />
              <div className="p-5 flex items-start justify-between">
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{item.label}</p>
                  {item.value === undefined
                    ? <Skeleton className="h-7 w-24" />
                    : <p style={{ fontSize: 24, fontWeight: 900, color: item.color, lineHeight: 1 }}>₹{(item.value ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>}
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>{item.sub}</p>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, background: item.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${item.color}33` }}>
                  <item.icon size={20} color="#fff" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Offline Pending Entries */}
        {pendingEntries.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                {pendingEntries.length} offline {pendingEntries.length === 1 ? "entry" : "entries"} — will sync when connected
              </p>
              {isOffline && (
                <span className="ml-auto flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-500">
                  <WifiOff size={11} /> Offline
                </span>
              )}
            </div>
            <div className="space-y-2">
              {pendingEntries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 bg-white dark:bg-amber-950/30 rounded-lg px-3 py-2 border border-amber-100 dark:border-amber-800/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{entry.customerName || "—"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{entry.serviceType} · {entry.date}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {entry.credit > 0 && (
                      <p className="text-xs font-bold text-emerald-600">+₹{entry.credit.toLocaleString("en-IN")}</p>
                    )}
                    {entry.debit > 0 && (
                      <p className="text-xs font-bold text-rose-500">-₹{entry.debit.toLocaleString("en-IN")}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-amber-300 text-amber-600 dark:text-amber-400 flex-shrink-0">
                    Pending
                  </Badge>
                </div>
              ))}
              {pendingEntries.length > 5 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 text-center">
                  +{pendingEntries.length - 5} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Mobile Filters (collapsible) */}
        {showFilters && (
          <div className="md:hidden bg-card border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Filters</p>
              {hasFilters && (
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={clearFilters}>
                  <X size={12} className="mr-1" />Clear
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <Input className="h-9 text-sm" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To</Label>
                <Input className="h-9 text-sm" type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} />
              </div>
            </div>
            <Input className="h-9 text-sm" value={customerName} onChange={(e) => { setCustomerName(e.target.value); setPage(1); }} placeholder="Search customer..." />
            <Select value={serviceFilter} onValueChange={(v) => { setServiceFilter(v); setPage(1); }}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="All services" /></SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                <SelectItem value="all">All services</SelectItem>
                {serviceTypes.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Desktop Filters */}
        <div className="hidden md:flex flex-wrap gap-2 bg-card border rounded-lg p-3">
          <Input className="w-36 h-8 text-sm" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} />
          <Input className="w-36 h-8 text-sm" type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} />
          <Input className="w-44 h-8 text-sm" value={customerName} onChange={(e) => { setCustomerName(e.target.value); setPage(1); }} placeholder="Customer name..." />
          <Select value={serviceFilter} onValueChange={(v) => { setServiceFilter(v); setPage(1); }}>
            <SelectTrigger className="w-40 h-8 text-sm"><SelectValue placeholder="All services" /></SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              <SelectItem value="all">All services</SelectItem>
              {serviceTypes.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearFilters}>
              <X size={12} className="mr-1" />Clear
            </Button>
          )}
        </div>

        {/* ── MOBILE: Date-grouped card list ── */}
        <div className="md:hidden space-y-1 pb-24">
          {isLoading ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
          ) : !data?.entries?.length ? (
            <div className="text-center text-muted-foreground py-16 text-sm">
              No entries found. Tap <strong>+</strong> to add your first entry.
            </div>
          ) : (
            groupByDate(data.entries).map(([date, txns]) => (
              <div key={date}>
                {/* Date group header */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 4px 6px" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{fmtDateGroup(date)}</p>
                  <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                </div>
                {txns.map((entry: any) => {
                  const isCredit = entry.credit > 0;
                  const amt = isCredit ? entry.credit : entry.debit;
                  const ec = isCredit ? "#059669" : "#e11d48";
                  const iconBg = isCredit ? "rgba(5,150,105,0.08)" : "rgba(225,29,72,0.08)";
                  return (
                    <div key={entry.id} data-testid={`row-ledger-${entry.id}`}
                      style={{ background: "#fff", borderRadius: 14, marginBottom: 8, overflow: "hidden", boxShadow: "0 1px 8px rgba(11,44,96,0.07)", display: "flex", border: "1px solid #f1f5f9" }}>
                      <div style={{ width: 4, background: ec, flexShrink: 0 }} />
                      <div style={{ flex: 1, padding: "11px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                        {/* Icon badge */}
                        <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {isCredit
                            ? <ArrowDownLeft size={17} color={ec} strokeWidth={2.5} />
                            : <ArrowUpRight size={17} color={ec} strokeWidth={2.5} />}
                        </div>
                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.customerName}</p>
                          <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{entry.serviceType}</p>
                        </div>
                        {/* Amount + balance + action buttons */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: 900, color: ec, lineHeight: 1 }}>{isCredit ? "+" : "−"}₹{amt.toLocaleString("en-IN")}</p>
                          <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>Bal ₹{Number(entry.balance).toLocaleString("en-IN")}</p>
                          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", marginTop: 5 }}>
                            <button onClick={() => setReceiptEntry(entry)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                              <Receipt size={11} color="#64748b" />
                            </button>
                            <button onClick={() => openEdit(entry)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                              <Pencil size={11} color="#64748b" />
                            </button>
                            <button onClick={() => setDeleteId(entry.id)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #fee2e2", background: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                              <Trash2 size={11} color="#e11d48" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* DESKTOP: Table */}
        <div className="hidden md:block border rounded-lg overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Receipt No</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Service</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Credit</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Debit</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Balance</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Description</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="px-4 py-3"><Skeleton className="h-3.5 w-24 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-3.5 w-20 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-3.5 rounded-full" style={{ width: `${80 + (i * 27) % 60}px` }} /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                      <td className="px-4 py-3 text-right"><Skeleton className="h-3.5 w-16 rounded-full ml-auto" /></td>
                      <td className="px-4 py-3 text-right"><Skeleton className="h-3.5 w-16 rounded-full ml-auto" /></td>
                      <td className="px-4 py-3 text-right"><Skeleton className="h-3.5 w-20 rounded-full ml-auto" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-3.5 w-28 rounded-full" /></td>
                      <td className="px-4 py-3"><div className="flex gap-1"><Skeleton className="h-7 w-7 rounded" /><Skeleton className="h-7 w-7 rounded" /></div></td>
                    </tr>
                  ))
                ) : !data?.entries?.length ? (
                  <tr>
                    <td colSpan={9} className="text-center text-muted-foreground py-14 text-sm">
                      No entries found. Click <strong>New Entry</strong> to start.
                    </td>
                  </tr>
                ) : (
                  data.entries.map((entry: any) => (
                    <tr key={entry.id} className="hover:bg-muted/20 transition-colors" data-testid={`row-ledger-${entry.id}`}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap" style={{ color: "#f97316" }}>
                        {`CSC-${new Date(entry.createdAt).getFullYear()}-${String(entry.id).padStart(4, "0")}`}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{entry.date}</td>
                      <td className="px-4 py-3 font-medium">{entry.customerName}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{entry.serviceType}</Badge></td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-medium">{entry.credit > 0 ? `₹${entry.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}</td>
                      <td className="px-4 py-3 text-right text-red-600 font-medium">{entry.debit > 0 ? `₹${entry.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}</td>
                      <td className="px-4 py-3 text-right font-bold">₹{entry.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs max-w-32 truncate">{entry.description}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Print Receipt" onClick={() => setReceiptEntry(entry)}><Receipt size={12} /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(entry)}><Pencil size={12} /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(entry.id)}><Trash2 size={12} /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Desktop: Delete All + Export in table footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10">
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <a href="/api/reports/export" target="_blank"><Download size={13} className="mr-1.5" />Export Excel</a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setShowDeleteAll(true)}
              >
                <Trash2 size={13} className="mr-1.5" />Delete All
              </Button>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="md:hidden flex items-center justify-between px-1">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
              <ChevronLeft size={14} className="mr-1" />Prev
            </Button>
            <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
              Next<ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* ── MOBILE: Floating Action Button ── */}
      <button
        onClick={openCreate}
        data-testid="button-new-entry"
        className="md:hidden"
        style={{ position: "fixed", bottom: 88, right: 20, width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg,#f97316,#fb923c)", boxShadow: "0 8px 24px rgba(249,115,22,0.45)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 50 }}
      >
        <Plus size={24} color="#fff" strokeWidth={2.5} />
      </button>

      {/* ── Entry Form Dialog ── */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl md:rounded-xl p-0 overflow-hidden gap-0">
          {/* Drag handle — mobile visual cue */}
          <div className="flex justify-center pt-3 pb-0 md:hidden">
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
          </div>
          {/* Header */}
          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
            <h2 style={{ fontSize: 18, fontWeight: 900, color: accentColor }}>
              {editEntry ? "Edit Entry" : (entryType === "credit" ? "New Credit Entry" : "New Debit Entry")}
            </h2>
            <button type="button" onClick={() => setShowForm(false)} style={{ width: 32, height: 32, borderRadius: 8, background: "#f1f5f9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={15} color="#64748b" />
            </button>
          </div>
          <form onSubmit={onSubmit} className="px-5 pb-6 space-y-3">
            {/* Credit / Debit toggle — hide when editing */}
            {!editEntry && (
              <div style={{ background: "#f1f5f9", borderRadius: 14, padding: 4, display: "flex", gap: 4 }}>
                {(["credit", "debit"] as const).map(t => (
                  <button key={t} type="button" onClick={() => setEntryType(t)}
                    style={{ flex: 1, height: 40, borderRadius: 11, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, background: entryType === t ? (t === "credit" ? "#059669" : "#e11d48") : "transparent", color: entryType === t ? "#fff" : "#94a3b8", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    {t === "credit" ? "▲ Credit (Income)" : "▼ Debit (Expense)"}
                  </button>
                ))}
              </div>
            )}
            {/* Amount — big and bold */}
            <div style={{ background: accentBg, border: `2px solid ${accentColor}25`, borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: accentGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 12px ${accentColor}30` }}>
                <IndianRupee size={18} color="#fff" strokeWidth={2.5} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Amount (₹)</p>
                <input
                  type="number" step="0.01" min="0" value={rawAmount}
                  onChange={e => setRawAmount(e.target.value)}
                  data-testid="input-credit"
                  placeholder="0.00"
                  style={{ width: "100%", fontSize: 28, fontWeight: 900, color: accentColor, background: "transparent", border: "none", outline: "none", padding: 0 }}
                />
              </div>
            </div>
            {/* Customer name */}
            <div style={{ position: "relative" }}>
              <User size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input {...form.register("customerName", { required: true })} placeholder="Customer name"
                data-testid="input-customer"
                style={{ width: "100%", height: 44, paddingLeft: 36, paddingRight: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fafafa", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 600 }} />
            </div>
            {/* Service type */}
            <Select value={form.watch("serviceType")} onValueChange={(v) => form.setValue("serviceType", v)}>
              <SelectTrigger data-testid="select-service" className="h-11 rounded-xl border-[#e2e8f0] bg-[#fafafa] text-sm font-semibold text-[#0b2c60]">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {serviceTypes.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {/* Date */}
            <div style={{ position: "relative" }}>
              <Calendar size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input type="date" {...form.register("date", { required: true })}
                data-testid="input-date"
                style={{ width: "100%", height: 44, paddingLeft: 36, paddingRight: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fafafa", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 600 }} />
            </div>
            {/* Description */}
            <div style={{ position: "relative" }}>
              <FileText size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: 13 }} />
              <textarea {...form.register("description")} rows={2} placeholder="Add a note (optional)"
                data-testid="input-description"
                style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 12, paddingBottom: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fafafa", fontSize: 13, color: "#0b2c60", outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
            {/* Submit */}
            <button type="submit" data-testid="button-save-entry"
              disabled={createMut.isPending || updateMut.isPending}
              style={{ width: "100%", height: 52, borderRadius: 16, border: "none", cursor: "pointer", background: accentGrad, color: "#fff", fontSize: 16, fontWeight: 900, letterSpacing: "0.02em", boxShadow: `0 6px 20px ${accentColor}35`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: (createMut.isPending || updateMut.isPending) ? 0.7 : 1 }}>
              <CheckCircle2 size={18} strokeWidth={2.5} />
              {editEntry ? "Update Entry" : `Save ${entryType === "credit" ? "Credit" : "Debit"} Entry`}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Single */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl md:rounded-lg">
          <DialogHeader><DialogTitle>Delete Entry?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <ReceiptModal
        entry={receiptEntry}
        open={!!receiptEntry}
        onClose={() => setReceiptEntry(null)}
        businessName={businessName}
        businessAddress={businessAddress}
        businessMobile={businessMobile}
        businessWebsite={businessWebsite}
      />

      {/* Delete All */}
      <AlertDialog open={showDeleteAll} onOpenChange={setShowDeleteAll}>
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl md:rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ALL Transactions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>every ledger entry</strong> and reset the balance to <strong>₹0.00</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteAllMut.mutate()}
              disabled={deleteAllMut.isPending}
            >
              {deleteAllMut.isPending ? "Deleting..." : "Yes, Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
