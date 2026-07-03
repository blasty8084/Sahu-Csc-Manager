#!/bin/bash
# Production startup script.
# Starts the API server (port 8080) in the background and
# serves the pre-built Vite frontend (port 5000) in the foreground.
set -e

echo "[prod] Starting API server on port 8080..."
PORT=8080 NODE_ENV=production node --enable-source-maps artifacts/api-server/dist/index.mjs &
API_PID=$!

echo "[prod] Serving frontend on port 5000..."
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run serve &
FRONTEND_PID=$!

trap "kill $API_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGTERM SIGINT

wait $API_PID $FRONTEND_PID
