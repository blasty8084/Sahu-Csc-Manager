# SAHU CSC — Load Test Findings (Phase 2, July 12, 2026)

> Companion to `pnpm --filter @workspace/api-server run loadtest:phase2` (`src/scripts/loadtest-phase2.ts`).
> Scope: measure behavior at realistic concurrency (50/100/200 connections) with a read-heavy mix and a
> write-heavy mix, using disposable data. **No architecture changes were made based on these results** —
> this is a measurement pass; see "What this does and doesn't tell us" below for what would need to change
> if traffic actually reached these levels in production.

## Method

- Ran against the dev container's single Node process (same setup as the v3.5.3 baseline), 10s duration per run.
- A temporary `operator`-role user was created via the admin API for the write-heavy mix, and deleted afterward.
  Its ~4,000 test ledger rows (orphaned by the user delete, since `ledger.created_by` has no cascading foreign
  key) were explicitly cleaned up with a one-off script after the run — confirmed 0 ledger rows remain.
  **No real/seeded data was read, modified, or deleted by this test.**
- Read-heavy mix: `GET /api/dashboard`, `GET /api/admin/users-overview`, `GET /api/reports/daily` (all admin-scoped, all sit behind the 5s query cache).
- Write-heavy mix: `POST /api/ledger` (uncached — every call recomputes the running balance and writes a new row).

## Results

| Endpoint | Connections | p50 | p95 | p99 | mean | req/s | errors |
|---|---|---|---|---|---|---|---|
| GET /api/dashboard | 50 | 143ms | 391ms | 453ms | 168ms | 295.3 | 0 |
| GET /api/admin/users-overview | 50 | 136ms | 301ms | 351ms | 151ms | 325.9 | 0 |
| GET /api/reports/daily | 50 | 140ms | 315ms | 363ms | 158ms | 312.0 | 0 |
| POST /api/ledger | 50 | 313ms | 591ms | 655ms | 343ms | 141.4 | 0 |
| GET /api/dashboard | 100 | 312ms | 627ms | 731ms | 353ms | 278.7 | 0 |
| GET /api/admin/users-overview | 100 | 333ms | 658ms | 708ms | 368ms | 263.5 | 0 |
| GET /api/reports/daily | 100 | 299ms | 670ms | 801ms | 329ms | 298.6 | 0 |
| POST /api/ledger | 100 | 659ms | 1368ms | 1651ms | 755ms | 128.7 | 0 |
| GET /api/dashboard | 200 | 642ms | 1107ms | 1270ms | 682ms | 282.1 | 0 |
| GET /api/admin/users-overview | 200 | 706ms | 1705ms | 1792ms | 819ms | 234.4 | 0 |
| GET /api/reports/daily | 200 | 688ms | 1425ms | 1541ms | 747ms | 258.8 | 0 |
| POST /api/ledger | 200 | 1860ms | 2305ms | 2372ms | 1883ms | 99.5 | 0 |

**Zero errors and zero non-2xx responses at every level tested.** The app does not fall over at 200
concurrent connections on this container — it degrades gracefully (latency climbs, throughput plateaus)
rather than failing.

## What this tells us

- **Reads scale roughly flat in throughput, linear in latency.** req/s for the cached read endpoints stays
  in the 230–330 range across all three concurrency levels — the process is CPU/event-loop bound, not
  failing, so latency absorbs the extra concurrency instead of the server rejecting work. This is the
  expected shape for a single Node process with no horizontal scaling.
- **Writes are the bottleneck, and it's structural, not accidental.** `POST /api/ledger` throughput actually
  *drops* as concurrency rises (141 → 129 → 99.5 req/s) while latency rises much faster than the read
  endpoints (p50 5x from 50→200 connections, vs. ~4.5x for reads). Every ledger write does a full
  `SUM(credit) - SUM(debit)` balance recalculation over that user's entire history before inserting — this
  is correct-by-construction (balance is never trusted from the client) but means write cost scales with
  history size, and it isn't cached because correctness there requires always reading fresh state.
- **This matches the design intent, not a bug.** The write path already intentionally does more work per
  request than the read path for financial-integrity reasons (see `architectureV3.md` §11.1). These numbers
  quantify that tradeoff at concurrency rather than reveal a defect.

## What this does and doesn't tell us

- These are single-process, single-container numbers on a shared dev VM — not a production capacity plan.
  Real production hardware, connection pool sizing, and actual traffic shape (this app is one CSC's internal
  tool, not a multi-tenant SaaS with thousands of concurrent users) will differ substantially.
- **If real usage ever approached these concurrency levels**, the next levers — not applied in this pass —
  would be: (1) the pluggable Redis cache backend added in this same round, so caching survives running
  more than one API instance behind a load balancer; (2) moving the ledger balance calculation to a
  maintained running total (e.g. a `balance` column updated transactionally) instead of recomputing
  `SUM()` over full history on every write, if write latency at scale became a real complaint; (3) read
  replicas, if the DB provider ever supports them (see `architectureV3.md` §5.6 for which queries would be
  safe to route to one).
- None of the above were implemented here — this document is a measurement, deliberately scoped to not
  trigger an architecture change on its own.
