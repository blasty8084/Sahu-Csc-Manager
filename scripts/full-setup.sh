#!/bin/bash
# Full Setup — run once on first install.
# Runs: Install → Database Setup → Seed Database → Project
set -e

echo "[full-setup] Step 1/4 — Installing dependencies..."
pnpm install

echo "[full-setup] Step 1/4 — Building lib declarations..."
pnpm run typecheck:libs

echo "[full-setup] Step 2/4 — Pushing database schema..."
PORT=8080 NODE_ENV=development pnpm --filter @workspace/db run push

echo "[full-setup] Step 3/4 — Seeding database..."
PORT=8080 NODE_ENV=development npx tsx artifacts/api-server/src/scripts/seed.ts

echo "[full-setup] Step 4/4 — Starting API server + frontend..."
bash scripts/start.sh
