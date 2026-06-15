# SAHU CSC FV1/FV2 — Notification System
### Replit Agent 4 Implementation Prompt

---

## Tech Stack

> Use exactly this stack — no substitutions.

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express + TypeScript |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Neon free tier via `DATABASE_URL`) |
| Cache | Upstash Redis (REST API via `UPSTASH_REDIS_REST_URL` + TOKEN) |
| Real-Time (FV1) | Polling via React Query (`refetchInterval: 30000`) |
| Real-Time (FV2) | WebSocket (`ws` library — implement after FV1 is stable) |
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| State | TanStack Query (React Query) |
| Offline | Dexie.js (IndexedDB wrapper) |
| Push (PWA) | Web Push API + `web-push` npm package |

---

## Priority Order

```
Priority 1  → Database Schema & Migrations
Priority 2  → Notification Service (backend core)
Priority 3  → API Endpoints
Priority 4  → In-App Notification Bell (frontend)
Priority 5  → Notification Center Page
Priority 6  → Security & Business Auto-Triggers
Priority 7  → User Notification Preferences
Priority 8  → Real-Time Polling (FV1)
Priority 9  → PWA Push Notifications
Priority 10 → Offline Queue (IndexedDB)
Priority 11 → Audit Integration
Priority 12 → Retention & Cleanup Script
```

---

## Phase 1 — Database Schema

Run Drizzle migrations to create all tables before any other step.

### Table: `notifications`

```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id       UUID REFERENCES users(id) ON DELETE CASCADE
title         VARCHAR(150) NOT NULL
message       TEXT NOT NULL
type          ENUM('INFO','SUCCESS','WARNING','ERROR','SECURITY','SYSTEM','BUSINESS')
              NOT NULL DEFAULT 'INFO'
priority      ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM'
is_read       BOOLEAN DEFAULT false
read_at       TIMESTAMP
link          TEXT          -- optional deep link (e.g. /ledger/123)
meta          JSONB         -- extra context (ip address, device, amount, etc.)
created_at    TIMESTAMP DEFAULT now()
```

**Indexes:**
```sql
CREATE INDEX idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX idx_notifications_is_read    ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

---

### Table: `user_notification_preferences`

```sql
id                    UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id               UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE
enabled               BOOLEAN DEFAULT true
security_alerts       BOOLEAN DEFAULT true
business_alerts       BOOLEAN DEFAULT true
system_alerts         BOOLEAN DEFAULT true
info_alerts           BOOLEAN DEFAULT true
push_enabled          BOOLEAN DEFAULT false
push_subscription     JSONB        -- Web Push subscription object
updated_at            TIMESTAMP DEFAULT now()
```

---

### Table: `notification_audit_logs`

```sql
id               UUID PRIMARY KEY DEFAULT gen_random_uuid()
notification_id  UUID REFERENCES notifications(id) ON DELETE SET NULL
user_id          UUID REFERENCES users(id) ON DELETE SET NULL
action           ENUM('SENT','READ','DELETED','BULK_READ','BULK_DELETED','EXPORTED')
ip_address       VARCHAR(45)
device           TEXT
created_at       TIMESTAMP DEFAULT now()
```

---

### Table: `push_subscriptions`

```sql
id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id      UUID REFERENCES users(id) ON DELETE CASCADE
endpoint     TEXT UNIQUE NOT NULL
p256dh       TEXT NOT NULL
auth         TEXT NOT NULL
device       TEXT
created_at   TIMESTAMP DEFAULT now()
```

---

## Phase 2 — Notification Service (Backend Core)

Create `artifacts/api-server/src/services/notificationService.ts`

### `createNotification(payload)`

```typescript
interface CreateNotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SECURITY' | 'SYSTEM' | 'BUSINESS';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  link?: string;
  meta?: Record<string, unknown>;
}
```

**Steps inside `createNotification`:**
1. Check `user_notification_preferences` for this user
2. If `enabled = false` → skip (unless `priority = 'CRITICAL'`)
3. Check category preference (e.g. `security_alerts = false` → skip SECURITY type)
4. Insert row into `notifications` table
5. Increment Redis unread counter: `notifications:unread:{userId}` by 1
6. If user has push subscription + `push_enabled = true` → send Web Push
7. Write `notification_audit_logs` row with action `SENT`
8. Return created notification

---

### `createSystemNotification(payload)`

```typescript
interface SystemNotificationPayload {
  title: string;
  message: string;
  type: 'SYSTEM' | 'INFO' | 'WARNING';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  target: 'ALL' | 'ROLE' | 'SPECIFIC';
  roles?: ('ADMIN' | 'OPERATOR' | 'USER')[];
  userIds?: string[];
}
```

**Steps:**
1. Query target users from `users` table based on `target` field
2. Loop and call `createNotification` for each user
3. Batch Redis counter updates using Upstash pipeline

---

### Pre-built Notification Templates

Create `notificationTemplates.ts` with these ready-made functions:

```typescript
// Security
notifyLoginSuccess(userId, ip, device)
notifyLoginFailed(userId, ip, device, attemptCount)
notifyPasswordChanged(userId, ip)
notifyPasswordReset(userId, ip)
notifyNewDeviceLogin(userId, ip, device)
notifySessionExpired(userId)
notifyAccountLocked(userId, ip, attemptCount)

// Business
notifyLowBalance(userId, currentBalance, threshold)
notifyLargeTransaction(userId, amount, transactionId)
notifyDailyRevenueSummary(userId, totalRevenue, date)
notifyMonthlyReportReady(userId, reportId, month)

// System
notifyMaintenanceScheduled(scheduledAt, durationMinutes)
notifyBackupCompleted(adminUserId, backupSize)
notifyBackupFailed(adminUserId, errorMessage)
notifyNewFeatureReleased(version, featureTitle)
```

**Priority mapping:**
| Notification | Type | Priority |
|-------------|------|----------|
| Login Success | SECURITY | MEDIUM |
| Failed Login Attempt | SECURITY | HIGH |
| Password Changed | SECURITY | HIGH |
| Password Reset | SECURITY | HIGH |
| New Device Login | SECURITY | HIGH |
| Account Locked | SECURITY | CRITICAL |
| Session Expired | SECURITY | LOW |
| Low Balance Warning | BUSINESS | HIGH |
| Large Transaction Alert | BUSINESS | HIGH |
| Daily Revenue Summary | BUSINESS | LOW |
| Monthly Report Ready | BUSINESS | MEDIUM |
| Backup Completed | SYSTEM | LOW |
| Backup Failed | SYSTEM | CRITICAL |
| Maintenance Scheduled | SYSTEM | HIGH |
| New Feature Released | SYSTEM | INFO |
| Theme Changed | INFO | LOW |
| Profile Updated | INFO | LOW |
| Report Generated | SUCCESS | LOW |
| Ledger Entry Added | SUCCESS | LOW |

---

## Phase 3 — API Endpoints

### User Notification Endpoints

#### `GET /api/notifications`
- Auth: required (any role)
- Returns notifications for current user only (`WHERE user_id = req.user.id`)
- Query params: `page`, `limit`, `type`, `priority`, `is_read`, `search`
- Default: `limit=20`, `ORDER BY created_at DESC`
- Response:
```json
{
  "notifications": [...],
  "unreadCount": 5,
  "total": 42,
  "page": 1
}
```

#### `GET /api/notifications/unread-count`
- Auth: required
- Read from Redis first (`notifications:unread:{userId}`)
- Fallback: `SELECT COUNT(*) WHERE user_id = ? AND is_read = false`
- Response: `{ "count": 5 }`

#### `PATCH /api/notifications/:id/read`
- Auth: required
- Verify `notification.user_id = req.user.id` (strict ownership check)
- Set `is_read = true`, `read_at = now()`
- Decrement Redis unread counter
- Write audit log: `READ`
- Response: `{ success: true }`

#### `PATCH /api/notifications/mark-all-read`
- Auth: required
- Update all `WHERE user_id = req.user.id AND is_read = false`
- Reset Redis counter to 0
- Write audit log: `BULK_READ`
- Response: `{ success: true, updated: 12 }`

#### `DELETE /api/notifications/:id`
- Auth: required
- Verify ownership before deleting
- Write audit log: `DELETED`
- Adjust Redis unread counter if notification was unread
- Response: `{ success: true }`

#### `DELETE /api/notifications/bulk`
- Auth: required
- Body: `{ ids: string[] }` OR `{ filter: 'read' | 'all' }`
- Verify all IDs belong to current user
- Write audit log: `BULK_DELETED`
- Response: `{ success: true, deleted: 8 }`

#### `GET /api/notifications/export`
- Auth: required
- Returns CSV or JSON of user's notifications
- Query params: `format=csv|json`, `from`, `to`
- Write audit log: `EXPORTED`

---

### Admin Notification Endpoints

#### `POST /api/admin/notifications/broadcast`
- Auth: **ADMIN only**
- Body:
```json
{
  "title": "System Maintenance Tonight",
  "message": "Scheduled maintenance from 11 PM to 1 AM.",
  "type": "SYSTEM",
  "priority": "HIGH",
  "target": "ALL"
}
```
- Calls `createSystemNotification`
- Response: `{ success: true, sent: 45 }`

#### `POST /api/admin/notifications/send`
- Auth: **ADMIN only**
- Body: same as broadcast + `userIds: string[]` OR `roles: string[]`
- Targeted send
- Response: `{ success: true, sent: 3 }`

---

### Preferences Endpoints

#### `GET /api/notifications/preferences`
- Auth: required
- Returns current user's `user_notification_preferences` row

#### `PATCH /api/notifications/preferences`
- Auth: required
- Body: partial `user_notification_preferences`
- Upsert preferences for current user
- Response: `{ success: true }`

#### `POST /api/notifications/push/subscribe`
- Auth: required
- Body: Web Push subscription object `{ endpoint, keys: { p256dh, auth } }`
- Upsert into `push_subscriptions`
- Set `push_enabled = true` in preferences

#### `DELETE /api/notifications/push/unsubscribe`
- Auth: required
- Remove push subscription
- Set `push_enabled = false` in preferences

---

## Phase 4 — Notification Bell (Frontend)

**Component:** `NotificationBell.tsx`  
**Location:** Header / top navbar, right side

### UI Structure

```
[🔔 5]  ← Bell icon with red badge showing unread count

On click → Dropdown panel (max 5 latest notifications):

┌─────────────────────────────────────────────────┐
│  🔔 Notifications                [Mark All Read] │
├─────────────────────────────────────────────────┤
│ 🔴 HIGH  [SECURITY]  2 min ago                  │
│ New device login detected — Chrome, Windows      │
├─────────────────────────────────────────────────┤
│ 🟢 LOW  [SUCCESS]  10 min ago                   │
│ Report generated successfully                    │
├─────────────────────────────────────────────────┤
│ 🟠 HIGH  [BUSINESS]  1 hr ago                   │
│ Low balance warning — ₹500 remaining             │
├─────────────────────────────────────────────────┤
│         [ View All Notifications → ]             │
└─────────────────────────────────────────────────┘
```

### Color Coding

| Type | Color | Badge |
|------|-------|-------|
| INFO | Blue `#3B82F6` | 🔵 |
| SUCCESS | Green `#22C55E` | 🟢 |
| WARNING | Orange `#F97316` | 🟠 |
| ERROR | Red `#EF4444` | 🔴 |
| SECURITY | Red `#DC2626` | 🚨 |
| SYSTEM | Purple `#8B5CF6` | 🟣 |
| BUSINESS | Amber `#F59E0B` | 🟡 |

### Behavior
- Fetch unread count via `GET /api/notifications/unread-count`
- Poll every **30 seconds** using React Query `refetchInterval`
- Clicking a notification → mark as read + navigate to `link` if present
- Unread notifications have a **blue left border** + light background
- Read notifications are dimmed

---

## Phase 5 — Notification Center Page

**Route:** `/notifications`  
**File:** `artifacts/sahu-csc/src/pages/notifications/NotificationCenter.tsx`

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  🔔 Notification Center                                          │
│                                                                  │
│  [ 🔍 Search notifications... ]   [Filter ▼]  [Sort ▼]          │
│                                                                  │
│  Tabs: [ All (42) ] [ Unread (5) ] [ Security ] [ Business ]    │
│         [ System ] [ Info ]                                      │
├──────────────────────────────────────────────────────────────────┤
│  [ ✅ Mark All Read ]  [ 🗑 Delete Read ]  [ 📤 Export ]         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔴 CRITICAL · SECURITY                          2 min ago  [×] │
│  Account Locked                                                  │
│  Your account was locked after 5 failed login attempts.          │
│                                                                  │
│  🟠 HIGH · BUSINESS                              1 hr ago   [×] │
│  Low Balance Warning                                             │
│  Your balance is ₹500. Please recharge soon.                     │
│                                                                  │
│  🟢 LOW · SUCCESS                                3 hr ago   [×] │
│  Report Generated                                                │
│  Your monthly report for May 2026 is ready.                      │
│                                                                  │
│  [ Load More... ]                                                │
└──────────────────────────────────────────────────────────────────┘
```

### Features
- **Search:** Filter by title/message text (debounced 400ms)
- **Filter:** By type, priority, date range, read/unread
- **Sort:** Newest first (default), Oldest first, Priority (HIGH→LOW)
- **Tabs:** All, Unread, Security, Business, System, Info
- **Bulk actions:** Select multiple → Mark Read, Delete
- **Export:** Download as CSV or JSON
- **Infinite scroll** OR pagination (page size: 20)
- **Empty state:** Show friendly illustration when no notifications

---

## Phase 6 — Auto-Trigger Integration

Call these notification functions from within existing routes/services:

### In `auth.ts` routes:

```typescript
// After successful login
await notifyLoginSuccess(user.id, req.ip, req.headers['user-agent'])

// After failed login (5th attempt)
await notifyAccountLocked(user.id, req.ip, 5)

// After failed login (1st–4th attempt)
await notifyLoginFailed(user.id, req.ip, req.headers['user-agent'], attemptCount)

// After password change
await notifyPasswordChanged(user.id, req.ip)

// After password reset
await notifyPasswordReset(user.id, req.ip)

// After session expiry cleanup
await notifySessionExpired(user.id)
```

### In `ledger.ts` routes:

```typescript
// After ledger entry created
await createNotification({
  userId: req.user.id,
  title: 'New Ledger Entry Added',
  message: `₹${amount} entry recorded successfully.`,
  type: 'SUCCESS',
  priority: 'LOW',
  link: `/ledger/${newEntry.id}`
})

// Large transaction check (threshold: ₹10,000)
if (amount >= 10000) {
  await notifyLargeTransaction(req.user.id, amount, newEntry.id)
}
```

### In `reports.ts` routes:

```typescript
// After report generated
await createNotification({
  userId: req.user.id,
  title: 'Report Generated',
  message: `Your ${reportType} report is ready to download.`,
  type: 'SUCCESS',
  priority: 'LOW',
  link: `/reports/${reportId}`
})
```

### In `profile.ts` routes:

```typescript
// After profile update
await createNotification({
  userId: req.user.id,
  title: 'Profile Updated',
  message: 'Your profile information was updated successfully.',
  type: 'INFO',
  priority: 'LOW'
})
```

### Scheduled Jobs (use `node-cron`):

```typescript
// Daily at 11:59 PM
cron.schedule('59 23 * * *', async () => {
  const users = await getAllActiveUsers()
  for (const user of users) {
    const revenue = await getDailyRevenue(user.id)
    await notifyDailyRevenueSummary(user.id, revenue, new Date())
  }
})

// 1st of every month at 8:00 AM
cron.schedule('0 8 1 * *', async () => {
  const users = await getAllActiveUsers()
  for (const user of users) {
    const report = await generateMonthlyReport(user.id)
    await notifyMonthlyReportReady(user.id, report.id, lastMonth)
  }
})
```

---

## Phase 7 — Notification Preferences Page

**Route:** `/settings/notifications`  
**File:** `NotificationPreferences.tsx`

### UI

```
┌──────────────────────────────────────────────────────┐
│  🔔  Notification Preferences                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  All Notifications          [● ON  /  OFF ○]        │
│                                                      │
│  ── Categories ──────────────────────────────────── │
│  Security Alerts            [● ON  /  OFF ○]        │
│  Business Alerts            [● ON  /  OFF ○]        │
│  System Alerts              [● ON  /  OFF ○]        │
│  Info & Updates             [● ON  /  OFF ○]        │
│                                                      │
│  ── Push Notifications ─────────────────────────── │
│  Enable Push (Browser/PWA)  [● ON  /  OFF ○]        │
│  [ Request Permission ]                              │
│                                                      │
│              [ Save Preferences ]                    │
└──────────────────────────────────────────────────────┘
```

**Rules:**
- If `All Notifications = OFF` → disable all category toggles (grey out)
- CRITICAL priority notifications are **always sent** regardless of preferences
- Save calls `PATCH /api/notifications/preferences`

---

## Phase 8 — Real-Time Polling (FV1)

Use **React Query polling** — no WebSocket required in FV1.

### Hook: `useNotifications.ts`

```typescript
// Unread count — poll every 30 seconds
const { data: unreadCount } = useQuery({
  queryKey: ['notifications', 'unread-count'],
  queryFn: () => api.get('/notifications/unread-count'),
  refetchInterval: 30_000,
  refetchIntervalInBackground: false,
})

// Notification list — refetch on window focus
const { data: notifications } = useQuery({
  queryKey: ['notifications', filters],
  queryFn: () => api.get('/notifications', { params: filters }),
  refetchOnWindowFocus: true,
  staleTime: 15_000,
})
```

### Invalidation on Actions:
- After mark-as-read → invalidate `['notifications', 'unread-count']`
- After delete → invalidate `['notifications']`
- After mark-all-read → invalidate both

---

## Phase 9 — PWA Push Notifications

### Setup (`web-push` package)

```bash
pnpm add web-push
pnpm add -D @types/web-push
```

Generate VAPID keys (run once, store in Replit Secrets):
```bash
npx web-push generate-vapid-keys
```

Add to Replit Secrets:
```env
VAPID_PUBLIC_KEY  = <generated public key>
VAPID_PRIVATE_KEY = <generated private key>
VAPID_EMAIL       = mailto:admin@sahucsc.com
```

### Push Service: `pushService.ts`

```typescript
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushNotification(userId: string, payload: {
  title: string;
  message: string;
  type: string;
  priority: string;
  link?: string;
}) {
  const subscriptions = await getPushSubscriptions(userId)
  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.message,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: { link: payload.link, type: payload.type }
  })

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      }, pushPayload)
    } catch (err) {
      // If subscription expired → remove from DB
      if (err.statusCode === 410) {
        await deletePushSubscription(sub.id)
      }
    }
  }
}
```

### Frontend: Subscribe to Push

```typescript
// hooks/usePushNotifications.ts
export async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY
  })
  await api.post('/notifications/push/subscribe', subscription.toJSON())
}
```

### Service Worker: Handle Push Events (`sw.ts`)

```typescript
self.addEventListener('push', (event) => {
  const data = event.data?.json()
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      data: data.data
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data?.link || '/')
  )
})
```

---

## Phase 10 — Offline Queue (IndexedDB via Dexie.js)

### IndexedDB Tables

```typescript
// db/offlineDb.ts
const db = new Dexie('SahuCSCNotifications')
db.version(1).stores({
  notificationQueue: '++id, userId, createdAt',  // pending notifications to sync
  cachedNotifications: 'id, userId, is_read, created_at', // local cache
})
```

### Offline Behavior

**When offline:**
- Read from `cachedNotifications` IndexedDB table
- Show **"Offline Mode — Showing cached notifications"** banner
- Queue any mark-as-read actions in `notificationQueue`

**On reconnect:**
- Detect via `navigator.onLine` event listener
- Flush `notificationQueue`:
  - `PATCH /api/notifications/:id/read` for queued read actions
  - `DELETE /api/notifications/:id` for queued deletes
- Refresh notification list from server
- Update `cachedNotifications` with fresh data

---

## Phase 11 — Audit Integration

Every notification event is logged to `notification_audit_logs`.

| Event | Trigger | Action Value |
|-------|---------|-------------|
| Notification created | `createNotification()` | `SENT` |
| Notification read | `PATCH /:id/read` | `READ` |
| Mark all read | `PATCH /mark-all-read` | `BULK_READ` |
| Single delete | `DELETE /:id` | `DELETED` |
| Bulk delete | `DELETE /bulk` | `BULK_DELETED` |
| Export | `GET /export` | `EXPORTED` |

**Log includes:** `notification_id`, `user_id`, `action`, `ip_address`, `device`, `created_at`

---

## Phase 12 — Retention & Cleanup

### Retention Rules

| Status | Rule |
|--------|------|
| Unread | Keep indefinitely |
| Read | Archive after **30 days** |
| CRITICAL priority | Keep for **90 days** minimum |
| All others | Delete after **90 days** |

### Cleanup Script

**File:** `scripts/cleanupNotifications.ts`

```typescript
// Run daily via node-cron at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  // Archive read non-critical notifications older than 30 days
  await db.update(notifications)
    .set({ archived: true })
    .where(
      and(
        eq(notifications.is_read, true),
        ne(notifications.priority, 'CRITICAL'),
        lt(notifications.read_at, thirtyDaysAgo)
      )
    )

  // Hard delete anything older than 90 days
  await db.delete(notifications)
    .where(lt(notifications.created_at, ninetyDaysAgo))
})
```

---

## Folder Structure

Generate exactly this structure:

```
artifacts/
  api-server/src/
    routes/
      notifications.ts           ← user notification endpoints
      admin/
        notifications.ts         ← broadcast, targeted send
    services/
      notificationService.ts     ← createNotification, createSystemNotification
      notificationTemplates.ts   ← all pre-built template functions
      pushService.ts             ← web-push send logic
    jobs/
      cleanupNotifications.ts    ← retention cron job
      dailySummary.ts            ← daily revenue summary cron

  sahu-csc/src/
    pages/
      notifications/
        NotificationCenter.tsx   ← full notification center page
    components/
      notifications/
        NotificationBell.tsx     ← bell icon + dropdown
        NotificationItem.tsx     ← single notification row
        NotificationBadge.tsx    ← red unread count badge
        NotificationPreferences.tsx ← preferences toggle UI
    hooks/
      useNotifications.ts        ← React Query hooks
      usePushNotifications.ts    ← push subscribe/unsubscribe
      useOfflineQueue.ts         ← IndexedDB sync logic
    db/
      offlineDb.ts               ← Dexie.js schema
```

---

## Environment Variables

Add to Replit Secrets:

```env
VAPID_PUBLIC_KEY   = <generated>
VAPID_PRIVATE_KEY  = <generated>
VAPID_EMAIL        = mailto:admin@sahucsc.com
VITE_VAPID_PUBLIC_KEY = <same public key, for frontend>
```

---

## Seed Data (run once)

### Default preferences for all existing users:

```sql
INSERT INTO user_notification_preferences (user_id, enabled, security_alerts, 
  business_alerts, system_alerts, info_alerts, push_enabled)
SELECT id, true, true, true, true, true, false
FROM users
ON CONFLICT (user_id) DO NOTHING;
```

### Test notifications for admin user:

```typescript
await createNotification({ userId: adminId, title: 'Welcome to SAHU CSC', 
  message: 'Notification system is active.', type: 'SUCCESS', priority: 'LOW' })

await createNotification({ userId: adminId, title: 'Backup Completed',
  message: 'Database backup completed successfully.', type: 'SYSTEM', priority: 'LOW' })

await createNotification({ userId: adminId, title: 'Security Alert Test',
  message: 'This is a test security notification.', type: 'SECURITY', priority: 'HIGH' })
```

---

## Completion Checklist

- [x] All 4 DB tables created via Drizzle migrations
- [x] `notificationService.ts` with `createNotification` and `createSystemNotification`
- [x] All pre-built template functions in `notificationTemplates.ts`
- [x] User notification API endpoints (CRUD + export)
- [x] Admin broadcast + targeted send endpoints
- [x] Notification Bell with unread badge in header
- [x] Dropdown panel (latest 5 notifications)
- [x] Full Notification Center page (`/notifications`)
- [x] Search, filter, sort, tabs in Notification Center
- [x] Bulk mark-read and bulk delete
- [x] CSV/JSON export
- [x] Security alerts auto-triggered from auth routes
- [x] Business alerts auto-triggered from ledger routes
- [x] Scheduled daily summary + monthly report cron jobs
- [x] Notification Preferences page (`/settings/notifications`)
- [x] Real-time polling via React Query (30s interval)
- [x] PWA push notifications with VAPID keys
- [x] Service worker push event handler
- [x] Offline queue via Dexie.js IndexedDB
- [x] Auto-sync on reconnect
- [x] Audit log for all notification events
- [x] Retention cleanup cron (daily at 2 AM)
- [x] User-specific data isolation (all queries filter by `user_id`)
- [x] CRITICAL notifications bypass user preference filters
- [x] Default preferences seeded for all users
