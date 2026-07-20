import { useEffect, useState } from "react";
import { Bell, FolderOpen, Loader2, MapPin, ShieldCheck, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { PermissionRow } from "./PermissionRow";
import { usePermissions } from "./usePermissions";

// ─── Permission Card — modal overlay shown once after first successful login ─
// Step 1: "Permissions Required" intro
// Step 2: Requests fire one at a time; rows animate live (Requesting → Allowed/Denied).
// Auto-finishes once all permissions are attempted. Continue is never needed.

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
    initializeFromBrowser,
  } = usePermissions();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    void initializeFromBrowser();
  }, [initializeFromBrowser]);

  const skipNotifications = isIOSSafari();

  // Progress: count how many are done out of total
  const total = skipNotifications ? 2 : 3;
  const done = [
    ATTEMPTED.includes(locationStatus),
    skipNotifications ? true : ATTEMPTED.includes(notifStatus),
    ATTEMPTED.includes(fileStatus),
  ].filter(Boolean).length;
  const progressPct = step === 1 ? 0 : Math.round((done / total) * 100);
  const canContinue =
    ATTEMPTED.includes(locationStatus) &&
    (skipNotifications || ATTEMPTED.includes(notifStatus)) &&
    ATTEMPTED.includes(fileStatus);

  const finish = async () => {
    setIsFinishing(true);
    try {
      await apiPatch("/users/first-login-completed");
    } catch {
      // Even if the PATCH fails (offline), don't trap the user.
    } finally {
      queryClient.setQueryData(["auth/me"], (prev: any) =>
        prev ? { ...prev, firstLoginCompleted: true } : prev,
      );
      setIsFinishing(false);
    }
  };

  const handleSkip = () => void finish();

  const handleContinueStep1 = async () => {
    setStep(2);
    await requestLocation();
    if (!skipNotifications) await requestNotifications();
    await requestFileManager();
    await finish();
  };

  if (!user) return null;

  return (
    // Plain semi-transparent backdrop — no backdrop-blur (too GPU-heavy on mobile)
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-5"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          // GPU-composited entry animation via CSS
          animation: "perm-card-in 0.22s cubic-bezier(0.34,1.56,0.64,1) both",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Progress fill bar — grows as permissions are granted */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: 3,
            width: `${progressPct}%`,
            background: "linear-gradient(90deg, #4F46E5, #818CF8)",
            borderRadius: "0 2px 2px 0",
            transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
          }}
        />

        <div className="px-6 py-6">
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

          {/* Title — crossfades between steps with pure CSS */}
          <div style={{ position: "relative", height: 52, overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: step === 1 ? 1 : 0,
                transform: step === 1 ? "translateY(0)" : "translateY(-8px)",
                transition: "opacity 0.18s ease, transform 0.18s ease",
                textAlign: "center",
              }}
            >
              <h2 className="text-lg font-bold text-gray-900">Permissions Required</h2>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                To provide you the best experience, allow the following permissions.
              </p>
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: step === 2 ? 1 : 0,
                transform: step === 2 ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.18s ease 0.1s, transform 0.18s ease 0.1s",
                textAlign: "center",
              }}
            >
              <h2 className="text-lg font-bold text-gray-900">Setting up Permissions</h2>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Please allow the following permissions to continue.
              </p>
            </div>
          </div>

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
            {step === 1
              ? "Your data is safe and secure with us."
              : "We only use permissions to improve your experience."}
          </p>

          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={handleContinueStep1}
                className="w-full h-11 mt-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-md active:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #4F46E5, #4338CA)",
                  // Use transform for press effect — no layout shift
                  transition: "transform 0.1s ease",
                }}
                onPointerDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
                onPointerUp={e => (e.currentTarget.style.transform = "scale(1)")}
                onPointerLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                <ShieldCheck className="w-4 h-4" /> Continue
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="w-full text-center text-xs text-gray-500 mt-3"
              >
                Skip for now
              </button>
            </>
          ) : (
            <div
              className="w-full h-11 mt-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #4F46E5, #4338CA)",
                opacity: canContinue ? 0.7 : 0.85,
                transition: "opacity 0.3s ease",
              }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              {isFinishing ? "Saving…" : "Setting up…"}
            </div>
          )}
        </div>
      </div>

      {/* Keyframe for card entry — defined once globally via a style tag */}
      <style>{`
        @keyframes perm-card-in {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  );
}
