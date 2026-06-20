# SAHU CSC — Change Log v2
**Current version: 2.2.0 — June 2026**

> Comprehensive record of every feature, change, and upgrade from v2.0.0 onward.  
> For a full description of the system architecture, see `architectureV2.md`.  
> For the pre-v2.0 history, see `CHANGELOG.md`.

---

## Table of Contents

1. [v2.2.0 — Login UX Overhaul & Reports Redesign](#1-v220--login-ux-overhaul--reports-redesign-june-2026)
   - [Embedded Forgot-Password Flow (Inline)](#11-embedded-forgot-password-flow-inline)
   - [Login Attempt Counter with Visual Feedback](#12-login-attempt-counter-with-visual-feedback)
   - [Lockout Countdown Timer](#13-lockout-countdown-timer)
   - [Reports Page Full Redesign](#14-reports-page-full-redesign)
2. [v2.1.0 — Security, Receipts, Udhari, Admin Oversight](#2-v210--security-receipts-udhari-admin-oversight-june-2026)
   - [OTP Password Reset](#21-otp-password-reset)
   - [V2 Multi-Device Sessions](#22-v2-multi-device-sessions)
   - [RBAC — requirePermission Middleware](#23-rbac--requirepermission-middleware)
   - [Receipt System](#24-receipt-system)
   - [Admin Oversight Pages](#25-admin-oversight-pages)
   - [Notification Isolation Fixes](#26-notification-isolation-fixes)
   - [UI Design System v2](#27-ui-design-system-v2)
   - [AePS Opening Balance Redesign](#28-aeps-opening-balance-redesign)
   - [PWA Status Page](#29-pwa-status-page)
   - [Miscellaneous Fixes (v2.1)](#210-miscellaneous-fixes-v21)
3. [v2.0.0 — Udhari Khata](#3-v200--udhari-khata-june-2026)
4. [Database Schema Reference](#4-database-schema-reference)
5. [API Routes Reference](#5-api-routes-reference)
6. [Known Gotchas & Conventions](#6-known-gotchas--conventions)

---

## 1. v2.2.0 — Login UX Overhaul & Reports Redesign (June 2026)

### 1.1 Embedded Forgot-Password Flow (Inline)

**Problem:** The old "Forgot Password?" link navigated away to `/forgot-password`, losing the login context and creating a jarring full-page transition.

**Change:** The 4-step password reset flow is now embedded directly inside `login.tsx` using `AnimatePresence`. Clicking "Forgot Password?" does not navigate — the form slides in within the same card.

**Steps embedded inline:**

| Step | Content |
|------|---------|
| 1. Identifier | Enter username / email / mobile — same flexible lookup as login |
| 2. OTP | 6-digit code, masked email display, 120-second resend cooldown |
| 3. New Password | Enforces full policy (8+ chars, upper + lower + number) |
| 4. Success | Confirmation card, auto-advances back to the login step |

**Mobile implementation (`MobileLogin`):**
- `showForgot` boolean state per component
- On `true`: `motion.div` slides the forgot-password form in from `x: 40` → `x: 0`
- On step 4 success: resets `showForgot = false`, returns to `LoginFormContent`
- A `←` back button on the forgot form header returns at any step

**Desktop implementation (`DesktopLogin`):**
- Same pattern — shared `ForgotPasswordSteps` sub-component
- `AnimatePresence mode="wait"` ensures the old panel fades out before the new one fades in

**Files changed:**
- `artifacts/sahu-csc/src/pages/login.tsx` — full rewrite of `MobileLogin` and `DesktopLogin` to include forgot flow; added `ForgotPasswordSteps` component

**OTP backend:**
- `POST /api/auth/send-otp { identifier, purpose: "password_reset" }` — resolves username/email/mobile via OR query, returns `{ maskedEmail }`
- Unknown identifier returns `200 { maskedEmail: null }` (never 404 — prevents account enumeration)
- `POST /api/auth/verify-otp { identifier, otp, purpose: "password_reset" }` — resolves identifier internally; frontend never sends the raw resolved email
- `POST /api/auth/reset-password { identifier, otp, newPassword }` — enforces password policy + logs `password.reset` audit event

---

### 1.2 Login Attempt Counter with Visual Feedback

**Problem:** Users had no feedback on how many wrong-password attempts they had remaining before lockout.

**Change:** After the first wrong password response, a counter widget animates in above the Login button.

**UI details:**

```
┌─ attempts-left widget ──────────────────────────────────┐
│  ● ● ● ○ ○    attempts used:  2/5                       │
│  (3 dot bars, filled amber)    (right-aligned label)     │
└─────────────────────────────────────────────────────────┘
```

- 5 dot bars — filled from left to right
- Color escalation:
  - 1–2 used → amber (`#f59e0b`)
  - 3 used → orange (`#f97316`)
  - 4 used → red (`#ef4444`)
- Each new failure triggers a `scale: 1.3 → 1.0` pop animation on the newly filled dot
- `AnimatePresence` slides the widget in from `y: 8` with `opacity: 0 → 1` on first appearance
- Security badge at the bottom of the form:
  - Default (0 attempts): green `ShieldCheck` — "100% Secure"
  - After 1+ attempt: red/orange `AlertTriangle` — "Use Forgot Password to reset safely" with inline `onForgotPassword()` link

**State:**
- `attemptsLeft: number | null` in the root `Login` component
- Set from `err.attemptsLeft` on wrong-password 401 responses from the API
- Reset to `null` on successful login

**API change:**
- `POST /api/auth/login` on wrong-password → `{ error: "Invalid credentials", attemptsLeft: N }` in the 401 response body

**Files changed:**
- `artifacts/sahu-csc/src/pages/login.tsx` — `AttemptsCounter` sub-component; `attemptsLeft` state + props threading

---

### 1.3 Lockout Countdown Timer

**Problem:** When an account locked after 5 attempts, the user saw a plain error message with no indication of when they could try again.

**Change:** A full lockout panel replaces the login form with a live countdown timer.

**UI details:**

```
┌─────────────────────────────────────────────────────────┐
│  🔒  (shaking red lock icon badge)                       │
│                                                          │
│  Account Temporarily Locked                              │
│  [████████████████░░░░░░░░░░░░░░]  (draining red bar)   │
│                                                          │
│       14:32  ← live MM:SS countdown                      │
│   Time remaining until you can try again                 │
│                                                          │
│  (last 60s → brighter crimson, scale pulse each tick)   │
│                                                          │
│  [ Reset password instead → ]  (ghost button)           │
└─────────────────────────────────────────────────────────┘
```

**`useLockoutCountdown(lockoutUntil: Date | null, onExpired: () => void)` hook:**
- Runs a `setInterval(1000)` while `lockoutUntil` is set and in the future
- Returns `{ remaining: number (ms), display: "MM:SS", progress: 0–1, isUrgent: boolean }`
- `progress` drains from 1.0 at lock start to 0.0 at expiry (based on 15-minute window)
- `isUrgent = true` when under 60 seconds
- Calls `onExpired()` when timer hits zero — form slides back in, "Lockout lifted" toast, no page refresh

**Animations:**
- Lock icon: `useAnimationControls` drives a `rotate` shake sequence on mount
- MM:SS number: `AnimatePresence` key-based exit/enter (`opacity + scale: 0.8 → 1.0`) each second
- Progress bar: CSS `transition: width 1s linear`
- In last 60s: `color: #dc2626` → `#ff4444`, scale pulse on each digit change

**Trigger:**
- API `POST /api/auth/login` on locked account → `{ error: "Account is locked", locked: true, lockedUntil: "<ISO string>" }`
- `lockoutUntil` state set from `new Date(err.lockedUntil)`

**"Reset password instead →" escape hatch:**
- Calls `onForgotPassword()` to open the inline forgot-password flow
- Works even while locked — OTP flow is not rate-limited by account lock status

**Files changed:**
- `artifacts/sahu-csc/src/pages/login.tsx` — `LockoutPanel` sub-component; `useLockoutCountdown` hook; `lockoutUntil` state

---

### 1.4 Reports Page Full Redesign

**Problem:** The existing `reports.tsx` used a single layout that was neither optimised for mobile nor fully featured on desktop. Tabs were cramped on mobile, charts were unsized, and there was no sidebar navigation on desktop.

**Change:** `reports.tsx` now renders two completely separate components chosen at runtime by `useIsMobile()`:

```ts
export default function Reports() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileReports /> : <DesktopReports />;
}
```

Note: `useIsMobile()` is used here rather than CSS because the component architecture is entirely different between layouts — it is not just a styling difference.

#### Shared hooks (used by both components)

**`useFilterState()`**

```ts
{
  dailyDate, setDailyDate,
  reportYear, setReportYear,
  reportMonth, setReportMonth,
  aepsStart, setAepsStart,
  aepsEnd, setAepsEnd,
}
```

**`useReportsData(filterState)`**

Wraps all four API queries in one hook:

```ts
{
  dailyData, dailyLoading,
  monthlyData, monthlyLoading,
  aepsData, aepsLoading,
  serviceData, serviceLoading,
}
```

#### MobileReports

| Section | Design |
|---------|--------|
| **Header** | Title + subtitle + collapsible "Filters" toggle + "Export Excel" gradient pill (saffron → orange) |
| **Tabs** | Horizontal scroll, 4 chips — Daily / Monthly / AePS / Services. Active: gradient bg + white text + `box-shadow`. Inactive: white + navy border |
| **Filter panel** | Animated collapse/expand (`AnimatePresence`), contextual to active tab — date picker for Daily, month/year selects for Monthly, date range for AePS, empty for Services |
| **Stat cards** | 2×2 grid, white `rounded-2xl`, 3px colored top accent stripe, gradient icon badge (28px, `borderRadius: 9`), navy value, slate label |
| **Charts** | `BarChart` full-width, 140–160px height, `XAxis` with 9px font, no CartesianGrid (clean on mobile) |
| **AePS day-wise** | Compact row cards with slate background instead of a table — date left, amount + type chip right |

Tab configuration:
```ts
MOBILE_TABS = [
  { id: "daily",    label: "Daily",    icon: CalendarDays, gradient: "135deg, #0b2c60, #0f3872" },
  { id: "monthly",  label: "Monthly",  icon: TrendingUp,   gradient: "135deg, #7c3aed, #9d5af0" },
  { id: "aeps",     label: "AePS",     icon: Wallet,       gradient: "135deg, #059669, #0d9f75" },
  { id: "services", label: "Services", icon: BarChart3,     gradient: "135deg, #d97706, #f59e0b" },
]
```

#### DesktopReports

| Section | Design |
|---------|--------|
| **Left sidebar** | Fixed 256px wide, white card, 3px navy top stripe. Nav panel: 4 tab rows with active gradient highlight. Filter panel below nav: contextual inputs matching the active tab |
| **Stat cards** | 4-across grid, larger cards — 24px font, 36px icon badge with 4px `box-shadow` |
| **Charts** | 200–260px height, `CartesianGrid` with dashed lines, `Legend` component, styled tooltip (rounded, shadow, no border) |
| **Daily data table** | Header row with uppercase tracking labels, hover rows, amount colored green/red |
| **Monthly day table** | Ranked rows with colored rank badge (🥇🥈🥉 gradient chips for top 3), colored txn badge pill |
| **Services tab** | 2-column grid: PieChart (200×200) on left, detail table on right with percent bar |

Tab configuration:
```ts
DESKTOP_TABS = [
  { id: "daily",    label: "Daily Report",    icon: CalendarDays },
  { id: "monthly",  label: "Monthly Report",  icon: TrendingUp },
  { id: "aeps",     label: "AePS Report",     icon: Wallet },
  { id: "services", label: "Service Analysis", icon: BarChart3 },
]
```

**Files changed:**
- `artifacts/sahu-csc/src/pages/reports.tsx` — complete rewrite; exports `MobileReports`, `DesktopReports`, and default `Reports` components. Removed unused imports (`LineChart`, `Line`, `MONTH_SHORT`, `IndianRupee`, `RefreshCw`) that were causing HMR warnings.

**Build output:** `reports.js` = 41.93 kB — no TypeScript errors.

---

## 2. v2.1.0 — Security, Receipts, Udhari, Admin Oversight (June 2026)

### 2.1 OTP Password Reset

**Flow (4 steps, single page `/forgot-password`):**

1. User enters username / email / mobile
2. API resolves identifier via OR query, sends OTP to the account's email, returns `{ maskedEmail }`
3. User enters 6-digit OTP
4. User sets new password (enforced: 8+ chars, upper + lower + number)

**Key security decisions:**
- Unknown identifier returns `200 { maskedEmail: null }` — never 404 (prevents account enumeration)
- `verify-otp` resolves the identifier internally — frontend never handles the raw email
- OTP resend cooldown: 120 seconds (same in register flow — do not change to 60)
- Audit logged as `password.reset` on success

### 2.2 V2 Multi-Device Sessions

**New table:** `user_sessions` — one row per active login across all devices.

Each login creates a row with: `sessionId` (UUID), `userId`, `deviceInfo`, `browser`, `os`, `ipAddress`, `rememberMe`, `isActive`, `expiresAt`, `lastActivity`.

**Session durations:**
- Standard: 8 hours
- Remember Me: 30 days

**`requireAuth` middleware (V2):**
1. Checks `req.session.userId` + `req.session.sessionId`
2. Validates against `user_sessions`: `WHERE sessionId = ? AND isActive = true AND expiresAt > now()`
3. Falls back to V1 `activeSessionToken` on `users` table (backward compat)
4. Updates `lastActivity` on `user_sessions` (throttled: at most once per minute)

**Device detection:** `parseDevice(userAgent)` returns `{ browser, os, deviceInfo, deviceType }`. Called once before all failure/success branches in the login handler to avoid esbuild duplicate-const errors.

**Session management page** (`/sessions`): Lists all active sessions as device cards (browser, OS, IP, last active, "This device" badge). Actions: revoke single session, revoke all others, revoke all (logs out everywhere).

### 2.3 RBAC — requirePermission Middleware

`requirePermission(permission)` middleware applied to all data routes. Admin has wildcard `["*"]`. Operator has full data permissions. `user` role is read-only.

See `architectureV2.md §5.3` for the full permission table.

### 2.4 Receipt System

Every new ledger entry receives:

| Field | Value | Purpose |
|-------|-------|---------|
| `receipt_number` | `CSC-YYYY-NNNN` | Human-readable display |
| `receipt_token` | UUID | Public QR URL — prevents sequential enumeration |

**Atomic receipt numbering:**
```sql
INSERT INTO receipt_counters (year, last_count)
VALUES ($year, 1)
ON CONFLICT (year) DO UPDATE SET last_count = receipt_counters.last_count + 1
RETURNING last_count
```

Year derived from the entry `date` field (not wall clock) — backdated entries use the correct year's counter.

**`ReceiptModal` component:**
- Navy/saffron themed receipt card with QR code
- Print (browser popup, A5), PDF download (html2canvas + jsPDF, client-side), Web Share API
- Business info footer from settings: `businessName`, `businessAddress`, `businessMobile`, `businessWebsite`

**Public verify page** (`/receipts/verify/:token`):
- No auth required — scannable by customers
- `GET /api/receipts/verify/:token` returns display-safe fields only (never exposes `balance`, `createdBy`, or account data)
- Same visual design as `ReceiptModal` — always keep in sync

**Schema applied via raw SQL** (not `drizzle-kit push` — requires TTY):
```sql
ALTER TABLE ledger ADD COLUMN IF NOT EXISTS receipt_number text;
ALTER TABLE ledger ADD COLUMN IF NOT EXISTS receipt_token text;
CREATE TABLE IF NOT EXISTS receipt_counters (year integer PRIMARY KEY, last_count integer NOT NULL DEFAULT 0);
```

### 2.5 Admin Oversight Pages

Three admin-only endpoints (do not mix with admin's own personal data):

| Endpoint | Description |
|----------|-------------|
| `GET /api/admin/users-overview` | All users' balance + last transaction summary |
| `GET /api/admin/users-overview/:userId/ledger` | Single user's full ledger |
| `GET /api/admin/aeps-overview` | All users' AePS balances |

Frontend pages:
- `/users-overview` — cross-user balance card grid, expandable ledger drawer
- Admin can view any user's data without affecting their own personal ledger/AePS data

### 2.6 Notification Isolation Fixes

Seven isolation bugs patched in v2.1.0:

| # | Bug | Fix |
|---|-----|-----|
| 1 | Unknown-identifier failed login created a null-userId broadcast notification | Removed entirely |
| 2 | `notifyNewRegistration` broadcast to all users | Now queries admin IDs and creates one notification per admin |
| 3 | "Registration Setting Changed" had null userId | Scoped to acting admin's `userId` |
| 4 | "User Approved" had null userId | Scoped to approved user's `userId` |
| 5 | Backup created had null userId | Scoped to `req.session.userId` |
| 6 | Backup restored had null userId | Scoped to `req.session.userId` |
| 7 | Push unsubscribe had no ownership check | Added `AND userId = currentUser` |

**Rules:**
- `userId = null` on a notification row = true system-wide broadcast — visible to every user
- All user-specific and admin-specific events must receive an explicit `userId`
- `createSystemNotification` without `userIds` filters to `isActive = true AND status = 'ACTIVE'` only
- `queryClient.clear()` called on logout — prevents stale notification counts when switching accounts

### 2.7 UI Design System v2

**Mobile header (layout.tsx) — 3-layer structure:**

```
┌─ 3px gradient accent stripe (navy → saffron) ──────────┐
├─ 60px white main bar ───────────────────────────────────┤
│  [logo badge] SAHU CSC           [bell] [avatar chip]   │
├─ 44px navy gradient sub-bar ────────────────────────────┤
│  Good morning, Rajesh 🌅            Sat, 20 Jun         │
└─────────────────────────────────────────────────────────┘
```

Avatar chip opens the `Sheet` nav drawer — replaced the old hamburger icon. `firstName`, `greeting`, `greetingEmoji`, `shortDate` computed inside `Layout`.

**Mobile stat card pattern (established in Dashboard, extended in v2.2 Reports):**
```
white rounded-2xl overflow-hidden
├── 3px top stripe: background: linear-gradient(90deg, color1, color2)
└── p-3 body
    ├── label: 9-10px ALL CAPS, #94a3b8, letter-spacing 0.06em
    ├── icon badge: gradient (inline style), box-shadow, no flat bg-*
    └── value: 15-19px font-black, #0b2c60
box-shadow: 0 2px 12px rgba(11,44,96,0.08)
```

**Key rule:** Icon badges must use `background: linear-gradient(...)` as an inline style. Tailwind `bg-*` classes do not render gradients correctly in this context.

### 2.8 AePS Opening Balance Redesign

- **Before:** Flat navy `StatCard` in the stat grid
- **After:** `OpeningBalanceHeroCard` — full-width navy→indigo gradient card with 3px saffron top stripe
  - 44px amount, `Wallet` icon badge, session notes pill
  - Mini stats row: date / active / transaction count
  - "Edit" button pre-fills the dialog and sets `openForm` state

**Set/Edit dialog redesign:**
- Navy gradient header with saffron Wallet icon
- 60px rupee input
- `OPEN_QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000, 50000]` quick-fill chips
- Title auto-switches: "Set Day Opening Balance" / "Edit Opening Balance"

**Balance formula bar:**
- Before: plain text `₹OB − ₹WD + ₹DEP = ₹BAL`
- After: white card with color-coded chips — navy (Opening), red (Withdrawn), green (Deposited), bold Balance chip

### 2.9 PWA Status Page

New page at `/pwa-status` (App & Offline Status). Shows live:

| Section | Content |
|---------|---------|
| Network | Quality indicator, latency (ms), online/offline/slow status |
| Sync | Queue size, last sync time, sync status + manual sync button |
| Storage | IndexedDB store usage breakdown |
| Install | PWA install status, prompt button if installable |
| Push | Subscription status, subscribe/unsubscribe |
| Capabilities | Device capability checklist (notifications, service worker, IndexedDB, etc.) |
| Security | Session info summary |

### 2.10 Miscellaneous Fixes (v2.1)

| Area | Fix |
|------|-----|
| Udhari cache invalidation | Every mutation now invalidates all 4 affected query keys (customers list, single customer, entries, summary) |
| Responsive layout | `udhari.tsx` replaced JS `isMobile` with CSS `sm:hidden / hidden sm:block` — eliminates layout flicker |
| Mobile FAB | Positioned at `bottom-20` (80px) instead of `bottom-6` to clear the bottom nav bar (~64px) |
| Notifications page | Header stacks on mobile, tabs scroll horizontally, text truncates to prevent overflow |
| Reject-with-reason | When admin declines a registration, `{ rejected: true, rejectionReason }` returned on next login attempt; distinct toast shown to the user |
| `businessWebsite` setting | Added to `DEFAULT_SETTINGS` and `settings.tsx` form — no migration needed (key-value store) |

---

## 3. v2.0.0 — Udhari Khata (June 2026)

**Udhari Khata** = "credit notebook" — per-user customer credit ledger.

### New DB tables

**`udhari_customers`:** `id`, `name`, `phone`, `address`, `balance`, `created_by`, `created_at`, `updated_at`

**`udhari_entries`:** `id`, `customer_id`, `date`, `type` (`gave`/`got`), `amount`, `note`, `created_by`, `created_at`, `updated_at`

### Business rules

| Rule | Detail |
|------|--------|
| Balance sign | `> 0` = customer owes you (orange "To Collect"); `< 0` = you owe (green "To Pay"); `0` = settled |
| Entry types | `gave` = you gave credit → balance goes up; `got` = payment received → balance goes down |
| Balance calc | `recalcBalance(customerId)` runs `SUM(amount WHERE type=gave) - SUM(amount WHERE type=got)` after every entry change — server-side only |
| Isolation | `created_by` filter on all queries |
| Permissions | `udhari:view` (read), `udhari:manage` (write) |

### Frontend

| Page | Path | Description |
|------|------|-------------|
| Customer list | `/udhari` | Search + sort, "To Collect / To Pay" balance banner, FAB to add customer |
| Customer ledger | `/udhari/:id` | Balance banner, entry list (You Gave / You Got), entry form dialog, WhatsApp reminder, PDF export |
| Dashboard card | `UdhariSummaryCard` | Appears on dashboard once first customer is added; shows total to collect + to pay |

### API permissions added

```
udhari:view    — GET udhari/* routes
udhari:manage  — POST/PATCH/DELETE udhari/* routes
```

### Seed script change

`seed.ts` no longer seeds ledger entries. The ledger starts clean. Only users, services, settings, and notifications are seeded.

---

## 4. Database Schema Reference

### Tables added since v2.0.0

| Table | Added in | Purpose |
|-------|----------|---------|
| `user_sessions` | v2.1 | V2 multi-device session tracking |
| `receipt_counters` | v2.1 | Atomic per-year receipt number counter |
| `udhari_customers` | v2.0 | Udhari customer list (per-user) |
| `udhari_entries` | v2.0 | Udhari credit/debit entries |

### Column additions since v2.0.0

| Table | Column | Added in | Notes |
|-------|--------|----------|-------|
| `ledger` | `receipt_number` | v2.1 | `CSC-YYYY-NNNN` |
| `ledger` | `receipt_token` | v2.1 | UUID for QR public URL |
| `users` | `failed_login_attempts` | v2.1 | Incremented on wrong password |
| `users` | `locked_until` | v2.1 | Set for 15 min after 5 failures |

### All current tables

```
users                — accounts (role, status, locking, sessions)
user_sessions        — V2 multi-device session rows
session              — connect-pg-simple express session store (auto-created)
ledger               — income/expense transactions with receipts
receipt_counters     — atomic per-year receipt numbering
aeps_daily           — AePS daily cash float sessions
aeps_transactions    — individual AePS transactions
udhari_customers     — Udhari customer list (per-user)
udhari_entries       — Udhari credit/debit entries
services             — CSC service catalog
notifications        — user + system notifications
audit_logs           — immutable security event trail
settings             — global key-value config
user_preferences     — per-user UI settings
push_subscriptions   — VAPID Web Push subscription records
password_reset_tokens — OTP reset tokens
```

---

## 5. API Routes Reference

### Routes added in v2.x

| Added | Method | Path | Notes |
|-------|--------|------|-------|
| v2.1 | POST | `/api/auth/send-otp` | OTP generation (password reset + registration) |
| v2.1 | POST | `/api/auth/verify-otp` | OTP verification |
| v2.1 | POST | `/api/auth/reset-password` | New password after OTP |
| v2.1 | GET | `/api/sessions` | List active sessions |
| v2.1 | DELETE | `/api/sessions/:id` | Revoke by session DB ID |
| v2.1 | DELETE | `/api/sessions/others` | Revoke all except current |
| v2.1 | DELETE | `/api/sessions/all` | Revoke all + destroy current |
| v2.1 | GET | `/api/admin/users-overview` | All users' balance summary |
| v2.1 | GET | `/api/admin/users-overview/:userId/ledger` | Single user's ledger |
| v2.1 | GET | `/api/admin/aeps-overview` | All users' AePS balances |
| v2.1 | GET | `/api/receipts/verify/:token` | Public receipt verify (no auth) |
| v2.0 | GET | `/api/udhari/summary` | To-collect / to-pay totals |
| v2.0 | GET/POST | `/api/udhari/customers` | Customer list + create |
| v2.0 | GET/PATCH/DELETE | `/api/udhari/customers/:id` | Single customer CRUD |
| v2.0 | GET/POST | `/api/udhari/customers/:id/entries` | Entry list + create |
| v2.0 | PATCH/DELETE | `/api/udhari/customers/:id/entries/:eid` | Entry update/delete |

---

## 6. Known Gotchas & Conventions

| Topic | Rule |
|-------|------|
| **`connect-pg-simple` bundling** | Must be in esbuild `external` array in `build.mjs`. Bundling breaks its internal `table.sql` path — sessions silently never persist. |
| **Post-login auth cache** | Use `queryClient.setQueryData(["auth/me"], data)` from the login response. A `invalidateQueries` refetch races through the Replit proxy and causes a 401 → user = null → redirect cancelled. |
| **Auth loading guard** | `isLoading = liveLoading \|\| !offlineChecked` (OR). Using AND causes a brief unauthenticated flash on page refresh. |
| **`willChange: transform`** | Never add to page-transition `motion.div`. Creates a new CSS containing block and breaks `position: fixed` on the bottom nav. |
| **`parseDevice` once per login** | Called before all failure/success branches to avoid esbuild duplicate-const errors at build time. |
| **Udhari balance** | Always recalculated server-side (`recalcBalance()`) after every entry change. Never trust a client-supplied balance. |
| **Receipt token vs number** | Sequential number is display-only. UUID token is in the public URL — never put the sequential number in the URL (enumeration risk). |
| **Schema changes in non-TTY** | Use raw `ALTER TABLE … ADD COLUMN IF NOT EXISTS` + `CREATE TABLE IF NOT EXISTS`. `drizzle-kit push` requires an interactive TTY. |
| **Notification null userId** | Only for true system-wide broadcasts. All other events must pass explicit `userId`. |
| **OTP resend cooldown** | 120 seconds — on both forgot-password and register pages. Do not change to 60. |
| **Money as `numeric`** | Drizzle returns numeric as string. Always `parseFloat()` before returning from routes. |
| **AePS sessions** | Unique per `(date, created_by)` — each user owns their own daily session. |
| **Responsive layout rule** | Use Tailwind `sm:hidden / hidden sm:block` for pure layout differences. Use `useIsMobile()` only when the component architecture (not just styling) differs — e.g., Reports page. |
| **Mobile FAB position** | `bottom-20` (80px) to clear the ~64px bottom nav. `bottom-6` hides the FAB behind the nav. |
| **React Query clear on logout** | `queryClient.clear()` in `handleLogout` wipes all cached data — prevents stale state when switching accounts. |
| **Seed script** | Safe to re-run — all inserts use `onConflictDoNothing()`. Does NOT seed ledger entries (starts clean). Resets admin + operator passwords to defaults. |
| **Drizzle-kit push + data loss** | `drizzle-kit push` can empty tables in dev. Always run `Seed Database` workflow after any schema push. |
| **db module for seeding** | Use `pg@8.20.0` + `bcryptjs@3.0.3` directly in the seed script since `tsx` is not available in non-interactive scripts. |
| **VAPID keys** | Set as Replit Secrets for persistence. Without env vars, ephemeral keys are generated at startup — all push subscriptions are lost on server restart. |
| **API port** | Port 8082 (not 8080 — held by a Replit artifact workflow). Vite proxy in `vite.config.ts` must target 8082. |
| **`businessWebsite` setting** | Added to `DEFAULT_SETTINGS` — no DB migration needed. Settings table is a key-value store; new keys only need code changes. |
| **Udhari cache invalidation** | Every mutation must invalidate all 4 keys: `/api/udhari/customers`, `/api/udhari/customers/:id`, `/api/udhari/customers/:id/entries`, `/api/udhari/summary`. Missing any key causes stale UI. |
