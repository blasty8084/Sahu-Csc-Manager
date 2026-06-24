# SAHU CSC — Change Log v2
**Current version: 2.6.0 — June 2026**

> Comprehensive record of every feature, change, and upgrade from v2.0.0 onward.  
> For a full description of the system architecture, see `architectureV2.md`.  
> For the pre-v2.0 history, see `CHANGELOG.md`.

---

## Table of Contents

1. [v2.6.0 — Broadcast Center, OTP UX, Resend Progress Ring](#1-v260--broadcast-center-otp-ux--resend-progress-ring-june-2026)
   - [Broadcast Center](#11-broadcast-center)
   - [Broadcast History Log](#12-broadcast-history-log)
   - [OTP Email Copy Block](#13-otp-email-copy-block)
   - [OTP Auto-Fill](#14-otp-auto-fill)
   - [Resend OTP Progress Ring](#15-resend-otp-progress-ring)
2. [v2.5.0 — User Management Enhancements](#2-v250--user-management-enhancements-june-2026)
   - [Search & Role Filter](#11-search--role-filter)
   - [AePS Overview Tab](#12-aeps-overview-tab)
   - [Bulk Status Toggle (Active / All Users Tabs)](#13-bulk-status-toggle-active--all-users-tabs)
   - [CSV Export](#14-csv-export)
   - [Admin Password Reset](#15-admin-password-reset)
   - [Responsive Layout Fixes](#16-responsive-layout-fixes)
2. [v2.4.0 — Admin Registration Management & Admin Sessions](#2-v240--admin-registration-management--admin-sessions-june-2026)
   - [Pending Tab — Bulk Approve/Reject](#21-pending-tab--bulk-approvereject)
   - [Email Notifications for Registration Events](#22-email-notifications-for-registration-events)
   - [Sessions Sidebar Item (Mobile-Only)](#23-sessions-sidebar-item-mobile-only)
   - [Admin Sessions Tab in User Management](#24-admin-sessions-tab-in-user-management)
3. [v2.3.0 — Unified Profile + Settings Page](#3-v230--unified-profile--settings-page-june-2026)
   - [Unified /profile Page](#31-unified-profile-page)
   - [Desktop V5 Design — Command Center](#32-desktop-v5-design--command-center)
   - [Mobile V3 Design — iOS-Style Drill-In](#33-mobile-v3-design--ios-style-drill-in)
   - [Sessions Section Embedded](#34-sessions-section-embedded)
   - [Settings Page Removed](#35-settings-page-removed)
4. [v2.2.0 — Login UX Overhaul & Reports Redesign](#4-v220--login-ux-overhaul--reports-redesign-june-2026)
   - [Embedded Forgot-Password Flow (Inline)](#41-embedded-forgot-password-flow-inline)
   - [Login Attempt Counter with Visual Feedback](#42-login-attempt-counter-with-visual-feedback)
   - [Lockout Countdown Timer](#43-lockout-countdown-timer)
   - [Reports Page Full Redesign](#44-reports-page-full-redesign)
5. [v2.1.0 — Security, Receipts, Udhari, Admin Oversight](#5-v210--security-receipts-udhari-admin-oversight-june-2026)
   - [OTP Password Reset](#51-otp-password-reset)
   - [V2 Multi-Device Sessions](#52-v2-multi-device-sessions)
   - [RBAC — requirePermission Middleware](#53-rbac--requirepermission-middleware)
   - [Receipt System](#54-receipt-system)
   - [Admin Oversight Pages](#55-admin-oversight-pages)
   - [Notification Isolation Fixes](#56-notification-isolation-fixes)
   - [UI Design System v2](#57-ui-design-system-v2)
   - [AePS Opening Balance Redesign](#58-aeps-opening-balance-redesign)
   - [PWA Status Page](#59-pwa-status-page)
   - [Miscellaneous Fixes (v2.1)](#510-miscellaneous-fixes-v21)
6. [v2.0.0 — Udhari Khata](#6-v200--udhari-khata-june-2026)
7. [Database Schema Reference](#7-database-schema-reference)
8. [API Routes Reference](#8-api-routes-reference)
9. [Known Gotchas & Conventions](#9-known-gotchas--conventions)

---

## 1. v2.6.0 — Broadcast Center, OTP UX & Resend Progress Ring (June 2026)

### 1.1 Broadcast Center

**New page:** `/broadcast` (admin only) — `artifacts/sahu-csc/src/pages/broadcast.tsx`

Three-tab interface in a navy-header card layout:

| Tab | Purpose |
|-----|---------|
| **Push Notification** | Compose + send VAPID push to all subscribed devices |
| **Email Blast** | Compose + send email to all/active users (SMTP-gated) |
| **History** | Paginated log of every sent broadcast |

**Push tab:** Title (150 char max) + Message (500 char max) + optional link URL + "Also create in-app notification" checkbox. Send button shows subscriber count. Disabled if no subscribers.

**Email tab:** Recipient filter (all registered / active users only) + Subject + Body (plain text, monospace textarea). SMTP warning banner if not configured. Disabled if SMTP missing or zero recipients.

**Stats strip** (push + email tabs): Live `pushSubscribers` + `activeUsers` from `GET /api/admin/broadcast/stats`.

**New API endpoints** (`artifacts/api-server/src/routes/broadcast.ts` registered at `router.use(broadcastRouter)` in `routes/index.ts`):

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/admin/broadcast/stats` | `{ pushSubscribers, usersWithEmail, activeUsers, smtpConfigured }` |
| POST | `/api/admin/broadcast/push` | Sends via `sendPushToAll`; optionally creates in-app notification; logs to `broadcast_logs` |
| POST | `/api/admin/broadcast/email` | `recipientFilter: "all" | "active"`; sends via `sendBroadcastEmail`; logs to `broadcast_logs` |

**`sendBroadcastEmail`** added to `artifacts/api-server/src/lib/mailer.ts` — HTML + plain-text branded email blast template.

**Nav:** `Megaphone` icon added to admin sidebar in `layout.tsx`.

**Files changed:**
- `artifacts/sahu-csc/src/pages/broadcast.tsx` — new file
- `artifacts/api-server/src/routes/broadcast.ts` — new file
- `artifacts/api-server/src/routes/index.ts` — registered `broadcastRouter`
- `artifacts/api-server/src/lib/mailer.ts` — `sendBroadcastEmail` added
- `artifacts/sahu-csc/src/components/layout.tsx` — Megaphone nav item
- `artifacts/sahu-csc/src/App.tsx` — `/broadcast` route (adminOnly)

---

### 1.2 Broadcast History Log

**New DB table:** `broadcast_logs`

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `sent_by` | integer | FK → `users.id` |
| `channel` | text | `"push"` or `"email"` |
| `subject` | text | Push title or email subject |
| `body` | text | Full message body |
| `recipient_filter` | text | `"all"` / `"active"` / null (push) |
| `recipient_count` | integer | Devices/users actually sent |
| `failed_count` | integer | Failures (0 for email — not tracked per-recipient) |
| `created_at` | timestamptz | Auto-set |

Indexes: `sent_by`, `channel`, `created_at`.

**Schema file:** `lib/db/src/schema/broadcast_logs.ts`  
**Table applied via raw SQL** (drizzle-kit push requires TTY — not available in non-interactive shell).

**`GET /api/admin/broadcast/history`** — paginated, joins with `users` for sender name. Returns `{ logs, total, page, limit }`.

**History tab UI** (`broadcast.tsx`):
- Entry cards with coloured left stripe (purple = push, navy = email)
- Channel badge · subject · recipient count · failed count · sender name · timestamp
- "Show message" toggle expands the body inline
- Pagination with Prev/Next when >10 entries
- Empty state when nothing sent yet
- Send actions invalidate `["broadcast-history"]` cache

**Files changed:**
- `lib/db/src/schema/broadcast_logs.ts` — new schema file
- `lib/db/src/schema/index.ts` — export added
- `artifacts/api-server/src/routes/broadcast.ts` — `GET /history` endpoint + DB insert after each send
- `artifacts/sahu-csc/src/pages/broadcast.tsx` — History tab added

---

### 1.3 OTP Email Copy Block

**Problem:** The OTP email showed the code only as individual digit boxes — hard to copy on mobile.

**Change:** A prominent copy-friendly block was added below the digit boxes inside the OTP email:

```
─── or copy the full code ───

┌ - - - - - - - - - - - ┐
   4  8  2  9  1  7
└ - - - - - - - - - - - ┘

Tap the code above to select & copy it
```

**Implementation:** Added to `buildOtpHtml()` in `artifacts/api-server/src/lib/mailer.ts`:
- Full OTP in one `<p>` tag, `font-family: Courier New`, `letter-spacing: 10px`, `font-size: 32px`
- `user-select: all; -webkit-user-select: all; mso-user-select: all` — single tap selects the entire code in Gmail, Apple Mail, Outlook web
- Dashed accent-coloured border box to make it visually obvious
- Hint text: "Tap the code above to select & copy it"

Applies to both **Email Verification** (registration) and **Password Reset** OTP emails.

**Files changed:**
- `artifacts/api-server/src/lib/mailer.ts` — copy block added inside `buildOtpHtml`

---

### 1.4 OTP Auto-Fill

**Problem:** Mobile users had to manually type the 6-digit OTP from the email — no system suggestion appeared.

**Change:** Added `autoComplete="one-time-code"` (first digit box only) and `pattern="[0-9]*"` to every OTP input field on:
- `artifacts/sahu-csc/src/pages/forgot-password.tsx` — password reset OTP step
- `artifacts/sahu-csc/src/pages/register.tsx` — email verification OTP step

**Effect by platform:**
- **iOS 12+:** "From Mail: 482917 →" suggestion bar above the keyboard — one tap fills all 6 boxes
- **Android Chrome:** Smart autofill banner from recent email/SMS — one tap fills
- **Desktop Chrome:** Clipboard paste detected as OTP — auto-fills on paste

The existing `handleOtpPaste` already auto-submits when all 6 digits are pasted, so the complete flow on mobile is: **tap suggestion → code fills → form auto-submits**.

**Files changed:**
- `artifacts/sahu-csc/src/pages/forgot-password.tsx`
- `artifacts/sahu-csc/src/pages/register.tsx`

---

### 1.5 Resend OTP Progress Ring

**Problem:** The "Resend OTP in 120s" plain text gave users no intuitive sense of how much time remained.

**Change:** Replaced the text-only countdown with an **SVG circular progress ring** that drains visually as the cooldown ticks:

```
  ◑ 74    Resend OTP in 74s
```

**Design:**
- 32×32 SVG with two concentric circles: grey track + navy progress arc
- Arc starts at 12 o'clock (`rotate(-90deg)` on SVG)
- `strokeDashoffset` computed from `CIRC * (1 - resendSeconds / RESEND_COOLDOWN)` — full at start, empty at 0
- `transition: stroke-dashoffset 1s linear` for smooth per-second animation
- Remaining seconds rendered in the centre of the ring (9px bold navy)
- When `resendSeconds === 0`: ring disappears, navy "Resend OTP" button with `RefreshCw` icon appears

Added to both `forgot-password.tsx` and `register.tsx` OTP steps. No new component file — implemented inline using an IIFE expression in JSX.

**Files changed:**
- `artifacts/sahu-csc/src/pages/forgot-password.tsx`
- `artifacts/sahu-csc/src/pages/register.tsx`

---

## 2. v2.5.0 — User Management Enhancements (June 2026)

### 1.1 Search & Role Filter

**Problem:** With many registered users, admins had no way to filter the user list — they had to scan the entire table.

**Change:** A search + role filter bar was added to the top of the **Active** and **All Users** tabs.

**UI:**
- **Search input** (magnifying glass icon): real-time filter on `username`, `fullName`, `email`, `mobile`
- **Role dropdown** (`<Select>`): "All Roles" (default) · "Admin" · "Operator" · "User"
- Filters are combined — role + search can both be active simultaneously
- Clear button on the search input; role resets to "All Roles" on tab change

**State added:**
```ts
const [searchQuery, setSearchQuery] = useState("");
const [roleFilter, setRoleFilter] = useState<string>("all");
```

**`displayedUsers` derivation:**
```ts
const displayedUsers = users
  .filter(user =>
    (roleFilter === "all" || user.role === roleFilter) &&
    (searchQuery === "" ||
      [user.username, user.fullName, user.email, user.mobile]
        .some(field => field?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );
```

**Files changed:**
- `artifacts/sahu-csc/src/pages/users.tsx` — search input + role `<Select>` in Active/All tab headers; `displayedUsers` computed from `searchQuery` + `roleFilter`; `toggleSelectAll` updated to use `displayedUsers`

---

### 1.2 AePS Overview Tab

**Change:** A 6th tab — **AePS Overview** — was added to the User Management page so admins can see each operator's AePS cash balance at a glance.

**Tab type extended:**
```ts
type Tab = "pending" | "active" | "all" | "overview" | "aeps" | "sessions";
```

**Backend:** Uses the existing `GET /api/admin/aeps-overview` endpoint — no new backend code needed.

**`useAepsOverview()` hook:**
```ts
function useAepsOverview() {
  return useQuery({
    queryKey: ["admin-aeps-overview"],
    queryFn: () => customFetch("/api/admin/aeps-overview"),
    enabled: tab === "aeps",
  });
}
```

**`AepsOverviewTab` component:**
- Summary bar: total AePS balance across all users
- **Per-user `AepsUserSummary` cards:**
  - User avatar (initials), full name, `@username`, role badge
  - Opening balance, total deposited, total withdrawn, net balance
  - Last session date
  - Color-coded balance chip: green (positive) · red (negative) · gray (zero)
- Loading: 3 skeleton cards
- Empty state: `Wallet` icon + "No AePS data found"

**Tab bar ordering (left → right):** Pending · Active · All Users · Cash Overview · **AePS Overview** · Sessions

**Files changed:**
- `artifacts/sahu-csc/src/pages/users.tsx` — `Tab` type extended, tab bar item, `AepsOverviewTab` component, `AepsUserSummary` sub-component, `useAepsOverview` hook, "Add User" button condition updated to exclude `"aeps"` tab

---

### 1.3 Bulk Status Toggle (Active / All Users Tabs)

**Problem:** Admins could only activate or suspend users one at a time. Bulk actions existed for Pending registrations but not for Active/All tabs.

**Change:** The **Active** and **All Users** tabs now support checkboxes + bulk Activate / Suspend.

**UI additions:**
- **Checkbox column** in desktop table header + each row; checkbox on mobile cards
- **Master "select all"** checkbox: selects/deselects all `displayedUsers` for the current tab
- **Sticky bulk action bar** (appears when ≥1 user selected):
  - Selected count label
  - Green **"Activate Selected"** button (`UserCheck` icon)
  - Amber **"Suspend Selected"** button (`UserX` icon)
  - Gray **"Clear"** button
  - Bar uses `flex-wrap` so buttons stack gracefully on narrow screens

**`bulkSetStatus(activate: boolean)` handler:**
```ts
async function bulkSetStatus(activate: boolean) {
  setBulkActionLoading(true);
  const ids = [...selectedIds];
  await Promise.all(
    ids.map(id =>
      customFetch(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: activate ? "ACTIVE" : "SUSPENDED" }),
      })
    )
  );
  setSelectedIds(new Set());
  setBulkActionLoading(false);
  queryClient.invalidateQueries({ queryKey: ["users"] });
  toast.success(`${ids.length} user(s) ${activate ? "activated" : "suspended"}`);
}
```

**State added:**
```ts
const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
const [bulkActionLoading, setBulkActionLoading] = useState(false);
```

**Selection clears** on tab change (`useEffect` watching `tab`).

**No new API endpoints** — reuses existing `PATCH /api/users/:id` with `{ status }`.

**Files changed:**
- `artifacts/sahu-csc/src/pages/users.tsx` — checkbox column, master checkbox, bulk action bar (Active + All tabs), `bulkSetStatus`, selection state, `toggleSelectAll` re-uses `displayedUsers`

---

### 1.4 CSV Export

**Change:** A **Download CSV** button was added to the User Management page header. It exports the currently visible user list respecting the active tab, search query, and role filter.

**`exportCSV()` function:**
```ts
function exportCSV() {
  const rows = [
    ["ID", "Username", "Full Name", "Email", "Mobile", "Role", "Status", "Created"],
    ...displayedUsers.map(u => [
      u.id, u.username, u.fullName, u.email ?? "",
      u.mobile ?? "", u.role, u.status,
      new Date(u.createdAt).toLocaleDateString("en-IN"),
    ]),
  ];
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `users-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
```

**UI:** `Download` icon button in the page header — icon-only on mobile, icon + "Export CSV" label on `sm:flex` desktop.

**Filename pattern:** `users-<tab>-<YYYY-MM-DD>.csv`

**Files changed:**
- `artifacts/sahu-csc/src/pages/users.tsx` — `exportCSV` function, `Download` icon import, header button

---

### 1.5 Admin Password Reset

**Problem:** Admins had no way to reset another user's password directly — the only existing path was the user-initiated OTP email flow.

**Change:** Each user row in the Active and All Users tabs now has a **Reset Password** button (`KeyRound` icon) that opens a dialog where the admin sets a new password directly.

**Dialog features:**
- **New password** input with show/hide toggle
- **Confirm password** input with show/hide toggle
- **Live policy checklist** (updates as admin types):
  - ✅/❌ Minimum 8 characters
  - ✅/❌ Uppercase letter
  - ✅/❌ Lowercase letter
  - ✅/❌ Contains a number
  - ✅/❌ Passwords match
- Submit button disabled until all 5 checks are green

**`resetPassword(userId, newPassword)` handler:**
```ts
async function resetPassword(userId: number, newPassword: string) {
  await customFetch(`/api/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ password: newPassword }),
  });
  setResetPasswordOpen(false);
  setResetPasswordValue("");
  setResetPasswordConfirm("");
  toast.success("Password updated successfully");
}
```

**State added:**
```ts
const [resetPasswordOpen, setResetPasswordOpen] = useState<number | false>(false);
const [resetPasswordValue, setResetPasswordValue] = useState("");
const [resetPasswordConfirm, setResetPasswordConfirm] = useState("");
const [showResetPw, setShowResetPw] = useState(false);
const [showResetConfirm, setShowResetConfirm] = useState(false);
```

**No new API endpoints** — reuses existing `PATCH /api/users/:id`. The route already accepts and bcrypt-hashes a `password` field.

**Files changed:**
- `artifacts/sahu-csc/src/pages/users.tsx` — `KeyRound` icon import, reset password button in user rows (Active + All tabs), `ResetPasswordDialog` inline component, `resetPassword` handler, reset password state

---

### 1.6 Responsive Layout Fixes

**Changes applied to `users.tsx`:**

| Area | Fix |
|------|-----|
| Header buttons | Icon-only on mobile (`sm:hidden` label spans); icon + label on `sm:flex` desktop |
| Search/filter bar | `flex-col sm:flex-row` so search input and role dropdown stack vertically on mobile |
| Bulk action bars | `flex-wrap` on both Active-tab and All-tab bars so action buttons wrap instead of overflowing on narrow screens |
| Table checkbox column | Fixed 40px width — does not push other columns on narrow viewports |

**Files changed:**
- `artifacts/sahu-csc/src/pages/users.tsx` — responsive class adjustments throughout

---

## 2. v2.4.0 — Admin Registration Management & Admin Sessions (June 2026)

### 2.1 Pending Tab — Bulk Approve/Reject

**Problem:** Admins reviewing a large queue of pending registrations had to approve or reject users one at a time.

**Change:** The Pending tab in `users.tsx` now supports bulk selection and bulk approve/reject.

**UI additions:**
- **Checkbox column** in the desktop table header and each row
- **Master "select all" checkbox** in the header: checked = all selected, indeterminate = partial selection
- **Bulk action bar** (appears when ≥1 user is selected): selected count label + green "Approve Selected" button + red "Reject Selected" button + "Clear" button
- **Bulk reject dialog**: before bulk rejecting, admin enters an optional rejection reason applied to all selected users; has a `<Select>` with common preset reasons + free-text textarea

**State added to `Users` component:**
```ts
const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
const [bulkRejectOpen, setBulkRejectOpen] = useState(false);
const [bulkRejectReason, setBulkRejectReason] = useState("");
const [bulkActionLoading, setBulkActionLoading] = useState(false);
```

**Helper functions:**
- `toggleSelect(id)` — add/remove one ID from the set
- `toggleSelectAll()` — select all displayed pending users or clear if all selected
- `bulkApprove()` — calls `POST /api/admin/registration/bulk-approve` with `{ userIds: [...] }`
- `bulkReject()` — calls `POST /api/admin/registration/bulk-reject` with `{ userIds: [...], reason }` then closes dialog

After any bulk action: selection is cleared, pending list refetches, toast shown with count.

**Individual approve/reject buttons** remain unchanged — `bulkActionLoading` disables them while a bulk action is in progress to prevent conflicts.

**Files changed:**
- `artifacts/sahu-csc/src/pages/users.tsx` — checkbox column, master checkbox, bulk action bar, bulk reject dialog, `selectedIds` state, toggle helpers, bulk action handlers

---

### 2.2 Email Notifications for Registration Events

**New file:** `artifacts/api-server/src/lib/mailer.ts`

Nodemailer-based email sender. All functions are SMTP-gated — they check for `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` env secrets before attempting any send. All calls in routes are fire-and-forget with `try/catch` — a missing or misconfigured SMTP setup never breaks the registration flow.

**Three email functions:**

| Function | Trigger | Recipient(s) |
|----------|---------|--------------|
| `sendApprovalEmail(user)` | Admin approves a user | The newly approved user |
| `sendRejectionEmail(user, reason?)` | Admin rejects a user | The rejected user |
| `sendNewRegistrationAdminEmail(newUser, adminEmails[])` | New user self-registers | All active admin email addresses |

**Wiring:**
- `admin-registration.ts` approve handler → `sendApprovalEmail(approvedUser)` (fire-and-forget)
- `admin-registration.ts` reject handler → `sendRejectionEmail(rejectedUser, reason)` (fire-and-forget)
- `auth.ts` register handler → queries active admin emails → `sendNewRegistrationAdminEmail(newUser, adminEmails)` (fire-and-forget)

**SMTP environment secrets required:**

| Secret | Purpose |
|--------|---------|
| `SMTP_HOST` | Mail server hostname (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | Port — default `587` (TLS) |
| `SMTP_USER` | SMTP auth username / email address |
| `SMTP_PASS` | SMTP password or app-specific password |
| `SMTP_FROM` | Sender display name + address (e.g. `"SAHU CSC" <noreply@sahucsc.in>`) |

**Files changed:**
- `artifacts/api-server/src/lib/mailer.ts` — new file
- `artifacts/api-server/src/routes/admin-registration.ts` — approval/rejection email calls added
- `artifacts/api-server/src/routes/auth.ts` — new registration admin alert email call

---

### 2.3 Sessions Sidebar Item (Mobile-Only)

**Change:** The "Active Sessions" item has been removed from the desktop sidebar. It remains fully accessible in the mobile bottom-nav drawer and at `/sessions` directly.

**Rationale:** The Sessions UI is already embedded inside `/profile` on desktop (as the "Active Sessions" card section). Keeping a separate Sessions link in the desktop sidebar was redundant and cluttered the admin nav.

**Implementation:**
- Added `mobileOnly?: boolean` to the `NavItem` interface in `layout.tsx`
- Sessions nav item marked `mobileOnly: true`
- Desktop `<SidebarNav>` prop receives `navItems.filter(item => !item.mobileOnly)`
- Mobile drawer still receives the full `navItems` list (including mobile-only items)

**Files changed:**
- `artifacts/sahu-csc/src/components/layout.tsx`

---

### 2.4 Admin Sessions Tab in User Management

**New feature:** A **Sessions** tab added to the User Management page (`/users`) so admins can see all active sessions across all users and forcefully revoke any of them.

#### Backend

**New file:** `artifacts/api-server/src/routes/admin-sessions.ts`

All three endpoints require `requireRole("admin")`:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/sessions` | All active, non-expired sessions joined with user info |
| `DELETE` | `/api/admin/sessions/:id` | Revoke a specific session by DB row ID |
| `DELETE` | `/api/admin/sessions/user/:userId` | Revoke all sessions for a specific user |

**`GET /api/admin/sessions` response item shape:**
```json
{
  "id": 5,
  "sessionId": "uuid-...",
  "userId": 2,
  "username": "operator",
  "fullName": "Jane Doe",
  "role": "operator",
  "deviceInfo": "Chrome on Windows",
  "browser": "Chrome",
  "os": "Windows",
  "ipAddress": "1.2.3.4",
  "rememberMe": false,
  "lastActivity": "2026-06-22T05:20:00.000Z",
  "expiresAt": "2026-06-22T13:20:00.000Z",
  "createdAt": "2026-06-22T05:15:00.000Z"
}
```

**Revocation mechanism:** Sets `isActive = false` on `userSessionsTable`. Does **not** touch the express `session` table — that belongs to the admin performing the revocation. `requireAuth` automatically rejects the target user's next request because `isActive = false`.

**New audit codes:**
```
admin.session.revoke              — Admin revoked one session for another user
admin.session.revoke_all_for_user — Admin revoked all sessions for a user
```

**Registration:** `adminSessionsRouter` imported and `router.use(adminSessionsRouter)` added in `routes/index.ts`.

#### Frontend

**`users.tsx` changes (5 items):**

1. **Icon imports** — added `MonitorSmartphone`, `Smartphone`, `Monitor`, `Tablet`, `LogOut`, `RefreshCw`, `Globe`
2. **`Tab` type** extended: `"pending" | "active" | "all" | "overview" | "sessions"`
3. **"Add User" button** condition: `tab !== "overview" && tab !== "sessions"`
4. **Tab bar** — "Sessions" tab added as the 5th tab (no count badge)
5. **Tab content** — `tab === "sessions" ? <AdminSessionsTab />` added before the `isLoading` check

**Helper functions added before component:**
```ts
useAdminSessions()        // React Query; fetches /api/admin/sessions; refetchInterval 30s
getDeviceIcon(os)         // returns Smartphone | Monitor (Monitor is default for desktop/unknown)
formatRelative(iso)       // "just now" / "Xm ago" / "Xh ago" / "Xd ago"
```

**`AdminSessionsTab` component:**
- Fetches all sessions via `useAdminSessions()`
- Groups sessions by `userId` using `.reduce()`
- **Summary bar:** "N active sessions across M users" + Refresh button
- **Per-user group card:**
  - **Header:** initials avatar, full name, `@username`, role badge, session count, "Revoke All" button
  - **Mobile cards (`sm:hidden`):** device info row + IP / relative time / expiry in subtext + revoke icon button
  - **Desktop table (`hidden sm:block`):** browser, OS, IP, last active, expires, Remember Me badge (8h / 30d), Revoke button
- **Revoke handlers:** `revokeSession(id)` + `revokeAllForUser(userId, username)` — both invalidate `["admin-sessions"]` and show a toast
- **Loading state:** 3 skeleton cards
- **Empty state:** `MonitorSmartphone` icon + "No active sessions" message

**Files changed:**
- `artifacts/api-server/src/routes/admin-sessions.ts` — new file
- `artifacts/api-server/src/routes/index.ts` — registered `adminSessionsRouter`
- `artifacts/sahu-csc/src/pages/users.tsx` — 7 edits (icons, Tab type, button condition, tab bar, tab content render, helper functions, `AdminSessionsTab` component)

---

## 3. v2.3.0 — Unified Profile + Settings Page (June 2026)

### 1.1 Unified /profile Page

**Problem:** Users had to navigate between two separate pages — `/profile` (personal info, avatar, password) and `/settings` (business info, system config, theme) — with no logical grouping and duplicated navigation steps for admins.

**Change:** `/profile` is now the single unified page for all user and admin settings. The standalone `/settings` page (`settings.tsx`) has been deleted. The `/settings` route redirects to `/profile` via `App.tsx`. No API endpoints were removed — only the frontend page was merged and the file deleted.

**Sections in the unified page:**

| Section | Visible to | Content |
|---------|-----------|---------|
| Personal Info | All | Full name, email, mobile, address, bio; avatar upload (camera / gallery picker), remove photo |
| Security | All | Change password form |
| Sessions | All | Embedded session management (see §2.4) |
| Preferences | All | Theme, language, dashboard layout |
| Business Info | Admin only | Business name, mobile, email, website, address |
| System | Admin only | Registration control toggle, system language/theme/currency, auto-backup |

Admin-only sections are hidden for non-admin users. On desktop they appear in the right column with an orange `Admin` badge in the card header. On mobile, they only appear in the section list when the logged-in user is an admin.

**Files changed:**
- `artifacts/sahu-csc/src/pages/profile.tsx` — full rewrite; unified page with all sections + V5 Command Center desktop layout
- `artifacts/sahu-csc/src/pages/settings.tsx` — **deleted**
- `artifacts/sahu-csc/src/App.tsx` — `/settings` route changed to `<Redirect to="/profile" />`

---

### 1.2 Desktop V5 Design — Command Center

**Design:** A full-width navy Command Center banner breaks out of the page padding, followed by a two-column grid — a wide content column on the left and a narrower (300px) contextual column on the right.

```
┌──────────────────────────────────────────────────────────────┐
│  COMMAND BANNER  (navy gradient, -mx-8 -mt-8 px-8 py-6)      │
│  [Avatar 80px]  Full Name · email · role badge               │
│                              [Sessions] [Role] [Sess. Length]│
└──────────────────────────────────────────────────────────────┘
┌────────────────────────────────┐ ┌────────────────────────┐
│  Personal Information          │ │  Preferences           │
│  (2-col form grid)             │ ├────────────────────────┤
│                                │ │  Business Info  [Admin]│
│  Security                      │ ├────────────────────────┤
│  (password form)               │ │  System Sett.   [Admin]│
│                                │ └────────────────────────┘
│  Active Sessions               │
│  (sessions UI)                 │
└────────────────────────────────┘
```

**Command Banner:**
- Background: `linear-gradient(135deg, #0b2c60 0%, #0d3270 50%, #0f3872 100%)`
- Breaks out of layout container padding: `-mx-8 -mt-8 mb-6 px-8 py-6`
- Left side: 80px avatar (ring + shadow), full name, email, mobile, role badge
- Right side: 3-stat KPI strip — total active sessions (blue chip), account role (saffron chip), session length (green chip for standard / purple for 30d)

**Two-column grid:**
- `display: grid; gridTemplateColumns: "1fr 300px"; gap: 24px`
- Left column (flex-1): Personal Info card → Security card → Active Sessions card
- Right column (300px, fixed): Preferences card → Business Info card (admin, orange border) → System Settings card (admin, orange border)

**`CmdCard` helper component:**
- `rounded-xl border bg-card shadow-sm overflow-hidden`
- Header: icon badge (navy `bg-primary/10`, 32px, rounded-lg) + bold title + optional `Admin` orange badge + optional `action` slot (right-aligned)
- Admin cards: `border-orange-200`; header: `bg-orange-50/60`; badge: orange text
- Body: `px-5 py-4`

**Files changed:**
- `artifacts/sahu-csc/src/pages/profile.tsx` — `CmdCard` helper added; removed `SectionBlock`, `activeAnchor` state, `ALL_NAV` array; desktop layout replaced with Command Center banner + two-column grid
- `artifacts/sahu-csc/src/components/layout.tsx` — Settings nav link removed from sidebar (admin section)
- `artifacts/sahu-csc/src/lib/prefetch.ts` — `/settings` prefetch entry removed

---

### 1.3 Mobile V3 Design — iOS-Style Drill-In

**Design:** The mobile layout has two states — a home screen showing the avatar summary + section list, and a drill-in view for the selected section.

```
Mobile Home Screen:                 Drill-in (e.g. Security):
┌──────────────────────────┐        ┌──────────────────────────┐
│  [Avatar 80px]           │        │  ← Back    Security      │
│  Rajesh Kumar            │        ├──────────────────────────┤
│  admin@sahucsc.in        │        │  Change Password         │
│  [admin badge]           │        │  ─────────────────       │
├──────────────────────────┤        │  Sessions                │
│  👤  My Profile      ❯   │        │  (compact card list)     │
│  🔒  Security        ❯   │        │  [Logout Others]         │
│  🎨  Preferences     ❯   │        │  [Logout All]            │
│  🏢  Business Info   ❯   │        └──────────────────────────┘
│  ⚙️   System         ❯   │
└──────────────────────────┘
```

**Implementation details:**

- State: `mobileSection: MobileTab | null` — `null` = home screen
- Section options: `"profile"`, `"security"`, `"preferences"`, `"business"` (admin), `"system"` (admin)
- Home screen: avatar card (clickable camera button), tappable rows with icon badge + label + `ChevronRight`
- Drill-in: breadcrumb header with `← Back` button, section content renders inline
- Sessions embedded inside `"security"` drill-in as a compact card list + bulk-action button strip

**Mobile nav items:**

| ID | Label | Icon | Admin only |
|----|-------|------|-----------|
| `profile` | My Profile | User | No |
| `security` | Security | Lock | No |
| `preferences` | Preferences | Palette | No |
| `business` | Business Info | Building2 | Yes |
| `system` | System | Settings2 | Yes |

---

### 1.5 Settings Page Removed

**Change:** `artifacts/sahu-csc/src/pages/settings.tsx` has been deleted. Business config, system settings, and preferences are all now managed inside `/profile`.

**Impact:**

| Item | Before | After |
|------|--------|-------|
| `settings.tsx` | Standalone page | **Deleted** |
| `/settings` route in `App.tsx` | Rendered `settings.tsx` | `<Redirect to="/profile" />` |
| Settings nav link in sidebar | Shown in admin nav section | **Removed** |
| `/settings` prefetch in `prefetch.ts` | Listed | **Removed** |

No API routes were changed. `GET /api/settings` and `PATCH /api/settings` remain on the backend — they are consumed by the profile page.

---

### 1.4 Sessions Section Embedded

**Change:** The full session management UI from `sessions.tsx` is embedded directly into `/profile` as the **Sessions** section. The standalone `/sessions` page still exists and is fully functional — it is not removed or redirected.

**Embedded UI (desktop — full section; mobile — inside Security drill-in):**

```
Active Sessions section:
┌─────────────────────────────────────────────────────────┐
│  Manage where you're logged in           [Refresh ↺]    │
├─────────────────────────────────────────────────────────┤
│  [3]           [admin]        [8h]                      │
│  Active Sessions  Account Role  Session Length           │
├─────────────────────────────────────────────────────────┤
│  ⚠ Sign out other devices   2 sessions  [Logout Others] │
│  ✕ Sign out everywhere                  [Logout All]    │
├─────────────────────────────────────────────────────────┤
│  🛡 Current Session  [This Device]                      │
│  Chrome on Android · 192.168.1.1 · just now             │
├─────────────────────────────────────────────────────────┤
│  Firefox on Windows · 10.0.0.1 · 2h ago     [Revoke]   │
├─────────────────────────────────────────────────────────┤
│  💡 Security tip: ...                                   │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- 3-stat strip: total active sessions · account role · session length (8h / 30d)
- "Logout Others" orange banner (only shown when other sessions exist)
- "Logout All" red banner (always shown when sessions > 0)
- Current session card with `ShieldCheck` icon + "This Device" badge
- Other sessions list: each with a Revoke button
- Auto-refreshes every 30 seconds (`refetchInterval: 30_000`)
- Manual Refresh button (`RefreshCw` icon, spins during fetch)
- 3 confirmation `AlertDialog`s: Revoke single · Logout Others · Logout All

**State added to `Profile` component:**
```ts
const [revokeId, setRevokeId] = useState<number | null>(null);
const [revokeOthersOpen, setRevokeOthersOpen] = useState(false);
const [revokeAllOpen, setRevokeAllOpen] = useState(false);
```

**Session helpers inlined (from `sessions.tsx`):**
- `deviceIcon(os)` — returns `Smartphone | Tablet | Monitor`
- `timeAgo(iso)` — "just now" / "Xm ago" / "Xh ago" / "Xd ago"
- `formatExpiry(iso)` — "Expires in Xd Xh" / "Expires in Xh Xm" / "Expired"
- `apiFetch(path, options?)` — fetch wrapper with credentials + JSON headers
- `SessionCard` — sub-component; supports optional `compact` prop for mobile view

**Files changed:**
- `artifacts/sahu-csc/src/pages/profile.tsx` — sessions query + 3 mutations + all helpers + `SessionCard` sub-component added

---

## 4. v2.2.0 — Login UX Overhaul & Reports Redesign (June 2026)

### 2.1 Embedded Forgot-Password Flow (Inline)

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

### 2.2 Login Attempt Counter with Visual Feedback

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

### 2.3 Lockout Countdown Timer

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

### 2.4 Reports Page Full Redesign

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

## 5. v2.1.0 — Security, Receipts, Udhari, Admin Oversight (June 2026)

### 3.1 OTP Password Reset

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

### 3.2 V2 Multi-Device Sessions

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

### 3.3 RBAC — requirePermission Middleware

`requirePermission(permission)` middleware applied to all data routes. Admin has wildcard `["*"]`. Operator has full data permissions. `user` role is read-only.

See `architectureV2.md §5.3` for the full permission table.

### 3.4 Receipt System

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

### 3.5 Admin Oversight Pages

Three admin-only endpoints (do not mix with admin's own personal data):

| Endpoint | Description |
|----------|-------------|
| `GET /api/admin/users-overview` | All users' balance + last transaction summary |
| `GET /api/admin/users-overview/:userId/ledger` | Single user's full ledger |
| `GET /api/admin/aeps-overview` | All users' AePS balances |

Frontend pages:
- `/users-overview` — cross-user balance card grid, expandable ledger drawer
- Admin can view any user's data without affecting their own personal ledger/AePS data

### 3.6 Notification Isolation Fixes

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

### 3.7 UI Design System v2

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

### 3.8 AePS Opening Balance Redesign

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

### 3.9 PWA Status Page

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

### 3.10 Miscellaneous Fixes (v2.1)

| Area | Fix |
|------|-----|
| Udhari cache invalidation | Every mutation now invalidates all 4 affected query keys (customers list, single customer, entries, summary) |
| Responsive layout | `udhari.tsx` replaced JS `isMobile` with CSS `sm:hidden / hidden sm:block` — eliminates layout flicker |
| Mobile FAB | Positioned at `bottom-20` (80px) instead of `bottom-6` to clear the bottom nav bar (~64px) |
| Notifications page | Header stacks on mobile, tabs scroll horizontally, text truncates to prevent overflow |
| Reject-with-reason | When admin declines a registration, `{ rejected: true, rejectionReason }` returned on next login attempt; distinct toast shown to the user |
| `businessWebsite` setting | Added to `DEFAULT_SETTINGS` — no migration needed (key-value store); managed via Business Info section in `/profile` |

---

## 6. v2.0.0 — Udhari Khata (June 2026)

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

## 7. Database Schema Reference

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

## 8. API Routes Reference

### Routes added in v2.x

| Added | Method | Path | Notes |
|-------|--------|------|-------|
| v2.5 | — | — | No new API routes. All v2.5 features (search/filter, bulk status, CSV export, AePS overview tab, admin password reset) reuse existing endpoints: `PATCH /api/users/:id`, `GET /api/admin/aeps-overview` |
| v2.4 | GET | `/api/admin/sessions` | All active sessions (admin) |
| v2.4 | DELETE | `/api/admin/sessions/:id` | Revoke session (admin) |
| v2.4 | DELETE | `/api/admin/sessions/user/:userId` | Revoke all for user (admin) |
| v2.4 | POST | `/api/admin/registration/bulk-approve` | Bulk approve pending users |
| v2.4 | POST | `/api/admin/registration/bulk-reject` | Bulk reject with reason |
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

## 9. Known Gotchas & Conventions

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
