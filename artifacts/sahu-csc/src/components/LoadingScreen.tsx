import { motion } from "framer-motion";
import { usePerformanceTier } from "@/hooks/use-performance-tier";
import type { LoadingPhase } from "@/hooks/use-auth";

// ─── Full-screen loading (used while auth is resolving) ───────────────────────
export function LoadingScreen({ phase = "loading" }: { phase?: LoadingPhase }) {
  const { richAnimations, scaleDuration } = usePerformanceTier();
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none"
      style={{ background: "linear-gradient(160deg, var(--brand-navy-900) 0%, var(--brand-navy-800) 60%, var(--brand-navy-750) 100%)" }}
    >
      {/* Radial glow behind logo */}
      <div
        className="absolute"
        style={{
          width: 260, height: 260,
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--brand-orange-tint-xs) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo + spinner */}
      <motion.div
        initial={{ scale: 0.82, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: scaleDuration(220) / 1000, ease: "easeOut" }}
        className="relative flex items-center justify-center"
      >
        {/* Outer ring — stops on timeout; rotation loop skipped on low-end devices to save CPU */}
        {phase !== "timeout" && richAnimations ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute w-32 h-32 rounded-full"
            style={{
              border: "2.5px solid transparent",
              borderTopColor: "var(--brand-orange)",
              borderRightColor: "var(--brand-orange-tint-md)",
              borderBottomColor: "transparent",
              borderLeftColor: "var(--brand-orange-tint-xs)",
              willChange: "transform",
            }}
          />
        ) : phase !== "timeout" ? (
          <div
            className="absolute w-32 h-32 rounded-full animate-pulse"
            style={{ border: "2.5px solid var(--brand-orange-border)" }}
          />
        ) : (
          <div
            className="absolute w-32 h-32 rounded-full"
            style={{ border: "2.5px solid var(--brand-orange-tint-md)" }}
          />
        )}

        {/* Inner glow ring */}
        <div
          className="absolute w-28 h-28 rounded-full"
          style={{ background: "radial-gradient(circle, var(--brand-orange-tint-xs) 0%, transparent 70%)" }}
        />

        {/* Logo */}
        <div
          className="w-24 h-24 rounded-full overflow-hidden"
          style={{
            border: "3px solid var(--brand-white-mid)",
            boxShadow: "0 0 32px var(--brand-orange-tint-md), 0 8px 32px var(--brand-black-overlay)",
          }}
        >
          <img src="/sahu-logo.png" alt="SAHU CSC" className="w-full h-full object-cover" />
        </div>
      </motion.div>

      {/* Brand name + status */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.2 }}
        className="mt-7 text-center"
      >
        <h1 className="text-2xl font-black tracking-wide">
          <span className="text-white">SAHU </span>
          <span style={{ color: "var(--brand-orange)" }}>CSC</span>
        </h1>
        <p className="text-white/35 text-[10px] tracking-widest uppercase mt-0.5">
          Management Platform
        </p>

        <div className="mt-4 min-h-[36px] flex flex-col items-center justify-center">
          {phase === "loading" && (
            richAnimations ? (
              <motion.div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="rounded-full"
                    style={{ width: 5, height: 5, background: "var(--brand-orange-glow)" }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-full animate-pulse"
                    style={{ width: 5, height: 5, background: "var(--brand-orange-glow)" }}
                  />
                ))}
              </div>
            )
          )}

          {phase === "slow" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1 text-center">
              <p className="text-white/60 text-xs">Server is starting up…</p>
              <p className="text-white/30 text-[10px]">This may take a few seconds</p>
            </motion.div>
          )}

          {phase === "timeout" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 text-center">
              <p className="text-white/55 text-xs">Server is taking too long</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs font-bold px-5 py-2 rounded-full"
                style={{ background: "linear-gradient(90deg, var(--brand-orange), var(--brand-orange-400))", color: "#fff", boxShadow: "0 4px 14px var(--brand-orange-glow)" }}
              >
                Retry
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Bottom progress bar — animated sweep on capable devices, static fill on low-end */}
      {phase !== "timeout" && (
        <div
          className="absolute overflow-hidden rounded-full"
          style={{ bottom: 56, width: 56, height: 2, background: "var(--brand-white-low)" }}
        >
          {richAnimations ? (
            <motion.div
              className="w-full h-full rounded-full"
              style={{ background: "linear-gradient(90deg, var(--brand-orange), var(--brand-orange-tint-soft))" }}
              animate={{ x: ["-100%", "0%", "100%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : (
            <div
              className="w-full h-full rounded-full animate-pulse"
              style={{ background: "linear-gradient(90deg, var(--brand-orange), var(--brand-orange-tint-soft))" }}
            />
          )}
        </div>
      )}

      {/* Version tag */}
      <p className="absolute text-white/18 text-[10px] tracking-wider" style={{ bottom: 28 }}>
        CSC · Odisha
      </p>
    </div>
  );
}
