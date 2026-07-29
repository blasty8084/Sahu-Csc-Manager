import { z } from "zod";
import { useForm } from "react-hook-form";

// ── Constants ────────────────────────────────────────────────────────────────
export const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN = 120;
export const OTP_RATE_LIMIT = 15 * 60;

// ── Login schema ─────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  identifier: z.string().min(1, "Login ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

// ── Password reset step type ──────────────────────────────────────────────────
export type ResetStep = "identifier" | "otp" | "password" | "success";

// ── API helper ────────────────────────────────────────────────────────────────
const BASE = () => import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
export function apiPost(path: string, body: unknown) {
  return fetch(`${BASE()}/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
}

// ── Password rules ────────────────────────────────────────────────────────────
export const PWD_RULES = [
  { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p: string) => /[a-z]/.test(p), label: "One lowercase letter" },
  { test: (p: string) => /[0-9]/.test(p), label: "One number" },
];

// ── LoginFormContent props ────────────────────────────────────────────────────
export interface LoginFormContentProps {
  form: ReturnType<typeof useForm<LoginFormValues>>;
  onSubmit: (values: LoginFormValues) => Promise<void>;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (v: boolean) => void;
  onForgotPassword: () => void;
  attemptsLeft: number | null;
  lockoutUntil: Date | null;
  onLockoutExpired: () => void;
  rejectedInfo: { reason: string | null } | null;
  isPendingApproval: boolean;
  onDismissStatus: () => void;
  adminContact: { name: string; phone: string | null; email: string | null } | null;
}
