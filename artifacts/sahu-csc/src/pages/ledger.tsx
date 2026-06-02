import { useState } from "react";
import { Link } from "wouter";
import {
  useListLedgerEntries, useCreateLedgerEntry, useUpdateLedgerEntry, useDeleteLedgerEntry,
  useGetBalance, useListServices,
  getListLedgerEntriesQueryKey, getGetBalanceQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Filter, Download } from "lucide-react";
import { useForm } from "react-hook-form";

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
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

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
      } else {
        await createMut.mutateAsync({ data: values });
        toast({ title: "Entry created" });
      }
      setShowForm(false);
      invalidate();
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

  const serviceTypes = services?.map((s: any) => s.name) ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / 15);

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Ledger</h2>
            <p className="text-sm text-muted-foreground">{data?.total ?? 0} transactions</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="/api/reports/export" target="_blank"><Download size={14} className="mr-1.5" />Export</a>
            </Button>
            <Button size="sm" onClick={openCreate} data-testid="button-new-entry">
              <Plus size={14} className="mr-1.5" />New Entry
            </Button>
          </div>
        </div>

        {/* Balance */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-xl font-bold text-primary mt-1">₹{(balance?.balance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Total Credits</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">₹{(balance?.totalCredits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Total Debits</p>
            <p className="text-xl font-bold text-red-600 mt-1">₹{(balance?.totalDebits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 bg-card border rounded-lg p-3">
          <Input className="w-36 h-8 text-sm" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} placeholder="From" />
          <Input className="w-36 h-8 text-sm" type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} placeholder="To" />
          <Input className="w-40 h-8 text-sm" value={customerName} onChange={(e) => { setCustomerName(e.target.value); setPage(1); }} placeholder="Customer name..." />
          <Select value={serviceFilter} onValueChange={(v) => { setServiceFilter(v); setPage(1); }}>
            <SelectTrigger className="w-40 h-8 text-sm"><SelectValue placeholder="All services" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services</SelectItem>
              {serviceTypes.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          {(startDate || endDate || customerName || serviceFilter) && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setStartDate(""); setEndDate(""); setCustomerName(""); setServiceFilter(""); setPage(1); }}>Clear</Button>
          )}
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden bg-card">
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
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><Skeleton className="h-8 w-full" /></td></tr>
                )) : data?.entries?.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-muted-foreground py-12">No entries found</td></tr>
                ) : data?.entries?.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-muted/20 transition-colors" data-testid={`row-ledger-${entry.id}`}>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{entry.date}</td>
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
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10">
              <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editEntry ? "Edit Entry" : "New Ledger Entry"}</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
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

      {/* Delete Confirm */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Entry?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
