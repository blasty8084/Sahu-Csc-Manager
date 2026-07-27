import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Lock, Shield } from "lucide-react";
import { MAX_ATTEMPTS } from "./loginTypes";

type Urgency = "critical" | "high" | "medium";

interface AttemptCounterProps {
  showCounter: boolean;
  attemptsLeft: number | null;
  usedAttempts: number;
  urgency: Urgency;
  onForgotPassword: () => void;
}

// ── Attempt dots + warning row ────────────────────────────────────────────────
export function AttemptCounter({ showCounter, attemptsLeft, usedAttempts, urgency, onForgotPassword }: AttemptCounterProps) {
  return (
    <>
      <AnimatePresence>
        {showCounter && (
          <motion.div
            key="attempt-counter"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-xl px-4 py-3 border"
              style={{
                background: urgency === "critical" ? "var(--color-error-bg-sm)" : urgency === "high" ? "var(--surface-warn-bg)" : "#fffbeb",
                borderColor: urgency === "critical" ? "var(--color-rose-200)" : urgency === "high" ? "var(--color-orange-200)" : "#fde68a",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle
                    className="w-3.5 h-3.5 flex-shrink-0"
                    style={{ color: urgency === "critical" ? "var(--color-error)" : urgency === "high" ? "var(--brand-orange-600)" : "var(--color-warning)" }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: urgency === "critical" ? "var(--color-error-dark)" : urgency === "high" ? "var(--brand-orange-700)" : "var(--color-amber-700)" }}
                  >
                    {attemptsLeft === 1
                      ? "Last attempt before lockout!"
                      : `${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining`}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{usedAttempts}/{MAX_ATTEMPTS} used</span>
              </div>

              {/* Attempt dots */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
                  const isUsed = i < usedAttempts;
                  return (
                    <motion.div
                      key={i}
                      initial={false}
                      animate={{ scale: isUsed ? [1, 1.3, 1] : 1 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      className="flex-1 h-1.5 rounded-full"
                      style={{
                        background: isUsed
                          ? urgency === "critical" ? "var(--color-error)"
                          : urgency === "high" ? "var(--brand-orange-600)"
                          : "var(--color-warning)"
                          : "rgba(0,0,0,0.08)",
                      }}
                    />
                  );
                })}
              </div>

              {attemptsLeft !== null && attemptsLeft <= 2 && (
                <p className="text-[10px] mt-1.5" style={{ color: urgency === "critical" ? "var(--color-rose-800)" : "var(--color-orange-800)" }}>
                  Account locks for 15 min after {MAX_ATTEMPTS} failed attempts.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security / lockout-warning badge — swaps with AnimatePresence */}
      <AnimatePresence mode="wait">
        {showCounter ? (
          <motion.div
            key="locked-warning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 border"
            style={{
              background: urgency === "critical" ? "var(--color-error-bg-sm)" : "var(--surface-warn-bg)",
              borderColor: urgency === "critical" ? "var(--color-rose-200)" : "var(--color-orange-200)",
            }}
          >
            <Lock
              className="w-4 h-4 flex-shrink-0"
              style={{ color: urgency === "critical" ? "var(--color-error)" : "var(--brand-orange-600)" }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: urgency === "critical" ? "var(--color-error-dark)" : "var(--brand-orange-700)" }}
            >
              Wrong password? Use{" "}
              <button type="button" onClick={onForgotPassword} className="underline font-semibold">
                Forgot Password
              </button>{" "}
              to reset safely.
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="secure-badge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5"
          >
            <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-xs text-green-700 font-medium">Your data is 100% secure with us</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
