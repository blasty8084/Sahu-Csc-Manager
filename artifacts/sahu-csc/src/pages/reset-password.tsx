import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginLogo } from "@/components/app-logo";
import { CheckCircle2, XCircle, ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";

// ── Token-based schema (from email OTP flow) ──
const tokenSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ── Legacy schema (identifier + OTP + password) ──
const legacySchema = z.object({
  identifier: z.string().min(1, "Enter your username, email, or mobile"),
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must be numeric"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

function SuccessScreen() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    const t = setTimeout(() => setLocation("/login"), 3000);
    return () => clearTimeout(t);
  }, [setLocation]);

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: "#0B1340" }}>
      <div className="flex-shrink-0 pt-6 px-6 pb-4 flex flex-col items-center text-center">
        <LoginLogo size={56} />
        <div className="mt-2.5">
          <h1 className="text-xl font-black"><span className="text-white">SAHU </span><span style={{ color: "#F97316" }}>CSC</span></h1>
          <p className="text-white/50 text-xs">Password Recovery</p>
        </div>
      </div>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex-1 bg-white rounded-t-3xl shadow-2xl flex flex-col items-center justify-center px-6 pb-8"
      >
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
        <p className="font-bold text-gray-900 text-xl">Password reset!</p>
        <p className="text-sm text-gray-500 mt-1 text-center">Redirecting to login in 3 seconds…</p>
        <Link href="/login" className="w-full mt-6">
          <Button className="w-full h-11 font-bold text-white border-0" style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
            Go to Login Now
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

// ── Token-based form (email OTP flow) ─────────────────────────────────────────
function TokenResetForm({ resetToken }: { resetToken: string }) {
  const [, setLocation] = useLocation();
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof tokenSchema>>({
    resolver: zodResolver(tokenSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: z.infer<typeof tokenSchema>) => {
    setServerError(null);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, password: values.password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      sessionStorage.removeItem("sahu-reset-token");
      sessionStorage.removeItem("sahu-reset-email");
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  if (success) return <SuccessScreen />;

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: "#0B1340" }}>
      <div className="flex-shrink-0 pt-6 px-6 pb-4 flex flex-col items-center text-center">
        <LoginLogo size={56} />
        <div className="mt-2.5">
          <h1 className="text-xl font-black"><span className="text-white">SAHU </span><span style={{ color: "#F97316" }}>CSC</span></h1>
          <p className="text-white/50 text-xs">Password Recovery</p>
        </div>
      </div>

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex-1 bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6">
          <div className="flex flex-col items-center mb-5">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ background: "#FEE4D8" }}>
              <Lock className="w-5 h-5" style={{ color: "#F97316" }} />
            </div>
            <h2 className="text-gray-900 font-bold text-lg mt-2">Set New Password</h2>
            <p className="text-gray-500 text-xs mt-0.5 text-center max-w-xs">
              OTP verified. Enter your new password below.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-600">New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 8 characters, uppercase, number"
                        className="h-11 pr-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400"
                        autoComplete="new-password"
                        autoFocus
                        {...field}
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword((v) => !v)}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-600">Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter new password"
                        className="h-11 pr-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400"
                        autoComplete="new-password"
                        {...field}
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirm((v) => !v)}>
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              {serverError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
                  <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {serverError}
                </div>
              )}

              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full h-11 font-bold text-white border-0 mt-1" style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
                {form.formState.isSubmitting ? "Resetting…" : "Reset Password"}
              </Button>

              <div className="text-center pt-1">
                <Link href="/forgot-password">
                  <button type="button" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to forgot password
                  </button>
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}

// ── Legacy form (identifier + OTP) ────────────────────────────────────────────
function LegacyResetForm() {
  const [, setLocation] = useLocation();
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);

  const form = useForm<z.infer<typeof legacySchema>>({
    resolver: zodResolver(legacySchema),
    defaultValues: { identifier: "", otp: "", password: "", confirmPassword: "" },
  });

  const handleOtpInput = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    form.setValue("otp", next.join(""), { shouldValidate: true });
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
    form.setValue("otp", pasted.padEnd(6, "").slice(0, 6), { shouldValidate: true });
    const nextEmpty = digits.findIndex((d) => !d);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const onSubmit = async (values: z.infer<typeof legacySchema>) => {
    setServerError(null);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: values.identifier, otp: values.otp, password: values.password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  if (success) return <SuccessScreen />;

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: "#0B1340" }}>
      <div className="flex-shrink-0 pt-6 px-6 pb-4 flex flex-col items-center text-center">
        <LoginLogo size={56} />
        <div className="mt-2.5">
          <h1 className="text-xl font-black"><span className="text-white">SAHU </span><span style={{ color: "#F97316" }}>CSC</span></h1>
          <p className="text-white/50 text-xs">Password Recovery</p>
        </div>
      </div>

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex-1 bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6">
          <div className="flex flex-col items-center mb-5">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ background: "#FEE4D8" }}>
              <Lock className="w-5 h-5" style={{ color: "#F97316" }} />
            </div>
            <h2 className="text-gray-900 font-bold text-lg mt-2">Reset Password</h2>
            <p className="text-gray-500 text-xs mt-0.5 text-center max-w-xs">
              Enter your username, the OTP you received, and your new password
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="identifier" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-600">Username, Email or Mobile</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your identifier" className="h-10 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400" autoFocus autoComplete="username" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="otp" render={({ fieldState }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-600">One-Time Password (OTP)</FormLabel>
                  <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, i) => (
                      <input key={i} ref={(el) => { otpRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={(e) => handleOtpInput(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-10 h-10 text-center text-base font-bold border-2 rounded-lg bg-white outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-gray-900"
                        style={{ borderColor: fieldState.error ? "rgb(239,68,68)" : "#e5e7eb" }}
                      />
                    ))}
                  </div>
                  {fieldState.error && <p className="text-xs font-medium text-red-500 mt-1">{fieldState.error.message}</p>}
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-600">New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="Min 8 characters" className="h-10 pr-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400" autoComplete="new-password" {...field} />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword((v) => !v)}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-600">Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showConfirm ? "text" : "password"} placeholder="Re-enter new password" className="h-10 pr-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400" autoComplete="new-password" {...field} />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirm((v) => !v)}>
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              {serverError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
                  <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {serverError}
                </div>
              )}

              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full h-10 font-bold text-white border-0" style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
                {form.formState.isSubmitting ? "Resetting…" : "Reset Password"}
              </Button>

              <div className="text-center pt-0.5 space-y-1.5">
                <div>
                  <Link href="/forgot-password">
                    <button type="button" className="text-xs font-semibold" style={{ color: "#0b2c60" }}>
                      Get OTP by email instead →
                    </button>
                  </Link>
                </div>
                <div>
                  <Link href="/login">
                    <button type="button" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to login
                    </button>
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}

// ── Root export — chooses mode based on sessionStorage token ──────────────────
export default function ResetPassword() {
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("sahu-reset-token");
    setResetToken(token);
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (resetToken) return <TokenResetForm resetToken={resetToken} />;
  return <LegacyResetForm />;
}
