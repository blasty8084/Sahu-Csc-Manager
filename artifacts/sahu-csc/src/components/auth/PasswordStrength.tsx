/**
 * PasswordStrength — animated strength bar + per-rule checklist for a password field.
 * Returns null when password is empty.
 */
import { CheckCircle2 } from "lucide-react";

const CHECKS = [
  { label: "8+ chars",         test: (p: string) => p.length >= 8 },
  { label: "Uppercase",        test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase",        test: (p: string) => /[a-z]/.test(p) },
  { label: "Number",           test: (p: string) => /[0-9]/.test(p) },
  { label: "Special (@#$!…)",  test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const COLORS = [
  "bg-red-400", "bg-orange-400", "bg-yellow-400",
  "bg-yellow-500", "bg-green-400", "bg-green-500",
];

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = CHECKS.map((c) => ({ ...c, ok: c.test(password) }));
  const score = checks.filter((c) => c.ok).length;
  return (
    <div className="mt-1.5 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i < score ? COLORS[score] : "bg-gray-200"}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`text-[10px] flex items-center gap-0.5 ${c.ok ? "text-green-600" : "text-gray-400"}`}
          >
            <CheckCircle2 className={`w-2.5 h-2.5 ${c.ok ? "text-green-500" : "text-gray-300"}`} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
