import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  visible: boolean;
  onDone: () => void;
}

export function SplashScreen({ visible, onDone }: SplashScreenProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDone, 500);
    return () => clearTimeout(t);
  }, [visible, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
          style={{ background: "var(--brand-navy)" }}
        >
          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.28, ease: [0.34, 1.4, 0.64, 1] }}
            className="relative flex items-center justify-center"
          >
            {/* Outer spinning ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
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
            {/* Inner glow ring */}
            <div
              className="absolute w-28 h-28 rounded-full"
              style={{
                background: "radial-gradient(circle, var(--brand-orange-tint-sm) 0%, transparent 70%)",
              }}
            />
            {/* Circular logo */}
            <div
              className="w-24 h-24 rounded-full overflow-hidden shadow-2xl"
              style={{
                border: "3px solid var(--brand-white-high)",
                boxShadow: "0 0 32px var(--brand-orange-tint-md), 0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              <img
                src="/sahu-logo.png"
                alt="SAHU CSC"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          </motion.div>

          {/* App name */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.22, ease: "easeOut" }}
            className="mt-7 text-center"
          >
            <h1 className="text-2xl font-black tracking-wide">
              <span className="text-white">SAHU </span>
              <span style={{ color: "var(--brand-orange)" }}>CSC</span>
            </h1>
            <p className="text-white/40 text-xs mt-1 tracking-widest uppercase">
              Management Platform
            </p>
          </motion.div>

          {/* Version tag */}
          <p className="absolute bottom-8 text-white/20 text-xs tracking-wider">
            CSC · Odisha
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
