#!/bin/bash
set -e

NEW_VERSION="$1"

if [ -z "$NEW_VERSION" ]; then
  echo "Usage: bash scripts/bump-version.sh <version>"
  echo "Example: bash scripts/bump-version.sh 3.2.0"
  exit 1
fi

if ! echo "$NEW_VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "Error: version must be semver format (e.g. 3.2.0)"
  exit 1
fi

# Derive today's date and major version for TWA
TODAY=$(date +"%Y-%m-%d")
TODAY_LONG=$(date +"%B %-d, %Y")
MAJOR=$(echo "$NEW_VERSION" | cut -d. -f1)

echo "[bump-version] Updating to v$NEW_VERSION (date: $TODAY)"
echo ""

# ── 1. package.json files ─────────────────────────────────────────────────────
echo "  [packages]"
for PKG in artifacts/api-server/package.json artifacts/sahu-csc/package.json; do
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('$PKG', 'utf8'));
    pkg.version = '$NEW_VERSION';
    fs.writeFileSync('$PKG', JSON.stringify(pkg, null, 2) + '\n');
  "
  echo "    ✓ $PKG"
done

# ── 2. replit.md ──────────────────────────────────────────────────────────────
echo "  [replit.md]"
sed -i -E "s/^\*\*Version [0-9]+\.[0-9]+\.[0-9]+\*\* — last updated [0-9]{4}-[0-9]{2}-[0-9]{2}/**Version $NEW_VERSION** — last updated $TODAY/" replit.md
# Also update the h2 "What's New" heading on line 10
sed -i -E "s/^## What's New in v[0-9]+\.[0-9]+\.[0-9]+/## What's New in v$NEW_VERSION/" replit.md
echo "    ✓ replit.md"

# ── 3. DOCS.md ────────────────────────────────────────────────────────────────
echo "  [DOCS.md]"
sed -i -E "s/^\*\*Version [0-9]+\.[0-9]+\.[0-9]+\*\* — last updated [0-9]{4}-[0-9]{2}-[0-9]{2}/**Version $NEW_VERSION** — last updated $TODAY/" DOCS.md
echo "    ✓ DOCS.md"

# ── 4. CHANGELOG.md ───────────────────────────────────────────────────────────
echo "  [CHANGELOG.md]"
sed -i -E "s/^\*\*Current version: [0-9]+\.[0-9]+\.[0-9]+\*\* — last updated [0-9]{4}-[0-9]{2}-[0-9]{2}/**Current version: $NEW_VERSION** — last updated $TODAY/" CHANGELOG.md
echo "    ✓ CHANGELOG.md"

# ── 5. CHANGELOG_V3.md ────────────────────────────────────────────────────────
echo "  [CHANGELOG_V3.md]"
sed -i -E "s/^\*\*Current version: [0-9]+\.[0-9]+\.[0-9]+ — .+\*\*/**Current version: $NEW_VERSION — $TODAY_LONG**/" CHANGELOG_V3.md
echo "    ✓ CHANGELOG_V3.md"

# ── 6. BUILD.md ───────────────────────────────────────────────────────────────
echo "  [BUILD.md]"
sed -i -E "s/^\*\*Version [0-9]+\.[0-9]+\.[0-9]+ — .+\*\*/**Version $NEW_VERSION — $TODAY_LONG**/" BUILD.md
sed -i -E "s/\| \*\*Version\*\* \| [0-9]+\.[0-9]+\.[0-9]+ \|/| **Version** | $NEW_VERSION |/" BUILD.md
sed -i -E "s/Version [0-9]+\.[0-9]+\.[0-9]+ \| Maintained/Version $NEW_VERSION | Maintained/" BUILD.md
# Update "last updated" date in footer
sed -i -E "s/Last updated: [A-Za-z]+ [0-9]+, [0-9]{4} \| Version/Last updated: $TODAY_LONG | Version/" BUILD.md
echo "    ✓ BUILD.md"

# ── 7. WORKFLOWS.md ───────────────────────────────────────────────────────────
echo "  [WORKFLOWS.md]"
sed -i -E "s/^\*\*Version [0-9]+\.[0-9]+\.[0-9]+ — .+\*\*/**Version $NEW_VERSION — $TODAY_LONG**/" WORKFLOWS.md
echo "    ✓ WORKFLOWS.md"

# ── 8. architectureV3.md ──────────────────────────────────────────────────────
echo "  [architectureV3.md]"
sed -i -E "s/^\*\*Version [0-9]+\.[0-9]+\.[0-9]+ — .+\*\*/**Version $NEW_VERSION — $TODAY_LONG**/" architectureV3.md
sed -i -E "s/\*\*App version:\*\* [0-9]+\.[0-9]+\.[0-9]+/**App version:** $NEW_VERSION/" architectureV3.md
echo "    ✓ architectureV3.md"

# ── 9. ReplitV3.md ────────────────────────────────────────────────────────────
echo "  [ReplitV3.md]"
sed -i -E "s/^\*\*Version [0-9]+\.[0-9]+\.[0-9]+ — .+\*\*/**Version $NEW_VERSION — $TODAY_LONG**/" ReplitV3.md
sed -i -E "s/\| Version \| [0-9]+\.[0-9]+\.[0-9]+ \|/| Version | $NEW_VERSION |/" ReplitV3.md
sed -i -E "s/Version: [0-9]+\.[0-9]+\.[0-9]+ \(code: [0-9]+\)/Version: $NEW_VERSION (code: $MAJOR)/" ReplitV3.md
sed -i -E "s/Last updated: [A-Za-z]+ [0-9]+, [0-9]{4} \| Version [0-9]+\.[0-9]+\.[0-9]+/Last updated: $TODAY_LONG | Version $NEW_VERSION/" ReplitV3.md
echo "    ✓ ReplitV3.md"

# ── 10. TWA config ────────────────────────────────────────────────────────────
echo "  [twa-config.json]"
TWA="infrastructure/twa/twa-config.json"
if [ -f "$TWA" ]; then
  node -e "
    const fs = require('fs');
    const cfg = JSON.parse(fs.readFileSync('$TWA', 'utf8'));
    cfg.appVersionName = '$NEW_VERSION';
    cfg.appVersionCode = $MAJOR;
    fs.writeFileSync('$TWA', JSON.stringify(cfg, null, 2) + '\n');
  "
  echo "    ✓ $TWA"
fi

# ── 11. Rebuild API server ────────────────────────────────────────────────────
echo ""
echo "  [rebuild API]"
pnpm --filter @workspace/api-server run build 2>&1 | grep -E "Done|Error|error" || true
echo "    ✓ API rebuilt"

echo ""
echo "✅ Version bumped to v$NEW_VERSION across all files."
echo "   Restart workflows to serve the new version."
