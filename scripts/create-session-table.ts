import pg from "pg";

const { Pool } = pg;

async function main() {
  const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS session (
      sid VARCHAR NOT NULL COLLATE "default",
      sess JSON NOT NULL,
      expire TIMESTAMP(6) NOT NULL,
      CONSTRAINT session_pkey PRIMARY KEY (sid)
    )
  `);
  await pool.query(
    "CREATE INDEX IF NOT EXISTS IDX_session_expire ON session(expire)"
  );
  console.log("✅ session table ready");
  await pool.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
