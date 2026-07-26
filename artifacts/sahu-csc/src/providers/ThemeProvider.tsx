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
  useState,
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

function readStoredTheme(): Theme {
  try {
    // Migrate legacy key on first read
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      localStorage.setItem(THEME_STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return legacy as Theme;
    }
    return (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  resolvedTheme: "light",
  setTheme: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    resolveTheme(readStoredTheme())
  );

  // Apply theme to DOM and update resolvedTheme state
  const applyAndSync = useCallback((t: Theme) => {
    const resolved = resolveTheme(t);
    applyTheme(resolved);
    setResolvedTheme(resolved);
  }, []);

  // On mount: apply stored theme immediately (handles SSR/hydration edge cases)
  useEffect(() => {
    applyAndSync(theme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When theme changes: apply to DOM
  useEffect(() => {
    applyAndSync(theme);
  }, [theme, applyAndSync]);

  // System mode: listen for OS preference changes live
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyAndSync("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, applyAndSync]);

  const setTheme = useCallback(
    (next: Theme) => {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {}
      setThemeState(next);
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
