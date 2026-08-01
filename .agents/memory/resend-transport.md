---
name: Resend email transport
description: Nodemailer SMTP replaced with Resend HTTP API in transport.ts — why and how.
---

# Resend Email Transport

## Rule
Use Resend (HTTPS port 443) instead of Nodemailer SMTP (port 587). Render free tier blocks port 587.

**Why:** SMTP ETIMEDOUT on Render free tier. Resend uses port 443, always open.

**How to apply:** Only `transport.ts` ever changes for email transport. All 4 templates (`otp.ts`, `approval.ts`, `rejection.ts`, `adminAlerts.ts`), `mailer/index.ts`, and all route files stay untouched — they call `createTransporter().sendMail()` which is a sync shim in the new transport.

## Key details
- `RESEND_API_KEY` secret → required for emails to send
- `RESEND_FROM` env var → from address; use `SAHU CSC <info@sahucsc.dpdns.org>` (verified domain). **Never use `noreply@`** — Gmail bounces emails from `noreply@` on free dynamic-DNS domains (`dpdns.org`); Resend returns 200 (accepted) but Gmail silently bounces with "blocked due to content". Confirmed Aug 1, 2026.
- `isSmtpConfigured()` now checks `RESEND_API_KEY` (not SMTP_* vars)
- `createTransporter()` and `getTransporter()` are now **synchronous** (not async) — shims returning `{ sendMail, verify }`
- `resend` added to `external` array in `build.mjs` (near `nodemailer`)
- `render.yaml` SMTP section replaced with `RESEND_API_KEY` + `RESEND_FROM`
- Test endpoint: `POST /api/settings/smtp/test` with `{ "to": "email@example.com" }`

## Seed email trap
- Seed script picks admin email from: `ADMIN_EMAIL` → `SMTP_USER` → `"admin@example.com"` fallback
- After switching from SMTP to Resend, `SMTP_USER` was removed → seed silently used `admin@example.com`
- OTP emails went to the fake address; Resend accepted them (200) but they never arrived
- **Fix:** Always set `ADMIN_EMAIL` + `OPERATOR_EMAIL` as shared env vars before seeding
