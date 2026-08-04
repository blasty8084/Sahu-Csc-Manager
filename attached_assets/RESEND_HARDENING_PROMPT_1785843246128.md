# Replit Agent 4 Prompt — Harden the Resend Email Sender

## Overview
Fix three real issues in the Resend email system without changing the current
`RESEND_API_KEY` / `RESEND_FROM` env vars or the overall "send directly, no
queue" architecture. From address stays `"SAHU CSC" <info@sahucsc.dpdns.org>`.

Do these in order. After each numbered section, run `pnpm --filter
@workspace/api-server run typecheck` before moving to the next.

---

## 1. Fix `routes/broadcast.ts` — throttle sends + track real failures

**Problem:** `POST /api/admin/broadcast/email` fires every recipient send at
once via `Promise.all`. Resend's default limit is 10 requests/sec per team,
so any broadcast to more than ~10 users starts hitting 429s. The send helper
it calls also swallows errors internally, so the route always reports 100%
success and hardcodes `failedCount: 0` in the DB regardless of what actually
happened.

**Fix:** Replace the `Promise.all` block in `POST /admin/broadcast/email`
(around line 212–217) with the batch-and-tracked version below.

In `artifacts/api-server/src/lib/mailer/index.ts`, change the signature of
`sendBroadcastEmail` so it returns whether the send succeeded instead of
silently swallowing the error:

```typescript
export async function sendBroadcastEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<boolean> {
  if (!isSmtpConfigured()) return false;
  try {
    const transporter = getTransporter();
    await transporter.sendMail({ to, subject, html, text });
    return true;
  } catch (err) {
    logger.warn({ err, to, subject }, "Broadcast email send failed");
    return false;
  }
}
```

In `artifacts/api-server/src/routes/broadcast.ts`, replace the send block:

```typescript
// Send with concurrency + rate limiting — Resend allows 10 req/sec per team.
// Chunk into batches of 8 with a 1.1s gap between batches to stay under the limit.
const CHUNK_SIZE = 8;
const CHUNK_DELAY_MS = 1100;

let sent = 0;
let failed = 0;

for (let i = 0; i < withEmail.length; i += CHUNK_SIZE) {
  const chunk = withEmail.slice(i, i + CHUNK_SIZE);
  const results = await Promise.allSettled(
    chunk.map((u) => sendBroadcastEmail(u.email!, subject, bodyHtml, bodyText)),
  );
  for (const r of results) {
    if (r.status === "fulfilled" && r.value === true) sent++;
    else failed++;
  }
  if (i + CHUNK_SIZE < withEmail.length) {
    await new Promise((resolve) => setTimeout(resolve, CHUNK_DELAY_MS));
  }
}
```

Then update the response and DB insert further down to use the real counts:

```typescript
await db.insert(broadcastLogsTable).values({
  sentBy: adminId,
  channel: "email",
  subject,
  body,
  recipientFilter,
  recipientCount: sent,
  failedCount: failed,
});

logger.info({ adminId, subject, sent, failed }, "admin broadcast email sent");
res.json({
  success: true,
  sent,
  failed,
  message: failed > 0
    ? `Sent to ${sent} recipient(s), ${failed} failed`
    : `Email sent to ${sent} recipient(s)`,
});
```

**Also:** the object-style `sendBroadcastEmail` in
`artifacts/api-server/src/lib/mailer/templates/adminAlerts.ts` is a
different, unused function with the same name (it takes `{ subject, body,
recipients }` and already does `Promise.allSettled` + counting correctly).
Delete that duplicate entirely and its dangling export — it is not imported
anywhere and having two functions with the same name in the same module
graph is confusing and error-prone. Confirm with `grep -rn
"sendBroadcastEmail" artifacts/api-server/src` that only the
`mailer/index.ts` version remains after the change.

---

## 2. Remove the orphaned SMTP email worker

**Problem:** `artifacts/worker-server/src/workers/email.worker.ts` still
sends mail via Nodemailer/SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASS`) and listens on a BullMQ `"emails"` queue. Nothing feeds that
queue anymore — `enqueueEmail()` in
`artifacts/api-server/src/lib/queue-client.ts` is a no-op stub left over
from the Resend migration. The worker is dead code today, and a landmine
later: if anyone reconnects the queue to "fix" async email sending, mail
will silently route back through the exact broken SMTP setup (Render blocks
port 587) that caused the migration to Resend in the first place. BUGS.md
already documents 3 past incidents of emails silently failing from this
kind of leftover/mismatched code (#28, #29, #30) — treat this the same way.

**Fix — delete, do not repurpose:**

1. Delete `artifacts/worker-server/src/workers/email.worker.ts`.
2. In `artifacts/worker-server/src/queues/index.ts`, remove the `emailQueue`
   export and its `EmailJobData` import.
3. In `artifacts/worker-server/src/queues/types.ts`, remove the
   `EmailJobData` interface (keep `PushPayload`, `NotificationJobData`,
   `PdfJobData`, `SmsJobData` untouched).
4. In `artifacts/worker-server/src/index.ts`:
   - Remove the `import { emailWorker } from "./workers/email.worker"` line.
   - Remove `emailWorker` from the `workers:` array in the health-check
     JSON response.
   - Remove `emailWorker.name` from the startup log.
   - Remove `emailWorker.close()` from the `shutdown()` function.
   - Update the top-of-file doc comment to drop the `emails` bullet point.
5. In `artifacts/api-server/src/lib/queue-client.ts`, remove the
   `enqueueEmail()` stub function and the `EmailJobData` interface — grep
   for `enqueueEmail` across `artifacts/api-server/src` first and confirm
   there are no remaining call sites (there shouldn't be; emails are sent
   directly via the `mailer` helpers everywhere already).
6. Check `nodemailer` and `@types/nodemailer` in
   `artifacts/worker-server/package.json` — if nothing else in
   worker-server uses them after this change, remove those dependencies too.

Do **not** delete `notificationWorker`, `pdfWorker`, or `smsWorker` — only
the email worker/queue is being removed.

---

## 3. Validate `RESEND_FROM` at startup, not just `RESEND_API_KEY`

**Problem:** `isSmtpConfigured()` in
`artifacts/api-server/src/lib/mailer/transport.ts` only checks that
`RESEND_API_KEY` is set. If `RESEND_FROM` is ever missing in some
environment, every send silently falls back to
`DEFAULT_FROM = "SAHU CSC <onboarding@resend.dev>"`. Resend's sandbox
address `onboarding@resend.dev` can only deliver to the Resend account
owner's own verified email — it 403s on every real user. Right now the app
would think email is "configured" and fail on every actual send with no
clear signal why.

**Fix:** In `artifacts/api-server/src/lib/env.ts`, add a check alongside
the existing `RESEND_API_KEY` warning that also flags a missing or
sandbox-pointing `RESEND_FROM`:

```typescript
// After the existing REQUIRED/RECOMMENDED checks:
const resendKey = process.env["RESEND_API_KEY"];
const resendFrom = process.env["RESEND_FROM"];

if (resendKey && (!resendFrom || resendFrom.includes("onboarding@resend.dev"))) {
  console.warn(
    [
      "",
      "⚠️  RESEND_API_KEY is set but RESEND_FROM is missing or still points",
      "    at the Resend sandbox address (onboarding@resend.dev).",
      "    Sandbox mode can only deliver to your own Resend account email —",
      "    every real send will fail with a 403 until RESEND_FROM is set to",
      '    a verified domain address, e.g. "SAHU CSC <info@sahucsc.dpdns.org>".',
      "",
    ].join("\n"),
  );
}
```

Do not make this a hard `process.exit(1)` — keep it a warning, since some
environments (local dev, PR previews) may intentionally run without email
configured at all, same as the existing `RESEND_API_KEY` recommendation.

---

## 4. Verification checklist

After all changes:

1. `pnpm --filter @workspace/api-server run typecheck` — no errors.
2. `pnpm --filter @workspace/worker-server run typecheck` — no errors.
3. `grep -rn "sendBroadcastEmail" artifacts/api-server/src` — only one
   definition (in `mailer/index.ts`) and one call site (in
   `routes/broadcast.ts`).
4. `grep -rn "enqueueEmail\|email.worker\|emailQueue\|EmailJobData"
   artifacts/` — no remaining references anywhere.
5. Manually trigger `POST /api/admin/broadcast/email` against a test list
   of 15+ recipient emails (or temporarily lower `CHUNK_SIZE` to 2 to
   simulate the same effect with fewer users) and confirm:
   - No 429 errors in logs.
   - The response `sent` + `failed` counts add up to the total recipient
     count.
   - `broadcastLogsTable.failedCount` reflects a real number, not always 0.
6. Confirm `worker-server` still starts cleanly and its health endpoint
   (`GET :8081/`) lists `notifications`, `pdf-generation`, `sms` but no
   longer lists `emails`.
7. Restart `api-server` locally with `RESEND_FROM` temporarily unset and
   confirm the new startup warning from step 3 appears in the logs.

Do not touch `lib/mailer/templates/otp.ts`, `approval.ts`, `rejection.ts`,
or the OTP send routes — their error handling is already correct and out of
scope for this prompt.
