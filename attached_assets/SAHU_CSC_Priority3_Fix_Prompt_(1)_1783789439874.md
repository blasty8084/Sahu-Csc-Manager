# SAHU CSC — Priority 3 Fix Prompt

Source: `OPTIMIZATION.md` Priority 3 section (scale-readiness — not urgent at current usage).
Scope: read replica / managed cache (Redis) for multi-instance scaling, real concurrent-user load test.

**General rules:**
- Do not change any existing behavior, route, API contract, or visual output.
- These items are explicitly "not urgent at current usage" — treat this as prep/groundwork, not a forced migration. Where a decision depends on actual traffic data that doesn't exist yet, document the tradeoff instead of guessing.
- After each phase, run the `Typecheck` workflow and fix all new errors before moving to the next phase.
- Restart `SAHU CSC` after each phase and check the browser console/preview for regressions before continuing.
- Do not mark anything in `OPTIMIZATION.md` as done — that file is edited by hand, not by the agent.

---

## Phase 1 — Read replica or managed cache (Redis) for multi-instance scaling

**Goal:** the current 5s TTL query cache (dashboard/admin-overview/reports, invalidated on every ledger write) and the 5s TTL session-validation cache are both process-local — correct for a single instance today, but will produce stale/inconsistent reads if the API ever runs as multiple instances.

### 1a. Confirm actual scope before changing anything
- Confirm the app currently runs as a single instance/container (check current Replit deployment config) — if so, this phase is groundwork only, don't force a premature migration.
- Identify every place process-local caching is used: the 5s query cache on dashboard/admin-overview/reports, and the 5s session-validation cache. List exact file locations.

### 1b. Design the Redis-backed replacement (Upstash Redis is already in the stack)
- Since Upstash Redis is already part of the architecture, prefer extending its usage over introducing a new cache technology.
- Design a drop-in cache interface (get/set/invalidate) that can be backed by either process-local memory (current, single-instance) or Upstash Redis (multi-instance), selected via an env flag — so this doesn't force multi-instance deployment before it's needed.
- Preserve exact current semantics: 5s TTL, invalidation on every ledger write for the query cache; 5s TTL for session validation.

### 1c. Implement behind a flag
- Implement the Redis-backed cache path without removing the process-local path — both should coexist, switchable via config.
- Do not change invalidation triggers or TTL values — only the storage backend changes.

### 1d. Read replica (database side)
- This is a Neon/Postgres infrastructure decision (connection config), not application logic — document the setup steps (read replica connection string, routing read-only queries like reports/dashboard to the replica) rather than provisioning it, since it depends on the Neon plan/infra the user has.
- Flag clearly which queries are safe to route to a replica (read-only reporting/dashboard queries) vs which must stay on the primary (anything in the same transaction as a write, or reads that need read-after-write consistency, like balance display right after a ledger entry).

### Acceptance checklist
- [ ] Current single-vs-multi-instance status confirmed before any change.
- [ ] Cache interface abstraction implemented with both process-local and Redis backends, switchable via config.
- [ ] TTLs and invalidation triggers unchanged from current behavior.
- [ ] Read replica routing documented with a clear list of which queries are safe to route vs which must stay on primary.
- [ ] No behavior change with the flag left at its current (process-local) default.
- [ ] Typecheck passes.

---

## Phase 2 — Real concurrent-user load test

**Goal:** existing performance numbers (dashboard p50 47ms/p95 272ms, 0 errors at 20 connections) are single-process/single-container — re-measure once traffic patterns are known, or proactively to get a realistic baseline.

### 2a. Choose a load-testing approach
- Use a tool already suited to HTTP load testing (e.g. `autocannon` or `k6`) — pick whichever has lower setup friction in the Replit environment; document the choice and why.
- Do not run the load test against a shared/production database with real user data — use a disposable/staging dataset or a dedicated test tenant to avoid corrupting real ledger/receipt records.

### 2b. Define realistic scenarios
- Model concurrent-user counts beyond the existing 20-connection baseline (e.g. 50, 100, 200) to find where latency or error rate starts degrading.
- Include the actual hot paths: dashboard load, ledger entry writes (since these invalidate the query cache on every write), and report generation (heavier, since it may pull in the lazy-loaded chart/export libraries server-side for data prep).
- Note where the 5s TTL cache means the test's read/write ratio will affect results — a write-heavy test will show more cache invalidation churn than a read-heavy one; test both mixes.

### 2c. Run and record
- Run the load test in a way that doesn't affect real users (staging environment or an off-peak window if only one environment exists).
- Record p50/p95/p99 latency and error rate at each concurrency level, in the same format as the existing baseline numbers for direct comparison.

### 2d. Report findings, don't auto-fix
- Produce a short findings doc: at what concurrency level does latency/error rate start degrading, and whether the process-local cache (Phase 1) becomes a bottleneck under write-heavy load.
- Do not make architecture changes based on this test in the same pass — flag findings for a follow-up decision, since Priority 3 items are explicitly not urgent yet.

### Acceptance checklist
- [ ] Load test tool chosen and justified.
- [ ] Test run against disposable/staging data, not real production records.
- [ ] Results recorded at multiple concurrency levels (not just a repeat of the existing 20-connection number).
- [ ] Read-heavy and write-heavy scenarios both tested given the 5s cache TTL.
- [ ] Findings documented separately from code changes — no architecture changes made based on results in this pass.
- [ ] Typecheck passes (if any test scripts were added to the repo).
