import React from "react";
import { ArrowLeft, CheckCircle2, Loader2, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpRateLimitPanel } from "./OtpRateLimitPanel";
import { RESEND_COOLDOWN } from "./loginTypes";

interface Props {
  otpDigits: string[];
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  maskedEmail: string | null;
  serverError: string | null;
  submitting: boolean;
  otpComplete: boolean;
  resendSeconds: number;
  otpRateLimited: boolean;
  rateLimitSeconds: number;
  onInput: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onSubmit: () => void;
  onResend: () => void;
  onBackToIdentifier: () => void;
  onRateLimitBack: () => void;
}

export function OtpVerifyForm({
  otpDigits,
  otpRefs,
  maskedEmail,
  serverError,
  submitting,
  otpComplete,
  resendSeconds,
  otpRateLimited,
  rateLimitSeconds,
  onInput,
  onKeyDown,
  onPaste,
  onSubmit,
  onResend,
  onBackToIdentifier,
  onRateLimitBack,
}: Props) {
  if (otpRateLimited) {
    return <OtpRateLimitPanel seconds={rateLimitSeconds} onBack={onRateLimitBack} />;
  }

  const R = 11;
  const CIRC = 2 * Math.PI * R;
  const dashOffset = CIRC * (1 - resendSeconds / RESEND_COOLDOWN);

  return (
    <>
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-3"
          style={{ background: "#dcfce7" }}
        >
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
        </div>
        <h2 className="text-gray-900 font-bold text-lg">Enter OTP</h2>
        <p className="text-gray-500 text-xs mt-1 text-center max-w-xs">
          {maskedEmail ? (
            <>We sent a 6-digit code to <span className="font-semibold text-gray-700">{maskedEmail}</span></>
          ) : (
            "We sent a 6-digit code to your registered email address"
          )}
        </p>
        <p className="text-gray-400 text-[10px] mt-0.5">Check your inbox and spam folder</p>
      </div>

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
            style={{ borderColor: serverError ? "rgb(239,68,68)" : digit ? "#0b2c60" : "#e5e7eb" }}
          />
        ))}
      </div>

      {serverError && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 mb-4">
          <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          {serverError}
        </div>
      )}

      <Button
        onClick={onSubmit}
        disabled={submitting || !otpComplete}
        className="w-full h-11 font-bold text-white border-0 mb-4"
        style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Verify OTP
          </span>
        )}
      </Button>

      <div className="flex flex-col items-center gap-3">
        {resendSeconds > 0 ? (
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 flex-shrink-0">
              <svg width="32" height="32" viewBox="0 0 32 32" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="16" cy="16" r={R} fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                <circle
                  cx="16" cy="16" r={R}
                  fill="none" stroke="#0b2c60" strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={dashOffset}
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
            <span className="text-sm text-gray-400">Resend OTP in {resendSeconds}s</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={submitting}
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color: "#0b2c60" }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Resend OTP
          </button>
        )}

        <button
          type="button"
          onClick={onBackToIdentifier}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Try a different username
        </button>
      </div>
    </>
  );
}
