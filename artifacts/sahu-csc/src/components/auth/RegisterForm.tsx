/**
 * RegisterForm — multi-step registration form (form → OTP verify).
 * Owns all form state, timers, and API calls. Renders via focused sub-components.
 */
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { OtpRateLimitPanel } from "./OtpRateLimitPanel";
import { RegisterPersonalForm } from "./RegisterPersonalForm";
import { RegisterCredentialsForm } from "./RegisterCredentialsForm";
import { RegisterOtpStep } from "./RegisterOtpStep";
import {
  registerSchema, type RegisterFormValues, type RegisterStep,
  RESEND_COOLDOWN, OTP_RATE_LIMIT, useTwoFaDisabled,
} from "./registerTypes";

export function RegisterForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const twoFaDisabled = useTwoFaDisabled();

  // ── Visibility toggles ──────────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Multi-step state ────────────────────────────────────────────────────────
  const [step, setStep] = useState<RegisterStep>("form");
  const [formValues, setFormValues] = useState<RegisterFormValues | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // ── OTP state ───────────────────────────────────────────────────────────────
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [otpRateLimited, setOtpRateLimited] = useState(false);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(OTP_RATE_LIMIT);
  const rateLimitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", fullName: "", email: "", mobile: "", password: "", confirmPassword: "" },
  });

  // ── Timers ──────────────────────────────────────────────────────────────────
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
        if (s <= 1) { clearInterval(rateLimitTimerRef.current!); setOtpRateLimited(false); setStep("form"); return OTP_RATE_LIMIT; }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => {
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    if (rateLimitTimerRef.current) clearInterval(rateLimitTimerRef.current);
  }, []);

  // ── API helpers ─────────────────────────────────────────────────────────────
  const base = () => import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

  const sendOtp = async (email: string): Promise<boolean> => {
    const res = await fetch(`${base()}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose: "registration" }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 429) { startRateLimitTimer(); setStep("otp"); }
      else if (res.status === 409) { form.setError("email", { message: data.error ?? "Email already registered" }); }
      else { setOtpError(data.error ?? "Failed to send OTP. Please try again."); }
      return false;
    }
    return true;
  };

  const onFormSubmit = async (values: RegisterFormValues) => {
    setSendingOtp(true);
    setOtpError(null);
    try {
      if (twoFaDisabled) {
        const body: Record<string, string> = { username: values.username, email: values.email, password: values.password };
        if (values.fullName) body.fullName = values.fullName;
        if (values.mobile) body.mobile = values.mobile;
        const res = await fetch(`${base()}/api/auth/register`, {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 403) { setLocation("/register/closed"); return; }
          if (res.status === 409) { setOtpError(data.error ?? "An account with these details already exists."); }
          else { toast({ variant: "destructive", title: "Registration failed", description: data.error ?? "Please try again." }); }
          return;
        }
        if (data.pending) { setLocation("/register/pending"); return; }
        form.reset();
        setLocation("/login");
        return;
      }
      const ok = await sendOtp(values.email);
      if (!ok) return;
      setFormValues(values);
      setOtpDigits(["", "", "", "", "", ""]);
      setStep("otp");
      startResendTimer();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setOtpError("Network error. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const submitWithOtp = async (otp: string) => {
    if (!formValues || otp.length !== 6 || !/^\d{6}$/.test(otp)) return;
    setSubmitting(true);
    setOtpError(null);
    try {
      const body: Record<string, string> = { username: formValues.username, email: formValues.email, password: formValues.password, emailOtp: otp };
      if (formValues.fullName) body.fullName = formValues.fullName;
      if (formValues.mobile) body.mobile = formValues.mobile;
      const res = await fetch(`${base()}/api/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) { setLocation("/register/closed"); return; }
        if (res.status === 400 && data.error?.toLowerCase().includes("otp")) { setOtpError(data.error); }
        else if (res.status === 409) { setOtpError(data.error ?? "An account with these details already exists."); }
        else { toast({ variant: "destructive", title: "Registration failed", description: data.error ?? "Please try again." }); }
        return;
      }
      if (data.pending) { setLocation("/register/pending"); return; }
      form.reset();
      setFormValues(null);
      setOtpDigits(["", "", "", "", "", ""]);
      setLocation("/login");
    } catch {
      toast({ variant: "destructive", title: "Network error", description: "Could not connect. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  // ── OTP handlers ────────────────────────────────────────────────────────────
  const handleOtpInput = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits]; next[index] = digit; setOtpDigits(next); setOtpError(null);
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
    setOtpDigits(digits); setOtpError(null);
    const nextEmpty = digits.findIndex((d) => !d);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    if (pasted.length === 6) setTimeout(() => submitWithOtp(pasted), 80);
  };
  const handleResend = async () => {
    if (resendSeconds > 0 || !formValues) return;
    setOtpError(null); setOtpDigits(["", "", "", "", "", ""]);
    const ok = await sendOtp(formValues.email);
    if (ok) { startResendTimer(); toast({ title: "OTP resent", description: "A new code has been sent to your email." }); setTimeout(() => otpRefs.current[0]?.focus(), 100); }
  };

  const otpComplete = otpDigits.every((d) => d !== "");

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence mode="wait">
      {step === "form" && (
        <motion.div key="form-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-3.5">
              <RegisterPersonalForm form={form} />
              <RegisterCredentialsForm
                form={form}
                showPassword={showPassword} setShowPassword={setShowPassword}
                showConfirm={showConfirm} setShowConfirm={setShowConfirm}
                otpError={otpError} sendingOtp={sendingOtp}
              />
            </form>
          </Form>
        </motion.div>
      )}

      {step === "otp" && (formValues !== null || otpRateLimited) && (
        <motion.div key="otp-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
          {otpRateLimited ? (
            <OtpRateLimitPanel
              seconds={rateLimitSeconds}
              onBack={() => { if (rateLimitTimerRef.current) clearInterval(rateLimitTimerRef.current); setOtpRateLimited(false); setStep("form"); }}
            />
          ) : formValues ? (
            <RegisterOtpStep
              email={formValues.email}
              otpDigits={otpDigits} otpRefs={otpRefs}
              submitting={submitting} otpComplete={otpComplete} otpError={otpError}
              resendSeconds={resendSeconds}
              onInput={handleOtpInput} onKeyDown={handleOtpKeyDown} onPaste={handleOtpPaste}
              onSubmit={() => submitWithOtp(otpDigits.join(""))}
              onResend={handleResend}
              onBack={() => { setStep("form"); setOtpError(null); }}
            />
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
