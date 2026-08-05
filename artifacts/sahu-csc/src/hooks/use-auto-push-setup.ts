import { useEffect, useRef } from "react";
import { usePushNotifications } from "./use-push-notifications";

const PROMPTED_KEY = "sahu-push-prompted";

/**
 * Automatically requests push-notification permission on the first dashboard
 * load and subscribes to PushManager immediately if the user taps "Allow".
 *
 * Rules:
 *  - Only shows the native browser prompt ONCE (localStorage flag).
 *  - If Notification.permission is already "granted" but the device has no
 *    active PushManager subscription yet (e.g. the user cleared app data),
 *    silently re-subscribes without showing any prompt.
 *  - Does nothing when permission is "denied" or push is unsupported.
 */
export function useAutoPushSetup() {
  const { status, subscribe } = usePushNotifications();
  const ran = useRef(false);

  useEffect(() => {
    // Wait until usePushNotifications has resolved the initial status check.
    if (status === "loading" || status === "unsupported" || status === "denied" || status === "subscribed") return;
    // Only run once per component lifetime even if status flickers.
    if (ran.current) return;
    ran.current = true;

    if (typeof Notification === "undefined") return;

    async function run() {
      if (Notification.permission === "granted") {
        // Permission was already granted (e.g. via PermissionCard or a previous
        // session) but there's no active push subscription — re-subscribe silently.
        await subscribe();
        return;
      }

      if (Notification.permission === "default") {
        const alreadyPrompted = localStorage.getItem(PROMPTED_KEY) === "true";
        if (!alreadyPrompted) {
          // First time on this device — mark so we never show the native prompt again,
          // then show it. subscribe() calls requestPermission() internally and, if
          // the user taps "Allow", immediately registers the PushManager subscription.
          localStorage.setItem(PROMPTED_KEY, "true");
          await subscribe();
        }
      }
    }

    void run();
  }, [status, subscribe]);
}
