---
name: Notification isolation rules
description: How notifications are scoped per-user, known pitfalls, and the 7 bugs fixed in v2.1.0
---

## The isolation model

`userScope(userId)` = `OR(userId = :id, userId IS NULL)`.
Any notification with `userId = null` is visible to **every** authenticated user.
This is intentional **only** for true admin broadcasts via `POST /admin/notifications/broadcast`.
Every other call site must pass an explicit `userId`.

## The rule

> If you call `createNotification(...)` without a `userId`, you are broadcasting to ALL users.
> Never do this for user-specific or role-specific events.

## 7 bugs fixed (v2.1.0, 2026-06-18)

| # | Location | Bug | Fix |
|---|----------|-----|-----|
| 1 | `auth.ts:194` | Unknown-identifier login created null-userId broadcast | Removed the call — no user exists to notify |
| 2 | `notificationTemplates.ts:notifyNewRegistration` | Broadcast to all users | Now queries `role = 'admin'` users and creates one notification per admin |
| 3 | `admin-registration.ts:83` | "Registration Setting Changed" null userId | Scoped to `req.session.userId!` (acting admin) |
| 4 | `admin-registration.ts:135` | "User Approved" null userId | Scoped to the approved user's `id` |
| 5 | `settings.ts:103` | "Backup Created" null userId | Scoped to `req.session.userId!` |
| 6 | `settings.ts:136` | "Backup Restored" null userId | Scoped to `req.session.userId!` |
| 7 | `push.ts:unsubscribe` | No user ownership check on DELETE | Added `AND userId = currentUser` via drizzle `and()` |

## What was already correct

- All fetch/count/update/delete queries use `userScope(userId)` ✅
- PATCH/DELETE `/notifications/:id` verify ownership before acting ✅
- `sendPushToUser(userId, ...)` fetches subscriptions WHERE userId = userId ✅
- `queryClient.clear()` on logout wipes all cached notification data ✅

## `notifyNewRegistration` — fan-out pattern

Queries `SELECT id FROM users WHERE role = 'admin'` internally, then creates one notification per admin. Call it **once** per registration event — it fans out itself.

## `createSystemNotification` — active users only

When called without `userIds`, now filters:
`WHERE isActive = true AND status = 'ACTIVE'`
Never delivers to deleted/suspended/pending accounts.

## Push unsubscribe — owner-only

`DELETE /api/push/unsubscribe` now uses:
```
WHERE endpoint = :endpoint AND userId = :currentUser
```
A user cannot unsubscribe a different user's device even if they know the endpoint URL.

**Why:** Without the userId check, knowing another user's endpoint URL (which browsers expose) was enough to silently disable their push notifications.
