---
name: Session store pool fix
description: connect-pg-simple must use the shared pg Pool from @workspace/db — using conString causes silent session-save failures.
---

## Rule
Pass `pool` (imported from `@workspace/db`) to `ConnectPgSimple`, not `conString`.

**Why:** When `conString` is used, connect-pg-simple creates its own separate pg Pool internally. In the Replit environment this pool fails silently — sessions appear to save (cookie is set, login returns 200) but nothing is written to the DB. The next request finds no session data and returns 401. Using the shared `pool` reuses the already-working DB connection and the problem goes away.

**How to apply:** In `artifacts/api-server/src/app.ts`:
```ts
import { pool } from "@workspace/db";
// ...
store: new PgSession({
  pool,                      // ← shared pool, not conString
  tableName: "session",
  createTableIfMissing: true,
  pruneSessionInterval: 60 * 60,
}),
```

Also ensure the `session` table exists. `createTableIfMissing: true` handles this automatically on first store operation. If needed, create manually:
```sql
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
```
