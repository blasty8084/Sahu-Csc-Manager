import { useState } from "react";
import {
  ShieldCheck, ShieldOff, Mail, Smartphone, KeyRound, Activity,
  ChevronRight, Check, Copy, RefreshCw, Smartphone as Phone,
  Globe, Clock, ToggleLeft, ToggleRight, AlertCircle, Zap,
} from "lucide-react";

const NAVY = "#0B1340";
const ORANGE = "#F97316";

const logs = [
  { icon: <Check size={10} />, label: "Sign-in verified", time: "2h ago", place: "Bhubaneswar · Android", ok: true },
  { icon: <Check size={10} />, label: "Sign-in verified", time: "Yesterday", place: "Cuttack · Windows", ok: true },
  { icon: <AlertCircle size={10} />, label: "Failed attempt", time: "3 days ago", place: "Unknown · Unknown", ok: false },
];

export function CommandCard() {
  const [enabled, setEnabled] = useState(true);
  const [method, setMethod] = useState<"otp" | "totp">("totp");
  const [copied, setCopied] = useState<number | null>(null);
  const [showCodes, setShowCodes] = useState(false);
  const [activeTab, setActiveTab] = useState<"security" | "activity">("security");

  const codes = ["A1B2C-3D4E", "F6G7H-8I9J", "K1L2M-3N4O", "P6Q7R-8S9T", "U0V1W-2X3Y4", "Z5A6B-7C8D9"];
  const usedCount = 2;

  return (
    <div className="min-h-screen flex items-start justify-center p-4 pt-6" style={{ background: "#eef0f8" }}>
      <div className="w-full max-w-sm space-y-3">

        {/* ── Top control row ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
              style={{ background: enabled ? "linear-gradient(135deg,#0B1340,#1d3a80)" : "#f3f4f6" }}>
              {enabled
                ? <ShieldCheck size={22} className="text-white" />
                : <ShieldOff size={22} className="text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900">Two-Factor Auth</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: enabled ? "#d1fae5" : "#fee2e2", color: enabled ? "#065f46" : "#991b1b" }}>
                  {enabled ? "ON" : "OFF"}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {enabled
                  ? `Active via ${method === "totp" ? "Authenticator App" : "Email OTP"} · Score 92/100`
                  : "Not enabled — account is less secure"}
              </p>
            </div>
            <button type="button" onClick={() => setEnabled(v => !v)}
              className="flex-shrink-0 transition-transform active:scale-95">
              {enabled
                ? <ToggleRight size={32} style={{ color: NAVY }} />
                : <ToggleLeft size={32} className="text-gray-300" />}
            </button>
          </div>

          {/* Method strip */}
          {enabled && (
            <div className="px-4 pb-4">
              <div className="flex gap-2 p-1 rounded-xl" style={{ background: "#f0f2f8" }}>
                {(["totp", "otp"] as const).map(m => (
                  <button key={m} type="button" onClick={() => setMethod(m)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
                    style={method === m
                      ? { background: m === "totp" ? ORANGE : NAVY, color: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }
                      : { color: "#6b7280" }}>
                    {m === "totp" ? <Smartphone size={13} /> : <Mail size={13} />}
                    {m === "totp" ? "Authenticator" : "Email OTP"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 p-1 rounded-xl bg-white border border-gray-100 shadow-sm">
          {(["security", "activity"] as const).map(tab => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all"
              style={activeTab === tab
                ? { background: NAVY, color: "white" }
                : { color: "#6b7280" }}>
              {tab === "security" ? "🔑 Security" : "📋 Activity"}
            </button>
          ))}
        </div>

        {/* ── SECURITY TAB ── */}
        {activeTab === "security" && enabled && (
          <div className="space-y-2.5">

            {/* Backup codes card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound size={14} style={{ color: NAVY }} />
                  <span className="text-sm font-bold" style={{ color: NAVY }}>Backup Codes</span>
                </div>
                <button onClick={() => setShowCodes(v => !v)}
                  className="text-xs font-semibold px-3 py-1 rounded-full transition-colors"
                  style={{ background: showCodes ? NAVY : "#eef0f8", color: showCodes ? "white" : NAVY }}>
                  {showCodes ? "Hide" : "View"}
                </button>
              </div>

              {/* Usage meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-500">{codes.length - usedCount} of {codes.length} remaining</span>
                  <span style={{ color: usedCount >= codes.length * 0.6 ? "#ef4444" : "#10b981" }}>
                    {Math.round(((codes.length - usedCount) / codes.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${((codes.length - usedCount) / codes.length) * 100}%`,
                      background: usedCount >= codes.length * 0.6 ? "#ef4444" : "#10b981"
                    }} />
                </div>
              </div>

              {showCodes && (
                <div className="grid grid-cols-2 gap-1.5">
                  {codes.map((code, i) => (
                    <button key={code} type="button" onClick={() => { setCopied(i); setTimeout(() => setCopied(null), 1500); }}
                      className="flex items-center justify-between px-2.5 py-2 rounded-xl border font-mono text-xs transition-colors"
                      style={{
                        borderColor: i < usedCount ? "#fca5a5" : "#e5e7eb",
                        background: i < usedCount ? "#fef2f2" : "#f9fafb",
                        color: i < usedCount ? "#9ca3af" : "#111827",
                        textDecoration: i < usedCount ? "line-through" : "none"
                      }}>
                      {code}
                      {copied === i ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="text-gray-300" />}
                    </button>
                  ))}
                </div>
              )}

              <button className="w-full py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 text-gray-500 hover:bg-gray-50">
                <RefreshCw size={12} /> Generate new codes
              </button>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Security", value: "92%", color: "#10b981" },
                { label: "Logins", value: "47", color: NAVY },
                { label: "Blocked", value: "3", color: "#ef4444" },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
                  <p className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Disable */}
            <button onClick={() => setEnabled(false)}
              className="w-full py-3 rounded-2xl border-2 border-red-100 text-sm font-semibold text-red-400 bg-white flex items-center justify-center gap-2">
              <ShieldOff size={14} /> Disable 2FA
            </button>
          </div>
        )}

        {/* ── SECURITY TAB (disabled) ── */}
        {activeTab === "security" && !enabled && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-red-50">
                <ShieldOff size={26} className="text-red-400" />
              </div>
              <p className="text-sm font-bold text-gray-800">Your account is not protected</p>
              <p className="text-xs text-gray-400">Enable 2FA to secure your sign-ins with a second verification step.</p>
            </div>
            <div className="space-y-2">
              {(["totp", "otp"] as const).map(m => (
                <button key={m} type="button" onClick={() => { setMethod(m); setEnabled(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-left hover:border-gray-200">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: m === "totp" ? "#fff7ed" : "#eff6ff" }}>
                    {m === "totp" ? <Smartphone size={16} style={{ color: ORANGE }} /> : <Mail size={16} className="text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{m === "totp" ? "Authenticator App" : "Email OTP"}</p>
                    <p className="text-xs text-gray-400">{m === "totp" ? "Most secure method" : "Simple, code via email"}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── ACTIVITY TAB ── */}
        {activeTab === "activity" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={14} style={{ color: NAVY }} />
                <span className="text-sm font-bold" style={{ color: NAVY }}>Recent Sign-Ins</span>
              </div>
              <span className="text-xs text-gray-400">Last 30 days</span>
            </div>
            <div className="divide-y divide-gray-50">
              {logs.map((log, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}
                    style={{ background: log.ok ? "#d1fae5" : "#fee2e2", color: log.ok ? "#065f46" : "#991b1b" }}>
                    {log.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{log.label}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Globe size={10} className="text-gray-300" />
                      <span className="text-[10px] text-gray-400">{log.place}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-300 flex-shrink-0">
                    <Clock size={9} />
                    {log.time}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-gray-50">
              <button className="w-full text-xs font-semibold py-2 rounded-xl"
                style={{ background: "#f0f2f8", color: NAVY }}>
                View full history →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
