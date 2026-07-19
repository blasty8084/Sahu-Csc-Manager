import React from "react";
import { Link } from "wouter";
import { prefetch } from "@/lib/prefetch";

export type NavItem = {
  href: string;
  label: string;
  mobileOnly?: boolean;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  badge?: number;
};

interface NavLinkProps {
  item: NavItem;
  active: boolean;
}

/**
 * Sidebar nav link — active styling, badge pill, prefetch on hover/focus/touch.
 * Used by both Sidebar (main + admin sections) and any future sidebar-style nav.
 */
export function NavLink({ item, active }: NavLinkProps) {
  const Icon = item.icon;
  return (
    <Link href={item.href}>
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
}
