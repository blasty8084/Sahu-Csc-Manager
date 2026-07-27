import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles, ShieldCheck, RefreshCw, KeyRound,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VERSION = "4.8.0";
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
    color: "var(--color-success)",
    bg: "rgba(5,150,105,0.10)",
    title: "QR Code 2FA — Works with Google Authenticator",
    description:
      "Scan the QR code in Profile → Security with Google Authenticator, Authy, or any TOTP app to set up two-factor authentication. Or copy the secret key for manual entry.",
    tag: "Fixed",
    tagColor: "var(--color-success)",
  },
  {
    icon: <RefreshCw size={15} />,
    color: "var(--color-sky)",
    bg: "rgba(8,145,178,0.10)",
    title: "Standard 30-Second Codes",
    description:
      "TOTP codes now use the universal 30-second window (RFC 6238) that all authenticator apps expect. Clock-drift tolerance of ±30 seconds is also applied automatically.",
    tag: "Security",
    tagColor: "var(--color-sky)",
  },
  {
    icon: <KeyRound size={15} />,
    color: "var(--brand-orange)",
    bg: "var(--brand-orange-tint-xs)",
    title: "Regenerate Backup Codes Anytime",
    description:
      "Running low on backup codes? Generate a fresh set from Profile → Security with a password confirmation — no need to disable and re-enable two-factor authentication.",
    tag: "New",
    tagColor: "var(--brand-orange)",
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
          style={{ background: "linear-gradient(135deg, var(--brand-navy-800) 0%, #1e4d9b 60%, var(--brand-navy-500) 100%)" }}
        >
          {/* decorative circles */}
          <div style={{ position: "absolute", top: -28, right: -20, width: 100, height: 100, borderRadius: "50%", background: "var(--brand-orange-tint-sm)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -20, left: -16, width: 70, height: 70, borderRadius: "50%", background: "var(--brand-white-low)", pointerEvents: "none" }} />

          <div className="flex items-center gap-2.5 mb-2 relative z-10">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--brand-orange-tint-md)", border: "1px solid var(--brand-orange-border)" }}
            >
              <Sparkles size={17} color="var(--brand-orange)" />
            </div>
            <DialogHeader className="p-0 space-y-0">
              <DialogTitle className="text-[15px] font-bold leading-tight" style={{ color: "#ffffff" }}>
                What's New in v{VERSION}
              </DialogTitle>
            </DialogHeader>
          </div>
          <p className="text-[11px] leading-snug relative z-10" style={{ color: "rgba(255,255,255,0.65)" }}>
            2FA security upgrade — QR code export, standard 30-second codes, replay protection, regenerate backup codes.
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
                  background: i === step ? "var(--brand-orange)" : "var(--brand-white-30)",
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
                style={{ background: "var(--brand-orange)", color: "#fff" }}
              >
                Let's go!
              </Button>
            ) : (
              <Button
                onClick={() => setStep(step + 1)}
                size="sm"
                className="h-8 px-4 text-xs font-semibold"
                style={{ background: "var(--brand-navy-800)", color: "#fff" }}
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
