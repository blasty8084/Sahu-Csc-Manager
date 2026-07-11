import { Smartphone, Tablet, Monitor } from "lucide-react";

export interface UserForm {
  username: string;
  email: string;
  mobile: string;
  fullName: string;
  password: string;
  role: string;
  isActive: boolean;
}

export const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  operator: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  user: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

export type Tab = "pending" | "active" | "all" | "overview" | "aeps" | "sessions" | "appeals";

export function fmt(n: number) {
  return `₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export function getDeviceIcon(os: string) {
  const o = (os ?? "").toLowerCase();
  if (o.includes("android") || o.includes("ios")) return <Smartphone size={15} className="text-muted-foreground shrink-0" />;
  if (o.includes("ipad")) return <Tablet size={15} className="text-muted-foreground shrink-0" />;
  return <Monitor size={15} className="text-muted-foreground shrink-0" />;
}

export function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
