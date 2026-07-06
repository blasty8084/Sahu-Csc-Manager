---
name: Auto-generated secrets pattern
description: Encryption key and VAPID keys auto-generate at startup and persist to settings table; no user secrets needed
---

## Rule
Internal crypto keys auto-generate on first boot and persist to the `settings` table. Never request these as user secrets.

## Keys
- `encryptionKeyBase64` — AES-256-GCM for field-level encryption (`encryption.ts`)
- `vapidPublicKey` / `vapidPrivateKey` — push keys (`vapid.ts`)

## Startup order in index.ts
```
await ensureEncryptionKey();
await ensureVapidKeys();
initPush();   // calls setVapidDetails with now-populated env vars
app.listen(port, ...)
```

**Why:** push.ts previously read env vars at module-init before ensureVapidKeys() ran → startup crash. Eager init fixes ordering and guarantees keys are in DB before requests arrive.

**How to apply:** new internal keys follow the same ensureXxx() + call-in-index.ts pattern. Operator override via env var/secret is always checked first.
