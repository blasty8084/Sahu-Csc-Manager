import { z } from "zod/v4";

// ─── Shared password policy ────────────────────────────────────────────────
// Applied consistently across registration, password reset, and profile
// password changes.
export const passwordPolicySchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(8, "Password must be at most 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");
