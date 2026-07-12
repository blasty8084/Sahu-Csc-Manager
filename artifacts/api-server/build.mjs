import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { open, readFile, rm } from "node:fs/promises";

globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(artifactDir, "../..");

/**
 * Guard against the drizzle-orm dual-peer-variant problem.
 *
 * @sentry/node pulls in @opentelemetry/api, which is an optional peer of
 * drizzle-orm.  If pnpm sees that peer in api-server but not in lib/db it
 * creates two separate resolution variants of drizzle-orm.  TypeScript then
 * treats them as different packages and emits:
 *
 *   "Types have separate declarations of a private property 'shouldInlineParams'"
 *
 * The workspace override in pnpm-workspace.yaml (`overrides['@opentelemetry/api']`)
 * prevents this, but this check is a fast-fail safety net so the problem is
 * caught at BUILD time (with a clear message) rather than silently at TS / deploy time.
 *
 * If this fires: bump the `@opentelemetry/api` version in pnpm-workspace.yaml
 * overrides to match what @sentry/node requires, then re-run `pnpm install`.
 */
async function checkDrizzlePeerSingleton() {
  const lockPath = path.resolve(workspaceRoot, "pnpm-lock.yaml");
  let lockContent;
  try {
    lockContent = await readFile(lockPath, "utf8");
  } catch {
    // No lockfile in this environment (e.g. CI with pre-installed deps) — skip.
    return;
  }

  // pnpm v9 lockfile has two top-level sections:
  //   packages:   — package metadata (resolution, engines).  Every package
  //                 appears here once with its bare version key.
  //   snapshots:  — resolved instances with their actual peer set.  A dual-
  //                 peer-variant shows up as TWO different keys here, e.g.:
  //                   drizzle-orm@0.45.2(@opentelemetry/api@1.9.1)(...):
  //                   drizzle-orm@0.45.2:
  // We must only scan snapshots: — the bare entry in packages: is not a variant.
  const snapshotsStart = lockContent.indexOf("\nsnapshots:");
  const snapshotsSection = snapshotsStart === -1
    ? lockContent
    : lockContent.slice(snapshotsStart);

  const snapshotRe = /^  (drizzle-orm@\S+):$/gm;
  const variants = new Set();
  let m;
  while ((m = snapshotRe.exec(snapshotsSection)) !== null) {
    variants.add(m[1]);
  }

  if (variants.size > 1) {
    console.error("\n❌  drizzle-orm dual-peer-variant detected in pnpm-lock.yaml:");
    for (const v of variants) console.error("      " + v);
    console.error(`
  This means pnpm resolved drizzle-orm through two different peer-dependency
  trees — most likely because @opentelemetry/api is present in one workspace
  package but not another (usually triggered by a @sentry/node upgrade).

  Fix:
    1. Check what @opentelemetry/api version the new @sentry/node requires.
    2. Update the 'overrides[\"@opentelemetry/api\"]' entry in pnpm-workspace.yaml
       to match (e.g. "^2.0.0").
    3. Run: pnpm install
    4. Rebuild.
`);
    process.exit(1);
  }
}

const LOCK_FILE = "/tmp/.sahucsc-api-build.lock";

async function acquireLock() {
  while (true) {
    try {
      const fh = await open(LOCK_FILE, "wx");
      await fh.close();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
}

async function releaseLock() {
  try { await rm(LOCK_FILE, { force: true }); } catch { /* ignore */ }
}

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");

  const seedPath = path.resolve(artifactDir, "src/scripts/seed.ts");

  await esbuild({
    entryPoints: [
      path.resolve(artifactDir, "src/index.ts"),
      seedPath,
    ],
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    external: [
      "*.node",
      "connect-pg-simple",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "farmhash",
      "xxhash-addon",
      "bufferutil",
      "utf-8-validate",
      "ssh2",
      "cpu-features",
      "dtrace-provider",
      "isolated-vm",
      "lightningcss",
      "pg-native",
      "oracledb",
      "mongodb-client-encryption",
      "nodemailer",
      "pdfkit",
      "archiver",
      "exceljs",
      "handlebars",
      "knex",
      "typeorm",
      "protobufjs",
      "onnxruntime-node",
      "@tensorflow/*",
      "@prisma/client",
      "@mikro-orm/*",
      "@grpc/*",
      "@swc/*",
      "@aws-sdk/*",
      "@azure/*",
      "@opentelemetry/*",
      "@google-cloud/*",
      "@google/*",
      "googleapis",
      "firebase-admin",
      "@parcel/watcher",
      "@sentry/profiling-node",
      "@tree-sitter/*",
      "aws-sdk",
      "classic-level",
      "dd-trace",
      "ffi-napi",
      "grpc",
      "hiredis",
      "kerberos",
      "leveldown",
      "miniflare",
      "mysql2",
      "newrelic",
      "odbc",
      "piscina",
      "realm",
      "ref-napi",
      "rocksdb",
      "sass-embedded",
      "sequelize",
      "serialport",
      "snappy",
      "tinypool",
      "usb",
      "workerd",
      "wrangler",
      "zeromq",
      "zeromq-prebuilt",
      "playwright",
      "puppeteer",
      "puppeteer-core",
      "electron",
    ],
    sourcemap: "linked",
    plugins: [
      esbuildPluginPino({ transports: ["pino-pretty"] })
    ],
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
    `,
    },
  });
}

await checkDrizzlePeerSingleton();
await acquireLock();
try {
  await buildAll();
} finally {
  await releaseLock();
}
