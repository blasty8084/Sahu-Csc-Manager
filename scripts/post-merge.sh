#!/bin/bash
set -e

echo "[post-merge] Installing dependencies..."
pnpm install --frozen-lockfile

echo "[post-merge] Pushing database schema..."
pnpm --filter @workspace/db run push-force

echo "[post-merge] Ensuring session table exists..."
psql "$DATABASE_URL" -c "
  CREATE TABLE IF NOT EXISTS \"session\" (
    \"sid\"    varchar      NOT NULL COLLATE \"default\",
    \"sess\"   json         NOT NULL,
    \"expire\" timestamp(6) NOT NULL,
    CONSTRAINT \"session_pkey\" PRIMARY KEY (\"sid\")
  );
  CREATE INDEX IF NOT EXISTS \"IDX_session_expire\" ON \"session\" (\"expire\");
" 2>&1 | grep -v "^$" || true

echo "[post-merge] Done."
