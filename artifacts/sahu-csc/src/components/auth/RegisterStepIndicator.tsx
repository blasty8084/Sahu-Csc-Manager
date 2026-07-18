/**
 * RegisterStepIndicator — OTP verification header shown in step 2 of registration.
 * Displays the shield icon, "Verify your email" heading, masked email, and inbox tip.
 */
import { ShieldCheck } from "lucide-react";
import { maskEmail } from "./registerTypes";

interface Props {
  email: string;
}

export function RegisterStepIndicator({ email }: Props) {
  return (
    <div className="flex flex-col items-center mb-6">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-3"
        style={{ background: "#dcfce7" }}
      >
        <ShieldCheck className="w-6 h-6 text-emerald-600" />
      </div>
      <h3 className="text-gray-900 font-bold text-base">Verify your email</h3>
      <p className="text-gray-500 text-xs mt-1 text-center max-w-xs">
        We sent a 6-digit code to{" "}
        <span className="font-semibold text-gray-700">{maskEmail(email)}</span>
      </p>
      <p className="text-gray-400 text-[10px] mt-0.5">Check your inbox and spam folder</p>
    </div>
  );
}
