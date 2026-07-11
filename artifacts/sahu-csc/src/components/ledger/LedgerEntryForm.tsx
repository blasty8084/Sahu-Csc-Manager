import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, User, Calendar, FileText, IndianRupee, CheckCircle2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { EntryForm } from "@/hooks/useLedger";

interface EntryFormPanelProps {
  showForm: boolean;
  setShowForm: (v: boolean) => void;
  editEntry: any;
  entryType: "credit" | "debit";
  setEntryType: (v: "credit" | "debit") => void;
  rawAmount: string;
  setRawAmount: (v: string) => void;
  accentColor: string;
  accentGrad: string;
  accentBg: string;
  form: UseFormReturn<EntryForm>;
  serviceTypes: string[];
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  createMut: { isPending: boolean };
  updateMut: { isPending: boolean };
  balance: any;
}

// ── Entry Form: Mobile Dialog ──
export function MobileEntryFormDialog({
  showForm, setShowForm, editEntry, entryType, setEntryType, rawAmount, setRawAmount,
  accentColor, accentGrad, accentBg, form, serviceTypes, onSubmit, createMut, updateMut,
}: EntryFormPanelProps) {
  return (
    <Dialog open={showForm} onOpenChange={setShowForm}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl p-0 overflow-hidden gap-0">
        <div className="flex justify-center pt-3 pb-0">
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
        </div>
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <h2 style={{ fontSize: 18, fontWeight: 900, color: accentColor }}>
            {editEntry ? "Edit Entry" : (entryType === "credit" ? "New Credit Entry" : "New Debit Entry")}
          </h2>
          <button type="button" onClick={() => setShowForm(false)} style={{ width: 32, height: 32, borderRadius: 8, background: "#f1f5f9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={15} color="#64748b" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="px-5 pb-6 space-y-3">
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
          <div style={{ background: accentBg, border: `2px solid ${accentColor}25`, borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: accentGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 12px ${accentColor}30` }}>
              <IndianRupee size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Amount (₹)</p>
              <input type="number" step="0.01" min="0" value={rawAmount} onChange={e => setRawAmount(e.target.value)}
                data-testid="input-credit" placeholder="0.00"
                style={{ width: "100%", fontSize: 28, fontWeight: 900, color: accentColor, background: "transparent", border: "none", outline: "none", padding: 0 }} />
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <User size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input {...form.register("customerName", { required: true })} placeholder="Customer name"
              list="ledger-customer-names" autoComplete="off" data-testid="input-customer"
              style={{ width: "100%", height: 44, paddingLeft: 36, paddingRight: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fafafa", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 600 }} />
          </div>
          <Select value={form.watch("serviceType")} onValueChange={(v) => form.setValue("serviceType", v)}>
            <SelectTrigger data-testid="select-service" className="h-11 rounded-xl border-[#e2e8f0] bg-[#fafafa] text-sm font-semibold text-[#0b2c60]">
              <SelectValue placeholder="Select service type" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {serviceTypes.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <div style={{ position: "relative" }}>
            <Calendar size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input type="date" {...form.register("date", { required: true })} data-testid="input-date"
              style={{ width: "100%", height: 44, paddingLeft: 36, paddingRight: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fafafa", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 600 }} />
          </div>
          <div style={{ position: "relative" }}>
            <FileText size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: 13 }} />
            <textarea {...form.register("description")} rows={2} placeholder="Add a note (optional)" data-testid="input-description"
              style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 12, paddingBottom: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fafafa", fontSize: 13, color: "#0b2c60", outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
          <button type="submit" data-testid="button-save-entry" disabled={createMut.isPending || updateMut.isPending}
            style={{ width: "100%", height: 52, borderRadius: 16, border: "none", cursor: "pointer", background: accentGrad, color: "#fff", fontSize: 16, fontWeight: 900, letterSpacing: "0.02em", boxShadow: `0 6px 20px ${accentColor}35`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: (createMut.isPending || updateMut.isPending) ? 0.7 : 1 }}>
            <CheckCircle2 size={18} strokeWidth={2.5} />
            {editEntry ? "Update Entry" : `Save ${entryType === "credit" ? "Credit" : "Debit"} Entry`}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Entry Form: Desktop split-panel ──
export function DesktopEntryFormPanel({
  showForm, setShowForm, editEntry, entryType, setEntryType, rawAmount, setRawAmount,
  accentColor, accentGrad, form, serviceTypes, onSubmit, createMut, updateMut, balance,
}: EntryFormPanelProps) {
  if (!showForm) return null;
  return (
    <>
      <div onClick={() => setShowForm(false)}
        style={{ position: "fixed", inset: 0, background: "rgba(11,44,96,0.40)", backdropFilter: "blur(4px)", zIndex: 49 }} />
      {/* V2 — Full-screen split layout */}
      <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>

        {/* ── LEFT INFO PANEL ── */}
        <div style={{ width: 380, flexShrink: 0, background: "linear-gradient(160deg,#0b2c60 0%,#0f3872 55%,#1a4a9e 100%)", display: "flex", flexDirection: "column", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(249,115,22,0.12)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48, position: "relative" }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#f97316,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(249,115,22,0.40)" }}>
              <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
            </div>
            <div><span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>SAHU </span><span style={{ color: "#f97316", fontWeight: 900, fontSize: 16 }}>CSC</span></div>
          </div>
          <div style={{ position: "relative", marginBottom: 28 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: accentGrad, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 28px ${accentColor}45`, marginBottom: 20 }}>
              {entryType === "credit" ? <TrendingUp size={30} color="#fff" /> : <TrendingDown size={30} color="#fff" />}
            </div>
            <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>
              {editEntry ? "Edit Entry" : entryType === "credit" ? "New Credit Entry" : "New Debit Entry"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.7 }}>Record your daily service income and expenses. Every entry updates your running balance instantly.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto", position: "relative" }}>
            {([
              { label: "Running Balance", value: `₹${((balance as any)?.balance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, color: "#f97316", Icon: Wallet },
              { label: "Total Credits", value: `₹${((balance as any)?.totalCredits ?? 0).toLocaleString("en-IN")}`, color: "#10b981", Icon: TrendingUp },
              { label: "Total Debits", value: `₹${((balance as any)?.totalDebits ?? 0).toLocaleString("en-IN")}`, color: "#f43f5e", Icon: TrendingDown },
            ] as { label: string; value: string; color: string; Icon: React.ElementType }[]).map(({ label, value, color, Icon }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} color={color} />
                </div>
                <div>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
                  <p style={{ color: "#fff", fontSize: 15, fontWeight: 800, marginTop: 1 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8fafc" }}>
          {/* Top bar */}
          <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0b2c60", margin: 0 }}>{editEntry ? "Edit Entry" : "New Transaction"}</h2>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>Ledger · {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {!editEntry && (
                <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 14, padding: 4, gap: 4 }}>
                  {(["credit", "debit"] as const).map(t => (
                    <button key={t} type="button" onClick={() => setEntryType(t)}
                      style={{ padding: "8px 18px", borderRadius: 11, border: "none", cursor: "pointer", background: entryType === t ? (t === "credit" ? "linear-gradient(135deg,#059669,#10b981)" : "linear-gradient(135deg,#e11d48,#f43f5e)") : "transparent", color: entryType === t ? "#fff" : "#64748b", fontWeight: 700, fontSize: 13, boxShadow: entryType === t ? `0 2px 10px ${t === "credit" ? "rgba(5,150,105,0.35)" : "rgba(225,29,72,0.35)"}` : "none", transition: "all 0.15s" }}>
                      {t === "credit" ? "Credit (+)" : "Debit (−)"}
                    </button>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => setShowForm(false)}
                style={{ width: 38, height: 38, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={16} color="#64748b" />
              </button>
            </div>
          </div>

          {/* Scrollable form */}
          <form onSubmit={onSubmit} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 640 }}>

              {/* Amount — hero */}
              <div style={{ background: entryType === "credit" ? "linear-gradient(135deg,rgba(5,150,105,0.06),rgba(16,185,129,0.04))" : "linear-gradient(135deg,rgba(225,29,72,0.06),rgba(244,63,94,0.04))", border: `2px solid ${entryType === "credit" ? "rgba(5,150,105,0.22)" : "rgba(225,29,72,0.22)"}`, borderRadius: 20, padding: "20px 24px" }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: "uppercase" as const, letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>Amount (₹) *</label>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 15, background: accentGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 14px ${accentColor}35` }}>
                    <IndianRupee size={22} color="#fff" />
                  </div>
                  <input type="number" step="0.01" min="0" value={rawAmount} onChange={e => setRawAmount(e.target.value)}
                    data-testid="input-credit" placeholder="0.00" autoFocus
                    style={{ flex: 1, fontSize: 38, fontWeight: 900, color: accentColor, background: "transparent", border: "none", outline: "none", letterSpacing: "-0.02em" }} />
                </div>
              </div>

              {/* Customer + Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Customer Name *</label>
                  <div style={{ position: "relative" }}>
                    <User size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input {...form.register("customerName", { required: true })} placeholder="Customer name" list="ledger-customer-names" autoComplete="off" data-testid="input-customer"
                      style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: "#0b2c60", outline: "none", background: "#fff", boxSizing: "border-box", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                      onFocus={e => (e.target.style.borderColor = accentColor)} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Date *</label>
                  <div style={{ position: "relative" }}>
                    <Calendar size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                    <input type="date" {...form.register("date", { required: true })} data-testid="input-date"
                      style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: "#0b2c60", outline: "none", background: "#fff", boxSizing: "border-box", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                      onFocus={e => (e.target.style.borderColor = accentColor)} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                  </div>
                </div>
              </div>

              {/* Service */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Service Type</label>
                <Select value={form.watch("serviceType")} onValueChange={(v) => form.setValue("serviceType", v)}>
                  <SelectTrigger data-testid="select-service" className="h-[50px] rounded-[14px] border-[#e2e8f0] bg-white text-sm font-semibold text-[#0b2c60] shadow-[0_1px_4px_rgba(11,44,96,0.06)]">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {serviceTypes.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Note */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Note <span style={{ fontWeight: 400, textTransform: "none" as const, color: "#94a3b8", letterSpacing: 0 }}>(optional)</span></label>
                <div style={{ position: "relative" }}>
                  <FileText size={15} style={{ position: "absolute", left: 14, top: 16, color: "#94a3b8" }} />
                  <textarea {...form.register("description")} rows={3} placeholder="Add a note about this transaction…" data-testid="input-description"
                    style={{ width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 14, paddingBottom: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0b2c60", resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", lineHeight: 1.6, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                    onFocus={e => (e.target.style.borderColor = accentColor)} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
              </div>

              {/* Balance preview */}
              {(balance as any)?.balance !== undefined && (
                <div style={{ background: "rgba(11,44,96,0.04)", border: "1px solid rgba(11,44,96,0.10)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Balance after this entry</p>
                    <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                      ₹{((balance as any)?.balance ?? 0).toLocaleString("en-IN")} {entryType === "credit" ? "+" : "−"} ₹{(parseFloat(rawAmount) || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <p style={{ fontSize: 22, fontWeight: 900, color: accentColor }}>
                    ₹{(entryType === "credit"
                      ? ((balance as any)?.balance ?? 0) + (parseFloat(rawAmount) || 0)
                      : ((balance as any)?.balance ?? 0) - (parseFloat(rawAmount) || 0)
                    ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "20px 40px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 14, marginTop: "auto" }}>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
              <button type="submit" data-testid="button-save-entry" disabled={createMut.isPending || updateMut.isPending}
                style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: accentGrad, color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 6px 20px ${accentColor}35`, opacity: (createMut.isPending || updateMut.isPending) ? 0.7 : 1 }}>
                <CheckCircle2 size={18} strokeWidth={2.5} />
                {editEntry ? "Update Entry" : `Save ${entryType === "credit" ? "Credit" : "Debit"} Entry`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
