import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  Zap,
  Users,
  Loader2,
  User,
  Smartphone,
} from "lucide-react";

const loginSchema = z.object({
  identifier: z.string().min(1, "Login ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function SLogo({ size = 56 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.18,
        background: "linear-gradient(135deg, #F97316, #ea6a0a)",
      }}
      className="flex items-center justify-center shadow-xl"
    >
      <span
        style={{
          fontSize: size * 0.52,
          color: "#fff",
          fontWeight: 900,
          fontFamily: "Georgia, serif",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        S
      </span>
    </div>
  );
}

function CircularLogo() {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
      style={{ background: "linear-gradient(135deg, #F97316, #ea6a0a)", border: "2px solid rgba(249,115,22,0.4)" }}
    >
      <span
        style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: 16, color: "#fff" }}
      >
        S
      </span>
    </div>
  );
}

function CSCBuilding() {
  return (
    <div className="relative w-full flex flex-col items-center mt-6 select-none">
      <div className="flex items-end gap-4 mb-0 w-full max-w-xs justify-center">
        <div className="flex flex-col items-center flex-shrink-0">
          <div
            className="w-9 h-12 rounded-full"
            style={{ background: "linear-gradient(180deg, #166534, #15803d)" }}
          />
          <div
            className="w-2.5 h-5 rounded-sm"
            style={{ background: "#7c4a00" }}
          />
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-end gap-1 mb-0.5">
            <div className="w-0.5 h-10 rounded-full" style={{ background: "rgba(255,255,255,0.5)" }} />
            <div className="w-5 h-3 rounded-sm" style={{ background: "#FF9933" }} />
          </div>
          <div
            className="w-36 h-5 rounded-t-lg"
            style={{ background: "#1a2560" }}
          />
          <div
            className="w-40 h-20 flex flex-col items-center justify-center gap-1.5"
            style={{ background: "#1e2d6b" }}
          >
            <div
              className="px-3 py-0.5 rounded text-white text-xs font-black tracking-widest"
              style={{ background: "rgba(249,115,22,0.25)", border: "1px solid rgba(249,115,22,0.4)" }}
            >
              CSC
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-sm"
                  style={{ background: "#0f1a4a", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              ))}
            </div>
          </div>
          <div
            className="w-10 h-10 rounded-t-full"
            style={{ background: "#F97316" }}
          />
        </div>
        <div className="flex flex-col items-center flex-shrink-0">
          <div
            className="w-7 h-9 rounded-full"
            style={{ background: "linear-gradient(180deg, #166534, #15803d)" }}
          />
          <div
            className="w-2 h-4 rounded-sm"
            style={{ background: "#7c4a00" }}
          />
        </div>
      </div>
      <div className="w-full max-w-xs h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
      <div className="w-full max-w-xs h-2 flex overflow-hidden rounded-b-sm">
        <div className="flex-1" style={{ background: "#FF9933" }} />
        <div className="flex-1 bg-white" />
        <div className="flex-1" style={{ background: "#138808" }} />
      </div>
    </div>
  );
}

interface LoginFormContentProps {
  form: ReturnType<typeof useForm<LoginFormValues>>;
  onSubmit: (values: LoginFormValues) => Promise<void>;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (v: boolean) => void;
}

function LoginFormContent({
  form,
  onSubmit,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
}: LoginFormContentProps) {
  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Login ID */}
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <FormControl>
                  <Input
                    placeholder="Mobile / Username / Email"
                    className="pl-10 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all"
                    {...field}
                  />
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
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-11 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all"
                    {...field}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(v) => setRememberMe(!!v)}
              className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <Link href="/forgot-password">
            <span className="text-sm font-semibold cursor-pointer transition-colors" style={{ color: "#F97316" }}>
              Forgot Password?
            </span>
          </Link>
        </div>

        {/* Login button */}
        <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 font-bold text-base tracking-wide text-white shadow-lg border-0"
            style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </span>
            ) : (
              "Login →"
            )}
          </Button>
        </motion.div>

        {/* Security badge */}
        <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
          <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-xs text-green-700 font-medium">
            Your data is 100% secure with us
          </span>
        </div>

        {/* Bottom links */}
        <div className="flex items-center justify-between pt-0.5">
          <Link href="/reset-password">
            <span className="text-xs font-semibold cursor-pointer transition-colors" style={{ color: "#2563eb" }}>
              Have an OTP? Reset →
            </span>
          </Link>
          <Link href="/register">
            <span className="text-xs font-semibold cursor-pointer transition-colors" style={{ color: "#F97316" }}>
              Register Now
            </span>
          </Link>
        </div>
      </form>
    </Form>
  );
}

function MobileLogin(props: LoginFormContentProps) {
  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ background: "#0B1340" }}
    >
      <div className="flex-shrink-0 pt-14 px-6 pb-8 flex flex-col items-center text-center">
        <SLogo size={64} />
        <div className="mt-4 space-y-0.5">
          <h1 className="text-2xl font-black">
            <span className="text-white">SAHU </span>
            <span style={{ color: "#F97316" }}>CSC</span>
          </h1>
          <p className="text-white/50 text-sm">Management Platform</p>
        </div>
        <div className="flex items-center gap-1.5 mt-4">
          <div className="w-10 h-0.5 rounded-full" style={{ background: "#F97316" }} />
          <div className="w-3 h-0.5 rounded-full" style={{ background: "#F97316", opacity: 0.4 }} />
          <div className="w-1.5 h-0.5 rounded-full" style={{ background: "#F97316", opacity: 0.2 }} />
        </div>
        <h2 className="text-white text-xl font-bold mt-3">Welcome back!</h2>
        <p className="text-white/45 text-sm mt-1">Sign in to continue to your dashboard</p>
      </div>

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex-1 bg-white rounded-t-3xl shadow-2xl overflow-y-auto"
      >
        <div className="px-6 pt-6 pb-10">
          <div className="flex flex-col items-center mb-5">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
              style={{ background: "#FEE4D8" }}
            >
              <User className="w-6 h-6" style={{ color: "#F97316" }} />
            </div>
            <h3 className="text-gray-900 font-bold text-lg mt-2.5">
              Login to your account
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">
              Enter your credentials to continue
            </p>
          </div>

          <LoginFormContent {...props} />

          <p className="text-center text-xs text-gray-500 mt-5">
            Don't have an account?{" "}
            <Link href="/register">
              <span className="font-bold cursor-pointer" style={{ color: "#F97316" }}>Register Now</span>
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function DesktopLogin(props: LoginFormContentProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0B1340" }}>
      <div className="flex flex-1">
        <div className="w-[60%] flex flex-col justify-between px-16 py-12">
          <div className="flex items-center gap-3">
            <CircularLogo />
            <div>
              <div>
                <span className="text-white font-black text-lg">SAHU </span>
                <span style={{ color: "#F97316" }} className="font-black text-lg">CSC</span>
              </div>
              <p className="text-white/40 text-xs -mt-0.5">Management Platform</p>
            </div>
          </div>

          <div className="mt-10 flex-1 flex flex-col justify-center">
            <h1 className="text-5xl font-black leading-tight">
              <span className="text-white">One Platform.</span>
              <br />
              <span style={{ color: "#F97316" }}>Many Services.</span>
            </h1>
            <p className="text-white/45 mt-4 text-base max-w-md leading-relaxed">
              Manage all your CSC services, transactions and reports in one
              secure place.
            </p>

            <div className="space-y-4 mt-8">
              {[
                {
                  icon: Shield,
                  title: "Secure & Reliable",
                  desc: "Bank-level security to protect your data",
                },
                {
                  icon: Zap,
                  title: "Fast & Efficient",
                  desc: "Quick access to all CSC services",
                },
                {
                  icon: Users,
                  title: "Trusted by Operators",
                  desc: "Join thousands of CSC operators across India",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{ background: "#1a2560", border: "1px solid rgba(249,115,22,0.2)" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "#F97316" }} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{title}</p>
                    <p className="text-white/40 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <CSCBuilding />
        </div>

        <div className="w-[40%] flex items-center justify-center px-10 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl px-8 py-8"
          >
            <div className="flex flex-col items-center mb-5">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm"
                style={{ background: "#FEE4D8" }}
              >
                <User className="w-7 h-7" style={{ color: "#F97316" }} />
              </div>
              <h3 className="text-gray-900 font-bold text-xl mt-3">
                Login to your account
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                Enter your credentials to continue
              </p>
            </div>

            <LoginFormContent {...props} />

            <p className="text-center text-xs text-gray-500 mt-5">
              Don't have an account?{" "}
              <Link href="/register">
                <span className="font-bold cursor-pointer" style={{ color: "#F97316" }}>Register Now</span>
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      <div
        style={{ borderTop: "1px solid #1a2560", background: "#080e2e" }}
      >
        <div className="flex items-center justify-around py-3.5 px-8 max-w-4xl mx-auto">
          {[
            { icon: Shield, label: "100% Secure" },
            { icon: Zap, label: "24x7 Support" },
            { icon: Users, label: "Always Available" },
            { icon: Shield, label: "Trusted Network" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "#F97316" }} />
              <span className="text-white/50 text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  useEffect(() => {
    const saved = localStorage.getItem("rememberMe") === "true";
    if (saved) {
      setRememberMe(true);
      const savedId = localStorage.getItem("savedIdentifier") || "";
      if (savedId) form.setValue("identifier", savedId);
    }
  }, []);

  const onSubmit = async (values: LoginFormValues) => {
    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("savedIdentifier", values.identifier);
    } else {
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("savedIdentifier");
    }
    try {
      await login({ ...values, rememberMe });
      toast({
        title: "Login successful",
        description: "Welcome back to the SAHU CSC Platform.",
      });
    } catch (err: any) {
      if (err?.locked) {
        toast({
          variant: "destructive",
          title: "Account Locked",
          description: err.message ?? "Your account is temporarily locked. Please try again later.",
        });
      } else if (err?.attemptsLeft !== undefined) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: `${err.message ?? "Invalid credentials."} (${err.attemptsLeft} attempt${err.attemptsLeft !== 1 ? "s" : ""} remaining)`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: err?.message ?? "Please check your credentials and try again.",
        });
      }
    }
  };

  const formProps: LoginFormContentProps = {
    form,
    onSubmit,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
  };

  return isMobile ? <MobileLogin {...formProps} /> : <DesktopLogin {...formProps} />;
}
