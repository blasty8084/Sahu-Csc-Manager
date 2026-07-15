import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, FolderOpen, Loader2, MapPin, ShieldCheck, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { PermissionRow } from "./PermissionRow";
import { usePermissions } from "./usePermissions";

// ─── Permission Card — modal overlay shown once after first successful login ─
// Step 1: "Permissions Required" intro — Location + Notifications + File
//         Manager rows, each with its own "Allow" button, plus Continue /
//         Skip for now / X close.
// Step 2: "Setting up Permissions" — requests fire one at a time (never
//         simultaneously); rows update live (Requesting… → Allowed/Denied).
// Continue is disabled until every permission has been attempted (granted,
// denied, or skipped all count — see ATTEMPTED below and the safety-net
// timeouts in usePermissions, which guarantee no request can hang forever
// and leave Continue stuck). Skip / X still marks first_login_completed =
// true so the card never reappears. iOS Safari has no Notification API, so
// that step is skipped silently and treated as already satisfied. File
// Manager now behaves like Location/Notifications — picking a file counts
// as granted, cancelling the picker counts as denied — using the File
// System Access API where supported (Chrome/Edge/Opera), with a same-as-
// before "any interaction = granted" fallback on browsers without it
// (Safari/Firefox), since no real cancel signal exists there.

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

function isIOSSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iP(hone|ad|od)/.test(ua) && /WebKit/.test(ua) && !/CriOS|FxiOS/.test(ua);
}

const ATTEMPTED: ReadonlyArray<string> = ["granted", "denied", "skipped"];

export function PermissionCard() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isFinishing, setIsFinishing] = useState(false);
  const {
    locationStatus,
    notifStatus,
    fileStatus,
    requestLocation,
    requestNotifications,
    requestFileManager,
  } = usePermissions();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const skipNotifications = isIOSSafari();
  const canContinue =
    ATTEMPTED.includes(locationStatus) &&
    (skipNotifications || ATTEMPTED.includes(notifStatus)) &&
    ATTEMPTED.includes(fileStatus);

  const finish = async () => {
    setIsFinishing(true);
    try {
      await apiPatch("/users/first-login-completed");
    } catch {
      // Even if the PATCH fails (e.g. offline), don't trap the user — the
      // server flag stays false, so it will simply be retried next login.
    } finally {
      queryClient.setQueryData(getGetMeQueryKey(), (prev: any) =>
        prev ? { ...prev, firstLoginCompleted: true } : prev,
      );
      setIsFinishing(false);
    }
  };

  const handleSkip = () => {
    void finish();
  };

  const handleContinueStep1 = async () => {
    setStep(2);
    await requestLocation();
    if (!skipNotifications) {
      await requestNotifications();
    }
    await requestFileManager();
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-[360px] bg-white rounded-2xl shadow-xl px-6 py-6"
      >
        {step === 1 && (
          <button
            type="button"
            onClick={handleSkip}
            aria-label="Close"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto -mt-14 mb-3 shadow-sm ring-4 ring-white"
          style={{ background: "#EEF0FF" }}
        >
          <ShieldCheck className="w-8 h-8" style={{ color: "#4F46E5" }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <h2 className="text-lg font-bold text-gray-900 text-center">
              {step === 1 ? "Permissions Required" : "Setting up Permissions"}
            </h2>
            <p className="text-xs text-gray-500 text-center mt-1 leading-relaxed">
              {step === 1
                ? "To provide you the best experience, allow the following permissions."
                : "Please allow the following permissions to continue."}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 border border-gray-100 rounded-xl px-3">
          <PermissionRow
            icon={MapPin}
            iconBg="#DCFCE7"
            iconColor="#16A34A"
            title="Location"
            description="Needed to check nearby services and availability."
            status={locationStatus}
            onAllow={requestLocation}
            showDivider
          />
          {!skipNotifications && (
            <PermissionRow
              icon={Bell}
              iconBg="#EEF0FF"
              iconColor="#4F46E5"
              title="Notifications"
              description="Get important updates and transaction alerts."
              status={notifStatus}
              onAllow={requestNotifications}
              showDivider
            />
          )}
          <PermissionRow
            icon={FolderOpen}
            iconBg="#FEF3C7"
            iconColor="#D97706"
            title="File Manager"
            description="Access photos and files for receipts, uploads, and exports."
            status={fileStatus}
            onAllow={requestFileManager}
          />
        </div>

        <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mt-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          {step === 1 ? "Your data is safe and secure with us." : "We only use permissions to improve your experience."}
        </p>

        <button
          type="button"
          onClick={step === 1 ? handleContinueStep1 : finish}
          disabled={step === 2 && (!canContinue || isFinishing)}
          className="w-full h-11 mt-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #4F46E5, #4338CA)" }}
        >
          {isFinishing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" /> Continue
            </>
          )}
        </button>

        {step === 1 && (
          <button
            type="button"
            onClick={handleSkip}
            className="w-full text-center text-xs text-gray-500 mt-3"
          >
            Skip for now
          </button>
        )}
      </motion.div>
    </div>
  );
}
