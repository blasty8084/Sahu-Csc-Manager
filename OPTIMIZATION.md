# SAHU CSC — Fix & Optimization Checklist
**As of 2026-07-11 · Current score: 7.5/10**

> Working checklist derived from the latest app review. Check items off as they're completed.
> This is a living TODO list, not a changelog — completed items should move to `CHANGELOG_V3.md` / `UPDATES.md` and be removed from here, not left checked.

---

## Priority 1 — Highest risk, do first

- [ ] **Add automated tests for ledger/receipt logic** — balance calculation, receipt-number generation (`CSC-YYYY-NNNN`), and auth/session flows have zero test coverage today. This is a financial ledger app; a silent regression here is the costliest possible bug. Start with Vitest unit tests on the balance math and receipt counter, then session/auth integration tests.
- [ ] **Add error tracking / APM (e.g. Sentry)** — current "slow request" logging is a log-line flag only; there is no alerting and no stack-trace capture in production. This is the single biggest visibility gap right now.
- [ ] **Verify heavy libraries are lazy-loaded** — confirm `vendor-charts` (420KB), `jspdf` (386KB), and `html2canvas` (201KB) are behind `import()` dynamic imports triggered only by report/export actions, not pulled into the main bundle on every page load.

## Priority 2 — Meaningful improvements

- [ ] **Consolidate documentation** — 9 parallel `.md` files (`replit.md`, `DOCS.md`, `CHANGELOG.md`, `CHANGELOG_V3.md`, `BUILD.md`, `WORKFLOWS.md`, `ReplitV3.md`, `architectureV3.md`, `UPDATES.md`) must be hand-updated together on every version bump, which is fragile and drifts easily (v3.5.3 was missing from the About page changelog until caught). Pick one source-of-truth file and make the rest short pointers, or merge overlapping ones.
- [ ] **Finish i18n coverage** — several pages have the translation hook wired but incomplete Hindi/Odia strings. Low priority unless multilingual users are actively onboarding.
- [ ] **CDN in front of static assets** — cache headers are already correct (immutable hashed assets, no-store SPA shell); adding Cloudflare or similar in front would cut latency for users far from this container with minimal effort.

## Priority 3 — Scale-readiness (not urgent at current usage)

- [ ] **Read replica or managed cache (Redis) for multi-instance scaling** — current 5s TTL query cache is process-local, correct for a single instance but won't help if the API ever runs as multiple instances.
- [ ] **Real concurrent-user load test** — existing numbers (dashboard p50 47ms/p95 272ms, 0 errors at 20 connections) are single-process/single-container; re-measure once traffic patterns are known.

---

## Already done (for reference — do not re-do)

- ✅ Dependency audit: 0 known vulnerabilities (critical/high/moderate/low) as of 2026-07-11
- ✅ N+1 queries fixed, batched writes, pooled DB connections
- ✅ 5s TTL query cache on dashboard/admin-overview/reports endpoints, invalidated on every ledger write
- ✅ Session validation cached in-memory (5s TTL)
- ✅ Image asset optimization pipeline (~31% smaller static assets)
- ✅ Correct SPA cache headers (immutable hashed assets vs. no-store shell)
- ✅ AES-256-GCM field encryption, bcrypt-12, RBAC, rate limiting, CSP, account lockout, idle timeout
- ✅ Offline-first PWA: IndexedDB sync queue, background sync, push notifications
- ✅ Ledger page split from 1652 lines into focused hook + components (v3.5.4)
