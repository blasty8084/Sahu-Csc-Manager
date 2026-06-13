import React, { useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useListNotifications } from "@workspace/api-client-react";
import { useIdleTimer } from "@/hooks/use-idle-timer";
import {
  LayoutDashboard, BookOpen, Briefcase, BarChart3, Bell,
  History, Users, Settings, Database, LogOut, Menu,
  Fingerprint, UserCircle, LayoutGrid, WifiOff, ArrowDownToLine, HeartPulse, MonitorSmartphone,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppLogo } from "@/components/app-logo";
import { PWAInstallBanner } from "@/components/pwa-install-banner";
import { SyncStatusBar, SyncDot } from "@/components/sync-status-bar";

function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins > 0) return `${mins}:${String(secs).padStart(2, "0")}`;
  return `${secs}s`;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const { data: notificationsData } = useListNotifications({ unreadOnly: true });
  const unreadCount = Array.isArray(notificationsData) ? notificationsData.length : 0;

  const isAdmin = user?.role === "admin";

  const handleIdle = useCallback(() => {
    logout();
  }, [logout]);

  const { isWarning, remaining, resetTimer } = useIdleTimer(
    30 * 60 * 1000,
    2 * 60 * 1000,
    handleIdle
  );

  const mainNavItems = [
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

  const adminNavItems = isAdmin ? [
    { href: "/users-overview", label: "Users Overview", icon: LayoutGrid },
    { href: "/users", label: "User Management", icon: Users },
    { href: "/audit-logs", label: "Audit Logs", icon: History },
    { href: "/backups", label: "Backups", icon: Database },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/server-health", label: "Server Health", icon: HeartPulse },
  ] : [];

  const bottomNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/ledger", label: "Ledger", icon: BookOpen },
    { href: "/aeps", label: "AePS", icon: Fingerprint },
    { href: "/profile", label: "My Profile", icon: UserCircle },
  ];

  const initials = (user?.fullName || user?.username || "U").charAt(0).toUpperCase();
  const avatarSrc = (user as any)?.profilePicture;

  const isActive = (href: string) =>
    location === href || (href !== "/" && location.startsWith(href));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Header — circular logo + title + grid icon */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
              <circle cx="20" cy="20" r="20" fill="currentColor" className="text-sidebar-primary" />
              <path d="M20 8 L28 12 L28 20 C28 25 24 29 20 31 C16 29 12 25 12 20 L12 12 Z" fill="white" fillOpacity="0.25" />
              <text x="20" y="25" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold" fontFamily="Inter, sans-serif">S</text>
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-[15px] leading-tight text-sidebar-foreground">
              SAHU <span className="text-sidebar-primary">CSC</span>
            </h2>
            <p className="text-[11px] text-sidebar-foreground/55 leading-tight">Management Platform</p>
          </div>
        </div>
        <div className="w-7 h-7 rounded-md border border-sidebar-border/30 flex items-center justify-center text-sidebar-foreground/35 flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto py-2 px-2.5 space-y-0.5">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center justify-between px-3 py-[10px] rounded-xl cursor-pointer transition-all group ${active ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"}`}>
                <div className="flex items-center gap-3">
                  <Icon
                    size={16}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={active ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"}
                  />
                  <span className="text-[13px]">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${active ? "bg-white/30 text-white" : "bg-sidebar-primary text-sidebar-primary-foreground"}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {/* Admin Section */}
        {adminNavItems.length > 0 && (
          <>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/35 px-3 pt-4 pb-2">
              Admin
            </p>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3 px-3 py-[10px] rounded-xl cursor-pointer transition-all group ${active ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"}`}>
                    <Icon
                      size={16}
                      strokeWidth={active ? 2.5 : 1.8}
                      className={active ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"}
                    />
                    <span className="text-[13px]">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </div>

      {/* Version */}
      <div className="px-5 py-2 flex items-center justify-between">
        <span className="text-[10px] text-sidebar-foreground/28 font-mono tracking-wide">SAHU CSC v{__APP_VERSION__}</span>
        <span className="text-[10px] text-sidebar-foreground/22">© 2026</span>
      </div>

      {/* User Footer — rounded card */}
      <div className="mx-3 mb-3 px-3 py-3 rounded-xl bg-sidebar-accent/20 flex items-center gap-3">
        <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
          <Avatar className="h-9 w-9 flex-shrink-0">
            {avatarSrc ? <AvatarImage src={avatarSrc} alt="Profile" className="object-cover" /> : null}
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-semibold leading-tight truncate text-sidebar-foreground">{user?.fullName || user?.username}</span>
            <span className="text-[11px] text-sidebar-foreground/45 capitalize leading-tight">{user?.role}</span>
          </div>
        </Link>
        <Button
          variant="ghost" size="icon"
          onClick={() => logout()}
          className="text-sidebar-foreground/35 hover:text-destructive hover:bg-destructive/10 h-7 w-7 flex-shrink-0"
        >
          <LogOut size={14} />
        </Button>
      </div>
    </div>
  );

  const pageTitle = (() => {
    if (location === "/") return "Dashboard";
    const seg = location.split("/")[1];
    return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  })();

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 fixed inset-y-0 z-10">
        <SidebarContent />
      </div>

      <div className="flex-1 flex flex-col md:ml-64">
        {/* Mobile Top Header */}
        <header className="bg-sidebar sticky top-0 z-20 md:hidden shadow-md">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-3">
              <AppLogo size="sm" />
              <div>
                <h1 className="font-bold text-sm leading-tight text-sidebar-foreground">SAHU CSC</h1>
                <p className="text-[10px] text-sidebar-foreground/60 leading-none">Management Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative h-9 w-9 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sidebar-primary rounded-full border border-sidebar" />
                  )}
                </Button>
              </Link>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
                    <Menu size={18} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 border-0">
                  <SidebarContent />
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
              <Avatar className="h-8 w-8 border border-border cursor-pointer hover:opacity-80 transition-opacity">
                {avatarSrc ? <AvatarImage src={avatarSrc} alt="Profile" className="object-cover" /> : null}
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Sync status + PWA install banners */}
        <SyncStatusBar />
        <PWAInstallBanner />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
          <div className="flex items-stretch h-16">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} className="flex-1">
                  <div className={`flex flex-col items-center justify-center h-full gap-1 relative transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                    {active && (
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                    )}
                    <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                    <span className={`text-[10px] font-semibold leading-none ${active ? "text-primary" : "text-muted-foreground"}`}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Idle Timeout Warning Dialog */}
      <AlertDialog open={isWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Session About to Expire
            </AlertDialogTitle>
            <AlertDialogDescription>
              You've been inactive for a while. For your security, you'll be automatically
              logged out in{" "}
              <strong className="text-foreground font-mono text-base">
                {formatCountdown(remaining)}
              </strong>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0"
              onClick={() => logout()}
            >
              Logout Now
            </AlertDialogCancel>
            <AlertDialogAction onClick={resetTimer}>
              Stay Logged In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
