/**
 * Backward-compatibility re-export shim.
 * Canonical implementation lives in providers/ThemeProvider.tsx.
 * All existing consumers (layout.tsx, useProfileData.ts, preferences.tsx)
 * import from this path — no import changes needed in those files.
 */
export { ThemeProvider, useTheme, THEME_STORAGE_KEY } from "@/providers/ThemeProvider";
export type { Theme } from "@/providers/ThemeProvider";
