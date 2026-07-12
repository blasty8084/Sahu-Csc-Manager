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

## The fix (durable — applied 2026-07-12)

Two layers of protection are now in place:

### 1. Workspace override in `pnpm-workspace.yaml`
```yaml
overrides:
  '@opentelemetry/api': ^1.9.1
```
This forces every package in the workspace to resolve `@opentelemetry/api` to the same version, preventing pnpm from ever creating a second drizzle-orm peer variant. When `@sentry/node` bumps its otel major, update **only this one line** then run `pnpm install`.

### 2. Pre-build guard in `artifacts/api-server/build.mjs`
`checkDrizzlePeerSingleton()` runs at the start of every build. It reads `pnpm-lock.yaml`, scans only the `snapshots:` section for `drizzle-orm@` entries, and calls `process.exit(1)` with a clear remediation message if more than one variant exists. The guard deliberately skips the `packages:` section, which always has a bare version entry and is NOT a dual-variant.

**How to apply:** If the guard fires after a `@sentry/node` upgrade:
1. Check what `@opentelemetry/api` version the new Sentry requires.
2. Update `overrides['@opentelemetry/api']` in `pnpm-workspace.yaml`.
3. Run `pnpm install`.
4. Rebuild.
