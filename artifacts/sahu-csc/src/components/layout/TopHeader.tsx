import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import { Link } from "wouter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppLogo } from "@/components/app-logo";
import { LiveClock } from "./LiveClock";
import { SidebarNav } from "./Sidebar";
import { useGreeting } from "@/hooks/use-greeting";
import type { NavItem } from "./NavLink";

interface TopHeaderProps {
  unreadCount: number;
  initials: string;
  avatarSrc?: string;
  displayName: string;
  roleLabel: string;
  firstName: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  mainNavItems: NavItem[];
  adminNavItems: NavItem[];
}

/**
 * Mobile 3-layer header:
 *   1. White bar — logo/brand + bell + avatar-chip (opens sidebar Sheet)
 *   2. Navy sub-bar — animated greeting + live clock + date
 *
 * A 3 px accent gradient stripe is rendered as an absolutely-positioned
 * child of the white bar so it scrolls with it (position: sticky on `<header>`).
 */
export function TopHeader({
  unreadCount,
  initials,
  avatarSrc,
  displayName,
  roleLabel,
  firstName,
  isDark,
  onToggleTheme,
  onLogout,
  mainNavItems,
  adminNavItems,
}: TopHeaderProps) {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { greeting, greetingEmoji, shortDate, greetingVisible } = useGreeting();

  return (
    <header className="sticky top-0 z-20 md:hidden">
      {/* ── White main bar ─────────────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden", background: "white" }}>
        {/* Top accent stripe: navy → blue → saffron */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #0b2c60 0%, #1e40af 40%, #f97316 75%, #ea580c 100%)", zIndex: 3 }} />

        {/* Hex mesh texture */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07, pointerEvents: "none" }} preserveAspectRatio="none">
          <defs>
            <pattern id="hdr-hex" x="0" y="0" width="28" height="24" patternUnits="userSpaceOnUse">
              <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#0b2c60" strokeWidth="0.9" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hdr-hex)" />
        </svg>

        {/* Aurora blobs */}
        <div style={{ position: "absolute", top: -20, right: 20, width: 100, height: 100, background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)", filter: "blur(20px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -10, left: "38%", width: 80, height: 80, background: "radial-gradient(circle, rgba(11,44,96,0.08) 0%, transparent 70%)", filter: "blur(16px)", pointerEvents: "none" }} />

        {/* Bottom shadow line */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,#e2e8f0,transparent)", zIndex: 2 }} />

        <div className="flex items-center justify-between px-4" style={{ height: 60, position: "relative", zIndex: 2 }}>
          {/* Left: logo + brand */}
          <div className="flex items-center gap-2.5">
            <div style={{ borderRadius: "50%", boxShadow: "0 3px 12px rgba(11,44,96,0.22), 0 0 0 1.5px rgba(11,44,96,0.10)", flexShrink: 0 }}>
              <AppLogo size="sm" className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "0.02em", lineHeight: 1, background: "linear-gradient(135deg, #0b2c60 0%, #1e40af 55%, #f97316 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>SAHU</span>
                <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "0.02em", lineHeight: 1, background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>CSC</span>
              </div>
              <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1, marginTop: 2, display: "block" }}>
                {t("nav.management_platform")}
              </span>
            </div>
          </div>

          {/* Right: bell + avatar chip (opens sidebar Sheet) */}
          <div className="flex items-center gap-2">
            <Link href="/notifications">
              <button
                className="relative flex items-center justify-center rounded-xl"
                style={{ width: 38, height: 38, background: "#f8fafc", border: "1.5px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
              >
                <Bell size={17} color="#0b2c60" />
                {unreadCount > 0 && (
                  <span
                    className="absolute"
                    style={{ top: 7, right: 7, width: 8, height: 8, borderRadius: "50%", background: "#f97316", border: "2px solid white", boxShadow: "0 0 6px rgba(249,115,22,0.5)" }}
                  />
                )}
              </button>
            </Link>

            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-xl"
                  style={{ padding: "4px 10px 4px 4px", background: "#f8fafc", border: "1.5px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={displayName} className="object-cover rounded-lg" style={{ width: 30, height: 30 }} loading="lazy" />
                  ) : (
                    <div
                      className="flex items-center justify-center rounded-lg"
                      style={{ width: 30, height: 30, background: "linear-gradient(135deg, #0b2c60 0%, #1e40af 55%, #f97316 100%)", boxShadow: "0 2px 6px rgba(11,44,96,0.3)", color: "#fff", fontSize: 10, fontWeight: 900 }}
                    >
                      {initials}
                    </div>
                  )}
                  <span style={{ fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg, #0b2c60, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    {firstName}
                  </span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 border-0">
                <SidebarNav
                  mainNavItems={mainNavItems}
                  adminNavItems={adminNavItems}
                  initials={initials}
                  avatarSrc={avatarSrc}
                  displayName={displayName}
                  roleLabel={roleLabel}
                  location={location}
                  onLogout={onLogout}
                  onToggleTheme={onToggleTheme}
                  isDark={isDark}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* ── Navy greeting bar ──────────────────────────────────── */}
      <div style={{ background: "linear-gradient(90deg, #0b2c60 0%, #1e3a8a 60%, #1e40af 100%)", padding: "0 16px", height: 40, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, transition: "opacity 0.35s ease, transform 0.35s ease", opacity: greetingVisible ? 1 : 0, transform: greetingVisible ? "translateY(0)" : "translateY(4px)" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{greeting}, {firstName}</span>
          <span style={{ fontSize: 14, lineHeight: 1 }}>{greetingEmoji}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LiveClock style={{ fontSize: 12, color: "white", fontWeight: 700, fontFamily: "monospace", background: "rgba(255,255,255,0.12)", borderRadius: 6, padding: "2px 8px", letterSpacing: "0.05em" }} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.42)", fontWeight: 500, transition: "opacity 0.35s ease", opacity: greetingVisible ? 1 : 0 }}>{shortDate}</span>
        </div>
      </div>
    </header>
  );
}
