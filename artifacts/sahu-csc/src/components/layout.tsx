import React, { useCallback, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { motion, AnimatePresence } from "framer-motion";
import { usePerformanceTier } from "@/hooks/use-performance-tier";
import { useNavItems } from "@/hooks/use-nav-items";
import { SidebarNav } from "./layout/Sidebar";
import { BottomNav } from "./layout/BottomNav";
import { TopHeader } from "./layout/TopHeader";
import { DesktopHeader } from "./layout/DesktopHeader";
import { UserMenu } from "./layout/UserMenu";
import { SyncStatusBar } from "@/components/sync-status-bar";
import { PWAInstallBanner } from "@/components/pwa-install-banner";
import { SetupWizardBanner } from "@/components/setup-wizard-banner";
import { ServerHealthBanner } from "@/components/server-health-banner";
import { WhatsNewModal } from "@/components/whats-new-modal";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { scaleDuration } = usePerformanceTier();
  const { mainNavItems, adminNavItems, unreadCount } = useNavItems();
  const isAdmin = user?.role === "admin";

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const handleLogout = useCallback(() => setShowLogoutConfirm(true), []);
  const confirmLogout = useCallback(() => { setShowLogoutConfirm(false); logout(); }, [logout]);

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const handleToggleTheme = useCallback(() => setTheme(isDark ? "light" : "dark"), [isDark, setTheme]);

  const initials = (user?.fullName || user?.username || "U").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const avatarSrc = (user as any)?.profilePicture;
  const displayName = user?.fullName || user?.username || "User";
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "";
  const firstName = displayName.split(" ")[0];

  const sharedProps = { mainNavItems, adminNavItems, initials, avatarSrc, displayName, roleLabel, isDark, onToggleTheme: handleToggleTheme, onLogout: handleLogout };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">

      {/* Desktop Sidebar — fixed 240 px left column */}
      <div className="hidden md:block w-64 fixed inset-y-0 z-10">
        <SidebarNav {...sharedProps} location={location} />
      </div>

      <div className="flex-1 flex flex-col md:ml-64">
        <TopHeader {...sharedProps} firstName={firstName} unreadCount={unreadCount} />
        <DesktopHeader isDark={isDark} onToggleTheme={handleToggleTheme} unreadCount={unreadCount} initials={initials} avatarSrc={avatarSrc} firstName={firstName} />

        <SyncStatusBar />
        <PWAInstallBanner />
        {isAdmin && <SetupWizardBanner />}
        {isAdmin && <ServerHealthBanner />}
        <WhatsNewModal />

        {/* Page content — opacity-only transition avoids layout recalc on every frame */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.div
              key={location}
              className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: scaleDuration(150) / 1000, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomNav />
      </div>

      <UserMenu open={showLogoutConfirm} onCancel={() => setShowLogoutConfirm(false)} onConfirm={confirmLogout} />
    </div>
  );
}
