/**
 * ThemeToggle — standalone Sun/Moon toggle.
 *
 * Calls useTheme() directly — no isDark or onToggleTheme props needed at
 * call sites. Replaces all three ad-hoc inline toggle buttons that were
 * previously prop-drilled through Layout → TopHeader / DesktopHeader / Sidebar.
 *
 * Variants
 * ─────────
 * "icon"    — shadcn/ui Button (variant="ghost", size="icon"); for white header bars.
 * "sidebar" — matches the sidebar user-footer pill style (white/5 bg, white/15 border).
 *
 * Accessibility
 * ─────────────
 * • aria-label and title update with the resolved theme.
 * • focus-visible ring on both variants.
 * • Keyboard: Space / Enter trigger the toggle (native button behaviour).
 */
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ThemeToggleProps {
  /**
   * "icon"    — Button from shadcn/ui; fits white header bars.
   * "sidebar" — Sidebar-footer pill style (dark bg, white text).
   */
  variant?: "icon" | "sidebar";
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation();

  const isDark = resolvedTheme === "dark";
  const label = isDark
    ? t("nav.switch_light", "Switch to light mode")
    : t("nav.switch_dark", "Switch to dark mode");

  const toggle = () => setTheme(isDark ? "light" : "dark");

  // ── Sidebar footer variant ─────────────────────────────────────────────────
  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        title={label}
        aria-pressed={isDark}
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-xl",
          "border border-white/15 bg-white/5",
          "flex items-center justify-center",
          "text-white/40 hover:text-white hover:border-white/30 hover:bg-white/12",
          "transition-colors duration-100 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
          className,
        )}
      >
        {isDark ? <Sun size={13} aria-hidden /> : <Moon size={13} aria-hidden />}
      </button>
    );
  }

  // ── Default icon variant (header bars) ────────────────────────────────────
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-pressed={isDark}
      className={cn(
        "h-8 w-8 rounded-lg",
        "border border-border bg-muted/60",
        "text-muted-foreground hover:text-foreground hover:bg-muted",
        "transition-colors duration-100",
        className,
      )}
    >
      {isDark
        ? <Sun  size={15} aria-hidden />
        : <Moon size={15} aria-hidden />}
    </Button>
  );
}
