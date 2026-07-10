// DEPRECATED BARREL — kept for historical reference only.
// All password-reset and OTP routes are now registered via routes/auth/index.ts:
//   routes/auth/otp.ts             — POST /auth/send-otp, POST /auth/verify-otp
//   routes/auth/forgot-password.ts — POST /auth/forgot-password (legacy admin OTP)
//   routes/auth/reset-password.ts  — POST /auth/reset-password (token + legacy OTP modes)
//
// This file exports an empty router so any leftover import in routes/index.ts
// does not break the build while the migration is in progress.
import { Router } from "express";
const router = Router();
export default router;
