import { execSync } from "child_process";
import { statSync, mkdirSync } from "fs";
import path from "path";
import { db, backupsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const BACKUP_DIR = path.resolve(process.cwd(), "backups");

async function backup() {
  mkdirSync(BACKUP_DIR, { recursive: true });

  const filename = `backup_${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);

  const dbUrl = process.env["DATABASE_URL"];
  if (!dbUrl) throw new Error("DATABASE_URL is required");

  logger.info({ filename }, "Running pg_dump");
  execSync(`pg_dump "${dbUrl}" -f "${filepath}"`, { stdio: "inherit" });

  const size = statSync(filepath).size;

  const [backup] = await db.insert(backupsTable).values({ filename, size }).returning();
  logger.info({ filename, size, id: backup.id }, "Backup created");

  process.exit(0);
}

backup().catch((err) => {
  logger.error({ err: err.message }, "Backup failed");
  process.exit(1);
});
