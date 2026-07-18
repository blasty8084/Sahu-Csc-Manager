/**
 * RegisterDesktopLayout — navy left hero + white form card for the desktop register screen.
 */
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { LoginLogo } from "@/components/app-logo";

interface Props {
  children: React.ReactNode;
}

const HERO_BULLETS = [
  "Free to register",
  "Email-verified for security",
  "Instant access after approval",
];

export function RegisterDesktopLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex" style={{ background: "#0B1340" }}>
      {/* Left: hero panel */}
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
        <p className="text-white/45 mt-4 max-w-sm leading-relaxed">
          Create your account to manage services, track transactions, and grow your CSC business.
        </p>
        <div className="mt-8 space-y-3">
          {HERO_BULLETS.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#F97316" }} />
              <span className="text-white/70 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: form card */}
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
              <p className="text-gray-500 text-xs">Email verification required</p>
            </div>
          </div>

          {children}

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
