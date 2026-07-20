import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { useLockoutCountdown } from "./useLockoutCountdown";
import { MAX_ATTEMPTS, LoginFormContentProps } from "./loginTypes";
import { UsernameField } from "./UsernameField";
import { PasswordField } from "./PasswordField";
import { RememberMeRow } from "./RememberMeRow";
import { RejectedPanel } from "./RejectedPanel";
import { PendingApprovalPanel } from "./PendingApprovalPanel";
import { LockoutPanel } from "./LockoutPanel";
import { AttemptCounter } from "./AttemptCounter";

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
  const isSubmitting = form.formState.isSubmitting;
  const { t } = useTranslation();

  const usedAttempts = attemptsLeft !== null ? MAX_ATTEMPTS - attemptsLeft : 0;
  const showCounter = attemptsLeft !== null && attemptsLeft < MAX_ATTEMPTS && !lockoutUntil;
  const urgency =
    attemptsLeft !== null
      ? attemptsLeft <= 1 ? "critical"
      : attemptsLeft <= 2 ? "high"
      : "medium"
    : "medium";
  const { remaining, display, progress } = useLockoutCountdown(lockoutUntil, onLockoutExpired);
  const showStatusPanel = !!(rejectedInfo || isPendingApproval);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <RejectedPanel
          rejectedInfo={rejectedInfo}
          adminContact={adminContact}
          onDismissStatus={onDismissStatus}
          getIdentifier={() => form.getValues("identifier")}
        />

        <PendingApprovalPanel
          isPendingApproval={isPendingApproval}
          onDismissStatus={onDismissStatus}
        />

        <LockoutPanel
          lockoutUntil={lockoutUntil}
          remaining={remaining}
          display={display}
          progress={progress}
          onForgotPassword={onForgotPassword}
        />

        <AnimatePresence>
          {(!lockoutUntil || remaining <= 0) && !showStatusPanel && (
            <motion.div
              key="form-fields"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <UsernameField form={form} />
              <PasswordField form={form} showPassword={showPassword} setShowPassword={setShowPassword} />
              <RememberMeRow rememberMe={rememberMe} setRememberMe={setRememberMe} onForgotPassword={onForgotPassword} />

              <AttemptCounter
                showCounter={showCounter}
                attemptsLeft={attemptsLeft}
                usedAttempts={usedAttempts}
                urgency={urgency}
                onForgotPassword={onForgotPassword}
              />

              <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 font-bold text-base tracking-wide text-white shadow-lg border-0"
                  style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}
                >
                  {isSubmitting
                    ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{t("common.loading")}</span>
                    : `${t("auth.login.submit")} →`}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </form>
    </Form>
  );
}
