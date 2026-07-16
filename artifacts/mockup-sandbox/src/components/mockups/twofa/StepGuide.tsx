import { useState } from "react";
import {
  ShieldCheck, Mail, Smartphone, KeyRound, Check, ChevronRight,
  Lock, Loader2, ArrowLeft, Copy, RefreshCw,
} from "lucide-react";

const NAVY = "#0B1340";
const ORANGE = "#F97316";

type Step = "status" | "choose" | "email-confirm" | "totp-setup" | "done";

export function StepGuide() {
  const [enabled, setEnabled] = useState(false);
  const [step, setStep] = useState<Step>("status");
  const [method, setMethod] = useState<"otp" | "totp" | null>(null);
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const manualKey = "JBSW Y3DP EHPK 3PXP";

  const simulateLoad = (cb: () => void) => {
    setLoading(true);
    setTimeout(() => { setLoading(false); cb(); }, 1000);
  };

  const steps = [
    { id: "choose", label: "Choose Method" },
    { id: "setup", label: "Set Up" },
    { id: "done", label: "Active" },
  ];
  const stepIdx = step === "status" ? -1 : step === "choose" ? 0 : step === "email-confirm" ? 1 : step === "totp-setup" ? 1 : 2;

  return (
    <div className="min-h-screen flex items-start justify-center p-4 pt-6" style={{ background: "#f5f6fa" }}>
      <div className="w-full max-w-sm space-y-3">

        {/* Header status banner */}
        <div className="rounded-2xl p-4" style={{
          background: enabled
            ? "linear-gradient(135deg, #064e3b, #065f46)"
            : `linear-gradient(135deg, ${NAVY}, #1a2a6e)`
        }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.1)" }}>
              {enabled
                ? <ShieldCheck size={24} className="text-emerald-300" />
                : <Lock size={24} className="text-blue-200" />}
            </div>
            <div>
              <p className="text-white font-bold text-base">
                {enabled ? "Two-Factor is Active" : "Secure Your Account"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: enabled ? "#6ee7b7" : "#93c5fd" }}>
                {enabled
                  ? `Protected via ${method === "totp" ? "Authenticator App" : "Email OTP"}`
                  : "Add an extra layer of security to your login"}
              </p>
            </div>
          </div>
        </div>

        {/* Stepper (visible during setup) */}
        {step !== "status" && step !== "done" && (
          <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-0">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      background: i < stepIdx ? "#10b981" : i === stepIdx ? NAVY : "#e5e7eb",
                      color: i <= stepIdx ? "white" : "#9ca3af"
                    }}>
                    {i < stepIdx ? <Check size={13} /> : i + 1}
                  </div>
                  <span className="text-[10px] font-medium whitespace-nowrap"
                    style={{ color: i === stepIdx ? NAVY : "#9ca3af" }}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1 mb-3.5 rounded-full transition-all"
                    style={{ background: i < stepIdx ? "#10b981" : "#e5e7eb" }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── STATUS (not enabled) ── */}
        {step === "status" && !enabled && (
          <div className="bg-white rounded-2xl p-4 space-y-4">
            <p className="text-xs text-gray-500">
              Two-factor authentication adds a second step to verify it's really you when signing in.
            </p>
            {/* benefit rows */}
            {[
              { icon: <ShieldCheck size={15} className="text-emerald-500" />, label: "Block unauthorized access", sub: "Even if your password is leaked" },
              { icon: <Smartphone size={15} className="text-blue-500" />, label: "New device alerts", sub: "Get notified of sign-ins" },
              { icon: <KeyRound size={15} className="text-orange-500" />, label: "Backup codes included", sub: "8 one-time emergency codes" },
            ].map(row => (
              <div key={row.label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">{row.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{row.label}</p>
                  <p className="text-xs text-gray-400">{row.sub}</p>
                </div>
              </div>
            ))}
            <button onClick={() => setStep("choose")}
              className="w-full py-3 rounded-xl text-sm font-bold text-white shadow"
              style={{ background: `linear-gradient(135deg, ${NAVY}, #1d3a80)` }}>
              Get Started →
            </button>
          </div>
        )}

        {/* ── STATUS (enabled) ── */}
        {step === "status" && enabled && (
          <div className="space-y-2">
            <div className="bg-white rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: method === "totp" ? "#fff7ed" : "#eff6ff" }}>
                  {method === "totp" ? <Smartphone size={16} style={{ color: ORANGE }} /> : <Mail size={16} className="text-blue-500" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{method === "totp" ? "Authenticator App" : "Email OTP"}</p>
                  <p className="text-xs text-gray-400">{method === "totp" ? "TOTP via Google Authenticator" : "Code sent to sa****@gmail.com"}</p>
                </div>
                <div className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: "#d1fae5", color: "#065f46" }}>
                  <Check size={10} />Active
                </div>
              </div>
              <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <KeyRound size={12} />
                  <span>5 / 8 backup codes remaining</span>
                </div>
                <button className="text-xs font-semibold" style={{ color: NAVY }}>View codes</button>
              </div>
            </div>

            <button onClick={() => { setEnabled(false); setStep("status"); setMethod(null); }}
              className="w-full py-3 rounded-2xl border border-red-200 text-sm font-semibold text-red-500 bg-white">
              Disable 2FA
            </button>
          </div>
        )}

        {/* ── STEP 1: Choose method ── */}
        {step === "choose" && (
          <div className="bg-white rounded-2xl p-4 space-y-3">
            <p className="text-sm font-bold text-gray-900">How would you like to verify?</p>
            <p className="text-xs text-gray-400">Choose the method that works best for you.</p>
            <div className="space-y-2">
              {([
                { m: "totp" as const, icon: <Smartphone size={20} />, label: "Authenticator App", sub: "Scan a QR code — most secure", badge: "Recommended", color: ORANGE, bg: "#fff7ed" },
                { m: "otp" as const, icon: <Mail size={20} />, label: "Email OTP", sub: "Code sent to your email", badge: null, color: "#3b82f6", bg: "#eff6ff" },
              ]).map(({ m, icon, label, sub, badge, color, bg }) => (
                <button key={m} type="button" onClick={() => setMethod(m)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all"
                  style={{ borderColor: method === m ? color : "#f1f2f6", background: method === m ? bg : "#fafafa" }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: method === m ? color : "#e5e7eb", color: method === m ? "white" : "#9ca3af" }}>
                    {icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-gray-900">{label}</p>
                      {badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: color, color: "white" }}>{badge}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: method === m ? color : "#d1d5db" }}>
                    {method === m && <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setStep("status")}
                className="flex-1 py-3 rounded-xl border text-sm font-semibold text-gray-500 bg-gray-50 flex items-center justify-center gap-1">
                <ArrowLeft size={14} />Back
              </button>
              <button disabled={!method} onClick={() => method === "totp" ? setStep("totp-setup") : setStep("email-confirm")}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                style={{ background: method === "totp" ? ORANGE : "#3b82f6" }}>
                Continue <ChevronRight size={14} className="inline" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2a: Email confirm ── */}
        {step === "email-confirm" && (
          <div className="bg-white rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Mail size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Enable Email OTP</p>
                <p className="text-xs text-gray-400">Confirm your current password</p>
              </div>
            </div>
            <input type="password" placeholder="Current password" value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
            <div className="flex gap-2">
              <button onClick={() => setStep("choose")}
                className="flex-1 py-2.5 rounded-xl border text-sm font-semibold text-gray-500">Back</button>
              <button disabled={!password || loading}
                onClick={() => simulateLoad(() => { setEnabled(true); setStep("done"); })}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1.5"
                style={{ background: "#3b82f6", opacity: !password ? 0.5 : 1 }}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : "Activate"}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2b: TOTP setup ── */}
        {step === "totp-setup" && (
          <div className="bg-white rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#fff7ed" }}>
                <Smartphone size={16} style={{ color: ORANGE }} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Scan QR Code</p>
                <p className="text-xs text-gray-400">Open your authenticator app</p>
              </div>
            </div>
            {/* QR placeholder */}
            <div className="flex justify-center">
              <div className="w-36 h-36 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
                <div className="grid grid-cols-5 gap-0.5 opacity-30">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="w-4 h-4 rounded-sm"
                      style={{ background: Math.random() > 0.5 ? "#111" : "transparent" }} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center">Or enter manually:</p>
            <button type="button" onClick={() => { setCopiedKey(true); setTimeout(() => setCopiedKey(false), 1500); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border bg-gray-50 font-mono text-xs tracking-widest text-gray-700">
              {manualKey}
              {copiedKey ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-gray-400" />}
            </button>
            <input inputMode="numeric" placeholder="Enter 6-digit code" maxLength={6} value={totpCode}
              onChange={e => setTotpCode(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center tracking-widest font-bold outline-none focus:ring-2 focus:ring-orange-200" />
            <div className="flex gap-2">
              <button onClick={() => setStep("choose")}
                className="flex-1 py-2.5 rounded-xl border text-sm font-semibold text-gray-500">Back</button>
              <button disabled={totpCode.length < 6 || loading}
                onClick={() => simulateLoad(() => { setEnabled(true); setStep("done"); })}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1.5"
                style={{ background: ORANGE, opacity: totpCode.length < 6 ? 0.5 : 1 }}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : "Confirm"}
              </button>
            </div>
          </div>
        )}

        {/* ── DONE screen ── */}
        {step === "done" && (
          <div className="bg-white rounded-2xl p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
              <ShieldCheck size={30} className="text-white" />
            </div>
            <p className="text-base font-bold text-gray-900">2FA Enabled!</p>
            <p className="text-xs text-gray-500">
              Your account is now protected with {method === "totp" ? "Authenticator App (TOTP)" : "Email OTP"}.
              You'll need to verify on every new sign-in.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left space-y-2">
              <p className="text-xs font-bold text-amber-800">Save your backup codes</p>
              <div className="grid grid-cols-2 gap-1.5">
                {["A1B2C-3D4E", "F6G7H-8I9J", "K1L2M-3N4O", "P6Q7R-8S9T"].map(c => (
                  <div key={c} className="font-mono text-xs px-2 py-1.5 bg-white border border-amber-200 rounded-lg text-center">{c}</div>
                ))}
              </div>
              <p className="text-[10px] text-amber-600">These won't be shown again. Store them safely.</p>
            </div>
            <button onClick={() => setStep("status")}
              className="w-full py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${NAVY}, #1d3a80)` }}>
              I've saved my codes → Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
