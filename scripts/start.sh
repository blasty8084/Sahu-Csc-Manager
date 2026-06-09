#!/bin/bash
# Starts the API server in the background and the frontend in the foreground.
# Used by the "Project" run button workflow.
set -e

echo "[project] Starting API server on port 8080..."
PORT=8080 pnpm --filter @workspace/api-server run dev &
API_PID=$!

echo "[project] Starting frontend on port 5000..."
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run dev &
FRONTEND_PID=$!

# Forward signals so both children shut down cleanly
trap "kill $API_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGTERM SIGINT

wait $API_PID $FRONTEND_PID
