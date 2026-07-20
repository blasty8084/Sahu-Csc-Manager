import { motion } from "framer-motion";
import { Mail, Smartphone, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";
import type { Method } from "./useTwoFactorStep";

const NAVY = "#0B1340";

interface MethodPickerProps {
  choosing: Method | null;
  chooseError: string | null;
  maskedEmail: string | null | undefined;
  totpEnrolled: boolean;
  onChoose: (method: Method) => void;
  onBack: () => void;
}

export function MethodPicker({ choosing, chooseError, maskedEmail, totpEnrolled, onChoose, onBack }: MethodPickerProps) {
  return (
    <motion.div key="picker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="space-y-3">
      {chooseError && (
        <p className="text-xs font-medium text-center rounded-lg bg-red-50 border border-red-200 px-3 py-2" style={{ color: "#be123c" }}>
          {chooseError}
        </p>
      )}

      {/* Email OTP card */}
      <button type="button" onClick={() => onChoose("otp")} disabled={!!choosing}
        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 text-left transition-all disabled:opacity-60"
        style={{ borderColor: "#dbeafe", background: "#eff6ff" }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #0b2c60, #1d4ed8)" }}>
          {choosing === "otp" ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Mail className="w-5 h-5 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: NAVY }}>Email OTP</p>
          <p className="text-xs text-gray-500 mt-0.5">Send a 6-digit code to {maskedEmail ?? "your email"}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>

      {/* Authenticator App card */}
      <button type="button" onClick={() => onChoose("totp")} disabled={!!choosing}
        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 text-left transition-all disabled:opacity-60"
        style={{ borderColor: "#fed7aa", background: "#fff7ed" }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #c2410c, #f97316)" }}>
          {choosing === "totp" ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Smartphone className="w-5 h-5 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: "#7c2d12" }}>Authenticator App</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {totpEnrolled
              ? "Use your Google Authenticator, Authy, or TOTP app"
              : "Set up Google Authenticator, Authy, or any TOTP app"}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>

      <button type="button" onClick={onBack} className="flex items-center gap-1 font-medium text-gray-400 hover:text-gray-600 text-xs pt-1">
        <ArrowLeft className="w-3 h-3" />Back to login
      </button>
    </motion.div>
  );
}
