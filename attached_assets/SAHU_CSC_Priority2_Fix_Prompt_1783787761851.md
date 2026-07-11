# SAHU CSC — Priority 2 Fix Prompt

Source: `OPTIMIZATION.md` Priority 2 section (meaningful improvements).
Scope: documentation consolidation, i18n coverage completion, CDN in front of static assets.

**General rules:**
- Do not change any existing behavior, route, API contract, or visual output.
- After each phase, run the `Typecheck` workflow and fix all new errors before moving to the next phase.
- Restart `SAHU CSC` after each phase and check the browser console/preview for regressions before continuing.
- Do not mark anything in `OPTIMIZATION.md` as done — that file is edited by hand, not by the agent.

---

## Phase 1 — Consolidate documentation

**Goal:** collapse the 9 parallel `.md` files (`replit.md`, `DOCS.md`, `CHANGELOG.md`, `CHANGELOG_V3.md`, `BUILD.md`, `WORKFLOWS.md`, `ReplitV3.md`, `architectureV3.md`, `UPDATES.md`) into one source-of-truth plus short pointers, so version bumps don't drift (e.g. v3.5.3 missing from the About page changelog).

### 1a. Audit first — do not delete anything yet
- Read all 9 files fully and list, for each, its actual current purpose (some may already be stale duplicates of each other).
- Identify overlaps: e.g. `CHANGELOG.md` vs `CHANGELOG_V3.md` vs `UPDATES.md` likely all track version history; `replit.md`, `WORKFLOWS.md`, `ReplitV3.md` likely all describe Replit environment/workflow setup; `BUILD.md` and `architectureV3.md` likely both describe build/architecture.
- Produce this audit as a short table (file → purpose → keep/merge/redirect) before touching any file, and pause for confirmation if any file's purpose is ambiguous.

### 1b. Pick source-of-truth files
- One canonical changelog file (recommend keeping `CHANGELOG_V3.md` as the active one if it's the most recently updated, or the one already wired to the About page).
- One canonical architecture/build doc.
- One canonical Replit workflow/setup doc.
- Confirm the choice matches whichever file the About page changelog display already reads from — do not change that wiring.

### 1c. Merge and redirect
- Merge unique content from the non-canonical files into the chosen canonical file for each group, preserving all still-relevant information (don't drop historical entries).
- Replace each merged-away file's content with a short pointer, e.g.:
  ```
  # This file has moved
  See `CHANGELOG_V3.md` for the current changelog.
  ```
- Do not delete the old files outright (some tooling or bookmarks may reference them) — leave them as pointers.

### 1d. Version-bump checklist
- Add a short section at the top of the canonical changelog: "On every version bump, update this file only" — to prevent future drift across multiple files.

### Acceptance checklist
- [ ] Audit table produced and reviewed before any file changes.
- [ ] Exactly one canonical file per category (changelog / architecture-build / workflow-setup).
- [ ] All historical content preserved somewhere (merged, not lost).
- [ ] Non-canonical files replaced with short pointers, not deleted.
- [ ] About page changelog still displays correctly (verify in browser).
- [ ] Typecheck passes (docs-only change, should be a no-op but confirm nothing else broke).

---

## Phase 2 — Finish i18n coverage

**Goal:** complete Hindi/Odia strings on pages where the `i18next`/`react-i18next` hook is already wired but translations are incomplete.

### 2a. Audit missing keys
- Search all pages/components using `useTranslation()` and cross-reference against the Hindi and Odia translation JSON files.
- Produce a list of missing keys per locale per page — do not guess which are missing without checking both locale files.

### 2b. Fill translations
- Add missing Hindi and Odia strings for each identified key, matching the tone/terminology already used elsewhere in the app (e.g. existing CSC-domain terms, currency phrasing in ₹).
- Do not change any English source strings or existing translation keys — only add missing ones.
- Do not introduce new keys for text that isn't already using the translation hook — that's a larger refactor, out of scope here (flag such pages separately instead of translating them ad hoc).

### 2c. Verify
- Switch the app language to Hindi, then Odia, and click through each affected page to confirm no key falls back to raw key-name text or English.

### Acceptance checklist
- [ ] Missing-key audit list produced for both locales before adding translations.
- [ ] All identified missing keys filled for Hindi and Odia.
- [ ] No existing keys or English strings modified.
- [ ] Manual walkthrough in both locales shows no raw/fallback keys on the affected pages.
- [ ] Typecheck passes.

---

## Phase 3 — CDN in front of static assets

**Goal:** reduce latency for users far from the current container by putting a CDN (e.g. Cloudflare) in front of static assets. Cache headers are already correct (immutable hashed assets, no-store SPA shell) — this phase is about fronting, not re-deriving cache policy.

### 3a. Confirm current setup
- Identify how static assets are currently served (directly from the app server, from a Replit static path, or elsewhere) and what domain/URL pattern they use.
- Confirm the existing cache headers (immutable for hashed assets, no-store for the SPA shell) so the CDN config doesn't need to touch or override them.

### 3b. CDN configuration (documentation, not infra provisioning)
- Since this involves external account/DNS setup outside the codebase, produce a clear setup doc rather than code changes:
  - Steps to point a CDN (Cloudflare or equivalent) at the existing static asset path.
  - Confirmation that the CDN should respect origin cache-control headers (pass-through, not override) given they're already correct.
  - Any cache-purge step needed on deploy, if the CDN caches beyond what hashed filenames already handle.
- If any code-level change is needed (e.g. serving assets from a CDN-prefixed URL instead of relative paths), make that change carefully and verify all asset references (images, fonts, JS/CSS chunks) still resolve correctly after the change.

### 3c. Verify
- Load the app after CDN setup and confirm static assets are served from the CDN domain (check network tab), with no broken references and identical visual output.

### Acceptance checklist
- [ ] Current static asset serving path and cache headers documented before any change.
- [ ] CDN setup steps documented clearly enough to execute outside the coding agent if needed.
- [ ] If code changes were made for CDN-prefixed URLs, all asset references verified working.
- [ ] No visual or behavioral regression.
- [ ] Typecheck passes.
