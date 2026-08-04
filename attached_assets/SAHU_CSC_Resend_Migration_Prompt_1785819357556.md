# Replit Agent 4 Prompt — Remove SMTP, Use Resend for All Emails

## Overview
Remove all SMTP/Nodemailer code completely and replace with Resend API.
Use `RESEND_API_KEY` and `RESEND_FROM` environment variables (already set in Render).
Send emails directly — do not use BullMQ queue for email delivery.

---

## Render Environment Variables (Already Set)

| Key | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API authentication |
| `RESEND_FROM` | From address (e.g. `SAHU CSC Manager <noreply@sahucsc.dpdns.org>`) |

Remove these from Render after migration:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`

---

## 1. Install / Remove Packages

```bash
pnpm --filter @workspace/api-server add resend
pnpm --filter @workspace/api-server remove nodemailer
pnpm --filter @workspace/api-server remove -D @types/nodemailer
```

---

## 2. Replace transport.ts Completely

Replace `artifacts/api-server/src/lib/mailer/transport.ts` with:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export function isSmtpConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

export function getFromEmail(): string {
  return process.env.RESEND_FROM ?? 'SAHU CSC <noreply@sahucsc.dpdns.org>';
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not set in environment');
  }
  const { error } = await resend.emails.send({
    from: getFromEmail(),
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
```

Keep `esc()` and `buildV2Html()` helper functions in transport.ts —
they are used by all email templates.

---

## 3. Remove Queue — Send Emails Directly

In `otp.ts` and all other email routes, replace `enqueueEmail()` with
direct `sendMail()`:

```typescript
// REMOVE:
import { enqueueEmail } from "../../lib/queue-client";
await enqueueEmail(buildOtpMailOptions(...));

// REPLACE WITH:
import { sendMail, getFromEmail } from "../../lib/mailer/transport";
await sendMail({
  to: resolvedEmail,
  subject: 'Your OTP Code — SAHU CSC',
  html: buildOtpHtml(otp),
});
```

---

## 4. Update All Email Template Files

Files to update:
- `lib/mailer/templates/otp.ts`
- `lib/mailer/templates/adminAlerts.ts`
- `lib/mailer/templates/approval.ts`
- `lib/mailer/templates/rejection.ts`
- `lib/monthly-export/email.ts`

For each file:
- Remove `nodemailer.createTransporter()` calls
- Remove `createTransporter().sendMail()` calls
- Replace with `sendMail()` from `../transport`
- Keep all existing HTML template content unchanged

---

## 5. Update isSmtpConfigured() Error Messages

Find all `isSmtpConfigured()` checks in routes and update error message:

```typescript
if (!isSmtpConfigured()) {
  return res.status(503).json({
    error: 'Email service not configured. Set RESEND_API_KEY in environment.',
  });
}
```

---

## 6. Update .env.example

Remove all SMTP_* lines, replace with:

```env
# ─── Email — Resend (resend.com) ───────────────────────────────
# Get API key from resend.com → API Keys
RESEND_API_KEY=re_xxxxxxxxxx

# From address — must match verified domain in Resend
RESEND_FROM=SAHU CSC Manager <noreply@sahucsc.dpdns.org>
```

---

## 7. Add Startup Check

In `artifacts/api-server/src/index.ts`:

```typescript
if (!process.env.RESEND_API_KEY) {
  console.error('[EMAIL] RESEND_API_KEY not set — all emails will fail');
} else {
  console.log('[EMAIL] Resend email service configured');
}
```

---

## 8. Remove From All Files

Search and remove all references to:
```
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_PASSWORD
SMTP_FROM_EMAIL
nodemailer.createTransport
createTransporter()
enqueueEmail (for email only — keep for other queue jobs if any)
```

---

## 9. Test After Implementation

In Render Shell:

```bash
node -e "
const { Resend } = require('resend');
const r = new Resend(process.env.RESEND_API_KEY);
r.emails.send({
  from: process.env.RESEND_FROM,
  to: 'sahuuttam690@gmail.com',
  subject: 'Test — SAHU CSC Resend',
  html: '<p>Resend working! Email delivery confirmed.</p>'
}).then(d => console.log('SUCCESS:', d)).catch(e => console.error('FAIL:', e));
"
```

Expected output:
```
SUCCESS: { id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' }
```

---

## 10. Verify OTP Flow

1. Go to `https://sahu-csc.vercel.app`
2. Click "Forgot Password"
3. Enter email address
4. Click "Send OTP"
5. Check inbox — OTP email should arrive within 5 seconds
6. From address should show: `SAHU CSC Manager <noreply@sahucsc.dpdns.org>`

---

## Do Not Change

- Any HTML email template content or design (V2 dark premium style)
- Any OTP generation or verification logic
- Any database schema or migrations
- Any frontend code or UI
- Any existing API response shapes
- `buildV2Html()` helper function in transport.ts

---

## Files Modified Summary

| File | Change |
|---|---|
| `lib/mailer/transport.ts` | Complete rewrite — Resend instead of nodemailer |
| `lib/mailer/templates/otp.ts` | Use sendMail() |
| `lib/mailer/templates/adminAlerts.ts` | Use sendMail() |
| `lib/mailer/templates/approval.ts` | Use sendMail() |
| `lib/mailer/templates/rejection.ts` | Use sendMail() |
| `lib/monthly-export/email.ts` | Use sendMail() |
| `routes/auth/otp.ts` | Direct send, remove enqueueEmail |
| `routes/auth/2fa-otp.ts` | Direct send, remove enqueueEmail |
| `src/index.ts` | Add startup RESEND_API_KEY check |
| `.env.example` | Remove SMTP_*, add RESEND_* |

---

*SAHU CSC Manager | blasty8084 | August 2026*
