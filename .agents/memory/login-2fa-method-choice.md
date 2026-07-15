---
name: Login-time 2FA method choice
description: How the post-login verification screen lets a user pick Email OTP vs TOTP, including mid-login TOTP enrollment, instead of the account's stored twoFaMethod deciding it.
---

The account's `twoFaMethod` column is no longer the sole decider of which challenge method is used at login — `POST /auth/login` always starts the challenge on `"otp"` (default, sends the email) and now also returns `totpEnrolled` (derived from `!!user.totpSecret`) so the frontend can offer TOTP as a same-screen alternative regardless of the stored preference.

**Why:** Product wanted the verification screen itself to offer a choice, not force whatever the account was configured with — Email OTP stays the safe default, but any account can opt into TOTP per-login, and non-enrolled accounts can enroll inline without a trip to profile settings.

**How to apply:** Mid-login (session only has `pendingUserId`, not a full session) is a distinct trust boundary from the authenticated settings-page 2FA flows in `2fa.ts`. Any new mid-login capability needs its own endpoint gated on `pendingUserId` (not `requireAuth`) — see `switch-method` and `setup-totp-pending`. A session flag (`pendingTotpEnrolling`) marks "this pending login is completing first-time TOTP enrollment" so the existing mid-login TOTP-verify branch knows to also flip `twoFaEnabled`/`twoFaMethod` and mint backup codes, mirroring what the authenticated enrollment path already does — don't duplicate that logic, gate it with a flag instead. When mutating the user row mid-handler and then passing the same in-memory `user` object into a shared finalize/format helper, remember to mirror the changed fields onto that object too — `db.update()` does not reach back and update variables already read from an earlier `select()`.
