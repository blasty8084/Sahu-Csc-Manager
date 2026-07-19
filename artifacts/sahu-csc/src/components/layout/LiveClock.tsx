import React, { useState, useEffect } from "react";

/**
 * Isolated clock component — has its own state so ticking every second
 * only re-renders this tiny span, not the entire Layout tree.
 */
export const LiveClock = React.memo(function LiveClock({ style }: { style?: React.CSSProperties }) {
  const [time, setTime] = useState(() => {
    const n = new Date();
    return n.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  });

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <span style={style}>{time}</span>;
});
