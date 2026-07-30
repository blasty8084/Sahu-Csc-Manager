#!/usr/bin/env node
/**
 * Render post-build setup script — runs automatically during every deploy.
 * Safe to run repeatedly (all operations are idempotent).
 *
 * Steps:
 *  1. Create session table (IF NOT EXISTS)
 *  2. Push DB schema via drizzle-kit (--force skips interactive prompts)
 *  3. Seed admin/operator accounts (upsert — no data loss on re-deploy)
 */

import { execSync } from "child_process";
import pg from "pg";

const { Pool } = pg;

const connectionString =
  process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌  NEON_DATABASE_URL or DATABASE_URL must be set.");
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

function run(cmd, opts = {}) {
  console.log(`\n▶  ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: opts.cwd ?? process.cwd(), ...opts });
}

try {
  // ── 1. Verify DB connection ──────────────────────────────────────────────
  console.log("\n🔌  Connecting to database...");
  await pool.query("SELECT 1");
  console.log("✅  Database connection OK");

  // ── 2. Create session table ──────────────────────────────────────────────
  console.log("\n📋  Creating session table...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS session (
      sid    VARCHAR NOT NULL COLLATE "default",
      sess   JSON    NOT NULL,
      expire TIMESTAMP(6) NOT NULL,
      CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE
    );
    CREATE INDEX IF NOT EXISTS session_expire_idx ON session (expire);
  `);
  console.log("✅  Session table ready");

  await pool.end();

  // ── 3. Push DB schema ────────────────────────────────────────────────────
  console.log("\n🗂   Pushing DB schema...");
  // Root of the monorepo (this script lives in scripts/, server CWD is artifacts/api-server)
  const root = new URL("../../", import.meta.url).pathname;
  run("pnpm --filter @workspace/db run push-force", { cwd: root });
  console.log("✅  Schema up to date");

  // ── 4. Seed accounts ─────────────────────────────────────────────────────
  console.log("\n🌱  Seeding database...");
  // dist/scripts/seed.mjs is relative to artifacts/api-server/
  const apiDir = new URL("../artifacts/api-server", import.meta.url).pathname;
  run("node --enable-source-maps dist/scripts/seed.mjs", { cwd: apiDir });
  console.log("✅  Seed complete");

  console.log("\n🎉  Render setup finished — starting server...\n");
} catch (err) {
  console.error("\n❌  render-deploy.mjs failed:", err.message);
  process.exit(1);
}
