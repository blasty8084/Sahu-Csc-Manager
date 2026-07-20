import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { apiPost, PWD_RULES, RESEND_COOLDOWN, OTP_RATE_LIMIT, ResetStep } from "./loginTypes";
import { ForgotStepHeader } from "./forgot/ForgotStepHeader";
import { StepRequestOtp } from "./forgot/StepRequestOtp";
import { StepVerifyOtp } from "./forgot/StepVerifyOtp";
import { StepNewPassword } from "./forgot/StepNewPassword";

export function ForgotPasswordPanel({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();

  const [step, setStep] = useState<ResetStep>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [notRegistered, setNotRegistered] = useState(false);

  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [otpRateLimited, setOtpRateLimited] = useState(false);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(OTP_RATE_LIMIT);
  const rateLimitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [countdown, setCountdown] = useState(4);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
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
    setOtpRateLimited(true);
    setRateLimitSeconds(OTP_RATE_LIMIT);
    if (rateLimitTimerRef.current) clearInterval(rateLimitTimerRef.current);
    rateLimitTimerRef.current = setInterval(() => {
      setRateLimitSeconds((s) => {
        if (s <= 1) { clearInterval(rateLimitTimerRef.current!); setOtpRateLimited(false); setStep("identifier"); return OTP_RATE_LIMIT; }
        return s - 1;
      });
    }, 1000);
  }, []);

  const startCountdown = useCallback(() => {
    setCountdown(4);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(countdownRef.current!); onBack(); return 0; }
        return c - 1;
      });
    }, 1000);
  }, [onBack]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = identifier.trim();
    if (!id) { setServerError("Enter your username, email, or mobile number."); return; }
    setServerError(null); setNotRegistered(false); setSubmitting(true);
    try {
      const res = await apiPost("send-otp", { identifier: id, purpose: "password_reset" });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 404 && data.notRegistered) { setNotRegistered(true); setServerError(data.error ?? "Account not found. Please register first."); }
        else if (res.status === 429) { startRateLimitTimer(); setStep("otp"); }
        else { setServerError(data.error ?? "Failed to send OTP. Please try again."); }
        return;
      }
      setMaskedEmail(data.maskedEmail ?? null);
      setOtpDigits(["", "", "", "", "", ""]);
      setStep("otp");
      startResendTimer();
      setTimeout(() => otpRefs.current[0]?.focus(), 120);
    } catch { setServerError("Network error. Please check your connection and try again."); }
    finally { setSubmitting(false); }
  };

  const verifyOtp = async (otp: string) => {
    if (!/^\d{6}$/.test(otp)) return;
    setServerError(null); setSubmitting(true);
    try {
      const res = await apiPost("verify-otp", { identifier: identifier.trim(), otp, purpose: "password_reset" });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        const reasonMap: Record<string, string> = { expired: "OTP has expired. Request a new one.", invalid: "Incorrect OTP. Please check and try again.", used: "This OTP has already been used.", missing: "Please enter all 6 digits." };
        setServerError(reasonMap[data.reason] ?? "Invalid OTP. Please try again.");
        return;
      }
      setResetToken(data.resetToken); setPassword(""); setConfirmPassword(""); setStep("password");
    } catch { setServerError("Network error. Please try again."); }
    finally { setSubmitting(false); }
  };

  const handleResend = async () => {
    if (resendSeconds > 0) return;
    setServerError(null); setOtpDigits(["", "", "", "", "", ""]); setSubmitting(true);
    try {
      const res = await apiPost("send-otp", { identifier: identifier.trim(), purpose: "password_reset" });
      const data = await res.json();
      if (res.ok) { if (data.maskedEmail) setMaskedEmail(data.maskedEmail); startResendTimer(); toast.success("OTP resent", "A new code has been sent."); setTimeout(() => otpRefs.current[0]?.focus(), 120); }
      else if (res.status === 429) { startRateLimitTimer(); }
      else { setServerError(data.error ?? "Failed to resend OTP."); }
    } catch { setServerError("Network error."); }
    finally { setSubmitting(false); }
  };

  const pwdRulesMet = PWD_RULES.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdRulesMet) { setServerError("Please meet all password requirements."); return; }
    if (!passwordsMatch) { setServerError("Passwords do not match."); return; }
    setServerError(null); setSubmitting(true);
    try {
      const res = await apiPost("reset-password", { resetToken, password });
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
      <ForgotStepHeader step={step} stepIndex={stepIndex} onBack={onBack} />

      <AnimatePresence mode="wait">

        {step === "identifier" && (
          <StepRequestOtp
            identifier={identifier}
            submitting={submitting}
            serverError={serverError}
            notRegistered={notRegistered}
            onIdentifierChange={(v) => { setIdentifier(v); setServerError(null); }}
            onSubmit={handleSendOtp}
          />
        )}

        {step === "otp" && (
          <StepVerifyOtp
            otpRateLimited={otpRateLimited}
            rateLimitSeconds={rateLimitSeconds}
            onRateLimitBack={() => { if (rateLimitTimerRef.current) clearInterval(rateLimitTimerRef.current); setOtpRateLimited(false); setStep("identifier"); }}
            maskedEmail={maskedEmail}
            otpDigits={otpDigits}
            setOtpDigits={setOtpDigits}
            otpRefs={otpRefs}
            submitting={submitting}
            serverError={serverError}
            setServerError={setServerError}
            resendSeconds={resendSeconds}
            onVerifyOtp={verifyOtp}
            onResend={handleResend}
            onBack={() => { setStep("identifier"); setServerError(null); }}
          />
        )}

        {step === "password" && (
          <StepNewPassword
            password={password}
            confirmPassword={confirmPassword}
            showPassword={showPassword}
            showConfirm={showConfirm}
            submitting={submitting}
            serverError={serverError}
            pwdRulesMet={pwdRulesMet}
            passwordsMatch={passwordsMatch}
            onSubmit={handleSetPassword}
            onPasswordChange={(v) => { setPassword(v); setServerError(null); }}
            onConfirmChange={(v) => { setConfirmPassword(v); setServerError(null); }}
            onToggleShowPassword={() => setShowPassword((v) => !v)}
            onToggleShowConfirm={() => setShowConfirm((v) => !v)}
          />
        )}

        {step === "success" && (
          <motion.div key="fp-success" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="flex flex-col items-center text-center pt-4">
            <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }} className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg mb-4" style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
              <CheckCircle2 className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-gray-900 font-bold text-xl mb-2">Password Reset!</h2>
            <p className="text-gray-500 text-sm max-w-xs mb-6">Your password has been updated. You can now log in with your new password.</p>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 font-bold text-white text-lg" style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
              {countdown}
            </div>
            <p className="text-gray-400 text-xs mb-6">Returning to login in {countdown}s</p>
            <Button onClick={onBack} className="w-full h-11 font-bold text-white border-0" style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
              Back to Login
            </Button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
