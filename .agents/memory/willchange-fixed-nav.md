---
name: willChange breaks position fixed
description: page-transition motion.div must not have willChange transform — it creates a new CSS containing block that breaks position: fixed on the bottom nav
---

## Rule

The Framer Motion page-transition `<motion.div>` in `artifacts/sahu-csc/src/App.tsx` must use `style={{ minHeight: "100vh" }}` — no `willChange` property.

## Why

`willChange: "opacity, transform"` (or any active CSS `transform`, `perspective`, or `filter` on an ancestor) creates a new **CSS containing block** for `position: fixed` descendants. This is specified browser behaviour. When the bottom `<nav className="fixed bottom-0 ...">` in `layout.tsx` lives inside such an ancestor, `fixed` becomes relative to that div rather than the viewport — causing the nav to scroll with the page.

The nav's CSS (`fixed bottom-0 left-0 right-0 z-30`) and the main content's padding (`pb-24`) were always correct. Only the containing block was wrong.

## How to apply

- Never add `willChange: transform`, `transform`, `perspective`, `filter`, or `will-change` to any wrapper that is an ancestor of a `position: fixed` element.
- Framer Motion handles GPU compositing for `opacity` and `y` transitions internally — no explicit `willChange` hint is needed or beneficial.
- If a new animated wrapper is ever added around `<Layout>` or above it, verify it does not have any of the above CSS properties.
