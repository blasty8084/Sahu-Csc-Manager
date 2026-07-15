import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Bell, FolderOpen, ShieldCheck, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

// ─── Fullscreen, non-skippable, 2-step first-login permission flow ──────────
// Step 1: Notification permission (push alerts for ledger/AePS/etc. events).
// Step 2: File-access acknowledgement (needed for receipt/report downloads
//         and CSV/PDF exports — browsers have no generic "grant file access"
//         permission prompt, so this step explains and confirms the behavior
//         rather than calling a nonexistent API).
// On completion, PATCHes the server so this never shows again for this user.

type Step = "notifications" | "files";

async function apiPatch(path: string) {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
  const res = await fetch(`${base}/api${path}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to save");
  return res.json().catch(() => ({}));
}

export function FirstLoginOverlay() {
  const [step, setStep] = useState<Step>("notifications");
  const [notifStatus, setNotifStatus] = useState<NotificationPermission | "unsupported">(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported",
  );
  const [isFinishing, setIsFinishing] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleRequestNotifications = async () => {
    if (typeof Notification === "undefined") {
      setNotifStatus("unsupported");
      setStep("files");
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setNotifStatus(result);
    } catch {
      setNotifStatus("denied");
    }
    setStep("files");
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      await apiPatch("/users/first-login-completed");
      queryClient.setQueryData(getGetMeQueryKey(), (prev: any) => prev ? { ...prev, firstLoginCompleted: true } : prev);
    } catch {
      // Even if the PATCH fails (e.g. offline), don't trap the user — retry
      // will happen next login since the server flag stays false.
      queryClient.setQueryData(getGetMeQueryKey(), (prev: any) => prev ? { ...prev, firstLoginCompleted: true } : prev);
    } finally {
      setIsFinishing(false);
    }
  };

  if (!user) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-5"
      style={{ background: "linear-gradient(160deg, #080f2e 0%, #0b2c60 60%, #0f1f4a 100%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(["notifications", "files"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full transition-colors"
                style={{ background: step === s ? "#F97316" : i < (step === "files" ? 1 : 0) ? "#F97316" : "rgba(255,255,255,0.25)" }}
              />
              {i === 0 && <div className="w-8 h-px" style={{ background: "rgba(255,255,255,0.25)" }} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === "notifications" ? (
            <motion.div
              key="notif-step"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl shadow-2xl px-7 py-8 text-center"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
              >
                <Bell className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Stay Notified</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Enable notifications to get real-time alerts for ledger entries, AePS transactions,
                and important account activity.
              </p>
              <Button
                onClick={handleRequestNotifications}
                className="w-full h-12 mt-6 font-bold text-base text-white shadow-lg border-0"
                style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}
              >
                Enable Notifications <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <p className="text-xs text-gray-400 mt-3">You'll be asked once — this can be changed later in your browser settings.</p>
            </motion.div>
          ) : (
            <motion.div
              key="files-step"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl shadow-2xl px-7 py-8 text-center"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"
                style={{ background: "linear-gradient(135deg, #0b2c60, #1d4ed8)" }}
              >
                <FolderOpen className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">File & Download Access</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                SAHU CSC saves receipts, reports, and exports (CSV/PDF) to your device's downloads.
                Your browser may ask to confirm this the first time you export something.
              </p>
              <div className="mt-4 flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-left">
                <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-xs text-green-700 font-medium">Files stay on your device — nothing is shared without your action.</span>
              </div>
              <Button
                onClick={handleFinish}
                disabled={isFinishing}
                className="w-full h-12 mt-6 font-bold text-base text-white shadow-lg border-0"
                style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}
              >
                {isFinishing ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Saving…</span> : "Continue to Dashboard"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
