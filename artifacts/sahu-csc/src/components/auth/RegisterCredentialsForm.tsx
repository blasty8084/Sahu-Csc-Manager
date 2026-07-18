/**
 * RegisterCredentialsForm — password, confirm-password, error banner, and submit button.
 * Must be rendered inside a shadcn <Form> wrapper (receives form from parent).
 */
import { type UseFormReturn } from "react-hook-form";
import { Eye, EyeOff, Lock, Mail, Loader2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { RegisterFormValues } from "./registerTypes";
import { PasswordStrength } from "./PasswordStrength";

interface Props {
  form: UseFormReturn<RegisterFormValues>;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirm: boolean;
  setShowConfirm: (v: boolean) => void;
  otpError: string | null;
  sendingOtp: boolean;
}

export function RegisterCredentialsForm({
  form, showPassword, setShowPassword, showConfirm, setShowConfirm, otpError, sendingOtp,
}: Props) {
  const password = form.watch("password");

  return (
    <>
      <FormField control={form.control} name="password" render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs font-semibold text-gray-600">Password *</FormLabel>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <FormControl>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                className="pl-10 pr-11 h-11 border-gray-200 bg-white"
                {...field}
              />
            </FormControl>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrength password={password} />
          <FormMessage className="text-xs" />
        </FormItem>
      )} />

      <FormField control={form.control} name="confirmPassword" render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs font-semibold text-gray-600">Confirm Password *</FormLabel>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <FormControl>
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                className="pl-10 pr-11 h-11 border-gray-200 bg-white"
                {...field}
              />
            </FormControl>
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <FormMessage className="text-xs" />
        </FormItem>
      )} />

      {otpError && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
          <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          {otpError}
        </div>
      )}

      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-1">
        <Button
          type="submit"
          disabled={sendingOtp}
          className="w-full h-12 font-bold text-base text-white"
          style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}
        >
          {sendingOtp
            ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Sending OTP…</span>
            : <span className="flex items-center gap-2"><Mail className="w-4 h-4" />Continue — Send OTP</span>}
        </Button>
      </motion.div>
    </>
  );
}
