---
name: Login redirect via setQueryData
description: After login, auth cache must be set directly from response body — refetch causes race condition through Replit proxy and cancels redirect
---

## Rule

After a successful login API call, set the auth cache directly:
```ts
queryClient.setQueryData(["auth/me"], userData);
```

Do NOT use `queryClient.invalidateQueries` + `refetch()` for post-login auth state update.

**Why:** The Replit proxy introduces a short delay before the newly-set session cookie is forwarded on subsequent requests. A `/api/auth/me` refetch issued immediately after login hits the proxy before the cookie is recognized → returns 401 → React Query sets `user = null` → the redirect `useEffect` in `login.tsx` never fires.

**How to apply:**
- `handleLogin` in `use-auth.tsx` parses the login response body and calls `setQueryData(["auth/me"], userData)` directly.
- `handleLogout` mirrors this: `setQueryData(["auth/me"], null)` then `queryClient.clear()`.
- `login.tsx` has a `useEffect` that calls `setLocation("/")` when `user` becomes truthy — this is the redirect trigger.

## Related

- `connect-pg-simple` must be in `build.mjs` `external` array (see `session-store-pool.md`) — without it sessions never persist and `/api/auth/me` always returns 401 regardless of cookie state.
