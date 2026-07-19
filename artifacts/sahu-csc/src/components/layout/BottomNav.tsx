import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, BookOpen, Fingerprint, UserCircle } from "lucide-react";
import { prefetch } from "@/lib/prefetch";

/** Fixed 4-tab items. AePS label is hardcoded; others use i18n keys. */
const TAB_ITEMS = [
  { href: "/",        labelKey: "nav.dashboard", staticLabel: "",    icon: LayoutDashboard },
  { href: "/ledger",  labelKey: "nav.ledger",    staticLabel: "",    icon: BookOpen },
  { href: "/aeps",    labelKey: "",              staticLabel: "AePS", icon: Fingerprint },
  { href: "/profile", labelKey: "nav.profile",   staticLabel: "",    icon: UserCircle },
] as const;

/**
 * Mobile 4-tab fixed bottom bar.
 * Self-contained — calls useLocation and useTranslation internally so Layout
 * doesn't need to pass any props.
 */
export function BottomNav() {
  const [location] = useLocation();
  const { t } = useTranslation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
      <div className="flex items-stretch h-16">
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          const label = item.staticLabel || t(item.labelKey);
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div
                className={`flex flex-col items-center justify-center h-full gap-1 relative transition-colors duration-100 ${
                  active ? "text-[#f97316]" : "text-muted-foreground"
                }`}
                onMouseEnter={() => prefetch(item.href)}
                onFocus={() => prefetch(item.href)}
                onTouchStart={() => prefetch(item.href)}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#f97316] rounded-full" />
                )}
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className={`text-[10px] font-semibold leading-none ${active ? "text-[#f97316]" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
