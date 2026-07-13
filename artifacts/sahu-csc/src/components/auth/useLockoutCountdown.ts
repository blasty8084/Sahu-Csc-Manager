import { useState, useRef, useEffect } from "react";

export function useLockoutCountdown(lockoutUntil: Date | null, onExpired: () => void) {
  const [remaining, setRemaining] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!lockoutUntil) { setRemaining(0); return; }
    const tick = () => {
      const ms = lockoutUntil.getTime() - Date.now();
      if (ms <= 0) {
        setRemaining(0);
        if (timerRef.current) clearInterval(timerRef.current);
        onExpired();
      } else {
        setRemaining(Math.ceil(ms / 1000));
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [lockoutUntil, onExpired]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const LOCK_TOTAL_SECS = 15 * 60;
  const progress = lockoutUntil ? Math.max(0, remaining / LOCK_TOTAL_SECS) : 0;

  return { remaining, display, progress };
}
