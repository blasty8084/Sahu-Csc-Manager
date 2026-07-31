# Task: Verify & Fix — SMTP IPv4 + Full Infrastructure Check
## Replit (Dev) + Render (Backend) + Vercel (Frontend)

Read `AGENT.md` fully before starting. This prompt has ONE confirmed bug to fix
and a full verification checklist to ensure everything works on all three platforms.

---

## Current State (read carefully — do NOT redo working things)

✅ Already working — do NOT touch:
- `artifacts/api-server/src/lib/b2.ts` — B2 storage full implementation
- `artifacts/api-server/src/lib/cache/backend.ts` — Redis/memory auto-select
- `artifacts/api-server/src/lib/cache/redisBackend.ts` — Upstash Redis backend
- `artifacts/api-server/src/lib/mailer/transport.ts` — Nodemailer with timeouts
- `artifacts/api-server/src/app.ts` — CORS, sessions, rate limiters with RedisStore
- `artifacts/sahu-csc/vercel.json` — rewrites to `sahu-csc-api-02wn.onrender.com`
- `render.yaml` — full Render Blueprint with all env vars
- `render-build.sh` — pnpm install + schema push + esbuild build
- `scripts/git-init.sh` + `scripts/push.sh` — GitHub push helpers
- `artifacts/api-server/src/lib/startup-init.ts` — auto seeds admin/operator on first boot

⚠️ Confirmed bug (THIS is the only code change needed):
- `artifacts/api-server/src/index.ts` — DNS IPv4 fix must be the absolute first line

---

## Fix 1 — SMTP IPv4 (CRITICAL — This Is Why OTP Email Fails on Render)

**Root cause:** Render free tier blocks outbound IPv6. Gmail SMTP (`smtp.gmail.com`)
resolves to IPv6 by default → `connect ENETUNREACH 2404:6800:4003:c1a::6c:587` →
`Failed to enqueue 2FA login OTP email`.

**Fix:** `dns.setDefaultResultOrder("ipv4first")` must run before ANY import —
including before `import "./lib/env"`.

**File:** `artifacts/api-server/src/index.ts`

Open the file and check if the very first lines look like this:

```typescript
// Force IPv4 for all DNS lookups — Render free tier blocks IPv6 outbound connections.
// Gmail SMTP resolves to an IPv6 address by default, causing ENETUNREACH on Render.
// This must be the very first line before any network code or imports.
import { setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first");

import "./lib/env";
```

**If these lines are already present and correct → skip to Fix 2.**

**If they are missing or in the wrong position** (e.g. after other imports) → replace
the top of the file so those 5 lines are literally first, before everything else.

> ⚠️ ESM note: In Node.js ESM, `import` statements are hoisted but top-level
> statements like `setDefaultResultOrder("ipv4first")` run before subsequent
> imports are evaluated. This is the correct and safe pattern.

---

## Fix 2 — Verify transport.ts Has `requireTLS: true`

**File:** `artifacts/api-server/src/lib/mailer/transport.ts`

Verify `nodemailer.createTransport({...})` has these fields — add any that are missing:

```typescript
_transporter = nodemailer.createTransport({
  host: process.env["SMTP_HOST"]!,
  port: Number(process.env["SMTP_PORT"] ?? 587),
  secure: false,
  requireTLS: true,          // ← must be present — forces STARTTLS upgrade
  connectionTimeout: 15_000,
  greetingTimeout: 15_000,
  socketTimeout: 30_000,
  auth: {
    user: process.env["SMTP_USER"]!,
    pass: (process.env["SMTP_PASSWORD"] ?? process.env["SMTP_PASS"])!,
  },
});
```

If all fields already exist → no change needed.

---

## Fix 3 — Add SMTP Test Endpoint (For Easy Verification)

**File:** `artifacts/api-server/src/routes/settings/index.ts`
(or wherever the settings routes are registered)

Check if `POST /api/settings/smtp/test` route already exists. If it does → skip.

If it does NOT exist → find the settings router file and add:

```typescript
import { isSmtpConfigured, getTransporter, getFromEmail } from "../../lib/mailer/transport";

// POST /api/settings/smtp/test — send a test email to verify SMTP config
router.post("/smtp/test", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  if (!isSmtpConfigured()) {
    res.status(400).json({ error: "SMTP not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS." });
    return;
  }
  try {
    await getTransporter().sendMail({
      from: getFromEmail(),
      to: process.env["SMTP_USER"]!,
      subject: "SAHU CSC — SMTP Test",
      text: "SMTP is working correctly on Render.",
      html: "<p>✅ SMTP is working correctly on Render.</p>",
    });
    res.json({ success: true, message: "Test email sent to " + process.env["SMTP_USER"] });
  } catch (err: any) {
    res.status(500).json({ error: "SMTP test failed: " + err.message });
  }
}));
```

---

## Fix 4 — Verify Session Cookie Config

**File:** `artifacts/api-server/src/app.ts`

Find the `session({...})` call. Verify the cookie block looks exactly like this:

```typescript
cookie: {
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  // "none" required for cross-origin cookies (Vercel frontend → Render API)
  // "lax" in dev (Replit same-origin via Vite proxy — no cross-origin)
},
```

If `sameSite` is `"strict"` → change to the ternary above.
If already correct → no change needed.

---

## Fix 5 — Verify CORS Does NOT Throw in Dev (Replit)

**File:** `artifacts/api-server/src/app.ts`

Find the CORS `origin` callback. Verify that when `NODE_ENV !== "production"`,
it does NOT throw even if `CORS_ORIGIN` is not set.

The logic should be:

```typescript
origin(origin, callback) {
  // Allow server-to-server / Postman / health checks
  if (!origin) return callback(null, true);

  const origins: string[] = [];

  // Replit dev domains — always allowed in dev
  if (process.env["REPLIT_DOMAINS"]) {
    origins.push(...process.env["REPLIT_DOMAINS"].split(",").map(d => `https://${d.trim()}`));
  }
  if (process.env["REPLIT_DEV_DOMAIN"]) {
    origins.push(`https://${process.env["REPLIT_DEV_DOMAIN"]}`);
  }

  // Explicit CORS_ORIGIN (Vercel URL on Render)
  if (process.env["CORS_ORIGIN"]) {
    origins.push(...process.env["CORS_ORIGIN"].split(",").map(o => o.trim()).filter(Boolean));
  }

  if (origins.includes(origin)) return callback(null, true);

  // Production: reject unknown origins
  if (process.env.NODE_ENV === "production") {
    return callback(new Error(`CORS: origin '${origin}' not allowed`));
  }

  // Dev: allow all origins (Replit preview, localhost)
  return callback(null, true);
},
```

If already correct → no change needed.

---

## Fix 6 — Verify `render-build.sh` Is Executable

Run in Replit Shell:

```bash
chmod +x render-build.sh
git add render-build.sh
```

Check `.gitattributes` exists at root. If not, create it:

```
render-build.sh text eol=lf
scripts/*.sh text eol=lf
```

This prevents Windows line-ending issues from breaking the build script on Render.

---

## Fix 7 — Add `--dns-result-order=ipv4first` Node Flag as Backup

In `render.yaml`, update `startCommand` to also pass the Node flag:

```yaml
startCommand: node --dns-result-order=ipv4first --enable-source-maps artifacts/api-server/dist/index.mjs
```

This is a belt-and-suspenders backup for the `dns.setDefaultResultOrder()` call in
`index.ts`. Both together guarantee IPv4 on Render.

---

## Fix 8 — Verify `.nvmrc` Specifies Node 20

Check `.nvmrc` at project root contains exactly:

```
20
```

If it says `22` or higher → change back to `20` (Render free tier ships Node 20 by default;
`NODE_VERSION=22.14.0` env var in Render Dashboard already handles the upgrade).

---

## Fix 9 — Verify Vercel Build Settings Are Correct

Check `artifacts/sahu-csc/vercel.json` has the correct Render URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://sahu-csc-api-02wn.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

If the destination URL is different from `sahu-csc-api-02wn.onrender.com` → update it.
If already correct → no change.

---

## Fix 10 — Add Replit Dev Health Check Script

Create `scripts/health-check.sh`:

```bash
#!/usr/bin/env bash
# Quick health check for all three environments.
# Run from Replit Shell: bash scripts/health-check.sh

echo ""
echo "🔍 Checking SAHU CSC endpoints..."
echo ""

# Render API
echo "1. Render API (backend):"
curl -s -o /dev/null -w "   Status: %{http_code}  Time: %{time_total}s\n" \
  https://sahu-csc-api-02wn.onrender.com/api/health || echo "   ❌ Failed"

# Vercel Frontend
echo "2. Vercel Frontend:"
curl -s -o /dev/null -w "   Status: %{http_code}  Time: %{time_total}s\n" \
  https://sahu-csc-manager-sahu-csc.vercel.app || echo "   ❌ Failed"

# Vercel → Render API (via rewrite)
echo "3. Vercel → Render API proxy:"
curl -s -o /dev/null -w "   Status: %{http_code}  Time: %{time_total}s\n" \
  https://sahu-csc-manager-sahu-csc.vercel.app/api/health || echo "   ❌ Failed"

echo ""
echo "✅ All 200 = everything working!"
echo "⏰ Note: Render free tier cold-start = 30-60s. If timeout, wait and retry."
```

```bash
chmod +x scripts/health-check.sh
```

---

## Final Step — Push to GitHub

After all fixes are verified, run:

```bash
bash scripts/push.sh "fix: force IPv4 DNS for Render SMTP + infrastructure verification"
```

Render will auto-redeploy. Watch logs for:
```
Server listening on port 10000
==> Your service is live 🎉
```

Then test SMTP by logging in → 2FA → Email OTP → check if email arrives.

---

## Verification Checklist

Run after Render redeploys:

### Render (Backend)
- [ ] `https://sahu-csc-api-02wn.onrender.com/api/health` → `{"status":"ok"}`
- [ ] Login with admin → 2FA → Email OTP → email arrives in Gmail
- [ ] Login with admin → 2FA → Authenticator App → TOTP works

### Vercel (Frontend)
- [ ] `https://sahu-csc-manager-sahu-csc.vercel.app` → app loads
- [ ] Login page → enter credentials → 2FA screen appears
- [ ] `/api/health` via Vercel proxy → `{"status":"ok"}`

### Replit (Dev)
- [ ] Start API workflow → no startup errors
- [ ] Vite frontend loads on port 5000
- [ ] Login works in Replit preview

---

## What NOT to Do

- **Do NOT** move `setDefaultResultOrder("ipv4first")` after any other import
- **Do NOT** change `sameSite` to `"strict"` — breaks Vercel → Render cookies
- **Do NOT** change `secure: false` in nodemailer — port 587 uses STARTTLS not SSL
- **Do NOT** change `requireTLS: true` to `false` — Gmail requires TLS upgrade
- **Do NOT** set `NODE_ENV=development` on Render — cookie security breaks
- **Do NOT** hardcode Gmail password in code — always read from `SMTP_PASS` env var
- **Do NOT** re-run `drizzle-kit push --force` without re-seeding — wipes user data
