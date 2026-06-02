# SAHU CSC FV1

A full-stack CSC (Common Service Center) business management platform for tracking services, ledger accounting, and reporting. Built for Odisha / India rural service centers.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at `/api`)
- `pnpm --filter @workspace/sahu-csc run dev` — run the frontend (served at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — build composite lib packages (run before typechecking apps)
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session secret

## Default Login Credentials

- **Admin**: username `admin`, password `admin123`
- **Operator**: username `operator`, password `operator123`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + shadcn/ui (Navy + Saffron theme)
- API: Express 5 with express-session, helmet, rate-limiting
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — DB schema (users, services, ledger, notifications, audit_logs, settings)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/src/generated/` — generated React Query hooks + Zod schemas
- `artifacts/api-server/src/routes/` — Express route handlers (auth, ledger, services, users, notifications, audit, settings, reports)
- `artifacts/api-server/src/lib/` — auth helpers (sessions, bcrypt, audit log), notify helper
- `artifacts/sahu-csc/src/pages/` — React pages for all sections
- `artifacts/sahu-csc/src/components/` — layout, theme-provider, shadcn UI components

## Architecture decisions

- Contract-first API design: OpenAPI spec → Orval codegen → typed React Query hooks
- Session-based auth (express-session + bcrypt) — no JWTs, simpler for CSC use case
- Drizzle ORM with `numeric` type for all money fields; always parse with `parseFloat()` in routes
- Running balance computed at insert time from sum of all previous entries
- Admin-only pages enforced at both route level (requireRole middleware) and frontend (ProtectedRoute with adminOnly prop)
- Notifications system: auto-created on login events, failed logins, backups, etc.

## Product

- **Ledger**: Double-entry style ledger with running balance, pagination, filters by date/service/customer, Excel export
- **Services**: 22 pre-seeded CSC services across 5 categories (Government ID, Certificates, Insurance, Utility Bills, Schemes)
- **Dashboard**: Real-time balance, today's stats, recent transactions, top services chart
- **Reports**: Daily/monthly reports with bar charts, service breakdown pie chart, Excel export
- **Notifications**: Auto-created system notifications with read/unread tracking
- **Audit Logs**: Full audit trail of all actions (admin only)
- **User Management**: Multi-user with admin/operator/user roles (admin only)
- **Settings**: Business info, language, theme, backup config (admin only)
- **Backups**: Manual backup creation and restore (admin only)

## User preferences

- Currency: ₹ (Indian Rupee) throughout
- Language support: English, Hindi, Odia
- Theme: Light (Navy + Saffron) and Dark mode

## Gotchas

- Always run `pnpm run typecheck:libs` before typechecking app packages — the DB lib must emit fresh declarations first
- After adding new schema files, update `lib/db/src/schema/index.ts` to export them
- Numeric columns from Drizzle return as strings — always `parseFloat()` before returning from routes
- The notifications endpoint returns an array directly (not paginated); the layout uses `.length` not `.total`
- Sessions require `SESSION_SECRET` env var; falls back to a default in dev only

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
