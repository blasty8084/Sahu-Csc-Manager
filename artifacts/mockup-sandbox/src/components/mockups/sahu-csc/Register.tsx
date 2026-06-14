import { useState } from "react";
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, CheckCircle2 } from "lucide-react";

export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden" style={{ background: "linear-gradient(160deg, #0B1340 0%, #0b2c60 55%, #1a3a7a 100%)" }}>

      {/* Top header area */}
      <div className="flex-shrink-0 flex flex-col items-center pt-8 pb-4 px-6 relative">
        {/* Back arrow */}
        <div className="absolute left-4 top-6 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
          <ArrowRight className="w-4 h-4 text-white rotate-180" />
        </div>

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
      <div className="flex-1 rounded-t-3xl overflow-hidden" style={{ background: "#fff" }}>
        <div className="h-full overflow-y-auto px-6 pt-6 pb-6">

          {/* Heading */}
          <div className="text-center mb-5">
            <h2 className="text-xl font-bold text-gray-900">Create your account</h2>
            <p className="text-sm text-gray-500 mt-0.5">Join SAHU CSC and get started</p>
          </div>

          {/* Form */}
          <div className="space-y-3">

            {/* Full Name */}
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/60">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#e8eef8" }}>
                <User className="w-4 h-4" style={{ color: "#0b2c60" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700">Full Name</p>
                <p className="text-xs text-gray-400 mt-0.5">Enter your full name</p>
              </div>
            </div>

            {/* Mobile Number */}
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/60">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#e8eef8" }}>
                <Phone className="w-4 h-4" style={{ color: "#0b2c60" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700">Mobile Number</p>
                <p className="text-xs text-gray-400 mt-0.5">Enter your 10 digit mobile number</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/60">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#e8eef8" }}>
                <Mail className="w-4 h-4" style={{ color: "#0b2c60" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700">
                  Email Address <span className="text-gray-400 font-normal">(Optional)</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Enter your email address</p>
              </div>
            </div>

            {/* Create Password */}
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/60">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#e8eef8" }}>
                <Lock className="w-4 h-4" style={{ color: "#0b2c60" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700">Create Password</p>
                <p className="text-xs text-gray-400 mt-0.5">Enter a strong password</p>
              </div>
              <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 flex-shrink-0">
                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/60">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#e8eef8" }}>
                <Lock className="w-4 h-4" style={{ color: "#0b2c60" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700">Confirm Password</p>
                <p className="text-xs text-gray-400 mt-0.5">Re-enter your password</p>
              </div>
              <button onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 flex-shrink-0">
                {showConfirm ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password requirements */}
          <div className="mt-4 p-3 rounded-xl border border-green-100 bg-green-50/60">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-600" />
              <p className="text-xs font-semibold text-green-800">Password must contain:</p>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {[
                "At least 8 characters",
                "One number",
                "One uppercase letter",
                "One special character",
              ].map((req) => (
                <div key={req} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  <span className="text-xs text-green-700">{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Terms */}
          <div className="mt-4 flex items-start gap-2.5">
            <button
              onClick={() => setAgreed(!agreed)}
              className="mt-0.5 w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0"
              style={{ borderColor: agreed ? "#0b2c60" : "#9ca3af", background: agreed ? "#0b2c60" : "white" }}
            >
              {agreed && <CheckCircle2 className="w-3 h-3 text-white" />}
            </button>
            <p className="text-xs text-gray-600 leading-relaxed">
              I agree to the{" "}
              <span style={{ color: "#0b2c60" }} className="font-semibold">Terms of Service</span>{" "}
              and{" "}
              <span style={{ color: "#0b2c60" }} className="font-semibold">Privacy Policy</span>
            </p>
          </div>

          {/* Register button */}
          <button
            className="mt-4 w-full py-3.5 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg"
            style={{ background: "linear-gradient(135deg, #0B1340 0%, #0b2c60 100%)" }}
          >
            Register
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Login link */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">Already have an account?</p>
            <button className="text-sm font-semibold flex items-center gap-1 mx-auto mt-0.5" style={{ color: "#0b2c60" }}>
              Login here <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Security badge */}
          <div className="mt-4 flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50/60">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#e8eef8" }}>
              <Shield className="w-5 h-5" style={{ color: "#0b2c60" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800">Your data is 100% secure with us</p>
              <p className="text-xs text-gray-500 mt-0.5">We respect your privacy and keep your information safe and secure.</p>
            </div>
            <Lock className="w-8 h-8 text-gray-200 flex-shrink-0" />
          </div>

        </div>
      </div>
    </div>
  );
}
