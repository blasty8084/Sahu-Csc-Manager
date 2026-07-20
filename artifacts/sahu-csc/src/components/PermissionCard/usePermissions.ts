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

  // ── Pre-check: read current browser permission state WITHOUT requesting ──
  // Call this on mount. If a permission is already granted or denied in the
  // browser, reflect that immediately so the user doesn't need to tap "Allow"
  // for something already decided, and doesn't see a confusing instant-denial.
  const initializeFromBrowser = useCallback(async () => {
    // Location
    if (typeof navigator !== "undefined" && "permissions" in navigator) {
      try {
        const locPerm = await navigator.permissions.query({ name: "geolocation" });
        if (locPerm.state === "granted") {
          setLocationStatus("granted");
          localStorage.setItem("perm_location", "granted");
        } else if (locPerm.state === "denied") {
          setLocationStatus("denied");
          localStorage.setItem("perm_location", "denied");
        }
        // "prompt" → keep "idle" so the Allow button shows
      } catch { /* permissions API not supported — keep idle */ }
    }

    // Notifications
    if (typeof Notification !== "undefined") {
      if (Notification.permission === "granted") {
        setNotifStatus("granted");
        localStorage.setItem("perm_notifications", "granted");
      } else if (Notification.permission === "denied") {
        setNotifStatus("denied");
        localStorage.setItem("perm_notifications", "denied");
      }
      // "default" → keep "idle"
    }

    // File Manager has no queryable API — keep "idle"
  }, []);

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

  // File Manager now behaves like Location/Notifications: picking a file =
  // "granted", cancelling/dismissing the picker = "denied" — a real
  // granted/denied outcome instead of always resolving to "granted".
  //
  // Chrome/Edge/Opera (desktop + Android) support the File System Access
  // API (`showOpenFilePicker`), which actually distinguishes the two cases:
  // it resolves when a file is chosen and rejects with an AbortError when
  // the user cancels. We use that for a real signal there.
  //
  // Safari/Firefox and older browsers have no such API — the classic
  // `<input type="file">` never fires a reliable "cancelled" event across
  // all of them, so there we fall back to the old behaviour (open the
  // picker, treat any settle as granted) since no real signal exists.
  const requestFileManager = useCallback((): Promise<PermStatus> => {
    setFileStatus("requesting");

    const settleWith = (status: PermStatus) => {
      setFileStatus(status);
      localStorage.setItem("perm_files", status);
      return status;
    };

    if (typeof window === "undefined" || typeof document === "undefined") {
      return Promise.resolve(settleWith("skipped"));
    }

    // Preferred path: File System Access API — real granted/denied signal.
    if (typeof (window as any).showOpenFilePicker === "function") {
      const pickerPromise = (async (): Promise<PermStatus> => {
        try {
          await (window as any).showOpenFilePicker({
            multiple: true,
            excludeAcceptAllOption: false,
          });
          return "granted";
        } catch (err: any) {
          // AbortError = user dismissed/cancelled the picker → denied.
          if (err?.name === "AbortError") return "denied";
          // Anything else (e.g. not user-activated) — fall back to denied
          // rather than leaving the row stuck.
          return "denied";
        }
      })();

      const fallback = new Promise<PermStatus>((resolve) => {
        window.setTimeout(() => resolve("denied"), SAFETY_TIMEOUT_MS);
      });

      return Promise.race([pickerPromise, fallback]).then(settleWith);
    }

    // Fallback path: classic hidden <input type="file"> for browsers
    // without the File System Access API (Safari, Firefox, most mobile).
    // Position it at opacity:0 in the top-left corner (NOT off-screen at
    // -1000px) — Android Chrome blocks programmatic .click() on inputs
    // that are positioned outside the viewport.
    return new Promise<PermStatus>((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*,application/pdf,.doc,.docx,.xls,.xlsx,*/*";
      input.multiple = true;
      // Keep within viewport so Android Chrome doesn't block .click()
      input.style.cssText =
        "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1;";

      let settled = false;
      let fallbackTimer: number;
      const settle = (status: PermStatus) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(fallbackTimer);
        input.remove();
        resolve(settleWith(status));
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
    initializeFromBrowser,
    setLocationStatus,
    setNotifStatus,
    setFileStatus,
  };
}
