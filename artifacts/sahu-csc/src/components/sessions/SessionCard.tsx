import { Trash2, MapPin, Clock, Globe, Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Shared type ─────────────────────────────────────────────────────────────
export interface SessionEntry {
  id: number;
  sessionId: string;
  deviceInfo: string;
  browser: string;
  os: string;
  ipAddress: string;
  rememberMe: boolean;
  isCurrent: boolean;
  lastActivity: string;
  expiresAt: string;
  createdAt: string;
}

// ─── Shared API utility ───────────────────────────────────────────────────────
export async function apiFetch(path: string, options?: RequestInit) {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
  const res = await fetch(`${base}/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Request failed");
  }
  return res.json().catch(() => ({}));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function deviceIcon(os: string) {
  const lower = os.toLowerCase();
  if (/android.*mobile|iphone|ipod|windows phone/i.test(lower)) return Smartphone;
  if (/ipad|tablet|android(?!.*mobile)/i.test(lower)) return Tablet;
  return Monitor;
}

export function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function formatExpiry(iso: string) {
  const expiry = new Date(iso);
  const diff = expiry.getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `Expires in ${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `Expires in ${hours}h ${mins}m`;
  return `Expires in ${mins}m`;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface SessionCardProps {
  session: SessionEntry;
  /** When provided, renders a Revoke button. */
  onRevoke?: () => void;
  revokeDisabled?: boolean;
}

/** Device row — browser, OS, IP, last-active, expiry, and optional revoke button. */
export function SessionCard({ session, onRevoke, revokeDisabled }: SessionCardProps) {
  const DevIcon = deviceIcon(session.os);
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
        <DevIcon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">{session.browser}</span>
          <span className="text-muted-foreground text-xs">on</span>
          <span className="text-sm">{session.os}</span>
          {session.rememberMe && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0">Remember Me</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-2.5 h-2.5" />{session.ipAddress}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-2.5 h-2.5" />{timeAgo(session.lastActivity)}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Globe className="w-2.5 h-2.5" />{formatDate(session.createdAt)}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatExpiry(session.expiresAt)}</p>
      </div>
      {onRevoke && (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 mt-0.5 flex-shrink-0"
          onClick={onRevoke}
          disabled={revokeDisabled}
        >
          <Trash2 className="w-3.5 h-3.5" /> Revoke
        </Button>
      )}
    </div>
  );
}
