import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { LoginLogo } from "@/components/app-logo";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiPost, PWD_RULES, RESEND_COOLDOWN, OTP_RATE_LIMIT, ResetStep } from "@/components/auth/loginTypes";
import { ForgotPasswordStepper } from "@/components/auth/ForgotPasswordStepper";
import { OtpRequestForm } from "@/components/auth/OtpRequestForm";
import { OtpVerifyForm } from "@/components/auth/OtpVerifyForm";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";

const STEPS: ResetStep[] = ["identifier", "otp", "password", "success"];

export default function ForgotPassword() {
  const [, setLocation] = useLocation();

  const [step, setStep]                   = useState<ResetStep>("identifier");
  const [identifier, setIdentifier]       = useState("");
  const [maskedEmail, setMaskedEmail]     = useState<string | null>(null);
  const [resetToken, setResetToken]       = useState("");
  const [submitting, setSubmitting]       = useState(false);
  const [serverError, setServerError]     = useState<string | null>(null);
  const [notRegistered, setNotRegistered] = useState(false);

  const [otpDigits, setOtpDigits]               = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs                                  = useRef<(HTMLInputElement | null)[]>([]);
  const [resendSeconds, setResendSeconds]        = useState(RESEND_COOLDOWN);
  const resendTimerRef                           = useRef<ReturnType<typeof setInterval> | null>(null);
  const [otpRateLimited, setOtpRateLimited]     = useState(false);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(OTP_RATE_LIMIT);
  const rateLimitTimerRef                        = useRef<ReturnType<typeof setInterval> | null>(null);

  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);

  const [adminResetMode, setAdminResetMode]           = useState(false);
  const [adminLinkSecondsLeft, setAdminLinkSecondsLeft] = useState<number | null>(null);
  const [adminLinkExpired, setAdminLinkExpired]        = useState(false);
  const adminCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [countdown, setCountdown] = useState(4);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect admin-generated reset link (?token=…&exp=…)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    const exp    = params.get("exp");
    if (token) {
      setResetToken(token); setStep("password"); setAdminResetMode(true);
      if (exp) {
        const expiresAtMs = parseInt(exp, 10);
        if (!isNaN(expiresAtMs)) {
          const tick = () => {
            const secsLeft = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
            setAdminLinkSecondsLeft(secsLeft);
            if (secsLeft <= 0) { setAdminLinkExpired(true); clearInterval(adminCountdownRef.current!); }
          };
          tick(); adminCountdownRef.current = setInterval(tick, 1000);
        }
      }
    }
    return () => { if (adminCountdownRef.current) clearInterval(adminCountdownRef.current); };
  }, []);

  useEffect(() => () => {
    if (resendTimerRef.current)    clearInterval(resendTimerRef.current);
    if (countdownRef.current)      clearInterval(countdownRef.current);
    if (rateLimitTimerRef.current) clearInterval(rateLimitTimerRef.current);
  }, []);

  const startResendTimer = useCallback(() => {
    setResendSeconds(RESEND_COOLDOWN);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    resendTimerRef.current = setInterval(() =>
      setResendSeconds((s) => { if (s <= 1) { clearInterval(resendTimerRef.current!); return 0; } return s - 1; }), 1000);
  }, []);

  const startRateLimitTimer = useCallback(() => {
    setOtpRateLimited(true); setRateLimitSeconds(OTP_RATE_LIMIT);
    if (rateLimitTimerRef.current) clearInterval(rateLimitTimerRef.current);
    rateLimitTimerRef.current = setInterval(() =>
      setRateLimitSeconds((s) => { if (s <= 1) { clearInterval(rateLimitTimerRef.current!); setOtpRateLimited(false); setStep("identifier"); return OTP_RATE_LIMIT; } return s - 1; }), 1000);
  }, []);

  const startCountdown = useCallback(() => {
    setCountdown(4);
    countdownRef.current = setInterval(() =>
      setCountdown((c) => { if (c <= 1) { clearInterval(countdownRef.current!); setLocation("/login"); return 0; } return c - 1; }), 1000);
  }, [setLocation]);

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
      setMaskedEmail(data.maskedEmail ?? null); setOtpDigits(["", "", "", "", "", ""]); setStep("otp"); startResendTimer();
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
    if (!pasted) return; e.preventDefault();
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
    if (!pwdRulesMet)   { setServerError("Please meet all password requirements."); return; }
    if (!passwordsMatch) { setServerError("Passwords do not match."); return; }
    setServerError(null); setSubmitting(true);
    try {
      const res  = await apiPost("reset-password", { resetToken, password });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error ?? "Failed to reset password. Please try again."); return; }
      setStep("success"); startCountdown();
    } catch { setServerError("Network error. Please try again."); }
    finally { setSubmitting(false); }
  };

  const pwdRulesMet  = PWD_RULES.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";
  const otpComplete  = otpDigits.every((d) => d !== "");
  const stepIndex    = STEPS.indexOf(step);

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: "#0B1340" }}>
      <div className="flex-shrink-0 pt-6 px-6 pb-4 flex flex-col items-center text-center">
        <LoginLogo size={56} />
        <div className="mt-2.5">
          <h1 className="text-xl font-black">
            <span className="text-white">SAHU </span><span style={{ color: "#F97316" }}>CSC</span>
          </h1>
          <p className="text-white/50 text-xs">Password Recovery</p>
        </div>
        {step !== "success" && <ForgotPasswordStepper stepIndex={stepIndex} />}
      </div>

      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex-1 bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
          <AnimatePresence mode="wait">

            {step === "identifier" && (
              <motion.div key="step-identifier" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                <OtpRequestForm
                  identifier={identifier}
                  onIdentifierChange={(v) => { setIdentifier(v); setServerError(null); }}
                  serverError={serverError}
                  notRegistered={notRegistered}
                  submitting={submitting}
                  onSubmit={handleSendOtp}
                />
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div key="step-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                <OtpVerifyForm
                  otpDigits={otpDigits} otpRefs={otpRefs} maskedEmail={maskedEmail}
                  serverError={serverError} submitting={submitting} otpComplete={otpComplete}
                  resendSeconds={resendSeconds} otpRateLimited={otpRateLimited} rateLimitSeconds={rateLimitSeconds}
                  onInput={handleOtpInput} onKeyDown={handleOtpKeyDown} onPaste={handleOtpPaste}
                  onSubmit={() => verifyOtp(otpDigits.join(""))} onResend={handleResend}
                  onBackToIdentifier={() => { setStep("identifier"); setServerError(null); }}
                  onRateLimitBack={() => { if (rateLimitTimerRef.current) clearInterval(rateLimitTimerRef.current); setOtpRateLimited(false); setStep("identifier"); }}
                />
              </motion.div>
            )}

            {step === "password" && (
              <motion.div key="step-password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                <NewPasswordForm
                  password={password} confirmPassword={confirmPassword}
                  showPassword={showPassword} showConfirm={showConfirm}
                  serverError={serverError} submitting={submitting}
                  pwdRulesMet={pwdRulesMet} passwordsMatch={passwordsMatch}
                  adminResetMode={adminResetMode} adminLinkExpired={adminLinkExpired}
                  adminLinkSecondsLeft={adminLinkSecondsLeft}
                  onPasswordChange={(v) => { setPassword(v); setServerError(null); }}
                  onConfirmChange={(v) => { setConfirmPassword(v); setServerError(null); }}
                  onTogglePassword={() => setShowPassword((v) => !v)}
                  onToggleConfirm={() => setShowConfirm((v) => !v)}
                  onSubmit={handleSetPassword}
                />
              </motion.div>
            )}

            {step === "success" && (
              <motion.div key="step-success" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="flex flex-col items-center text-center pt-4">
                <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }} className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg mb-4" style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-gray-900 font-bold text-xl mb-2">Password Reset!</h2>
                <p className="text-gray-500 text-sm max-w-xs mb-6">Your password has been updated successfully. You can now log in with your new password.</p>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 font-bold text-white text-lg" style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>{countdown}</div>
                <p className="text-gray-400 text-xs mb-6">Redirecting to login in {countdown}s</p>
                <Button onClick={() => setLocation("/login")} className="w-full h-11 font-bold text-white border-0" style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>Go to Login</Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
