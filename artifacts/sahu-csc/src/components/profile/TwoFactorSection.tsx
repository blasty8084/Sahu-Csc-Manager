import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck, ShieldOff, Mail, Smartphone, Loader2, Copy, Check,
  AlertTriangle, KeyRound, RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/components/profile/utils";
import { getGetMeQueryKey } from "@workspace/api-client-react";

type Method = "otp" | "totp";

// ── Live TOTP code fetcher — polls /auth/2fa/current-totp-code every second
// and fires onCode(code) whenever a fresh code arrives.
function useLiveTotpCode(enabled: boolean, onCode: (code: string) => void) {
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [display, setDisplay] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;

  const fetch_ = useCallback(async () => {
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/auth/2fa/current-totp-code`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setDisplay(data.code as string);
      setTimeLeft(data.timeRemaining as number);
      setLoading(false);
      onCodeRef.current(data.code as string);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    fetch_();
    const iv = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { fetch_(); return 120; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [enabled, fetch_]);

  return { display, timeLeft, loading };
}

// ── TOTP verify panel — shown after QR scan; auto-fills the confirmation code ──
function TotpVerifyPanel({
  totpSetup, totpCode, setTotpCode, isPending, onConfirm, onCancel,
}: {
  totpSetup: { qrCode: string; manualEntryKey: string };
  totpCode: string;
  setTotpCode: (v: string) => void;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { display, timeLeft, loading } = useLiveTotpCode(true, setTotpCode);

  const pct = Math.round((timeLeft / 120) * 100);
  const urgent = timeLeft <= 20;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <p className="text-sm font-semibold">Scan with your authenticator app</p>
      <div className="flex justify-center">
        <img src={totpSetup.qrCode} alt="TOTP QR code" className="w-40 h-40 rounded-lg border" />
      </div>
      <p className="text-xs text-muted-foreground text-center">Or enter this key manually:</p>
      <p className="text-center font-mono text-sm tracking-wider bg-muted rounded-lg py-2">{totpSetup.manualEntryKey}</p>

      {/* Live code display */}
      <div className={`rounded-lg border-2 p-3 text-center transition-colors ${urgent ? "border-orange-300 bg-orange-50" : "border-primary/20 bg-primary/5"}`}>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1 flex items-center justify-center gap-1">
          <RefreshCw size={9} /> Auto-generated code
        </p>
        {loading ? (
          <Loader2 size={20} className="animate-spin mx-auto text-primary" />
        ) : (
          <p className={`font-mono text-2xl font-bold tracking-[0.3em] ${urgent ? "text-orange-600" : "text-primary"}`}>
            {display.slice(0, 3)} {display.slice(3)}
          </p>
        )}
        {/* Countdown bar */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${urgent ? "bg-orange-400" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">Refreshes in {timeLeft}s</p>
      </div>

      <Input
        placeholder="6-digit code"
        value={totpCode}
        onChange={(e) => setTotpCode(e.target.value)}
        className="text-center tracking-widest font-semibold"
        maxLength={6}
        inputMode="numeric"
      />
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button className="flex-1" disabled={isPending || totpCode.length < 6} onClick={onConfirm}>
          {isPending ? <Loader2 size={14} className="animate-spin" /> : "Confirm"}
        </Button>
      </div>
    </div>
  );
}

// ── Two-Factor Authentication settings — enable/disable OTP or TOTP,
// TOTP setup with QR code, one-time backup code reveal. ──
export function TwoFactorSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const twoFaEnabled = !!(user as any)?.twoFaEnabled;
  const twoFaMethod: Method = (user as any)?.twoFaMethod ?? "otp";

  const [stage, setStage] = useState<"idle" | "choose" | "otp-password" | "totp-qr" | "totp-verify" | "backup-codes" | "disable-password">("idle");
  const [password, setPassword] = useState("");
  const [totpSetup, setTotpSetup] = useState<{ qrCode: string; manualEntryKey: string } | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const refreshMe = () => qc.invalidateQueries({ queryKey: getGetMeQueryKey() });

  const setupTotpMut = useMutation({
    mutationFn: () => apiFetch("/auth/2fa/setup-totp", { method: "POST" }),
    onSuccess: (data) => { setTotpSetup(data); setStage("totp-verify"); },
    onError: (e: any) => toast({ variant: "destructive", title: e.message }),
  });

  const verifyTotpMut = useMutation({
    mutationFn: () => apiFetch("/auth/2fa/verify-totp", { method: "POST", body: JSON.stringify({ code: totpCode }) }),
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes ?? null);
      setStage(data.backupCodes ? "backup-codes" : "idle");
      setTotpCode("");
      refreshMe();
      toast.success("Authenticator app connected", "TOTP two-factor authentication is now active.");
    },
    onError: (e: any) => toast({ variant: "destructive", title: e.message ?? "Invalid code" }),
  });

  const enableOtpMut = useMutation({
    mutationFn: () => apiFetch("/auth/2fa/enable-otp", { method: "POST", body: JSON.stringify({ currentPassword: password }) }),
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes ?? null);
      setStage(data.backupCodes ? "backup-codes" : "idle");
      setPassword("");
      refreshMe();
      toast.success("Email OTP enabled", "You'll receive a code by email on new sign-ins.");
    },
    onError: (e: any) => toast({ variant: "destructive", title: e.message ?? "Failed to enable" }),
  });

  const disableMut = useMutation({
    mutationFn: () => apiFetch("/auth/2fa/disable", { method: "POST", body: JSON.stringify({ currentPassword: password }) }),
    onSuccess: () => {
      setPassword("");
      setStage("idle");
      refreshMe();
      toast.success("Two-factor authentication disabled");
    },
    onError: (e: any) => toast({ variant: "destructive", title: e.message ?? "Failed to disable" }),
  });

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    }).catch(() => {});
  };

  // ── Backup codes reveal (shown once after enabling) ──
  if (stage === "backup-codes" && backupCodes) {
    return (
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-600" />
          <p className="text-sm font-bold text-amber-800">Save your backup codes</p>
        </div>
        <p className="text-xs text-amber-700">
          Each code can be used once if you lose access to your authenticator or email. Store them somewhere safe — they won't be shown again.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {backupCodes.map((code, i) => (
            <button
              key={code}
              type="button"
              onClick={() => copyCode(code, i)}
              className="flex items-center justify-between gap-1.5 font-mono text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-2"
            >
              {code}
              {copiedIdx === i ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-muted-foreground" />}
            </button>
          ))}
        </div>
        <Button className="w-full" onClick={() => { setBackupCodes(null); setStage("idle"); }}>I've saved these codes</Button>
      </div>
    );
  }

  // ── TOTP QR verification step ──
  if (stage === "totp-verify" && totpSetup) {
    return (
      <TotpVerifyPanel
        totpSetup={totpSetup}
        totpCode={totpCode}
        setTotpCode={setTotpCode}
        isPending={verifyTotpMut.isPending}
        onConfirm={() => verifyTotpMut.mutate()}
        onCancel={() => { setStage("idle"); setTotpSetup(null); setTotpCode(""); }}
      />
    );
  }

  // ── Password confirm (for enabling OTP or disabling 2FA) ──
  if (stage === "otp-password" || stage === "disable-password") {
    const isDisable = stage === "disable-password";
    return (
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">{isDisable ? "Confirm to disable 2FA" : "Confirm your password"}</p>
        <Input type="password" placeholder="Current password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => { setStage("idle"); setPassword(""); }}>Cancel</Button>
          <Button
            className="flex-1"
            variant={isDisable ? "destructive" : "default"}
            disabled={!password || (isDisable ? disableMut.isPending : enableOtpMut.isPending)}
            onClick={() => isDisable ? disableMut.mutate() : enableOtpMut.mutate()}
          >
            {(isDisable ? disableMut.isPending : enableOtpMut.isPending) ? <Loader2 size={14} className="animate-spin" /> : "Confirm"}
          </Button>
        </div>
      </div>
    );
  }

  // ── Method choice ──
  if (stage === "choose") {
    return (
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <p className="text-sm font-semibold mb-1">Choose a verification method</p>
        <button
          type="button"
          onClick={() => setStage("otp-password")}
          className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent text-left"
        >
          <Mail size={16} className="text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Email OTP</p>
            <p className="text-xs text-muted-foreground">Get a code by email on new sign-ins</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setupTotpMut.mutate()}
          disabled={setupTotpMut.isPending}
          className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent text-left"
        >
          <Smartphone size={16} className="text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Authenticator App (TOTP)</p>
            <p className="text-xs text-muted-foreground">Google Authenticator, Authy, etc.</p>
          </div>
          {setupTotpMut.isPending && <Loader2 size={14} className="animate-spin" />}
        </button>
        <Button variant="ghost" className="w-full text-xs" onClick={() => setStage("idle")}>Cancel</Button>
      </div>
    );
  }

  // ── Idle summary ──
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${twoFaEnabled ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
            {twoFaEnabled ? <ShieldCheck size={16} /> : <ShieldOff size={16} />}
          </div>
          <div>
            <p className="text-sm font-semibold">Two-Factor Authentication</p>
            <p className="text-xs text-muted-foreground">
              {twoFaEnabled
                ? `Enabled via ${twoFaMethod === "totp" ? "authenticator app" : "email OTP"}`
                : "Not enabled — add an extra layer of security"}
            </p>
          </div>
        </div>
        {twoFaEnabled ? (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
            <ShieldCheck size={11} /> Always On
          </span>
        ) : (
          <Button size="sm" disabled={setupTotpMut.isPending} onClick={() => setupTotpMut.mutate()}>
            {setupTotpMut.isPending ? <Loader2 size={14} className="animate-spin" /> : "Enable"}
          </Button>
        )}
      </div>
      {twoFaEnabled && twoFaMethod === "totp" && (
        <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
          <KeyRound size={11} />Lost your device? Use a backup code at login, then re-enable to get a fresh set.
        </p>
      )}
    </div>
  );
}
