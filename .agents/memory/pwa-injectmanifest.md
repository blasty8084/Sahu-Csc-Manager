---
name: Advanced PWA injectManifest
description: Custom service worker setup, push notifications, and manifest gotchas for SAHU CSC
---

## Rule
Use `strategies: "injectManifest", srcDir: "src", filename: "sw.ts"` in vite-plugin-pwa when you need Push events, Periodic Sync, or custom Background Sync plugins — generateSW cannot handle these.

**Why:** generateSW only exposes runtimeCaching string handlers, not arbitrary workbox plugins or custom event listeners. injectManifest lets you write a full custom sw.ts that vite-plugin-pwa compiles and injects `self.__WB_MANIFEST` into.

**How to apply:**
- Declare `self: ServiceWorkerGlobalScope & { __WB_MANIFEST: ... }` at the top of sw.ts
- Install workbox packages explicitly in sahu-csc (vite-plugin-pwa transitive deps may not resolve in sw.ts)
- For `PushManager.subscribe`, pass `applicationServerKey: urlBase64ToUint8Array(key).buffer as ArrayBuffer` — passing the Uint8Array directly causes TS2769
- `vibrate` is not in TypeScript's `NotificationOptions` type — use `{ ... } as NotificationOptions` cast
- Express route handlers must return `void`/`Promise<void>` and use early-return pattern (not `return res.json(...)`) with Express 5 strict mode

## VAPID keys
Stored in env vars: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL. Generated once via `node -e "require('web-push').generateVAPIDKeys()"` from the api-server directory.

## Push flow
1. Frontend: `usePushNotifications()` hook — subscribe/unsubscribe
2. API: `POST /api/push/subscribe` (stores to push_subscriptions table), `GET /api/push/vapid-public-key`
3. Server: `sendPushToUser(userId, payload)` / `sendPushToAll(payload)` in `lib/push.ts`
4. `notify.ts` calls `sendPushToUser/All` automatically whenever `createNotification()` is called

## Manifest fields added (all verified in manifest.webmanifest)
launch_handler, file_handlers, note_taking, widgets, scope_extensions, iarc_rating_id, share_target, protocol_handlers, display_override (window-controls-overlay first), related_applications, edge_side_panel
