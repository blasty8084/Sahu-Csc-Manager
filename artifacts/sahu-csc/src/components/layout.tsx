import React, { useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-notifications";
import { useTheme } from "@/components/theme-provider";
import {
  LayoutDashboard, BookOpen, Briefcase, BarChart3, Bell,
  History, Users, Database, Menu,
  Fingerprint, UserCircle, WifiOff, ArrowDownToLine, HeartPulse, MonitorSmartphone,
  LogIn, Sun, Moon, Info, HandCoins,
} from "lucide-react";
import { usePendingCount } from "@/hooks/use-pending-count";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AppLogo } from "@/components/app-logo";
import { PWAInstallBanner } from "@/components/pwa-install-banner";
import { SyncStatusBar, SyncDot } from "@/components/sync-status-bar";
import { prefetch } from "@/lib/prefetch";

type NavItem = {
  href: string;
  label: string;
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
          <p className="text-[11px] text-white/50 font-medium tracking-wide mt-0.5">Management Platform</p>
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
              Admin
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
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
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
          title="Logout"
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

  const { data: unreadCount = 0 } = useUnreadCount();
  const isAdmin = user?.role === "admin";
  const { data: pendingCountData } = usePendingCount();
  const pendingCount = isAdmin ? (pendingCountData?.count ?? 0) : 0;

  const handleLogout = useCallback(() => { logout(); }, [logout]);

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const handleToggleTheme = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  const mainNavItems: NavItem[] = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/ledger", label: "Ledger", icon: BookOpen },
    { href: "/udhari", label: "Udhari Khata", icon: HandCoins },
    { href: "/aeps", label: "AePS Cash", icon: Fingerprint },
    { href: "/services", label: "Services", icon: Briefcase },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/notifications", label: "Notifications", icon: Bell, badge: unreadCount },
    { href: "/profile", label: "My Profile", icon: UserCircle },
    { href: "/sessions", label: "Active Sessions", icon: MonitorSmartphone },
    { href: "/pwa-status", label: "App & Offline", icon: WifiOff },
    { href: "/download-app", label: "Download App", icon: ArrowDownToLine },
    { href: "/about", label: "About & Docs", icon: Info },
  ];

  const adminNavItems: NavItem[] = isAdmin ? [
    { href: "/users", label: "User Management", icon: Users, badge: pendingCount },
    { href: "/audit-logs", label: "Audit Logs", icon: History },
    { href: "/backups", label: "Backups", icon: Database },
    { href: "/server-health", label: "Server Health", icon: HeartPulse },
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
    if (location === "/") return "Dashboard";
    const seg = location.split("/")[1];
    return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  })();

  const firstName = displayName.split(" ")[0];
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();
  const greetingEmoji = (() => {
    const h = new Date().getHours();
    if (h < 12) return "☀️";
    if (h < 17) return "👋";
    return "🌙";
  })();
  const shortDate = new Date().toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short",
  });

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 fixed inset-y-0 z-10">
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
      </div>

      <div className="flex-1 flex flex-col md:ml-64">
        {/* Mobile Top Header — Redesigned */}
        <header className="sticky top-0 z-20 md:hidden">
          {/* Top accent stripe: navy → saffron */}
          <div style={{ height: 3, background: "linear-gradient(90deg, #0b2c60 0%, #1e4fa8 35%, #f97316 70%, #fb923c 100%)" }} />

          {/* Main header bar */}
          <div
            className="flex items-center justify-between px-4 bg-white"
            style={{
              height: 60,
              boxShadow: "0 1px 0 rgba(0,0,0,0.06), 0 4px 20px rgba(11,44,96,0.08)",
            }}
          >
            {/* ── Left: logo badge + brand ── */}
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center rounded-2xl flex-shrink-0"
                style={{
                  width: 38, height: 38,
                  background: "linear-gradient(135deg, #0b2c60 0%, #1a4a9e 100%)",
                  boxShadow: "0 2px 8px rgba(11,44,96,0.30)",
                }}
              >
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "0.05em", lineHeight: 1 }}>CSC</span>
                  <div style={{ width: 20, height: 1.5, background: "#f97316", borderRadius: 1, marginTop: 2 }} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span style={{ fontSize: 15, fontWeight: 900, color: "#0b2c60", letterSpacing: "0.02em", lineHeight: 1 }}>SAHU</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: "#f97316", letterSpacing: "0.02em", lineHeight: 1 }}>CSC</span>
                </div>
                <span style={{ fontSize: 9.5, color: "#94a3b8", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1, marginTop: 2, display: "block" }}>
                  Management Platform
                </span>
              </div>
            </div>

            {/* ── Right: bell + avatar chip (opens nav drawer) ── */}
            <div className="flex items-center gap-2">
              {/* Notification bell */}
              <Link href="/notifications">
                <button
                  className="relative flex items-center justify-center rounded-xl"
                  style={{ width: 38, height: 38, background: "#f1f5f9", border: "1px solid #e2e8f0" }}
                >
                  <Bell size={17} color="#475569" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute"
                      style={{ top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: "#f97316", border: "2px solid white" }}
                    />
                  )}
                </button>
              </Link>

              {/* Avatar chip — tapping opens the nav drawer */}
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    className="flex items-center gap-2 rounded-xl"
                    style={{
                      padding: "4px 10px 4px 4px",
                      background: "linear-gradient(135deg, rgba(11,44,96,0.07), rgba(249,115,22,0.06))",
                      border: "1px solid rgba(11,44,96,0.12)",
                    }}
                  >
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={displayName}
                        className="object-cover rounded-lg"
                        style={{ width: 30, height: 30 }}
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center rounded-lg"
                        style={{
                          width: 30, height: 30,
                          background: "linear-gradient(135deg, #f97316, #ea580c)",
                          boxShadow: "0 2px 6px rgba(249,115,22,0.40)",
                          color: "#fff", fontSize: 10, fontWeight: 900,
                        }}
                      >
                        {initials}
                      </div>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0b2c60" }}>{firstName}</span>
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

          {/* Greeting sub-bar */}
          <div
            className="flex items-center justify-between px-4"
            style={{ height: 44, background: "linear-gradient(135deg, #0b2c60 0%, #0f3872 100%)" }}
          >
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.90)" }}>
                {greeting}, {firstName}
              </span>
              <span style={{ fontSize: 14 }}>{greetingEmoji}</span>
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.40)", fontWeight: 500 }}>{shortDate}</span>
          </div>
        </header>

        {/* Desktop Top Header */}
        <header className="h-16 bg-background border-b border-border hidden md:flex items-center justify-between px-8 sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-foreground">{pageTitle}</h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SyncDot />
            <button
              onClick={handleToggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-100"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Link href="/notifications">
              <Button variant="outline" size="sm" className="gap-2 relative bg-background hover:bg-muted">
                <Bell size={15} />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1 px-1.5 min-w-5 h-5 flex items-center justify-center rounded-full text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/profile">
              <Avatar className="h-8 w-8 ring-2 ring-[#f97316]/50 cursor-pointer hover:opacity-80 transition-opacity duration-100">
                {avatarSrc ? <AvatarImage src={avatarSrc} alt="Profile" className="object-cover" /> : null}
                <AvatarFallback className="bg-[#f97316] text-white text-sm font-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Sync + PWA banners */}
        <SyncStatusBar />
        <PWAInstallBanner />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
          <div className="flex items-stretch h-16">
            {[
              { href: "/", label: "Dashboard", icon: LayoutDashboard },
              { href: "/ledger", label: "Ledger", icon: BookOpen },
              { href: "/aeps", label: "AePS", icon: Fingerprint },
              { href: "/profile", label: "Profile", icon: UserCircle },
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
    </div>
  );
}
