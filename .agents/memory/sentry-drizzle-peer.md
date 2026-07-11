---
name: Sentry + drizzle-orm dual-peer fix
description: Installing @sentry/node creates a second drizzle-orm peer-dep variant via @opentelemetry/api, breaking TypeScript types; fix by adding @opentelemetry/api to both api-server AND lib/db.
---

## The problem

`@sentry/node` depends on `@opentelemetry/api`. drizzle-orm lists `@opentelemetry/api` as an optional peer dependency. When pnpm sees that peer is available in `api-server` (because Sentry installed it there), it creates a second resolution variant of drizzle-orm:

- `drizzle-orm@0.45.2_@opentelemetry+api@1.9.1_@types+pg@8.20.0_pg@8.20.0` ← api-server
- `drizzle-orm@0.45.2_@types+pg@8.20.0_pg@8.20.0` ← lib/db (no otel peer)

TypeScript then sees two different `drizzle-orm` instances with incompatible private properties (`shouldInlineParams`) wherever api-server code mixes types from `@workspace/db` (lib/db's variant) with types from its own drizzle-orm direct imports (api-server's variant).

Error pattern: `Types have separate declarations of a private property 'shouldInlineParams'`

**Why:** pnpm creates separate resolution trees for each unique peer-dep combination.

## The fix

Add `@opentelemetry/api@^1.9.1` to BOTH packages:

```bash
pnpm --filter @workspace/api-server add @opentelemetry/api@^1.9.1
pnpm --filter @workspace/db add @opentelemetry/api@^1.9.1
```

This forces both packages to resolve drizzle-orm through the same peer variant (with opentelemetry), eliminating the type mismatch.

**How to apply:** Any time `@sentry/node`, `@opentelemetry/*`, or any package that brings in `@opentelemetry/api` is installed in the api-server, run the fix above to keep drizzle-orm to a single variant.
