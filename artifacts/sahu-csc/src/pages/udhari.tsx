import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  useListUdhariCustomers,
  useCreateUdhariCustomer,
  useGetUdhariSummary,
} from "@workspace/api-client-react";
import {
  Plus, Search, SortAsc, Users, ChevronRight, Phone, BookOpen,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return `₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function BalanceBadge({ balance }: { balance: number }) {
  if (balance > 0) {
    return (
      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background: "rgba(249,115,22,0.12)", color: "#ea580c" }}>
        To Collect {fmt(balance)}
      </span>
    );
  }
  if (balance < 0) {
    return (
      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background: "rgba(16,185,129,0.12)", color: "#059669" }}>
        To Pay {fmt(balance)}
      </span>
    );
  }
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
      Settled ₹0
    </span>
  );
}

// ─── Add Customer Dialog ───────────────────────────────────────────────────────
function AddCustomerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", mobile: "", address: "", notes: "" });
  const create = useCreateUdhariCustomer();

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    try {
      await create.mutateAsync({ data: { name: form.name.trim(), mobile: form.mobile || undefined, address: form.address || undefined, notes: form.notes || undefined } });
      // Immediately refresh the customer list and summary
      qc.invalidateQueries({ queryKey: ["/api/udhari/customers"] });
      qc.invalidateQueries({ queryKey: ["/api/udhari/summary"] });
      toast({ title: "Customer added!" });
      setForm({ name: "", mobile: "", address: "", notes: "" });
      onClose();
    } catch {
      toast({ title: "Failed to add customer", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl md:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold" style={{ color: "#0b2c60" }}>
            Add Customer
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div>
            <Label className="text-xs font-semibold">Name *</Label>
            <Input className="mt-1 h-9 text-sm" placeholder="Customer name" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          </div>
          <div>
            <Label className="text-xs font-semibold">Mobile (optional)</Label>
            <Input className="mt-1 h-9 text-sm" inputMode="numeric" placeholder="9xxxxxxxxx" value={form.mobile}
              onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs font-semibold">Address / Notes (optional)</Label>
            <Textarea className="mt-1 text-sm resize-none" rows={2} placeholder="Address or any notes"
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
          </div>
        </div>
        <DialogFooter className="gap-2 pt-1 flex-row justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={create.isPending} onClick={handleSubmit}
            style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", color: "#fff" }}>
            {create.isPending ? "Adding…" : "Add Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Summary Banner ────────────────────────────────────────────────────────────
function SummaryBanner() {
  const { data, isLoading } = useGetUdhariSummary();
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.10)" }}>
        <div style={{ height: 3, background: "linear-gradient(90deg,#f97316,#fb923c)" }} />
        <div className="bg-white px-4 py-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">To Collect</p>
          {isLoading ? <Skeleton className="h-6 w-24 mt-1" /> :
            <p className="text-lg font-black mt-0.5" style={{ color: "#ea580c" }}>
              {fmt(data?.toCollect ?? 0)}
            </p>}
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 2px 12px rgba(16,185,129,0.10)" }}>
        <div style={{ height: 3, background: "linear-gradient(90deg,#10b981,#34d399)" }} />
        <div className="bg-white px-4 py-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">To Pay</p>
          {isLoading ? <Skeleton className="h-6 w-24 mt-1" /> :
            <p className="text-lg font-black mt-0.5" style={{ color: "#059669" }}>
              {fmt(data?.toPay ?? 0)}
            </p>}
        </div>
      </div>
    </div>
  );
}

// ─── Customer Card (Mobile) ────────────────────────────────────────────────────
function CustomerCard({ c, onClick }: { c: any; onClick: () => void }) {
  const initials = c.name.slice(0, 2).toUpperCase();
  const color = c.balance > 0 ? "#ea580c" : c.balance < 0 ? "#059669" : "#94a3b8";
  const bg = c.balance > 0 ? "rgba(249,115,22,0.10)" : c.balance < 0 ? "rgba(16,185,129,0.10)" : "rgba(148,163,184,0.10)";
  return (
    <button onClick={onClick} className="w-full text-left bg-white rounded-2xl overflow-hidden flex items-center gap-3 px-4 py-3"
      style={{ boxShadow: "0 1px 8px rgba(11,44,96,0.07)" }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm"
        style={{ background: bg, color }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate" style={{ color: "#0b2c60" }}>{c.name}</p>
        {c.mobile && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Phone size={9} /> {c.mobile}
          </p>
        )}
        <div className="mt-1"><BalanceBadge balance={c.balance} /></div>
      </div>
      <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
    </button>
  );
}

// ─── Customer Row (Desktop) ────────────────────────────────────────────────────
function CustomerRow({ c, onClick }: { c: any; onClick: () => void }) {
  const initials = c.name.slice(0, 2).toUpperCase();
  const color = c.balance > 0 ? "#ea580c" : c.balance < 0 ? "#059669" : "#94a3b8";
  const bg = c.balance > 0 ? "rgba(249,115,22,0.10)" : c.balance < 0 ? "rgba(16,185,129,0.10)" : "rgba(148,163,184,0.10)";
  return (
    <tr className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={onClick}>
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0"
            style={{ background: bg, color }}>
            {initials}
          </div>
          <span className="font-semibold text-sm text-foreground">{c.name}</span>
        </div>
      </td>
      <td className="px-5 py-3 text-xs text-muted-foreground">{c.mobile || "—"}</td>
      <td className="px-5 py-3"><BalanceBadge balance={c.balance} /></td>
      <td className="px-5 py-3 text-xs text-muted-foreground">
        {new Date(c.updatedAt).toLocaleDateString("en-IN")}
      </td>
      <td className="px-5 py-3">
        <ChevronRight size={14} className="text-muted-foreground" />
      </td>
    </tr>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Udhari() {
  const [, setLocation] = useLocation();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("recent");
  const [showAdd, setShowAdd] = useState(false);

  const { data: customers = [], isLoading } = useListUdhariCustomers({ q: q || undefined, sort: sort as any });

  const sorted = useMemo(() => {
    let list = [...(customers as any[])];
    if (sort === "balance_desc") list.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
    else if (sort === "alpha") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [customers, sort]);

  const go = (id: number) => setLocation(`/udhari/${id}`);

  return (
    <Layout>
      <div className="space-y-4 pb-6 sm:space-y-5 sm:pb-0">

        {/* Page header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)" }}>
              <BookOpen size={14} color="#fff" />
            </div>
            <div>
              <h1 className="font-black text-lg leading-tight" style={{ color: "#0b2c60" }}>
                Udhari Khata
              </h1>
              <p className="text-[11px] text-muted-foreground leading-none">Customer Credit Ledger</p>
            </div>
          </div>
          {/* Desktop add button */}
          <Button size="sm" className="hidden sm:flex" onClick={() => setShowAdd(true)}
            style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", color: "#fff" }}>
            <Plus size={14} className="mr-1" /> Add Customer
          </Button>
        </div>

        {/* Summary */}
        <SummaryBanner />

        {/* Search + Sort */}
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8 h-9 text-sm w-full" placeholder="Search by name or mobile…"
              value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-9 w-[130px] sm:w-[150px] text-xs flex-shrink-0">
              <SortAsc size={12} className="mr-1 text-muted-foreground flex-shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="balance_desc">Highest Balance</SelectItem>
              <SelectItem value="alpha">A → Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile card list */}
        <div className="space-y-2 sm:hidden">
          {isLoading ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
          ) : sorted.length === 0 ? (
            <div className="text-center py-14">
              <Users size={32} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">No customers yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Tap + to add your first customer</p>
            </div>
          ) : (
            sorted.map((c: any) => <CustomerCard key={c.id} c={c} onClick={() => go(c.id)} />)
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16">
              <Users size={36} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">No customers yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Click "Add Customer" to get started</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["CUSTOMER", "MOBILE", "BALANCE", "LAST ACTIVITY", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-2.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sorted.map((c: any) => <CustomerRow key={c.id} c={c} onClick={() => go(c.id)} />)}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile FAB */}
        <button
          onClick={() => setShowAdd(true)}
          className="sm:hidden fixed bottom-20 right-5 w-14 h-14 rounded-full flex items-center justify-center z-30 shadow-lg"
          style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", boxShadow: "0 4px 20px rgba(11,44,96,0.40)" }}>
          <Plus size={24} color="#fff" />
        </button>
      </div>

      <AddCustomerDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </Layout>
  );
}
