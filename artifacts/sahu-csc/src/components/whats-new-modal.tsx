import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles, ShieldCheck, RefreshCw, KeyRound,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VERSION = "4.7.1";
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
    icon: <ShieldCheck size={15} />,
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.10)",
    title: "Built-in Verification Code",
    description:
      "Two-factor authentication no longer needs Google Authenticator or Authy. The app now generates and shows your 6-digit code directly — just read it and type it in. No QR code, no external app.",
    tag: "New",
    tagColor: "#7c3aed",
  },
  {
    icon: <RefreshCw size={15} />,
    color: "#0891b2",
    bg: "rgba(8,145,178,0.10)",
    title: "120-Second Code Window",
    description:
      "Verification codes are valid for 120 seconds — 4× longer than before. More time to read and enter the code without it expiring mid-entry.",
    tag: "Improved",
    tagColor: "#0891b2",
  },
  {
    icon: <KeyRound size={15} />,
    color: "#16a34a",
    bg: "rgba(22,163,74,0.10)",
    title: "Live Countdown Display",
    description:
      "A countdown ring next to your code shows exactly how many seconds it's still valid. When the window expires, the code refreshes automatically — no manual action needed.",
    tag: "Design",
    tagColor: "#16a34a",
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
            Built-in 2FA code — no QR, no external app, 120-second rotating code right in the app.
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
