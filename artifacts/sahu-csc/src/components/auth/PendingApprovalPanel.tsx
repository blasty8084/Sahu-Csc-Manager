import { motion, AnimatePresence } from "framer-motion";
import { Clock, MailCheck } from "lucide-react";

interface PendingApprovalPanelProps {
  isPendingApproval: boolean;
  onDismissStatus: () => void;
}

export function PendingApprovalPanel({ isPendingApproval, onDismissStatus }: PendingApprovalPanelProps) {
  return (
    <AnimatePresence>
      {isPendingApproval && (
        <motion.div
          key="pending-panel"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border-2 overflow-hidden"
          style={{ borderColor: "var(--surface-blue-tint-sm)", background: "var(--surface-toast-blue)" }}
        >
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, var(--color-blue), var(--color-blue-700))" }} />
          <div className="px-4 py-4">
            <div className="flex flex-col items-center text-center mb-3">
              <motion.div
                animate={{ rotate: [0, -6, 6, -6, 6, 0] }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                style={{ background: "linear-gradient(135deg, var(--color-blue), var(--color-blue-700))" }}
              >
                <Clock className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="text-base font-bold" style={{ color: "var(--color-blue-700)" }}>Awaiting Approval</h3>
              <p className="text-xs mt-1" style={{ color: "var(--brand-navy-500)" }}>
                Your registration is pending admin review. You'll be able to log in once approved.
              </p>
            </div>

            <div
              className="rounded-xl px-3 py-2.5 mb-3 border flex items-start gap-2.5"
              style={{ background: "rgba(59,130,246,0.07)", borderColor: "var(--surface-blue-tint-sm)" }}
            >
              <MailCheck className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--color-blue)" }} />
              <p className="text-xs leading-relaxed" style={{ color: "var(--brand-navy-500)" }}>
                You'll receive a notification once the administrator reviews your request. Check back later or contact your CSC admin directly.
              </p>
            </div>

            <button
              type="button"
              onClick={onDismissStatus}
              className="w-full h-10 rounded-xl font-semibold text-sm border-2 transition-colors"
              style={{ borderColor: "var(--surface-blue-tint-sm)", color: "var(--color-blue-700)", background: "transparent" }}
            >
              ← Back to login
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
