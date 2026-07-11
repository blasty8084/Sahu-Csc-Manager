import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  Loader2,
  Smartphone,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  User,
  ShieldCheck,
  RefreshCw,
  XCircle,
  CheckCircle2,
  KeyRound,
  AlertTriangle,
  Clock,
  Ban,
  MailCheck,
  Mail,
  MessageCircle,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────
export const MAX_ATTEMPTS = 5;

// ── Login schema ─────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  identifier: z.string().min(1, "Login ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

// ── Password reset types & helpers ───────────────────────────────────────────
type ResetStep = "identifier" | "otp" | "password" | "success";
const RESEND_COOLDOWN = 120;
const BASE = () => import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
function apiPost(path: string, body: unknown) {
  return fetch(`${BASE()}/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
}
const PWD_RULES = [
  { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p: string) => /[a-z]/.test(p), label: "One lowercase letter" },
  { test: (p: string) => /[0-9]/.test(p), label: "One number" },
];

// ── OTP rate-limit panel ─────────────────────────────────────────────────────
const OTP_RATE_LIMIT = 15 * 60;

function OtpRateLimitPanel({ seconds, onBack }: { seconds: number; onBack: () => void }) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const isUrgent = seconds <= 60;
  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fef2f2, #fee2e2)" }}>
        <Lock className="w-7 h-7 text-red-500" />
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-base">Too Many Requests</h3>
        <p className="text-gray-500 text-xs mt-1 max-w-[260px]">OTP sending is temporarily blocked. Please wait before requesting a new code.</p>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${(seconds / OTP_RATE_LIMIT) * 100}%`, background: isUrgent ? "#ef4444" : "#f97316", transition: "width 1s linear" }} />
      </div>
      <div>
        <div className="text-4xl font-black tabular-nums tracking-tight" style={{ color: isUrgent ? "#dc2626" : "#0b2c60" }}>{mm}:{ss}</div>
        <p className="text-gray-400 text-xs mt-1">until you can try again</p>
      </div>
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mt-1">
        <ArrowLeft className="w-3.5 h-3.5" />Back
      </button>
    </div>
  );
}

// ── Forgot / Reset password panel ─────────────────────────────────────────────
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

// ── Lockout countdown hook ────────────────────────────────────────────────────
export function useLockoutCountdown(lockoutUntil: Date | null, onExpired: () => void) {
  const [remaining, setRemaining] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!lockoutUntil) { setRemaining(0); return; }
    const tick = () => {
      const ms = lockoutUntil.getTime() - Date.now();
      if (ms <= 0) {
        setRemaining(0);
        if (timerRef.current) clearInterval(timerRef.current);
        onExpired();
      } else {
        setRemaining(Math.ceil(ms / 1000));
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [lockoutUntil, onExpired]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const LOCK_TOTAL_SECS = 15 * 60;
  const progress = lockoutUntil ? Math.max(0, remaining / LOCK_TOTAL_SECS) : 0;

  return { remaining, display, progress };
}

// ── LoginFormContent props ────────────────────────────────────────────────────
export interface LoginFormContentProps {
  form: ReturnType<typeof useForm<LoginFormValues>>;
  onSubmit: (values: LoginFormValues) => Promise<void>;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (v: boolean) => void;
  onForgotPassword: () => void;
  attemptsLeft: number | null;
  lockoutUntil: Date | null;
  onLockoutExpired: () => void;
  rejectedInfo: { reason: string | null } | null;
  isPendingApproval: boolean;
  onDismissStatus: () => void;
  adminContact: { name: string; phone: string | null; email: string | null } | null;
}

// ── Login form content ────────────────────────────────────────────────────────
export function LoginFormContent({ form, onSubmit, showPassword, setShowPassword, rememberMe, setRememberMe, onForgotPassword, attemptsLeft, lockoutUntil, onLockoutExpired, rejectedInfo, isPendingApproval, onDismissStatus, adminContact }: LoginFormContentProps) {
  const isSubmitting = form.formState.isSubmitting;
  const { t } = useTranslation();

  const [appealCooldownMsg, setAppealCooldownMsg] = useState<string | null>(null);

  const fireAppealLog = async (channel: "whatsapp" | "email"): Promise<boolean> => {
    const identifier = form.getValues("identifier");
    if (!identifier) return true;
    const base = (import.meta as any).env?.BASE_URL?.replace(/\/$/, "") ?? "";
    try {
      const res = await fetch(`${base}/api/auth/appeal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, channel }),
      });
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        const msg = data.error ?? "Please wait before submitting another appeal.";
        setAppealCooldownMsg(msg);
        return false;
      }
      setAppealCooldownMsg(null);
    } catch {
      // network error — let the link open anyway
    }
    return true;
  };
  const usedAttempts = attemptsLeft !== null ? MAX_ATTEMPTS - attemptsLeft : 0;
  const showCounter = attemptsLeft !== null && attemptsLeft < MAX_ATTEMPTS && !lockoutUntil;
  const urgency = attemptsLeft !== null
    ? attemptsLeft <= 1 ? "critical"
    : attemptsLeft <= 2 ? "high"
    : "medium"
    : "medium";
  const { remaining, display, progress } = useLockoutCountdown(lockoutUntil, onLockoutExpired);

  const showStatusPanel = !!(rejectedInfo || isPendingApproval);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* ── Registration Declined panel ── */}
        <AnimatePresence>
          {rejectedInfo && (
            <motion.div
              key="rejected-panel"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border-2 overflow-hidden"
              style={{ borderColor: "#fed7aa", background: "#fff7ed" }}
            >
              <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #f97316, #ea580c)" }} />
              <div className="px-4 py-4">
                <div className="flex flex-col items-center text-center mb-3">
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                    style={{ background: "linear-gradient(135deg, #f97316, #c2410c)" }}
                  >
                    <Ban className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-base font-bold" style={{ color: "#c2410c" }}>Registration Declined</h3>
                  <p className="text-xs mt-1" style={{ color: "#9a3412" }}>
                    Your registration request was not approved by the administrator.
                  </p>
                </div>

                {rejectedInfo.reason && (
                  <div
                    className="rounded-xl px-3 py-2.5 mb-3 border"
                    style={{ background: "rgba(249,115,22,0.07)", borderColor: "#fed7aa" }}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#ea580c" }}>Reason</p>
                    <p className="text-sm font-medium leading-relaxed" style={{ color: "#7c2d12" }}>{rejectedInfo.reason}</p>
                  </div>
                )}

                {/* Appeal buttons */}
                {(adminContact?.phone || adminContact?.email) ? (
                  <div className="space-y-2 mb-3">
                    <p className="text-[11px] text-center font-semibold" style={{ color: "#9a3412" }}>
                      Contact the administrator to appeal:
                    </p>
                    <div className={`grid gap-2 ${adminContact.phone && adminContact.email ? "grid-cols-2" : "grid-cols-1"}`}>
                      {adminContact.phone && (() => {
                        const digits = adminContact.phone!.replace(/\D/g, "");
                        const waNum = digits.length === 10 ? `91${digits}` : digits;
                        const identifier = form.getValues("identifier");
                        const reason = rejectedInfo?.reason;
                        const msg = encodeURIComponent(
                          `Hi, I am ${identifier || "a user"}. My SAHU CSC registration was declined.${reason ? ` Reason given: "${reason}".` : ""} I would like to appeal this decision. Please reconsider my application.`
                        );
                        return (
                          <button
                            type="button"
                            onClick={async () => {
                              const allowed = await fireAppealLog("whatsapp");
                              if (allowed) window.open(`https://wa.me/${waNum}?text=${msg}`, "_blank", "noopener,noreferrer");
                            }}
                            className="flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold transition-opacity active:opacity-80"
                            style={{ background: "#25d366", color: "#fff" }}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </button>
                        );
                      })()}
                      {adminContact.email && (() => {
                        const identifier = form.getValues("identifier");
                        const reason = rejectedInfo?.reason;
                        const subject = encodeURIComponent(`Appeal: SAHU CSC Registration Declined — ${identifier || "User"}`);
                        const body = encodeURIComponent(
                          `Hello,\n\nI am ${identifier || "a registered user"} and my SAHU CSC registration was declined.${reason ? `\n\nReason given: "${reason}"` : ""}\n\nI would like to appeal this decision and request a review of my application.\n\nThank you.`
                        );
                        return (
                          <button
                            type="button"
                            onClick={async () => {
                              const allowed = await fireAppealLog("email");
                              if (allowed) window.location.href = `mailto:${adminContact!.email}?subject=${subject}&body=${body}`;
                            }}
                            className="flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold transition-opacity active:opacity-80"
                            style={{ background: "#0b2c60", color: "#fff" }}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Email Admin
                          </button>
                        );
                      })()}
                    </div>
                    {appealCooldownMsg && (
                      <p className="text-[11px] text-center font-medium mt-1" style={{ color: "#b45309" }}>
                        ⏳ {appealCooldownMsg}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-center mb-3" style={{ color: "#9a3412" }}>
                    For assistance, contact your administrator or register with a different account.
                  </p>
                )}

                <button
                  type="button"
                  onClick={onDismissStatus}
                  className="w-full h-10 rounded-xl font-semibold text-sm border-2 transition-colors"
                  style={{ borderColor: "#fed7aa", color: "#c2410c", background: "transparent" }}
                >
                  Try a different account →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pending Approval panel ── */}
        <AnimatePresence>
          {isPendingApproval && (
            <motion.div
              key="pending-panel"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border-2 overflow-hidden"
              style={{ borderColor: "#bfdbfe", background: "#eff6ff" }}
            >
              <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #3b82f6, #1d4ed8)" }} />
              <div className="px-4 py-4">
                <div className="flex flex-col items-center text-center mb-3">
                  <motion.div
                    animate={{ rotate: [0, -6, 6, -6, 6, 0] }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
                  >
                    <Clock className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-base font-bold" style={{ color: "#1d4ed8" }}>Awaiting Approval</h3>
                  <p className="text-xs mt-1" style={{ color: "#1e40af" }}>
                    Your registration is pending admin review. You'll be able to log in once approved.
                  </p>
                </div>

                <div
                  className="rounded-xl px-3 py-2.5 mb-3 border flex items-start gap-2.5"
                  style={{ background: "rgba(59,130,246,0.07)", borderColor: "#bfdbfe" }}
                >
                  <MailCheck className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#3b82f6" }} />
                  <p className="text-xs leading-relaxed" style={{ color: "#1e40af" }}>
                    You'll receive a notification once the administrator reviews your request. Check back later or contact your CSC admin directly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onDismissStatus}
                  className="w-full h-10 rounded-xl font-semibold text-sm border-2 transition-colors"
                  style={{ borderColor: "#bfdbfe", color: "#1d4ed8", background: "transparent" }}
                >
                  ← Back to login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Lockout countdown panel ── */}
        <AnimatePresence>
          {lockoutUntil && remaining > 0 && (
            <motion.div
              key="lockout-panel"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border-2 overflow-hidden"
              style={{ borderColor: "#fecdd3", background: "#fff1f2" }}
            >
              {/* Progress bar — drains left to right over 15 min */}
              <div className="h-1.5 w-full" style={{ background: "#fecdd3" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #e11d48, #f43f5e)", width: `${progress * 100}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>

              <div className="px-4 py-4">
                {/* Icon + heading */}
                <div className="flex flex-col items-center text-center mb-4">
                  <motion.div
                    animate={{ rotate: [0, -8, 8, -8, 8, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                    style={{ background: "linear-gradient(135deg, #e11d48, #be123c)" }}
                  >
                    <Lock className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-base font-bold" style={{ color: "#be123c" }}>Account Locked</h3>
                  <p className="text-xs mt-1" style={{ color: "#9f1239" }}>
                    Too many failed attempts. Try again after the timer expires.
                  </p>
                </div>

                {/* Big countdown display */}
                <div
                  className="flex flex-col items-center justify-center rounded-xl py-4 mb-4"
                  style={{ background: "rgba(225,29,72,0.08)" }}
                >
                  <motion.span
                    key={display}
                    initial={{ scale: 1.1, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-4xl font-black tabular-nums tracking-wider"
                    style={{ color: remaining <= 60 ? "#e11d48" : "#be123c", fontVariantNumeric: "tabular-nums" }}
                  >
                    {display}
                  </motion.span>
                  <span className="text-[10px] mt-1 font-medium uppercase tracking-widest" style={{ color: "#f43f5e" }}>
                    remaining
                  </span>
                </div>

                {/* Forgot password escape hatch */}
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="w-full h-10 rounded-xl font-semibold text-sm border-2 transition-colors"
                  style={{ borderColor: "#fda4af", color: "#be123c", background: "transparent" }}
                >
                  Reset password instead →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Normal form fields (hidden while locked or status panel shown) ── */}
        <AnimatePresence>
          {(!lockoutUntil || remaining <= 0) && !showStatusPanel && (
            <motion.div
              key="form-fields"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <FormControl>
                  <Input placeholder="Mobile / Username / Email" className="pl-10 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all" {...field} />
                </FormControl>
              </div>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <FormControl>
                  <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" className="pl-10 pr-11 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all" {...field} />
                </FormControl>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)} className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
            <span className="text-sm text-gray-600">{t('auth.login.remember_me')}</span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm font-semibold cursor-pointer transition-colors"
            style={{ color: "#0b2c60" }}
          >
            {t('auth.login.forgot_password')}
          </button>
        </div>

        {/* ── Attempt counter ── */}
        <AnimatePresence>
          {showCounter && (
            <motion.div
              key="attempt-counter"
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div
                className="rounded-xl px-4 py-3 border"
                style={{
                  background: urgency === "critical" ? "#fff1f2" : urgency === "high" ? "#fff7ed" : "#fffbeb",
                  borderColor: urgency === "critical" ? "#fecdd3" : urgency === "high" ? "#fed7aa" : "#fde68a",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle
                      className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: urgency === "critical" ? "#e11d48" : urgency === "high" ? "#ea580c" : "#d97706" }}
                    />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: urgency === "critical" ? "#be123c" : urgency === "high" ? "#c2410c" : "#b45309" }}
                    >
                      {attemptsLeft === 1
                        ? "Last attempt before lockout!"
                        : `${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining`}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {usedAttempts}/{MAX_ATTEMPTS} used
                  </span>
                </div>

                {/* Attempt dots */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
                    const isUsed = i < usedAttempts;
                    return (
                      <motion.div
                        key={i}
                        initial={false}
                        animate={{ scale: isUsed ? [1, 1.3, 1] : 1 }}
                        transition={{ duration: 0.3, delay: i * 0.04 }}
                        className="flex-1 h-1.5 rounded-full"
                        style={{
                          background: isUsed
                            ? urgency === "critical" ? "#e11d48"
                            : urgency === "high" ? "#ea580c"
                            : "#d97706"
                            : "rgba(0,0,0,0.08)",
                        }}
                      />
                    );
                  })}
                </div>

                {attemptsLeft !== null && attemptsLeft <= 2 && (
                  <p className="text-[10px] mt-1.5" style={{ color: urgency === "critical" ? "#9f1239" : "#9a3412" }}>
                    Account locks for 15 min after {MAX_ATTEMPTS} failed attempts.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
          <Button type="submit" disabled={isSubmitting} className="w-full h-12 font-bold text-base tracking-wide text-white shadow-lg border-0" style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
            {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{t('common.loading')}</span> : `${t('auth.login.submit')} →`}
          </Button>
        </motion.div>

        <AnimatePresence mode="wait">
          {showCounter ? (
            <motion.div
              key="locked-warning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 border"
              style={{
                background: urgency === "critical" ? "#fff1f2" : "#fff7ed",
                borderColor: urgency === "critical" ? "#fecdd3" : "#fed7aa",
              }}
            >
              <Lock
                className="w-4 h-4 flex-shrink-0"
                style={{ color: urgency === "critical" ? "#e11d48" : "#ea580c" }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: urgency === "critical" ? "#be123c" : "#c2410c" }}
              >
                Wrong password? Use{" "}
                <button type="button" onClick={onForgotPassword} className="underline font-semibold">
                  Forgot Password
                </button>{" "}
                to reset safely.
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="secure-badge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5"
            >
              <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-xs text-green-700 font-medium">Your data is 100% secure with us</span>
            </motion.div>
          )}
        </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Form>
  );
}
