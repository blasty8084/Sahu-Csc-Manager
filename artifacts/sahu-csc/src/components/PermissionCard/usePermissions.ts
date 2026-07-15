import { useCallback, useState } from "react";

// ─── Permission request state machine ───────────────────────────────────────
// "skipped" = platform doesn't support the API (e.g. Notification on iOS
// Safari) — treated the same as granted/denied for continue-gating purposes.
export type PermStatus = "idle" | "requesting" | "granted" | "denied" | "skipped";

export function usePermissions() {
  const [locationStatus, setLocationStatus] = useState<PermStatus>("idle");
  const [notifStatus, setNotifStatus] = useState<PermStatus>("idle");

  const requestLocation = useCallback(async (): Promise<PermStatus> => {
    setLocationStatus("requesting");

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocationStatus("skipped");
      localStorage.setItem("perm_location", "skipped");
      return "skipped";
    }

    const result = await new Promise<PermStatus>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve("granted"),
        () => resolve("denied"),
        { timeout: 8000 },
      );
    });

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
      const permission = await Notification.requestPermission();
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

  return {
    locationStatus,
    notifStatus,
    requestLocation,
    requestNotifications,
    setLocationStatus,
    setNotifStatus,
  };
}
