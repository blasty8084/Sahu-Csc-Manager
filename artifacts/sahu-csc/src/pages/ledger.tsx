import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useListLedgerEntries, useCreateLedgerEntry, useUpdateLedgerEntry, useDeleteLedgerEntry,
  useGetBalance, useListServices,
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
import { Plus, Pencil, Trash2, Download, Filter, X, ChevronLeft, ChevronRight, Clock, WifiOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { addPendingEntry, getAllPendingEntries, type PendingLedgerEntry } from "@/lib/offline-db";
import { syncEngine } from "@/lib/sync-engine";

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
    form.reset({ date: new Date().toISOString().split("T")[0], customerName: "", serviceType: "", credit: 0, debit: 0, description: "" });
    setShowForm(true);
  };

  const openEdit = (entry: any) => {
    setEditEntry(entry);
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

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-bold">Ledger</h2>
            <p className="text-xs text-muted-foreground">{data?.total ?? 0} transactions</p>
          </div>
          <div className="flex gap-2">
            {/* Mobile: icon-only buttons */}
            <Button variant="outline" size="sm" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
              <Filter size={15} />
              {hasFilters && <span className="ml-1 w-1.5 h-1.5 bg-primary rounded-full" />}
            </Button>
            <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
              <a href="/api/reports/export" target="_blank"><Download size={14} className="mr-1.5" />Export</a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hidden md:inline-flex text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setShowDeleteAll(true)}
            >
              <Trash2 size={14} className="mr-1.5" />Delete All
            </Button>
            <Button size="sm" onClick={openCreate} data-testid="button-new-entry">
              <Plus size={14} className="md:mr-1.5" />
              <span className="hidden md:inline">New Entry</span>
            </Button>
          </div>
        </div>

        {/* Balance Summary */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {[
            { label: "Balance", value: balance?.balance, color: "text-primary" },
            { label: "Credits", value: balance?.totalCredits, color: "text-emerald-600" },
            { label: "Debits", value: balance?.totalDebits, color: "text-red-600" },
          ].map((item) => (
            <div key={item.label} className="bg-card border rounded-xl p-3 md:p-4">
              <p className="text-[10px] md:text-xs text-muted-foreground font-medium">{item.label}</p>
              {item.value === undefined ? (
                <Skeleton className="h-5 md:h-7 w-16 md:w-24 mt-0.5 md:mt-1" />
              ) : (
                <p className={`text-sm md:text-xl font-bold mt-0.5 md:mt-1 ${item.color} truncate`}>
                  ₹{(item.value ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                </p>
              )}
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
              <SelectContent>
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
            <SelectContent>
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

        {/* MOBILE: Card List */}
        <div className="md:hidden space-y-2">
          {isLoading ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
          ) : !data?.entries?.length ? (
            <div className="text-center text-muted-foreground py-16 text-sm">
              No entries found. Tap <strong>+</strong> to add your first entry.
            </div>
          ) : (
            data.entries.map((entry: any) => (
              <div key={entry.id} className="bg-card border rounded-xl p-4" data-testid={`row-ledger-${entry.id}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm truncate">{entry.customerName}</p>
                      <Badge variant="outline" className="text-[10px] py-0 h-4 flex-shrink-0">{entry.serviceType}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground font-mono">{entry.date}</p>
                      {entry.description && (
                        <p className="text-xs text-muted-foreground truncate">· {entry.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(entry)}>
                      <Pencil size={12} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(entry.id)}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-border">
                  {entry.credit > 0 && (
                    <div className="flex-1">
                      <p className="text-[10px] text-muted-foreground">Credit</p>
                      <p className="text-sm font-bold text-emerald-600">+₹{entry.credit.toLocaleString("en-IN")}</p>
                    </div>
                  )}
                  {entry.debit > 0 && (
                    <div className="flex-1">
                      <p className="text-[10px] text-muted-foreground">Debit</p>
                      <p className="text-sm font-bold text-red-600">-₹{entry.debit.toLocaleString("en-IN")}</p>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Balance</p>
                    <p className="text-sm font-bold">₹{entry.balance.toLocaleString("en-IN")}</p>
                  </div>
                </div>
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
                    <td colSpan={8} className="text-center text-muted-foreground py-14 text-sm">
                      No entries found. Click <strong>New Entry</strong> to start.
                    </td>
                  </tr>
                ) : (
                  data.entries.map((entry: any) => (
                    <tr key={entry.id} className="hover:bg-muted/20 transition-colors" data-testid={`row-ledger-${entry.id}`}>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{entry.date}</td>
                      <td className="px-4 py-3 font-medium">{entry.customerName}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{entry.serviceType}</Badge></td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-medium">{entry.credit > 0 ? `₹${entry.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}</td>
                      <td className="px-4 py-3 text-right text-red-600 font-medium">{entry.debit > 0 ? `₹${entry.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}</td>
                      <td className="px-4 py-3 text-right font-bold">₹{entry.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs max-w-32 truncate">{entry.description}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
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

      {/* Entry Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl md:rounded-lg">
          <DialogHeader><DialogTitle>{editEntry ? "Edit Entry" : "New Ledger Entry"}</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" {...form.register("date", { required: true })} data-testid="input-date" />
              </div>
              <div className="space-y-1.5">
                <Label>Service Type</Label>
                <Select value={form.watch("serviceType")} onValueChange={(v) => form.setValue("serviceType", v)}>
                  <SelectTrigger data-testid="select-service"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Customer Name</Label>
              <Input {...form.register("customerName", { required: true })} placeholder="Customer name" data-testid="input-customer" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Credit (₹)</Label>
                <Input type="number" step="0.01" min="0" {...form.register("credit", { valueAsNumber: true, min: 0 })} data-testid="input-credit" />
              </div>
              <div className="space-y-1.5">
                <Label>Debit (₹)</Label>
                <Input type="number" step="0.01" min="0" {...form.register("debit", { valueAsNumber: true, min: 0 })} data-testid="input-debit" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input {...form.register("description")} placeholder="Description..." data-testid="input-description" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending} data-testid="button-save-entry">
                {editEntry ? "Update" : "Create"}
              </Button>
            </DialogFooter>
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
