import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginLogo } from "@/components/app-logo";
import {
  ArrowLeft,
  Loader2,
  Mail,
  ShieldCheck,
  RefreshCw,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Step = "email" | "otp";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const RESEND_COOLDOWN = 60;

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}${"*".repeat(Math.min(local.length - 2, 4))}@${domain}`;
}

export default function ForgotPassword() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  // Start resend countdown
  const startResendTimer = useCallback(() => {
    setResendSeconds(RESEND_COOLDOWN);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    resendTimerRef.current = setInterval(() => {
      setResendSeconds((s) => {
        if (s <= 1) {
          clearInterval(resendTimerRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (resendTimerRef.current) clearInterval(resendTimerRef.current); }, []);

  const sendOtp = async (targetEmail: string): Promise<boolean> => {
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    const res = await fetch(`${base}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail, purpose: "password_reset" }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 429) {
        setServerError("Too many OTP requests. Please wait 15 minutes before trying again.");
      } else {
        setServerError(data.error ?? "Failed to send OTP. Please try again.");
      }
      return false;
    }
    return true;
  };

  const onEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    setServerError(null);
    setSubmitting(true);
    try {
      await sendOtp(values.email);
      // Always advance to OTP step to prevent email enumeration
      setEmail(values.email);
      setOtpDigits(["", "", "", "", "", ""]);
      setStep("otp");
      startResendTimer();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpInput = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setServerError(null);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const digits = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtpDigits(digits);
    setServerError(null);
    const nextEmpty = digits.findIndex((d) => !d);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    if (pasted.length === 6) {
      setTimeout(() => verifyOtp(pasted), 80);
    }
  };

  const verifyOtp = async (otp: string) => {
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) return;
    setServerError(null);
    setSubmitting(true);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, purpose: "password_reset" }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        const reasonMap: Record<string, string> = {
          expired: "OTP has expired. Request a new one.",
          invalid: "Incorrect OTP. Please check and try again.",
          used: "This OTP has already been used.",
          missing: "Please enter all 6 digits.",
        };
        setServerError(reasonMap[data.reason] ?? "Invalid OTP. Please try again.");
        return;
      }
      // Store resetToken in sessionStorage for reset-password page
      sessionStorage.setItem("sahu-reset-token", data.resetToken);
      sessionStorage.setItem("sahu-reset-email", email);
      setLocation("/reset-password");
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = () => {
    verifyOtp(otpDigits.join(""));
  };

  const handleResend = async () => {
    if (resendSeconds > 0) return;
    setServerError(null);
    setOtpDigits(["", "", "", "", "", ""]);
    const ok = await sendOtp(email);
    if (ok) {
      startResendTimer();
      toast({ title: "OTP resent", description: "A new OTP has been sent to your email." });
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  const otpComplete = otpDigits.every((d) => d !== "");

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: "#0B1340" }}>
      {/* Compact navy header */}
      <div className="flex-shrink-0 pt-6 px-6 pb-4 flex flex-col items-center text-center">
        <LoginLogo size={56} />
        <div className="mt-2.5">
          <h1 className="text-xl font-black">
            <span className="text-white">SAHU </span>
            <span style={{ color: "#F97316" }}>CSC</span>
          </h1>
          <p className="text-white/50 text-xs">Password Recovery</p>
        </div>
      </div>

      {/* White card */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex-1 bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6">

          <AnimatePresence mode="wait">

            {/* ── Step: email ── */}
            {step === "email" && (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
              >
                <div className="flex flex-col items-center mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-3"
                    style={{ background: "#e8eef8" }}
                  >
                    <Mail className="w-6 h-6" style={{ color: "#0b2c60" }} />
                  </div>
                  <h2 className="text-gray-900 font-bold text-lg">Forgot Password?</h2>
                  <p className="text-gray-500 text-xs mt-1 text-center max-w-xs">
                    Enter your registered email address. We'll send a 6-digit code to reset your password.
                  </p>
                </div>

                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                className="pl-10 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400"
                                autoFocus
                                autoComplete="email"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {serverError && (
                      <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
                        <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        {serverError}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-11 font-bold text-white border-0"
                      style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending OTP…
                        </span>
                      ) : "Send OTP to Email"}
                    </Button>

                    <div className="text-center pt-1">
                      <Link href="/login">
                        <button type="button" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                          <ArrowLeft className="w-3.5 h-3.5" />
                          Back to login
                        </button>
                      </Link>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}

            {/* ── Step: OTP ── */}
            {step === "otp" && (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
              >
                <div className="flex flex-col items-center mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-3"
                    style={{ background: "#dcfce7" }}
                  >
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="text-gray-900 font-bold text-lg">Enter OTP</h2>
                  <p className="text-gray-500 text-xs mt-1 text-center max-w-xs">
                    We sent a 6-digit code to{" "}
                    <span className="font-semibold text-gray-700">{maskEmail(email)}</span>
                  </p>
                  <p className="text-gray-400 text-[10px] mt-0.5">Check your inbox and spam folder</p>
                </div>

                {/* OTP digit boxes */}
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
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    {serverError}
                  </div>
                )}

                <Button
                  onClick={handleOtpSubmit}
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

                {/* Resend + change email */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendSeconds > 0}
                    className="flex items-center gap-1.5 text-sm transition-colors"
                    style={{ color: resendSeconds > 0 ? "#9ca3af" : "#0b2c60" }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {resendSeconds > 0
                      ? `Resend OTP in ${resendSeconds}s`
                      : "Resend OTP"}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep("email"); setServerError(null); }}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Use a different email
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
