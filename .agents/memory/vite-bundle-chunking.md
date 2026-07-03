---
name: Vite manual vendor chunking
description: How to keep production JS bundles under Vite's chunk-size warning without touching app code
---

## Rule
When Vite's build warns about chunks over ~500KB, add a `manualChunks` entry per independent vendor library group in `build.rollupOptions.output` rather than raising `chunkSizeWarningLimit` alone.

**Why:** Without explicit grouping, Rollup tends to fold many unrelated third-party libs (radix-ui primitives, i18next, react-hook-form, date-fns, react-icons, etc.) into the same "main" entry chunk alongside app code, producing one oversized chunk that's slow to parse on first load and busts cache on every app deploy even when the vendor code didn't change.

## How to apply
- Group by *library family*, not by page — e.g. all `@radix-ui/*` packages into one `vendor-radix` chunk, `i18next` + `react-i18next` into `vendor-i18n`, form libs (`react-hook-form`, `@hookform/resolvers`, `zod`) into `vendor-forms`.
- Each named chunk becomes its own cache-stable file — vendor code changes far less often than app code, so this improves long-term caching too.
- Only raise `chunkSizeWarningLimit` for genuinely large single libraries you can't split further (e.g. `jspdf`, `html2canvas`, `recharts`) — these are typically already dynamic-imported/code-split by the app itself.
- Re-run `pnpm run build` after changing `manualChunks` and check the printed chunk sizes — don't just trust that the warning disappeared, confirm no chunk regressed to >500KB gzip-uncompressed.
