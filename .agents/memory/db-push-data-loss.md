---
name: DB push data loss and re-seeding
description: drizzle-kit push can clear tables; how to re-seed without tsx
---

## Rule
After running `pnpm --filter @workspace/db run push`, always re-run the seed script — table data may be wiped.

**Why:** drizzle-kit push sometimes recreates tables (especially when column constraints change), which drops all rows. This caused the users table to be emptied, breaking login for all users.

**How to apply:** After any schema push, query `SELECT COUNT(*) FROM users` and re-seed if empty.

## Re-seeding without tsx
The api-server does not have `tsx` available as a standalone executable in pnpm scripts. Use Node.js directly with the pg and bcryptjs modules:

```js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Pool } = require('/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg');
const bcrypt = require('/home/runner/workspace/node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs');
```

Run with: `node --input-type=module << 'EOF' ... EOF`

Default credentials: admin/admin123, operator/operator123
