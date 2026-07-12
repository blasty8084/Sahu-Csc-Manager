import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import type { SessionEntry } from "@/components/profile/types";
import { deviceIcon, timeAgo, formatExpiry } from "@/components/profile/utils";

interface SessionCardProps {
  session: SessionEntry;
  compact?: boolean;
}

export function SessionCard({ session, compact = false }: SessionCardProps) {
  const DevIcon = deviceIcon(session.os);
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <DevIcon size={15} className="text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-sm">{session.browser}</span>
          <span className="text-muted-foreground text-xs">on</span>
          <span className="text-sm">{session.os}</span>
          {session.isCurrent && <Badge variant="default" className="text-[9px] px-1.5 py-0">This Device</Badge>}
          {session.rememberMe && <Badge variant="outline" className="text-[9px] px-1.5 py-0">Remember Me</Badge>}
        </div>
        {!compact && (
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={10} />{session.ipAddress}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock size={10} />{timeAgo(session.lastActivity)}</span>
          </div>
        )}
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatExpiry(session.expiresAt)}</p>
      </div>
    </div>
  );
}
