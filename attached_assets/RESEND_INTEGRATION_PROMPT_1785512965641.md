# Task: Replace Nodemailer SMTP with Resend HTTP API

Read `AGENT.md` fully before starting.

## Why This Change

Render free tier **blocks outbound TCP port 587** (SMTP). Nodemailer cannot connect
to Gmail even with IPv4 forced — the connection times out with `ETIMEDOUT CONN`.

Resend uses **HTTPS port 443** (normal web traffic) — never blocked on any platform.
All existing email templates, function names, and call sites stay exactly the same.
Only `transport.ts` changes.

---

## Current State (do NOT change these files)

- `artifacts/api-server/src/lib/mailer/templates/otp.ts` — keep as-is
- `artifacts/api-server/src/lib/mailer/templates/approval.ts` — keep as-is
- `artifacts/api-server/src/lib/mailer/templates/rejection.ts` — keep as-is
- `artifacts/api-server/src/lib/mailer/templates/adminAlerts.ts` — keep as-is
- `artifacts/api-server/src/lib/mailer/index.ts` — keep as-is
- `artifacts/api-server/src/lib/queue-client.ts` — keep as-is
- All route files that import from `../lib/mailer` — keep as-is

**Only these files change:**
1. `artifacts/api-server/src/lib/mailer/transport.ts` — full replacement
2. `artifacts/api-server/src/routes/settings/smtp.ts` — rename to `email.ts` + update
3. `artifacts/api-server/build.mjs` — add `resend` to external array
4. `render.yaml` — add `RESEND_API_KEY`, remove `SMTP_*` vars
5. `.env.example` — update email section

---

## Step 1 — Install Resend Package

```bash
pnpm --filter @workspace/api-server add resend
```

---

## Step 2 — Replace `transport.ts` (Core Change)

**File:** `artifacts/api-server/src/lib/mailer/transport.ts`

Replace the **entire file** with:

```typescript
/**
 * Email transport — Resend HTTP API.
 *
 * Why Resend instead of Nodemailer SMTP:
 *   Render free tier blocks outbound TCP port 587 (SMTP) entirely.
 *   Resend uses HTTPS port 443 which is always open everywhere.
 *
 * All existing callers (sendOtpEmail, sendApprovalEmail, etc.) continue to work
 * unchanged — only this file changes.
 *
 * Env vars:
 *   RESEND_API_KEY  — from resend.com → API Keys (required for email to work)
 *   RESEND_FROM     — sender address, must be a verified domain or
 *                     onboarding@resend.dev (Resend's free sandbox domain)
 */

import { Resend } from "resend";
import { logger } from "../logger";

// ── Config ────────────────────────────────────────────────────────────────────

const RESEND_API_KEY = process.env["RESEND_API_KEY"];

/**
 * Default from address.
 *
 * IMPORTANT: Until you verify your own domain on resend.com, use:
 *   "SAHU CSC <onboarding@resend.dev>"
 *
 * After verifying your domain (e.g. sahucsc.in), change to:
 *   "SAHU CSC <noreply@sahucsc.in>"
 */
const DEFAULT_FROM = "SAHU CSC <onboarding@resend.dev>";

// ── Client (lazy singleton) ───────────────────────────────────────────────────

let _resend: Resend | null = null;

function getResend(): Resend {
  if (_resend) return _resend;
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  _resend = new Resend(RESEND_API_KEY);
  return _resend;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Returns true when Resend is configured and ready to send emails */
export function isSmtpConfigured(): boolean {
  return !!RESEND_API_KEY;
}

/** Returns the configured From address */
export function getFromEmail(): string {
  return process.env["RESEND_FROM"] ?? process.env["SMTP_FROM_EMAIL"] ?? DEFAULT_FROM;
}

/**
 * Send an email via Resend.
 * Matches the nodemailer sendMail() call signature used by all templates.
 */
export async function sendMail(opts: {
  from?: string;
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const resend = getResend();
  const from = opts.from ?? getFromEmail();
  const to = Array.isArray(opts.to) ? opts.to : [opts.to];

  const { error } = await resend.emails.send({
    from,
    to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

/**
 * Compatibility shim — templates call createTransporter().sendMail(opts).
 * Returns an object with a sendMail method that delegates to Resend.
 */
export function createTransporter() {
  return {
    sendMail: async (opts: {
      from?: string;
      to: string | string[];
      subject: string;
      html: string;
      text: string;
    }) => sendMail(opts),

    /** Verify — used by the SMTP test endpoint. With Resend, just check API key. */
    verify: async () => {
      if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
      // Resend has no verify endpoint — key presence is sufficient
      return true;
    },
  };
}

/** Alias — same as createTransporter() */
export function getTransporter() {
  return createTransporter();
}

// ── HTML builder (unchanged from original) ────────────────────────────────────

/** HTML-escape a string for safe inline use */
export function esc(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Shared V2 email shell — dark navy brand wrapper */
export function buildV2Html(opts: {
  title: string;
  icon: string;
  subtitle: string;
  accentColor: string;
  accentText: string;
  accentDark: string;
  bodyHtml: string;
}): string {
  const { title, icon, subtitle, accentColor, accentText, accentDark, bodyHtml } = opts;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a1628;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a1628;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td bgcolor="#0f2044" style="background-color:#0f2044;border-radius:16px 16px 0 0;padding:28px 32px 24px;text-align:center;border-bottom:2px solid ${accentColor};">
              <p style="margin:0 0 4px;font-size:28px;">${icon}</p>
              <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">SAHU CSC</h1>
              <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:0.12em;color:${accentText};text-transform:uppercase;">${esc(subtitle)}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td bgcolor="#132040" style="background-color:#132040;padding:32px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#0f2044" style="background-color:#0f2044;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);">
              <p style="margin:0 0 4px;font-size:12px;color:#64748b;">SAHU CSC · Common Service Center · Odisha, India</p>
              <p style="margin:0;font-size:11px;color:#475569;">This is an automated message. Please do not reply.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
```

---

## Step 3 — Update Email Settings Route

**File:** `artifacts/api-server/src/routes/settings/smtp.ts`

Replace the **entire file** with:

```typescript
import { Router, type IRouter } from "express";
import { requireRole } from "../../lib/auth";
import { asyncHandler } from "../../lib/async-handler";
import { isSmtpConfigured, getFromEmail, sendMail } from "../../lib/mailer/transport";

const router: IRouter = Router();

// GET /api/settings/smtp — returns current email config status
router.get("/settings/smtp", requireRole("admin"), asyncHandler(async (_req, res) => {
  res.json({
    configured: isSmtpConfigured(),
    provider: "resend",
    fromEmail: getFromEmail(),
    apiKeySaved: !!process.env["RESEND_API_KEY"],
  });
}));

router.patch("/settings/smtp", requireRole("admin"), asyncHandler(async (_req, res) => {
  res.status(501).json({ error: "Email is configured via environment variables, not the API." });
}));

// POST /api/settings/smtp/test — send a test email
router.post("/settings/smtp/test", requireRole("admin"), asyncHandler(async (req, res) => {
  if (!isSmtpConfigured()) {
    res.status(400).json({
      error: "Resend is not configured. Add RESEND_API_KEY to your environment variables.",
    });
    return;
  }

  const to: string = (req.body?.to as string) || process.env["SMTP_USER"] || "";
  if (!to) {
    res.status(400).json({ error: "No recipient email found. Pass { to: 'email@example.com' } in request body." });
    return;
  }

  try {
    await sendMail({
      to,
      subject: "SAHU CSC — Email test ✅",
      text: "This is a test email from your SAHU CSC installation. Resend is working correctly.",
      html: "<p>This is a test email from your <strong>SAHU CSC</strong> installation.</p><p>✅ Resend is working correctly.</p>",
    });
    res.json({ ok: true, message: `Test email sent to ${to}` });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message ?? "Email test failed" });
  }
}));

export default router;
```

---

## Step 4 — Add `resend` to `build.mjs` External Array

**File:** `artifacts/api-server/build.mjs`

Find the `external: [...]` array and add `"resend"` to it:

```javascript
"resend",
```

Add it near `"nodemailer"` (keep nodemailer in the list too — it may still be referenced in types).

---

## Step 5 — Remove Nodemailer from `index.ts`

**File:** `artifacts/api-server/src/index.ts`

Check if these two lines exist at the very top (they were added for IPv4 SMTP fix):

```typescript
import { setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first");
```

**Keep them** — they don't hurt and may help other network calls (geoip, etc).

---

## Step 6 — Update `render.yaml`

**File:** `render.yaml`

Find the SMTP env vars section and replace:

```yaml
# ── Email (Nodemailer SMTP — REMOVE THESE) ────────────────────────────────────
# - key: SMTP_HOST
#   value: smtp.gmail.com
# - key: SMTP_PORT
#   value: "587"
# - key: SMTP_USER
#   sync: false
# - key: SMTP_PASS
#   sync: false
# - key: SMTP_FROM_EMAIL
#   sync: false
```

With:

```yaml
      # ── Email (Resend HTTP API) ────────────────────────────────────────────
      # resend.com → API Keys → Create API Key → copy and paste here
      - key: RESEND_API_KEY
        sync: false         # re_xxxxxxxxxxxxxxxxxxxx

      # From address — use onboarding@resend.dev until you verify your domain
      - key: RESEND_FROM
        value: "SAHU CSC <onboarding@resend.dev>"
```

> Note: Keep `SMTP_USER` if it's used anywhere as a fallback recipient for test emails.
> Just comment it out for now:
> ```yaml
>       # - key: SMTP_USER
>       #   sync: false   # kept as fallback test-email recipient
> ```

---

## Step 7 — Update `.env.example`

Find the SMTP section and replace with:

```bash
# ── Email (Resend HTTP API) ─────────────────────────────────────────────────
# Resend uses HTTPS port 443 — works on Render free tier (SMTP port 587 is blocked).
# Sign up free at resend.com — no credit card, 3,000 emails/month.
#
# Step 1: resend.com → Sign Up → API Keys → Create API Key → paste below
# Step 2: Use onboarding@resend.dev as RESEND_FROM until you verify your domain
#
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM=SAHU CSC <onboarding@resend.dev>

# Legacy SMTP vars — no longer used for sending, kept only as config reference
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=sahuuttam690@gmail.com
# SMTP_PASS=xxxx-xxxx-xxxx-xxxx
```

---

## Step 8 — Add `RESEND_API_KEY` to Render Dashboard

**Do NOT forget:** After pushing code to GitHub and Render redeploys:

1. Render Dashboard → `sahu-csc-api` → **Environment**
2. Add:
   ```
   RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxxxx   ← your actual key from resend.com
   RESEND_FROM    = SAHU CSC <onboarding@resend.dev>
   ```
3. Save → service redeploys automatically

---

## Step 9 — Build & Push

```bash
# Verify build succeeds
pnpm --filter @workspace/api-server run build

# Push to GitHub → triggers Render auto-deploy
bash scripts/push.sh "fix: replace nodemailer SMTP with Resend HTTP API"
```

---

## Step 10 — Test After Deploy

Once Render redeploys, test via browser or Postman:

```
POST https://sahu-csc-api-02wn.onrender.com/api/settings/smtp/test
Authorization: (admin session cookie)
Content-Type: application/json
Body: { "to": "sahuuttam690@gmail.com" }
```

Expected response:
```json
{ "ok": true, "message": "Test email sent to sahuuttam690@gmail.com" }
```

Then test the actual 2FA flow:
- Login → Email OTP → check Gmail inbox
- OTP email should arrive within 5-10 seconds ✅

---

## Verification Checklist

- [ ] `pnpm --filter @workspace/api-server run build` — no TypeScript errors
- [ ] `isSmtpConfigured()` returns `true` when `RESEND_API_KEY` is set
- [ ] SMTP test endpoint returns `{ ok: true }`
- [ ] 2FA login → Email OTP arrives in Gmail
- [ ] Registration → Admin gets notification email
- [ ] Account approval → User gets approval email
- [ ] Password reset OTP email works

---

## What NOT to Do

- **Do NOT** change any template files (`otp.ts`, `approval.ts`, `rejection.ts`, `adminAlerts.ts`)
- **Do NOT** change `mailer/index.ts` — all exports stay the same
- **Do NOT** change any route files — they import `isSmtpConfigured` and `sendOtpEmail` unchanged
- **Do NOT** change `queue-client.ts` — it uses `buildOtpMailOptions` unchanged
- **Do NOT** remove `buildV2Html`, `esc`, `getFromEmail` from `transport.ts` — templates import them
- **Do NOT** use `from: "onboarding@resend.dev"` without the `SAHU CSC <>` wrapper — Resend requires proper format
- **Do NOT** set `RESEND_FROM` to a Gmail address until you verify that domain on Resend dashboard
- **Do NOT** remove nodemailer from `package.json` — it may still be referenced in type imports
