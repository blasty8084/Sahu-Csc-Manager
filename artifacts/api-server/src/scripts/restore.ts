import { execSync } from "child_process";
import { existsSync } from "fs";
import path from "path";
import { db, backupsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const BACKUP_DIR = path.resolve(process.cwd(), "backups");

async function restore() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Usage: tsx restore.ts <backup-id|filename>");
    process.exit(1);
  }

  const dbUrl = process.env["DATABASE_URL"];
  if (!dbUrl) throw new Error("DATABASE_URL is required");

  let filename: string;

  const id = parseInt(arg, 10);
  if (!isNaN(id)) {
    const [row] = await db.select().from(backupsTable).where(eq(backupsTable.id, id));
    if (!row) { console.error(`No backup with id=${id}`); process.exit(1); }
    filename = row.filename;
  } else {
    filename = arg;
  }

  const filepath = path.join(BACKUP_DIR, filename);
  if (!existsSync(filepath)) {
    console.error(`Backup file not found: ${filepath}`);
    process.exit(1);
  }

  console.log(`Restoring from ${filename}…`);
  execSync(`psql "${dbUrl}" -f "${filepath}"`, { stdio: "inherit" });
  console.log(`✅ Restore complete from ${filename}`);

  process.exit(0);
}

restore().catch((err) => {
  console.error("Restore failed:", err.message);
  process.exit(1);
});
