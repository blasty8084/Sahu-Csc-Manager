/**
 * node-dump.ts — Pure Node.js database dump (no pg_dump binary required)
 *
 * Renders a .sql file compatible with psql restore.
 * Works on Render, Replit, and any Node.js environment.
 *
 * Why: Render's Node.js runtime does NOT include pg_dump.  Using execSync to
 * call pg_dump always fails silently on Render, so scheduled auto-backups
 * never actually ran.  This replaces pg_dump with direct pg queries.
 */

import { pool } from "@workspace/db";
import { createWriteStream } from "fs";
import { logger } from "./logger";

// ── SQL value escaper ─────────────────────────────────────────────────────────

function sqlLiteral(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") return isFinite(val) ? String(val) : "NULL";
  if (typeof val === "bigint") return String(val);
  if (val instanceof Date) return `'${val.toISOString().replace(/'/g, "''")}'`;
  if (Buffer.isBuffer(val)) return `'\\x${val.toString("hex")}'`;
  if (Array.isArray(val) || (typeof val === "object" && val !== null)) {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  }
  // string — escape single quotes by doubling them
  return `'${String(val).replace(/'/g, "''")}'`;
}

// ── Promisified write helper ──────────────────────────────────────────────────

function writeChunk(ws: ReturnType<typeof createWriteStream>, s: string): Promise<void> {
  return new Promise((res, rej) => {
    if (ws.write(s)) { res(); return; }
    ws.once("drain", res);
    ws.once("error", rej);
  });
}

// ── Main dump function ────────────────────────────────────────────────────────

/**
 * Dumps the entire public schema to a .sql file using the shared pg pool.
 * No system binaries required.
 *
 * Restore with:  psql "$DATABASE_URL" < backup.sql
 */
export async function nodeDump(filepath: string): Promise<void> {
  const client = await pool.connect();
  const ws = createWriteStream(filepath, { encoding: "utf8" });
  const write = (s: string) => writeChunk(ws, s);

  try {
    // ── Header ──────────────────────────────────────────────────────────────
    await write(`-- SAHU CSC Database Backup\n`);
    await write(`-- Generated: ${new Date().toISOString()}\n`);
    await write(`-- Format: pure SQL (nodeDump — no pg_dump required)\n`);
    await write(`-- Restore: psql "$DATABASE_URL" < <this file>\n\n`);

    // Disable FK / trigger checks so tables can be restored in any order
    await write(`SET session_replication_role = 'replica';\n\n`);

    // ── List all user tables ─────────────────────────────────────────────────
    const tablesRes = await client.query<{ tablename: string }>(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    const tables = tablesRes.rows.map((r) => r.tablename);

    for (const table of tables) {
      logger.debug({ table }, "nodeDump: exporting table");

      // Get ordered column names + data types
      const colsRes = await client.query<{ column_name: string }>(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [table]);

      if (colsRes.rows.length === 0) continue;
      const cols = colsRes.rows.map((r) => r.column_name);

      await write(`-- Table: ${table}\n`);
      await write(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;\n`);

      // Stream rows in batches to avoid loading the whole table into memory
      const BATCH = 500;
      let offset = 0;
      let wrote = false;

      while (true) {
        const rowsRes = await client.query(
          `SELECT * FROM "${table}" ORDER BY 1 LIMIT $1 OFFSET $2`,
          [BATCH, offset],
        );
        if (rowsRes.rows.length === 0) break;

        const colList = cols.map((c) => `"${c}"`).join(", ");
        const valueSets = rowsRes.rows.map((row) => {
          const vals = cols.map((col) => sqlLiteral(row[col]));
          return `  (${vals.join(", ")})`;
        });

        await write(`INSERT INTO "${table}" (${colList}) VALUES\n`);
        await write(valueSets.join(",\n") + `;\n`);

        wrote = true;
        offset += rowsRes.rows.length;
        if (rowsRes.rows.length < BATCH) break;
      }

      if (!wrote) await write(`-- (empty table)\n`);
      await write(`\n`);
    }

    // ── Reset sequences so next INSERT gets the right ID ─────────────────────
    const seqRes = await client.query<{
      seq: string;
      tbl: string;
      col: string;
    }>(`
      SELECT
        s.relname                  AS seq,
        t.relname                  AS tbl,
        a.attname                  AS col
      FROM pg_class s
      JOIN pg_depend  d ON d.objid = s.oid
                      AND d.classid    = 'pg_class'::regclass
                      AND d.refclassid = 'pg_class'::regclass
                      AND d.deptype    = 'a'
      JOIN pg_class     t ON t.oid      = d.refobjid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
      WHERE s.relkind = 'S'
        AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    `);

    if (seqRes.rows.length > 0) {
      await write(`-- Reset sequences to resume after max existing ID\n`);
      for (const { seq, tbl, col } of seqRes.rows) {
        await write(
          `SELECT setval('${seq}', COALESCE((SELECT MAX("${col}") FROM "${tbl}"), 0) + 1, false);\n`,
        );
      }
      await write(`\n`);
    }

    await write(`SET session_replication_role = 'DEFAULT';\n`);
    await write(`-- Backup complete\n`);

    // Flush and close the write stream
    await new Promise<void>((res, rej) => ws.end((err: unknown) => (err ? rej(err) : res())));

    logger.info({ filepath }, "nodeDump: complete");
  } catch (err: unknown) {
    // Ensure the stream is closed before re-throwing
    ws.destroy();
    throw err;
  } finally {
    client.release();
  }
}
