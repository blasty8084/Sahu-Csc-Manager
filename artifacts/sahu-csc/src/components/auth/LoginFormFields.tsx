import { motion, AnimatePresence } from "framer-motion";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Eye, EyeOff, Shield, Loader2, Smartphone, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MAX_ATTEMPTS, LoginFormValues } from "./loginTypes";
import type { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<LoginFormValues>;
  onSubmit: (values: LoginFormValues) => Promise<void>;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (v: boolean) => void;
  onForgotPassword: () => void;
  attemptsLeft: number | null;
  lockoutUntil: Date | null;
  /** True when a rejected / pending status panel is visible (hides the form fields). */
  showStatusPanel: boolean;
}

export function LoginFormFields({
  form, onSubmit, showPassword, setShowPassword, rememberMe, setRememberMe,
  onForgotPassword, attemptsLeft, lockoutUntil, showStatusPanel,
}: Props) {
  const { t } = useTranslation();
  const isSubmitting = form.formState.isSubmitting;

  const usedAttempts = attemptsLeft !== null ? MAX_ATTEMPTS - attemptsLeft : 0;
  const showCounter  = attemptsLeft !== null && attemptsLeft < MAX_ATTEMPTS && !lockoutUntil;
  const urgency      = attemptsLeft !== null
    ? attemptsLeft <= 1 ? "critical" : attemptsLeft <= 2 ? "high" : "medium"
    : "medium";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <AnimatePresence>
          {!lockoutUntil && !showStatusPanel && (
            <motion.div key="form-fields"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="space-y-4">

              <FormField control={form.control} name="identifier"
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

              <FormField control={form.control} name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <FormControl>
                        <Input type={showPassword ? "text" : "password"} placeholder="Enter your password"
                          className="pl-10 pr-11 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all" {...field} />
                      </FormControl>
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)}
                    className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
                  <span className="text-sm text-gray-600">{t('auth.login.remember_me')}</span>
                </label>
                <button type="button" onClick={onForgotPassword}
                  className="text-sm font-semibold cursor-pointer transition-colors" style={{ color: "#0b2c60" }}>
                  {t('auth.login.forgot_password')}
                </button>
              </div>

              {/* Attempt counter */}
              <AnimatePresence>
                {showCounter && (
                  <motion.div key="attempt-counter"
                    initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -6, height: 0 }} transition={{ duration: 0.2 }}
                    className="overflow-hidden">
                    <div className="rounded-xl px-4 py-3 border"
                      style={{
                        background: urgency === "critical" ? "#fff1f2" : urgency === "high" ? "#fff7ed" : "#fffbeb",
                        borderColor: urgency === "critical" ? "#fecdd3" : urgency === "high" ? "#fed7aa" : "#fde68a",
                      }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0"
                            style={{ color: urgency === "critical" ? "#e11d48" : urgency === "high" ? "#ea580c" : "#d97706" }} />
                          <span className="text-xs font-semibold"
                            style={{ color: urgency === "critical" ? "#be123c" : urgency === "high" ? "#c2410c" : "#b45309" }}>
                            {attemptsLeft === 1 ? "Last attempt before lockout!" : `${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining`}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">{usedAttempts}/{MAX_ATTEMPTS} used</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
                          const isUsed = i < usedAttempts;
                          return (
                            <motion.div key={i} initial={false} animate={{ scale: isUsed ? [1, 1.3, 1] : 1 }}
                              transition={{ duration: 0.3, delay: i * 0.04 }}
                              className="flex-1 h-1.5 rounded-full"
                              style={{ background: isUsed ? (urgency === "critical" ? "#e11d48" : urgency === "high" ? "#ea580c" : "#d97706") : "rgba(0,0,0,0.08)" }} />
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
                <Button type="submit" disabled={isSubmitting}
                  className="w-full h-12 font-bold text-base tracking-wide text-white shadow-lg border-0"
                  style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
                  {isSubmitting
                    ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{t('common.loading')}</span>
                    : `${t('auth.login.submit')} →`}
                </Button>
              </motion.div>

              <AnimatePresence mode="wait">
                {showCounter ? (
                  <motion.div key="locked-warning"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 border"
                    style={{ background: urgency === "critical" ? "#fff1f2" : "#fff7ed", borderColor: urgency === "critical" ? "#fecdd3" : "#fed7aa" }}>
                    <Lock className="w-4 h-4 flex-shrink-0" style={{ color: urgency === "critical" ? "#e11d48" : "#ea580c" }} />
                    <span className="text-xs font-medium" style={{ color: urgency === "critical" ? "#be123c" : "#c2410c" }}>
                      Wrong password? Use{" "}
                      <button type="button" onClick={onForgotPassword} className="underline font-semibold">Forgot Password</button>
                      {" "}to reset safely.
                    </span>
                  </motion.div>
                ) : (
                  <motion.div key="secure-badge"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
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
