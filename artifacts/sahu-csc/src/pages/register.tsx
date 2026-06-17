import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRegistrationStatus } from "@/hooks/use-registration-status";
import { LoginLogo } from "@/components/app-logo";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Eye, EyeOff, Lock, Mail, Smartphone, User, UserPlus,
  Loader2, CheckCircle2, ArrowLeft, Shield, LogIn, ArrowRight,
  ShieldCheck, RefreshCw, XCircle,
} from "lucide-react";
import RegistrationClosed from "./register-closed";

type RegisterStep = "form" | "otp";

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Minimum 3 characters")
      .max(50, "Maximum 50 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscores"),
    fullName: z.string().min(2, "Minimum 2 characters").max(100, "Maximum 100 characters").optional().or(z.literal("")),
    email: z.string().email("Invalid email address"),
    mobile: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Minimum 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const RESEND_COOLDOWN = 60;

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}${"*".repeat(Math.min(local.length - 2, 4))}@${domain}`;
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Lowercase", ok: /[a-z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400", "bg-green-500"];
  if (!password) return null;
  return (
    <div className="mt-1.5 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score] : "bg-gray-200"}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map((c) => (
          <span key={c.label} className={`text-[10px] flex items-center gap-0.5 ${c.ok ? "text-green-600" : "text-gray-400"}`}>
            <CheckCircle2 className={`w-2.5 h-2.5 ${c.ok ? "text-green-500" : "text-gray-300"}`} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function RegisterForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Multi-step state
  const [step, setStep] = useState<RegisterStep>("form");
  const [formValues, setFormValues] = useState<RegisterFormValues | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", fullName: "", email: "", mobile: "", password: "", confirmPassword: "" },
  });

  const password = form.watch("password");

  const startResendTimer = useCallback(() => {
    setResendSeconds(RESEND_COOLDOWN);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    resendTimerRef.current = setInterval(() => {
      setResendSeconds((s) => {
        if (s <= 1) { clearInterval(resendTimerRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (resendTimerRef.current) clearInterval(resendTimerRef.current); }, []);

  const sendOtp = async (email: string): Promise<boolean> => {
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    const res = await fetch(`${base}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose: "registration" }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 429) {
        setOtpError("Too many requests. Please wait 15 minutes before requesting a new code.");
      } else if (res.status === 409) {
        form.setError("email", { message: data.error ?? "Email already registered" });
      } else {
        setOtpError(data.error ?? "Failed to send OTP. Please try again.");
      }
      return false;
    }
    return true;
  };

  const onFormSubmit = async (values: RegisterFormValues) => {
    setSendingOtp(true);
    setOtpError(null);
    try {
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

  const handleOtpInput = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setOtpError(null);
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
    setOtpError(null);
    const nextEmpty = digits.findIndex((d) => !d);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    if (pasted.length === 6) {
      setTimeout(() => submitWithOtp(pasted), 80);
    }
  };

  const submitWithOtp = async (otp: string) => {
    if (!formValues) return;
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) return;
    setSubmitting(true);
    setOtpError(null);
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

    try {
      const body: Record<string, string> = {
        username: formValues.username,
        email: formValues.email,
        password: formValues.password,
        emailOtp: otp,
      };
      if (formValues.fullName) body.fullName = formValues.fullName;
      if (formValues.mobile) body.mobile = formValues.mobile;

      const res = await fetch(`${base}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) { setLocation("/register/closed"); return; }
        if (res.status === 400 && data.error?.toLowerCase().includes("otp")) {
          setOtpError(data.error);
        } else if (res.status === 409) {
          setOtpError(data.error ?? "An account with these details already exists.");
        } else {
          toast({ variant: "destructive", title: "Registration failed", description: data.error ?? "Please try again." });
        }
        return;
      }

      if (data.pending) { setLocation("/register/pending"); return; }
      setLocation("/login");
    } catch {
      toast({ variant: "destructive", title: "Network error", description: "Could not connect. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = () => submitWithOtp(otpDigits.join(""));

  const handleResend = async () => {
    if (resendSeconds > 0 || !formValues) return;
    setOtpError(null);
    setOtpDigits(["", "", "", "", "", ""]);
    const ok = await sendOtp(formValues.email);
    if (ok) {
      startResendTimer();
      toast({ title: "OTP resent", description: "A new code has been sent to your email." });
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  const otpComplete = otpDigits.every((d) => d !== "");

  return (
    <AnimatePresence mode="wait">
      {step === "form" && (
        <motion.div key="form-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-3.5">
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-600">Username *</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <FormControl><Input placeholder="e.g. sahu_csc" className="pl-10 h-11 border-gray-200 bg-white" {...field} /></FormControl>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-600">Full Name</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <FormControl><Input placeholder="Your full name" className="pl-10 h-11 border-gray-200 bg-white" {...field} /></FormControl>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-600">Email * <span className="text-gray-400 font-normal">(OTP will be sent here)</span></FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <FormControl><Input type="email" placeholder="you@example.com" className="pl-10 h-11 border-gray-200 bg-white" {...field} /></FormControl>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="mobile" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-600">Mobile Number</FormLabel>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <FormControl><Input type="tel" placeholder="10-digit mobile (optional)" className="pl-10 h-11 border-gray-200 bg-white" maxLength={10} {...field} /></FormControl>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-600">Password *</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <FormControl>
                      <Input type={showPassword ? "text" : "password"} placeholder="Create a strong password" className="pl-10 pr-11 h-11 border-gray-200 bg-white" {...field} />
                    </FormControl>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-600">Confirm Password *</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <FormControl>
                      <Input type={showConfirm ? "text" : "password"} placeholder="Re-enter your password" className="pl-10 pr-11 h-11 border-gray-200 bg-white" {...field} />
                    </FormControl>
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              {otpError && (
                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
                  <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  {otpError}
                </div>
              )}

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-1">
                <Button type="submit" disabled={sendingOtp} className="w-full h-12 font-bold text-base text-white" style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
                  {sendingOtp
                    ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Sending OTP…</span>
                    : <span className="flex items-center gap-2"><Mail className="w-4 h-4" />Continue — Send OTP</span>}
                </Button>
              </motion.div>
            </form>
          </Form>
        </motion.div>
      )}

      {step === "otp" && formValues && (
        <motion.div key="otp-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-3" style={{ background: "#dcfce7" }}>
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-gray-900 font-bold text-base">Verify your email</h3>
            <p className="text-gray-500 text-xs mt-1 text-center max-w-xs">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-gray-700">{maskEmail(formValues.email)}</span>
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
            onClick={handleOtpSubmit}
            disabled={submitting || !otpComplete}
            className="w-full h-12 font-bold text-base text-white mb-4"
            style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}
          >
            {submitting
              ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Creating Account…</span>
              : <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" />Verify & Create Account</span>}
          </Button>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendSeconds > 0}
              className="flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: resendSeconds > 0 ? "#9ca3af" : "#0b2c60" }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend OTP"}
            </button>

            <button
              type="button"
              onClick={() => { setStep("form"); setOtpError(null); }}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Edit my details
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      <p className="text-sm text-gray-500">Checking registration status...</p>
    </div>
  );
}

function RegisterContent() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#0B1340" }}>
        <div className="flex-shrink-0 pt-6 px-6 pb-4 flex flex-col items-center text-center relative">
          <Link href="/login">
            <button className="absolute left-4 top-6 w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ background: "rgba(255,255,255,0.15)" }}>
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
          </Link>
          <LoginLogo size={52} />
          <div className="mt-2.5 space-y-0">
            <h1 className="text-xl font-black"><span className="text-white">SAHU </span><span style={{ color: "#F97316" }}>CSC</span></h1>
            <p className="text-white/50 text-xs">Management Platform</p>
          </div>
        </div>
        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }} className="flex-1 bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 pt-5 pb-8">
            <div className="flex flex-col items-center mb-5">
              <h3 className="text-gray-900 font-bold text-base">Create your account</h3>
              <p className="text-gray-500 text-xs mt-0.5">Fill in your details to get started</p>
            </div>
            <RegisterForm />
            <div className="mt-5 flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#e8eef8" }}>
                <Shield className="w-4 h-4" style={{ color: "#0b2c60" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800">Your data is 100% secure with us</p>
                <p className="text-xs text-gray-500 mt-0.5">We respect your privacy and keep your data safe.</p>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">
              Already have an account?{" "}
              <Link href="/login"><span className="font-bold cursor-pointer" style={{ color: "#0b2c60" }}>Login here →</span></Link>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#0B1340" }}>
      <div className="w-[45%] flex flex-col justify-center px-16 py-12">
        <div className="flex items-center gap-3 mb-10">
          <LoginLogo size={36} />
          <div>
            <span className="text-white font-black text-lg">SAHU </span>
            <span className="font-black text-lg" style={{ color: "#F97316" }}>CSC</span>
            <p className="text-white/40 text-xs -mt-0.5">Management Platform</p>
          </div>
        </div>
        <h1 className="text-4xl font-black leading-tight">
          <span className="text-white">Join the</span><br />
          <span style={{ color: "#F97316" }}>CSC Network.</span>
        </h1>
        <p className="text-white/45 mt-4 max-w-sm leading-relaxed">Create your account to manage services, track transactions, and grow your CSC business.</p>
        <div className="mt-8 space-y-3">
          {["Free to register", "Email-verified for security", "Instant access after approval"].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#F97316" }} />
              <span className="text-white/70 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="w-[55%] flex items-center justify-center px-10 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-md bg-white rounded-3xl shadow-2xl px-8 py-8">
          <div className="flex items-center gap-2 mb-5">
            <Link href="/login">
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><ArrowLeft className="w-4 h-4" /></button>
            </Link>
            <div>
              <h3 className="text-gray-900 font-bold text-xl">Create Account</h3>
              <p className="text-gray-500 text-xs">Email verification required</p>
            </div>
          </div>
          <RegisterForm />

          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Link href="/login">
            <div
              className="mt-3 flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-dashed cursor-pointer transition-colors hover:bg-blue-100"
              style={{ borderColor: "#bfdbfe", background: "#eff6ff" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#dbeafe" }}>
                <LogIn className="w-5 h-5" style={{ color: "#0b2c60" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Already have an account?</p>
                <p className="text-sm font-bold flex items-center gap-1 mt-0.5" style={{ color: "#0b2c60" }}>
                  Login here <ArrowRight className="w-3.5 h-3.5" />
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function Register() {
  const { data: regStatus, isLoading } = useRegistrationStatus();

  if (isLoading) {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      return (
        <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#0B1340" }}>
          <div className="flex-shrink-0 pt-6 px-6 pb-4 flex flex-col items-center text-center">
            <LoginLogo size={52} />
            <div className="mt-2.5"><h1 className="text-xl font-black"><span className="text-white">SAHU </span><span style={{ color: "#F97316" }}>CSC</span></h1></div>
          </div>
          <div className="flex-1 bg-white rounded-t-3xl flex items-center justify-center"><LoadingScreen /></div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B1340" }}>
        <div className="bg-white rounded-3xl p-12"><LoadingScreen /></div>
      </div>
    );
  }

  if (!regStatus?.open) {
    return <RegistrationClosed />;
  }

  return <RegisterContent />;
}
