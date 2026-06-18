import { useState, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useGetUdhariCustomer, useListUdhariEntries,
  useCreateUdhariEntry, useUpdateUdhariEntry, useDeleteUdhariEntry,
  useUpdateUdhariCustomer, useDeleteUdhariCustomer,
} from "@workspace/api-client-react";
import {
  ArrowLeft, Phone, Pencil, Trash2, MessageCircle,
  ArrowUpRight, ArrowDownLeft, Plus, FileDown, MoreHorizontal,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];
function fmt(n: number) {
  return `₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

// ─── Balance Banner ───────────────────────────────────────────────────────────
function BalanceBanner({ balance }: { balance: number }) {
  const isCollect = balance > 0;
  const isPay = balance < 0;
  const color = isCollect ? "#ea580c" : isPay ? "#059669" : "#64748b";
  const bg = isCollect
    ? "linear-gradient(135deg,#fff7ed,#fed7aa)"
    : isPay
      ? "linear-gradient(135deg,#f0fdf4,#bbf7d0)"
      : "linear-gradient(135deg,#f8fafc,#f1f5f9)";

  return (
    <div className="rounded-2xl p-5 text-center" style={{ background: bg, boxShadow: `0 2px 16px ${color}22` }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: `${color}99` }}>
        {isCollect ? "To Collect" : isPay ? "To Pay" : "Settled"}
      </p>
      <p className="text-4xl font-black" style={{ color }}>{fmt(balance)}</p>
      {balance === 0 && <p className="text-xs text-muted-foreground mt-1">No pending amount</p>}
    </div>
  );
}

// ─── Entry Form Dialog ─────────────────────────────────────────────────────────
interface EntryFormProps {
  customerId: number;
  mode: "gave" | "got";
  existing?: any;
  open: boolean;
  onClose: () => void;
}
function EntryFormDialog({ customerId, mode, existing, open, onClose }: EntryFormProps) {
  const { toast } = useToast();
  const isEdit = !!existing;
  const [form, setForm] = useState({
    date: existing?.date ?? today(),
    amount: existing ? String(existing.amount) : "",
    note: existing?.note ?? "",
    type: existing?.type ?? mode,
  });
  const create = useCreateUdhariEntry();
  const update = useUpdateUdhariEntry();

  const handleSave = async () => {
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" }); return;
    }
    try {
      if (isEdit) {
        await update.mutateAsync({ customerId, entryId: existing.id, data: { date: form.date, type: form.type as any, amount: amt, note: form.note } });
        toast({ title: "Entry updated" });
      } else {
        await create.mutateAsync({ customerId, data: { date: form.date, type: form.type as any, amount: amt, note: form.note } });
        toast({ title: form.type === "gave" ? "₹ You Gave recorded" : "₹ You Got recorded" });
      }
      onClose();
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  const typeColor = form.type === "gave" ? "#ea580c" : "#059669";
  const typeLabel = form.type === "gave" ? "You Gave (Customer owes more)" : "You Got (Customer paid back)";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold flex items-center gap-2">
            <span className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: `${typeColor}18` }}>
              {form.type === "gave"
                ? <ArrowUpRight size={13} style={{ color: typeColor }} />
                : <ArrowDownLeft size={13} style={{ color: typeColor }} />}
            </span>
            <span style={{ color: typeColor }}>{isEdit ? "Edit Entry" : (form.type === "gave" ? "You Gave" : "You Got")}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div>
            <Label className="text-xs font-semibold">Amount (₹) *</Label>
            <Input className="mt-1 h-10 text-lg font-bold" type="number" min="0" step="0.01"
              placeholder="0.00" value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs font-semibold">Date</Label>
            <Input className="mt-1 h-9 text-sm" type="date" value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs font-semibold">Note (optional)</Label>
            <Textarea className="mt-1 text-sm resize-none" rows={2} placeholder="What was this for?"
              value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
          </div>
          <p className="text-[10px] text-muted-foreground">{typeLabel}</p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={create.isPending || update.isPending} onClick={handleSave}
            style={{ background: `linear-gradient(135deg,${typeColor},${typeColor}cc)`, color: "#fff" }}>
            {create.isPending || update.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Customer Dialog ──────────────────────────────────────────────────────
function EditCustomerDialog({ customer, open, onClose }: { customer: any; open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: customer.name, mobile: customer.mobile ?? "", address: customer.address ?? "" });
  const update = useUpdateUdhariCustomer();

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    try {
      await update.mutateAsync({ customerId: customer.id, data: { name: form.name.trim(), mobile: form.mobile || null, address: form.address || null } });
      toast({ title: "Customer updated" });
      onClose();
    } catch { toast({ title: "Failed to update", variant: "destructive" }); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold" style={{ color: "#0b2c60" }}>Edit Customer</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div>
            <Label className="text-xs font-semibold">Name *</Label>
            <Input className="mt-1 h-9 text-sm" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs font-semibold">Mobile</Label>
            <Input className="mt-1 h-9 text-sm" placeholder="Optional" value={form.mobile}
              onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs font-semibold">Address / Notes</Label>
            <Textarea className="mt-1 text-sm resize-none" rows={2} value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={update.isPending} onClick={handleSave}
            style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", color: "#fff" }}>
            {update.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Entry Row ─────────────────────────────────────────────────────────────────
function EntryRow({ e, onEdit, onDelete }: { e: any; onEdit: () => void; onDelete: () => void }) {
  const isGave = e.type === "gave";
  const color = isGave ? "#ea580c" : "#059669";
  const bg = isGave ? "rgba(249,115,22,0.08)" : "rgba(16,185,129,0.08)";
  const label = isGave ? "You Gave" : "You Got";

  return (
    <div className="bg-white rounded-xl flex items-start gap-3 px-4 py-3"
      style={{ boxShadow: "0 1px 6px rgba(11,44,96,0.06)" }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: bg }}>
        {isGave
          ? <ArrowUpRight size={15} style={{ color }} />
          : <ArrowDownLeft size={15} style={{ color }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold" style={{ color }}>{label}</span>
          <span className="text-sm font-black" style={{ color }}>{isGave ? "+" : "-"}{fmt(e.amount)}</span>
        </div>
        {e.note && <p className="text-xs text-muted-foreground mt-0.5 truncate">{e.note}</p>}
        <p className="text-[10px] text-muted-foreground mt-1">{e.date}</p>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <button onClick={onEdit}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
          <Pencil size={11} className="text-muted-foreground" />
        </button>
        <button onClick={onDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors">
          <Trash2 size={11} className="text-destructive" />
        </button>
      </div>
    </div>
  );
}

// ─── Print / PDF Export ────────────────────────────────────────────────────────
function printLedger(customer: any, entries: any[]) {
  const rows = entries.map((e) => `
    <tr>
      <td>${e.date}</td>
      <td style="color:${e.type === 'gave' ? '#ea580c' : '#059669'}">${e.type === 'gave' ? 'You Gave' : 'You Got'}</td>
      <td style="text-align:right;font-weight:bold;color:${e.type === 'gave' ? '#ea580c' : '#059669'}">
        ${e.type === 'gave' ? '+' : '-'}₹${Math.abs(e.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
      <td>${e.note || '—'}</td>
    </tr>`).join("");

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Udhari Khata — ${customer.name}</title>
    <style>
      body{font-family:sans-serif;padding:32px;color:#1e293b;max-width:700px;margin:0 auto}
      h1{color:#0b2c60;font-size:22px;margin:0}
      .sub{color:#64748b;font-size:12px;margin:4px 0 0}
      .balance{font-size:28px;font-weight:900;margin:16px 0 8px}
      .collect{color:#ea580c}.pay{color:#059669}.settled{color:#64748b}
      table{width:100%;border-collapse:collapse;margin-top:20px;font-size:13px}
      th{background:#f1f5f9;padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#64748b}
      td{padding:8px 12px;border-bottom:1px solid #f1f5f9}
      @media print{button{display:none}}
    </style></head><body>
    <h1>Udhari Khata — ${customer.name}</h1>
    <p class="sub">${customer.mobile ? `📞 ${customer.mobile}` : ''} ${customer.address ? `· ${customer.address}` : ''}</p>
    <p class="sub">Printed: ${new Date().toLocaleString('en-IN')}</p>
    <p class="balance ${customer.balance > 0 ? 'collect' : customer.balance < 0 ? 'pay' : 'settled'}">
      ${customer.balance > 0 ? 'To Collect' : customer.balance < 0 ? 'To Pay' : 'Settled'}: 
      ₹${Math.abs(customer.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
    </p>
    <table>
      <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Note</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <script>window.print()</script>
  </body></html>`);
  win.document.close();
}

// ─── WhatsApp Reminder ────────────────────────────────────────────────────────
function sendReminder(customer: any) {
  const balance = customer.balance;
  if (!customer.mobile) return;

  const dir = balance > 0 ? "To Collect" : "To Pay";
  const amt = `₹${Math.abs(balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const msg = balance > 0
    ? `Namaste ${customer.name} ji 🙏\n\nYour pending balance in our Udhari Khata is *${amt}* (To Pay).\n\nKindly settle at your earliest convenience.\n\n— SAHU CSC`
    : `Namaste ${customer.name} ji 🙏\n\nWe owe you *${amt}* in our Udhari Khata. We will settle it soon.\n\n— SAHU CSC`;

  const mobile = customer.mobile.replace(/\D/g, "");
  const url = `https://wa.me/${mobile.startsWith("91") ? mobile : `91${mobile}`}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function UdhariCustomer() {
  const { customerId } = useParams<{ customerId: string }>();
  const id = parseInt(customerId ?? "0");
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const { data: customer, isLoading: custLoading } = useGetUdhariCustomer(id);
  const { data: entries = [], isLoading: entriesLoading } = useListUdhariEntries(id);

  const [entryDialog, setEntryDialog] = useState<{ open: boolean; mode: "gave" | "got"; existing?: any }>({ open: false, mode: "gave" });
  const [editCustomer, setEditCustomer] = useState(false);
  const [deleteCustomerConfirm, setDeleteCustomerConfirm] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<number | null>(null);

  const deleteCustomer = useDeleteUdhariCustomer();
  const deleteEntry = useDeleteUdhariEntry();

  const handleDeleteCustomer = async () => {
    try {
      await deleteCustomer.mutateAsync({ customerId: id });
      toast({ title: "Customer deleted" });
      setLocation("/udhari");
    } catch { toast({ title: "Failed to delete", variant: "destructive" }); }
  };

  const handleDeleteEntry = async () => {
    if (!deleteEntryId) return;
    try {
      await deleteEntry.mutateAsync({ customerId: id, entryId: deleteEntryId });
      toast({ title: "Entry deleted" });
      setDeleteEntryId(null);
    } catch { toast({ title: "Failed to delete", variant: "destructive" }); }
  };

  if (custLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Customer not found</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setLocation("/udhari")}>
            Back to Udhari Khata
          </Button>
        </div>
      </Layout>
    );
  }

  const c = customer as any;
  const entryList = entries as any[];

  return (
    <Layout>
      <div className={isMobile ? "space-y-4 pb-24" : "space-y-5"}>

        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/udhari")}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted hover:bg-muted/70 transition-colors">
            <ArrowLeft size={15} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-lg leading-tight truncate" style={{ color: "#0b2c60" }}>
              {c.name}
            </h1>
            {c.mobile && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Phone size={9} /> {c.mobile}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted hover:bg-muted/70 transition-colors">
                <MoreHorizontal size={15} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setEditCustomer(true)}>
                <Pencil size={13} className="mr-2" /> Edit Customer
              </DropdownMenuItem>
              {c.mobile && (
                <DropdownMenuItem onClick={() => sendReminder(c)}>
                  <MessageCircle size={13} className="mr-2" /> Send Reminder
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => printLedger(c, entryList)}>
                <FileDown size={13} className="mr-2" /> Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive"
                onClick={() => setDeleteCustomerConfirm(true)}>
                <Trash2 size={13} className="mr-2" /> Delete Customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Balance banner */}
        <BalanceBanner balance={c.balance} />

        {/* Quick action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setEntryDialog({ open: true, mode: "gave" })}
            className="rounded-2xl py-4 flex flex-col items-center gap-1.5 font-bold text-sm transition-transform active:scale-95"
            style={{ background: "linear-gradient(135deg,#fff7ed,#fed7aa)", color: "#ea580c", boxShadow: "0 2px 12px rgba(249,115,22,0.15)" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(249,115,22,0.15)" }}>
              <ArrowUpRight size={20} style={{ color: "#ea580c" }} />
            </div>
            You Gave
            <span className="text-[10px] font-normal opacity-70">Customer owes more</span>
          </button>
          <button
            onClick={() => setEntryDialog({ open: true, mode: "got" })}
            className="rounded-2xl py-4 flex flex-col items-center gap-1.5 font-bold text-sm transition-transform active:scale-95"
            style={{ background: "linear-gradient(135deg,#f0fdf4,#bbf7d0)", color: "#059669", boxShadow: "0 2px 12px rgba(16,185,129,0.15)" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.15)" }}>
              <ArrowDownLeft size={20} style={{ color: "#059669" }} />
            </div>
            You Got
            <span className="text-[10px] font-normal opacity-70">Customer paid back</span>
          </button>
        </div>

        {/* Action bar (desktop) */}
        {!isMobile && (
          <div className="flex gap-2 justify-end">
            {c.mobile && (
              <Button variant="outline" size="sm" onClick={() => sendReminder(c)}>
                <MessageCircle size={13} className="mr-1.5" /> Send Reminder
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => printLedger(c, entryList)}>
              <FileDown size={13} className="mr-1.5" /> Export PDF
            </Button>
          </div>
        )}

        {/* Entries */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Transaction History
          </p>
          {entriesLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : entryList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl"
              style={{ boxShadow: "0 1px 6px rgba(11,44,96,0.06)" }}>
              <Plus size={28} className="mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground font-medium">No entries yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Use "You Gave" or "You Got" to add the first entry</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entryList.map((e: any) => (
                <EntryRow
                  key={e.id}
                  e={e}
                  onEdit={() => setEntryDialog({ open: true, mode: e.type, existing: e })}
                  onDelete={() => setDeleteEntryId(e.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Entry dialog */}
      {entryDialog.open && (
        <EntryFormDialog
          customerId={id}
          mode={entryDialog.mode}
          existing={entryDialog.existing}
          open={entryDialog.open}
          onClose={() => setEntryDialog({ open: false, mode: "gave" })}
        />
      )}

      {/* Edit customer dialog */}
      {editCustomer && (
        <EditCustomerDialog customer={c} open={editCustomer} onClose={() => setEditCustomer(false)} />
      )}

      {/* Delete entry confirm */}
      <AlertDialog open={deleteEntryId !== null} onOpenChange={(v) => { if (!v) setDeleteEntryId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This entry will be permanently removed and the balance will be recalculated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteEntry}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete customer confirm */}
      <AlertDialog open={deleteCustomerConfirm} onOpenChange={setDeleteCustomerConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {c.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer and all their entries. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteCustomer} disabled={deleteCustomer.isPending}>
              Delete Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
