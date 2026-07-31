---
name: Render SMTP IPv4
description: Render outbound SMTP resolves Gmail to unreachable IPv6; correct fix is process-wide DNS order, not a Nodemailer option.
---

# Render SMTP IPv4

**The problem:** On Render, `smtp.gmail.com` can resolve to an IPv6 address that Render cannot route outbound, producing `ENETUNREACH` on port 587 and breaking 2FA OTP delivery (502 from the switch-method endpoint).

**Wrong fix:** Adding `family: 4` as a top-level key to `nodemailer.createTransport()` config — it is silently ignored by Nodemailer.

**Correct fix (confirmed working):** Call `dns.setDefaultResultOrder("ipv4first")` once at process startup, before any network code runs. In this project it goes at the top of `artifacts/api-server/src/lib/env.ts` (which is the first import in `index.ts`). This forces every DNS lookup in the process — including Nodemailer's internal resolution of `smtp.gmail.com` — to return IPv4 addresses first.

**Why:** `setDefaultResultOrder` is a process-wide Node.js setting that affects the built-in resolver for all sockets, not just a single transporter instance. Placing it in `env.ts` guarantees it runs before any module that opens a network connection.

**How to apply:** Add to the very top of the first-imported server file:
```ts
import { setDefaultResultOrder } from "node:dns";
setDefaultResultOrder("ipv4first");
```
No changes to Nodemailer transport config are needed beyond normal timeouts.
