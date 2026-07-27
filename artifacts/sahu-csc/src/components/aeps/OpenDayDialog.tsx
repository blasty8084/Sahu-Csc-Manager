import { type UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, StickyNote, CheckCircle2, X } from "lucide-react";
import { fmtDate, fmt, OPEN_QUICK_AMOUNTS, type AepsSession } from "@/pages/aeps/aeps.constants";

interface OpenDayDialogProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  session: AepsSession | undefined;
  selectedDate: string;
  openForm: UseFormReturn<{ openingBalance: string; notes: string }>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isPending: boolean;
}

export function OpenDayDialog({
  open, onClose, isMobile, session, selectedDate, openForm, onSubmit, isPending,
}: OpenDayDialogProps) {
  if (!open) return null;

  // ── Mobile Dialog ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
        <DialogContent className="p-0 overflow-hidden gap-0 max-w-sm">
          <div style={{ background: "linear-gradient(135deg,var(--brand-navy-800) 0%,var(--brand-navy-600) 100%)" }}>
            <div style={{ height: 3, background: "linear-gradient(90deg,var(--brand-orange),var(--brand-orange-400))" }} />
            <div className="px-5 py-4 flex items-center gap-3">
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--brand-orange-tint-md)", border: "1px solid var(--brand-orange-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Wallet size={20} color="var(--brand-orange)" />
              </div>
              <div>
                <DialogTitle className="text-white text-base font-black m-0 p-0">
                  {session ? "Edit Opening Balance" : "Set Day Opening Balance"}
                </DialogTitle>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{fmtDate(selectedDate)}</p>
              </div>
            </div>
          </div>
          <form onSubmit={onSubmit} className="px-5 py-4 space-y-4">
            <div className="space-y-2">
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-slate-600)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Cash Amount (₹) *</label>
              <div className="relative">
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 20, fontWeight: 900, color: "var(--color-slate-400)" }}>₹</span>
                <input type="number" min={0} step={0.01} placeholder="0" autoFocus {...openForm.register("openingBalance", { required: true })}
                  style={{ width: "100%", height: 60, paddingLeft: 36, paddingRight: 14, borderRadius: 14, border: "2px solid var(--color-slate-200)", fontSize: 28, fontWeight: 900, color: "var(--brand-navy-800)", outline: "none", boxSizing: "border-box", background: "var(--color-slate-50)", transition: "border-color 0.15s" }}
                  onFocus={e => (e.target.style.borderColor = "var(--brand-navy-800)")} onBlur={e => (e.target.style.borderColor = "var(--color-slate-200)")} />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {OPEN_QUICK_AMOUNTS.map(v => (
                  <button key={v} type="button" onClick={() => openForm.setValue("openingBalance", String(v))}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: "var(--brand-navy-tint-md)", color: "var(--brand-navy-800)", border: "1px solid var(--brand-navy-tint-md)" }}>
                    ₹{v >= 1000 ? (v / 1000) + "K" : v}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-slate-600)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Note <span style={{ fontWeight: 400, textTransform: "none", fontSize: 11, color: "var(--color-slate-400)" }}>(optional)</span></label>
              <div className="relative">
                <StickyNote size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-slate-400)" }} />
                <Input placeholder="e.g. Loaded from SBI BC account" className="pl-9" {...openForm.register("notes")} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" type="button" className="flex-none" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isPending} className="flex-1 gap-2" style={{ background: "linear-gradient(135deg,var(--brand-navy-800),var(--brand-navy-600))", color: "#fff" }}>
                {isPending ? "Saving…" : <><CheckCircle2 size={15} /> {session ? "Save Changes" : "Open Day"}</>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Desktop Split Panel ────────────────────────────────────────────────────
  const watchedBalance = openForm.watch("openingBalance");

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "var(--brand-navy-shadow)", backdropFilter: "blur(4px)", zIndex: 49 }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>

        {/* LEFT INFO PANEL */}
        <div style={{ width: 380, flexShrink: 0, background: "linear-gradient(160deg,var(--brand-navy-800) 0%,var(--brand-navy-700) 55%,var(--brand-navy-600) 100%)", display: "flex", flexDirection: "column", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "var(--brand-orange-tint-sm)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "var(--brand-white-low)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, position: "relative" }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,var(--brand-orange),var(--brand-orange-400))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px var(--brand-orange-glow)" }}>
              <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
            </div>
            <div><span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>SAHU </span><span style={{ color: "var(--brand-orange)", fontWeight: 900, fontSize: 16 }}>CSC</span></div>
          </div>
          <div style={{ position: "relative", marginBottom: 28 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "var(--brand-orange-tint-md)", border: "2px solid var(--brand-orange-tint-soft)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <Wallet size={30} color="var(--brand-orange)" />
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--brand-white-low)", border: "1px solid var(--brand-white-border)", borderRadius: 8, padding: "4px 10px", marginBottom: 10 }}>
              <span style={{ color: "var(--brand-orange)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>AePS Cash Management</span>
            </div>
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, lineHeight: 1.2, marginBottom: 8 }}>
              {session ? "Edit Opening Balance" : "Set Opening Balance"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 13, lineHeight: 1.7 }}>
              {session
                ? "Update the cash float you loaded at the start of this session."
                : "Enter the cash amount you have loaded for today's AePS operations."}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto", position: "relative" }}>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>
              Session · {fmtDate(selectedDate).split(",")[0]}
            </p>
            {session ? (
              <>
                {[
                  { label: "Current Balance", value: `₹${fmt(session.currentBalance)}`, color: "var(--brand-orange)" },
                  { label: "Opening Balance", value: `₹${fmt(session.openingBalance)}`, color: "var(--color-slate-400)" },
                  { label: "Transactions", value: String(session.transactions?.length ?? 0), color: "var(--color-success-light)" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--brand-white-low)", borderRadius: 12, padding: "11px 16px", border: "1px solid var(--brand-white-low)" }}>
                    <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 500 }}>{label}</span>
                    <span style={{ color, fontSize: 14, fontWeight: 800 }}>{value}</span>
                  </div>
                ))}
              </>
            ) : (
              <div style={{ background: "var(--brand-orange-tint-sm)", border: "1px solid var(--brand-orange-tint-md)", borderRadius: 14, padding: "16px 18px" }}>
                <p style={{ color: "var(--brand-orange)", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>No session yet for this date</p>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 1.6 }}>Opening the day allows you to record withdrawals and deposits against your cash float.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--color-slate-50)" }}>
          <div style={{ background: "#fff", borderBottom: "1px solid var(--color-slate-100)", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--brand-navy-800)", margin: 0 }}>{session ? "Edit Opening Balance" : "Open New Day"}</h2>
              <p style={{ fontSize: 12, color: "var(--color-slate-400)", margin: 0, marginTop: 2 }}>AePS · {fmtDate(selectedDate)}</p>
            </div>
            <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 12, border: "1.5px solid var(--color-slate-200)", background: "var(--color-slate-50)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={16} color="var(--color-slate-500)" />
            </button>
          </div>

          <form onSubmit={onSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 620 }}>

              {/* Amount hero */}
              <div style={{ background: "linear-gradient(135deg,var(--brand-navy-tint-sm),rgba(26,74,158,0.03))", border: "2px solid var(--brand-navy-border-md)", borderRadius: 20, padding: "20px 24px" }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-navy-800)", textTransform: "uppercase" as const, letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>Opening Cash Amount (₹) *</label>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 15, background: "linear-gradient(135deg,var(--brand-navy-800),var(--brand-navy-600))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px var(--brand-navy-shadow-md)" }}>
                    <Wallet size={22} color="#fff" />
                  </div>
                  <input type="number" min={0} step={0.01} placeholder="0" autoFocus
                    {...openForm.register("openingBalance", { required: true })}
                    style={{ flex: 1, fontSize: 38, fontWeight: 900, color: "var(--brand-navy-800)", background: "transparent", border: "none", outline: "none", letterSpacing: "-0.02em" }}
                    onFocus={e => (e.target.style.color = "var(--brand-navy-800)")} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {OPEN_QUICK_AMOUNTS.map(v => (
                    <button key={v} type="button" onClick={() => openForm.setValue("openingBalance", String(v))}
                      style={{ padding: "7px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, background: watchedBalance === String(v) ? "linear-gradient(135deg,var(--brand-navy-800),var(--brand-navy-600))" : "var(--color-slate-100)", color: watchedBalance === String(v) ? "#fff" : "var(--color-slate-500)", border: "none", cursor: "pointer", transition: "all 0.15s" }}>
                      ₹{v >= 1000 ? (v / 1000) + "K" : v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-slate-600)", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Note <span style={{ fontWeight: 400, textTransform: "none" as const, color: "var(--color-slate-400)" }}>(optional)</span></label>
                <div style={{ position: "relative" }}>
                  <StickyNote size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-slate-400)" }} />
                  <input placeholder="e.g. Loaded from SBI BC account" {...openForm.register("notes")}
                    style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid var(--color-slate-200)", background: "#fff", fontSize: 14, color: "var(--brand-navy-800)", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 4px var(--brand-navy-tint-md)" }}
                    onFocus={e => (e.target.style.borderColor = "var(--brand-navy-800)")} onBlur={e => (e.target.style.borderColor = "var(--color-slate-200)")} />
                </div>
              </div>

              {/* Info card */}
              <div style={{ background: "var(--surface-toast-blue)", border: "1px solid var(--surface-blue-tint-sm)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--surface-blue-tint)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Wallet size={14} color="var(--color-blue-600)" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--brand-navy-500)", marginBottom: 2 }}>Cash Float</p>
                  <p style={{ fontSize: 12, color: "var(--color-blue)", lineHeight: 1.6 }}>This is the cash you have available for AePS transactions. Each withdrawal reduces this amount, each deposit increases it.</p>
                </div>
              </div>
            </div>

            <div style={{ padding: "20px 40px", borderTop: "1px solid var(--color-slate-100)", background: "#fff", flexShrink: 0, display: "flex", gap: 14 }}>
              <button type="button" onClick={onClose} style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid var(--color-slate-200)", background: "var(--color-slate-50)", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "var(--color-slate-500)" }}>Cancel</button>
              <button type="submit" disabled={isPending} style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,var(--brand-navy-800),var(--brand-navy-600))", color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px var(--brand-navy-shadow-md)", opacity: isPending ? 0.7 : 1 }}>
                <CheckCircle2 size={18} />
                {isPending ? "Saving…" : session ? "Save Changes" : "Open Day"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
