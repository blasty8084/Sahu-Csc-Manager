import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { apiPost, RESEND_COOLDOWN, OTP_RATE_LIMIT, ResetStep } from "./loginTypes";
import { ForgotIdentifierStep } from "./forgot/ForgotIdentifierStep";
import { ForgotOtpStep } from "./forgot/ForgotOtpStep";
import { ForgotPasswordStep } from "./forgot/ForgotPasswordStep";
import { ForgotSuccessStep } from "./forgot/ForgotSuccessStep";

export function ForgotPasswordPanel({ onBack }: { onBack: () => void }) {
  // ── Step & identity ────────────────────────────────────────────────────────
  const [step, setStep] = useState<ResetStep>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [notRegistered, setNotRegistered] = useState(false);

  // ── OTP state ──────────────────────────────────────────────────────────────
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [otpRateLimited, setOtpRateLimited] = useState(false);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(OTP_RATE_LIMIT);
  const rateLimitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── New password state ─────────────────────────────────────────────────────
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (resendTimerRef.current)    clearInterval(resendTimerRef.current);
    if (countdownRef.current)      clearInterval(countdownRef.current);
    if (rateLimitTimerRef.current) clearInterval(rateLimitTimerRef.current);
  }, []);

  const startResendTimer = useCallback(() => {
    setResendSeconds(RESEND_COOLDOWN);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    resendTimerRef.current = setInterval(() => {
      setResendSeconds((s) => { if (s <= 1) { clearInterval(resendTimerRef.current!); return 0; } return s - 1; });
    }, 1000);
  }, []);

  const startRateLimitTimer = useCallback(() => {
    setOtpRateLimited(true); setRateLimitSeconds(OTP_RATE_LIMIT);
    if (rateLimitTimerRef.current) clearInterval(rateLimitTimerRef.current);
    rateLimitTimerRef.current = setInterval(() => {
      setRateLimitSeconds((s) => { if (s <= 1) { clearInterval(rateLimitTimerRef.current!); setOtpRateLimited(false); setStep("identifier"); return OTP_RATE_LIMIT; } return s - 1; });
    }, 1000);
  }, []);

  const startCountdown = useCallback(() => {
    setCountdown(4);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { clearInterval(countdownRef.current!); onBack(); return 0; } return c - 1; });
    }, 1000);
  }, [onBack]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = identifier.trim();
    if (!id) { setServerError("Enter your username, email, or mobile number."); return; }
    setServerError(null); setNotRegistered(false); setSubmitting(true);
    try {
      const res  = await apiPost("send-otp", { identifier: id, purpose: "password_reset" });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 404 && data.notRegistered) { setNotRegistered(true); setServerError(data.error ?? "Account not found. Please register first."); }
        else if (res.status === 429) { startRateLimitTimer(); setStep("otp"); }
        else { setServerError(data.error ?? "Failed to send OTP. Please try again."); }
        return;
      }
      setMaskedEmail(data.maskedEmail ?? null);
      setOtpDigits(["", "", "", "", "", ""]);
      setStep("otp"); startResendTimer();
      setTimeout(() => otpRefs.current[0]?.focus(), 120);
    } catch { setServerError("Network error. Please check your connection and try again."); }
    finally { setSubmitting(false); }
  };

  const handleOtpInput = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits]; next[index] = digit; setOtpDigits(next); setServerError(null);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const digits = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtpDigits(digits); setServerError(null);
    const nextEmpty = digits.findIndex((d) => !d);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    if (pasted.length === 6) setTimeout(() => verifyOtp(pasted), 80);
  };

  const verifyOtp = async (otp: string) => {
    if (!/^\d{6}$/.test(otp)) return;
    setServerError(null); setSubmitting(true);
    try {
      const res  = await apiPost("verify-otp", { identifier: identifier.trim(), otp, purpose: "password_reset" });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        const reasonMap: Record<string, string> = { expired: "OTP has expired. Request a new one.", invalid: "Incorrect OTP. Please check and try again.", used: "This OTP has already been used.", missing: "Please enter all 6 digits." };
        setServerError(reasonMap[data.reason] ?? "Invalid OTP. Please try again."); return;
      }
      setResetToken(data.resetToken); setPassword(""); setConfirmPassword(""); setStep("password");
    } catch { setServerError("Network error. Please try again."); }
    finally { setSubmitting(false); }
  };

  const handleResend = async () => {
    if (resendSeconds > 0) return;
    setServerError(null); setOtpDigits(["", "", "", "", "", ""]); setSubmitting(true);
    try {
      const res  = await apiPost("send-otp", { identifier: identifier.trim(), purpose: "password_reset" });
      const data = await res.json();
      if (res.ok) { if (data.maskedEmail) setMaskedEmail(data.maskedEmail); startResendTimer(); setTimeout(() => otpRefs.current[0]?.focus(), 120); }
      else if (res.status === 429) { startRateLimitTimer(); }
      else { setServerError(data.error ?? "Failed to resend OTP."); }
    } catch { setServerError("Network error."); }
    finally { setSubmitting(false); }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null); setSubmitting(true);
    try {
      const res  = await apiPost("reset-password", { resetToken, password });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error ?? "Failed to reset password. Please try again."); return; }
      setStep("success"); startCountdown();
    } catch { setServerError("Network error. Please try again."); }
    finally { setSubmitting(false); }
  };

  const STEPS: ResetStep[] = ["identifier", "otp", "password", "success"];
  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="flex flex-col h-full">
      {/* Header + progress dots */}
      <div className="flex flex-col items-center mb-5">
        {step !== "success" && (
          <button type="button" onClick={onBack}
            className="self-start flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4">
            <ArrowLeft className="w-3.5 h-3.5" />Back to login
          </button>
        )}
        {step !== "success" && (
          <div className="flex items-center gap-2 mb-4">
            {["identifier", "otp", "password"].map((s, i) => (
              <React.Fragment key={s}>
                <div className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{ background: stepIndex >= i ? "#f97316" : "rgba(0,0,0,0.15)", transform: stepIndex === i ? "scale(1.35)" : "scale(1)" }} />
                {i < 2 && <div className="h-0.5 w-8 rounded-full transition-all duration-300" style={{ background: stepIndex > i ? "#f97316" : "rgba(0,0,0,0.12)" }} />}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === "identifier" && (
          <ForgotIdentifierStep
            identifier={identifier} setIdentifier={(v) => { setIdentifier(v); setServerError(null); }}
            serverError={serverError} notRegistered={notRegistered}
            submitting={submitting} onSubmit={handleSendOtp}
          />
        )}
        {step === "otp" && (
          <ForgotOtpStep
            otpDigits={otpDigits} otpRefs={otpRefs} maskedEmail={maskedEmail}
            submitting={submitting} serverError={serverError} resendSeconds={resendSeconds}
            otpRateLimited={otpRateLimited} rateLimitSeconds={rateLimitSeconds}
            onOtpInput={handleOtpInput} onOtpKeyDown={handleOtpKeyDown} onOtpPaste={handleOtpPaste}
            onVerify={verifyOtp} onResend={handleResend}
            onBack={() => { setStep("identifier"); setServerError(null); }}
            onRateLimitBack={() => { if (rateLimitTimerRef.current) clearInterval(rateLimitTimerRef.current); setOtpRateLimited(false); setStep("identifier"); }}
          />
        )}
        {step === "password" && (
          <ForgotPasswordStep
            password={password} setPassword={(v) => { setPassword(v); setServerError(null); }}
            confirmPassword={confirmPassword} setConfirmPassword={(v) => { setConfirmPassword(v); setServerError(null); }}
            showPassword={showPassword} setShowPassword={setShowPassword}
            showConfirm={showConfirm} setShowConfirm={setShowConfirm}
            submitting={submitting} serverError={serverError} onSubmit={handleSetPassword}
          />
        )}
        {step === "success" && <ForgotSuccessStep countdown={countdown} onBack={onBack} />}
      </AnimatePresence>
    </div>
  );
}
