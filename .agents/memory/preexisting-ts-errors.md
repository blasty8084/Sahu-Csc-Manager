---
name: Pre-existing TypeScript errors in this project
description: Known TS errors that existed before L-series tech debt work; not regressions
---

## Known pre-existing errors (do not treat as regressions)

### sahu-csc: AepsTransactionTable.tsx
- ~17 errors: `'session' is possibly 'null'`
- Root cause: the component accepts `session: AepsSession | undefined` but uses it without null guard in several places
- These existed before any file-split refactor

### api-server: src/lib/queue-client.ts
- ~6 errors: ioredis/BullMQ `ConnectionOptions` type conflicts (`'connecting' is protected`)
- Root cause: ioredis peer version mismatch between BullMQ and local install; a TS structural mismatch on internal `AbstractConnector` types
- Also: `src/app.ts(49,54): Property 'sendCommand' does not exist`

**Why this matters:** The Typecheck workflow will always fail (exit 2) in this project. Do not assume failure means a new regression — grep the output for the specific files you changed.
