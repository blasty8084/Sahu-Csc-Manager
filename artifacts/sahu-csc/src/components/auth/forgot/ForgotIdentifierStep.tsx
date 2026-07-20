import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, User, XCircle } from "lucide-react";
import { Link } from "wouter";

interface Props {
  identifier: string;
  setIdentifier: (v: string) => void;
  serverError: string | null;
  notRegistered: boolean;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ForgotIdentifierStep({ identifier, setIdentifier, serverError, notRegistered, submitting, onSubmit }: Props) {
  return (
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
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input type="text" placeholder="Username, email or mobile"
            className="pl-10 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400"
            autoFocus autoComplete="username"
            value={identifier} onChange={(e) => { setIdentifier(e.target.value); }} />
        </div>
        {serverError && (
          <div className={`flex flex-col gap-2 text-xs rounded-lg p-3 border ${notRegistered ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-red-50 border-red-200 text-red-600"}`}>
            <div className="flex items-start gap-2">
              <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /><span>{serverError}</span>
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
  );
}
