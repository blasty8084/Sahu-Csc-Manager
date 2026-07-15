import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoginLogo } from "@/components/app-logo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, UserPlus, ArrowRight } from "lucide-react";
import {
  LoginFormContent,
  ForgotPasswordPanel,
  loginSchema,
  LoginFormValues,
  LoginFormContentProps,
} from "@/components/auth/LoginForm";
import { DesktopHeroPanel, DesktopFooterBar } from "@/components/auth/AuthHero";
import { TwoFactorStep } from "@/components/auth/TwoFactorStep";
import type { TwoFaChallenge } from "@/hooks/use-auth";

interface TwoFaProps {
  challenge: TwoFaChallenge | null;
  onVerify: (data: { code: string; trustDevice: boolean; isBackupCode: boolean }) => Promise<void>;
  onBackFromChallenge: () => void;
}

// ── Mobile layout ─────────────────────────────────────────────────────────────
function MobileLogin(props: Omit<LoginFormContentProps, "onForgotPassword"> & TwoFaProps) {
  const [showForgot, setShowForgot] = useState(false);
  const { t } = useTranslation();
  const { challenge, onVerify, onBackFromChallenge } = props;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#0B1340" }}>
      <div className="flex-shrink-0 pt-6 px-6 pb-4 flex flex-col items-center text-center">
        <LoginLogo size={52} />
        <div className="mt-2.5">
          <h1 className="text-xl font-black">
            <span className="text-white">SAHU </span>
            <span style={{ color: "#F97316" }}>CSC</span>
          </h1>
          <p className="text-white/50 text-xs">{t('nav.management_platform')}</p>
        </div>

        <AnimatePresence mode="wait">
          {challenge ? (
            <motion.div key="2fa-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-2 text-center">
              <h2 className="text-white text-base font-bold">Verification Required</h2>
              <p className="text-white/45 text-xs mt-0.5">One more step to secure your account</p>
            </motion.div>
          ) : !showForgot ? (
            <motion.div key="login-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-2 text-center">
              <h2 className="text-white text-base font-bold">{t('auth.login.title')}</h2>
              <p className="text-white/45 text-xs mt-0.5">Sign in to continue to your dashboard</p>
            </motion.div>
          ) : (
            <motion.div key="forgot-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-2 text-center">
              <h2 className="text-white text-base font-bold">{t('auth.forgot_password.title')}</h2>
              <p className="text-white/45 text-xs mt-0.5">Reset your account password</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex-1 bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto px-6 pt-5 pb-6">
          <AnimatePresence mode="wait">
            {challenge ? (
              <TwoFactorStep key="2fa-step" challenge={challenge} onVerify={onVerify} onBack={onBackFromChallenge} />
            ) : !showForgot ? (
              <motion.div key="login-panel" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                <div className="flex flex-col items-center mb-4">
                  <h3 className="text-gray-900 font-bold text-base">Login to your account</h3>
                  <p className="text-gray-500 text-xs mt-0.5">Enter your credentials to continue</p>
                </div>

                <LoginFormContent {...props} onForgotPassword={() => setShowForgot(true)} />

                <div className="flex items-center gap-3 mt-5">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <Link href="/register">
                  <div className="mt-3 flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-dashed cursor-pointer" style={{ borderColor: "#bfdbfe", background: "#eff6ff" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#dbeafe" }}>
                      <UserPlus className="w-5 h-5" style={{ color: "#0b2c60" }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">{t('auth.login.no_account')}</p>
                      <p className="text-sm font-bold flex items-center gap-1 mt-0.5" style={{ color: "#0b2c60" }}>
                        {t('auth.login.register_cta')} <ArrowRight className="w-3.5 h-3.5" />
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="mt-5 flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-400 tracking-wide">{t('auth.login.trusted')}. {t('auth.login.secure')}. {t('auth.login.reliable')}.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="forgot-panel" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.25 }}>
                <ForgotPasswordPanel onBack={() => setShowForgot(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ── Desktop layout ────────────────────────────────────────────────────────────
function DesktopLogin(props: Omit<LoginFormContentProps, "onForgotPassword"> & TwoFaProps) {
  const [showForgot, setShowForgot] = useState(false);
  const { t } = useTranslation();
  const { challenge, onVerify, onBackFromChallenge } = props;

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: "#0B1340" }}>
      <div className="flex flex-1 min-h-0">
        <DesktopHeroPanel />

        {/* Right panel */}
        <div className="w-[42%] flex items-center justify-center px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl px-7 py-6 overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {challenge ? (
                <TwoFactorStep key="2fa-step-desktop" challenge={challenge} onVerify={onVerify} onBack={onBackFromChallenge} />
              ) : !showForgot ? (
                <motion.div key="desktop-login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                  <div className="flex flex-col items-center mb-4">
                    <h3 className="text-gray-900 font-bold text-lg">Login to your account</h3>
                    <p className="text-gray-500 text-xs mt-0.5">Enter your credentials to continue</p>
                  </div>

                  <LoginFormContent {...props} onForgotPassword={() => setShowForgot(true)} />

                  <div className="flex items-center gap-3 mt-5">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <Link href="/register">
                    <div className="mt-3 flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-dashed cursor-pointer transition-colors hover:bg-blue-100" style={{ borderColor: "#bfdbfe", background: "#eff6ff" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#dbeafe" }}>
                        <UserPlus className="w-5 h-5" style={{ color: "#0b2c60" }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">{t('auth.login.no_account')}</p>
                        <p className="text-sm font-bold flex items-center gap-1 mt-0.5" style={{ color: "#0b2c60" }}>
                          Register here <ArrowRight className="w-3.5 h-3.5" />
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ) : (
                <motion.div key="desktop-forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.22 }}>
                  <ForgotPasswordPanel onBack={() => setShowForgot(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <DesktopFooterBar />
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function Login() {
  const { login, user, verifyTwoFactor } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const [rejectedInfo, setRejectedInfo] = useState<{ reason: string | null } | null>(null);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [adminContact, setAdminContact] = useState<{ name: string; phone: string | null; email: string | null } | null>(null);
  const [challenge, setChallenge] = useState<TwoFaChallenge | null>(null);

  useEffect(() => {
    const base = (import.meta as any).env?.BASE_URL?.replace(/\/$/, "") ?? "";
    fetch(`${base}/api/settings/contact`).then(r => r.ok ? r.json() : null).then(d => { if (d) setAdminContact(d); }).catch(() => {});
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  useEffect(() => { if (user) setLocation("/"); }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem("rememberMe") === "true";
    if (saved) {
      setRememberMe(true);
      const savedId = localStorage.getItem("savedIdentifier") || "";
      if (savedId) form.setValue("identifier", savedId);
    }
  }, []);

  const onDismissStatus = useCallback(() => {
    setRejectedInfo(null);
    setIsPendingApproval(false);
    form.reset();
  }, [form]);

  const onSubmit = async (values: LoginFormValues) => {
    setRejectedInfo(null);
    setIsPendingApproval(false);
    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("savedIdentifier", values.identifier);
    } else {
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("savedIdentifier");
    }
    try {
      const result = await login({ ...values, rememberMe });
      setAttemptsLeft(null);
      setLockoutUntil(null);
      if (result?.requires2fa) {
        setChallenge(result);
        return;
      }
      toast.success("Login successful", "Welcome back to the SAHU CSC Platform.");
    } catch (err: any) {
      if (err?.locked) {
        setAttemptsLeft(0);
        setLockoutUntil(err.lockedUntil ? new Date(err.lockedUntil) : new Date(Date.now() + 15 * 60_000));
        toast({ variant: "destructive", title: "Account Locked", description: err.message ?? "Your account is temporarily locked. Please try again later." });
      } else if (err?.rejected) {
        setRejectedInfo({ reason: err.rejectionReason ?? null });
      } else if (err?.pending) {
        setIsPendingApproval(true);
      } else if (err?.attemptsLeft !== undefined) {
        setAttemptsLeft(err.attemptsLeft);
        toast({ variant: "destructive", title: "Wrong password", description: `${err.attemptsLeft} attempt${err.attemptsLeft !== 1 ? "s" : ""} remaining before lockout.` });
      } else {
        toast({ variant: "destructive", title: "Login failed", description: err?.message ?? "Please check your credentials and try again." });
      }
    }
  };

  const handleLockoutExpired = useCallback(() => {
    setLockoutUntil(null);
    setAttemptsLeft(null);
    toast.warning("Lockout lifted", "You can try logging in again.");
  }, [toast]);

  const onVerifyTwoFactor = useCallback(async (data: { code: string; trustDevice: boolean; isBackupCode: boolean }) => {
    if (!challenge) return;
    await verifyTwoFactor(challenge.method, {
      code: data.code,
      trustDevice: data.trustDevice,
      isBackupCode: data.isBackupCode,
    });
    toast.success("Login successful", "Welcome back to the SAHU CSC Platform.");
  }, [challenge, verifyTwoFactor, toast]);

  const onBackFromChallenge = useCallback(() => {
    setChallenge(null);
    form.reset();
  }, [form]);

  const formProps: Omit<LoginFormContentProps, "onForgotPassword"> & TwoFaProps = {
    form, onSubmit, showPassword, setShowPassword, rememberMe, setRememberMe,
    attemptsLeft, lockoutUntil, onLockoutExpired: handleLockoutExpired,
    rejectedInfo, isPendingApproval, onDismissStatus, adminContact,
    challenge, onVerify: onVerifyTwoFactor, onBackFromChallenge,
  };

  return isMobile
    ? <MobileLogin {...formProps} />
    : <DesktopLogin {...formProps} />;
}
