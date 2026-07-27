import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";

interface LockoutPanelProps {
  lockoutUntil: Date | null;
  remaining: number;
  display: string;
  progress: number;
  onForgotPassword: () => void;
}

export function LockoutPanel({ lockoutUntil, remaining, display, progress, onForgotPassword }: LockoutPanelProps) {
  return (
    <AnimatePresence>
      {lockoutUntil && remaining > 0 && (
        <motion.div
          key="lockout-panel"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border-2 overflow-hidden"
          style={{ borderColor: "var(--color-rose-200)", background: "var(--color-error-bg-sm)" }}
        >
          {/* Progress bar — drains left to right over 15 min */}
          <div className="h-1.5 w-full" style={{ background: "var(--color-rose-200)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, var(--color-error), var(--color-error-soft))", width: `${progress * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>

          <div className="px-4 py-4">
            <div className="flex flex-col items-center text-center mb-4">
              <motion.div
                animate={{ rotate: [0, -8, 8, -8, 8, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                style={{ background: "linear-gradient(135deg, var(--color-error), var(--color-error-dark))" }}
              >
                <Lock className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="text-base font-bold" style={{ color: "var(--color-error-dark)" }}>Account Locked</h3>
              <p className="text-xs mt-1" style={{ color: "var(--color-rose-800)" }}>
                Too many failed attempts. Try again after the timer expires.
              </p>
            </div>

            {/* Big countdown display */}
            <div
              className="flex flex-col items-center justify-center rounded-xl py-4 mb-4"
              style={{ background: "var(--color-error-bg)" }}
            >
              <motion.span
                key={display}
                initial={{ scale: 1.1, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-4xl font-black tabular-nums tracking-wider"
                style={{ color: remaining <= 60 ? "var(--color-error)" : "var(--color-error-dark)", fontVariantNumeric: "tabular-nums" }}
              >
                {display}
              </motion.span>
              <span className="text-[10px] mt-1 font-medium uppercase tracking-widest" style={{ color: "var(--color-error-soft)" }}>
                remaining
              </span>
            </div>

            <button
              type="button"
              onClick={onForgotPassword}
              className="w-full h-10 rounded-xl font-semibold text-sm border-2 transition-colors"
              style={{ borderColor: "var(--color-rose-300)", color: "var(--color-error-dark)", background: "transparent" }}
            >
              Reset password instead →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
