# Task: Remove Remaining SMTP References

Read `AGENT.md` fully before starting.

## Current State

Resend is already integrated and working in:
- `lib/mailer/transport.ts` ✅
- `lib/mailer/index.ts` ✅
- `routes/settings/smtp.ts` ✅
- `routes/broadcast.ts` ✅

These files still have SMTP references that need cleaning:
1. `scripts/test-services.ts` — still imports nodemailer, tests SMTP
2. `scripts/seed.ts` — comment mentions SMTP_USER
3. `index.ts` — comment mentions Gmail SMTP (code is fine, just comment)

---

## Fix 1 — Replace SMTP Test with Resend Test in `test-services.ts`

**File:** `artifacts/api-server/src/scripts/test-services.ts`

Remove this import at top:
```typescript
import nodemailer from "nodemailer";
import { resolve4 } from "node:dns/promises";
```

Replace the entire `testSmtp()` function with:

```typescript
// ─── Resend ────────────────────────────────────────────────────────────────────
async function testResend() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`${SKIP} Resend — not configured (RESEND_API_KEY missing)`);
    return;
  }

  console.log(`\n── Resend Email ─────────────────────────`);
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const from  = process.env.RESEND_FROM ?? "SAHU CSC <onboarding@resend.dev>";
    const to    = process.env.SMTP_USER   ?? process.env.ADMIN_EMAIL ?? "";

    if (!to) {
      console.log(`${SKIP} Resend — no recipient (set SMTP_USER or ADMIN_EMAIL)`);
      return;
    }

    const { error } = await resend.emails.send({
      from,
      to: [to],
      subject: "SAHU CSC — Resend integration test",
      text: "Resend is working correctly. This is an automated test from SAHU CSC.",
      html: "<p>✅ Resend is working correctly.</p><p>This is an automated test from <strong>SAHU CSC</strong>.</p>",
    });

    if (error) throw new Error(error.message);
    console.log(`${PASS} Test email sent → ${to}`);
    console.log(`     From: ${from}`);
  } catch (err: any) {
    console.log(`${FAIL} Resend failed: ${err.message}`);
  }
}
```

Also update the `// ─── Run ───` section at the bottom:

Find:
```typescript
await testSmtp();
```
Replace with:
```typescript
await testResend();
```

Also update the header comment at top of file:
Find:
```typescript
 * Service integration test — SMTP · Backblaze B2 · Upstash Redis
```
Replace with:
```typescript
 * Service integration test — Resend · Backblaze B2 · Upstash Redis
```

---

## Fix 2 — Clean Up `seed.ts` Comment

**File:** `artifacts/api-server/src/scripts/seed.ts`

Find:
```typescript
// ADMIN_EMAIL falls back to SMTP_USER (the configured Gmail), then to a generic placeholder.
```
Replace with:
```typescript
// ADMIN_EMAIL — set this in Render env vars to your actual email address.
// Falls back to SMTP_USER (legacy), then a generic placeholder.
```

---

## Fix 3 — Clean Up `index.ts` Comment

**File:** `artifacts/api-server/src/index.ts`

Find the IPv4 comment block at the top:
```typescript
// Force IPv4 for all DNS lookups — Render free tier blocks IPv6 outbound connections.
// Gmail SMTP resolves to an IPv6 address by default, causing ENETUNREACH on Render.
// This must be the very first line before any network code or imports.
```
Replace with:
```typescript
// Force IPv4 for all DNS lookups — Render free tier blocks IPv6 outbound connections.
// Some external services resolve to IPv6 by default, causing ENETUNREACH on Render.
// This must be the very first line before any network code or imports.
```

---

## Fix 4 — Update `monthly-export/email.ts` to Use Resend

**File:** `artifacts/api-server/src/lib/monthly-export/email.ts`

Currently a no-op stub. Update to actually send via Resend:

```typescript
import { logger } from "../logger";
import { isSmtpConfigured, sendMail, getFromEmail } from "../mailer/transport";

/**
 * Monthly receipt export email — sends ZIP download notification via Resend.
 * No-op when RESEND_API_KEY is not configured.
 */
export async function sendMonthlyExportEmail(
  year: number,
  month: number,
  recipientEmail?: string,
): Promise<void> {
  if (!isSmtpConfigured()) {
    logger.info({ year, month }, "Monthly export: email skipped (RESEND_API_KEY not set)");
    return;
  }

  const to = recipientEmail ?? process.env["ADMIN_EMAIL"] ?? process.env["SMTP_USER"];
  if (!to) {
    logger.warn({ year, month }, "Monthly export: no recipient email configured");
    return;
  }

  const monthName = new Date(year, month - 1).toLocaleString("en-IN", { month: "long" });

  try {
    await sendMail({
      to,
      subject: `SAHU CSC — Monthly Export Ready (${monthName} ${year})`,
      text: `Your monthly receipt export for ${monthName} ${year} is ready. Log in to download it from the Admin → Receipts section.`,
      html: `<p>Your monthly receipt export for <strong>${monthName} ${year}</strong> is ready.</p><p>Log in to download it from <strong>Admin → Receipts</strong>.</p>`,
    });
    logger.info({ year, month, to }, "Monthly export email sent");
  } catch (err: any) {
    logger.warn({ err, year, month }, "Monthly export email failed");
  }
}
```

---

## Build and Push

```bash
pnpm --filter @workspace/api-server run build
bash scripts/push.sh "fix: remove SMTP references, update test-services to use Resend"
```

---

## What NOT to Do

- **Do NOT** remove `nodemailer` from `package.json` or `build.mjs` external — may be referenced in types
- **Do NOT** change `lib/mailer/transport.ts` — already correct
- **Do NOT** change `lib/mailer/index.ts` — already correct
- **Do NOT** change `routes/settings/smtp.ts` — already uses Resend
- **Do NOT** delete `SMTP_USER` env var — used as fallback recipient for test emails
