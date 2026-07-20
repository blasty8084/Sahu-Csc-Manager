import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { KeyRound, Loader2, ArrowLeft, Smartphone } from "lucide-react";
import { TotpEnrollmentCard } from "./TotpEnrollmentCard";

const NAVY = "#0B1340";

interface Props {
  method: "otp" | "totp";
  isNewEnrollment: boolean;
  useBackupCode: boolean;
  code: string;
  setCode: (v: string) => void;
  isSubmitting: boolean;
  error: string | null;
  choosing: "otp" | "totp" | null;
  resendSeconds: number;
  trustDevice: boolean;
  setTrustDevice: (v: boolean) => void;
  enrollQrDataUrl: string | null;
  enrollSecret: string | null;
  showSecret: boolean;
  setShowSecret: (v: boolean) => void;
  copiedSecret: boolean;
  onCopySecret: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => void;
  onBack: () => void;
  onToggleBackupCode: () => void;
}

/** Phase 2: OTP/TOTP code entry form (with optional QR enrollment card). */
export function TwoFactorCodeEntry({
  method, isNewEnrollment, useBackupCode, code, setCode,
  isSubmitting, error, choosing, resendSeconds,
  trustDevice, setTrustDevice,
  enrollQrDataUrl, enrollSecret, showSecret, setShowSecret, copiedSecret, onCopySecret,
  onSubmit, onResend, onBack, onToggleBackupCode,
}: Props) {
  const isTotp = method === "totp";

  return (
    <motion.div key={`code-entry-${method}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }} className="space-y-4">

      {/* QR enrollment for first-time TOTP setup */}
      {isNewEnrollment && !useBackupCode && (
        <TotpEnrollmentCard
          enrollQrDataUrl={enrollQrDataUrl} enrollSecret={enrollSecret}
          showSecret={showSecret} setShowSecret={setShowSecret}
          copiedSecret={copiedSecret} onCopySecret={onCopySecret}
        />
      )}

      {/* TOTP hint when already enrolled */}
      {isTotp && !useBackupCode && !isNewEnrollment && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 flex items-start gap-3">
          <Smartphone className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Open your authenticator app (Google Authenticator, Authy, etc.) and enter the current 6-digit code.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input autoFocus
            inputMode={useBackupCode ? "text" : "numeric"}
            placeholder={useBackupCode ? "Backup code (e.g. 1A2B3-C4D5E)" : isTotp ? "Enter your 6-digit code" : "6-digit code"}
            value={code} onChange={(e) => setCode(e.target.value)}
            className="pl-10 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all tracking-widest text-center font-semibold"
            maxLength={useBackupCode ? 12 : 6}
          />
        </div>

        {error && <p className="text-xs font-medium text-center" style={{ color: "#be123c" }}>{error}</p>}

        {method === "otp" && !useBackupCode && (
          <div className="text-center">
            <button type="button" onClick={onResend} disabled={resendSeconds > 0 || !!choosing}
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
          <button type="button" onClick={onBack}
            className="flex items-center gap-1 font-medium text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-3 h-3" />Change method
          </button>
          <button type="button" onClick={onToggleBackupCode}
            className="font-semibold" style={{ color: NAVY }}>
            {useBackupCode ? "Use a code instead" : "Use a backup code"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
