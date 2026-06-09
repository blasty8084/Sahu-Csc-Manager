---
name: Offline PWA architecture
description: IndexedDB offline queue, sync engine, Workbox strategies, and network status hook added in the advanced PWA upgrade
---

## Key files
- `src/lib/offline-db.ts` — raw IndexedDB wrapper; stores: `pending_ledger`, `cache_store`
- `src/lib/sync-engine.ts` — singleton `syncEngine`; auto-syncs on `window.online`; dispatches `sahu-sync-complete` CustomEvent on success
- `src/hooks/use-network-status.ts` — `useNetworkStatus()` → `{ isOnline, isOffline, isSlow, quality }`
- `src/hooks/use-sync.ts` — `useSync()` → `{ syncStatus, pendingCount, lastSyncTime, syncNow }`
- `src/components/sync-status-bar.tsx` — `<SyncStatusBar>` (full bar) + `<SyncDot>` (header icon)

## Workbox strategy map
| Route pattern | Strategy | Cache name |
|---|---|---|
| `/api/auth/` | NetworkOnly | — |
| `/api/dashboard` | StaleWhileRevalidate | api-dashboard (5 min) |
| `/api/reports` | StaleWhileRevalidate | api-reports (10 min) |
| `/api/settings` | StaleWhileRevalidate | api-settings (30 min) |
| `/api/profile` | StaleWhileRevalidate | api-profile (5 min) |
| `/api/preferences` | StaleWhileRevalidate | api-preferences (30 min) |
| `/api/ledger` | NetworkFirst | api-ledger (5 min, 8s timeout) |
| `/api/services` | NetworkFirst | api-services (1 hr, 8s timeout) |
| images/fonts | CacheFirst | image-cache / font-cache |

## Offline ledger flow
1. User creates entry while offline → stored in `pending_ledger` IDB store via `addPendingEntry()`
2. `syncEngine.markPendingAdded()` updates the pending count shown in `SyncStatusBar`
3. On `window.online`, `syncEngine.sync()` POSTs each pending entry to `/api/ledger`
4. Success → removes from IDB; dispatches `sahu-sync-complete` event → ledger page refreshes list
5. Max 3 retries per entry before marking as `partial` error state

## Dashboard caching
- On successful API response, data is written to `cache_store` IDB with 30-min expiry
- On offline detection, `getCacheItem(DASHBOARD_CACHE_KEY)` is read and shown as fallback

**Why:** CSC centers in rural Odisha frequently experience internet outages. Business must continue uninterrupted — entries saved offline sync automatically when connectivity returns.

**How to apply:** For any new page that needs offline read access, use `setCacheItem`/`getCacheItem` with a reasonable TTL. For offline write operations, add to `pending_ledger` store and call `syncEngine.markPendingAdded()`.
