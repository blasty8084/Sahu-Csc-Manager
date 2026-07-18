/**
 * RegisterOtpStep — OTP digit inputs, submit button, resend countdown, and back link.
 * Extracted from RegisterForm to keep that file under 250 lines.
 */
import React from "react";
import { ArrowLeft, Loader2, RefreshCw, UserPlus, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RESEND_COOLDOWN } from "./loginTypes";
import { RegisterStepIndicator } from "./RegisterStepIndicator";

interface Props {
  email: string;
  otpDigits: string[];
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  submitting: boolean;
  otpComplete: boolean;
  otpError: string | null;
  resendSeconds: number;
  onInput: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onSubmit: () => void;
  onResend: () => void;
  onBack: () => void;
}

export function RegisterOtpStep({
  email, otpDigits, otpRefs, submitting, otpComplete, otpError,
  resendSeconds, onInput, onKeyDown, onPaste, onSubmit, onResend, onBack,
}: Props) {
  const R = 11;
  const CIRC = 2 * Math.PI * R;

  return (
    <>
      <RegisterStepIndicator email={email} />

      {/* OTP digit grid */}
      <div className="flex gap-2 justify-center mb-5" onPaste={onPaste}>
        {otpDigits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { otpRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            onChange={(e) => onInput(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            className="w-11 h-12 text-center text-xl font-bold border-2 rounded-xl bg-white outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-gray-900"
            style={{ borderColor: otpError ? "rgb(239,68,68)" : digit ? "#0b2c60" : "#e5e7eb" }}
          />
        ))}
      </div>

      {otpError && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 mb-4">
          <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          {otpError}
        </div>
      )}

      <Button
        onClick={onSubmit}
        disabled={submitting || !otpComplete}
        className="w-full h-12 font-bold text-base text-white mb-4"
        style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}
      >
        {submitting
          ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Creating Account…</span>
          : <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" />Verify & Create Account</span>}
      </Button>

      {/* Resend + back */}
      <div className="flex flex-col items-center gap-3">
        {resendSeconds > 0 ? (
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 flex-shrink-0">
              <svg width="32" height="32" viewBox="0 0 32 32" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="16" cy="16" r={R} fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                <circle
                  cx="16" cy="16" r={R} fill="none" stroke="#0b2c60" strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * (1 - resendSeconds / RESEND_COOLDOWN)}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <span
                className="absolute inset-0 flex items-center justify-center font-bold leading-none"
                style={{ fontSize: "9px", color: "#0b2c60" }}
              >
                {resendSeconds}
              </span>
            </div>
            <span className="text-sm text-gray-400">Resend in {resendSeconds}s</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onResend}
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color: "#0b2c60" }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Resend OTP
          </button>
        )}

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Edit my details
        </button>
      </div>
    </>
  );
}
