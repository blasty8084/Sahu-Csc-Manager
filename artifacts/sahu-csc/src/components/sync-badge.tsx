import { useIsFetching } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

export function SyncBadge() {
  const fetching = useIsFetching();
  return (
    <AnimatePresence>
      {fetching > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="fixed top-2 right-2 z-[200] flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium text-white/80 select-none"
          style={{
            background: "rgba(0,0,0,0.28)",
            backdropFilter: "blur(6px)",
            pointerEvents: "none",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          Updating…
        </motion.div>
      )}
    </AnimatePresence>
  );
}
