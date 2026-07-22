import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const resolvedDatabaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!resolvedDatabaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Tuned for a small/medium-traffic service on a single Postgres instance:
// - max: caps concurrent connections so traffic spikes can't exhaust the
//   database's connection limit (shared with connect-pg-simple's session store).
// - idleTimeoutMillis: releases idle connections back to Postgres instead of
//   holding them open indefinitely.
// - connectionTimeoutMillis: fail fast (instead of hanging the request) when
//   the pool is saturated and Postgres can't hand out a new connection.
export const pool = new Pool({
  connectionString: resolvedDatabaseUrl,
  max: Number(process.env.DB_POOL_MAX ?? 20),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
