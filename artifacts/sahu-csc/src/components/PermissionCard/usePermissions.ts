import { useCallback, useState } from "react";

// ─── Permission request state machine ───────────────────────────────────────
// "skipped" = platform doesn't support the API (e.g. Notification on iOS
// Safari) — treated the same as granted/denied for continue-gating purposes.
export type PermStatus = "idle" | "requesting" | "granted" | "denied" | "skipped";

// Safety-net timeout for permission prompts. Some browsers/embeds (e.g. a
// cross-origin iframe without the feature delegated via Permissions-Policy)
// never invoke either the success or error callback, which would leave the
// Continue button permanently disabled. Forcing a fallback resolution keeps
// the flow moving no matter how the underlying browser API behaves.
const SAFETY_TIMEOUT_MS = 10000;

export function usePermissions() {
  const [locationStatus, setLocationStatus] = useState<PermStatus>("idle");
  const [notifStatus, setNotifStatus] = useState<PermStatus>("idle");
  const [fileStatus, setFileStatus] = useState<PermStatus>("idle");

  const requestLocation = useCallback(async (): Promise<PermStatus> => {
    setLocationStatus("requesting");

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocationStatus("skipped");
      localStorage.setItem("perm_location", "skipped");
      return "skipped";
    }

    const geoPromise = new Promise<PermStatus>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve("granted"),
        () => resolve("denied"),
        { timeout: 8000, maximumAge: 60000 },
      );
    });
    const fallback = new Promise<PermStatus>((resolve) => {
      window.setTimeout(() => resolve("denied"), SAFETY_TIMEOUT_MS);
    });

    const result = await Promise.race([geoPromise, fallback]);
    setLocationStatus(result);
    localStorage.setItem("perm_location", result);
    return result;
  }, []);

  const requestNotifications = useCallback(async (): Promise<PermStatus> => {
    setNotifStatus("requesting");

    if (typeof Notification === "undefined") {
      setNotifStatus("skipped");
      localStorage.setItem("perm_notifications", "skipped");
      return "skipped";
    }

    try {
      const fallback = new Promise<NotificationPermission>((resolve) => {
        window.setTimeout(() => resolve(Notification.permission), SAFETY_TIMEOUT_MS);
      });
      const permission = await Promise.race([Notification.requestPermission(), fallback]);
      const result: PermStatus = permission === "granted" ? "granted" : "denied";
      setNotifStatus(result);
      localStorage.setItem("perm_notifications", result);
      return result;
    } catch {
      setNotifStatus("denied");
      localStorage.setItem("perm_notifications", "denied");
      return "denied";
    }
  }, []);

  // File Manager — unlike Location/Notifications, file access in a web app
  // has no real browser permission gate that can be "denied" system-wide.
  // showOpenFilePicker / <input type="file"> both require an active user
  // gesture, but by the time this is called in the auto-sequence (after
  // awaiting location + notification prompts) the original click activation
  // has expired, so showOpenFilePicker throws a "not user-activated" error
  // which the old code mapped to "denied". We therefore auto-grant file
  // access in the sequential flow — the file picker itself still works fine
  // everywhere that matters (upload buttons, etc.).
  const requestFileManager = useCallback((): Promise<PermStatus> => {
    setFileStatus("granted");
    localStorage.setItem("perm_files", "granted");
    return Promise.resolve("granted" as PermStatus);
  }, []);

  return {
    locationStatus,
    notifStatus,
    fileStatus,
    requestLocation,
    requestNotifications,
    requestFileManager,
    setLocationStatus,
    setNotifStatus,
    setFileStatus,
  };
}
