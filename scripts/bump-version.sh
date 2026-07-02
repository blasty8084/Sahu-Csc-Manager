#!/bin/bash
set -e

NEW_VERSION="$1"

if [ -z "$NEW_VERSION" ]; then
  echo "Usage: bash scripts/bump-version.sh <version>"
  echo "Example: bash scripts/bump-version.sh 3.2.0"
  exit 1
fi

if ! echo "$NEW_VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "Error: version must be in semver format (e.g. 3.2.0)"
  exit 1
fi

echo "[bump-version] Updating to v$NEW_VERSION..."

update_version() {
  local file="$1"
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('$file', 'utf8'));
    pkg.version = '$NEW_VERSION';
    fs.writeFileSync('$file', JSON.stringify(pkg, null, 2) + '\n');
    console.log('  updated $file');
  "
}

update_version "artifacts/api-server/package.json"
update_version "artifacts/sahu-csc/package.json"

echo "[bump-version] Rebuilding API server..."
pnpm --filter @workspace/api-server run build 2>&1 | tail -3

echo ""
echo "✅ Version bumped to v$NEW_VERSION"
echo "   Frontend shows version via __APP_VERSION__ at build time."
echo "   Restart workflows to pick up the new API build."
