import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShieldCheck, KeyRound, Loader2, ArrowLeft, Mail, Smartphone,
  QrCode, Copy, Check, AlertTriangle, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { TwoFaChallenge } from "@/hooks/use-auth";
import { RESEND_COOLDOWN } from "@/components/auth/loginTypes";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const NAVY = "#0B1340";
const ORANGE = "#F97316";

export interface TwoFactorStepProps {
  challenge: TwoFaChallenge;
  onSuccess: () => void;
  onBack: () => void;
}

type Method = "otp" | "totp";
type TotpSetup = { qrCode: string; manualEntryKey: string };

export function TwoFactorStep({ challenge, onSuccess, onBack }: TwoFactorStepProps) {
  const { verifyTwoFactor, switchTwoFaMethod, setupTotpPending, completeLogin } = useAuth();

  // ── Phase state ─────────────────────────────────────────────────────────────
  // null = method-picker screen; "otp"/"totp" = code-entry screen
  const [method, setMethod] = useState<Method | null>(null);
  const [maskedEmail, setMaskedEmail] = useState(challenge.maskedEmail);
  const [totpEnrolled, setTotpEnrolled] = useState(!!challenge.totpEnrolled);

  // ── Loading/error ────────────────────────────────────────────────────────────
  const [choosing, setChoosing] = useState<Method | null>(null); // which card is loading
  const [chooseError, setChooseError] = useState<string | null>(null);

  // ── Code-entry state ─────────────────────────────────────────────────────────
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── OTP resend timer ─────────────────────────────────────────────────────────
  const [resendSeconds, setResendSeconds] = useState(0);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  // ── TOTP setup ───────────────────────────────────────────────────────────────
  const [totpSetup, setTotpSetup] = useState<TotpSetup | null>(null);
  const [settingUpTotp, setSettingUpTotp] = useState(false);

  // ── Backup-codes post-enrollment ─────────────────────────────────────────────
  const [pendingBackupCodes, setPendingBackupCodes] = useState<string[] | null>(null);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const resetCodeEntry = () => { setCode(""); setError(null); setUseBackupCode(false); };

  const copyKey = (text: string, idx: number) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    }).catch(() => {});
  };

  // ── Choose method (Phase 1 → Phase 2) ────────────────────────────────────────
  const handleChooseMethod = async (next: Method) => {
    if (choosing) return;
    setChoosing(next);
    setChooseError(null);
    try {
      const result = await switchTwoFaMethod(next);
      resetCodeEntry();
      if (next === "otp") {
        if (result.maskedEmail) setMaskedEmail(result.maskedEmail);
        startResendTimer();
      } else {
        setTotpEnrolled(!!result.totpEnrolled);
      }
      setMethod(next);
    } catch (err: any) {
      setChooseError(err?.message ?? "Couldn't start verification. Please try again.");
    } finally {
      setChoosing(null);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendSeconds > 0 || choosing) return;
    setChoosing("otp");
    setError(null);
    try {
      const result = await switchTwoFaMethod("otp");
      if (result.maskedEmail) setMaskedEmail(result.maskedEmail);
      startResendTimer();
    } catch (err: any) {
      setError(err?.message ?? "Couldn't resend the code. Please try again.");
    } finally {
      setChoosing(null);
    }
  };

  // ── TOTP enrollement ──────────────────────────────────────────────────────────
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

  // ── Verify code ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !method) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await verifyTwoFactor(method, { code: code.trim(), trustDevice, isBackupCode: useBackupCode });
      if (result?.backupCodes) {
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

  // ── Backup codes screen ───────────────────────────────────────────────────────
  if (pendingBackupCodes) {
    return (
      <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.25 }}>
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <p className="text-sm font-bold text-amber-800">Save your backup codes</p>
          </div>
          <p className="text-xs text-amber-700">
            Authenticator app connected. Each code below can be used once if you lose access to your app — store them somewhere safe, they won't be shown again.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {pendingBackupCodes.map((c, i) => (
              <button key={c} type="button" onClick={() => copyKey(c, i)}
                className="flex items-center justify-between gap-1.5 font-mono text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-2">
                {c}
                {copiedIdx === i ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-muted-foreground" />}
              </button>
            ))}
          </div>
          <Button className="w-full h-11 font-bold text-white border-0" style={{ background: NAVY }} onClick={finishAfterBackupCodes}>
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

      {/* ── Header ── */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
          style={{ background: "linear-gradient(135deg, #0b2c60, #1d4ed8)" }}>
          {method === "totp" ? <ShieldCheck className="w-7 h-7 text-white" /> : <Mail className="w-7 h-7 text-white" />}
        </div>
        <h3 className="text-base font-bold text-gray-900">
          {challenge.isNewDevice ? "New Device Detected" : "Verify It's You"}
        </h3>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">
          {method === null
            ? "Choose how you'd like to verify your identity."
            : showTotpEnrollment
              ? "Connect an authenticator app to verify with a code."
              : method === "totp"
                ? "Enter the 6-digit code from your authenticator app."
                : `We've sent a verification code to ${maskedEmail ?? "your registered email"}.`}
        </p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── Phase 1: Method picker ── */}
        {method === null && (
          <motion.div key="picker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="space-y-3">

            {chooseError && (
              <p className="text-xs font-medium text-center rounded-lg bg-red-50 border border-red-200 px-3 py-2" style={{ color: "#be123c" }}>
                {chooseError}
              </p>
            )}

            {/* Email OTP card */}
            <button type="button" onClick={() => handleChooseMethod("otp")} disabled={!!choosing}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 text-left transition-all disabled:opacity-60"
              style={{ borderColor: "#dbeafe", background: "#eff6ff" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #0b2c60, #1d4ed8)" }}>
                {choosing === "otp"
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : <Mail className="w-5 h-5 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: NAVY }}>Email OTP</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Send a 6-digit code to {maskedEmail ?? "your email"}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>

            {/* Authenticator App card */}
            <button type="button" onClick={() => handleChooseMethod("totp")} disabled={!!choosing}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 text-left transition-all disabled:opacity-60"
              style={{ borderColor: "#fed7aa", background: "#fff7ed" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #c2410c, #f97316)" }}>
                {choosing === "totp"
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : <Smartphone className="w-5 h-5 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: "#7c2d12" }}>Authenticator App</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {totpEnrolled ? "Use your authenticator app code" : "Set up Google/Authy authenticator"}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>

            <button type="button" onClick={onBack} className="flex items-center gap-1 font-medium text-gray-400 hover:text-gray-600 text-xs pt-1">
              <ArrowLeft className="w-3 h-3" />Back to login
            </button>
          </motion.div>
        )}

        {/* ── Phase 2: TOTP enrollment ── */}
        {method === "totp" && showTotpEnrollment && (
          <motion.div key="totp-enroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-4">
            {!totpSetup ? (
              <Button type="button" onClick={handleSetupAuthenticator} disabled={settingUpTotp}
                className="w-full h-11 font-bold text-white border-0" style={{ background: ORANGE }}>
                {settingUpTotp
                  ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Generating…</span>
                  : <span className="flex items-center gap-2"><QrCode className="w-4 h-4" />Set up Authenticator</span>}
              </Button>
            ) : (
              <>
                <div className="rounded-xl border border-gray-200 p-3 space-y-2 text-center">
                  <p className="text-xs font-semibold text-gray-700">Scan with your authenticator app</p>
                  <div className="flex justify-center">
                    <img src={totpSetup.qrCode} alt="TOTP QR code" className="w-36 h-36 rounded-lg border" />
                  </div>
                  <p className="text-[11px] text-gray-400">Or enter this key manually:</p>
                  <button type="button" onClick={() => copyKey(totpSetup.manualEntryKey, -1)}
                    className="w-full flex items-center justify-center gap-1.5 font-mono text-xs bg-gray-50 border border-gray-200 rounded-lg py-2 tracking-wider">
                    {totpSetup.manualEntryKey}
                    {copiedIdx === -1 ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-gray-400" />}
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input autoFocus inputMode="numeric" placeholder="Enter 6-digit code to confirm"
                      value={code} onChange={(e) => setCode(e.target.value)}
                      className="pl-10 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all tracking-widest text-center font-semibold"
                      maxLength={6} />
                  </div>
                  {error && <p className="text-xs font-medium text-center" style={{ color: "#be123c" }}>{error}</p>}
                  <label className="flex items-center gap-2 cursor-pointer select-none justify-center">
                    <Checkbox checked={trustDevice} onCheckedChange={(v) => setTrustDevice(!!v)}
                      className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
                    <span className="text-sm text-gray-600">Trust this device for 30 days</span>
                  </label>
                  <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                    <Button type="submit" disabled={isSubmitting || code.trim().length !== 6}
                      className="w-full h-12 font-bold text-base tracking-wide text-white shadow-lg border-0"
                      style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
                      {isSubmitting
                        ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Verifying…</span>
                        : "Confirm & Continue →"}
                    </Button>
                  </motion.div>
                </form>
              </>
            )}
            {error && !totpSetup && <p className="text-xs font-medium text-center mt-3" style={{ color: "#be123c" }}>{error}</p>}
            <button type="button" onClick={() => { setMethod(null); setTotpSetup(null); setError(null); }}
              className="flex items-center gap-1 font-medium text-gray-500 hover:text-gray-700 text-xs">
              <ArrowLeft className="w-3 h-3" />Choose a different method
            </button>
          </motion.div>
        )}

        {/* ── Phase 2: OTP or TOTP code entry ── */}
        {method !== null && !showTotpEnrollment && (
          <motion.form key={`code-entry-${method}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }} onSubmit={handleSubmit} className="space-y-4">

            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input autoFocus
                inputMode={useBackupCode ? "text" : "numeric"}
                placeholder={useBackupCode ? "Backup code (e.g. 1A2B3-C4D5E)" : "6-digit code"}
                value={code} onChange={(e) => setCode(e.target.value)}
                className="pl-10 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all tracking-widest text-center font-semibold"
                maxLength={useBackupCode ? 12 : 6} />
            </div>

            {error && <p className="text-xs font-medium text-center" style={{ color: "#be123c" }}>{error}</p>}

            {/* OTP resend */}
            {method === "otp" && !useBackupCode && (
              <div className="text-center">
                <button type="button" onClick={handleResend} disabled={resendSeconds > 0 || !!choosing}
                  className="text-xs font-semibold transition-colors"
                  style={{ color: resendSeconds > 0 ? "#9ca3af" : NAVY }}>
                  {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend code"}
                </button>
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer select-none justify-center">
              <Checkbox checked={trustDevice} onCheckedChange={(v) => setTrustDevice(!!v)}
                className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
              <span className="text-sm text-gray-600">Trust this device for 30 days</span>
            </label>

            <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
              <Button type="submit" disabled={isSubmitting || !code.trim()}
                className="w-full h-12 font-bold text-base tracking-wide text-white shadow-lg border-0"
                style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
                {isSubmitting
                  ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Verifying…</span>
                  : "Verify & Continue →"}
              </Button>
            </motion.div>

            <div className="flex items-center justify-between text-xs">
              <button type="button"
                onClick={() => { setMethod(null); resetCodeEntry(); if (resendTimerRef.current) clearInterval(resendTimerRef.current); setResendSeconds(0); }}
                className="flex items-center gap-1 font-medium text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-3 h-3" />Change method
              </button>
              <button type="button"
                onClick={() => { setUseBackupCode((v) => !v); setCode(""); setError(null); }}
                className="font-semibold" style={{ color: NAVY }}>
                {useBackupCode ? "Use a code instead" : "Use a backup code"}
              </button>
            </div>
          </motion.form>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
