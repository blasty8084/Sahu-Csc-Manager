---
name: archiver v8 ESM breaking change
description: How to correctly create ZIP archives with the archiver npm package v8+, which is ESM-only and removed the old callable factory export
---

## What changed
- `archiver` v8.0.0 became `"type": "module"` (ESM-only) and its default export is no longer a callable factory function.
- Old pattern (v5/v6/v7): `const archiver = require("archiver"); archiver("zip", opts)`.
- New pattern (v8+): named exports only — `Archiver`, `ZipArchive`, `TarArchive`, `JsonArchive`. No default callable.

## Correct usage now
```ts
const { ZipArchive } = _require("archiver") as typeof import("archiver");
const archive = new ZipArchive({ zlib: { level: 6 } });
archive.pipe(res);
archive.append(buffer, { name: "file.pdf" });
await archive.finalize();
```
`ZipArchive` extends the same `Archiver` (stream) class, so `.pipe()`, `.append()`, `.on("error"/"data"/"end")`, and `.finalize()` all still work identically — only the construction changed.

**Why:** Calling the old factory pattern against v8 doesn't throw immediately — `require("archiver")` returns a module namespace object `{ Archiver, ZipArchive, ... }`, so `archiver(...)` fails at the call site with a confusing `"archiver is not a function"` (or `archiver2` if esbuild renamed the duplicate top-level binding when bundling multiple files that each did their own `createRequire` for archiver). This silently breaks ALL zip-producing endpoints (bulk export, monthly export) until someone actually clicks download.

**How to apply:** Whenever `pnpm add`/upgrading `archiver`, or debugging a "not a function" error in a require'd CJS-looking package, check the installed version's actual export shape (`node -e "console.log(require('pkg'))"` from the correct package directory) rather than trusting old code samples — dual-export/ESM migrations like this are common in actively maintained npm packages and won't show up as TypeScript errors when using `createRequire` with a hand-written type cast.
