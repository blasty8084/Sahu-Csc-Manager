# SAHU CSC v2 — Authentication System with Admin-Controlled Registration & Approval Flow

---

## Tech Stack

> Use exactly this stack — no substitutions.

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express + TypeScript |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Neon free tier via `DATABASE_URL`) |
| Cache | Upstash Redis (REST API via `UPSTASH_REDIS_REST_URL` + TOKEN) |
| Auth | bcrypt + express-session + connect-pg-simple |
| Security | helmet, express-rate-limit, zod |
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| State | TanStack Query (React Query) |
| Routing | React Router v6 |
| Offline | Dexie.js (IndexedDB wrapper) |

---

## Phase 1 — Database Schema

Run Drizzle migrations to create all tables before any other step.

### Table: `system_settings`

```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
key         VARCHAR(100) UNIQUE NOT NULL
value       TEXT NOT NULL
updated_by  UUID REFERENCES users(id)
updated_at  TIMESTAMP DEFAULT now()
```

> **Seed one row on first run:**
> `key = 'registration_open'`, `value = 'false'`

---

### Table: `users`

```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
username          VARCHAR(50) UNIQUE NOT NULL
full_name         VARCHAR(100) NOT NULL
email             VARCHAR(150) UNIQUE NOT NULL
mobile            VARCHAR(15) UNIQUE NOT NULL
password_hash     TEXT NOT NULL
role              ENUM('ADMIN','OPERATOR','USER') DEFAULT 'USER'
status            ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','LOCKED','DELETED') DEFAULT 'PENDING'
rejection_reason  TEXT
profile_picture   TEXT
created_at        TIMESTAMP DEFAULT now()
updated_at        TIMESTAMP DEFAULT now()
```

---

### Table: `user_sessions`

```sql
id             UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id        UUID REFERENCES users(id) ON DELETE CASCADE
session_token  TEXT UNIQUE NOT NULL
device         TEXT
browser        TEXT
ip_address     VARCHAR(45)
last_activity  TIMESTAMP DEFAULT now()
expires_at     TIMESTAMP NOT NULL
remember_me    BOOLEAN DEFAULT false
created_at     TIMESTAMP DEFAULT now()
```

---

### Table: `password_reset_tokens`

```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID REFERENCES users(id) ON DELETE CASCADE
token_hash  TEXT UNIQUE NOT NULL
expires_at  TIMESTAMP NOT NULL
used        BOOLEAN DEFAULT false
created_at  TIMESTAMP DEFAULT now()
```

---

### Table: `audit_logs`

```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID REFERENCES users(id) ON DELETE SET NULL
action      VARCHAR(100) NOT NULL
ip_address  VARCHAR(45)
device      TEXT
meta        JSONB
created_at  TIMESTAMP DEFAULT now()
```

**Valid `action` values:**
`LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`, `REGISTER_REQUEST`, `APPROVED`, `REJECTED`, `PASSWORD_CHANGE`, `PASSWORD_RESET`, `SESSION_EXPIRED`, `ROLE_CHANGED`, `ACCOUNT_LOCKED`, `REGISTRATION_ENABLED`, `REGISTRATION_DISABLED`

---

## Phase 2 — Admin-Controlled Registration Toggle

Admin can enable or disable public registration from the Settings page.  
This setting is stored in `system_settings` (`key = 'registration_open'`).  
Cache the value in Redis with **TTL = 60 seconds**.

### API Endpoints

#### `GET /api/settings/registration-status`
- Public endpoint — no auth required
- Read Redis cache first, fallback to PostgreSQL
- Response: `{ open: true }` or `{ open: false }`

#### `PATCH /api/admin/settings/registration`
- Auth required: **ADMIN only**
- Body: `{ open: boolean }`
- Update `system_settings` table
- Invalidate Redis cache key `registration_open`
- Write audit log: `REGISTRATION_ENABLED` or `REGISTRATION_DISABLED`
- Response: `{ success: true, open: boolean }`

### Frontend Behavior

When user navigates to `/register`:

1. Call `GET /api/settings/registration-status`
2. If `open = true` → Show the registration form *(Phase 3)*
3. If `open = false` → Show a dedicated **Closed Page**:

```
┌─────────────────────────────────────────────┐
│          🚫  Registration Closed             │
│                                              │
│   New registrations are currently closed.   │
│                                              │
│   To get access, contact your distributor.  │
│                                              │
│        📞  Contact Distributor               │
│   ──────────────────────────────────────     │
│        [ Back to Login ]                     │
└─────────────────────────────────────────────┘
```

> - This page must be a **separate React component**: `RegistrationClosed.tsx`
> - Do **NOT** show the registration form at all — not even briefly
> - Show a loading spinner while the status check is in progress

---

## Phase 3 — Registration Form (when `open = true`)

**Route:** `/register`

### Form Fields

| Field | Validation |
|-------|------------|
| Username | Unique, 3–30 chars, alphanumeric + underscore |
| Full Name | Required, 2–100 chars |
| Email | Unique, valid format |
| Mobile Number | Unique, valid Indian mobile (10 digits, starts 6–9) |
| Password | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit |
| Confirm Password | Must match password |

### Validation Rules
- Use **Zod** on both frontend (real-time) and backend (API)
- Show inline field errors, not just toast messages
- Check uniqueness via:
  ```
  GET /api/auth/check-availability?field=username&value=xyz
  ```
  Debounced (500ms delay), show ✓ or ✗ icon next to each field

### On Submit → `POST /api/auth/register`

1. Re-check `registration_open` server-side *(never trust frontend)*
2. If closed → return `403 { message: 'Registration is closed' }`
3. Validate all fields with Zod
4. Check uniqueness of username, email, mobile
5. Hash password with bcrypt (rounds: **12**)
6. Create user with `status = 'PENDING'`
7. Write audit log: `REGISTER_REQUEST`
8. Increment Redis key `admin:pending_approvals`
9. Return `201 { message: 'Registration submitted. Awaiting admin approval.' }`

### After Submission → `/register/pending`

```
┌─────────────────────────────────────────────┐
│        ⏳  Registration Submitted            │
│                                              │
│  Your account request has been received.    │
│  An admin will review and approve it soon.  │
│                                              │
│  You will be notified once approved.         │
│                                              │
│        [ Back to Login ]                     │
└─────────────────────────────────────────────┘
```

---

## Phase 4 — Admin Approval Flow

### Pending Badge on Sidebar

- Admin sidebar **"Users"** menu item must show a **red badge** with count
- Count = number of users with `status = 'PENDING'`
- Fetch via: `GET /api/admin/users/pending-count`
- Cache in Redis key `admin:pending_approvals` (TTL: **30 seconds**)
- Invalidate cache after every approve/reject action
- Poll every 30 seconds using React Query `refetchInterval`

### Users Page — Pending Tab

Admin Users page must have tabs:

```
[ Pending (3) ]  [ Active ]  [ Suspended ]  [ All ]
```

**Pending tab table:**

| Full Name | Username | Email / Mobile | Reg Date | Actions |
|-----------|----------|----------------|----------|---------|
| Rahul Sahu | rahul_sahu | 9876543210 | 15 Jun | ✅ Approve  ❌ Reject |

### API Endpoints

#### `GET /api/admin/users/pending`
- Auth: **ADMIN only**
- Returns all users where `status = 'PENDING'`
- Paginated (`page`, `limit` query params)

#### `GET /api/admin/users/pending-count`
- Auth: **ADMIN only**
- Returns `{ count: number }`
- Read Redis cache first

#### `PATCH /api/admin/users/:id/approve`
- Auth: **ADMIN only**
- Set `user.status = 'ACTIVE'`
- Write audit log: `APPROVED` (with admin `user_id` in meta)
- Invalidate Redis pending count cache
- Response: `{ success: true, message: 'User approved' }`

#### `PATCH /api/admin/users/:id/reject`
- Auth: **ADMIN only**
- Body: `{ reason: string }` *(optional but recommended)*
- Set `user.status = 'DELETED'`
- Save `rejection_reason` in users table
- Write audit log: `REJECTED` (with reason in meta)
- Invalidate Redis pending count cache
- Response: `{ success: true, message: 'User rejected' }`

### Reject Modal

```
┌───────────────────────────────────────┐
│  Reject Registration                  │
│                                       │
│  Reason (optional):                   │
│  [ ________________________________ ] │
│                                       │
│     [ Cancel ]   [ Confirm Reject ]   │
└───────────────────────────────────────┘
```

---

## Phase 5 — Login System

**Route:** `/login`

### `POST /api/auth/login`

1. Accept: username **OR** email **OR** mobile + password
2. Find user by whichever field was provided
3. If not found → return `401` *(generic message — no account enumeration)*
4. Check status:

| Status | Response |
|--------|----------|
| `PENDING` | `403 { message: 'Your account is pending admin approval.' }` |
| `INACTIVE` | `403 { message: 'Account inactive. Contact admin.' }` |
| `SUSPENDED` | `403 { message: 'Account suspended. Contact admin.' }` |
| `LOCKED` | `403 { message: 'Account locked. Try again after 15 minutes.' }` |
| `DELETED` | `401` generic (same as not found) |
| `ACTIVE` | Continue ✅ |

5. Verify password with `bcrypt.compare`
6. If wrong password:
   - Increment fail counter in Redis: `login:fails:{user_id}` (TTL: 15 min)
   - After **5 failures** → set `status = 'LOCKED'`, write audit log
   - Return `401` generic message
7. If correct:
   - Reset Redis fail counter
   - Create session in `user_sessions` table
   - Set **HttpOnly + Secure + SameSite=Strict** cookie
   - `remember_me = true` → `expires_at = 30 days`, else `8 hours`
   - Write audit log: `LOGIN_SUCCESS`
   - Return user profile + role

---

## Phase 6 — Session Management

### Middleware (every protected route must verify)

1. Read session cookie
2. Validate session exists in `user_sessions` table
3. Check `expires_at > now()`
4. Check `user.status = 'ACTIVE'`
5. Update `last_activity = now()`
6. Attach user to request object

### Session Management Page

**Route:** `/settings/sessions`

Shows:
- Current session (highlighted)
- All active sessions with device, browser, IP, last activity
- Action buttons: **[Logout This Device]** **[Logout Other Devices]** **[Logout All]**

### API Endpoints

| Method | Endpoint | Action |
|--------|----------|--------|
| `GET` | `/api/auth/sessions` | List all sessions for current user |
| `DELETE` | `/api/auth/sessions/:id` | Logout specific session |
| `DELETE` | `/api/auth/sessions/others` | Logout all except current |
| `DELETE` | `/api/auth/sessions/all` | Logout all sessions |

---

## Phase 7 — Password System

### Forgot Password

**`POST /api/auth/forgot-password`**
- Accept email or mobile
- Generate secure token (`crypto.randomBytes(32)`)
- Store hash in `password_reset_tokens` (expires in **1 hour**, single use)
- Return: `{ message: 'If account exists, reset instructions sent.' }`
- Write audit log: `PASSWORD_RESET`

### Reset Password

**`POST /api/auth/reset-password`**
- Accept token + new password + confirm password
- Validate token: exists, not used, not expired
- Hash new password (bcrypt rounds: **12**)
- Update `user.password_hash`
- Mark token as `used = true`
- Invalidate **all existing sessions** for that user
- Write audit log: `PASSWORD_CHANGE`

---

## Phase 8 — RBAC Permission System

### Roles & Permissions Matrix

| Permission | ADMIN | OPERATOR | USER |
|------------|:-----:|:--------:|:----:|
| `ledger:create` | ✅ | ✅ | ❌ |
| `ledger:view` | ✅ | ✅ | ✅ |
| `ledger:edit` | ✅ | ✅ | ❌ |
| `ledger:delete` | ✅ | ❌ | ❌ |
| `report:view` | ✅ | ✅ | ✅ |
| `report:export` | ✅ | ✅ | ❌ |
| `settings:update` | ✅ | ❌ | ❌ |
| `users:manage` | ✅ | ❌ | ❌ |
| `users:approve` | ✅ | ❌ | ❌ |
| `registration:toggle` | ✅ | ❌ | ❌ |

### Implementation

- A `PERMISSIONS` map in TypeScript (`permissions.ts`)
- A `requirePermission(permission)` Express middleware
- Applied to **every** protected route

---

## Phase 9 — Security Hardening

Apply **all** of the following:

| Measure | Detail |
|---------|--------|
| `helmet()` | Security headers |
| `express-rate-limit` | 100 req/15min global; 10 req/15min on `/api/auth/*` |
| bcrypt rounds = 12 | Password hashing |
| HttpOnly + Secure + SameSite | Cookie flags |
| Zod | All input validation (frontend + backend) |
| Generic error messages | No account enumeration |
| Redis TTL on all cache keys | No stale data |
| Drizzle parameterized queries | No SQL injection |
| CORS configured for frontend URL | No wildcard in production |

---

## Phase 10 — Offline Support (PWA)

Using **Dexie.js** (IndexedDB):

### Cache locally after login
- User profile
- Dashboard summary stats
- Recent transactions (last 50)

### Offline behavior
- Show cached dashboard with **"Offline Mode"** banner
- **Disable:** new login, password change, role actions
- **Queue:** write actions in IndexedDB sync queue
- **On reconnect:** auto-sync queue to PostgreSQL via `/api/sync` endpoint

---

## Phase 11 — Admin Settings Page

**Route:** `/admin/settings`

### Registration Control Card

```
┌──────────────────────────────────────────────┐
│  🔐  Registration Control                    │
│                                              │
│  Status:  [ ● Open ]  or  [ ○ Closed ]       │
│                                              │
│  Toggle:  [  Enable Registration  ]          │
│           [  Disable Registration ]          │
│                                              │
│  Last changed by: Admin on 15 Jun 2026       │
└──────────────────────────────────────────────┘
```

Toggle calls `PATCH /api/admin/settings/registration`

**Show confirmation dialog before disabling:**
> "Disabling registration will prevent new operators from signing up. Confirm?"
> `[ Cancel ]` `[ Yes, Disable ]`

---

## Folder Structure

Generate exactly this structure:

```
artifacts/
  api-server/src/
    middleware/
      auth.ts                  ← session validation
      rbac.ts                  ← permission checker
      rateLimiter.ts
    routes/
      auth.ts                  ← login, logout, register, reset
      admin/
        users.ts               ← approve, reject, list pending
        settings.ts            ← registration toggle
    services/
      sessionService.ts
      auditService.ts
      redisService.ts
    db/
      schema.ts                ← all Drizzle table definitions

  sahu-csc/src/
    pages/
      auth/
        Login.tsx
        Register.tsx
        RegisterClosed.tsx     ← shown when registration_open = false
        RegisterPending.tsx    ← shown after successful submission
        ForgotPassword.tsx
        ResetPassword.tsx
      admin/
        Users.tsx              ← with Pending tab + badge
        Settings.tsx           ← registration toggle card
      settings/
        Sessions.tsx
    components/
      PendingBadge.tsx         ← sidebar badge component
      ApproveRejectModal.tsx
    hooks/
      useRegistrationStatus.ts
      usePendingCount.ts
```

---

## Environment Variables

Add to Replit Secrets:

```env
DATABASE_URL                = postgresql://...
UPSTASH_REDIS_REST_URL      = https://...
UPSTASH_REDIS_REST_TOKEN    = ...
SESSION_SECRET              = <random 64-char string>
NODE_ENV                    = production
FRONTEND_URL                = https://your-replit-url.repl.co
```

---

## Seed Data

Run once on first deploy:

### Admin User
```
username  : admin
email     : admin@sahucsc.com
mobile    : 9000000000
password  : Sahu@2026  (bcrypt hashed, rounds: 12)
role      : ADMIN
status    : ACTIVE
```

### System Settings
```
key       : registration_open
value     : false
```

---

## Completion Checklist

- [x] Registration toggle stored in DB + cached in Redis
- [x] `/register` shows form **OR** `RegistrationClosed` page (no flash)
- [x] New signups create user with `status = PENDING`
- [x] Admin sidebar shows live pending badge count
- [x] Admin Users page has Pending tab with Approve / Reject
- [x] Reject modal with optional reason
- [x] Login blocks `PENDING` users with clear message
- [x] Login blocks `LOCKED` / `SUSPENDED` / `INACTIVE` with reason
- [x] 5 failed logins → account locked for 15 minutes
- [x] Remember Me = 30 days, normal = 8 hours
- [x] Multi-device session tracking
- [x] Session management page (logout individual / all)
- [x] Forgot password with single-use token (1 hour expiry)
- [x] RBAC with `requirePermission` middleware on every route
- [x] Audit log for every auth event
- [x] Helmet + rate limiting + HttpOnly cookies
- [x] Zod validation on frontend + backend
- [x] Offline dashboard via Dexie.js IndexedDB
- [x] All tables created via Drizzle migrations
- [x] Seed admin user + default settings on first run
