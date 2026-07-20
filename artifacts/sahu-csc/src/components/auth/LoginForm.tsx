// ── LoginForm.tsx — thin orchestrator / re-export barrel ─────────────────────
//
// All state and UI logic has been extracted into focused sub-components:
//   loginTypes.ts            — shared constants, schemas, types, apiPost helper
//   useLockoutCountdown.ts   — lockout timer hook
//   OtpRateLimitPanel.tsx    — OTP rate-limit countdown panel
//   ForgotPasswordPanel.tsx  — full forgot/reset password flow (3-step + success)
//   LoginCredentialsStep.tsx — thin orchestrator (~112 lines); assembles:
//     UsernameField.tsx        — identifier input (mobile/username/email)
//     PasswordField.tsx        — password input + show/hide toggle
//     RememberMeRow.tsx        — remember-me checkbox + forgot-password link
//     RejectedPanel.tsx        — registration-declined status panel + appeal buttons
//     PendingApprovalPanel.tsx — awaiting-admin-approval status panel
//     LockoutPanel.tsx         — account-locked countdown panel
//     AttemptCounter.tsx       — failed-attempt dots + security/lockout badge
//   BiometricPrompt.tsx      — WebAuthn fingerprint/Face ID component (ready; not yet wired)

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
