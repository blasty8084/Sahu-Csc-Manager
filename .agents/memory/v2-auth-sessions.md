---
name: V2 Auth multi-device sessions
description: V2 auth uses user_sessions table for multi-device tracking; backward-compat with V1 activeSessionToken sessions
---

## Rule
V2 auth uses the `user_sessions` table (not `users.activeSessionToken`) for session validation. `requireAuth` checks `req.session.sessionId` against `user_sessions`; if absent it falls back to V1 `req.session.sessionToken` vs `users.activeSessionToken`.

**Why:** Enables multi-device sessions (each login creates a separate `user_sessions` row), session management dashboard, remember-me durations, and device tracking. V1 only allowed one active session per user.

**How to apply:**
- New logins set both `req.session.sessionId` (V2) and `req.session.sessionToken` (V1 compat)
- `requireAuth` in `artifacts/api-server/src/lib/auth.ts`: checks `sessionId` → user_sessions first; falls back to sessionToken → activeSessionToken
- Session duration: normal = 8h, rememberMe = 30d; set via `req.session.cookie.maxAge` and `userSessionsTable.expiresAt`
- `POST /auth/login` accepts `rememberMe: boolean` in body (not in OpenAPI spec; sent via direct fetch in `use-auth.tsx`)
- Account status: `users.status` (ACTIVE/INACTIVE/SUSPENDED/LOCKED/DELETED); failed logins tracked via `users.failedLoginAttempts`; 5 failures → LOCKED for 15 min
- Session management API: `GET /api/sessions`, `DELETE /api/sessions/:id`, `DELETE /api/sessions/others`
- Frontend `use-auth.tsx`: `handleLogin` bypasses generated `useLogin` hook and calls `POST /api/auth/login` directly (to pass rememberMe)
