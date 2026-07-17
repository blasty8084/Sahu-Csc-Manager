import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCreateUdhariEntry, useUpdateUdhariEntry } from "@workspace/api-client-react";
import {
  ArrowDownLeft, ArrowUpRight, Calendar, CheckCircle2, FileText, X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { today, fmt } from "./utils";

interface Props {
  customerId: number;
  mode: "gave" | "got";
  existing?: any;
  open: boolean;
  onClose: () => void;
  customer?: any;
}

export function UdhariAddEntryForm({ customerId, mode, existing, open, onClose, customer }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isMobile = useIsMobile();
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
  const headerGrad  = isGave ? "linear-gradient(145deg,#7c2d12,#ea580c)" : "linear-gradient(145deg,#064e3b,#059669)";
  const accentBg    = isGave ? "rgba(234,88,12,0.08)" : "rgba(5,150,105,0.08)";
  const accentBorder = isGave ? "rgba(234,88,12,0.2)" : "rgba(5,150,105,0.2)";
  const amtGrad     = isGave ? "linear-gradient(135deg,#7c2d12,#ea580c)" : "linear-gradient(135deg,#064e3b,#059669)";

  const currentBalance = customer?.balance ?? 0;
  const entryAmt       = parseFloat(form.amount) || 0;
  const previewBalance = isGave ? currentBalance + entryAmt : currentBalance - entryAmt;
  const previewLabel   = previewBalance > 0 ? `₹${previewBalance.toLocaleString("en-IN")} to collect` : previewBalance < 0 ? `₹${Math.abs(previewBalance).toLocaleString("en-IN")} to pay` : "Settled ✓";
  const previewColor   = previewBalance > 0 ? "#ea580c" : previewBalance < 0 ? "#059669" : "#64748b";

  const TypeToggle = () => !isEdit ? (
    <div style={{ background: "#f1f5f9", borderRadius: 14, padding: 4, display: "flex", gap: 4 }}>
      {(["gave", "got"] as const).map(typ => (
        <button key={typ} type="button" onClick={() => setForm(p => ({ ...p, type: typ }))}
          style={{ flex: 1, height: 42, borderRadius: 11, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, background: form.type === typ ? (typ === "gave" ? "#ea580c" : "#059669") : "transparent", color: form.type === typ ? "#fff" : "#94a3b8", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, boxShadow: form.type === typ ? `0 2px 10px ${typ === "gave" ? "rgba(234,88,12,0.35)" : "rgba(5,150,105,0.35)"}` : "none" }}>
          {typ === "gave" ? <><ArrowUpRight size={14} strokeWidth={2.5} /> {t("udhari.customer.you_gave")}</> : <><ArrowDownLeft size={14} strokeWidth={2.5} /> {t("udhari.customer.you_got")}</>}
        </button>
      ))}
    </div>
  ) : null;

  /* ── Mobile dialog ── */
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
          {customer && (
            <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "7px 12px", display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
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
          )}
        </div>
        <div className="px-4 pt-3 pb-5 space-y-3">
          <TypeToggle />
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

  /* ── Desktop: full-screen split layout ── */
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(11,44,96,0.40)", backdropFilter: "blur(4px)", zIndex: 49 }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
        {/* Left info panel */}
        <div style={{ width: 380, flexShrink: 0, background: headerGrad, display: "flex", flexDirection: "column", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -70, right: -70, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -50, left: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(0,0,0,0.10)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, position: "relative" }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,0.20)", border: "1.5px solid rgba(255,255,255,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
            </div>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>SAHU CSC</span>
          </div>
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
          <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 16, padding: "18px 20px", marginBottom: 12, position: "relative" }}>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Current Balance</p>
            <p style={{ color: "#fff", fontSize: 28, fontWeight: 900 }}>{fmt(currentBalance)}</p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 4 }}>
              {currentBalance > 0 ? `${customer?.name} owes you` : currentBalance < 0 ? `You owe ${customer?.name}` : "Settled"}
            </p>
          </div>
          {entryAmt > 0 && (
            <div style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 14, padding: "14px 18px", marginTop: "auto", position: "relative" }}>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>After This Entry</p>
              <p style={{ color: "#fff", fontSize: 22, fontWeight: 900 }}>{previewLabel}</p>
            </div>
          )}
        </div>
        {/* Right form panel */}
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
              <div style={{ background: accentBg, border: `2px solid ${accentBorder}`, borderRadius: 20, padding: "20px 24px" }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: "uppercase" as const, letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>
                  {isGave ? "Amount You Gave (₹)" : "Amount You Got (₹)"}
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 15, background: amtGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 14px ${accentColor}35` }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>₹</span>
                  </div>
                  <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" autoFocus
                    style={{ flex: 1, fontSize: 38, fontWeight: 900, color: accentColor, background: "transparent", border: "none", outline: "none", letterSpacing: "-0.02em" }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Date</label>
                <div style={{ position: "relative" }}>
                  <Calendar size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: "#0b2c60", outline: "none", background: "#fff", boxSizing: "border-box", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                    onFocus={e => (e.target.style.borderColor = accentColor)} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
                  Note <span style={{ fontWeight: 400, textTransform: "none" as const, color: "#94a3b8" }}>(optional)</span>
                </label>
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
