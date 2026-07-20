import { useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { TwoFaChallenge } from "@/hooks/use-auth";
import { RESEND_COOLDOWN } from "@/components/auth/loginTypes";

export type Method = "otp" | "totp";

export function useTwoFactorStep(challenge: TwoFaChallenge, onSuccess: () => void) {
  const { verifyTwoFactor, switchTwoFaMethod, setupTotpPending, completeLogin } = useAuth();

  // ── Phase state ────────────────────────────────────────────────────────────
  const [method, setMethod] = useState<Method | null>(null);
  const [maskedEmail, setMaskedEmail] = useState(challenge.maskedEmail);
  const [totpEnrolled, setTotpEnrolled] = useState(!!challenge.totpEnrolled);

  // ── Loading / error ────────────────────────────────────────────────────────
  const [choosing, setChoosing] = useState<Method | null>(null);
  const [chooseError, setChooseError] = useState<string | null>(null);

  // ── Code-entry state ───────────────────────────────────────────────────────
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── OTP resend timer ───────────────────────────────────────────────────────
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

  // ── TOTP enrollment state ──────────────────────────────────────────────────
  const [enrollQrDataUrl, setEnrollQrDataUrl] = useState<string | null>(null);
  const [enrollSecret, setEnrollSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // ── Backup-codes post-enrollment ───────────────────────────────────────────
  const [pendingBackupCodes, setPendingBackupCodes] = useState<string[] | null>(null);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const resetCodeEntry = () => { setCode(""); setError(null); setUseBackupCode(false); };

  const copyKey = (text: string, idx: number) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 1500);
    }).catch(() => {});
  };

  const copySecretKey = () => {
    if (!enrollSecret) return;
    navigator.clipboard?.writeText(enrollSecret).then(() => {
      setCopiedSecret(true); setTimeout(() => setCopiedSecret(false), 2000);
    }).catch(() => {});
  };

  const toggleShowSecret = () => setShowSecret((v) => !v);

  const onToggleBackupCode = () => { setUseBackupCode((v) => !v); setCode(""); setError(null); };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChooseMethod = async (next: Method) => {
    if (choosing) return;
    setChoosing(next); setChooseError(null);
    try {
      const result = await switchTwoFaMethod(next);
      resetCodeEntry();
      if (next === "otp") {
        if (result.maskedEmail) setMaskedEmail(result.maskedEmail);
        startResendTimer();
      } else {
        if (!result.totpEnrolled) {
          const setup = await setupTotpPending();
          if (setup.qrCodeDataUrl) setEnrollQrDataUrl(setup.qrCodeDataUrl);
          if (setup.secret) setEnrollSecret(setup.secret);
        }
        setTotpEnrolled(true);
      }
      setMethod(next);
    } catch (err: any) {
      setChooseError(err?.message ?? "Couldn't start verification. Please try again.");
    } finally {
      setChoosing(null);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || choosing) return;
    setChoosing("otp"); setError(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !method) return;
    setIsSubmitting(true); setError(null);
    try {
      const result = await verifyTwoFactor(method, { code: code.trim(), trustDevice, isBackupCode: useBackupCode });
      if (result?.backupCodes) {
        setPendingBackupCodes(result.backupCodes); setPendingUser(result.user);
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
    setPendingBackupCodes(null); setPendingUser(null);
    onSuccess();
  };

  const goBackToMethodPicker = () => {
    setMethod(null); resetCodeEntry();
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    setResendSeconds(0); setEnrollQrDataUrl(null); setEnrollSecret(null);
  };

  return {
    method, maskedEmail, totpEnrolled,
    choosing, chooseError,
    code, setCode, trustDevice, setTrustDevice, useBackupCode, isSubmitting, error,
    resendSeconds,
    enrollQrDataUrl, enrollSecret, showSecret, copiedSecret,
    pendingBackupCodes, copiedIdx,
    handleChooseMethod, handleResend, handleSubmit, finishAfterBackupCodes,
    copyKey, copySecretKey, toggleShowSecret, onToggleBackupCode, goBackToMethodPicker,
  };
}
