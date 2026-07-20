import { AnimatePresence } from "framer-motion";
import { useLockoutCountdown } from "./useLockoutCountdown";
import { LoginFormContentProps } from "./loginTypes";
import { LoginRejectedPanel } from "./LoginRejectedPanel";
import { LoginPendingPanel } from "./LoginPendingPanel";
import { LoginLockoutPanel } from "./LoginLockoutPanel";
import { LoginFormFields } from "./LoginFormFields";

/**
 * Thin orchestrator for the login credential step.
 *
 * Shows exactly one of four panels depending on account state:
 *   1. LoginRejectedPanel  — registration was declined
 *   2. LoginPendingPanel   — registration awaiting approval
 *   3. LoginLockoutPanel   — too many failures, locked out
 *   4. LoginFormFields     — normal username + password form
 */
export function LoginFormContent({
  form,
  onSubmit,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  onForgotPassword,
  attemptsLeft,
  lockoutUntil,
  onLockoutExpired,
  rejectedInfo,
  isPendingApproval,
  onDismissStatus,
  adminContact,
}: LoginFormContentProps) {
  const { remaining, display, progress } = useLockoutCountdown(lockoutUntil, onLockoutExpired);
  const showStatusPanel = !!(rejectedInfo || isPendingApproval);
  const identifier = form.getValues("identifier");

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {rejectedInfo && (
          <LoginRejectedPanel
            key="rejected"
            rejectedInfo={rejectedInfo}
            adminContact={adminContact}
            onDismissStatus={onDismissStatus}
            identifier={identifier}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPendingApproval && (
          <LoginPendingPanel
            key="pending"
            isPendingApproval={isPendingApproval}
            onDismissStatus={onDismissStatus}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lockoutUntil && remaining > 0 && (
          <LoginLockoutPanel
            key="lockout"
            lockoutUntil={lockoutUntil}
            remaining={remaining}
            display={display}
            progress={progress}
            onForgotPassword={onForgotPassword}
          />
        )}
      </AnimatePresence>

      <LoginFormFields
        form={form}
        onSubmit={onSubmit}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
        onForgotPassword={onForgotPassword}
        attemptsLeft={attemptsLeft}
        lockoutUntil={lockoutUntil}
        showStatusPanel={showStatusPanel}
      />
    </div>
  );
}
