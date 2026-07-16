import { useState } from "react";
import {
  ShieldCheck, ShieldOff, Mail, Smartphone, KeyRound,
  ChevronRight, Clock, Zap, Star, Copy, Check, X, Eye, EyeOff,
} from "lucide-react";

const NAVY = "#0B1340";
const ORANGE = "#F97316";
const GREEN = "#10b981";

function SecurityRing({ score }: { score: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={r} fill="none" stroke="#1e2a5a" strokeWidth="8" />
      <circle
        cx="48" cy="48" r={r} fill="none"
        stroke={score > 70 ? GREEN : score > 40 ? ORANGE : "#ef4444"}
        strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 48 48)"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text x="48" y="53" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">{score}</text>
    </svg>
  );
}

export function SecurityHub() {
  const [enabled, setEnabled] = useState(true);
  const [method, setMethod] = useState<"otp" | "totp">("totp");
  const [copied, setCopied] = useState<number | null>(null);
  const [showDisable, setShowDisable] = useState(false);
  const [showCodes, setShowCodes] = useState(false);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const score = enabled ? (method === "totp" ? 92 : 74) : 28;
  const backupCodes = ["A1B2C-3D4E5", "F6G7H-8I9J0", "K1L2M-3N4O5", "P6Q7R-8S9T0"];
  const usedCodes = 1;

  const handleDisable = () => { setEnabled(false); setShowDisable(false); setPassword(""); };
  const handleEnable = () => { setEnabled(true); };
  const copyCode = (i: number) => { setCopied(i); setTimeout(() => setCopied(null), 1500); };

  return (
    <div className="min-h-screen flex items-start justify-center p-4 pt-6" style={{ background: "#f0f2f8" }}>
      <div className="w-full max-w-sm space-y-3">

        {/* Hero security card */}
        <div className="rounded-2xl overflow-hidden shadow-lg"
          style={{ background: `linear-gradient(145deg, ${NAVY} 0%, #162060 60%, #1d3070 100%)` }}>
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-0.5">Security Status</p>
                <h2 className="text-lg font-bold text-white leading-tight">
                  {enabled ? "Account Secured" : "Account at Risk"}
                </h2>
                <p className="text-xs text-blue-200 mt-0.5">
                  {enabled
                    ? `Protected by ${method === "totp" ? "Authenticator App" : "Email OTP"}`
                    : "Enable 2FA to protect your account"}
                </p>
              </div>
              <SecurityRing score={score} />
            </div>

            {/* Status pill row */}
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: enabled ? "rgba(16,185,129,0.18)", color: "#6ee7b7" }}>
                {enabled ? <ShieldCheck size={11} /> : <ShieldOff size={11} />}
                {enabled ? "2FA ON" : "2FA OFF"}
              </div>
              {enabled && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(249,115,22,0.18)", color: "#fdba74" }}>
                  {method === "totp" ? <Smartphone size={11} /> : <Mail size={11} />}
                  {method === "totp" ? "TOTP" : "Email OTP"}
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ml-auto"
                style={{ background: "rgba(99,120,255,0.18)", color: "#a5b4fc" }}>
                <Star size={10} /> {score}/100
              </div>
            </div>
          </div>

          {/* Last verified strip */}
          {enabled && (
            <div className="px-5 py-2.5 flex items-center gap-2 border-t border-white/10">
              <Clock size={12} className="text-blue-300" />
              <span className="text-xs text-blue-300">Last verified · 2 hours ago · Android · Bhubaneswar</span>
            </div>
          )}
        </div>

        {/* Disable confirm */}
        {showDisable && (
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 space-y-3">
            <p className="text-sm font-bold text-red-800">Disable two-factor authentication?</p>
            <p className="text-xs text-red-600">Your account will be less secure. Confirm your password to continue.</p>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Current password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-red-200 rounded-xl px-3 py-2.5 text-sm bg-white pr-10 outline-none focus:ring-2 focus:ring-red-300"
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowDisable(false)}
                className="flex-1 py-2.5 rounded-xl border text-sm font-semibold text-gray-600 bg-white">Cancel</button>
              <button onClick={handleDisable}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "#ef4444" }}>Disable 2FA</button>
            </div>
          </div>
        )}

        {/* Enable CTA when disabled */}
        {!enabled && (
          <div className="rounded-2xl border border-blue-200 bg-white p-4 space-y-3">
            <p className="text-sm font-bold" style={{ color: NAVY }}>Enable Two-Factor Authentication</p>
            <p className="text-xs text-gray-500">Choose your verification method to add an extra layer of protection.</p>
            <div className="space-y-2">
              {(["otp", "totp"] as const).map(m => (
                <button key={m} type="button" onClick={() => setMethod(m)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all"
                  style={{ borderColor: method === m ? NAVY : "#e5e7eb", background: method === m ? "#eef0f9" : "white" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: method === m ? NAVY : "#f3f4f6" }}>
                    {m === "totp" ? <Smartphone size={16} className={method === m ? "text-white" : "text-gray-500"} />
                      : <Mail size={16} className={method === m ? "text-white" : "text-gray-500"} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{m === "totp" ? "Authenticator App" : "Email OTP"}</p>
                    <p className="text-xs text-gray-500">{m === "totp" ? "Google Authenticator, Authy" : "Code sent to your email"}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${method === m ? "border-navy" : "border-gray-300"}`}
                    style={{ borderColor: method === m ? NAVY : "#d1d5db" }}>
                    {method === m && <div className="w-2 h-2 rounded-full" style={{ background: NAVY }} />}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={handleEnable}
              className="w-full py-3 rounded-xl text-sm font-bold text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${NAVY}, #1d3070)` }}>
              <span className="flex items-center justify-center gap-2"><Zap size={14} />Enable 2FA</span>
            </button>
          </div>
        )}

        {/* Method & Backup section when enabled */}
        {enabled && !showDisable && (
          <>
            {/* Method switcher */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold" style={{ color: NAVY }}>Verification Method</p>
                <span className="text-xs text-gray-400">Active</span>
              </div>
              <div className="space-y-2">
                {(["totp", "otp"] as const).map(m => (
                  <button key={m} type="button" onClick={() => setMethod(m)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all"
                    style={{ borderColor: method === m ? ORANGE : "#f3f4f6", background: method === m ? "#fff7ed" : "#fafafa" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ background: method === m ? `linear-gradient(135deg, ${ORANGE}, #ea580c)` : "#f3f4f6" }}>
                      {m === "totp" ? <Smartphone size={16} className={method === m ? "text-white" : "text-gray-400"} />
                        : <Mail size={16} className={method === m ? "text-white" : "text-gray-400"} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: method === m ? "#7c2d12" : "#374151" }}>
                        {m === "totp" ? "Authenticator App" : "Email OTP"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {m === "totp" ? "Most secure · TOTP codes" : "Good · Code via email"}
                      </p>
                    </div>
                    {method === m && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: ORANGE, color: "white" }}>
                        <Check size={9} />Active
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Backup codes */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound size={15} style={{ color: NAVY }} />
                  <p className="text-sm font-bold" style={{ color: NAVY }}>Backup Codes</p>
                </div>
                <button onClick={() => setShowCodes(v => !v)}
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: "#eef0f9", color: NAVY }}>
                  {showCodes ? "Hide" : "Show codes"}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${((backupCodes.length - usedCodes) / backupCodes.length) * 100}%`, background: GREEN }} />
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {backupCodes.length - usedCodes}/{backupCodes.length} remaining
                </span>
              </div>
              {showCodes && (
                <div className="grid grid-cols-2 gap-1.5">
                  {backupCodes.map((code, i) => (
                    <button key={code} type="button" onClick={() => copyCode(i)}
                      className="flex items-center justify-between px-2.5 py-2 rounded-xl border font-mono text-xs"
                      style={{ borderColor: i < usedCodes ? "#fca5a5" : "#e5e7eb", background: i < usedCodes ? "#fef2f2" : "#f9fafb", color: i < usedCodes ? "#9ca3af" : "#111827", textDecoration: i < usedCodes ? "line-through" : "none" }}>
                      {code}
                      {copied === i ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="text-gray-300" />}
                    </button>
                  ))}
                </div>
              )}
              <button className="w-full py-2 rounded-xl border text-xs font-semibold text-gray-500 hover:bg-gray-50">
                Regenerate codes
              </button>
            </div>

            {/* Disable */}
            <button onClick={() => setShowDisable(true)}
              className="w-full py-3 rounded-2xl border-2 border-red-200 text-sm font-semibold text-red-500 bg-white flex items-center justify-center gap-2">
              <ShieldOff size={15} /> Disable Two-Factor Auth
            </button>
          </>
        )}
      </div>
    </div>
  );
}
