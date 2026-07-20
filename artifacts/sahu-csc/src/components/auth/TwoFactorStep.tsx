import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { TwoFaChallenge } from "@/hooks/use-auth";
import { RESEND_COOLDOWN } from "@/components/auth/loginTypes";
import { TwoFactorMethodPicker } from "./twofa/TwoFactorMethodPicker";
import { TwoFactorCodeEntry } from "./twofa/TwoFactorCodeEntry";
import { TwoFactorBackupCodesScreen } from "./twofa/TwoFactorBackupCodesScreen";

export interface TwoFactorStepProps {
  challenge: TwoFaChallenge;
  onSuccess: () => void;
  onBack: () => void;
}

type Method = "otp" | "totp";

export function TwoFactorStep({ challenge, onSuccess, onBack }: TwoFactorStepProps) {
  const { verifyTwoFactor, switchTwoFaMethod, setupTotpPending, completeLogin } = useAuth();

  // Phase state
  const [method, setMethod]           = useState<Method | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(challenge.maskedEmail ?? null);
  const [totpEnrolled, setTotpEnrolled] = useState(!!challenge.totpEnrolled);

  // Picker loading/error
  const [choosing, setChoosing]         = useState<Method | null>(null);
  const [chooseError, setChooseError]   = useState<string | null>(null);

  // Code-entry state
  const [code, setCode]               = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // OTP resend timer
  const [resendSeconds, setResendSeconds] = useState(0);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startResendTimer = () => {
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    setResendSeconds(RESEND_COOLDOWN);
    resendTimerRef.current = setInterval(() => {
      setResendSeconds((s) => { if (s <= 1) { clearInterval(resendTimerRef.current!); return 0; } return s - 1; });
    }, 1000);
  };

  // TOTP enrollment data
  const [enrollQrDataUrl, setEnrollQrDataUrl] = useState<string | null>(null);
  const [enrollSecret, setEnrollSecret]       = useState<string | null>(null);
  const [showSecret, setShowSecret]           = useState(false);
  const [copiedSecret, setCopiedSecret]       = useState(false);

  // Backup codes post-enrollment
  const [pendingBackupCodes, setPendingBackupCodes] = useState<string[] | null>(null);
  const [pendingUser, setPendingUser]               = useState<any>(null);
  const [copiedIdx, setCopiedIdx]                   = useState<number | null>(null);

  const resetCodeEntry = () => { setCode(""); setError(null); setUseBackupCode(false); };

  const copyCode = (text: string, idx: number) => {
    navigator.clipboard?.writeText(text).then(() => { setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 1500); }).catch(() => {});
  };

  const copySecretKey = () => {
    if (!enrollSecret) return;
    navigator.clipboard?.writeText(enrollSecret).then(() => { setCopiedSecret(true); setTimeout(() => setCopiedSecret(false), 2000); }).catch(() => {});
  };

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
          if (setup.secret)        setEnrollSecret(setup.secret);
        }
        setTotpEnrolled(true);
      }
      setMethod(next);
    } catch (err: any) {
      setChooseError(err?.message ?? "Couldn't start verification. Please try again.");
    } finally { setChoosing(null); }
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
    } finally { setChoosing(null); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !method) return;
    setIsSubmitting(true); setError(null);
    try {
      const result = await verifyTwoFactor(method, { code: code.trim(), trustDevice, isBackupCode: useBackupCode });
      if (result?.backupCodes) { setPendingBackupCodes(result.backupCodes); setPendingUser(result.user); }
      else { onSuccess(); }
    } catch (err: any) {
      setError(err?.message ?? "Verification failed. Please try again.");
    } finally { setIsSubmitting(false); }
  };

  const finishAfterBackupCodes = () => {
    if (pendingUser) completeLogin(pendingUser);
    setPendingBackupCodes(null); setPendingUser(null); onSuccess();
  };

  const handleBackFromCodeEntry = () => {
    setMethod(null); resetCodeEntry();
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    setResendSeconds(0); setEnrollQrDataUrl(null); setEnrollSecret(null);
  };

  const isTotp = method === "totp";
  const isNewEnrollment = isTotp && !!(enrollQrDataUrl || enrollSecret) && !challenge.totpEnrolled;

  if (pendingBackupCodes) {
    return (
      <TwoFactorBackupCodesScreen
        backupCodes={pendingBackupCodes} copiedIdx={copiedIdx}
        onCopyCode={copyCode} onFinish={finishAfterBackupCodes}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.25 }}>

      {/* Header */}
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
            : method === "totp" && isNewEnrollment
              ? "Scan the QR code with your authenticator app, then enter the code it shows."
              : method === "totp"
                ? "Enter the 6-digit code from your authenticator app."
                : `We've sent a verification code to ${maskedEmail ?? "your registered email"}.`}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {method === null && (
          <TwoFactorMethodPicker
            key="picker"
            choosing={choosing} chooseError={chooseError}
            maskedEmail={maskedEmail} totpEnrolled={totpEnrolled}
            onChoose={handleChooseMethod} onBack={onBack}
          />
        )}
        {method !== null && (
          <TwoFactorCodeEntry
            key={`code-entry-${method}`}
            method={method} isNewEnrollment={isNewEnrollment} useBackupCode={useBackupCode}
            code={code} setCode={setCode}
            isSubmitting={isSubmitting} error={error}
            choosing={choosing} resendSeconds={resendSeconds}
            trustDevice={trustDevice} setTrustDevice={setTrustDevice}
            enrollQrDataUrl={enrollQrDataUrl} enrollSecret={enrollSecret}
            showSecret={showSecret} setShowSecret={setShowSecret}
            copiedSecret={copiedSecret} onCopySecret={copySecretKey}
            onSubmit={handleSubmit} onResend={handleResend}
            onBack={handleBackFromCodeEntry}
            onToggleBackupCode={() => { setUseBackupCode((v) => !v); setCode(""); setError(null); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
