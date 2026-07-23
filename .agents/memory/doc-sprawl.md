---
name: Documentation sprawl in this project
description: This project maintains many parallel versioned markdown docs that must be updated together, plus intentionally-superseded old versions to skip
---

## Active docs that must stay in sync on every version bump

- `replit.md` — main README, current setup status, and user preferences
- `DOCS.md` — full platform documentation with a numbered version-history section
- `CHANGELOG.md` — consolidated v1–v4 change log
- `AGENT.md` — AI-agent reference and current operational rules
- `ARCHITECTURE.md` — canonical architecture reference
- `PROJECT.md` — onboarding and structural project reference
- `secrets.md` — current secrets and environment-variable reference
- `CDN_SETUP.md`, `MULTI_INSTANCE_SETUP.md`, `LOADTEST_FINDINGS.md` — focused infrastructure/performance references
- `BUGS.md` — issue tracker; reconcile its statuses when fixes land
- `artifacts/sahu-csc/src/pages/about.tsx` — in-app changelog array (`CHANGELOG`) and security-overview bullet list shown to users; also displays `__APP_VERSION__` sourced live from `package.json` via Vite `define`
- `artifacts/sahu-csc/package.json` and `artifacts/api-server/package.json` — the actual version string

**Why:** the project has accumulated several parallel references with different audiences; setup and architecture changes must be synchronized across the maintained current docs.

**How to apply:** when asked to update docs/version, update the maintained current docs above together. Do not edit uploaded prompts, audit snapshots, `memory.md`, or files under `docs/archive/` unless the user explicitly asks; archived v2 docs are historical.

As of 2026-07-23, the current docs were synchronized for Neon, optional B2 storage, SMTP availability, workflows, measured latency, and issue status. Prefer consolidating future changes into these canonical files rather than adding new versioned duplicates.
