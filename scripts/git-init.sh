#!/usr/bin/env bash
# Run once from Replit Shell to set up GitHub connection.
# Replace GITHUB_USERNAME and REPO_NAME with your actual values.

set -e

GITHUB_USERNAME="sahuuttam690"
REPO_NAME="sahu-csc-manager"

echo "🔧  Configuring git..."
git config user.email "sahuuttam690@gmail.com"
git config user.name "WizzGOD"

echo "📁  Initializing repository..."
git init
git add .
git commit -m "chore: initial commit v4.10.2 — Replit + Render + Vercel ready"

echo "🔗  Connecting to GitHub..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
git branch -M main

echo "🚀  Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅  Done! GitHub push complete."
echo "   Now connect Render and Vercel to this repo:"
echo "   Render: render.com → New → Blueprint → connect ${REPO_NAME}"
echo "   Vercel: vercel.com → Add New → Project → import ${REPO_NAME}"
