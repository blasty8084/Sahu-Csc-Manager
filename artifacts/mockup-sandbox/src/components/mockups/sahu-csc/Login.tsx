import { useState } from "react";
import { User, Lock, Eye, EyeOff, ArrowRight, Shield, CheckCircle2, UserPlus } from "lucide-react";

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="w-full flex flex-col" style={{ background: "linear-gradient(160deg, #0B1340 0%, #0b2c60 55%, #1a3a7a 100%)" }}>

      {/* Top header */}
      <div className="flex flex-col items-center pt-8 pb-4 px-6">
        {/* Logo */}
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/30 shadow-lg mb-3 bg-white flex items-center justify-center">
          <img
            src="/__mockup/images/sahu-logo.png"
            alt="SAHU CSC Logo"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Brand name */}
        <h1 className="text-2xl font-bold tracking-wide text-white">
          SAHU <span style={{ color: "#f97316" }}>CSC</span>
        </h1>
        <p className="text-sm text-white/70 mt-0.5">Management Platform</p>
      </div>

      {/* White card */}
      <div className="rounded-t-3xl bg-white px-6 pt-6 pb-8">

        {/* Heading */}
        <div className="text-center mb-5">
          <h2 className="text-xl font-bold text-gray-900">Login to your account</h2>
          <p className="text-sm text-gray-500 mt-1">Enter your credentials to continue</p>
        </div>

        {/* Form fields */}
        <div className="space-y-3">
          {/* Username field */}
          <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3.5 bg-gray-50/60">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#e8eef8" }}>
              <User className="w-4 h-4" style={{ color: "#0b2c60" }} />
            </div>
            <span className="text-sm text-gray-400 flex-1">Mobile / Username / Email</span>
          </div>

          {/* Password field */}
          <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3.5 bg-gray-50/60">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#e8eef8" }}>
              <Lock className="w-4 h-4" style={{ color: "#0b2c60" }} />
            </div>
            <span className="text-sm text-gray-400 flex-1">Enter your password</span>
            <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 flex-shrink-0">
              {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between mt-3.5">
          <button
            onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-2"
          >
            <div
              className="w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0"
              style={{ borderColor: rememberMe ? "#0b2c60" : "#9ca3af", background: rememberMe ? "#0b2c60" : "white" }}
            >
              {rememberMe && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm text-gray-700">Remember me</span>
          </button>
          <button className="text-sm font-semibold" style={{ color: "#0b2c60" }}>
            Forgot Password?
          </button>
        </div>

        {/* Login button */}
        <button
          className="mt-5 w-full py-3.5 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg"
          style={{ background: "linear-gradient(135deg, #0B1340 0%, #0b2c60 100%)" }}
        >
          Login
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Security badge */}
        <div className="mt-4 flex items-center gap-2.5 px-4 py-3 rounded-xl" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#22c55e" }}>
            <Shield className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm font-semibold" style={{ color: "#15803d" }}>Your data is 100% secure with us</p>
        </div>

        {/* OTP reset link */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center border border-blue-200 flex-shrink-0" style={{ background: "#eff6ff" }}>
            <Shield className="w-3.5 h-3.5" style={{ color: "#0b2c60" }} />
          </div>
          <button className="text-sm font-semibold flex items-center gap-1" style={{ color: "#0b2c60" }}>
            Have an OTP? Reset password <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Or divider */}
        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Register CTA card */}
        <div
          className="mt-4 flex items-center gap-3 px-4 py-4 rounded-2xl border-2 border-dashed overflow-hidden relative"
          style={{ borderColor: "#bfdbfe", background: "#eff6ff" }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#dbeafe" }}>
            <UserPlus className="w-5 h-5" style={{ color: "#0b2c60" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Don't have an account?</p>
            <button className="text-sm font-bold flex items-center gap-1 mt-0.5" style={{ color: "#0b2c60" }}>
              Register here <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Decorative clipboard illustration */}
          <div className="relative flex-shrink-0 w-16 h-16 opacity-30">
            <div className="absolute inset-0 rounded-xl" style={{ background: "#93c5fd" }} />
            <div className="absolute inset-1.5 rounded-lg bg-white flex flex-col gap-1.5 p-2">
              <div className="h-1 rounded-full bg-blue-300 w-3/4" />
              <div className="h-1 rounded-full bg-blue-300 w-full" />
              <div className="h-1 rounded-full bg-blue-300 w-2/3" />
              <div className="h-1 rounded-full bg-blue-300 w-full" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md" style={{ background: "#0b2c60" }}>
              <span className="text-white text-sm font-bold leading-none">+</span>
            </div>
          </div>
        </div>

        {/* Footer trust line */}
        <div className="mt-6 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-gray-400" />
          <p className="text-xs text-gray-400 tracking-wide">Trusted. Secure. Reliable.</p>
        </div>

      </div>
    </div>
  );
}
