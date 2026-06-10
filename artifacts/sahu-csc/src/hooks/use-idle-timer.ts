import { useEffect, useRef, useState, useCallback } from "react";

const IDLE_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove", "mousedown", "keydown", "touchstart",
  "scroll", "click", "wheel", "pointerdown",
];

export interface IdleTimerState {
  isWarning: boolean;
  remaining: number;
  resetTimer: () => void;
}

/**
 * Tracks user inactivity.
 * @param timeoutMs   Total idle timeout (default 30 min)
 * @param warningMs   How many ms before expiry to start warning (default 2 min)
 * @param onIdle      Called when the timeout fires
 */
export function useIdleTimer(
  timeoutMs = 30 * 60 * 1000,
  warningMs = 2 * 60 * 1000,
  onIdle?: () => void
): IdleTimerState {
  const [isWarning, setIsWarning] = useState(false);
  const [remaining, setRemaining] = useState(timeoutMs);

  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiresAt = useRef<number>(Date.now() + timeoutMs);
  const onIdleRef = useRef(onIdle);

  useEffect(() => { onIdleRef.current = onIdle; }, [onIdle]);

  const clearAllTimers = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (warnTimer.current) clearTimeout(warnTimer.current);
    if (tickTimer.current) clearInterval(tickTimer.current);
  }, []);

  const startTick = useCallback(() => {
    if (tickTimer.current) clearInterval(tickTimer.current);
    tickTimer.current = setInterval(() => {
      const left = Math.max(0, expiresAt.current - Date.now());
      setRemaining(left);
    }, 1000);
  }, []);

  const resetTimer = useCallback(() => {
    clearAllTimers();
    setIsWarning(false);

    const now = Date.now();
    expiresAt.current = now + timeoutMs;
    setRemaining(timeoutMs);

    // Warning timer
    warnTimer.current = setTimeout(() => {
      setIsWarning(true);
      startTick();
    }, timeoutMs - warningMs);

    // Idle timer
    idleTimer.current = setTimeout(() => {
      clearAllTimers();
      setIsWarning(false);
      onIdleRef.current?.();
    }, timeoutMs);
  }, [timeoutMs, warningMs, clearAllTimers, startTick]);

  useEffect(() => {
    resetTimer();

    const handleActivity = () => resetTimer();

    IDLE_EVENTS.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));

    return () => {
      clearAllTimers();
      IDLE_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity));
    };
  }, [resetTimer, clearAllTimers]);

  return { isWarning, remaining, resetTimer };
}
