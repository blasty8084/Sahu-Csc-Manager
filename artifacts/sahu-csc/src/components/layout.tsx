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
  SlidersHorizontal,
  LayoutGrid
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
    { href: "/preferences", label: "Preferences", icon: SlidersHorizontal },
    ...(isAdmin ? [
      { href: "/users-overview", label: "Users Overview", icon: LayoutGrid },
      { href: "/users", label: "User Management", icon: Users },
      { href: "/audit-logs", label: "Audit Logs", icon: History },
      { href: "/backups", label: "Backups", icon: Database },
      { href: "/settings", label: "Settings", icon: Settings },
    ] : []),
  ];

  const initials = (user?.fullName || user?.username || "U").charAt(0).toUpperCase();
  const avatarSrc = (user as any)?.profilePicture;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="p-6 flex items-center gap-3 border-b border-sidebar-border/50">
        <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center font-bold text-xl shadow-sm">
          S
        </div>
        <div>
          <h2 className="font-bold text-lg leading-tight">SAHU CSC</h2>
          <p className="text-xs text-sidebar-foreground/70">Management Platform</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors group ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground'}`}>
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"} />
                  <span>{item.label}</span>
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
      
      <div className="p-4 border-t border-sidebar-border/50">
        <div className="flex items-center justify-between p-2">
          <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity cursor-pointer">
            <Avatar className="h-9 w-9 border border-sidebar-border flex-shrink-0">
              {avatarSrc ? <AvatarImage src={avatarSrc} alt="Profile" className="object-cover" /> : null}
              <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium leading-none mb-1 truncate">{user?.fullName || user?.username}</span>
              <span className="text-xs text-sidebar-foreground/60 capitalize">{user?.role}</span>
            </div>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => logout()} className="text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 h-8 w-8 flex-shrink-0">
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      <div className="hidden md:block w-64 fixed inset-y-0 z-10">
        <SidebarContent />
      </div>
      
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 sticky top-0 z-20 md:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-bold text-primary-foreground text-sm">
              S
            </div>
            <h1 className="font-bold text-lg">SAHU CSC</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                )}
              </Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <header className="h-16 bg-background border-b border-border hidden md:flex items-center justify-between px-8 sticky top-0 z-20">
          <h1 className="text-xl font-semibold capitalize">
            {location === "/" ? "Dashboard" : location.split('/')[1].replace('-', ' ')}
          </h1>
          <div className="flex items-center gap-3">
            <Link href="/notifications">
              <Button variant="outline" size="sm" className="gap-2 relative bg-background hover:bg-muted">
                <Bell size={16} />
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

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
