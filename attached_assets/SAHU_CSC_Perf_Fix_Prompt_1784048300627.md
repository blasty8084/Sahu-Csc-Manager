# SAHU CSC Manager — Perf/Bundle Optimization Fix Prompt

Apply the following fixes exactly. Do not modify any other files, chunking config, or build settings — the existing Vite manual chunking, lazy-loaded routes, image optimizer, and Workbox caching setup are already correct and must not change.

---

## Fix 1 — `artifacts/sahu-csc/package.json`: move runtime deps out of `devDependencies`

**Problem:** 51 packages that are imported directly by application source code (React, all `@radix-ui/*` components, `@tanstack/react-query`, `framer-motion`, `react-hook-form`, `recharts`, `wouter`, `zod`, `lucide-react`, `date-fns`, etc.) currently sit in `devDependencies` instead of `dependencies`. If any future deploy step runs `pnpm install --prod` before `vite build`, the build will fail because these packages won't be installed.

**Action:** In `artifacts/sahu-csc/package.json`, move every package below from `devDependencies` to `dependencies`. Keep everything else in `devDependencies` unchanged.

Move to `dependencies`:
```
@hookform/resolvers, @radix-ui/react-accordion, @radix-ui/react-alert-dialog,
@radix-ui/react-aspect-ratio, @radix-ui/react-avatar, @radix-ui/react-checkbox,
@radix-ui/react-collapsible, @radix-ui/react-context-menu, @radix-ui/react-dialog,
@radix-ui/react-dropdown-menu, @radix-ui/react-hover-card, @radix-ui/react-label,
@radix-ui/react-menubar, @radix-ui/react-navigation-menu, @radix-ui/react-popover,
@radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area,
@radix-ui/react-select, @radix-ui/react-separator, @radix-ui/react-slider,
@radix-ui/react-slot, @radix-ui/react-switch, @radix-ui/react-tabs,
@radix-ui/react-toast, @radix-ui/react-toggle, @radix-ui/react-toggle-group,
@radix-ui/react-tooltip, @tanstack/react-query, @workspace/api-client-react,
class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react,
framer-motion, input-otp, lucide-react, next-themes, react, react-day-picker,
react-dom, react-hook-form, react-resizable-panels, recharts, sonner,
tailwind-merge, tw-animate-css, vaul, wouter, zod
```

Keep in `devDependencies` (build-time-only tools):
```
@replit/vite-plugin-cartographer, @replit/vite-plugin-dev-banner,
@replit/vite-plugin-runtime-error-modal, @tailwindcss/vite, @tailwindcss/typography,
@types/node, @types/react, @types/react-dom, @vitejs/plugin-react, sharp, svgo,
tailwindcss, vite, vite-plugin-image-optimizer, vite-plugin-pwa, workbox-window
```

**Acceptance:**
- [ ] `pnpm install` completes cleanly
- [ ] `pnpm install --prod` inside `artifacts/sahu-csc` no longer errors on missing modules
- [ ] `pnpm --filter @workspace/sahu-csc run build` succeeds with no new warnings

---

## Fix 2 — Delete unused image assets from `artifacts/sahu-csc/public/`

**Problem:** Three image files sit in `public/` unreferenced anywhere in `src/`, `index.html`, or the PWA `includeAssets` list. Since Vite copies everything in `public/` verbatim into the production build, these ship as dead weight (and `logo.png` also gets swept into the service worker precache since it matches the `**/*.png` glob).

**Action:** Delete these files:
```
artifacts/sahu-csc/public/logo.png
artifacts/sahu-csc/public/logo.jpg.jpg
artifacts/sahu-csc/public/opengraph.jpg
```

Do **not** delete `sahu-logo.png` or `og-image.png` — both are actively used (`sahu-logo.png` is referenced in `App.tsx`, `splash-screen.tsx`, `app-logo.tsx`, `page-skeleton.tsx`, `about.tsx`, and preloaded in `index.html`; `og-image.png` is used in the Open Graph/Twitter meta tags in `index.html`).

**Acceptance:**
- [ ] Grep confirms no remaining references to the three deleted filenames
- [ ] `pnpm run build` output no longer contains these files
- [ ] Site favicon/splash/social-share preview still render correctly

---

## Explicitly out of scope — do not touch

- `vite.config.ts` manual chunking, image optimizer, compression plugin, PWA `injectManifest` config — already correct
- Lazy-loaded routes in `App.tsx` — already correct
- `jspdf` / `html2canvas` dynamic imports — already correct
- `admin-receipt-export.ts` client-disconnect handling — already implemented correctly (`req.on("close")` + `clientDisconnected` flag in both loops); the "open" status in `BUGS.md` for this item is stale and should be corrected to closed, not re-fixed

---

## Final check

Run `pnpm --filter @workspace/sahu-csc run build` and confirm the build succeeds with no new errors or warnings before committing.
