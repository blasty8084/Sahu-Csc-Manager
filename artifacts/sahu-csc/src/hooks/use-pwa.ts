import { useState, useEffect, useCallback } from "react";
import { useNetworkStatus } from "./use-network-status";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

export interface PWACapabilities {
  badging: boolean;
  wakeLock: boolean;
  periodicSync: boolean;
  shareTarget: boolean;
  notifications: boolean;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  isSlow: boolean;
  notificationPermission: NotificationPermission;
  capabilities: PWACapabilities;
  promptInstall: () => Promise<boolean>;
  setBadge: (count: number) => void;
  clearBadge: () => void;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  registerPeriodicSync: (tag: string, minInterval: number) => Promise<boolean>;
  share: (data: ShareData) => Promise<boolean>;
}

export function usePWA(): PWAState {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const { isOffline, isSlow } = useNetworkStatus();

  const capabilities: PWACapabilities = {
    badging: typeof navigator !== "undefined" && "setAppBadge" in navigator,
    wakeLock: typeof navigator !== "undefined" && "wakeLock" in navigator,
    periodicSync: typeof ServiceWorkerRegistration !== "undefined" && "periodicSync" in ServiceWorkerRegistration.prototype,
    shareTarget: typeof navigator !== "undefined" && "share" in navigator,
    notifications: typeof Notification !== "undefined",
  };

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      clearBadge();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    if (!installPrompt) return false;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
      setIsInstalled(true);
    }
    return outcome === "accepted";
  };

  const setBadge = useCallback((count: number) => {
    if (!capabilities.badging) return;
    try {
      if (count > 0) {
        (navigator as any).setAppBadge(count);
      } else {
        (navigator as any).clearAppBadge();
      }
    } catch {}
  }, [capabilities.badging]);

  const clearBadge = useCallback(() => {
    if (!capabilities.badging) return;
    try { (navigator as any).clearAppBadge(); } catch {}
  }, [capabilities.badging]);

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!capabilities.notifications) return "denied";
    if (Notification.permission === "granted") return "granted";
    const result = await Notification.requestPermission();
    setNotificationPermission(result);
    return result;
  }, [capabilities.notifications]);

  const registerPeriodicSync = useCallback(async (tag: string, minInterval: number): Promise<boolean> => {
    if (!capabilities.periodicSync) return false;
    try {
      const reg = await navigator.serviceWorker.ready;
      await (reg as any).periodicSync.register(tag, { minInterval });
      return true;
    } catch {
      return false;
    }
  }, [capabilities.periodicSync]);

  const share = useCallback(async (data: ShareData): Promise<boolean> => {
    if (!capabilities.shareTarget) return false;
    try {
      await navigator.share(data);
      return true;
    } catch {
      return false;
    }
  }, [capabilities.shareTarget]);

  return {
    isInstallable: !!installPrompt && !isInstalled,
    isInstalled,
    isOffline,
    isSlow,
    notificationPermission,
    capabilities,
    promptInstall,
    setBadge,
    clearBadge,
    requestNotificationPermission,
    registerPeriodicSync,
    share,
  };
}
