// ── LoginForm.tsx — thin orchestrator / re-export barrel ─────────────────────
//
// All state and UI logic has been extracted into focused sub-components:
//   loginTypes.ts          — shared constants, schemas, types, apiPost helper
//   useLockoutCountdown.ts — lockout timer hook
//   OtpRateLimitPanel.tsx  — OTP rate-limit countdown panel
//   ForgotPasswordPanel.tsx — full forgot/reset password flow (3-step + success)
//   LoginCredentialsStep.tsx — login form with lockout / status panels

// Re-export everything that login.tsx (and any other consumers) import from here
export {
  MAX_ATTEMPTS,
  loginSchema,
  RESEND_COOLDOWN,
  OTP_RATE_LIMIT,
  apiPost,
  PWD_RULES,
} from "./loginTypes";
export type { LoginFormValues, LoginFormContentProps, ResetStep } from "./loginTypes";

export { useLockoutCountdown } from "./useLockoutCountdown";
export { OtpRateLimitPanel } from "./OtpRateLimitPanel";
export { ForgotPasswordPanel } from "./ForgotPasswordPanel";
export { LoginFormContent } from "./LoginCredentialsStep";
