import { useState, useEffect, useCallback } from "react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export type PushStatus = "loading" | "unsupported" | "denied" | "default" | "subscribed";

export interface UsePushNotifications {
  status: PushStatus;
  isLoading: boolean;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
}

export function usePushNotifications(): UsePushNotifications {
  const [status, setStatus] = useState<PushStatus>("loading");
  const [isLoading, setIsLoading] = useState(false);

  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  useEffect(() => {
    if (!isSupported) { setStatus("unsupported"); return; }
    if (Notification.permission === "denied") { setStatus("denied"); return; }
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setStatus(sub ? "subscribed" : "default");
    });
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setStatus("denied"); return false; }

      const keyRes = await fetch("/api/push/vapid-public-key");
      if (!keyRes.ok) return false;
      const { publicKey } = await keyRes.json() as { publicKey: string };

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer,
      });

      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth }),
      });
      if (res.ok) { setStatus("subscribed"); return true; }
      return false;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) { setStatus("default"); return true; }
      await fetch("/api/push/unsubscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
      setStatus("default");
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { status, isLoading, subscribe, unsubscribe };
}
