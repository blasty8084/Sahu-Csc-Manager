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

  // Browsers have no standing "permission" API for generic photo/file
  // access — the native file/photo picker IS the permission surface (the OS
  // itself handles photo-library consent on mobile). We treat opening it as
  // the request and any interaction with it (pick or cancel) as satisfied,
  // since there's no signal to distinguish "denied" from "user cancelled".
  const requestFileManager = useCallback((): Promise<PermStatus> => {
    setFileStatus("requesting");

    return new Promise<PermStatus>((resolve) => {
      if (typeof document === "undefined") {
        setFileStatus("skipped");
        localStorage.setItem("perm_files", "skipped");
        resolve("skipped");
        return;
      }

      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*,application/pdf,.doc,.docx,.xls,.xlsx,*/*";
      input.multiple = true;
      input.style.position = "fixed";
      input.style.top = "-1000px";
      input.style.left = "-1000px";

      let settled = false;
      let fallbackTimer: number;
      const settle = (status: PermStatus) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(fallbackTimer);
        setFileStatus(status);
        localStorage.setItem("perm_files", status);
        input.remove();
        resolve(status);
      };

      input.addEventListener("change", () => settle("granted"));
      input.addEventListener("cancel", () => settle("granted"));

      // Safety net: not every browser fires "cancel" on a file input, so
      // auto-resolve after a pause to guarantee Continue never gets stuck.
      fallbackTimer = window.setTimeout(() => settle("granted"), SAFETY_TIMEOUT_MS);

      document.body.appendChild(input);
      input.click();
    });
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
