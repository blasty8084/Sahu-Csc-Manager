---
name: First-login OTP bypass
description: Why the seeded admin (and any brand-new user) skips the new-device OTP challenge on their very first login only.
---

The new-device OTP/TOTP challenge in the login route is skipped when `user.firstLoginCompleted === false`, i.e. only for an account's very first-ever login.

**Why:** A freshly seeded/created account has no device_sessions row yet, so every login looked like a "new device" and always demanded an OTP — including the seeded admin's first login, before SMTP may even be configured. There is no real risk in skipping the device check for that one login: the password was just verified, and the first-login permission overlay still runs immediately after.

**How to apply:** `finalizeLogin` upserts a device_sessions row on every successful login, so login #2 onward always has a known-device row and the normal new-device challenge (and `twoFaEnabled` 2FA) applies as usual. Do not extend this bypass beyond the first login — it's gated strictly on `firstLoginCompleted`, not on role (so it also naturally covers newly-approved/registered users' first login, not just admin).
