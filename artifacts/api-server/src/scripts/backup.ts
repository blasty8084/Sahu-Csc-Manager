import { execSync } from "child_process";
import { statSync, mkdirSync } from "fs";
import path from "path";
import { db, backupsTable } from "@workspace/db";

const BACKUP_DIR = path.resolve(process.cwd(), "../../backups");

async function backup() {
  mkdirSync(BACKUP_DIR, { recursive: true });

  const filename = `backup_${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);

  const dbUrl = process.env["DATABASE_URL"];
  if (!dbUrl) throw new Error("DATABASE_URL is required");

  console.log(`Running pg_dump → ${filename}`);
  execSync(`pg_dump "${dbUrl}" -f "${filepath}"`, { stdio: "inherit" });

  const size = statSync(filepath).size;

  const [backup] = await db.insert(backupsTable).values({ filename, size }).returning();
  console.log(`✅ Backup created: ${filename} (${size} bytes, id=${backup.id})`);

  process.exit(0);
}

backup().catch((err) => {
  console.error("Backup failed:", err.message);
  process.exit(1);
});
