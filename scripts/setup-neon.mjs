#!/usr/bin/env node
/**
 * First-deploy setup script for Neon PostgreSQL on Render.
 *
 * Run from Render Shell:
 *   node scripts/setup-neon.mjs
 *
 * What it does:
 * 1. Creates the `session` table (required by connect-pg-simple)
 * 2. Verifies the DB connection
 *
 * Schema tables (users, ledger, etc.) are pushed by drizzle-kit separately.
 * Seed data (admin/operator accounts) is created by the seed script.
 */

import pg from "pg";
const { Pool } = pg;

const connectionString =
  process.env.NEON_DATABASE_URL ??
  process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌  NEON_DATABASE_URL or DATABASE_URL must be set.");
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  console.log("🔌  Connecting to database...");
  await pool.query("SELECT 1");
  console.log("✅  Database connection OK");

  console.log("📋  Creating session table...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS session (
      sid    VARCHAR NOT NULL COLLATE "default",
      sess   JSON NOT NULL,
      expire TIMESTAMP(6) NOT NULL,
      CONSTRAINT session_pkey PRIMARY KEY (sid)
    );
    CREATE INDEX IF NOT EXISTS session_expire_idx ON session (expire);
  `);
  console.log("✅  Session table ready");

  console.log("\n✅  Neon setup complete!");
  console.log("   Next: Run drizzle-kit push to create schema tables.");
  console.log("   Then: Run the seed script to create admin/operator accounts.");
} catch (err) {
  console.error("❌  Setup failed:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
