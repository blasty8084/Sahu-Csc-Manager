import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCreateUdhariCustomer } from "@workspace/api-client-react";
import { ArrowUpRight, Phone, X, CheckCircle2, User, FileText } from "lucide-react";

export function UdhariAddCustomerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isMobile = useIsMobile();
  const [form, setForm] = useState({ name: "", mobile: "", address: "", notes: "" });
  const create = useCreateUdhariCustomer();

  // Reset form whenever the dialog closes — covers both the success path and
  // the cancel/backdrop-dismiss path so stale values never re-appear.
  useEffect(() => {
    if (!open) setForm({ name: "", mobile: "", address: "", notes: "" });
  }, [open]);

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

  /* ── Desktop: full-screen split layout ── */
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
