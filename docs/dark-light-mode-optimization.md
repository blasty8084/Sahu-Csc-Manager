# Dark / Light Mode — 5-Step Optimization Plan

**Project:** SAHU CSC v4.9.3  
**Status:** Pending implementation

---

## Step 1 — Eliminate Theme Flash (FOIT)

**File:** `artifacts/sahu-csc/index.html`

Add a blocking script in `<head>` before any stylesheet so the correct class is on `<html>` before first paint:

```html
<script>
  (function () {
    const t = localStorage.getItem("vite-ui-theme");
    const sys = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.classList.add(t === "dark" || t === "light" ? t : sys);
  })();
</script>
```

**Why:** `ThemeProvider` applies the class inside a `useEffect` — too late. Users see a white flash on every hard refresh in dark mode.

---

## Step 2 — Replace Hardcoded Inline Hex Colors

**Files:** `TwoFactorSection.tsx`, `ProfileDesktopBanner.tsx`, `PermissionCard.tsx`, `PermissionRow.tsx`, `ProfilePermissionsSection.tsx`

Add semantic tokens to `index.css`:

```css
:root { --surface-security: #EEF0FF; --color-brand: #4F46E5; --surface-navy: #0B1340; }
.dark  { --surface-security: #1e1b4b; --color-brand: #818CF8; --surface-navy: #0f172a; }
```

Replace all `style={{ background: "#EEF0FF" }}` with `className="bg-[var(--surface-security)]"`.

**Why:** Inline `style` props bypass Tailwind's `dark:` system entirely — dark mode has zero effect on them.

---

## Step 3 — Add System Theme Change Listener

**File:** `artifacts/sahu-csc/src/components/theme-provider.tsx`

Inside the `useEffect`, listen for OS preference changes when `theme === "system"`:

```ts
if (theme === "system") {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = (dark: boolean) => {
    root.classList.remove("light", "dark");
    root.classList.add(dark ? "dark" : "light");
  };
  const handler = (e: MediaQueryListEvent) => apply(e.matches);
  mq.addEventListener("change", handler);
  apply(mq.matches);
  return () => mq.removeEventListener("change", handler);
}
```

**Why:** The current code applies the OS theme once on mount and never updates it — switching to auto dark mode at sunset has no effect.

---

## Step 4 — Fix Settings vs. localStorage Priority Conflict

**File:** `artifacts/sahu-csc/src/components/profile/ProfilePreferencesForm.tsx`

When the user saves a theme preference, write to `localStorage` in addition to the DB:

```ts
onValueChange={v => {
  prefsForm.setValue("theme", v as "light" | "dark");
  localStorage.setItem("vite-ui-theme", v);   // ← add this
}}
```

Then remove the `settings.theme` override effect from `ThemeProvider` — `localStorage` (hydrated by the Step 1 script) becomes the single runtime source of truth.

**Why:** `ThemeProvider` currently reads `localStorage` first, then overwrites with the API settings response. If they differ, the theme changes after first render — a second visible flash.

---

## Step 5 — Audit Dark-Mode Gaps in 29 Component Files

**Known gaps** (verified by grep — only 110 `dark:` uses across 29 of ~80 component files):

| Component | Gap |
|---|---|
| `PermissionCard.tsx` | `background: "#fff"` and `color: "#1E293B"` hardcoded — card is unreadable in dark mode |
| `PermissionRow.tsx` | `border-gray-100` and `bg-white` row container — invisible borders in dark |
| `TwoFactorSection.tsx` | White method-picker cards (`bg-white`, `bg-fafafa`) have no `dark:` equivalent |
| `ProfilePermissionsSection.tsx` | Status banner uses raw `rgba()` — not theme-aware |
| `ProfileDesktopBanner.tsx` | Navy gradient fine but action buttons use `bg-white/10` — check contrast in dark |

**Fix pattern** (apply file by file):

```
bg-white        →  bg-card
text-gray-900   →  text-foreground
text-gray-500   →  text-muted-foreground
border-gray-100 →  border-border
bg-gray-50      →  bg-muted/30
```

For any `style={{ background: "#..." }}` use the CSS variable from Step 2 instead.

---

## Quick Reference — Priority Order

| Step | Effort | Impact | Do first? |
|------|--------|--------|-----------|
| 1 — FOIT blocking script | 5 min | High — eliminates flash for all users | ✅ Yes |
| 3 — System listener | 10 min | Medium — auto dark/light at OS level | ✅ Yes |
| 4 — Settings/localStorage sync | 15 min | Medium — eliminates secondary flash | ✅ Yes |
| 2 — CSS variables | 1–2 hr | High — fixes 15+ components at once | Next |
| 5 — Component audit | 2–3 hr | High — closes all remaining gaps | Last |
