import React, { useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-notifications";
import { useTheme } from "@/components/theme-provider";
import {
  LayoutDashboard, BookOpen, Briefcase, BarChart3, Bell,
  History, Users, Settings, Database, Menu,
  Fingerprint, UserCircle, WifiOff, ArrowDownToLine, HeartPulse, MonitorSmartphone,
  LogIn, Sun, Moon,
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
      <div className="px-4 pt-5 pb-4 flex items-center gap-3 border-b border-slate-200">
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-slate-200 shadow-md">
            <AppLogo size="sm" className="w-full h-full" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-extrabold text-sm leading-tight tracking-wide text-slate-900">SAHU CSC</h2>
          <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5">Management Platform</p>
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
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}
                `}
                onMouseEnter={() => prefetch(item.href)}
                onFocus={() => prefetch(item.href)}
                onTouchStart={() => prefetch(item.href)}
              >
                <div className="flex items-center gap-3">
                  <Icon size={15} className={active ? "text-white" : "text-slate-400"} />
                  <span className="text-[12px] leading-none">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`
                    text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none
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
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.15em] px-3 pt-4 pb-1.5">
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
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}
                    `}
                    onMouseEnter={() => prefetch(item.href)}
                    onFocus={() => prefetch(item.href)}
                    onTouchStart={() => prefetch(item.href)}
                  >
                    <Icon size={15} className={active ? "text-white" : "text-slate-400"} />
                    <span className="text-[12px] leading-none">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none bg-[#f97316] text-white">
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
        <span className="text-[9px] text-slate-400 font-mono tracking-wide uppercase">
          SAHU CSC v{__APP_VERSION__}
        </span>
        <span className="text-[9px] text-slate-400">© 2026</span>
      </div>

      {/* ── User Footer ────────────────────────────────────────── */}
      <div className="mx-3 mb-3 mt-0.5 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
        <Link href="/profile" className="flex-shrink-0 cursor-pointer">
          <Avatar className="h-10 w-10 ring-2 ring-[#f97316]/60 shadow-sm">
            {avatarSrc ? <AvatarImage src={avatarSrc} alt={displayName} className="object-cover" /> : null}
            <AvatarFallback className="bg-[#f97316] text-white text-sm font-black">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>

        <Link href="/profile" className="flex-1 min-w-0 cursor-pointer">
          <p className="text-[12px] font-bold text-slate-900 leading-tight truncate">{displayName}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 capitalize">{roleLabel}</p>
        </Link>

        <button
          onClick={onToggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="
            flex-shrink-0 w-8 h-8 rounded-xl border border-slate-200 bg-white
            flex items-center justify-center
            text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-100
            transition-colors duration-100 cursor-pointer
          "
        >
          {isDark ? <Sun size={13} /> : <Moon size={13} />}
        </button>

        <button
          onClick={onLogout}
          title="Logout"
          className="
            flex-shrink-0 w-8 h-8 rounded-xl border border-slate-200 bg-white
            flex items-center justify-center
            text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-100
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
    { href: "/aeps", label: "AePS Cash", icon: Fingerprint },
    { href: "/services", label: "Services", icon: Briefcase },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/notifications", label: "Notifications", icon: Bell, badge: unreadCount },
    { href: "/profile", label: "My Profile", icon: UserCircle },
    { href: "/sessions", label: "Active Sessions", icon: MonitorSmartphone },
    { href: "/pwa-status", label: "App & Offline", icon: WifiOff },
    { href: "/download-app", label: "Download App", icon: ArrowDownToLine },
  ];

  const adminNavItems: NavItem[] = isAdmin ? [
    { href: "/users", label: "User Management", icon: Users, badge: pendingCount },
    { href: "/audit-logs", label: "Audit Logs", icon: History },
    { href: "/backups", label: "Backups", icon: Database },
    { href: "/settings", label: "Settings", icon: Settings },
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
        {/* Mobile Top Header */}
        <header className="bg-sidebar sticky top-0 z-20 md:hidden shadow-md">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/20">
                <AppLogo size="sm" className="w-full h-full" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm leading-tight text-white tracking-wide">SAHU CSC</h1>
                <p className="text-[9px] text-white/50 leading-none">Management Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative h-9 w-9 text-white/60 hover:text-white hover:bg-white/10">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f97316] rounded-full border border-sidebar" />
                  )}
                </Button>
              </Link>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10">
                    <Menu size={18} />
                  </Button>
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
