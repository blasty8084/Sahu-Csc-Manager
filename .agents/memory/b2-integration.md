---
name: Backblaze B2 integration
description: Optional S3-compatible storage for avatars and durable database backups
---

Backblaze B2 is optional. When configured, avatar records store `b2:` object keys and profile responses resolve them to short-lived signed URLs; backups remain local-first and mirror to B2 with restore fallback.

**Why:** Replit local disk is ephemeral, while existing users must keep working without B2 credentials.

**How to apply:** Gate every B2 operation with `isB2Configured()`. Normalize `B2_BUCKET_ENDPOINT` by adding `https://` when a hostname-only value is supplied.