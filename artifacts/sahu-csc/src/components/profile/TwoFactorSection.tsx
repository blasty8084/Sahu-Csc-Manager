import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/components/profile/utils";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { TotpSetupCard }          from "./totp/TotpSetupCard";
import { TotpRegenCard }          from "./totp/TotpRegenCard";
import { OtpToggleCard }          from "./otp/OtpToggleCard";
import { BackupCodesHealthBar }   from "./BackupCodesHealthBar";
import { SecurityHeroCard }       from "./SecurityHeroCard";
import { TwoFaMethodSwitcher }    from "./TwoFaMethodSwitcher";
import { TwoFaEnableCTA }         from "./TwoFaEnableCTA";
import { TwoFaBackupCodesPanel }  from "./TwoFaBackupCodesPanel";

type Method = "otp" | "totp";
type Stage  = "idle" | "otp-confirm" | "totp-setup" | "backup-codes" | "disable-confirm" | "regen-confirm";

export function TwoFactorSection() {
  const { user }  = useAuth();
  const { toast } = useToast();
  const qc        = useQueryClient();

  const twoFaEnabled        = !!(user as any)?.twoFaEnabled;
  const twoFaMethod: Method = (user as any)?.twoFaMethod ?? "otp";
  const userEmail: string   = (user as any)?.email ?? "";
  const score               = twoFaEnabled ? (twoFaMethod === "totp" ? 100 : 74) : 28;

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

  if (stage === "backup-codes" && newCodes) {
    return (
      <TwoFaBackupCodesPanel
        codes={newCodes} pendingMethod={pendingM} copiedIdx={copiedIdx}
        onCopyCode={copyCode}
        onDone={() => { setNewCodes(null); reset(); refreshAll(); }}
      />
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
      <SecurityHeroCard twoFaEnabled={twoFaEnabled} twoFaMethod={twoFaMethod} score={score} userEmail={userEmail} />

      {twoFaEnabled && (
        <TwoFaMethodSwitcher twoFaMethod={twoFaMethod} isSetupPending={setupTotpMut.isPending} onInitiate={initiateMethod} />
      )}

      {!twoFaEnabled && (
        <TwoFaEnableCTA isSetupPending={setupTotpMut.isPending} onInitiate={initiateMethod} />
      )}

      {twoFaEnabled && (
        <BackupCodesHealthBar
          codesRemaining={codesRemaining} twoFaMethod={twoFaMethod}
          showCodes={showCodes}
          onToggleShowCodes={() => setShowCodes(v => !v)}
          onRegen={() => { setStage("regen-confirm"); setPendingM(twoFaMethod); }}
        />
      )}

      {twoFaEnabled && (
        <button type="button" onClick={() => setStage("disable-confirm")}
          className="w-full py-3 rounded-2xl border-2 border-red-100 text-sm font-semibold text-red-400 bg-white flex items-center justify-center gap-2 transition-colors hover:border-red-200 hover:text-red-500">
          <ShieldOff size={15} />Disable Two-Factor Authentication
        </button>
      )}
    </div>
  );
}
