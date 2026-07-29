/**
 * registerTypes.ts — shared schema, types, constants, and hooks for the Register page.
 * Re-exports RESEND_COOLDOWN and OTP_RATE_LIMIT from loginTypes to avoid duplication.
 */
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

export { RESEND_COOLDOWN, OTP_RATE_LIMIT } from "./loginTypes";

// ── Step ─────────────────────────────────────────────────────────────────────
export type RegisterStep = "form" | "otp";

// ── Form schema ───────────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Minimum 3 characters")
      .max(50, "Maximum 50 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscores"),
    fullName: z.string().min(2, "Minimum 2 characters").max(100, "Maximum 100 characters").optional().or(z.literal("")),
    email: z.string().email("Invalid email address"),
    mobile: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Minimum 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character (@#$%! etc.)"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ── Utilities ─────────────────────────────────────────────────────────────────
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}${"*".repeat(Math.min(local.length - 2, 4))}@${domain}`;
}

// ── Hook: 2FA globally disabled? ──────────────────────────────────────────────
export function useTwoFaDisabled() {
  const { data } = useQuery<{ twoFaDisabled?: boolean }>({
    queryKey: ["setup-status-2fa"],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/setup-status`, { credentials: "include" });
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: 60_000,
    retry: false,
  });
  return data?.twoFaDisabled === true;
}
