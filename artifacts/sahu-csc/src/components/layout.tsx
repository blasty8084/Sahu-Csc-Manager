import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useListNotifications } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  BookOpen,
  Briefcase,
  BarChart3,
  Bell,
  History,
  Users,
  Settings,
  Database,
  LogOut,
  Menu,
  Fingerprint,
  UserCircle,
  LayoutGrid,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const { data: notificationsData } = useListNotifications({ unreadOnly: true });
  const unreadCount = Array.isArray(notificationsData) ? notificationsData.length : 0;

  const isAdmin = user?.role === "admin";

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/ledger", label: "Ledger", icon: BookOpen },
    { href: "/aeps", label: "AePS Cash", icon: Fingerprint },
    { href: "/services", label: "Services", icon: Briefcase },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/notifications", label: "Notifications", icon: Bell, badge: unreadCount },
    { href: "/profile", label: "My Profile", icon: UserCircle },
    ...(isAdmin ? [
      { href: "/users-overview", label: "Users Overview", icon: LayoutGrid },
      { href: "/users", label: "User Management", icon: Users },
      { href: "/audit-logs", label: "Audit Logs", icon: History },
      { href: "/backups", label: "Backups", icon: Database },
      { href: "/settings", label: "Settings", icon: Settings },
    ] : []),
  ];

  // Bottom nav items for mobile
  const bottomNavItems = [
    { href: "/", label: "Home", icon: LayoutDashboard },
    { href: "/ledger", label: "Ledger", icon: BookOpen },
    { href: "/aeps", label: "AePS", icon: Fingerprint },
    { href: "/profile", label: "My Profile", icon: UserCircle },
  ];

  const initials = (user?.fullName || user?.username || "U").charAt(0).toUpperCase();
  const avatarSrc = (user as any)?.profilePicture;

  const isActive = (href: string) =>
    location === href || (href !== "/" && location.startsWith(href));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="p-5 flex items-center gap-3 border-b border-sidebar-border/50">
        <div className="w-9 h-9 bg-sidebar-primary rounded-lg flex items-center justify-center font-bold text-xl shadow-sm flex-shrink-0">
          S
        </div>
        <div>
          <h2 className="font-bold text-base leading-tight">SAHU CSC</h2>
          <p className="text-xs text-sidebar-foreground/60">Management Platform</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all group ${active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm" : "hover:bg-sidebar-accent/40 text-sidebar-foreground/75 hover:text-sidebar-foreground"}`}>
                <div className="flex items-center gap-3">
                  <Icon size={17} className={active ? "text-sidebar-primary" : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/70"} />
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge variant="secondary" className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary h-5 min-w-5 flex items-center justify-center px-1 rounded-full text-[10px]">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-sidebar-border/50">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-sidebar-accent/30 transition-colors">
          <Link href="/profile" className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
            <Avatar className="h-8 w-8 border border-sidebar-border flex-shrink-0">
              {avatarSrc ? <AvatarImage src={avatarSrc} alt="Profile" className="object-cover" /> : null}
              <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold leading-none mb-0.5 truncate">{user?.fullName || user?.username}</span>
              <span className="text-[10px] text-sidebar-foreground/55 capitalize">{user?.role}</span>
            </div>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => logout()} className="text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 h-7 w-7 flex-shrink-0">
            <LogOut size={14} />
          </Button>
        </div>
      </div>
    </div>
  );

  // Page title from route
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
        <header className="h-14 bg-background border-b border-border flex items-center justify-between px-4 sticky top-0 z-20 md:hidden shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center font-bold text-primary-foreground text-sm">
              S
            </div>
            <div>
              <h1 className="font-bold text-sm leading-none">SAHU CSC</h1>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{pageTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border border-background" />
                )}
              </Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Desktop Top Header */}
        <header className="h-16 bg-background border-b border-border hidden md:flex items-center justify-between px-8 sticky top-0 z-20">
          <h1 className="text-xl font-semibold">{pageTitle}</h1>
          <div className="flex items-center gap-3">
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
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-stretch h-16">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} className="flex-1">
                  <div className={`flex flex-col items-center justify-center h-full gap-1 relative transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                    <div className="relative">
                      <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-0.5 leading-none">
                          {item.badge > 9 ? "9+" : item.badge}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium leading-none ${active ? "text-primary" : "text-muted-foreground"}`}>
                      {item.label}
                    </span>
                    {active && (
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                    )}
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
