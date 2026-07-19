import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, ShieldOff, Mail, Smartphone, Loader2,
  Copy, Check, AlertTriangle, QrCode, Zap, Clock, Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/components/profile/utils";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { TotpSetupCard } from "./totp/TotpSetupCard";
import { TotpRegenCard } from "./totp/TotpRegenCard";
import { OtpToggleCard } from "./otp/OtpToggleCard";
import { BackupCodesHealthBar } from "./BackupCodesHealthBar";

// ── Brand tokens ─────────────────────────────────────────────────────────────
const NAVY   = "#0B1340";
const ORANGE = "#F97316";
const GREEN  = "#10b981";

type Method = "otp" | "totp";
type Stage  = "idle" | "otp-confirm" | "totp-setup" | "backup-codes" | "disable-confirm" | "regen-confirm";

// ── Animated security-score ring ─────────────────────────────────────────────
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
        strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
        transform="rotate(-90 48 48)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="48" y="53" textAnchor="middle" fontSize="18" fontWeight="800" fill="white">{score}</text>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function TwoFactorSection() {
  const { user }  = useAuth();
  const { toast } = useToast();
  const qc        = useQueryClient();

  const twoFaEnabled           = !!(user as any)?.twoFaEnabled;
  const twoFaMethod: Method    = (user as any)?.twoFaMethod ?? "otp";
  const userEmail: string      = (user as any)?.email ?? "";
  const score                  = twoFaEnabled ? (twoFaMethod === "totp" ? 100 : 74) : 28;

  // ── Shared UI state ───────────────────────────────────────────────────────
  const [stage,        setStage]        = useState<Stage>("idle");
  const [pendingM,     setPendingM]     = useState<Method>("otp");
  const [password,     setPassword]     = useState("");
  const [showPass,     setShowPass]     = useState(false);
  const [totpCode,     setTotpCode]     = useState("");
  const [newCodes,     setNewCodes]     = useState<string[] | null>(null);
  const [copiedIdx,    setCopiedIdx]    = useState<number | null>(null);
  const [showCodes,    setShowCodes]    = useState(false);
  const [qrDataUrl,    setQrDataUrl]    = useState<string | null>(null);
  const [totpSecret,   setTotpSecret]   = useState<string | null>(null);
  const [showSecret,   setShowSecret]   = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // ── Backup-codes count ────────────────────────────────────────────────────
  const { data: statusData } = useQuery<{ backupCodesRemaining: number; twoFaEnabled: boolean; twoFaMethod: Method; totpConfigured: boolean }>({
    queryKey: ["2fa-status"],
    queryFn:  () => apiFetch("/auth/2fa/status"),
    enabled:  twoFaEnabled,
    staleTime: 30_000,
  });
  const codesRemaining = statusData?.backupCodesRemaining ?? 0;

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
    qc.invalidateQueries({ queryKey: ["2fa-status"] });
  };

  const reset = () => {
    setStage("idle"); setPassword(""); setShowPass(false); setTotpCode("");
    setPendingM("otp"); setQrDataUrl(null); setTotpSecret(null);
    setShowSecret(false); setCopiedSecret(false);
  };

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 1500);
    }).catch(() => {});
  };

  // ── Mutations ─────────────────────────────────────────────────────────────
  const setupTotpMut = useMutation({
    mutationFn: () => apiFetch("/auth/2fa/setup-totp", { method: "POST" }),
    onSuccess:  (data) => {
      if (data.qrCodeDataUrl) setQrDataUrl(data.qrCodeDataUrl);
      if (data.secret) setTotpSecret(data.secret);
      setStage("totp-setup");
    },
    onError: (e: any) => toast({ variant: "destructive", title: e.message ?? "Failed to start TOTP setup" }),
  });

  const verifyTotpMut = useMutation({
    mutationFn: () => apiFetch("/auth/2fa/verify-totp", { method: "POST", body: JSON.stringify({ code: totpCode }) }),
    onSuccess:  (data) => {
      setTotpCode("");
      if (data.backupCodes?.length) { setNewCodes(data.backupCodes); setStage("backup-codes"); }
      else { reset(); refreshAll(); }
      toast.success("Authenticator app connected", "TOTP two-factor authentication is now active.");
    },
    onError: (e: any) => toast({ variant: "destructive", title: e.message ?? "Invalid code — try again" }),
  });

  const enableOtpMut = useMutation({
    mutationFn: () => apiFetch("/auth/2fa/enable-otp", { method: "POST", body: JSON.stringify({ currentPassword: password }) }),
    onSuccess:  (data) => {
      setPassword("");
      if (data.backupCodes?.length) { setNewCodes(data.backupCodes); setStage("backup-codes"); }
      else { reset(); refreshAll(); }
      toast.success("Email OTP enabled", "A code will be sent to your email on new sign-ins.");
    },
    onError: (e: any) => toast({ variant: "destructive", title: e.message ?? "Failed to enable" }),
  });

  const disableMut = useMutation({
    mutationFn: () => apiFetch("/auth/2fa/disable", { method: "POST", body: JSON.stringify({ currentPassword: password }) }),
    onSuccess:  () => { reset(); refreshAll(); toast.success("Two-factor authentication disabled"); },
    onError: (e: any) => toast({ variant: "destructive", title: e.message ?? "Failed to disable" }),
  });

  const regenMut = useMutation({
    mutationFn: () => apiFetch("/auth/2fa/regenerate-backup-codes", { method: "POST", body: JSON.stringify({ currentPassword: password }) }),
    onSuccess:  (data) => {
      setPassword("");
      if (data.backupCodes?.length) { setNewCodes(data.backupCodes); setStage("backup-codes"); setPendingM(twoFaMethod); }
      else { reset(); refreshAll(); }
      toast.success("New backup codes generated", "Your old codes have been invalidated.");
    },
    onError: (e: any) => toast({ variant: "destructive", title: e.message ?? "Failed to regenerate" }),
  });

  const initiateMethod = (m: Method) => {
    setPendingM(m);
    if (m === "otp") setStage("otp-confirm");
    else             setupTotpMut.mutate();
  };

  // ── Stage screens (early returns) ─────────────────────────────────────────

  // One-time backup codes save screen
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

  if (stage === "totp-setup") {
    return (
      <TotpSetupCard
        qrDataUrl={qrDataUrl} totpSecret={totpSecret}
        showSecret={showSecret} onToggleSecret={() => setShowSecret(v => !v)}
        copiedSecret={copiedSecret} onCopySecret={() => {
          if (!totpSecret) return;
          navigator.clipboard?.writeText(totpSecret).then(() => {
            setCopiedSecret(true); setTimeout(() => setCopiedSecret(false), 2000);
          }).catch(() => {});
        }}
        totpCode={totpCode} onTotpCodeChange={setTotpCode}
        isPending={verifyTotpMut.isPending}
        onVerify={() => verifyTotpMut.mutate()} onCancel={reset}
      />
    );
  }

  if (stage === "regen-confirm") {
    return (
      <TotpRegenCard
        codesRemaining={codesRemaining}
        password={password} showPass={showPass}
        isPending={regenMut.isPending}
        onPasswordChange={setPassword} onToggleShowPass={() => setShowPass(v => !v)}
        onConfirm={() => regenMut.mutate()} onCancel={reset}
      />
    );
  }

  if (stage === "otp-confirm" || stage === "disable-confirm") {
    const mut = stage === "disable-confirm" ? disableMut : enableOtpMut;
    return (
      <OtpToggleCard
        stage={stage}
        password={password} showPass={showPass}
        isPending={mut.isPending}
        onPasswordChange={setPassword} onToggleShowPass={() => setShowPass(v => !v)}
        onConfirm={() => mut.mutate()} onCancel={reset}
      />
    );
  }

  // ── Idle: Security Hub view ───────────────────────────────────────────────
  return (
    <div className="space-y-3">

      {/* Hero card */}
      <div className="rounded-2xl overflow-hidden shadow-lg" style={{ background: `linear-gradient(145deg, ${NAVY} 0%, #162060 55%, #1d3070 100%)` }}>
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
          <div className="flex flex-wrap gap-1.5">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{ background: twoFaEnabled ? "rgba(16,185,129,0.18)" : "rgba(239,68,68,0.18)", color: twoFaEnabled ? "#6ee7b7" : "#fca5a5" }}>
              {twoFaEnabled ? <ShieldCheck size={10} /> : <ShieldOff size={10} />}
              {twoFaEnabled ? "2FA ON" : "2FA OFF"}
            </span>
            {twoFaEnabled && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                style={{ background: "rgba(249,115,22,0.18)", color: "#fdba74" }}>
                {twoFaMethod === "totp" ? <Smartphone size={10} /> : <Mail size={10} />}
                {twoFaMethod === "totp" ? "TOTP" : "Email OTP"}
              </span>
            )}
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{ background: "rgba(99,120,255,0.18)", color: "#a5b4fc" }}>
              <Star size={10} /> {score}/100
            </span>
          </div>
        </div>
        {twoFaEnabled && (
          <div className="px-4 py-2.5 border-t border-white/10 flex items-center gap-2">
            <Clock size={11} className="text-blue-300 flex-shrink-0" />
            <span className="text-[11px] text-blue-300">
              {twoFaMethod === "totp"
                ? "Authenticator app active — codes rotate every 30 s"
                : userEmail ? `OTP codes sent to ${userEmail}` : "OTP codes sent to your registered email"}
            </span>
          </div>
        )}
      </div>

      {/* Method switcher (when enabled) */}
      {twoFaEnabled && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: NAVY }}>Verification Method</p>
            <span className="text-xs text-gray-400">Tap to switch</span>
          </div>
          <div className="space-y-2">
            {(["totp", "otp"] as const).map((m) => {
              const active  = twoFaMethod === m;
              const loading = !active && m === "totp" && setupTotpMut.isPending;
              return (
                <button key={m} type="button" disabled={active || setupTotpMut.isPending}
                  onClick={() => initiateMethod(m)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all disabled:cursor-default"
                  style={{ borderColor: active ? ORANGE : "#f1f5f9", background: active ? "#fff7ed" : "#f9fafb" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
                    style={{ background: active ? `linear-gradient(135deg, ${ORANGE}, #ea580c)` : "#e5e7eb" }}>
                    {loading ? <Loader2 size={16} className="text-white animate-spin" />
                      : m === "totp" ? <Smartphone size={16} className={active ? "text-white" : "text-gray-400"} />
                      : <Mail size={16} className={active ? "text-white" : "text-gray-400"} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: active ? "#7c2d12" : "#374151" }}>
                      {m === "totp" ? "Authenticator App" : "Email OTP"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {m === "totp" ? "Google Authenticator, Authy, any TOTP app" : "Code via email on sign-in"}
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

      {/* Enable CTA (when disabled) */}
      {!twoFaEnabled && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm">
          <p className="text-sm font-bold" style={{ color: NAVY }}>Enable Two-Factor Authentication</p>
          <p className="text-xs text-gray-500">Choose your verification method to add an extra layer of protection.</p>
          <div className="space-y-2">
            {(["totp", "otp"] as const).map((m) => (
              <button key={m} type="button" disabled={setupTotpMut.isPending}
                onClick={() => initiateMethod(m)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all"
                style={{ borderColor: "#f1f5f9", background: "#fafafa" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: m === "totp" ? "#fff7ed" : "#eff6ff" }}>
                  {setupTotpMut.isPending && m === "totp"
                    ? <Loader2 size={16} style={{ color: ORANGE }} className="animate-spin" />
                    : m === "totp" ? <Smartphone size={16} style={{ color: ORANGE }} />
                    : <Mail size={16} className="text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {m === "totp" ? "Authenticator App" : "Email OTP"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {m === "totp" ? "Google Authenticator, Authy, any TOTP app" : "Code sent to your email"}
                  </p>
                </div>
                {m === "totp" ? <QrCode size={14} className="text-gray-300 flex-shrink-0" />
                  : <Zap size={14} className="text-gray-300 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backup codes health bar (when enabled) */}
      {twoFaEnabled && (
        <BackupCodesHealthBar
          codesRemaining={codesRemaining}
          twoFaMethod={twoFaMethod}
          showCodes={showCodes}
          onToggleShowCodes={() => setShowCodes(v => !v)}
          onRegen={() => { setStage("regen-confirm"); setPendingM(twoFaMethod); }}
        />
      )}

      {/* Disable 2FA button */}
      {twoFaEnabled && (
        <button type="button" onClick={() => setStage("disable-confirm")}
          className="w-full py-3 rounded-2xl border-2 border-red-100 text-sm font-semibold text-red-400 bg-white flex items-center justify-center gap-2 transition-colors hover:border-red-200 hover:text-red-500">
          <ShieldOff size={15} />Disable Two-Factor Authentication
        </button>
      )}
    </div>
  );
}
