import type { CSSProperties } from "react";

export function Pulse({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={`animate-pulse rounded bg-slate-100 dark:bg-zinc-700 ${className ?? ""}`} style={style} />;
}
