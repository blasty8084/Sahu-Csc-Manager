import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShieldCheck, KeyRound, Loader2, ArrowLeft, Mail, Smartphone,
  QrCode, Copy, Check, AlertTriangle, WifiOff,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { TwoFaChallenge } from "@/hooks/use-auth";
import { RESEND_COOLDOWN } from "@/components/auth/loginTypes";

// ── Brand tokens (see replit.md) ─────────────────────────────────────────────
const NAVY = "#0B1340";
const ORANGE = "#F97316";

export interface TwoFactorStepProps {
  challenge: TwoFaChallenge;
  onSuccess: () => void;
  onBack: () => void;
}

type Method = "otp" | "totp";
type TotpSetup = { qrCode: string; manualEntryKey: string };

// ── Shared 2FA-code entry step, shown after credentials are accepted but a
// device/2FA challenge is required. Lets the user pick Email OTP or an
// Authenticator App (TOTP) — enrolling inline if TOTP isn't set up yet. ──
export function TwoFactorStep({ challenge, onSuccess, onBack }: TwoFactorStepProps) {
  const { verifyTwoFactor, switchTwoFaMethod, setupTotpPending, completeLogin } = useAuth();

  const [method, setMethod] = useState<Method>(challenge.method);
  const [maskedEmail, setMaskedEmail] = useState(challenge.maskedEmail);
  const [totpEnrolled, setTotpEnrolled] = useState(!!challenge.totpEnrolled);
  // Shown when the initial OTP email failed to send (e.g. SMTP not configured).
  const [otpSendError, setOtpSendError] = useState<string | null>(challenge.otpError ?? null);
  const [totpSetup, setTotpSetup] = useState<TotpSetup | null>(null);
  const [settingUpTotp, setSettingUpTotp] = useState(false);
  const [switching, setSwitching] = useState(false);

  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [pendingBackupCodes, setPendingBackupCodes] = useState<string[] | null>(null);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const startResendTimer = () => {
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    setResendSeconds(RESEND_COOLDOWN);
    resendTimerRef.current = setInterval(() => {
      setResendSeconds((s) => {
        if (s <= 1) { clearInterval(resendTimerRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  // Start the resend cooldown only when the initial method is OTP (the login
  // call already sent the first code). If we landed on TOTP (e.g. email
  // failed and server fell back to TOTP), there is no cooldown to enforce.
  useEffect(() => {
    if (challenge.method === "otp") startResendTimer();
    return () => { if (resendTimerRef.current) clearInterval(resendTimerRef.current); };
  }, []);

  const resetCodeEntry = () => {
    setCode("");
    setError(null);
    setUseBackupCode(false);
  };

  const handleSelectMethod = async (next: Method) => {
    if (next === method || switching) return;
    setSwitching(true);
    setError(null);
    setOtpSendError(null);
    try {
      const result = await switchTwoFaMethod(next);
      setMethod(next);
      resetCodeEntry();
      if (next === "otp") {
        if (result.maskedEmail) setMaskedEmail(result.maskedEmail);
        startResendTimer();
      } else {
        setTotpEnrolled(!!result.totpEnrolled);
      }
    } catch (err: any) {
      setError(err?.message ?? "Couldn't switch verification method. Please try again.");
    } finally {
      setSwitching(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || switching) return;
    setSwitching(true);
    setError(null);
    setOtpSendError(null);
    try {
      const result = await switchTwoFaMethod("otp");
      if (result.maskedEmail) setMaskedEmail(result.maskedEmail);
      startResendTimer();
    } catch (err: any) {
      setError(err?.message ?? "Couldn't resend the code. Please try again.");
    } finally {
      setSwitching(false);
    }
  };

  const handleSetupAuthenticator = async () => {
    setSettingUpTotp(true);
    setError(null);
    try {
      const setup = await setupTotpPending();
      setTotpSetup({ qrCode: setup.qrCode, manualEntryKey: setup.manualEntryKey });
    } catch (err: any) {
      setError(err?.message ?? "Couldn't start authenticator setup. Please try again.");
    } finally {
      setSettingUpTotp(false);
    }
  };

  const copyKey = (text: string, idx: number) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    }).catch(() => {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await verifyTwoFactor(method, {
        code: code.trim(),
        trustDevice,
        isBackupCode: useBackupCode,
      });
      if (result?.backupCodes) {
        // First-time TOTP enrollment just got confirmed — hold off completing
        // the login until the user has acknowledged their backup codes.
        setPendingBackupCodes(result.backupCodes);
        setPendingUser(result.user);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setError(err?.message ?? "Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishAfterBackupCodes = () => {
    if (pendingUser) completeLogin(pendingUser);
    setPendingBackupCodes(null);
    setPendingUser(null);
    onSuccess();
  };

  // ── Backup-codes acknowledgement (shown once, right after inline TOTP
  // enrollment during login) ──────────────────────────────────────────────
  if (pendingBackupCodes) {
    return (
      <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.25 }}>
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <p className="text-sm font-bold text-amber-800">Save your backup codes</p>
          </div>
          <p className="text-xs text-amber-700">
            Authenticator app connected. Each code below can be used once if you ever lose access to it — store them somewhere safe, they won't be shown again.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {pendingBackupCodes.map((c, i) => (
              <button
                key={c}
                type="button"
                onClick={() => copyKey(c, i)}
                className="flex items-center justify-between gap-1.5 font-mono text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-2"
              >
                {c}
                {copiedIdx === i ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-muted-foreground" />}
              </button>
            ))}
          </div>
          <Button
            className="w-full h-11 font-bold text-white border-0"
            style={{ background: NAVY }}
            onClick={finishAfterBackupCodes}
          >
            I've saved these codes — Continue
          </Button>
        </div>
      </motion.div>
    );
  }

  const isTotp = method === "totp";
  const showTotpEnrollment = isTotp && !totpEnrolled;

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.25 }}>
      <div className="flex flex-col items-center text-center mb-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
          style={{ background: "linear-gradient(135deg, #0b2c60, #1d4ed8)" }}
        >
          {isTotp ? <ShieldCheck className="w-7 h-7 text-white" /> : <Mail className="w-7 h-7 text-white" />}
        </div>
        <h3 className="text-base font-bold text-gray-900">
          {challenge.isNewDevice ? "New Device Detected" : "Verify It's You"}
        </h3>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">
          {showTotpEnrollment
            ? "Connect an authenticator app to verify with a code instead of email."
            : isTotp
              ? "Enter the code from your authenticator app."
              : `We've sent a verification code to ${maskedEmail ?? "your registered email"}.`}
        </p>
      </div>

      {/* ── Method selector ── */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl mb-4" style={{ background: "#f1f2f6" }}>
        <button
          type="button"
          disabled={switching || isSubmitting}
          onClick={() => handleSelectMethod("otp")}
          className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-60"
          style={method === "otp" ? { background: NAVY, color: "#fff" } : { color: "#6b7280" }}
        >
          <Mail className="w-3.5 h-3.5" />Email OTP
        </button>
        <button
          type="button"
          disabled={switching || isSubmitting}
          onClick={() => handleSelectMethod("totp")}
          className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-60"
          style={method === "totp" ? { background: ORANGE, color: "#fff" } : { color: "#6b7280" }}
        >
          <Smartphone className="w-3.5 h-3.5" />Authenticator App
        </button>
      </div>

      {/* OTP email delivery error — shown when the initial OTP send failed
          (e.g. SMTP not configured). User can switch to TOTP or use a backup code. */}
      {otpSendError && method === "otp" && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <WifiOff className="mt-0.5 w-4 h-4 flex-shrink-0 text-amber-600" />
          <div>
            <p className="text-xs font-semibold text-amber-800">Verification email couldn't be sent</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Switch to <span className="font-semibold">Authenticator App</span> above, or use a backup code below.
            </p>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {showTotpEnrollment ? (
          <motion.div key="totp-enroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-4">
            {!totpSetup ? (
              <Button
                type="button"
                onClick={handleSetupAuthenticator}
                disabled={settingUpTotp}
                className="w-full h-11 font-bold text-white border-0"
                style={{ background: ORANGE }}
              >
                {settingUpTotp ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Generating…</span>
                ) : (
                  <span className="flex items-center gap-2"><QrCode className="w-4 h-4" />Set up Authenticator</span>
                )}
              </Button>
            ) : (
              <>
                <div className="rounded-xl border border-gray-200 p-3 space-y-2 text-center">
                  <p className="text-xs font-semibold text-gray-700">Scan with your authenticator app</p>
                  <div className="flex justify-center">
                    <img src={totpSetup.qrCode} alt="TOTP QR code" className="w-36 h-36 rounded-lg border" />
                  </div>
                  <p className="text-[11px] text-gray-400">Or enter this key manually:</p>
                  <button
                    type="button"
                    onClick={() => copyKey(totpSetup.manualEntryKey, -1)}
                    className="w-full flex items-center justify-center gap-1.5 font-mono text-xs bg-gray-50 border border-gray-200 rounded-lg py-2 tracking-wider"
                  >
                    {totpSetup.manualEntryKey}
                    {copiedIdx === -1 ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-gray-400" />}
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      autoFocus
                      inputMode="numeric"
                      placeholder="Enter 6-digit code to confirm"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="pl-10 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all tracking-widest text-center font-semibold"
                      maxLength={6}
                    />
                  </div>
                  {error && <p className="text-xs font-medium text-center" style={{ color: "#be123c" }}>{error}</p>}
                  <label className="flex items-center gap-2 cursor-pointer select-none justify-center">
                    <Checkbox checked={trustDevice} onCheckedChange={(v) => setTrustDevice(!!v)} className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
                    <span className="text-sm text-gray-600">Trust this device for 30 days</span>
                  </label>
                  <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                    <Button
                      type="submit"
                      disabled={isSubmitting || code.trim().length !== 6}
                      className="w-full h-12 font-bold text-base tracking-wide text-white shadow-lg border-0"
                      style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Verifying…</span>
                      ) : "Confirm & Continue →"}
                    </Button>
                  </motion.div>
                </form>
              </>
            )}
            {error && !totpSetup && <p className="text-xs font-medium text-center mt-3" style={{ color: "#be123c" }}>{error}</p>}
            <button type="button" onClick={onBack} className="flex items-center gap-1 font-medium text-gray-500 hover:text-gray-700 text-xs">
              <ArrowLeft className="w-3 h-3" />Back
            </button>
          </motion.div>
        ) : (
          <motion.form key="code-entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onSubmit={handleSubmit} className="space-y-4">
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

            {!isTotp && !useBackupCode && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendSeconds > 0 || switching}
                  className="text-xs font-semibold transition-colors"
                  style={{ color: resendSeconds > 0 ? "#9ca3af" : NAVY }}
                >
                  {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend code"}
                </button>
              </div>
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
                <ArrowLeft className="w-3 h-3" />Back
              </button>
              <button
                type="button"
                onClick={() => { setUseBackupCode((v) => !v); setCode(""); setError(null); }}
                className="font-semibold"
                style={{ color: NAVY }}
              >
                {useBackupCode ? "Use a code instead" : "Use a backup code instead"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
