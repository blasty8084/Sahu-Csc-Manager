#!/usr/bin/env bash
# Quick health check for all three environments.
# Run from Replit Shell: bash scripts/health-check.sh

echo ""
echo "🔍 Checking SAHU CSC endpoints..."
echo ""

# Render API
echo "1. Render API (backend):"
curl -s -o /dev/null -w "   Status: %{http_code}  Time: %{time_total}s\n" \
  https://sahu-csc-api-02wn.onrender.com/api/health || echo "   ❌ Failed"

# Vercel Frontend
echo "2. Vercel Frontend:"
curl -s -o /dev/null -w "   Status: %{http_code}  Time: %{time_total}s\n" \
  https://sahu-csc-manager-sahu-csc.vercel.app || echo "   ❌ Failed"

# Vercel → Render API (via rewrite)
echo "3. Vercel → Render API proxy:"
curl -s -o /dev/null -w "   Status: %{http_code}  Time: %{time_total}s\n" \
  https://sahu-csc-manager-sahu-csc.vercel.app/api/health || echo "   ❌ Failed"

echo ""
echo "✅ All 200 = everything working!"
echo "⏰ Note: Render free tier cold-start = 30-60s. If timeout, wait and retry."
