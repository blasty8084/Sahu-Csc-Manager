---
name: Render SMTP IPv4
description: Render outbound SMTP can resolve Gmail to unreachable IPv6; Nodemailer must force IPv4.
---

# Render SMTP IPv4

When SMTP is used from Render, configure the Nodemailer transport with `family: 4` plus explicit connection, greeting, and socket timeouts. Render may resolve `smtp.gmail.com` to IPv6 even when the service cannot route IPv6, producing `ENETUNREACH` and breaking 2FA OTP delivery.

**Why:** The login-time OTP endpoint failed with a 502 because the SMTP socket attempted an unreachable IPv6 address; the OTP generation and database flow were otherwise working.

**How to apply:** Keep the production mailer and any SMTP diagnostic/test transporter on the same IPv4-forced settings. Verify the Render deployment logs after redeploy, then test the login-time resend flow.