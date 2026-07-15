import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, KeyRound, Loader2, ArrowLeft, Mail } from "lucide-react";
import type { TwoFaChallenge } from "@/hooks/use-auth";

export interface TwoFactorStepProps {
  challenge: TwoFaChallenge;
  onVerify: (data: { code: string; trustDevice: boolean; isBackupCode: boolean }) => Promise<void>;
  onBack: () => void;
}

// ── Shared 2FA-code entry step, shown after credentials are accepted but a
// device/2FA challenge is required. Used by both mobile and desktop login. ──
export function TwoFactorStep({ challenge, onVerify, onBack }: TwoFactorStepProps) {
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTotp = challenge.method === "totp";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onVerify({ code: code.trim(), trustDevice, isBackupCode: useBackupCode });
    } catch (err: any) {
      setError(err?.message ?? "Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {isTotp
            ? "Enter the 6-digit code from your authenticator app."
            : `We've sent a verification code to ${challenge.maskedEmail ?? "your registered email"}.`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            <ArrowLeft className="w-3 h-3" />Back
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
