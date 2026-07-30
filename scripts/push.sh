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
# Use GITHUB_TOKEN if set (stored in Replit Secrets)
if [ -n "$GITHUB_TOKEN" ]; then
  REPO_URL=$(git remote get-url origin | sed 's|https://.*@|https://|')
  git remote set-url origin "https://${GITHUB_TOKEN}@${REPO_URL#https://}"
fi
git push origin main

echo ""
echo "✅  Pushed! Render + Vercel will auto-deploy in 2-5 minutes."
echo "   Render API:      https://sahu-csc-api.onrender.com/api/health"
echo "   Vercel Frontend: https://sahu-csc.vercel.app"
