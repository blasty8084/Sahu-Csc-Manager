---
name: receipt_counters per-user schema
description: Composite PK (user_id, year) migration and drizzle-kit limitation with NOT NULL column adds
---

## Rule
`receipt_counters` has a composite primary key `(user_id, year)` with a FK to `users(id) ON DELETE CASCADE` and a separate index `idx_rc_user_id`. Receipt numbers are now per-user-per-year, not global per-year.

**Why:** Global per-year receipt numbers meant different operators shared a single sequence, causing misleading receipt numbering when multiple users create ledger entries.

**How to apply:**
- `generateReceiptNumber(userId, year)` passes both args to the upsert
- `onConflictDoUpdate.target` must be `[receiptCountersTable.userId, receiptCountersTable.year]` (array)
- Values object must include `userId` field

## drizzle-kit push limitation
`drizzle-kit push` cannot add a NOT NULL column to a table that already has rows — it fails with `column "user_id" of relation "receipt_counters" does not exist` during the `SET NOT NULL` step.

**Fix:** Since `receipt_counters` only holds sequence counters (actual receipt numbers are stored in the `ledger` table's `receipt_number` column), it is safe to DROP and recreate the table:

```sql
DROP TABLE IF EXISTS receipt_counters CASCADE;
CREATE TABLE receipt_counters (
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year integer NOT NULL,
  last_count integer NOT NULL DEFAULT 0,
  CONSTRAINT receipt_counters_pkey PRIMARY KEY (user_id, year)
);
CREATE INDEX idx_rc_user_id ON receipt_counters(user_id);
```

After recreating, run `drizzle-kit push --force` to sync the Drizzle snapshot.
