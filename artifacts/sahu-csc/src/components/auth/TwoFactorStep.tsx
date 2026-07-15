import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, KeyRound, Loader2, ArrowLeft, Mail, Smartphone } from "lucide-react";
import type { TwoFaChallenge } from "@/hooks/use-auth";

export interface TwoFactorStepProps {
  challenge: TwoFaChallenge;
  onVerify: (data: { code: string; trustDevice: boolean; isBackupCode: boolean; method: "otp" | "totp" }) => Promise<void>;
  onBack: () => void;
}

// ── Live TOTP code fetcher ────────────────────────────────────────────────────
function useLiveTotpCode(enabled: boolean) {
  const [liveCode, setLiveCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    try {
      const base = (import.meta as any).env?.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/auth/2fa/current-totp-code`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setLiveCode(data.code as string);
      setTimeLeft(data.timeRemaining as number);
      setLoading(false);
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

  return { liveCode, timeLeft, loading };
}

// ── Method picker — shown first so user can choose OTP or TOTP ────────────────
function MethodPicker({
  onChoose,
  onBack,
  isNewDevice,
}: {
  onChoose: (method: "otp" | "totp", maskedEmail?: string) => void;
  onBack: () => void;
  isNewDevice: boolean;
}) {
  const [sendingOtp, setSendingOtp] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const chooseOtp = async () => {
    setSendingOtp(true);
    setErr(null);
    try {
      const base = (import.meta as any).env?.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/auth/2fa/send-login-otp`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Failed to send OTP"); return; }
      onChoose("otp", data.maskedEmail);
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
      <div className="flex flex-col items-center text-center mb-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
          style={{ background: "linear-gradient(135deg, #0b2c60, #1d4ed8)" }}
        >
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-base font-bold text-gray-900">
          {isNewDevice ? "New Device Detected" : "Verify It's You"}
        </h3>
        <p className="text-xs text-gray-500 mt-1">Choose how you want to verify.</p>
      </div>

      <div className="space-y-3">
        {/* TOTP card */}
        <button
          type="button"
          onClick={() => onChoose("totp")}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 text-left transition-colors"
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#0b2c60,#1d4ed8)" }}>
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Authenticator App (TOTP)</p>
            <p className="text-xs text-gray-500">Auto-generated code from your app</p>
          </div>
        </button>

        {/* OTP card */}
        <button
          type="button"
          onClick={chooseOtp}
          disabled={sendingOtp}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 text-left transition-colors disabled:opacity-60"
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-indigo-100">
            {sendingOtp ? <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" /> : <Mail className="w-4 h-4 text-indigo-600" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Email OTP</p>
            <p className="text-xs text-gray-500">Send a 6-digit code to your email</p>
          </div>
        </button>
      </div>

      {err && <p className="text-xs text-red-600 text-center mt-3">{err}</p>}

      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 mt-4"
      >
        <ArrowLeft className="w-3 h-3" /> Back to login
      </button>
    </motion.div>
  );
}

// ── Code entry — shared for both OTP and TOTP ─────────────────────────────────
function CodeEntry({
  method,
  maskedEmail,
  isNewDevice,
  onVerify,
  onBack,
}: {
  method: "otp" | "totp";
  maskedEmail?: string;
  isNewDevice: boolean;
  onVerify: (data: { code: string; trustDevice: boolean; isBackupCode: boolean; method: "otp" | "totp" }) => Promise<void>;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTotp = method === "totp";
  const { liveCode, timeLeft, loading: codeLoading } = useLiveTotpCode(isTotp && !useBackupCode);

  // Auto-fill TOTP code
  const prevLiveCode = useRef("");
  useEffect(() => {
    if (isTotp && !useBackupCode && liveCode && liveCode !== prevLiveCode.current) {
      prevLiveCode.current = liveCode;
      setCode(liveCode);
    }
  }, [isTotp, useBackupCode, liveCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onVerify({ code: code.trim(), trustDevice, isBackupCode: useBackupCode, method });
    } catch (err: any) {
      setError(err?.message ?? "Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
      <div className="flex flex-col items-center text-center mb-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
          style={{ background: "linear-gradient(135deg, #0b2c60, #1d4ed8)" }}
        >
          {isTotp ? <ShieldCheck className="w-7 h-7 text-white" /> : <Mail className="w-7 h-7 text-white" />}
        </div>
        <h3 className="text-base font-bold text-gray-900">
          {isNewDevice ? "New Device Detected" : "Verify It's You"}
        </h3>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">
          {isTotp
            ? "Auto-generated code from your authenticator app."
            : `We've sent a verification code to ${maskedEmail ?? "your registered email"}.`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Live TOTP code display */}
        {isTotp && !useBackupCode && (
          <div className={`rounded-xl border-2 p-3 text-center transition-colors ${timeLeft <= 20 ? "border-orange-300 bg-orange-50" : "border-blue-200 bg-blue-50"}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Auto-generated code</p>
            {codeLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600" />
            ) : (
              <p className={`font-mono text-2xl font-bold tracking-[0.3em] ${timeLeft <= 20 ? "text-orange-600" : "text-blue-700"}`}>
                {liveCode.slice(0, 3)} {liveCode.slice(3)}
              </p>
            )}
            <div className="mt-2 h-1.5 w-full rounded-full bg-blue-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 20 ? "bg-orange-400" : "bg-blue-500"}`}
                style={{ width: `${Math.round((timeLeft / 120) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Refreshes in {timeLeft}s</p>
          </div>
        )}

        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            autoFocus
            inputMode={useBackupCode ? "text" : "numeric"}
            placeholder={useBackupCode ? "Backup code (e.g. 1A2B3-C4D5E)" : "6-digit code"}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="pl-10 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all tracking-widest text-center font-semibold"
            maxLength={useBackupCode ? 12 : 6}
          />
        </div>

        {error && (
          <p className="text-xs font-medium text-center" style={{ color: "#be123c" }}>{error}</p>
        )}

        <label className="flex items-center gap-2 cursor-pointer select-none justify-center">
          <Checkbox checked={trustDevice} onCheckedChange={(v) => setTrustDevice(!!v)} className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
          <span className="text-sm text-gray-600">Trust this device for 30 days</span>
        </label>

        <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
          <Button
            type="submit"
            disabled={isSubmitting || !code.trim()}
            className="w-full h-12 font-bold text-base tracking-wide text-white shadow-lg border-0"
            style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Verifying…</span>
            ) : "Verify & Continue →"}
          </Button>
        </motion.div>

        <div className="flex items-center justify-between text-xs">
          <button type="button" onClick={onBack} className="flex items-center gap-1 font-medium text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-3 h-3" /> Choose method
          </button>
          {isTotp && (
            <button
              type="button"
              onClick={() => { setUseBackupCode((v) => !v); setCode(""); setError(null); }}
              className="font-semibold"
              style={{ color: "#0b2c60" }}
            >
              {useBackupCode ? "Use authenticator code instead" : "Use a backup code instead"}
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
export function TwoFactorStep({ challenge, onVerify, onBack }: TwoFactorStepProps) {
  // Start on picker; if server already chose OTP (new-device flow without TOTP)
  // skip the picker and go straight to OTP entry.
  const [chosenMethod, setChosenMethod] = useState<"otp" | "totp" | null>(
    challenge.method === "otp" && !challenge.isNewDevice ? "otp" : null,
  );
  const [maskedEmail, setMaskedEmail] = useState<string | undefined>(challenge.maskedEmail);

  const handleChoose = (method: "otp" | "totp", email?: string) => {
    if (email) setMaskedEmail(email);
    setChosenMethod(method);
  };

  return (
    <AnimatePresence mode="wait">
      {chosenMethod === null ? (
        <MethodPicker
          key="picker"
          onChoose={handleChoose}
          onBack={onBack}
          isNewDevice={challenge.isNewDevice}
        />
      ) : (
        <CodeEntry
          key={`entry-${chosenMethod}`}
          method={chosenMethod}
          maskedEmail={maskedEmail}
          isNewDevice={challenge.isNewDevice}
          onVerify={onVerify}
          onBack={() => setChosenMethod(null)}
        />
      )}
    </AnimatePresence>
  );
}
