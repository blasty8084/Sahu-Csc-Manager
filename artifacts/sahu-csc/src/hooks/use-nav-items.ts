import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-notifications";
import { usePendingCount } from "@/hooks/use-pending-count";
import type { NavItem } from "@/components/layout/NavLink";
import {
  LayoutDashboard, BookOpen, Briefcase, BarChart3, Bell,
  History, Users, Database, Megaphone, FileArchive,
  Fingerprint, UserCircle, WifiOff, ArrowDownToLine, HeartPulse,
  MonitorSmartphone, Info, HandCoins,
} from "lucide-react";

/**
 * Builds the main and admin nav item arrays used by Layout, Sidebar, and TopHeader.
 * Also returns `unreadCount` so Layout doesn't need to call useUnreadCount separately.
 */
export function useNavItems() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: unreadCount = 0 } = useUnreadCount();
  const isAdmin = user?.role === "admin";
  const { data: pendingCountData } = usePendingCount();
  const pendingCount = isAdmin ? (pendingCountData?.count ?? 0) : 0;

  const mainNavItems: NavItem[] = [
    { href: "/",              label: t("nav.dashboard"),   icon: LayoutDashboard },
    { href: "/ledger",        label: t("nav.ledger"),      icon: BookOpen },
    { href: "/udhari",        label: t("nav.udhari"),      icon: HandCoins },
    { href: "/aeps",          label: t("nav.aeps"),        icon: Fingerprint },
    { href: "/services",      label: t("nav.services"),    icon: Briefcase },
    { href: "/reports",       label: t("nav.reports"),     icon: BarChart3 },
    { href: "/notifications", label: t("nav.notifications"), icon: Bell, badge: unreadCount },
    { href: "/profile",       label: t("nav.profile"),     icon: UserCircle },
    { href: "/sessions",      label: t("nav.sessions"),    icon: MonitorSmartphone, mobileOnly: true },
    { href: "/pwa-status",    label: t("nav.pwa_status"),  icon: WifiOff },
    { href: "/download-app",  label: t("nav.download_app"), icon: ArrowDownToLine },
    { href: "/about",         label: t("nav.about"),       icon: Info },
  ];

  const adminNavItems: NavItem[] = isAdmin ? [
    { href: "/users",          label: t("nav.user_management"), icon: Users,       badge: pendingCount },
    { href: "/broadcast",      label: t("nav.broadcast"),       icon: Megaphone },
    { href: "/receipt-export", label: t("nav.receipt_export"),  icon: FileArchive },
    { href: "/audit-logs",     label: t("nav.audit_logs"),      icon: History },
    { href: "/backups",        label: t("nav.backups"),         icon: Database },
    { href: "/server-health",  label: t("nav.server_health"),   icon: HeartPulse },
  ] : [];

  return { mainNavItems, adminNavItems, unreadCount };
}
