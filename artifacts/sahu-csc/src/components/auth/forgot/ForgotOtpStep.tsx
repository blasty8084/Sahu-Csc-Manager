import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, XCircle, CheckCircle2, RefreshCw, ArrowLeft } from "lucide-react";
import { OtpRateLimitPanel } from "@/components/auth/OtpRateLimitPanel";

interface Props {
  otpDigits: string[];
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  maskedEmail: string | null;
  submitting: boolean;
  serverError: string | null;
  resendSeconds: number;
  otpRateLimited: boolean;
  rateLimitSeconds: number;
  onOtpInput: (index: number, value: string) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onOtpPaste: (e: React.ClipboardEvent) => void;
  onVerify: (otp: string) => void;
  onResend: () => void;
  onBack: () => void;
  onRateLimitBack: () => void;
}

export function ForgotOtpStep({
  otpDigits, otpRefs, maskedEmail, submitting, serverError, resendSeconds,
  otpRateLimited, rateLimitSeconds,
  onOtpInput, onOtpKeyDown, onOtpPaste, onVerify, onResend, onBack, onRateLimitBack,
}: Props) {
  const otpComplete = otpDigits.every((d) => d !== "");
  return (
    <motion.div key="fp-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
      {otpRateLimited ? (
        <OtpRateLimitPanel seconds={rateLimitSeconds} onBack={onRateLimitBack} />
      ) : (
        <>
          <div className="flex flex-col items-center mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-3" style={{ background: "#dcfce7" }}>
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-gray-900 font-bold text-lg">Enter OTP</h2>
            <p className="text-gray-500 text-xs mt-1 text-center max-w-xs">
              {maskedEmail ? <>We sent a 6-digit code to <span className="font-semibold text-gray-700">{maskedEmail}</span></> : "We sent a 6-digit code to your registered email"}
            </p>
            <p className="text-gray-400 text-[10px] mt-0.5">Check your inbox and spam folder</p>
          </div>
          <div className="flex gap-2 justify-center mb-5" onPaste={onOtpPaste}>
            {otpDigits.map((digit, i) => (
              <input key={i}
                ref={(el) => { otpRefs.current[i] = el; }}
                type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={(e) => onOtpInput(i, e.target.value)}
                onKeyDown={(e) => onOtpKeyDown(i, e)}
                className="w-11 h-12 text-center text-xl font-bold border-2 rounded-xl bg-white outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-gray-900"
                style={{ borderColor: serverError ? "rgb(239,68,68)" : digit ? "#0b2c60" : "#e5e7eb" }}
              />
            ))}
          </div>
          {serverError && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 mb-4">
              <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{serverError}
            </div>
          )}
          <Button onClick={() => onVerify(otpDigits.join(""))} disabled={submitting || !otpComplete}
            className="w-full h-11 font-bold text-white border-0 mb-4" style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
            {submitting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Verifying…</span> : <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Verify OTP</span>}
          </Button>
          <div className="flex flex-col items-center gap-3">
            <button type="button" onClick={onResend} disabled={resendSeconds > 0 || submitting}
              className="flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: resendSeconds > 0 ? "#9ca3af" : "#0b2c60" }}>
              <RefreshCw className="w-3.5 h-3.5" />
              {resendSeconds > 0 ? `Resend OTP in ${resendSeconds}s` : "Resend OTP"}
            </button>
            <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />Try a different username
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
