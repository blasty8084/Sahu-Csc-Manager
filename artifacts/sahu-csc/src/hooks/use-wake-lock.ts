import { useState, useEffect, useCallback, useRef } from "react";

export interface WakeLockState {
  isActive: boolean;
  isSupported: boolean;
  acquire: () => Promise<boolean>;
  release: () => Promise<void>;
}

export function useWakeLock(): WakeLockState {
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<any>(null);
  const isSupported = typeof navigator !== "undefined" && "wakeLock" in navigator;

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {}
      wakeLockRef.current = null;
      setIsActive(false);
    }
  }, []);

  const acquire = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    try {
      wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
      setIsActive(true);
      wakeLockRef.current.addEventListener("release", () => {
        wakeLockRef.current = null;
        setIsActive(false);
      });
      return true;
    } catch {
      return false;
    }
  }, [isSupported]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && isActive && !wakeLockRef.current) {
        await acquire();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isActive, acquire]);

  useEffect(() => {
    return () => { release(); };
  }, [release]);

  return { isActive, isSupported, acquire, release };
}
