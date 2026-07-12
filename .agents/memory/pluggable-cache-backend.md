---
name: Pluggable cache backend (memory/Redis)
description: How the query cache and session/role cache are abstracted behind a CacheBackend interface, and gotchas hit while adding it.
---

The 5s-TTL query cache (`lib/query-cache.ts`) and session/role cache (`lib/auth/sessionCache.ts`) both
delegate to a `CacheBackend` interface (`lib/cache/backend.ts`), selected via `CACHE_BACKEND` env var:
`memory` (default, per-namespace `Map`) or `redis` (`@upstash/redis`, opt-in for multi-instance scaling).

**Why:** a process-local memory cache is correct today (single-instance deployment) but would let one
instance serve stale data another instance already invalidated if the API ever scaled horizontally.

**How to apply:** default behavior must stay byte-for-byte identical to the old inline-Map caches — only
add a new backend or change TTLs deliberately, not as a side effect of refactoring call sites.

**Gotcha — TS7022 on inline tuple destructuring:** `const [next, keys] = await redis.scan(...)` inside an
object-literal method can trip a TS self-referencing-initializer error depending on inference context, even
when the same pattern works fine extracted into a named function elsewhere in the same file. Fix: annotate
the destructured tuple's type explicitly (`const scanResult: [string | number, string[]] = await ...`)
rather than relying on inference.

**Gotcha — orphaned rows on user delete:** `DELETE /api/users/:id` does a plain `db.delete(usersTable)` with
no cascading FK cleanup — `ledger.created_by` (and likely other `createdBy`-style columns) are plain
integers with no `references()`/`onDelete`, so deleting a user leaves their rows behind under a now-invalid
user id. Anything that creates a throwaway user (load tests, ad hoc scripts) must manually delete that
user's rows in every table it wrote to before deleting the user, or verify cleanup by checking row counts.
