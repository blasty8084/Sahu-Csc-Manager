#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  Render build script — SAHU CSC API Server
#  Runs from the workspace root (render.yaml sets rootDir: ".")
#
#  Free-tier safe: no manual shell access needed.
#  Steps:
#    1. Install pnpm
#    2. Install all workspace dependencies
#    3. Push DB schema to Neon (idempotent — safe on every deploy)
#    4. Build the API server bundle with esbuild
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

echo "▶ Node $(node -v)  •  npm $(npm -v)"

# ── 1. Install pnpm ──────────────────────────────────────────────────────────
if ! command -v pnpm &>/dev/null; then
  echo "▶ Installing pnpm@10..."
  npm install -g pnpm@10 --prefer-offline 2>/dev/null || npm install -g pnpm@10
fi
echo "▶ pnpm $(pnpm -v)"

# ── 2. Install dependencies ──────────────────────────────────────────────────
echo "▶ Installing dependencies..."
pnpm install --frozen-lockfile

# ── 3. Push DB schema (idempotent — only adds missing tables/columns) ────────
#  Runs during BUILD because Render env vars are available at build time.
#  This ensures the Neon database is fully migrated before the server starts.
#  No manual shell or drizzle-kit command needed on free tier.
DB_URL="${NEON_DATABASE_URL:-${DATABASE_URL:-}}"
if [ -n "$DB_URL" ]; then
  echo "▶ Pushing database schema to Neon..."
  # --force skips the interactive confirmation prompt (required in CI/CD)
  pnpm --filter @workspace/db run push-force \
    && echo "✅ Schema push complete" \
    || echo "⚠️  Schema push failed — server will still start; check Neon connection string"
else
  echo "⚠️  No database URL found (NEON_DATABASE_URL not set) — skipping schema push"
  echo "   Set NEON_DATABASE_URL in Render Dashboard → Environment before first deploy."
fi

# ── 4. Build API server bundle ───────────────────────────────────────────────
echo "▶ Building API server..."
pnpm --filter @workspace/api-server run build

echo "✅ Build complete"
