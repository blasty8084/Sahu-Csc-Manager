import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  Loader2,
  Smartphone,
  ArrowLeft,
  AlertTriangle,
  Clock,
  Ban,
  MailCheck,
  Mail,
  MessageCircle,
} from "lucide-react";
import { useLockoutCountdown } from "./useLockoutCountdown";
import { MAX_ATTEMPTS, LoginFormContentProps } from "./loginTypes";

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

  const [appealCooldownMsg, setAppealCooldownMsg] = useState<string | null>(null);

  const fireAppealLog = async (channel: "whatsapp" | "email"): Promise<boolean> => {
    const identifier = form.getValues("identifier");
    if (!identifier) return true;
    const base = (import.meta as any).env?.BASE_URL?.replace(/\/$/, "") ?? "";
    try {
      const res = await fetch(`${base}/api/auth/appeal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, channel }),
      });
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        const msg = data.error ?? "Please wait before submitting another appeal.";
        setAppealCooldownMsg(msg);
        return false;
      }
      setAppealCooldownMsg(null);
    } catch {
      // network error — let the link open anyway
    }
    return true;
  };

  const usedAttempts = attemptsLeft !== null ? MAX_ATTEMPTS - attemptsLeft : 0;
  const showCounter = attemptsLeft !== null && attemptsLeft < MAX_ATTEMPTS && !lockoutUntil;
  const urgency = attemptsLeft !== null
    ? attemptsLeft <= 1 ? "critical"
    : attemptsLeft <= 2 ? "high"
    : "medium"
    : "medium";
  const { remaining, display, progress } = useLockoutCountdown(lockoutUntil, onLockoutExpired);

  const showStatusPanel = !!(rejectedInfo || isPendingApproval);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* ── Registration Declined panel ── */}
        <AnimatePresence>
          {rejectedInfo && (
            <motion.div
              key="rejected-panel"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border-2 overflow-hidden"
              style={{ borderColor: "#fed7aa", background: "#fff7ed" }}
            >
              <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #f97316, #ea580c)" }} />
              <div className="px-4 py-4">
                <div className="flex flex-col items-center text-center mb-3">
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                    style={{ background: "linear-gradient(135deg, #f97316, #c2410c)" }}
                  >
                    <Ban className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-base font-bold" style={{ color: "#c2410c" }}>Registration Declined</h3>
                  <p className="text-xs mt-1" style={{ color: "#9a3412" }}>
                    Your registration request was not approved by the administrator.
                  </p>
                </div>

                {rejectedInfo.reason && (
                  <div
                    className="rounded-xl px-3 py-2.5 mb-3 border"
                    style={{ background: "rgba(249,115,22,0.07)", borderColor: "#fed7aa" }}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#ea580c" }}>Reason</p>
                    <p className="text-sm font-medium leading-relaxed" style={{ color: "#7c2d12" }}>{rejectedInfo.reason}</p>
                  </div>
                )}

                {/* Appeal buttons */}
                {(adminContact?.phone || adminContact?.email) ? (
                  <div className="space-y-2 mb-3">
                    <p className="text-[11px] text-center font-semibold" style={{ color: "#9a3412" }}>
                      Contact the administrator to appeal:
                    </p>
                    <div className={`grid gap-2 ${adminContact.phone && adminContact.email ? "grid-cols-2" : "grid-cols-1"}`}>
                      {adminContact.phone && (() => {
                        const digits = adminContact.phone!.replace(/\D/g, "");
                        const waNum = digits.length === 10 ? `91${digits}` : digits;
                        const identifier = form.getValues("identifier");
                        const reason = rejectedInfo?.reason;
                        const msg = encodeURIComponent(
                          `Hi, I am ${identifier || "a user"}. My SAHU CSC registration was declined.${reason ? ` Reason given: "${reason}".` : ""} I would like to appeal this decision. Please reconsider my application.`
                        );
                        return (
                          <button
                            type="button"
                            onClick={async () => {
                              const allowed = await fireAppealLog("whatsapp");
                              if (allowed) window.open(`https://wa.me/${waNum}?text=${msg}`, "_blank", "noopener,noreferrer");
                            }}
                            className="flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold transition-opacity active:opacity-80"
                            style={{ background: "#25d366", color: "#fff" }}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </button>
                        );
                      })()}
                      {adminContact.email && (() => {
                        const identifier = form.getValues("identifier");
                        const reason = rejectedInfo?.reason;
                        const subject = encodeURIComponent(`Appeal: SAHU CSC Registration Declined — ${identifier || "User"}`);
                        const body = encodeURIComponent(
                          `Hello,\n\nI am ${identifier || "a registered user"} and my SAHU CSC registration was declined.${reason ? `\n\nReason given: "${reason}"` : ""}\n\nI would like to appeal this decision and request a review of my application.\n\nThank you.`
                        );
                        return (
                          <button
                            type="button"
                            onClick={async () => {
                              const allowed = await fireAppealLog("email");
                              if (allowed) window.location.href = `mailto:${adminContact!.email}?subject=${subject}&body=${body}`;
                            }}
                            className="flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold transition-opacity active:opacity-80"
                            style={{ background: "#0b2c60", color: "#fff" }}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Email Admin
                          </button>
                        );
                      })()}
                    </div>
                    {appealCooldownMsg && (
                      <p className="text-[11px] text-center font-medium mt-1" style={{ color: "#b45309" }}>
                        ⏳ {appealCooldownMsg}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-center mb-3" style={{ color: "#9a3412" }}>
                    For assistance, contact your administrator or register with a different account.
                  </p>
                )}

                <button
                  type="button"
                  onClick={onDismissStatus}
                  className="w-full h-10 rounded-xl font-semibold text-sm border-2 transition-colors"
                  style={{ borderColor: "#fed7aa", color: "#c2410c", background: "transparent" }}
                >
                  Try a different account →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pending Approval panel ── */}
        <AnimatePresence>
          {isPendingApproval && (
            <motion.div
              key="pending-panel"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border-2 overflow-hidden"
              style={{ borderColor: "#bfdbfe", background: "#eff6ff" }}
            >
              <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #3b82f6, #1d4ed8)" }} />
              <div className="px-4 py-4">
                <div className="flex flex-col items-center text-center mb-3">
                  <motion.div
                    animate={{ rotate: [0, -6, 6, -6, 6, 0] }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
                  >
                    <Clock className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-base font-bold" style={{ color: "#1d4ed8" }}>Awaiting Approval</h3>
                  <p className="text-xs mt-1" style={{ color: "#1e40af" }}>
                    Your registration is pending admin review. You'll be able to log in once approved.
                  </p>
                </div>

                <div
                  className="rounded-xl px-3 py-2.5 mb-3 border flex items-start gap-2.5"
                  style={{ background: "rgba(59,130,246,0.07)", borderColor: "#bfdbfe" }}
                >
                  <MailCheck className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#3b82f6" }} />
                  <p className="text-xs leading-relaxed" style={{ color: "#1e40af" }}>
                    You'll receive a notification once the administrator reviews your request. Check back later or contact your CSC admin directly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onDismissStatus}
                  className="w-full h-10 rounded-xl font-semibold text-sm border-2 transition-colors"
                  style={{ borderColor: "#bfdbfe", color: "#1d4ed8", background: "transparent" }}
                >
                  ← Back to login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Lockout countdown panel ── */}
        <AnimatePresence>
          {lockoutUntil && remaining > 0 && (
            <motion.div
              key="lockout-panel"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border-2 overflow-hidden"
              style={{ borderColor: "#fecdd3", background: "#fff1f2" }}
            >
              {/* Progress bar — drains left to right over 15 min */}
              <div className="h-1.5 w-full" style={{ background: "#fecdd3" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #e11d48, #f43f5e)", width: `${progress * 100}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>

              <div className="px-4 py-4">
                {/* Icon + heading */}
                <div className="flex flex-col items-center text-center mb-4">
                  <motion.div
                    animate={{ rotate: [0, -8, 8, -8, 8, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                    style={{ background: "linear-gradient(135deg, #e11d48, #be123c)" }}
                  >
                    <Lock className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-base font-bold" style={{ color: "#be123c" }}>Account Locked</h3>
                  <p className="text-xs mt-1" style={{ color: "#9f1239" }}>
                    Too many failed attempts. Try again after the timer expires.
                  </p>
                </div>

                {/* Big countdown display */}
                <div
                  className="flex flex-col items-center justify-center rounded-xl py-4 mb-4"
                  style={{ background: "rgba(225,29,72,0.08)" }}
                >
                  <motion.span
                    key={display}
                    initial={{ scale: 1.1, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-4xl font-black tabular-nums tracking-wider"
                    style={{ color: remaining <= 60 ? "#e11d48" : "#be123c", fontVariantNumeric: "tabular-nums" }}
                  >
                    {display}
                  </motion.span>
                  <span className="text-[10px] mt-1 font-medium uppercase tracking-widest" style={{ color: "#f43f5e" }}>
                    remaining
                  </span>
                </div>

                {/* Forgot password escape hatch */}
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="w-full h-10 rounded-xl font-semibold text-sm border-2 transition-colors"
                  style={{ borderColor: "#fda4af", color: "#be123c", background: "transparent" }}
                >
                  Reset password instead →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Normal form fields (hidden while locked or status panel shown) ── */}
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
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <FormControl>
                    <Input placeholder="Mobile / Username / Email" className="pl-10 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all" {...field} />
                  </FormControl>
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <FormControl>
                    <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" className="pl-10 pr-11 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all" {...field} />
                  </FormControl>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)} className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
              <span className="text-sm text-gray-600">{t('auth.login.remember_me')}</span>
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm font-semibold cursor-pointer transition-colors"
              style={{ color: "#0b2c60" }}
            >
              {t('auth.login.forgot_password')}
            </button>
          </div>

          {/* ── Attempt counter ── */}
          <AnimatePresence>
            {showCounter && (
              <motion.div
                key="attempt-counter"
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div
                  className="rounded-xl px-4 py-3 border"
                  style={{
                    background: urgency === "critical" ? "#fff1f2" : urgency === "high" ? "#fff7ed" : "#fffbeb",
                    borderColor: urgency === "critical" ? "#fecdd3" : urgency === "high" ? "#fed7aa" : "#fde68a",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: urgency === "critical" ? "#e11d48" : urgency === "high" ? "#ea580c" : "#d97706" }}
                      />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: urgency === "critical" ? "#be123c" : urgency === "high" ? "#c2410c" : "#b45309" }}
                      >
                        {attemptsLeft === 1
                          ? "Last attempt before lockout!"
                          : `${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining`}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {usedAttempts}/{MAX_ATTEMPTS} used
                    </span>
                  </div>

                  {/* Attempt dots */}
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
                      const isUsed = i < usedAttempts;
                      return (
                        <motion.div
                          key={i}
                          initial={false}
                          animate={{ scale: isUsed ? [1, 1.3, 1] : 1 }}
                          transition={{ duration: 0.3, delay: i * 0.04 }}
                          className="flex-1 h-1.5 rounded-full"
                          style={{
                            background: isUsed
                              ? urgency === "critical" ? "#e11d48"
                              : urgency === "high" ? "#ea580c"
                              : "#d97706"
                              : "rgba(0,0,0,0.08)",
                          }}
                        />
                      );
                    })}
                  </div>

                  {attemptsLeft !== null && attemptsLeft <= 2 && (
                    <p className="text-[10px] mt-1.5" style={{ color: urgency === "critical" ? "#9f1239" : "#9a3412" }}>
                      Account locks for 15 min after {MAX_ATTEMPTS} failed attempts.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
            <Button type="submit" disabled={isSubmitting} className="w-full h-12 font-bold text-base tracking-wide text-white shadow-lg border-0" style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
              {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{t('common.loading')}</span> : `${t('auth.login.submit')} →`}
            </Button>
          </motion.div>

          <AnimatePresence mode="wait">
            {showCounter ? (
              <motion.div
                key="locked-warning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 border"
                style={{
                  background: urgency === "critical" ? "#fff1f2" : "#fff7ed",
                  borderColor: urgency === "critical" ? "#fecdd3" : "#fed7aa",
                }}
              >
                <Lock
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: urgency === "critical" ? "#e11d48" : "#ea580c" }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: urgency === "critical" ? "#be123c" : "#c2410c" }}
                >
                  Wrong password? Use{" "}
                  <button type="button" onClick={onForgotPassword} className="underline font-semibold">
                    Forgot Password
                  </button>{" "}
                  to reset safely.
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="secure-badge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5"
              >
                <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-xs text-green-700 font-medium">Your data is 100% secure with us</span>
              </motion.div>
            )}
          </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Form>
  );
}
