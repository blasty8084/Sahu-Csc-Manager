import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Sun, Moon, LogIn } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppLogo } from "@/components/app-logo";
import { NavLink } from "./NavLink";
import type { NavItem } from "./NavLink";

export type { NavItem };

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

/**
 * Desktop 240px sidebar nav — logo header, main + admin nav links, version
 * footer, and user card with theme toggle and logout.
 *
 * Extracted as a named export (not default) so it can be imported into
 * TopHeader's mobile Sheet without a circular dependency.
 *
 * Module-level declaration keeps the reference stable and prevents React from
 * destroying+recreating sidebar DOM on every Layout re-render.
 */
export function SidebarNav({
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

      {/* ── Logo header ─────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-3 border-b border-white/10">
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/20 shadow-md">
            <AppLogo size="sm" className="w-full h-full" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-extrabold text-base leading-tight tracking-wide text-white">SAHU CSC</h2>
          <p className="text-[11px] text-white/50 font-medium tracking-wide mt-0.5">{t("nav.management_platform")}</p>
        </div>
      </div>

      {/* ── Nav items ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {mainNavItems.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}

        {adminNavItems.length > 0 && (
          <>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.15em] px-3 pt-4 pb-1.5">
              {t("nav.admin")}
            </p>
            {adminNavItems.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item.href)} />
            ))}
          </>
        )}
      </div>

      {/* ── Version strip ───────────────────────────────────────── */}
      <div className="px-4 py-1.5 flex items-center justify-between">
        <span className="text-[9px] text-white/20 font-mono tracking-wide uppercase">
          SAHU CSC v{__APP_VERSION__}
        </span>
        <span className="text-[9px] text-white/20">© 2026</span>
      </div>

      {/* ── User footer ─────────────────────────────────────────── */}
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
          title={isDark ? t("nav.switch_light") : t("nav.switch_dark")}
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
          title={t("nav.logout")}
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
