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
- `RESEND_FROM` env var → from address; use `SAHU CSC <onboarding@resend.dev>` until domain verified
- `isSmtpConfigured()` now checks `RESEND_API_KEY` (not SMTP_* vars)
- `createTransporter()` and `getTransporter()` are now **synchronous** (not async) — shims returning `{ sendMail, verify }`
- `resend` added to `external` array in `build.mjs` (near `nodemailer`)
- `render.yaml` SMTP section replaced with `RESEND_API_KEY` + `RESEND_FROM`
- Test endpoint: `POST /api/settings/smtp/test` with `{ "to": "email@example.com" }`
