---
name: App logo file
description: Primary brand logo location and component usage; both sidebar and auth-page logos use the same PNG.
---

The primary brand logo is `artifacts/sahu-csc/public/sahu-logo.png`.

Both exported components in `artifacts/sahu-csc/src/components/app-logo.tsx` reference it:
- `AppLogo` — used in the sidebar / header (renders the PNG with configurable size)
- `LoginLogo` — used on all auth pages: `login.tsx`, `register.tsx`, `forgot-password.tsx`

**Why:** An old placeholder (`logo.png` and an inline orange "S" text-box) was replaced with the real `sahu-logo.png`. All auth pages must use `LoginLogo` from `app-logo.tsx` — never recreate an inline box or SVG placeholder.

**How to apply:** When adding a new auth page or updating any existing auth page header, always `import { LoginLogo } from "@/components/app-logo"` and render `<LoginLogo size={52} />` in the compact navy header section.
