import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, ArrowLeft } from "lucide-react";
import type { Method } from "./useTwoFactorStep";

const NAVY = "var(--brand-navy)";

interface OtpEntryProps {
  code: string;
  setCode: (v: string) => void;
  error: string | null;
  resendSeconds: number;
  trustDevice: boolean;
  setTrustDevice: (v: boolean) => void;
  useBackupCode: boolean;
  isSubmitting: boolean;
  choosing: Method | null;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => void;
  onBack: () => void;
  onToggleBackupCode: () => void;
}

export function OtpEntry({
  code, setCode, error, resendSeconds, trustDevice, setTrustDevice,
  useBackupCode, isSubmitting, choosing, onSubmit, onResend, onBack, onToggleBackupCode,
}: OtpEntryProps) {
  return (
    <motion.div key="code-entry-otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }} className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        {useBackupCode ? (
          <div className="relative">
            <Input autoFocus
              inputMode="text"
              placeholder="Backup code (e.g. 1A2B3-C4D5E)"
              value={code} onChange={(e) => setCode(e.target.value)}
              className="h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all tracking-widest text-center font-semibold"
              maxLength={12} />
          </div>
        ) : (
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode} autoFocus>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i}
                    className="w-11 h-12 text-lg font-bold text-gray-900 border-gray-200 first:rounded-l-xl last:rounded-r-xl" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        )}

        {error && <p className="text-xs font-medium text-center" style={{ color: "var(--color-error-dark)" }}>{error}</p>}

        {!useBackupCode && (
          <div className="text-center">
            <button type="button" onClick={onResend} disabled={resendSeconds > 0 || !!choosing}
              className="text-xs font-semibold transition-colors"
              style={{ color: resendSeconds > 0 ? "var(--color-gray-400)" : NAVY }}>
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
            style={{ background: "linear-gradient(135deg, var(--brand-navy-650), #0f1a4a)" }}>
            {isSubmitting
              ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Verifying…</span>
              : "Verify & Continue →"}
          </Button>
        </motion.div>

        <div className="flex items-center justify-between text-xs">
          <button type="button" onClick={onBack} className="flex items-center gap-1 font-medium text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-3 h-3" />Change method
          </button>
          <button type="button" onClick={onToggleBackupCode} className="font-semibold" style={{ color: NAVY }}>
            {useBackupCode ? "Use a code instead" : "Use a backup code"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
