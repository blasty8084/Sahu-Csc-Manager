import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Sun, Moon, Bell } from "lucide-react";
import { LiveClock } from "./LiveClock";
import { SyncDot } from "@/components/sync-status-bar";
import { useGreeting } from "@/hooks/use-greeting";

interface DesktopHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  unreadCount: number;
  initials: string;
  avatarSrc?: string;
  firstName: string;
}

/**
 * Desktop sticky header bar — page title, animated greeting, sync dot,
 * theme toggle, notifications button, and profile chip.
 *
 * Computes `pageTitle` internally from `useLocation()` so Layout doesn't
 * need to derive or pass it.
 */
export function DesktopHeader({
  isDark,
  onToggleTheme,
  unreadCount,
  initials,
  avatarSrc,
  firstName,
}: DesktopHeaderProps) {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { greeting, greetingEmoji, shortDate, greetingVisible } = useGreeting();

  const pageTitle = (() => {
    if (location === "/") return t("nav.dashboard");
    const seg = location.split("/")[1];
    return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  })();

  return (
    <header className="hidden md:block sticky top-0 z-20" style={{ position: "relative", overflow: "hidden", background: "white" }}>
      {/* Top accent stripe */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #0b2c60 0%, #1e40af 40%, #f97316 75%, #ea580c 100%)", zIndex: 3 }} />
      {/* Hex mesh texture */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06, pointerEvents: "none" }} preserveAspectRatio="none">
        <defs>
          <pattern id="dhdr-hex" x="0" y="0" width="28" height="24" patternUnits="userSpaceOnUse">
            <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#0b2c60" strokeWidth="0.9" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dhdr-hex)" />
      </svg>
      {/* Aurora blobs */}
      <div style={{ position: "absolute", top: -30, right: 60, width: 130, height: 130, background: "radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)", filter: "blur(24px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -10, left: "42%", width: 100, height: 80, background: "radial-gradient(circle, rgba(11,44,96,0.07) 0%, transparent 70%)", filter: "blur(18px)", pointerEvents: "none" }} />
      {/* Bottom border */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,#e2e8f0,transparent)", zIndex: 2 }} />

      <div className="flex items-center justify-between px-8" style={{ height: 64, position: "relative", zIndex: 2 }}>
        {/* Left: page title + animated greeting */}
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#0b2c60" }}>{pageTitle}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 5, transition: "opacity 0.35s ease, transform 0.35s ease", opacity: greetingVisible ? 1 : 0, transform: greetingVisible ? "translateY(0)" : "translateY(3px)" }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{greeting}, {firstName}</span>
            <span style={{ fontSize: 12, lineHeight: 1 }}>{greetingEmoji}</span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>·</span>
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>{shortDate}</span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>·</span>
            <LiveClock style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.05em", background: "linear-gradient(135deg, #0b2c60, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }} />
          </div>
        </div>

        {/* Right: sync dot, theme toggle, notifications, profile chip */}
        <div className="flex items-center gap-3">
          <SyncDot />
          <button
            onClick={onToggleTheme}
            title={isDark ? t("nav.switch_light") : t("nav.switch_dark")}
            className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors duration-100"
            style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}
          >
            {isDark ? <Sun size={15} color="#64748b" /> : <Moon size={15} color="#64748b" />}
          </button>
          <Link href="/notifications">
            <button
              className="relative flex items-center gap-2 rounded-xl px-3 h-8 text-sm font-medium transition-colors duration-100"
              style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#0b2c60" }}
            >
              <Bell size={15} color="#0b2c60" />
              <span>{t("nav.notifications")}</span>
              {unreadCount > 0 && (
                <span style={{ background: "#f97316", color: "white", borderRadius: 999, fontSize: 10, fontWeight: 700, padding: "0 5px", lineHeight: "18px", display: "inline-block" }}>
                  {unreadCount}
                </span>
              )}
            </button>
          </Link>
          <Link href="/profile">
            <div
              className="flex items-center gap-2 rounded-xl cursor-pointer transition-opacity duration-100 hover:opacity-80"
              style={{ padding: "4px 10px 4px 4px", background: "#f8fafc", border: "1.5px solid #e2e8f0" }}
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt="Profile" className="object-cover rounded-lg" style={{ width: 28, height: 28 }} loading="lazy" />
              ) : (
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{ width: 28, height: 28, background: "linear-gradient(135deg, #0b2c60 0%, #1e40af 55%, #f97316 100%)", color: "#fff", fontSize: 10, fontWeight: 900 }}
                >
                  {initials}
                </div>
              )}
              <span style={{ fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg, #0b2c60, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {firstName}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
