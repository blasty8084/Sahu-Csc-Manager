---
name: Color token replacement pass
description: How the hardcoded-hex → CSS variable replacement was done, what tooling worked, and what stays intentionally un-tokenized.
---

# Color token replacement (v4.9.5)

## What was done
Three-pass Node.js script (`scripts/replace-colors.mjs`) replaced all hardcoded hex/rgba color literals in `artifacts/sahu-csc/src/components/` and `src/pages/` with CSS variable references defined in `src/index.css`.

**~355+ files touched across 3 runs.**

## Critical bug to avoid
The original `rgba()` helper called `.replace(".", "\\.")` on alphaStr — but alphaStr values containing regex metacharacters (like `"0\\.3(?:0)?"`) got double-escaped and the pattern silently failed to match.

**Fix:** Pass alphaStr as a raw regex fragment (already containing `\\.` for literal dot) and do NOT call `.replace()` on it inside the helper. The helper just interpolates: `` `rgba\\(\\s*${r}\\s*,\\s*${g}\\s*,\\s*${b}\\s*,\\s*${alphaRe}\\s*\\)` ``

## Token map (src/index.css :root)
- Navy: `--brand-navy` through `--brand-navy-500`, plus alpha tints `--brand-navy-tint-xs/sm/md`, `--brand-navy-border`, `--brand-navy-border-md`, `--brand-navy-shadow-sm/md/` 
- Orange: `--brand-orange` through `--brand-orange-300`, alpha tints `--brand-orange-tint-xs/sm/tint-18/tint-07/tint-md/tint-soft`, `--brand-orange-border`, `--brand-orange-glow`
- White overlays: `--brand-white-glass/low/mid/high/border/25/30`
- Semantic: `--color-success`, `--color-error`, `--color-warning`, `--color-slate-*`, `--color-gray-*`, etc.

## What is intentionally NOT tokenized
- `rgba(255,255,255,0.45+)` — high-alpha white *text* on dark navy panels. These are contrast values on colored backgrounds; they adapt naturally with the background.
- `rgba(0,0,0,0.04–0.28)` — universal box-shadow blacks. Work in all themes.
- `#fff` / `#000` — universal white/black.

## How to run again
```
node scripts/replace-colors.mjs
```
Script is idempotent — already-replaced `var(--...)` strings are not touched.

**Why:** Run again after adding new components that contain hardcoded colors, or after adding new tokens to index.css.
