import React, { useCallback, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-notifications";
import { useTheme } from "@/components/theme-provider";
import {
  LayoutDashboard, BookOpen, Briefcase, BarChart3, Bell,
  History, Users, Database, Menu, Megaphone, FileArchive,
  Fingerprint, UserCircle, WifiOff, ArrowDownToLine, HeartPulse, MonitorSmartphone,
  LogIn, Sun, Moon, Info, HandCoins, LogOut, AlertTriangle,
} from "lucide-react";
import { usePendingCount } from "@/hooks/use-pending-count";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AppLogo } from "@/components/app-logo";
import { PWAInstallBanner } from "@/components/pwa-install-banner";
import { SetupWizardBanner } from "@/components/setup-wizard-banner";
import { WhatsNewModal } from "@/components/whats-new-modal";
import { SyncStatusBar, SyncDot } from "@/components/sync-status-bar";
import { prefetch } from "@/lib/prefetch";
import { useTranslation } from "react-i18next";

type NavItem = {
  href: string;
  label: string;
  mobileOnly?: boolean;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  badge?: number;
};

interface SidebarNavProps {
  mainNavItems: NavItem[];
  adminNavItems: NavItem[];
  initials: string;
  avatarSrc?: string;
  displayName: string;
  roleLabel: string;
  location: string;
  onLogout: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
}

// Extracted as module-level component — stable reference prevents React from
// destroying+recreating sidebar DOM on every Layout re-render.
function SidebarNav({
  mainNavItems,
  adminNavItems,
  initials,
  avatarSrc,
  displayName,
  roleLabel,
  location,
  onLogout,
  onToggleTheme,
  isDark,
}: SidebarNavProps) {
  const { t } = useTranslation();
  const isActive = (href: string) =>
    location === href || (href !== "/" && location.startsWith(href));

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">

      {/* ── Top Header ─────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-3 border-b border-white/10">
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/20 shadow-md">
            <AppLogo size="sm" className="w-full h-full" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-extrabold text-base leading-tight tracking-wide text-white">SAHU CSC</h2>
          <p className="text-[11px] text-white/50 font-medium tracking-wide mt-0.5">{t('nav.management_platform')}</p>
        </div>
      </div>

      {/* ── Nav Items ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer
                  transition-colors duration-100
                  ${active
                    ? "bg-[#f97316] text-white font-semibold shadow-md shadow-orange-900/30"
                    : "text-white/65 hover:text-white hover:bg-white/8"}
                `}
                onMouseEnter={() => prefetch(item.href)}
                onFocus={() => prefetch(item.href)}
                onTouchStart={() => prefetch(item.href)}
              >
                <div className="flex items-center gap-3">
                  <Icon size={17} className={active ? "text-white" : "text-white/45"} />
                  <span className="text-[14px] leading-none">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`
                    text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none
                    ${active ? "bg-white/25 text-white" : "bg-[#f97316] text-white"}
                  `}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {adminNavItems.length > 0 && (
          <>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.15em] px-3 pt-4 pb-1.5">
              {t('nav.admin')}
            </p>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                      transition-colors duration-100
                      ${active
                        ? "bg-[#f97316] text-white font-semibold shadow-md shadow-orange-900/30"
                        : "text-white/65 hover:text-white hover:bg-white/8"}
                    `}
                    onMouseEnter={() => prefetch(item.href)}
                    onFocus={() => prefetch(item.href)}
                    onTouchStart={() => prefetch(item.href)}
                  >
                    <Icon size={17} className={active ? "text-white" : "text-white/45"} />
                    <span className="text-[14px] leading-none">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none bg-[#f97316] text-white">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </div>

      {/* ── Version ────────────────────────────────────────────── */}
      <div className="px-4 py-1.5 flex items-center justify-between">
        <span className="text-[9px] text-white/20 font-mono tracking-wide uppercase">
          SAHU CSC v{__APP_VERSION__}
        </span>
        <span className="text-[9px] text-white/20">© 2026</span>
      </div>

      {/* ── User Footer ────────────────────────────────────────── */}
      <div className="mx-3 mb-3 mt-0.5 p-2.5 rounded-2xl bg-white/8 border border-white/10 flex items-center gap-2.5">
        <Link href="/profile" className="flex-shrink-0 cursor-pointer">
          <Avatar className="h-10 w-10 ring-2 ring-[#f97316]/60 shadow-sm">
            {avatarSrc ? <AvatarImage src={avatarSrc} alt={displayName} className="object-cover" /> : null}
            <AvatarFallback className="bg-[#f97316] text-white text-sm font-black">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>

        <Link href="/profile" className="flex-1 min-w-0 cursor-pointer">
          <p className="text-[13px] font-bold text-white leading-tight truncate">{displayName}</p>
          <p className="text-[11px] text-white/45 mt-0.5 capitalize">{roleLabel}</p>
        </Link>

        <button
          onClick={onToggleTheme}
          title={isDark ? t('nav.switch_light') : t('nav.switch_dark')}
          className="
            flex-shrink-0 w-8 h-8 rounded-xl border border-white/15 bg-white/5
            flex items-center justify-center
            text-white/40 hover:text-white hover:border-white/30 hover:bg-white/12
            transition-colors duration-100 cursor-pointer
          "
        >
          {isDark ? <Sun size={13} /> : <Moon size={13} />}
        </button>

        <button
          onClick={onLogout}
          title={t('nav.logout')}
          className="
            flex-shrink-0 w-8 h-8 rounded-xl border border-white/15 bg-white/5
            flex items-center justify-center
            text-white/40 hover:text-white hover:border-white/30 hover:bg-white/12
            transition-colors duration-100 cursor-pointer
          "
        >
          <LogIn size={13} className="rotate-180" />
        </button>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const { data: unreadCount = 0 } = useUnreadCount();
  const isAdmin = user?.role === "admin";
  const { data: pendingCountData } = usePendingCount();
  const pendingCount = isAdmin ? (pendingCountData?.count ?? 0) : 0;

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const handleLogout = useCallback(() => { setShowLogoutConfirm(true); }, []);
  const confirmLogout = useCallback(() => { setShowLogoutConfirm(false); logout(); }, [logout]);

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const handleToggleTheme = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  const mainNavItems: NavItem[] = [
    { href: "/", label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: "/ledger", label: t('nav.ledger'), icon: BookOpen },
    { href: "/udhari", label: t('nav.udhari'), icon: HandCoins },
    { href: "/aeps", label: t('nav.aeps'), icon: Fingerprint },
    { href: "/services", label: t('nav.services'), icon: Briefcase },
    { href: "/reports", label: t('nav.reports'), icon: BarChart3 },
    { href: "/notifications", label: t('nav.notifications'), icon: Bell, badge: unreadCount },
    { href: "/profile", label: t('nav.profile'), icon: UserCircle },
    { href: "/sessions", label: t('nav.sessions'), icon: MonitorSmartphone, mobileOnly: true },
    { href: "/pwa-status", label: t('nav.pwa_status'), icon: WifiOff },
    { href: "/download-app", label: t('nav.download_app'), icon: ArrowDownToLine },
    { href: "/about", label: t('nav.about'), icon: Info },
  ];

  const adminNavItems: NavItem[] = isAdmin ? [
    { href: "/users", label: t('nav.user_management'), icon: Users, badge: pendingCount },
    { href: "/broadcast", label: t('nav.broadcast'), icon: Megaphone },
    { href: "/receipt-export", label: t('nav.receipt_export'), icon: FileArchive },
    { href: "/audit-logs", label: t('nav.audit_logs'), icon: History },
    { href: "/backups", label: t('nav.backups'), icon: Database },
    { href: "/server-health", label: t('nav.server_health'), icon: HeartPulse },
  ] : [];

  const initials = (user?.fullName || user?.username || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const avatarSrc = (user as any)?.profilePicture;
  const displayName = user?.fullName || user?.username || "User";
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "";

  const pageTitle = (() => {
    if (location === "/") return t('nav.dashboard');
    const seg = location.split("/")[1];
    return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  })();

  const firstName = displayName.split(" ")[0];

  // Live-updating greeting — recalculates every minute
  const getGreetingData = () => {
    const h = new Date().getHours();
    return {
      text: h < 12 ? t('nav.good_morning') : h < 17 ? t('nav.good_afternoon') : t('nav.good_evening'),
      emoji: h < 12 ? "☀️" : h < 17 ? "👋" : "🌙",
      date: new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
    };
  };
  const [greetingData, setGreetingData] = useState(getGreetingData);
  const [greetingVisible, setGreetingVisible] = useState(true);
  useEffect(() => {
    const tick = () => {
      setGreetingVisible(false);
      setTimeout(() => {
        setGreetingData(getGreetingData());
        setGreetingVisible(true);
      }, 350);
    };
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 60_000);
    }, msToNextMinute);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live clock — ticks every second
  const [clockTime, setClockTime] = useState(() => {
    const n = new Date();
    return n.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  });
  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setClockTime(n.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const greeting = greetingData.text;
  const greetingEmoji = greetingData.emoji;
  const shortDate = greetingData.date;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 fixed inset-y-0 z-10">
        <SidebarNav
          mainNavItems={mainNavItems.filter((i) => !i.mobileOnly)}
          adminNavItems={adminNavItems}
          initials={initials}
          avatarSrc={avatarSrc}
          displayName={displayName}
          roleLabel={roleLabel}
          location={location}
          onLogout={handleLogout}
          onToggleTheme={handleToggleTheme}
          isDark={isDark}
        />
      </div>

      <div className="flex-1 flex flex-col md:ml-64">
        {/* Mobile Top Header — V2 White + Hex Mesh + Gradient */}
        <header className="sticky top-0 z-20 md:hidden">
          {/* Main header bar */}
          <div style={{ position: "relative", overflow: "hidden", background: "white" }}>
            {/* Top accent bar: navy → blue → saffron */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #0b2c60 0%, #1e40af 40%, #f97316 75%, #ea580c 100%)", zIndex: 3 }} />

            {/* Hex mesh SVG texture */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07, pointerEvents: "none" }} preserveAspectRatio="none">
              <defs>
                <pattern id="hdr-hex" x="0" y="0" width="28" height="24" patternUnits="userSpaceOnUse">
                  <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#0b2c60" strokeWidth="0.9" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hdr-hex)" />
            </svg>

            {/* Soft aurora blobs */}
            <div style={{ position: "absolute", top: -20, right: 20, width: 100, height: 100, background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)", filter: "blur(20px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: -10, left: "38%", width: 80, height: 80, background: "radial-gradient(circle, rgba(11,44,96,0.08) 0%, transparent 70%)", filter: "blur(16px)", pointerEvents: "none" }} />

            {/* Bottom shadow line */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,#e2e8f0,transparent)", zIndex: 2 }} />

            <div
              className="flex items-center justify-between px-4"
              style={{ height: 60, position: "relative", zIndex: 2 }}
            >
              {/* ── Left: gradient logo badge + brand ── */}
              <div className="flex items-center gap-2.5">
                <div
                  className="flex items-center justify-center rounded-2xl flex-shrink-0"
                  style={{
                    width: 40, height: 40,
                    background: "linear-gradient(135deg, #0b2c60 0%, #1e40af 55%, #f97316 100%)",
                    boxShadow: "0 3px 12px rgba(11,44,96,0.28), 0 0 0 1px rgba(11,44,96,0.1), inset 0 1px 0 rgba(255,255,255,0.18)",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="8" height="8" rx="2" fill="white" />
                    <rect x="13" y="3" width="8" height="8" rx="2" fill="rgba(255,255,255,0.75)" />
                    <rect x="3" y="13" width="8" height="8" rx="2" fill="rgba(255,255,255,0.6)" />
                    <rect x="13" y="13" width="8" height="8" rx="2" fill="rgba(255,255,255,0.35)" />
                  </svg>
                </div>
                <div>
                  {/* Gradient text */}
                  <div className="flex items-baseline gap-1">
                    <span style={{
                      fontSize: 16, fontWeight: 900, letterSpacing: "0.02em", lineHeight: 1,
                      background: "linear-gradient(135deg, #0b2c60 0%, #1e40af 55%, #f97316 100%)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    }}>SAHU</span>
                    <span style={{
                      fontSize: 16, fontWeight: 900, letterSpacing: "0.02em", lineHeight: 1,
                      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    }}>CSC</span>
                  </div>
                  <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1, marginTop: 2, display: "block" }}>
                    {t('nav.management_platform')}
                  </span>
                </div>
              </div>

              {/* ── Right: bell + avatar chip ── */}
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
                      style={{
                        padding: "4px 10px 4px 4px",
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      }}
                    >
                      {avatarSrc ? (
                        <img src={avatarSrc} alt={displayName} className="object-cover rounded-lg" style={{ width: 30, height: 30 }} />
                      ) : (
                        <div
                          className="flex items-center justify-center rounded-lg"
                          style={{
                            width: 30, height: 30,
                            background: "linear-gradient(135deg, #0b2c60 0%, #1e40af 55%, #f97316 100%)",
                            boxShadow: "0 2px 6px rgba(11,44,96,0.3)",
                            color: "#fff", fontSize: 10, fontWeight: 900,
                          }}
                        >
                          {initials}
                        </div>
                      )}
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        background: "linear-gradient(135deg, #0b2c60, #f97316)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                      }}>{firstName}</span>
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
                      onLogout={handleLogout}
                      onToggleTheme={handleToggleTheme}
                      isDark={isDark}
                    />
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>

          {/* Animated Greeting bar */}
          <div
            style={{
              background: "linear-gradient(90deg, #0b2c60 0%, #1e3a8a 60%, #1e40af 100%)",
              padding: "0 16px",
              height: 40,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex", alignItems: "center", gap: 6,
                transition: "opacity 0.35s ease, transform 0.35s ease",
                opacity: greetingVisible ? 1 : 0,
                transform: greetingVisible ? "translateY(0)" : "translateY(4px)",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
                {greeting}, {firstName}
              </span>
              <span style={{ fontSize: 14, lineHeight: 1 }}>{greetingEmoji}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Live clock */}
              <span style={{
                fontSize: 12, color: "white", fontWeight: 700, fontFamily: "monospace",
                background: "rgba(255,255,255,0.12)", borderRadius: 6, padding: "2px 8px",
                letterSpacing: "0.05em",
              }}>{clockTime}</span>
              <span
                style={{
                  fontSize: 10, color: "rgba(255,255,255,0.42)", fontWeight: 500,
                  transition: "opacity 0.35s ease",
                  opacity: greetingVisible ? 1 : 0,
                }}
              >{shortDate}</span>
            </div>
          </div>
        </header>

        {/* Desktop Top Header — V2 White + Hex Mesh + Gradient */}
        <header className="hidden md:block sticky top-0 z-20" style={{ position: "relative", overflow: "hidden", background: "white" }}>
          {/* Top accent bar */}
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
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  transition: "opacity 0.35s ease, transform 0.35s ease",
                  opacity: greetingVisible ? 1 : 0,
                  transform: greetingVisible ? "translateY(0)" : "translateY(3px)",
                }}
              >
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                  {greeting}, {firstName}
                </span>
                <span style={{ fontSize: 12, lineHeight: 1 }}>{greetingEmoji}</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>·</span>
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>{shortDate}</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>·</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.05em",
                  background: "linear-gradient(135deg, #0b2c60, #f97316)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>{clockTime}</span>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              <SyncDot />
              <button
                onClick={handleToggleTheme}
                title={isDark ? t('nav.switch_light') : t('nav.switch_dark')}
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
                  <span>{t('nav.notifications')}</span>
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
                    <img src={avatarSrc} alt="Profile" className="object-cover rounded-lg" style={{ width: 28, height: 28 }} />
                  ) : (
                    <div
                      className="flex items-center justify-center rounded-lg"
                      style={{ width: 28, height: 28, background: "linear-gradient(135deg, #0b2c60 0%, #1e40af 55%, #f97316 100%)", color: "#fff", fontSize: 10, fontWeight: 900 }}
                    >
                      {initials}
                    </div>
                  )}
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    background: "linear-gradient(135deg, #0b2c60, #f97316)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>{firstName}</span>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Sync + PWA banners */}
        <SyncStatusBar />
        <PWAInstallBanner />
        {isAdmin && <SetupWizardBanner />}

        {/* What's New modal — shows once per version for all authenticated users */}
        <WhatsNewModal />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
          <div className="flex items-stretch h-16">
            {[
              { href: "/", label: t('nav.dashboard'), icon: LayoutDashboard },
              { href: "/ledger", label: t('nav.ledger'), icon: BookOpen },
              { href: "/aeps", label: "AePS", icon: Fingerprint },
              { href: "/profile", label: t('nav.profile'), icon: UserCircle },
            ].map((item) => {
              const Icon = item.icon;
              const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} className="flex-1">
                  <div
                    className={`flex flex-col items-center justify-center h-full gap-1 relative transition-colors duration-100 ${active ? "text-[#f97316]" : "text-muted-foreground"}`}
                    onMouseEnter={() => prefetch(item.href)}
                    onFocus={() => prefetch(item.href)}
                    onTouchStart={() => prefetch(item.href)}
                  >
                    {active && (
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#f97316] rounded-full" />
                    )}
                    <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                    <span className={`text-[10px] font-semibold leading-none ${active ? "text-[#f97316]" : "text-muted-foreground"}`}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ── Logout Confirmation Dialog ── */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-3">
              <AlertTriangle size={22} className="text-amber-500" />
            </div>
            <DialogTitle className="text-center text-[#0b2c60]">Sign out?</DialogTitle>
            <DialogDescription className="text-center text-sm text-slate-500 pt-1">
              You will be logged out of this session. Any unsaved changes may be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#0b2c60] hover:bg-[#0a2456] text-white"
              onClick={confirmLogout}
            >
              <LogOut size={14} className="mr-1.5" />
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
