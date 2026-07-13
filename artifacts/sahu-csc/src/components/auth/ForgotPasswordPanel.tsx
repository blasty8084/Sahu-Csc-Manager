import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  User,
  ShieldCheck,
  RefreshCw,
  XCircle,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { OtpRateLimitPanel } from "./OtpRateLimitPanel";
import { apiPost, PWD_RULES, RESEND_COOLDOWN, OTP_RATE_LIMIT, ResetStep } from "./loginTypes";

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

  const otpComplete = otpDigits.every((d) => d !== "");
  const STEPS: ResetStep[] = ["identifier", "otp", "password", "success"];
  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col items-center mb-5">
        {step !== "success" && (
          <button
            type="button"
            onClick={onBack}
            className="self-start flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to login
          </button>
        )}

        {/* Step progress dots */}
        {step !== "success" && (
          <div className="flex items-center gap-2 mb-4">
            {["identifier", "otp", "password"].map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    background: stepIndex >= i ? "#f97316" : "rgba(0,0,0,0.15)",
                    transform: stepIndex === i ? "scale(1.35)" : "scale(1)",
                  }}
                />
                {i < 2 && (
                  <div
                    className="h-0.5 w-8 rounded-full transition-all duration-300"
                    style={{ background: stepIndex > i ? "#f97316" : "rgba(0,0,0,0.12)" }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">

        {/* Step 1: Identifier */}
        {step === "identifier" && (
          <motion.div key="fp-identifier" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <div className="flex flex-col items-center mb-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-3" style={{ background: "#e8eef8" }}>
                <User className="w-6 h-6" style={{ color: "#0b2c60" }} />
              </div>
              <h2 className="text-gray-900 font-bold text-lg">Forgot Password?</h2>
              <p className="text-gray-500 text-xs mt-1 text-center max-w-xs">
                Enter your username, email, or mobile. We'll send a 6-digit OTP to your registered email.
              </p>
            </div>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Username, email or mobile"
                  className="pl-10 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400"
                  autoFocus
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setServerError(null); }}
                />
              </div>
              {serverError && (
                <div className={`flex flex-col gap-2 text-xs rounded-lg p-3 border ${notRegistered ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-red-50 border-red-200 text-red-600"}`}>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </div>
                  {notRegistered && (
                    <Link href="/register">
                      <button type="button" className="w-full h-9 rounded-lg font-semibold text-xs border-0 text-white" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                        Register a New Account →
                      </button>
                    </Link>
                  )}
                </div>
              )}
              <Button type="submit" disabled={submitting} className="w-full h-11 font-bold text-white border-0" style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
                {submitting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Sending OTP…</span> : "Send OTP"}
              </Button>
            </form>
          </motion.div>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <motion.div key="fp-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {otpRateLimited ? (
              <OtpRateLimitPanel
                seconds={rateLimitSeconds}
                onBack={() => {
                  if (rateLimitTimerRef.current) clearInterval(rateLimitTimerRef.current);
                  setOtpRateLimited(false);
                  setStep("identifier");
                }}
              />
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
                <div className="flex gap-2 justify-center mb-5" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpInput(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
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
                <Button onClick={() => verifyOtp(otpDigits.join(""))} disabled={submitting || !otpComplete} className="w-full h-11 font-bold text-white border-0 mb-4" style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
                  {submitting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Verifying…</span> : <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Verify OTP</span>}
                </Button>
                <div className="flex flex-col items-center gap-3">
                  <button type="button" onClick={handleResend} disabled={resendSeconds > 0 || submitting} className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: resendSeconds > 0 ? "#9ca3af" : "#0b2c60" }}>
                    <RefreshCw className="w-3.5 h-3.5" />
                    {resendSeconds > 0 ? `Resend OTP in ${resendSeconds}s` : "Resend OTP"}
                  </button>
                  <button type="button" onClick={() => { setStep("identifier"); setServerError(null); }} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" />Try a different username
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Step 3: New password */}
        {step === "password" && (
          <motion.div key="fp-password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <div className="flex flex-col items-center mb-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-3" style={{ background: "#fef3c7" }}>
                <KeyRound className="w-6 h-6 text-amber-500" />
              </div>
              <h2 className="text-gray-900 font-bold text-lg">Set New Password</h2>
              <p className="text-gray-500 text-xs mt-1 text-center max-w-xs">Choose a strong password for your account.</p>
            </div>
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input type={showPassword ? "text" : "password"} placeholder="New password" className="pl-10 pr-10 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400" autoFocus autoComplete="new-password" value={password} onChange={(e) => { setPassword(e.target.value); setServerError(null); }} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="grid grid-cols-2 gap-1">
                  {PWD_RULES.map((r) => (
                    <div key={r.label} className="flex items-center gap-1.5 text-[11px]">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: r.test(password) ? "#22c55e" : "#d1d5db" }} />
                      <span style={{ color: r.test(password) ? "#16a34a" : "#9ca3af" }}>{r.label}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input type={showConfirm ? "text" : "password"} placeholder="Confirm new password" className="pl-10 pr-10 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400" autoComplete="new-password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setServerError(null); }} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirm((v) => !v)}>
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && (
                <div className={`flex items-center gap-1.5 text-xs ${passwordsMatch ? "text-green-600" : "text-gray-400"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${passwordsMatch ? "bg-green-500" : "bg-gray-300"}`} />
                  {passwordsMatch ? "Passwords match" : "Passwords do not match yet"}
                </div>
              )}
              {serverError && (
                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
                  <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{serverError}
                </div>
              )}
              <Button type="submit" disabled={submitting || !pwdRulesMet || !passwordsMatch} className="w-full h-11 font-bold text-white border-0" style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
                {submitting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Saving…</span> : <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Set New Password</span>}
              </Button>
            </form>
          </motion.div>
        )}

        {/* Step 4: Success */}
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
