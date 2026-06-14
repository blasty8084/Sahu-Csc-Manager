import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoginLogo } from "@/components/app-logo";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Mail, Smartphone, User, UserPlus, Loader2, CheckCircle2, ArrowLeft, Shield } from "lucide-react";

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
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score] : "bg-gray-200"}`}
          />
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
  const [done, setDone] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", fullName: "", email: "", mobile: "", password: "", confirmPassword: "" },
  });

  const password = form.watch("password");

  const onSubmit = async (values: RegisterFormValues) => {
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    const body: Record<string, string> = {
      username: values.username,
      email: values.email,
      password: values.password,
    };
    if (values.fullName) body.fullName = values.fullName;
    if (values.mobile) body.mobile = values.mobile;

    try {
      const res = await fetch(`${base}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "Registration failed", description: data.error ?? "Please try again." });
        return;
      }
      setDone(true);
    } catch {
      toast({ variant: "destructive", title: "Network error", description: "Could not connect. Please try again." });
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 py-8 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Account Created!</h3>
          <p className="text-gray-500 text-sm mt-1">Your account has been registered successfully.</p>
        </div>
        <Button
          className="mt-2 w-full"
          style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}
          onClick={() => setLocation("/login")}
        >
          Go to Login →
        </Button>
      </motion.div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Username */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-gray-600">Username *</FormLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <FormControl>
                  <Input placeholder="e.g. sahu_csc" className="pl-10 h-11 border-gray-200 bg-white" {...field} />
                </FormControl>
              </div>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Full Name */}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-gray-600">Full Name</FormLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <FormControl>
                  <Input placeholder="Your full name" className="pl-10 h-11 border-gray-200 bg-white" {...field} />
                </FormControl>
              </div>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-gray-600">Email *</FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <FormControl>
                  <Input type="email" placeholder="you@example.com" className="pl-10 h-11 border-gray-200 bg-white" {...field} />
                </FormControl>
              </div>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Mobile */}
        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-gray-600">Mobile Number</FormLabel>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <FormControl>
                  <Input type="tel" placeholder="10-digit mobile (optional)" className="pl-10 h-11 border-gray-200 bg-white" maxLength={10} {...field} />
                </FormControl>
              </div>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-gray-600">Password *</FormLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="pl-10 pr-11 h-11 border-gray-200 bg-white"
                    {...field}
                  />
                </FormControl>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Confirm Password */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-gray-600">Confirm Password *</FormLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <FormControl>
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    className="pl-10 pr-11 h-11 border-gray-200 bg-white"
                    {...field}
                  />
                </FormControl>
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-1">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full h-12 font-bold text-base text-white"
            style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}
          >
            {form.formState.isSubmitting ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Creating account...</span>
            ) : (
              <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" />Create Account</span>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}

export default function Register() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#0B1340" }}>
        {/* Compact navy header with logo */}
        <div className="flex-shrink-0 pt-6 px-6 pb-4 flex flex-col items-center text-center relative">
          <Link href="/login">
            <button className="absolute left-4 top-6 w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ background: "rgba(255,255,255,0.15)" }}>
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
          </Link>
          <LoginLogo size={52} />
          <div className="mt-2.5 space-y-0">
            <h1 className="text-xl font-black">
              <span className="text-white">SAHU </span>
              <span style={{ color: "#F97316" }}>CSC</span>
            </h1>
            <p className="text-white/50 text-xs">Management Platform</p>
          </div>
        </div>

        {/* White card — fills remaining height */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-1 bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 pt-5 pb-8">
            <div className="flex flex-col items-center mb-5">
              <h3 className="text-gray-900 font-bold text-base">Create your account</h3>
              <p className="text-gray-500 text-xs mt-0.5">Join SAHU CSC and get started</p>
            </div>
            <RegisterForm />
            {/* Security badge */}
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
              <Link href="/login">
                <span className="font-bold cursor-pointer" style={{ color: "#0b2c60" }}>Login here →</span>
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#0B1340" }}>
      {/* Left panel */}
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
          <span className="text-white">Join the</span>
          <br />
          <span style={{ color: "#F97316" }}>CSC Network.</span>
        </h1>
        <p className="text-white/45 mt-4 max-w-sm leading-relaxed">
          Create your account to manage services, track transactions, and grow your CSC business.
        </p>
        <div className="mt-8 space-y-3">
          {["Free to register", "Instant access to all features", "Secure & encrypted data"].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#F97316" }} />
              <span className="text-white/70 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="w-[55%] flex items-center justify-center px-10 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl px-8 py-8"
        >
          <div className="flex items-center gap-2 mb-5">
            <Link href="/login">
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <div>
              <h3 className="text-gray-900 font-bold text-xl">Create Account</h3>
              <p className="text-gray-500 text-xs">All fields marked * are required</p>
            </div>
          </div>
          <RegisterForm />
          <p className="text-center text-xs text-gray-500 mt-4">
            Already have an account?{" "}
            <Link href="/login">
              <span className="font-bold cursor-pointer" style={{ color: "#F97316" }}>Sign in →</span>
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
