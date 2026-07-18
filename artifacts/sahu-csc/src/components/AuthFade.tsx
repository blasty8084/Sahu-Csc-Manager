import React from "react";
import { motion } from "framer-motion";

// ─── Auth page fade — simple enter-only fade for non-Layout routes ───────────
export function AuthFade({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
