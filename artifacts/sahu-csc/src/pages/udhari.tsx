import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionLoader } from "@/components/section-loader";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useListUdhariCustomers,
  useCreateUdhariCustomer,
  useGetUdhariSummary,
} from "@workspace/api-client-react";
import {
  Plus, Search, SortAsc, Users, ChevronRight, Phone, BookOpen,
  ArrowUpRight, ArrowDownLeft, IndianRupee, X, CheckCircle2, User, FileText,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return `₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function BalanceBadge({ balance }: { balance: number }) {
  const { t } = useTranslation();
  if (balance > 0) {
    return (
      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background: "rgba(249,115,22,0.12)", color: "#ea580c" }}>
        {t("udhari.to_collect")} {fmt(balance)}
      </span>
    );
  }
  if (balance < 0) {
    return (
      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background: "rgba(16,185,129,0.12)", color: "#059669" }}>
        {t("udhari.to_pay")} {fmt(balance)}
      </span>
    );
  }
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
      {t("udhari.settled_zero")}
    </span>
  );
}

// ─── Add Customer Dialog / Desktop Panel ──────────────────────────────────────
function AddCustomerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isMobile = useIsMobile();
  const [form, setForm] = useState({ name: "", mobile: "", address: "", notes: "" });
  const create = useCreateUdhariCustomer();

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast({ title: t("udhari.toast_name_required"), variant: "destructive" }); return; }
    try {
      await create.mutateAsync({ data: { name: form.name.trim(), mobile: form.mobile || undefined, address: form.address || undefined, notes: form.notes || undefined } });
      qc.invalidateQueries({ queryKey: ["/api/udhari/customers"] });
      qc.invalidateQueries({ queryKey: ["/api/udhari/summary"] });
      toast({ title: t("udhari.toast_added") });
      setForm({ name: "", mobile: "", address: "", notes: "" });
      onClose();
    } catch {
      toast({ title: t("udhari.toast_add_fail"), variant: "destructive" });
    }
  };

  /* ── Mobile: Dialog ── */
  if (isMobile) return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold" style={{ color: "#0b2c60" }}>{t("udhari.add_customer")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div>
            <Label className="text-xs font-semibold">{t("udhari.name_label")}</Label>
            <Input className="mt-1 h-9 text-sm" placeholder={t("udhari.name_placeholder")} value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          </div>
          <div>
            <Label className="text-xs font-semibold">{t("udhari.mobile_label")}</Label>
            <Input className="mt-1 h-9 text-sm" inputMode="numeric" placeholder={t("udhari.mobile_placeholder")} value={form.mobile}
              onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs font-semibold">{t("udhari.address_label")}</Label>
            <Textarea className="mt-1 text-sm resize-none" rows={2} placeholder={t("udhari.address_placeholder")}
              value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
          </div>
        </div>
        <DialogFooter className="gap-2 pt-1 flex-row justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>{t("common.cancel")}</Button>
          <Button size="sm" disabled={create.isPending} onClick={handleSubmit}
            style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", color: "#fff" }}>
            {create.isPending ? t("udhari.adding") : t("udhari.add_customer")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  /* ── Desktop: V2 Full-screen split layout ── */
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(11,44,96,0.40)", backdropFilter: "blur(4px)", zIndex: 49 }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>

        {/* LEFT INFO PANEL */}
        <div style={{ width: 380, flexShrink: 0, background: "linear-gradient(160deg,#7c2d12 0%,#c2410c 50%,#f97316 100%)", display: "flex", flexDirection: "column", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(11,44,96,0.15)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48, position: "relative" }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "#0b2c60", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
            </div>
            <div><span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>SAHU CSC</span></div>
          </div>
          <div style={{ position: "relative", marginBottom: 28 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,255,255,0.20)", border: "2px solid rgba(255,255,255,0.30)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <User size={30} color="#fff" />
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 8, padding: "4px 10px", marginBottom: 12 }}>
              <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Udhari Khata</span>
            </div>
            <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>Add New Customer</h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.7 }}>Create a customer profile to start tracking what you gave and what you received.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: "auto", position: "relative" }}>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>After adding customer</p>
            {["Add You Gave / You Got entries", "Send WhatsApp payment reminders", "Generate PDF account statement", "Track running balance in real-time"].map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.10)" : "none" }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ArrowUpRight size={11} color="#fff" />
                </div>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: 500 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8fafc" }}>
          <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0b2c60", margin: 0 }}>Customer Details</h2>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>Udhari Khata › Add Customer</p>
            </div>
            <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={16} color="#64748b" />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px" }}>
            <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Name — featured */}
              <div style={{ background: "linear-gradient(135deg,rgba(249,115,22,0.05),rgba(251,146,60,0.03))", border: "2px solid rgba(249,115,22,0.20)", borderRadius: 20, padding: "20px 24px" }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#f97316", textTransform: "uppercase" as const, letterSpacing: "0.1em", display: "block", marginBottom: 10 }}>Full Name *</label>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: "linear-gradient(135deg,#f97316,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(249,115,22,0.35)" }}>
                    <User size={20} color="#fff" />
                  </div>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    placeholder="Customer's full name" autoFocus
                    style={{ flex: 1, fontSize: 24, fontWeight: 800, color: "#0b2c60", background: "transparent", border: "none", outline: "none" }} />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Mobile <span style={{ fontWeight: 400, textTransform: "none" as const, color: "#94a3b8" }}>(optional)</span></label>
                <div style={{ position: "relative" }}>
                  <Phone size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input inputMode="numeric" value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                    placeholder="10-digit mobile number"
                    style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: "#0b2c60", outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "monospace", letterSpacing: "0.06em", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                    onFocus={e => (e.target.style.borderColor = "#f97316")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
              </div>

              {/* Address */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Address / Notes <span style={{ fontWeight: 400, textTransform: "none" as const, color: "#94a3b8" }}>(optional)</span></label>
                <div style={{ position: "relative" }}>
                  <FileText size={15} style={{ position: "absolute", left: 14, top: 16, color: "#94a3b8" }} />
                  <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    rows={4} placeholder="Village, district, or any notes…"
                    style={{ width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 14, paddingBottom: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0b2c60", resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", lineHeight: 1.7, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                    onFocus={e => (e.target.style.borderColor = "#f97316")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
              </div>

              {/* Info card */}
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckCircle2 size={15} color="#059669" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#065f46", marginBottom: 2 }}>Starting Balance: ₹0.00</p>
                  <p style={{ fontSize: 12, color: "#16a34a", lineHeight: 1.6 }}>Add entries after creating the customer. Their balance updates automatically.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: "#fff", borderTop: "1px solid #f1f5f9", padding: "20px 40px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            <button onClick={onClose} style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>{t("common.cancel")}</button>
            <button onClick={handleSubmit} disabled={create.isPending}
              style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#7c2d12,#f97316)", color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(249,115,22,0.35)", opacity: create.isPending ? 0.7 : 1 }}>
              <CheckCircle2 size={18} strokeWidth={2.5} />
              {create.isPending ? t("udhari.adding") : `${t("udhari.add_customer")}${form.name.trim() ? ` — ${form.name.trim()}` : ""}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Summary Banner ────────────────────────────────────────────────────────────
function SummaryBanner() {
  const { t } = useTranslation();
  const { data, isLoading } = useGetUdhariSummary();
  const cards = [
    {
      label: t("udhari.to_collect"), value: (data as any)?.toCollect ?? 0,
      accent: "linear-gradient(135deg,#f97316,#ea580c)", color: "#ea580c",
      light: "rgba(249,115,22,0.07)", border: "rgba(249,115,22,0.18)",
      icon: ArrowUpRight, sub: t("udhari.customers_owe"),
    },
    {
      label: t("udhari.to_pay"), value: (data as any)?.toPay ?? 0,
      accent: "linear-gradient(135deg,#10b981,#059669)", color: "#059669",
      light: "rgba(16,185,129,0.07)", border: "rgba(16,185,129,0.18)",
      icon: ArrowDownLeft, sub: t("udhari.you_owe"),
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl overflow-hidden bg-white"
          style={{ boxShadow: `0 2px 12px ${c.color}18`, border: `1px solid ${c.border}` }}>
          <div style={{ height: 3, background: c.accent }} />
          <div className="px-4 py-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>{c.label}</p>
              {isLoading
                ? <div className="h-6 w-24 mt-1 rounded bg-slate-100 animate-pulse" />
                : <p style={{ fontSize: 18, fontWeight: 900, color: c.color, lineHeight: 1.1, marginTop: 3 }}>{fmt(c.value)}</p>}
              <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{c.sub}</p>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, background: c.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 10px ${c.color}28` }}>
              <c.icon size={16} color="#fff" />
            </div>
          </div>
        </div>
      ))}
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
  const { t } = useTranslation();
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
                {t("udhari.title")}
              </h1>
              <p className="text-[11px] text-muted-foreground leading-none">{t("udhari.subtitle")}</p>
            </div>
          </div>
          {/* Desktop add button */}
          <Button size="sm" className="hidden sm:flex" onClick={() => setShowAdd(true)}
            style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", color: "#fff" }}>
            <Plus size={14} className="mr-1" /> {t("udhari.add_customer")}
          </Button>
        </div>

        {/* Summary */}
        <SummaryBanner />

        {/* Search + Sort */}
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8 h-9 text-sm w-full" placeholder={t("udhari.search_placeholder")}
              value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-9 w-[130px] sm:w-[150px] text-xs flex-shrink-0">
              <SortAsc size={12} className="mr-1 text-muted-foreground flex-shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t("udhari.most_recent")}</SelectItem>
              <SelectItem value="balance_desc">{t("udhari.highest_balance")}</SelectItem>
              <SelectItem value="alpha">{t("udhari.a_to_z")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile card list */}
        <div className="space-y-2 sm:hidden">
          {isLoading ? (
            <SectionLoader message="Loading customers…" />
          ) : sorted.length === 0 ? (
            <div className="text-center py-14">
              <Users size={32} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">{t("udhari.no_customers")}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{t("udhari.tap_to_add")}</p>
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
              <p className="text-sm font-semibold text-muted-foreground">{t("udhari.no_customers")}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{t("udhari.click_to_add")}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {[t("udhari.col_customer"), t("udhari.col_mobile"), t("udhari.col_balance"), t("udhari.col_last_activity"), ""].map((h) => (
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
