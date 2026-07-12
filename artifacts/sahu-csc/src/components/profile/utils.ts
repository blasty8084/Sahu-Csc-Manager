import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function deviceIcon(os: string): LucideIcon {
  if (/android.*mobile|iphone|ipod|windows phone/i.test(os)) return Smartphone;
  if (/ipad|tablet|android(?!.*mobile)/i.test(os)) return Tablet;
  return Monitor;
}

export function timeAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export function formatExpiry(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `Expires in ${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return hours > 0 ? `Expires in ${hours}h ${mins}m` : `Expires in ${mins}m`;
}

export async function apiFetch(path: string, options?: RequestInit): Promise<any> {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
  const res = await fetch(`${base}/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(b.error ?? "Request failed");
  }
  return res.json().catch(() => ({}));
}

export const LANG_META: Record<string, { flag: string; name: string; script: string }> = {
  en: { flag: "🇬🇧", name: "English", script: "English" },
  hi: { flag: "🇮🇳", name: "हिंदी",   script: "Hindi"   },
  or: { flag: "🇮🇳", name: "ଓଡ଼ିଆ",  script: "Odia"    },
};
