import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Mail, AlertTriangle, Copy, Check } from "lucide-react";
import type { TwoFaChallenge } from "@/hooks/use-auth";
import { useTwoFactorStep } from "./twofa/useTwoFactorStep";
import { MethodPicker } from "./twofa/MethodPicker";
import { OtpEntry } from "./twofa/OtpEntry";
import { TotpEntry } from "./twofa/TotpEntry";

const NAVY = "#0B1340";

export interface TwoFactorStepProps {
  challenge: TwoFaChallenge;
  onSuccess: () => void;
  onBack: () => void;
}

export function TwoFactorStep({ challenge, onSuccess, onBack }: TwoFactorStepProps) {
  const {
    method, maskedEmail, totpEnrolled, choosing, chooseError,
    code, setCode, trustDevice, setTrustDevice, useBackupCode, isSubmitting, error,
    resendSeconds, enrollQrDataUrl, enrollSecret, showSecret, copiedSecret,
    pendingBackupCodes, copiedIdx,
    handleChooseMethod, handleResend, handleSubmit, finishAfterBackupCodes,
    copyKey, copySecretKey, toggleShowSecret, onToggleBackupCode, goBackToMethodPicker,
  } = useTwoFactorStep(challenge, onSuccess);

  const isTotp = method === "totp";
  const isNewEnrollment = isTotp && !!(enrollQrDataUrl || enrollSecret) && !challenge.totpEnrolled;

  // ── Backup codes screen ────────────────────────────────────────────────────
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
            : method === "totp" && isNewEnrollment
              ? "Scan the QR code with your authenticator app, then enter the code it shows."
              : method === "totp"
                ? "Enter the 6-digit code from your authenticator app."
                : `We've sent a verification code to ${maskedEmail ?? "your registered email"}.`}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {method === null && (
          <MethodPicker key="picker"
            choosing={choosing} chooseError={chooseError} maskedEmail={maskedEmail}
            totpEnrolled={totpEnrolled} onChoose={handleChooseMethod} onBack={onBack}
          />
        )}
        {method === "otp" && (
          <OtpEntry key="code-entry-otp"
            code={code} setCode={setCode} error={error} resendSeconds={resendSeconds}
            trustDevice={trustDevice} setTrustDevice={setTrustDevice}
            useBackupCode={useBackupCode} isSubmitting={isSubmitting} choosing={choosing}
            onSubmit={handleSubmit} onResend={handleResend} onBack={goBackToMethodPicker}
            onToggleBackupCode={onToggleBackupCode}
          />
        )}
        {method === "totp" && (
          <TotpEntry key="code-entry-totp"
            code={code} setCode={setCode} error={error}
            trustDevice={trustDevice} setTrustDevice={setTrustDevice}
            useBackupCode={useBackupCode} isSubmitting={isSubmitting}
            enrollQrDataUrl={enrollQrDataUrl} enrollSecret={enrollSecret}
            showSecret={showSecret} copiedSecret={copiedSecret}
            isNewEnrollment={isNewEnrollment} onSubmit={handleSubmit}
            onBack={goBackToMethodPicker} onToggleBackupCode={onToggleBackupCode}
            onToggleShowSecret={toggleShowSecret} onCopySecret={copySecretKey}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
