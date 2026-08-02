# Task: Fix All Issues — Auto-Backup + Email + Env

Read `AGENT.md` fully before starting. This prompt fixes 5 confirmed bugs found
by code analysis. Make ONLY the changes listed — nothing else.

---

## Bug 1 — CRITICAL: Internal Route Double `/api` Prefix

**File:** `artifacts/api-server/src/routes/internal.ts`

**Problem:**
Route defined as `/api/internal/backup` but this router is mounted under
`app.use("/api", router)` in `app.ts`. So actual URL becomes `/api/api/internal/backup`
— UptimeRobot POST returns 404, backup never triggers.

**Fix:** Change the route path — remove the `/api` prefix:

Find:
```typescript
router.post("/api/internal/backup", asyncHandler(async (req, res) => {
```

Replace with:
```typescript
router.post("/internal/backup", asyncHandler(async (req, res) => {
```

Also update the comment at top of file:
Find:
```
 *       URL:    https://<your-render-url>/api/internal/backup
```
Replace with:
```
 *       URL:    https://<your-render-url>/api/internal/backup
 *       (The /api prefix is added by app.use("/api", router) in app.ts)
```

---

## Bug 2 — Time Window Too Narrow + No Dedup Check

**File:** `artifacts/api-server/src/routes/internal.ts`

**Problem:**
30-minute window misses UptimeRobot calls that fire slightly early/late.
No check prevents duplicate backups if UptimeRobot fires twice in same hour.

**Fix:** Replace the schedule check + run section (from `// ── Check schedule` to
end of file before `export default router`) with:

```typescript
  // ── Check schedule ─────────────────────────────────────────────────────────
  const schedule = await getSchedule();
  if (!schedule.enabled) {
    res.json({ skipped: true, reason: "Auto-backup is disabled in settings." });
    return;
  }

  // Convert current time to IST (UTC+5:30)
  const now = new Date();
  const istOffset = 5 * 60 + 30;
  const istDate = new Date(now.getTime() + istOffset * 60_000);
  const istHour = istDate.getUTCHours();
  const istMin  = istDate.getUTCMinutes();
  const istDay  = istDate.getUTCDay(); // 0=Sun

  const [cfgHour, cfgMin] = schedule.time.split(":").map(Number);

  // 55-minute window — safe for hourly UptimeRobot/cron-job.org calls
  const minutesDiff = Math.abs((istHour * 60 + istMin) - (cfgHour * 60 + cfgMin));
  const isCorrectTime = minutesDiff <= 55;

  const isCorrectDay =
    schedule.frequency === "daily" ||
    schedule.days.includes(istDay);

  if (!isCorrectTime || !isCorrectDay) {
    res.json({
      skipped: true,
      reason: `Not scheduled now. Configured: ${schedule.time} IST on days [${schedule.days.join(",")}]. Current IST: ${String(istHour).padStart(2,"0")}:${String(istMin).padStart(2,"0")} day=${istDay}.`,
    });
    return;
  }

  // ── Dedup: skip if backup already ran within last 60 minutes ───────────────
  try {
    const { db: dbInst, backupsTable: bt } = await import("@workspace/db");
    const { desc } = await import("drizzle-orm");
    const [lastBackup] = await dbInst
      .select({ createdAt: bt.createdAt })
      .from(bt)
      .orderBy(desc(bt.createdAt))
      .limit(1);
    if (lastBackup?.createdAt) {
      const lastTime = lastBackup.createdAt instanceof Date
        ? lastBackup.createdAt
        : new Date(lastBackup.createdAt as string);
      const msSinceLast = now.getTime() - lastTime.getTime();
      if (msSinceLast < 60 * 60 * 1000) {
        res.json({
          skipped: true,
          reason: `Backup already ran ${Math.round(msSinceLast / 60_000)} minutes ago. Skipping duplicate.`,
        });
        return;
      }
    }
  } catch {
    // If dedup check fails, proceed with backup anyway
  }

  // ── Run backup ─────────────────────────────────────────────────────────────
  logger.info({ trigger: "external-cron" }, "Internal backup trigger: running backup");
  runScheduledBackup().catch((err: Error) =>
    logger.error({ err }, "Internal backup trigger: backup failed"),
  );
  res.json({ started: true, message: "Backup started. Check notifications for result." });
```

---

## Bug 3 — Auto-Backup Missing B2 Upload

**File:** `artifacts/api-server/src/lib/backup-scheduler.ts`

**Problem:**
`runBackup()` uses `nodeDump()` to create `.sql` on local disk but never uploads
to B2. Render disk is ephemeral — restarts wipe local backups. Manual backup
(`backupCore.ts`) has B2 upload but scheduled backup does not.

**Fix:**

Add imports at top of file (after existing imports):
```typescript
import { createReadStream } from "fs";
import { uploadToB2, isB2Configured } from "./b2";
```

Replace the entire `runBackup()` function:
```typescript
async function runBackup(): Promise<void> {
  try {
    mkdirSync(BACKUP_DIR, { recursive: true });
    const filename = `auto_backup_${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);

    await nodeDump(filepath);
    const size = statSync(filepath).size;

    // Upload to B2 — Render disk is ephemeral, B2 is permanent
    if (isB2Configured()) {
      try {
        await uploadToB2(
          `backups/${filename}`,
          createReadStream(filepath),
          "application/octet-stream",
        );
        logger.info({ filename }, "Auto-backup uploaded to B2");
      } catch (err: any) {
        logger.warn({ err, filename }, "B2 upload failed — backup saved locally only");
      }
    }

    await db.insert(backupsTable).values({ filename, size });
    logger.info({ filename, size }, "Auto-backup created");

    await createNotification(
      "Auto-Backup Created",
      `Scheduled backup "${filename}" (${(size / 1024).toFixed(1)} KB) completed successfully.`,
      "success",
      null as any,
    );
  } catch (err: any) {
    logger.error({ err }, "Auto-backup failed");
    await createNotification(
      "Auto-Backup Failed",
      `Scheduled backup failed: ${err.message}`,
      "error",
      null as any,
    ).catch(() => {});
  }
}
```

---

## Bug 4 — seed.ts ADMIN_EMAIL Missing RESEND Fallback

**File:** `artifacts/api-server/src/scripts/seed.ts`

**Problem:**
`adminEmail` falls back to `process.env.SMTP_USER ?? "admin@example.com"`.
`SMTP_USER` is no longer primary email var — `RESEND_API_KEY` is used now.
Admin account gets seeded with `admin@example.com` placeholder when `SMTP_USER`
is not set on Render.

**Fix:** Find:
```typescript
const adminEmail    = process.env.ADMIN_EMAIL    ?? process.env.SMTP_USER    ?? "admin@example.com";
```
Replace with:
```typescript
const adminEmail    = process.env.ADMIN_EMAIL    ?? process.env.SMTP_USER    ?? process.env.RESEND_FROM?.match(/<([^>]+)>/)?.[1] ?? "admin@example.com";
```

Also find (further down in seed.ts):
```typescript
businessEmail:        process.env.ADMIN_EMAIL      ?? process.env.SMTP_USER        ?? "admin@example.com",
```
Replace with:
```typescript
businessEmail:        process.env.ADMIN_EMAIL      ?? process.env.SMTP_USER        ?? process.env.RESEND_FROM?.match(/<([^>]+)>/)?.[1] ?? "admin@example.com",
```

---

## Bug 5 — startup-init.ts SMTP_USER Fallback

**File:** `artifacts/api-server/src/lib/startup-init.ts`

**Problem:**
`adminEmail` reads `SMTP_USER` as fallback — same issue as seed.ts.

**Fix:** Find:
```typescript
const adminEmail     = process.env["ADMIN_EMAIL"]    ?? process.env["SMTP_USER"]    ?? "admin@example.com";
```
Replace with:
```typescript
const adminEmail     = process.env["ADMIN_EMAIL"]    ?? process.env["SMTP_USER"]    ?? process.env["RESEND_FROM"]?.match(/<([^>]+)>/)?.[1] ?? "admin@example.com";
```

---

## Step — Build and Push

```bash
pnpm --filter @workspace/api-server run build
bash scripts/push.sh "fix: backup scheduler route path, B2 upload, time window, dedup, email fallbacks"
```

---

## Render Environment — Add If Missing

Render Dashboard → `sahu-csc-api` → Environment → check these exist:

| Key | Value |
|---|---|
| `BACKUP_TRIGGER_TOKEN` | Any long random string (min 32 chars) |
| `RESEND_API_KEY` | `re_xxxxxxxxxxxx` from resend.com |
| `RESEND_FROM` | `SAHU CSC <noreply@sahucsc.dpdns.org>` |
| `ADMIN_EMAIL` | `sahuuttam690@gmail.com` |

---

## UptimeRobot Setup (After Redeploy)

Add a new monitor in UptimeRobot:

| Field | Value |
|---|---|
| Monitor Type | `HTTP(s)` |
| Friendly Name | `SAHU CSC Auto Backup` |
| URL | `https://sahu-csc-api-02wn.onrender.com/api/internal/backup` |
| Interval | `60 minutes` |
| HTTP Method | `POST` |
| Custom Header | `x-backup-token: <your BACKUP_TRIGGER_TOKEN value>` |

---

## Verify After Deploy

### Test backup endpoint:
```bash
curl -X POST https://sahu-csc-api-02wn.onrender.com/api/internal/backup \
  -H "x-backup-token: YOUR_TOKEN_HERE"
```

Expected responses:
```json
// Schedule not yet due:
{ "skipped": true, "reason": "Not scheduled now. Configured: 02:00 IST..." }

// Backup triggered:
{ "started": true, "message": "Backup started. Check notifications for result." }

// Wrong token:
{ "error": "Invalid or missing x-backup-token header." }

// Token not set on server:
{ "error": "BACKUP_TRIGGER_TOKEN not configured on this server." }
```

### Test email:
```bash
curl -X POST https://sahu-csc-api-02wn.onrender.com/api/settings/smtp/test \
  -H "Content-Type: application/json" \
  -b "your-session-cookie" \
  -d '{"to":"sahuuttam690@gmail.com"}'
```

---

## What NOT to Do

- **Do NOT** change `backupCore.ts` — manual backup already correct
- **Do NOT** remove `node-cron` from `backup-scheduler.ts` — works in Replit dev
- **Do NOT** use `execSync("pg_dump ...")` — no pg_dump binary on Render
- **Do NOT** change any mailer template files
- **Do NOT** change `mailer/index.ts`
- **Do NOT** change the token auth logic in `internal.ts`
- **Do NOT** add session auth to `/internal/backup` — UptimeRobot has no session
