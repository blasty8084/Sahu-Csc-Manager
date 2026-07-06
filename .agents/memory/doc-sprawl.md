---
name: Documentation sprawl in this project
description: This project maintains many parallel versioned markdown docs that must be updated together, plus intentionally-superseded old versions to skip
---

## Active docs that must stay in sync on every version bump

- `replit.md` — main README, "What's New" changelog at top, also has user preferences
- `DOCS.md` — full platform doc with a numbered "Version History" section
- `CHANGELOG.md` — full change log (pre-v3 + v3 summary header)
- `CHANGELOG_V3.md` — detailed v3.x changelog with a table of contents that needs a new numbered entry
- `UPDATES.md` — session-by-session auto-update log, newest entry at top
- `BUILD.md`, `WORKFLOWS.md`, `ReplitV3.md`, `architectureV3.md` — each has its own version header line near the top
- `artifacts/sahu-csc/src/pages/about.tsx` — in-app changelog array (`CHANGELOG`) and security-overview bullet list shown to users; also displays `__APP_VERSION__` sourced live from `package.json` via Vite `define`
- `artifacts/sahu-csc/package.json` and `artifacts/api-server/package.json` — the actual version string

**Why:** the project has accumulated ad-hoc duplicate documentation files over several major versions instead of consolidating; there is no single source of truth, so a "bump the version" request touches ~9 files.

**How to apply:** when asked to update docs/version, update all of the above together. Do not touch the superseded v2 files — `ARCHITECTURE.md`, `architectureV2.md`, `ReplitV2.md`, `changelogV2.md` are explicitly marked "(superseded)" and intentionally frozen at v2.7.1.

This sprawl has been flagged to the user more than once as worth consolidating/trimming; if asked again, suggest merging into fewer files rather than continuing to add more.
