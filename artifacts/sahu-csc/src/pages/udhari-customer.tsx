import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UdhariCustomerHeaderSkeleton, SessionsListSkeleton } from "@/components/skeletons";
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
  useGetSettings,
} from "@workspace/api-client-react";
import {
  ArrowLeft, Phone, Pencil, Trash2, MessageCircle,
  ArrowUpRight, ArrowDownLeft, Plus, FileDown, MoreHorizontal, Receipt,
  X, Calendar, FileText, CheckCircle2,
} from "lucide-react";
import { UdhariReceiptModal } from "@/components/udhari-receipt-modal";
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
  const { t } = useTranslation();
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
        {isCollect ? t("udhari.customer.to_collect") : isPay ? t("udhari.customer.to_pay") : t("udhari.customer.settled")}
      </p>
      <p className="text-4xl font-black" style={{ color }}>{fmt(balance)}</p>
      {balance === 0 && <p className="text-xs text-muted-foreground mt-1">{t("udhari.customer.no_pending")}</p>}
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
  customer?: any;
}
function EntryFormDialog({ customerId, mode, existing, open, onClose, customer }: EntryFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isEdit = !!existing;
  const [form, setForm] = useState({
    date: existing?.date ?? today(),
    amount: existing ? String(existing.amount) : "",
    note: existing?.note ?? "",
    type: (existing?.type ?? mode) as "gave" | "got",
  });
  const create = useCreateUdhariEntry();
  const update = useUpdateUdhariEntry();

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: [`/api/udhari/customers/${customerId}/entries`] });
    qc.invalidateQueries({ queryKey: [`/api/udhari/customers/${customerId}`] });
    qc.invalidateQueries({ queryKey: ["/api/udhari/customers"] });
    qc.invalidateQueries({ queryKey: ["/api/udhari/summary"] });
  };

  const handleSave = async () => {
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) {
      toast({ title: t("udhari.customer.toast_invalid_amount"), variant: "destructive" }); return;
    }
    try {
      if (isEdit) {
        await update.mutateAsync({ customerId, entryId: existing.id, data: { date: form.date, type: form.type, amount: amt, note: form.note } });
        invalidateAll();
        toast({ title: t("udhari.customer.toast_updated") });
      } else {
        await create.mutateAsync({ customerId, data: { date: form.date, type: form.type, amount: amt, note: form.note } });
        invalidateAll();
        toast({ title: t(form.type === "gave" ? "udhari.customer.toast_gave_recorded" : "udhari.customer.toast_got_recorded") });
      }
      onClose();
    } catch {
      toast({ title: t("udhari.customer.toast_save_fail"), variant: "destructive" });
    }
  };

  const isGave = form.type === "gave";
  const accentColor = isGave ? "#ea580c" : "#059669";
  const headerGrad = isGave ? "linear-gradient(145deg,#7c2d12,#ea580c)" : "linear-gradient(145deg,#064e3b,#059669)";
  const accentBg = isGave ? "rgba(234,88,12,0.08)" : "rgba(5,150,105,0.08)";
  const accentBorder = isGave ? "rgba(234,88,12,0.2)" : "rgba(5,150,105,0.2)";
  const amtGrad = isGave ? "linear-gradient(135deg,#7c2d12,#ea580c)" : "linear-gradient(135deg,#064e3b,#059669)";

  // Live balance preview
  const currentBalance = customer?.balance ?? 0;
  const entryAmt = parseFloat(form.amount) || 0;
  const previewBalance = isGave ? currentBalance + entryAmt : currentBalance - entryAmt;
  const previewLabel = previewBalance > 0 ? `₹${previewBalance.toLocaleString("en-IN")} to collect` : previewBalance < 0 ? `₹${Math.abs(previewBalance).toLocaleString("en-IN")} to pay` : "Settled ✓";
  const previewColor = previewBalance > 0 ? "#ea580c" : previewBalance < 0 ? "#059669" : "#64748b";

  const isMobile = useIsMobile();

  /* ── Customer header card (shared) ── */
  const CustomerChip = () => customer ? (
    <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "7px 12px", display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{customer.name?.charAt(0).toUpperCase()}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Customer</p>
        <p style={{ color: "#fff", fontSize: 12, fontWeight: 800, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customer.name}</p>
      </div>
      <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 6, padding: "3px 8px", flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>
          {currentBalance > 0 ? `₹${currentBalance.toLocaleString("en-IN")} owed` : currentBalance < 0 ? `₹${Math.abs(currentBalance).toLocaleString("en-IN")} to pay` : "Settled"}
        </span>
      </div>
    </div>
  ) : null;

  /* ── Mobile: Dialog ── */
  if (isMobile) return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl p-0 overflow-hidden gap-0">
        <div className="flex justify-center pt-3 pb-0">
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
        </div>
        <div style={{ background: headerGrad, margin: "12px 16px 0", borderRadius: 18, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -16, right: -16, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.1)", pointerEvents: "none" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isGave ? <ArrowUpRight size={18} color="#fff" strokeWidth={2.5} /> : <ArrowDownLeft size={18} color="#fff" strokeWidth={2.5} />}
              </div>
              <div>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Udhari Khata</p>
                <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 900, lineHeight: 1.1, marginTop: 2 }}>{isEdit ? t("udhari.customer.edit_entry") : (isGave ? t("udhari.customer.you_gave") : t("udhari.customer.you_got"))}</h3>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", outline: "none" }}>
              <X size={13} color="#fff" />
            </button>
          </div>
          {customer && <div style={{ marginTop: 10 }}><CustomerChip /></div>}
        </div>
        <div className="px-4 pt-3 pb-5 space-y-3">
          {!isEdit && (
            <div style={{ background: "#f1f5f9", borderRadius: 14, padding: 4, display: "flex", gap: 4 }}>
              {(["gave", "got"] as const).map(typ => (
                <button key={typ} type="button" onClick={() => setForm(p => ({ ...p, type: typ }))}
                  style={{ flex: 1, height: 42, borderRadius: 11, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, background: form.type === typ ? (typ === "gave" ? "#ea580c" : "#059669") : "transparent", color: form.type === typ ? "#fff" : "#94a3b8", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, boxShadow: form.type === typ ? `0 2px 10px ${typ === "gave" ? "rgba(234,88,12,0.35)" : "rgba(5,150,105,0.35)"}` : "none" }}>
                  {typ === "gave" ? <><ArrowUpRight size={14} strokeWidth={2.5} /> {t("udhari.customer.you_gave")}</> : <><ArrowDownLeft size={14} strokeWidth={2.5} /> {t("udhari.customer.you_got")}</>}
                </button>
              ))}
            </div>
          )}
          <div style={{ background: accentBg, border: `2px solid ${accentBorder}`, borderRadius: 16, padding: "13px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: amtGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 12px ${accentColor}35` }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>₹</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{isGave ? t("udhari.customer.amount_gave") : t("udhari.customer.amount_got")}</p>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00"
                style={{ width: "100%", fontSize: 28, fontWeight: 900, color: accentColor, background: "transparent", border: "none", outline: "none", padding: 0 }} />
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <Calendar size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              style={{ width: "100%", height: 44, paddingLeft: 36, paddingRight: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fafafa", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 600 }} />
          </div>
          <div style={{ position: "relative" }}>
            <FileText size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: 13 }} />
            <textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} rows={2} placeholder="Add a note (optional)"
              style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 12, paddingBottom: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fafafa", fontSize: 13, color: "#0b2c60", outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
          {customer && entryAmt > 0 && (
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #e2e8f0" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>New balance after this entry</p>
              <p style={{ fontSize: 14, fontWeight: 900, color: previewColor }}>{previewLabel}</p>
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, height: 52, borderRadius: 16, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>
              {t("common.cancel")}
            </button>
            <button type="button" onClick={handleSave} disabled={create.isPending || update.isPending}
              style={{ flex: 2, height: 52, borderRadius: 16, border: "none", cursor: "pointer", background: isGave ? "linear-gradient(135deg,#7c2d12,#ea580c)" : "linear-gradient(135deg,#064e3b,#059669)", color: "#fff", fontSize: 16, fontWeight: 900, letterSpacing: "0.02em", boxShadow: `0 6px 20px ${accentColor}40`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: (create.isPending || update.isPending) ? 0.7 : 1 }}>
              <CheckCircle2 size={18} strokeWidth={2.5} />
              {create.isPending || update.isPending ? t("common.saving") : `${t("common.save")} — ${isGave ? t("udhari.customer.you_gave") : t("udhari.customer.you_got")}`}
            </button>
          </div>
        </div>
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
        <div style={{ width: 380, flexShrink: 0, background: headerGrad, display: "flex", flexDirection: "column", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -70, right: -70, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -50, left: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(0,0,0,0.10)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, position: "relative" }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,0.20)", border: "1.5px solid rgba(255,255,255,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
            </div>
            <div><span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>SAHU CSC</span></div>
          </div>

          {/* Customer card */}
          {customer && (
            <div style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 18, padding: "16px 18px", marginBottom: 24, position: "relative" }}>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Customer</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: "rgba(255,255,255,0.20)", border: "2px solid rgba(255,255,255,0.30)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{customer.name?.slice(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <p style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>{customer.name}</p>
                  {customer.mobile && <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>{customer.mobile}</p>}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 24, position: "relative" }}>
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, lineHeight: 1.2, marginBottom: 6 }}>
              {isEdit ? t("udhari.customer.edit_entry") : isGave ? t("udhari.customer.you_gave") : t("udhari.customer.you_got")}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 13, lineHeight: 1.6 }}>
              {isGave ? t("udhari.customer.desc_gave") : t("udhari.customer.desc_got")}
            </p>
          </div>

          {/* Current balance */}
          <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 16, padding: "18px 20px", marginBottom: 12, position: "relative" }}>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Current Balance</p>
            <p style={{ color: "#fff", fontSize: 28, fontWeight: 900 }}>{fmt(currentBalance)}</p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 4 }}>
              {currentBalance > 0 ? `${customer?.name} owes you` : currentBalance < 0 ? `You owe ${customer?.name}` : "Settled"}
            </p>
          </div>

          {/* Balance preview */}
          {entryAmt > 0 && (
            <div style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 14, padding: "14px 18px", marginTop: "auto", position: "relative" }}>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>After This Entry</p>
              <p style={{ color: "#fff", fontSize: 22, fontWeight: 900 }}>{previewLabel}</p>
            </div>
          )}
        </div>

        {/* RIGHT FORM PANEL */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8fafc" }}>
          <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0b2c60", margin: 0 }}>{isEdit ? t("udhari.customer.edit_entry") : isGave ? t("udhari.customer.you_gave") : t("udhari.customer.you_got")}</h2>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>Udhari Khata › {customer?.name}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {!isEdit && (
                <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 14, padding: 4, gap: 4 }}>
                  {(["gave", "got"] as const).map(typ => (
                    <button key={typ} type="button" onClick={() => setForm(p => ({ ...p, type: typ }))}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 11, border: "none", cursor: "pointer", background: form.type === typ ? (typ === "gave" ? "linear-gradient(135deg,#7c2d12,#ea580c)" : "linear-gradient(135deg,#064e3b,#059669)") : "transparent", color: form.type === typ ? "#fff" : "#64748b", fontWeight: 700, fontSize: 13, boxShadow: form.type === typ ? (typ === "gave" ? "0 2px 10px rgba(234,88,12,0.35)" : "0 2px 10px rgba(5,150,105,0.35)") : "none", transition: "all 0.15s" }}>
                      {typ === "gave" ? <><ArrowUpRight size={14} strokeWidth={2.5} /> {t("udhari.customer.you_gave")}</> : <><ArrowDownLeft size={14} strokeWidth={2.5} /> {t("udhari.customer.you_got")}</>}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={16} color="#64748b" />
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
            <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Amount — hero */}
              <div style={{ background: accentBg, border: `2px solid ${accentBorder}`, borderRadius: 20, padding: "20px 24px" }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: "uppercase" as const, letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>
                  {isGave ? "Amount You Gave (₹)" : "Amount You Got (₹)"}
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 15, background: amtGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 14px ${accentColor}35` }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>₹</span>
                  </div>
                  <input type="number" min="0" step="0.01" value={form.amount}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="0.00" autoFocus
                    style={{ flex: 1, fontSize: 38, fontWeight: 900, color: accentColor, background: "transparent", border: "none", outline: "none", letterSpacing: "-0.02em" }} />
                </div>
              </div>

              {/* Date */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Date</label>
                <div style={{ position: "relative" }}>
                  <Calendar size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: "#0b2c60", outline: "none", background: "#fff", boxSizing: "border-box", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                    onFocus={e => (e.target.style.borderColor = accentColor)} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
              </div>

              {/* Note */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Note <span style={{ fontWeight: 400, textTransform: "none" as const, color: "#94a3b8" }}>(optional)</span></label>
                <div style={{ position: "relative" }}>
                  <FileText size={15} style={{ position: "absolute", left: 14, top: 16, color: "#94a3b8" }} />
                  <textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} rows={3}
                    placeholder="Add a note about this transaction…"
                    style={{ width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 14, paddingBottom: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0b2c60", resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", lineHeight: 1.6, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                    onFocus={e => (e.target.style.borderColor = accentColor)} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: "#fff", borderTop: "1px solid #f1f5f9", padding: "20px 40px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            <button onClick={onClose} style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>{t("common.cancel")}</button>
            <button type="button" onClick={handleSave} disabled={create.isPending || update.isPending}
              style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: amtGrad, color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 6px 20px ${accentColor}40`, opacity: (create.isPending || update.isPending) ? 0.7 : 1 }}>
              <CheckCircle2 size={18} strokeWidth={2.5} />
              {create.isPending || update.isPending ? t("common.saving") : `${t("common.save")} — ${isGave ? t("udhari.customer.you_gave") : t("udhari.customer.you_got")}${entryAmt > 0 ? ` ₹${entryAmt.toLocaleString("en-IN")}` : ""}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Edit Customer Dialog ──────────────────────────────────────────────────────
function EditCustomerDialog({ customer, open, onClose }: { customer: any; open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: customer.name, mobile: customer.mobile ?? "", address: customer.address ?? "" });
  const update = useUpdateUdhariCustomer();

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: t("udhari.customer.toast_name_required"), variant: "destructive" }); return; }
    try {
      await update.mutateAsync({ customerId: customer.id, data: { name: form.name.trim(), mobile: form.mobile || null, address: form.address || null } });
      qc.invalidateQueries({ queryKey: [`/api/udhari/customers/${customer.id}`] });
      qc.invalidateQueries({ queryKey: ["/api/udhari/customers"] });
      toast({ title: t("udhari.customer.toast_customer_updated") });
      onClose();
    } catch { toast({ title: t("udhari.customer.toast_update_fail"), variant: "destructive" }); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold" style={{ color: "#0b2c60" }}>{t("udhari.customer.edit_customer")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div>
            <Label className="text-xs font-semibold">{t("udhari.name_label")}</Label>
            <Input className="mt-1 h-9 text-sm" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs font-semibold">{t("udhari.mobile_label")}</Label>
            <Input className="mt-1 h-9 text-sm" placeholder={t("common.optional")} value={form.mobile}
              onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs font-semibold">{t("udhari.address_label")}</Label>
            <Textarea className="mt-1 text-sm resize-none" rows={2} value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>{t("common.cancel")}</Button>
          <Button size="sm" disabled={update.isPending} onClick={handleSave}
            style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", color: "#fff" }}>
            {update.isPending ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Entry Row ─────────────────────────────────────────────────────────────────
function EntryRow({ e, onEdit, onDelete, onReceipt }: { e: any; onEdit: () => void; onDelete: () => void; onReceipt: () => void }) {
  const { t } = useTranslation();
  const isGave = e.type === "gave";
  const color = isGave ? "#ea580c" : "#059669";
  const bg = isGave ? "rgba(249,115,22,0.08)" : "rgba(16,185,129,0.08)";
  const label = isGave ? t("udhari.customer.you_gave") : t("udhari.customer.you_got");

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
        <button onClick={onReceipt} title="View Receipt"
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
          <Receipt size={11} className="text-muted-foreground" />
        </button>
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
  const { t } = useTranslation();
  const { customerId } = useParams<{ customerId: string }>();
  const id = parseInt(customerId ?? "0");
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const { data: customer, isLoading: custLoading } = useGetUdhariCustomer(id);
  const { data: entries = [], isLoading: entriesLoading } = useListUdhariEntries(id);
  const { data: bizSettings } = useGetSettings();
  const businessName = (bizSettings as any)?.businessName ?? "SAHU CSC";
  const businessAddress = (bizSettings as any)?.businessAddress ?? "";
  const businessMobile = (bizSettings as any)?.businessMobile ?? "";
  const businessWebsite = (bizSettings as any)?.businessWebsite ?? "";

  const [entryDialog, setEntryDialog] = useState<{ open: boolean; mode: "gave" | "got"; existing?: any }>({ open: false, mode: "gave" });
  const [editCustomer, setEditCustomer] = useState(false);
  const [deleteCustomerConfirm, setDeleteCustomerConfirm] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<number | null>(null);
  const [receiptEntry, setReceiptEntry] = useState<any>(null);

  const deleteCustomer = useDeleteUdhariCustomer();
  const deleteEntry = useDeleteUdhariEntry();
  const qcMain = useQueryClient();

  const handleDeleteCustomer = async () => {
    try {
      await deleteCustomer.mutateAsync({ customerId: id });
      qcMain.invalidateQueries({ queryKey: ["/api/udhari/customers"] });
      qcMain.invalidateQueries({ queryKey: ["/api/udhari/summary"] });
      toast({ title: "Customer deleted" });
      setLocation("/udhari");
    } catch { toast({ title: "Failed to delete", variant: "destructive" }); }
  };

  const handleDeleteEntry = async () => {
    if (!deleteEntryId) return;
    try {
      await deleteEntry.mutateAsync({ customerId: id, entryId: deleteEntryId });
      qcMain.invalidateQueries({ queryKey: [`/api/udhari/customers/${id}/entries`] });
      qcMain.invalidateQueries({ queryKey: [`/api/udhari/customers/${id}`] });
      qcMain.invalidateQueries({ queryKey: ["/api/udhari/customers"] });
      qcMain.invalidateQueries({ queryKey: ["/api/udhari/summary"] });
      toast({ title: "Entry deleted" });
      setDeleteEntryId(null);
    } catch { toast({ title: "Failed to delete", variant: "destructive" }); }
  };

  if (custLoading) {
    return (
      <Layout>
        <UdhariCustomerHeaderSkeleton />
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
            <SessionsListSkeleton />
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
                  onReceipt={() => setReceiptEntry({ entry: e, customer: c })}
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
          customer={c}
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

      {/* Receipt modal */}
      <UdhariReceiptModal
        open={receiptEntry !== null}
        entry={receiptEntry ? (() => {
          const e = receiptEntry.entry;
          const cust = receiptEntry.customer;
          return {
            id: e.id,
            type: e.type as "gave" | "got",
            amount: e.amount,
            customerName: cust.name,
            customerMobile: cust.mobile ?? null,
            customerAddress: cust.address ?? null,
            note: e.note ?? null,
            date: e.date,
            createdAt: e.createdAt ?? new Date().toISOString(),
            currentBalance: cust.balance,
            receiptToken: e.receiptToken ?? null,
          };
        })() : null}
        onClose={() => setReceiptEntry(null)}
        businessName={businessName}
        businessAddress={businessAddress}
        businessMobile={businessMobile}
        businessWebsite={businessWebsite}
      />
    </Layout>
  );
}
