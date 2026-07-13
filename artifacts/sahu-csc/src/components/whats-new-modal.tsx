import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Puzzle, Wrench, CheckCircle2, Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VERSION = "4.1.1";
const STORAGE_KEY = `sahu-whats-new-v${VERSION}`;

interface Feature {
  icon: React.ReactNode;
  color: string;
  bg: string;
  title: string;
  description: string;
  tag?: string;
  tagColor?: string;
}

const FEATURES: Feature[] = [
  {
    icon: <Zap size={15} />,
    color: "#10b981",
    bg: "rgba(16,185,129,0.10)",
    title: "Worker Server — Async Job Processing",
    description:
      "Push notifications and emails are now handled by a dedicated background worker process (port 8081) using BullMQ. The main API returns instantly without waiting on SMTP or web-push delivery. Activates automatically when REDIS_URL is configured; falls back to in-process execution otherwise.",
    tag: "Performance",
    tagColor: "#10b981",
  },
  {
    icon: <CheckCircle2 size={15} />,
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.10)",
    title: "Auto-Retry on Delivery Failures",
    description:
      "Email and push workers retry failed jobs up to 3 times with exponential backoff. Transient SMTP outages or push endpoint hiccups resolve automatically without manual intervention or lost notifications.",
    tag: "Reliability",
    tagColor: "#7c3aed",
  },
  {
    icon: <Wrench size={15} />,
    color: "#0891b2",
    bg: "rgba(8,145,178,0.10)",
    title: "PM2 Cluster Config",
    description:
      "pm2.config.js added to the project root — api-server runs in cluster mode across all available CPUs; worker-server runs in fork mode (single instance, BullMQ handles internal concurrency). Ready for production multi-process deployment.",
    tag: "Infrastructure",
    tagColor: "#0891b2",
  },
  {
    icon: <Puzzle size={15} />,
    color: "#f97316",
    bg: "rgba(249,115,22,0.10)",
    title: "Graceful Fallback Mode",
    description:
      "No Redis? No problem. When REDIS_URL is not set the api-server handles all push and email work directly in-process — exactly as before. The worker architecture is additive; nothing breaks in simple or development deployments.",
    tag: "Compatibility",
    tagColor: "#15803d",
  },
];

export function WhatsNewModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 900);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  const isLast = step === FEATURES.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent
        className="max-w-sm w-full p-0 overflow-hidden gap-0"
        style={{ borderRadius: "1.25rem" }}
      >
        {/* ── Gradient header ── */}
        <div
          className="relative px-6 pt-6 pb-5 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0b2c60 0%, #1e4d9b 60%, #1e40af 100%)" }}
        >
          {/* decorative circles */}
          <div style={{ position: "absolute", top: -28, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(249,115,22,0.12)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -20, left: -16, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

          <div className="flex items-center gap-2.5 mb-2 relative z-10">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(249,115,22,0.22)", border: "1px solid rgba(249,115,22,0.30)" }}
            >
              <Sparkles size={17} color="#f97316" />
            </div>
            <DialogHeader className="p-0 space-y-0">
              <DialogTitle className="text-[15px] font-bold leading-tight" style={{ color: "#ffffff" }}>
                What's New in v{VERSION}
              </DialogTitle>
            </DialogHeader>
          </div>
          <p className="text-[11px] leading-snug relative z-10" style={{ color: "rgba(255,255,255,0.65)" }}>
            Redis live, i18n fixed, OTel guard, and workflow cleanup.
          </p>

          {/* step dots */}
          <div className="flex items-center gap-1.5 mt-4 relative z-10">
            {FEATURES.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="transition-all duration-200"
                style={{
                  height: 4,
                  width: i === step ? 20 : 8,
                  borderRadius: 99,
                  background: i === step ? "#f97316" : "rgba(255,255,255,0.28)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Feature card (animated) ── */}
        <div className="px-5 py-5" style={{ minHeight: 178 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              {(() => {
                const f = FEATURES[step];
                return (
                  <div
                    className="rounded-2xl p-4"
                    style={{ background: f.bg, border: `1.5px solid ${f.color}22` }}
                  >
                    {/* icon + tag row */}
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: f.color + "18", color: f.color, border: `1px solid ${f.color}28` }}
                      >
                        {f.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-foreground leading-none">
                            {f.title}
                          </span>
                          {f.tag && (
                            <span
                              className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded uppercase"
                              style={{ background: (f.tagColor ?? f.color) + "16", color: f.tagColor ?? f.color }}
                            >
                              {f.tag}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* description */}
                    <p className="text-[12px] leading-relaxed text-muted-foreground">
                      {f.description}
                    </p>
                  </div>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        <div
          className="px-5 pb-5 flex items-center justify-between gap-3"
        >
          <span className="text-[11px] text-muted-foreground font-medium">
            {step + 1} of {FEATURES.length}
          </span>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(step - 1)}
                className="h-8 px-3 text-xs"
              >
                Back
              </Button>
            )}
            {isLast ? (
              <Button
                onClick={handleClose}
                size="sm"
                className="h-8 px-5 text-xs font-semibold"
                style={{ background: "#f97316", color: "#fff" }}
              >
                Let's go!
              </Button>
            ) : (
              <Button
                onClick={() => setStep(step + 1)}
                size="sm"
                className="h-8 px-4 text-xs font-semibold"
                style={{ background: "#0b2c60", color: "#fff" }}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
