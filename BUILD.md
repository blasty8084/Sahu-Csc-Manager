# SAHU CSC Manager — BUILD.md
> **Single source of truth** for any AI agent, developer, or Claude session.  
> Read this file first — no other file analysis needed to understand the project.

---

## 1. Project Overview

**SAHU CSC Manager** is a full-stack business management platform for CSC (Common Service Centre) operators in Odisha, India. It helps rural CSC operators manage their daily business operations digitally.

**Target Users:** CSC operators in Odisha, India (rural/semi-urban)  
**Languages Supported:** English, Hindi, Odia  
**GitHub:** https://github.com/blasty8084/Sahu-Csc-Manager  
**Hosted On:** Replit (dev), GitHub username: `blasty8084`

**Core Business Domain:**
- AePS (Aadhaar-enabled Payment System) transactions
- Mobile recharge & bill payments
- Financial ledger tracking (income/expense)
- Customer credit tracking — "Udhari Khata"
- Receipt generation with QR code verification
- Admin-controlled user registration & RBAC

---

## 2. Tech Stack (Exact Versions)

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces |
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Express 5 + TypeScript |
| Database | PostgreSQL via Neon (Drizzle ORM) |
| Cache | Upstash Redis |
| Auth | Firebase Phone Auth + session-based auth |
| Email | Nodemailer (Gmail SMTP) |
| PWA | Service Worker + Web Push (VAPID keys) |
| API Design | Contract-first OpenAPI + Orval codegen |
| Hosting | Replit (dev environment) |

---

## 3. Monorepo Structure

```
Sahu-Csc-Manager/
├── artifacts/
│   ├── api-server/              # Express 5 backend API
│   │   ├── src/
│   │   │   ├── routes/          # All API route handlers
│   │   │   ├── services/        # Business logic layer
│   │   │   ├── middleware/      # Auth, validation, rate-limit
│   │   │   ├── db/              # Drizzle schema + migrations
│   │   │   │   ├── schema.ts    # All table definitions
│   │   │   │   └── migrations/  # SQL migration files
│   │   │   └── scripts/
│   │   │       └── seed.ts      # Database seeder
│   │   └── package.json
│   ├── sahu-csc/                # Main React frontend (PWA)
│   │   ├── src/
│   │   │   ├── components/      # Reusable UI components
│   │   │   ├── pages/           # Route-level page components
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── lib/             # Utilities, firebase config
│   │   │   └── api/             # Orval-generated API client
│   │   └── package.json
│   └── mockup-sandbox/          # Component preview/design sandbox
│       └── package.json
├── openapi/                     # OpenAPI spec files (contract-first)
│   └── spec.yaml                # Master API specification
├── .replit                      # Replit workflow configuration
├── BUILD.md                     # This file
└── pnpm-workspace.yaml          # Workspace definition
```

**Package Names:**
- `@workspace/api-server` — Express backend
- `@workspace/sahu-csc` — React frontend
- `@workspace/mockup-sandbox` — Design sandbox

---

## 4. Environment Variables / Secrets

All secrets are stored in **Replit Secrets** (not `.env` files).

### Server-side Only (no VITE_ prefix)
| Secret Key | Description | Source |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string | Neon Console |
| `SESSION_SECRET` | Express session signing secret | Random strong string |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Admin SDK JSON (stringified) | Firebase Console → Service Accounts |
| `UPSTASH_REDIS_URL` | Upstash Redis REST URL | Upstash Console |
| `UPSTASH_REDIS_TOKEN` | Upstash Redis REST token | Upstash Console |
| `SMTP_HOST` | `smtp.gmail.com` | Gmail |
| `SMTP_PORT` | `587` | Gmail |
| `SMTP_USER` | Gmail address | Your Gmail |
| `SMTP_PASS` | Gmail App Password (16-char) | Google Account → App Passwords |
| `SMTP_FROM_EMAIL` | `SAHU CSC Manager <your@gmail.com>` | Your choice |
| `VAPID_PUBLIC_KEY` | Web Push VAPID public key | Generated via web-push |
| `VAPID_PRIVATE_KEY` | Web Push VAPID private key | Generated via web-push |
| `VAPID_EMAIL` | mailto: email for VAPID | Your email |
| `PORT` | `8080` (API server port) | Fixed value |

### Client-side (must have VITE_ prefix for Vite to expose)
| Secret Key | Description | Source |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web app API key (`AIzaSy...`) | Firebase Console → Project Settings → Your Apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | `sahu-csc.firebaseapp.com` | Firebase Console |
| `VITE_FIREBASE_PROJECT_ID` | `sahu-csc` | Firebase Console |
| `VITE_FIREBASE_STORAGE_BUCKET` | `sahu-csc.firebasestorage.app` | Firebase Console |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `119574308074` | Firebase Console |
| `VITE_FIREBASE_APP_ID` | `1:119574308074:web:...` | Firebase Console |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-QC0Y60V9NK` | Firebase Console |

> ⚠️ **Important:** `VITE_` prefix is mandatory for any variable used in React frontend code. Without it, the value will be `undefined` at runtime.

---

## 5. Database Schema

### Tables

| Table | Purpose |
|---|---|
| `users` | All registered users (admin + operators) |
| `sessions` | Express session store |
| `transactions` | All financial ledger entries (income/expense) |
| `customers` | Udhari Khata customer records |
| `customer_transactions` | Per-customer credit/debit entries |
| `receipts` | Receipt records with `CSC-YYYY-NNNN` numbering |
| `receipt_sequence` | Per-year sequential counter for receipt numbers |
| `notifications` | Per-user notification records |
| `push_subscriptions` | PWA push notification subscriptions (per user) |
| `otp_codes` | Temporary OTP storage (email verification, password reset) |
| `services` | CSC service catalog (recharge, AePS, bill pay, etc.) |

### Key Relationships
- `users` → `transactions` (one user has many transactions)
- `users` → `customers` (one user/operator has many customers)
- `customers` → `customer_transactions` (one customer has many udhari entries)
- `transactions` → `receipts` (one transaction has one receipt)
- `users` → `notifications` (strict per-user scoping, never shared)
- `users` → `push_subscriptions` (one user, multiple devices)

### Migration Commands
```bash
# Run pending migrations
pnpm --filter @workspace/api-server run db:migrate

# Push schema directly (dev only)
pnpm --filter @workspace/api-server run db:push

# Open Drizzle Studio (visual DB browser)
pnpm --filter @workspace/api-server run db:studio

# Seed database with initial data
PORT=8080 NODE_ENV=development npx tsx artifacts/api-server/src/scripts/seed.ts
```

---

## 6. API Architecture (Contract-First)

This project uses a **contract-first OpenAPI** approach — the spec is written first, then code is generated from it.

### Mandatory Workflow for Every New Endpoint
```
1. Update OpenAPI spec → openapi/spec.yaml
2. Run Orval codegen → generates TypeScript client in artifacts/sahu-csc/src/api/
3. Update Drizzle schema → artifacts/api-server/src/db/schema.ts
4. Run migration → pnpm db:migrate
5. Implement route handler → artifacts/api-server/src/routes/
6. Build React component/page → artifacts/sahu-csc/src/pages/ or components/
```

> ⚠️ **Never skip step 2 (codegen).** The frontend API client is auto-generated — manually writing fetch calls breaks the contract-first pattern.

### Codegen Command
```bash
pnpm --filter @workspace/sahu-csc run codegen
```

---

## 7. Running the Project (Replit Workflows)

### All 5 Workflows (configured in `.replit`)

| # | Workflow Name | Command |
|---|---|---|
| 1 | API Server | `PORT=8080 pnpm --filter @workspace/api-server run dev` |
| 2 | Web | `pnpm --filter @workspace/sahu-csc run dev` |
| 3 | Component Preview Server | `pnpm --filter @workspace/mockup-sandbox run dev` |
| 4 | API Server (artifacts) | `pnpm --filter @workspace/api-server run dev` |
| 5 | Seed Database | `PORT=8080 NODE_ENV=development npx tsx artifacts/api-server/src/scripts/seed.ts` |

### Install Dependencies
```bash
pnpm install
```

### Common Errors & Fixes

| Error | Fix |
|---|---|
| `ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL` | Run `pnpm install` first, then retry the workflow |
| `missing PORT variable` | Add `PORT=8080` before the command or set it in Replit Secrets |
| `auth/api-key-not-valid` | `VITE_FIREBASE_API_KEY` is missing/wrong in Replit Secrets |
| `Revert failed — unmerged files` | `git add artifacts/sahu-csc/dev-dist/sw.js && git commit -m "resolve"` |
| Firebase OTP not sending | Add current `$REPLIT_DEV_DOMAIN` to Firebase Console → Authentication → Authorized Domains |

---

## 8. Authentication Flow

### Registration
1. Admin creates a user account (admin-controlled registration, not self-signup)
2. New user receives email OTP via Nodemailer (Gmail SMTP)
3. User verifies email OTP → account activated
4. Optionally: Firebase Phone OTP for mobile number verification

### Login
1. User submits email + password
2. Server verifies credentials, creates an Express session
3. Session ID stored in cookie, session data in PostgreSQL/Redis
4. `SESSION_SECRET` Replit Secret signs the session

### RBAC Roles
| Role | Access |
|---|---|
| `admin` | Full access — manage users, view all reports, system settings |
| `operator` | Own transactions, own Udhari Khata, own receipts, own notifications only |

### Firebase Authorized Domain
> ⚠️ Replit's dev URL changes every restart. Run `echo $REPLIT_DEV_DOMAIN` and add the output to:
> - Firebase Console → Authentication → Settings → Authorized Domains
> - Google Cloud Console → APIs & Services → Credentials → API Key → Application Restrictions

---

## 9. Features Already Implemented

| Feature | Key Files |
|---|---|
| Dashboard (balance, income, expense, transactions) | `pages/dashboard/` |
| Ledger (income/expense entries) | `pages/ledger/` |
| AePS transactions | `pages/aeps/` |
| Udhari Khata (customer credit ledger) | `pages/udhari/`, `routes/customers.ts` |
| Receipt generation (CSC-YYYY-NNNN) | `routes/receipts.ts`, `components/Receipt/` |
| QR code on receipts (scan → open PDF) | Embedded in receipt component |
| PWA push notifications | `service-worker.js`, `routes/push.ts` |
| Per-user notification isolation | `routes/notifications.ts` (user_id scoped) |
| Mobile bottom navigation bar | `components/BottomNav/` |
| Idle session warning | `components/IdleWarning/` |
| Email OTP (registration + forgot password) | `routes/auth/send-otp.ts`, Nodemailer |
| Firebase Phone OTP | `lib/firebase.ts`, `pages/auth/` |
| Admin-controlled user registration | `pages/admin/users/` |
| RBAC middleware | `middleware/requireRole.ts` |
| Loading/startup experience | Zustand state machine |

---

## 10. Branding & UI Guidelines

### Colors
| Token | Value | Usage |
|---|---|---|
| Navy (Primary) | `#0B1340` | Header, bottom nav, buttons, dark backgrounds |
| Orange (Accent) | `#F97316` | CTAs, active states, highlights, icons |

### Mobile-First Layout Rules
- Use `min-h-[100dvh]` (not `min-h-screen`) for full-height containers — accounts for mobile browser chrome
- Bottom navigation: `position: fixed; bottom: 0; left: 0; right: 0; z-index: 30`
- Main content area: always add `pb-24` padding-bottom to avoid content hidden behind bottom nav
- No parent element of bottom nav should have `transform`, `filter`, `will-change`, or `overflow: hidden` — these break `position: fixed`

### Bottom Navigation Tabs
`Dashboard` | `Ledger` | `AePS` | `Profile`

### Component Library
shadcn/ui — import from `@/components/ui/`

---

## 11. Known Issues & Workarounds

| Issue | Workaround |
|---|---|
| Firebase authorized domain changes on Replit restart | Run `echo $REPLIT_DEV_DOMAIN` and re-add to Firebase Console after every restart |
| `sw.js` merge conflict during git revert | `git add artifacts/sahu-csc/dev-dist/sw.js && git commit -m "resolve"` — this is an auto-generated build artifact, safe to just mark resolved |
| `VITE_FIREBASE_API_KEY` blank in shell | Secret exists but without `VITE_` prefix — rename the secret in Replit Secrets panel |
| Bottom nav disappears on scroll | Parent container must not have `overflow: hidden` or `transform` — check `SyncStatusBar` and `PWAInstallBanner` wrappers |
| Git push auth failure | Use GitHub Personal Access Token (not password) — generate at github.com → Settings → Developer settings → Personal access tokens |

---

## 12. How to Add New Features (Agent Instructions)

> Every AI agent must follow this sequence for every new feature — no exceptions.

```
Step 1: Update OpenAPI spec → openapi/spec.yaml
Step 2: Run codegen → pnpm --filter @workspace/sahu-csc run codegen
Step 3: Update Drizzle schema → artifacts/api-server/src/db/schema.ts
Step 4: Run migration → pnpm --filter @workspace/api-server run db:migrate
Step 5: Implement route → artifacts/api-server/src/routes/
Step 6: Build React UI → artifacts/sahu-csc/src/pages/ or components/
Step 7: Test on mobile viewport (375px width)
```

### Rules for Every UI Change
- Always use `#0B1340` and `#F97316` — never hardcode other colors
- Always mobile-first — test at 375px width
- After every layout change, verify bottom nav is still visible and fixed
- Use existing shadcn/ui components — don't install new UI libraries without discussion
- Never use `localStorage` or `sessionStorage` — use server sessions + React Query cache

---

## 13. Git & Deployment

**Repo:** `https://github.com/blasty8084/Sahu-Csc-Manager`  
**Branch:** `main`

### Common Git Commands (Replit Shell)
```bash
# Check status
git status

# Commit and push
git add .
git commit -m "feat: your feature description"
git push origin main

# View recent commits
git log --oneline -10

# Safe rollback (creates new revert commit — preferred)
git revert <commit-hash>
git push origin main

# Destructive rollback (rewrites history — use carefully)
git reset --hard <commit-hash>
git push origin main --force
```

### Push Authentication
Use a **GitHub Personal Access Token** (not your password):
1. github.com → Settings → Developer settings → Personal access tokens → Generate new token (classic)
2. Select `repo` scope → Generate
3. Use this token as the password when `git push` asks for credentials

---

*Last updated: June 2026 | Maintained by: Uttam Sahu (blasty8084)*
