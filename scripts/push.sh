#!/usr/bin/env bash
# Quick commit and push to GitHub.
# Usage: ./scripts/push.sh "Your commit message"

set -e

MSG="${1:-"chore: update $(date '+%Y-%m-%d %H:%M')"}"

echo "📦  Staging all changes..."
git add .

echo "💬  Committing: ${MSG}"
git commit -m "${MSG}"

echo "🚀  Pushing to GitHub..."
git push origin main

echo ""
echo "✅  Pushed! Render + Vercel will auto-deploy in 2-5 minutes."
echo "   Render API:      https://sahu-csc-api-02wn.onrender.com/api/health"
echo "   Vercel Frontend: https://sahu-csc-manager-sahu-csc.vercel.app"
