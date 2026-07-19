import { Clock } from "lucide-react";

export function PendingSyncBanners({ pendingEntries, bgSyncCount }: { pendingEntries: any[]; bgSyncCount: number }) {
  return (
    <>
      {pendingEntries.length > 0 && (
        <div style={{ background: "rgba(251,191,36,0.07)", borderBottom: "1px solid rgba(251,191,36,0.18)", padding: "10px 22px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Clock size={13} style={{ color: "#d97706", flexShrink: 0 }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: "#92400e" }}>
            {pendingEntries.length} offline {pendingEntries.length === 1 ? "entry" : "entries"} pending sync — will upload when reconnected
          </p>
        </div>
      )}
      {bgSyncCount > 0 && (
        <div style={{ background: "rgba(124,58,237,0.06)", borderBottom: "1px solid rgba(124,58,237,0.16)", padding: "10px 22px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Clock size={13} style={{ color: "#7c3aed", flexShrink: 0 }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: "#5b21b6" }}>
            {bgSyncCount} {bgSyncCount === 1 ? "request" : "requests"} queued for background sync — the browser will retry automatically once connectivity is stable
          </p>
        </div>
      )}
    </>
  );
}
