import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, ShieldOff, Mail, Smartphone, Loader2,
  Copy, Check, AlertTriangle, KeyRound, Eye, EyeOff,
  Clock, Star, Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/components/profile/utils";
import { getGetMeQueryKey } from "@workspace/api-client-react";

// ── Brand tokens ────────────────────────────────────────────────────────────
const NAVY   = "#0B1340";
const ORANGE = "#F97316";
const GREEN  = "#10b981";

type Method  = "otp" | "totp";
type Stage   = "idle" | "otp-confirm" | "totp-setup" | "backup-codes" | "disable-confirm";

// ── Animated security-score ring ────────────────────────────────────────────
function SecurityRing({ score }: { score: number }) {
  const r    = 38;
  const circ = 2 * Math.PI * r;
  const ring = score > 70 ? GREEN : score > 40 ? ORANGE : "#ef4444";
  return (
    <svg width="92" height="92" viewBox="0 0 96 96" className="flex-shrink-0">
      <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
      <circle
        cx="48" cy="48" r={r} fill="none"
        stroke={ring} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - score / 100)}
        transform="rotate(-90 48 48)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="48" y="53" textAnchor="middle" fontSize="18" fontWeight="800" fill="white">{score}</text>
    </svg>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function TwoFactorSection() {
  const { user }   = useAuth();
  const { toast }  = useToast();
  const qc         = useQueryClient();

  const twoFaEnabled                  = !!(user as any)?.twoFaEnabled;
  const twoFaMethod: Method           = (user as any)?.twoFaMethod ?? "otp";
  const score                         = twoFaEnabled ? (twoFaMethod === "totp" ? 92 : 74) : 28;

  // ── Local UI state ────────────────────────────────────────────────────────
  const [stage,     setStage]     = useState<Stage>("idle");
  const [pendingM,  setPendingM]  = useState<Method>("otp");   // method being set up / switched to
  const [password,  setPassword]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [totpSetup, setTotpSetup] = useState<{ qrCode: string; manualEntryKey: string } | null>(null);
  const [totpCode,  setTotpCode]  = useState("");
  const [newCodes,  setNewCodes]  = useState<string[] | null>(null);  // one-time reveal after enable
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [showCodes, setShowCodes] = useState(false);

  // ── Backup-codes count from /auth/2fa/status ──────────────────────────────
  const { data: statusData } = useQuery<{ backupCodesRemaining: number; twoFaEnabled: boolean; twoFaMethod: Method }>({
    queryKey: ["2fa-status"],
    queryFn:  () => apiFetch("/auth/2fa/status"),
    enabled:  twoFaEnabled,
    staleTime: 30_000,
  });
  const codesRemaining = statusData?.backupCodesRemaining ?? 0;
  const TOTAL_CODES    = 8;

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
    qc.invalidateQueries({ queryKey: ["2fa-status"] });
  };

  const reset = () => {
    setStage("idle");
    setPassword("");
    setShowPass(false);
    setTotpCode("");
    setTotpSetup(null);
    setPendingM("otp");
  };

  // ── Mutations ─────────────────────────────────────────────────────────────
  const setupTotpMut = useMutation({
    mutationFn: () => apiFetch("/auth/2fa/setup-totp", { method: "POST" }),
    onSuccess: (data) => { setTotpSetup(data); setStage("totp-setup"); },
    onError: (e: any) => toast({ variant: "destructive", title: e.message ?? "Failed to start TOTP setup" }),
  });

  const verifyTotpMut = useMutation({
    mutationFn: () => apiFetch("/auth/2fa/verify-totp", { method: "POST", body: JSON.stringify({ code: totpCode }) }),
    onSuccess: (data) => {
      setTotpCode("");
      setTotpSetup(null);
      if (data.backupCodes?.length) { setNewCodes(data.backupCodes); setStage("backup-codes"); }
      else { reset(); refreshAll(); }
      toast.success("Authenticator app connected", "TOTP two-factor authentication is now active.");
    },
    onError: (e: any) => toast({ variant: "destructive", title: e.message ?? "Invalid code — try again" }),
  });

  const enableOtpMut = useMutation({
    mutationFn: () => apiFetch("/auth/2fa/enable-otp", { method: "POST", body: JSON.stringify({ currentPassword: password }) }),
    onSuccess: (data) => {
      setPassword("");
      if (data.backupCodes?.length) { setNewCodes(data.backupCodes); setStage("backup-codes"); }
      else { reset(); refreshAll(); }
      toast.success("Email OTP enabled", "A code will be sent to your email on new sign-ins.");
    },
    onError: (e: any) => toast({ variant: "destructive", title: e.message ?? "Failed to enable" }),
  });

  const disableMut = useMutation({
    mutationFn: () => apiFetch("/auth/2fa/disable", { method: "POST", body: JSON.stringify({ currentPassword: password }) }),
    onSuccess: () => { reset(); refreshAll(); toast.success("Two-factor authentication disabled"); },
    onError: (e: any) => toast({ variant: "destructive", title: e.message ?? "Failed to disable" }),
  });

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    }).catch(() => {});
  };

  // ── Initiate enable / switch ──────────────────────────────────────────────
  const initiateMethod = (m: Method) => {
    setPendingM(m);
    if (m === "otp")  setStage("otp-confirm");
    else              setupTotpMut.mutate();
  };

  // ── One-time backup codes screen ──────────────────────────────────────────
  if (stage === "backup-codes" && newCodes) {
    return (
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} className="text-amber-600" />
          <p className="text-sm font-bold text-amber-800">Save your backup codes</p>
        </div>
        <p className="text-xs text-amber-700">
          Each code works once if you lose access to your {pendingM === "totp" ? "authenticator app" : "email"}.
          Store them somewhere safe — they won't be shown again.
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {newCodes.map((code, i) => (
            <button
              key={code} type="button" onClick={() => copyCode(code, i)}
              className="flex items-center justify-between gap-1.5 font-mono text-xs bg-white border border-amber-200 rounded-xl px-2.5 py-2 text-gray-800"
            >
              {code}
              {copiedIdx === i
                ? <Check size={11} className="text-green-600 flex-shrink-0" />
                : <Copy  size={11} className="text-gray-300 flex-shrink-0" />}
            </button>
          ))}
        </div>
        <Button
          className="w-full h-11 font-bold text-white border-0"
          style={{ background: `linear-gradient(135deg, ${NAVY}, #1d3070)` }}
          onClick={() => { setNewCodes(null); reset(); refreshAll(); }}
        >
          I've saved my codes — Done
        </Button>
      </div>
    );
  }

  // ── TOTP setup / verify screen ────────────────────────────────────────────
  if (stage === "totp-setup" && totpSetup) {
    return (
      <div className="rounded-2xl border bg-white p-4 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#fff7ed" }}>
            <Smartphone size={16} style={{ color: ORANGE }} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Scan with your authenticator app</p>
            <p className="text-xs text-gray-400">Google Authenticator, Authy, etc.</p>
          </div>
        </div>
        <div className="flex justify-center">
          <img src={totpSetup.qrCode} alt="TOTP QR code" className="w-40 h-40 rounded-xl border border-gray-200" />
        </div>
        <p className="text-xs text-gray-400 text-center">Or enter this key manually:</p>
        <button
          type="button"
          onClick={() => { navigator.clipboard?.writeText(totpSetup.manualEntryKey); setCopiedIdx(-1); setTimeout(() => setCopiedIdx(null), 1500); }}
          className="w-full flex items-center justify-center gap-2 font-mono text-sm tracking-wider bg-gray-50 border border-gray-200 rounded-xl py-2.5"
        >
          {totpSetup.manualEntryKey}
          {copiedIdx === -1 ? <Check size={13} className="text-green-500" /> : <Copy size={13} className="text-gray-400" />}
        </button>
        <Input
          autoFocus
          inputMode="numeric"
          placeholder="Enter 6-digit code to confirm"
          value={totpCode}
          onChange={(e) => setTotpCode(e.target.value)}
          className="text-center tracking-widest font-bold h-11"
          maxLength={6}
        />
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 h-10" onClick={reset}>Cancel</Button>
          <Button
            className="flex-1 h-10 font-bold text-white border-0"
            style={{ background: ORANGE }}
            disabled={verifyTotpMut.isPending || totpCode.length < 6}
            onClick={() => verifyTotpMut.mutate()}
          >
            {verifyTotpMut.isPending ? <Loader2 size={14} className="animate-spin" /> : "Confirm"}
          </Button>
        </div>
      </div>
    );
  }

  // ── OTP password confirm / Disable confirm ────────────────────────────────
  if (stage === "otp-confirm" || stage === "disable-confirm") {
    const isDisable = stage === "disable-confirm";
    const mut       = isDisable ? disableMut : enableOtpMut;
    return (
      <div className="rounded-2xl border bg-white p-4 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: isDisable ? "#fef2f2" : "#eff6ff" }}>
            {isDisable
              ? <ShieldOff size={16} className="text-red-500" />
              : <Mail size={16} className="text-blue-500" />}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              {isDisable ? "Confirm to disable 2FA" : "Enable Email OTP"}
            </p>
            <p className="text-xs text-gray-400">
              {isDisable ? "Your account will be less secure" : "Enter your password to confirm"}
            </p>
          </div>
        </div>
        <div className="relative">
          <Input
            autoFocus
            type={showPass ? "text" : "password"}
            placeholder="Current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && password && mut.mutate()}
            className="pr-10 h-11"
          />
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 h-10" onClick={reset}>Cancel</Button>
          <Button
            className="flex-1 h-10 font-bold text-white border-0"
            style={{ background: isDisable ? "#ef4444" : "#3b82f6" }}
            disabled={!password || mut.isPending}
            onClick={() => mut.mutate()}
          >
            {mut.isPending ? <Loader2 size={14} className="animate-spin" /> : isDisable ? "Disable 2FA" : "Enable"}
          </Button>
        </div>
      </div>
    );
  }

  // ── IDLE: main Security Hub view ──────────────────────────────────────────
  return (
    <div className="space-y-3">

      {/* ── Hero card ── */}
      <div
        className="rounded-2xl overflow-hidden shadow-lg"
        style={{ background: `linear-gradient(145deg, ${NAVY} 0%, #162060 55%, #1d3070 100%)` }}
      >
        <div className="px-4 pt-4 pb-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">Security Status</p>
              <h3 className="text-base font-bold text-white leading-tight">
                {twoFaEnabled ? "Account Secured" : "Account at Risk"}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: twoFaEnabled ? "#93c5fd" : "#fca5a5" }}>
                {twoFaEnabled
                  ? `Protected by ${twoFaMethod === "totp" ? "Authenticator App" : "Email OTP"}`
                  : "Enable 2FA to protect your account"}
              </p>
            </div>
            <SecurityRing score={score} />
          </div>

          {/* Status pills */}
          <div className="flex flex-wrap gap-1.5">
            <span
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{ background: twoFaEnabled ? "rgba(16,185,129,0.18)", color: "#6ee7b7" }}
            >
              {twoFaEnabled ? <ShieldCheck size={10} /> : <ShieldOff size={10} />}
              {twoFaEnabled ? "2FA ON" : "2FA OFF"}
            </span>
            {twoFaEnabled && (
              <span
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                style={{ background: "rgba(249,115,22,0.18)", color: "#fdba74" }}
              >
                {twoFaMethod === "totp" ? <Smartphone size={10} /> : <Mail size={10} />}
                {twoFaMethod === "totp" ? "TOTP" : "Email OTP"}
              </span>
            )}
            <span
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{ background: "rgba(99,120,255,0.18)", color: "#a5b4fc" }}
            >
              <Star size={10} /> {score}/100
            </span>
          </div>
        </div>

        {/* Last-verified strip */}
        {twoFaEnabled && (
          <div className="px-4 py-2.5 border-t border-white/10 flex items-center gap-2">
            <Clock size={11} className="text-blue-300 flex-shrink-0" />
            <span className="text-[11px] text-blue-300">
              {twoFaMethod === "totp"
                ? "Authenticator app active — codes rotate every 30 s"
                : "OTP codes sent to your registered email"}
            </span>
          </div>
        )}
      </div>

      {/* ── Enabled: method switcher ── */}
      {twoFaEnabled && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: NAVY }}>Verification Method</p>
            <span className="text-xs text-gray-400">Tap to switch</span>
          </div>
          <div className="space-y-2">
            {(["totp", "otp"] as const).map((m) => {
              const active = twoFaMethod === m;
              const loading = !active && (m === "otp" ? false : setupTotpMut.isPending);
              return (
                <button
                  key={m} type="button"
                  disabled={active || setupTotpMut.isPending}
                  onClick={() => initiateMethod(m)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all disabled:cursor-default"
                  style={{
                    borderColor: active ? ORANGE : "#f1f5f9",
                    background:  active ? "#fff7ed" : "#f9fafb",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
                    style={{ background: active ? `linear-gradient(135deg, ${ORANGE}, #ea580c)` : "#e5e7eb" }}
                  >
                    {loading
                      ? <Loader2 size={16} className="text-white animate-spin" />
                      : m === "totp"
                        ? <Smartphone size={16} className={active ? "text-white" : "text-gray-400"} />
                        : <Mail size={16} className={active ? "text-white" : "text-gray-400"} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: active ? "#7c2d12" : "#374151" }}>
                      {m === "totp" ? "Authenticator App" : "Email OTP"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {m === "totp" ? "Most secure · TOTP codes" : "Code via email on sign-in"}
                    </p>
                  </div>
                  {active && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
                      style={{ background: ORANGE, color: "white" }}>
                      <Check size={9} />Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Not enabled: enable CTA ── */}
      {!twoFaEnabled && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm">
          <p className="text-sm font-bold" style={{ color: NAVY }}>Enable Two-Factor Authentication</p>
          <p className="text-xs text-gray-500">Choose your verification method to add an extra layer of protection.</p>
          <div className="space-y-2">
            {(["totp", "otp"] as const).map((m) => (
              <button
                key={m} type="button"
                disabled={setupTotpMut.isPending}
                onClick={() => initiateMethod(m)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all"
                style={{ borderColor: "#f1f5f9", background: "#fafafa" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: m === "totp" ? "#fff7ed" : "#eff6ff" }}
                >
                  {setupTotpMut.isPending && m === "totp"
                    ? <Loader2 size={16} style={{ color: ORANGE }} className="animate-spin" />
                    : m === "totp"
                      ? <Smartphone size={16} style={{ color: ORANGE }} />
                      : <Mail size={16} className="text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {m === "totp" ? "Authenticator App" : "Email OTP"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {m === "totp" ? "Google Authenticator, Authy — most secure" : "Code sent to your email"}
                  </p>
                </div>
                <Zap size={14} className="text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Backup codes bar (when enabled) ── */}
      {twoFaEnabled && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound size={14} style={{ color: NAVY }} />
              <p className="text-sm font-bold" style={{ color: NAVY }}>Backup Codes</p>
            </div>
            <button
              type="button"
              onClick={() => setShowCodes(v => !v)}
              className="text-xs font-semibold px-3 py-1 rounded-full transition-colors"
              style={{ background: showCodes ? NAVY : "#eef0f9", color: showCodes ? "white" : NAVY }}
            >
              {showCodes ? "Hide" : "Show codes"}
            </button>
          </div>

          {/* progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">{codesRemaining} of {TOTAL_CODES} remaining</span>
              <span style={{ color: codesRemaining <= 2 ? "#ef4444" : GREEN }}>
                {Math.round((codesRemaining / TOTAL_CODES) * 100)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(codesRemaining / TOTAL_CODES) * 100}%`,
                  background: codesRemaining <= 2 ? "#ef4444" : GREEN,
                }}
              />
            </div>
            {codesRemaining <= 2 && (
              <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                <AlertTriangle size={10} />
                Running low — disable and re-enable 2FA to generate fresh codes.
              </p>
            )}
          </div>

          {showCodes && (
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
              <p className="text-[11px] text-gray-400 mb-2">
                Your actual codes are hidden for security. Use them only if you lose access to your {twoFaMethod === "totp" ? "authenticator app" : "email"}.
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: TOTAL_CODES }).map((_, i) => (
                  <div
                    key={i}
                    className="h-7 rounded-lg flex items-center justify-center"
                    style={{
                      background: i < (TOTAL_CODES - codesRemaining) ? "#f3f4f6" : "#d1fae5",
                      border:     `1px solid ${i < (TOTAL_CODES - codesRemaining) ? "#e5e7eb" : "#a7f3d0"}`,
                    }}
                  >
                    {i < (TOTAL_CODES - codesRemaining)
                      ? <div className="w-3 h-0.5 rounded bg-gray-300" />
                      : <Check size={10} className="text-emerald-600" />}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center">
                Green = available · Grey = used
              </p>
            </div>
          )}

          <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
            <KeyRound size={10} />
            Lost your codes? Disable and re-enable 2FA to generate 8 fresh ones.
          </p>
        </div>
      )}

      {/* ── Disable button ── */}
      {twoFaEnabled && (
        <button
          type="button"
          onClick={() => setStage("disable-confirm")}
          className="w-full py-3 rounded-2xl border-2 border-red-100 text-sm font-semibold text-red-400 bg-white flex items-center justify-center gap-2 transition-colors hover:border-red-200 hover:text-red-500"
        >
          <ShieldOff size={15} />Disable Two-Factor Authentication
        </button>
      )}
    </div>
  );
}
