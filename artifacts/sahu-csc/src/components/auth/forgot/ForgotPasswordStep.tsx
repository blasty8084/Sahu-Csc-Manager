import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Eye, EyeOff, XCircle, CheckCircle2, KeyRound } from "lucide-react";
import { PWD_RULES } from "@/components/auth/loginTypes";

interface Props {
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirm: boolean;
  setShowConfirm: (v: boolean) => void;
  submitting: boolean;
  serverError: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export function ForgotPasswordStep({
  password, setPassword, confirmPassword, setConfirmPassword,
  showPassword, setShowPassword, showConfirm, setShowConfirm,
  submitting, serverError, onSubmit,
}: Props) {
  const pwdRulesMet   = PWD_RULES.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  return (
    <motion.div key="fp-password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
      <div className="flex flex-col items-center mb-5">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-3" style={{ background: "#fef3c7" }}>
          <KeyRound className="w-6 h-6 text-amber-500" />
        </div>
        <h2 className="text-gray-900 font-bold text-lg">Set New Password</h2>
        <p className="text-gray-500 text-xs mt-1 text-center max-w-xs">Choose a strong password for your account.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input type={showPassword ? "text" : "password"} placeholder="New password"
            className="pl-10 pr-10 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400"
            autoFocus autoComplete="new-password" value={password}
            onChange={(e) => setPassword(e.target.value)} />
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {password && (
          <div className="grid grid-cols-2 gap-1">
            {PWD_RULES.map((r) => (
              <div key={r.label} className="flex items-center gap-1.5 text-[11px]">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: r.test(password) ? "#22c55e" : "#d1d5db" }} />
                <span style={{ color: r.test(password) ? "#16a34a" : "#9ca3af" }}>{r.label}</span>
              </div>
            ))}
          </div>
        )}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input type={showConfirm ? "text" : "password"} placeholder="Confirm new password"
            className="pl-10 pr-10 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400"
            autoComplete="new-password" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} />
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirm(!showConfirm)}>
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {confirmPassword && (
          <div className={`flex items-center gap-1.5 text-xs ${passwordsMatch ? "text-green-600" : "text-gray-400"}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${passwordsMatch ? "bg-green-500" : "bg-gray-300"}`} />
            {passwordsMatch ? "Passwords match" : "Passwords do not match yet"}
          </div>
        )}
        {serverError && (
          <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
            <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{serverError}
          </div>
        )}
        <Button type="submit" disabled={submitting || !pwdRulesMet || !passwordsMatch}
          className="w-full h-11 font-bold text-white border-0" style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
          {submitting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Saving…</span> : <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Set New Password</span>}
        </Button>
      </form>
    </motion.div>
  );
}
