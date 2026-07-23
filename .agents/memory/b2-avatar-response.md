---
name: B2 avatar response contract
description: Keeps B2-backed profile pictures renderable across auth, header, sidebar, and profile screens.
---

Database values prefixed with `b2:` are storage references, not browser image URLs. Any API response consumed by the frontend must resolve them to a short-lived signed GET URL before returning them. This includes `/auth/me` and login/2FA responses, not only `/profile`.

**Why:** The global header and sidebar consume the authenticated user object, while the profile page consumes `/profile`. Resolving only the profile route caused the same avatar to work in one screen but appear as a broken image or initials elsewhere.

**How to apply:** Keep B2 key resolution centralized in the auth/profile response formatters, and invalidate both profile and auth-user query caches after avatar upload or deletion.