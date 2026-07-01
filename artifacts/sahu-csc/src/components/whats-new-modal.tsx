import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  CalendarClock,
  Download,
  UploadCloud,
  ShieldCheck,
  Key,
} from "lucide-react";

const VERSION = "3.1.0";
const STORAGE_KEY = `sahu-whats-new-v${VERSION}`;

interface ChangeItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
}

const changes: ChangeItem[] = [
  {
    icon: <Download size={15} />,
    title: "Backup Download",
    description:
      "Download any backup as a .sql file directly from the Backup & Restore page — one click, no manual server access needed.",
    badge: "Admin",
    badgeColor: "#0b2c60",
  },
  {
    icon: <CalendarClock size={15} />,
    title: "Auto-Backup Scheduler",
    description:
      "Schedule automatic backups daily, weekly, or on a custom cron. Configure the time and how many backups to keep.",
    badge: "Admin",
    badgeColor: "#0b2c60",
  },
  {
    icon: <UploadCloud size={15} />,
    title: "Selective Table Import",
    description:
      "When restoring a backup, choose exactly which tables to import — restore only ledger data, only Udhari records, or any combination.",
    badge: "Admin",
    badgeColor: "#0b2c60",
  },
  {
    icon: <ShieldCheck size={15} />,
    title: "Setup Wizard Banner",
    description:
      "After a fresh install, a banner now guides admins through every required secret — red for critical, yellow for optional — with direct links to the Secrets panel.",
    badge: "Admin",
    badgeColor: "#0b2c60",
  },
  {
    icon: <Key size={15} />,
    title: "Secure Password Secrets",
    description:
      "Admin and operator passwords are now read exclusively from Replit Secrets (ADMIN_PASSWORD, OPERATOR_PASSWORD). No hardcoded defaults.",
    badge: "Security",
    badgeColor: "#15803d",
  },
];

export function WhatsNewModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent
        className="max-w-md w-full p-0 overflow-hidden gap-0"
        style={{ borderRadius: "1rem" }}
      >
        {/* Header stripe */}
        <div
          className="px-6 pt-6 pb-5"
          style={{
            background: "linear-gradient(135deg, #0b2c60 0%, #1e4d9b 100%)",
          }}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(249,115,22,0.20)" }}
            >
              <Sparkles size={16} color="#f97316" />
            </div>
            <DialogHeader className="p-0 space-y-0">
              <DialogTitle
                className="text-base font-bold leading-none"
                style={{ color: "#ffffff" }}
              >
                What's New in v{VERSION}
              </DialogTitle>
            </DialogHeader>
          </div>
          <p className="text-xs leading-snug" style={{ color: "rgba(255,255,255,0.70)" }}>
            Here's what changed in this update of SAHU CSC.
          </p>
        </div>

        {/* Change list */}
        <div className="px-5 py-4 space-y-3 max-h-[52vh] overflow-y-auto">
          {changes.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl px-3.5 py-3 border"
              style={{
                background: "rgba(11,44,96,0.03)",
                borderColor: "rgba(11,44,96,0.10)",
              }}
            >
              {/* Icon */}
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: "rgba(11,44,96,0.08)",
                  color: "#0b2c60",
                }}
              >
                {item.icon}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className="text-xs font-semibold text-foreground leading-none">
                    {item.title}
                  </span>
                  {item.badge && (
                    <span
                      className="text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded uppercase"
                      style={{
                        background: item.badgeColor
                          ? `${item.badgeColor}18`
                          : "rgba(11,44,96,0.10)",
                        color: item.badgeColor ?? "#0b2c60",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4 flex items-center justify-between border-t"
          style={{ borderColor: "rgba(11,44,96,0.10)" }}
        >
          <span className="text-[11px] text-muted-foreground">
            SAHU CSC v{VERSION}
          </span>
          <Button
            onClick={handleClose}
            size="sm"
            className="h-8 px-5 text-xs font-semibold"
            style={{ background: "#f97316", color: "#fff" }}
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
