#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  Render build script — SAHU CSC API Server
#  Runs from the workspace root (render.yaml sets rootDir: ".")
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

echo "▶ Node $(node -v)  •  npm $(npm -v)"

# Install pnpm if not already available
if ! command -v pnpm &>/dev/null; then
  echo "▶ Installing pnpm@10..."
  npm install -g pnpm@10 --prefer-offline 2>/dev/null || npm install -g pnpm@10
fi
echo "▶ pnpm $(pnpm -v)"

# Install all workspace dependencies (respects onlyBuiltDependencies)
echo "▶ Installing dependencies..."
pnpm install --frozen-lockfile

# Build the API server bundle
echo "▶ Building API server..."
pnpm --filter @workspace/api-server run build

echo "✅ Build complete"
