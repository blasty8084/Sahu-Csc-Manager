/**
 * ThemeProvider — canonical location for theme state.
 *
 * Supports light / dark / system modes.
 * Persists choice in localStorage key "sahu-theme".
 * Syncs <html class="dark"> on every change.
 * System mode tracks the OS preference live via a matchMedia listener.
 *
 * A no-flash inline <script> in index.html reads the same key before React
 * hydrates so the correct class is already on <html> on first paint.
 *
 * NOTE: This provider is intentionally decoupled from the API/settings layer.
 * If the user's server-stored theme preference should override the local one,
 * call setTheme() from a hook that already has settings data (e.g. useProfileData).
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  /** The stored preference — "light" | "dark" | "system" */
  theme: Theme;
  /** The resolved visual mode — always "light" or "dark" (never "system") */
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const THEME_STORAGE_KEY = "sahu-theme";
const LEGACY_STORAGE_KEY = "sahu-csc-theme"; // migrate old installs
const DEFAULT_THEME: Theme = "light";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme;
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
}

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function readStoredTheme(): Theme {
  try {
    // Migrate legacy key on first read
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (isTheme(legacy)) {
      localStorage.setItem(THEME_STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return legacy;
    }
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

// Theme is visual state rather than application data. Keeping the store outside
// the React tree lets the DOM class and CSS variables change synchronously while
// only components that explicitly call useTheme() receive a React update.
interface ThemeSnapshot {
  theme: Theme;
  resolvedTheme: "light" | "dark";
}

const SERVER_SNAPSHOT: ThemeSnapshot = {
  theme: DEFAULT_THEME,
  resolvedTheme: "light",
};
const INITIAL_THEME = readStoredTheme();
let themeSnapshot: ThemeSnapshot = {
  theme: INITIAL_THEME,
  resolvedTheme: resolveTheme(INITIAL_THEME),
};
const themeListeners = new Set<() => void>();

function subscribeTheme(listener: () => void) {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
}

function getThemeSnapshot(): ThemeSnapshot {
  return themeSnapshot;
}

function getServerThemeSnapshot(): ThemeSnapshot {
  return SERVER_SNAPSHOT;
}

function updateThemeSnapshot(next: Theme) {
  const resolvedTheme = resolveTheme(next);
  if (themeSnapshot.theme === next && themeSnapshot.resolvedTheme === resolvedTheme) {
    return;
  }
  themeSnapshot = { theme: next, resolvedTheme };
  applyTheme(resolvedTheme);
  themeListeners.forEach((listener) => listener());
}

// ── Context ───────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  resolvedTheme: "light",
  setTheme: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme } = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  // Keep the no-flash class and external store aligned after mount.
  useEffect(() => {
    applyTheme(themeSnapshot.resolvedTheme);
  }, []);

  // System mode: listen for OS preference changes live
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => updateThemeSnapshot("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback(
    (next: Theme) => {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {}
      // Apply before notifying React so there is no geometry-changing
      // intermediate render during a visual-only theme change.
      updateThemeSnapshot(next);
    },
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
