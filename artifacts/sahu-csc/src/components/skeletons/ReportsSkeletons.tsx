import { Pulse } from "./Pulse";

export function ReportsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm">
            <Pulse className="h-[3px] w-full rounded-none" style={{ background: "rgba(11,44,96,0.1)" }} />
            <div className="p-3 space-y-2">
              <Pulse className="h-2.5 w-20" />
              <Pulse className="h-6 w-24" />
              <Pulse className="h-2.5 w-14" />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-border shadow-sm p-4 space-y-3">
        <Pulse className="h-4 w-32" />
        <Pulse className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function RecentTxSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <Pulse className="h-3.5 w-8 flex-shrink-0" />
          <Pulse className="h-3.5 flex-1" />
          <Pulse className="h-3.5 w-20 flex-shrink-0" />
          <Pulse className="h-3.5 w-16 flex-shrink-0" />
          <Pulse className="h-3.5 w-14 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function ServicesSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
          <Pulse className="h-8 w-8 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Pulse className="h-3.5 w-32" />
            <Pulse className="h-2.5 w-20" />
          </div>
          <Pulse className="h-5 w-16 rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function BackupHistorySkeleton() {
  return (
    <div className="space-y-2 p-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
          <Pulse className="w-9 h-9 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <Pulse className="h-3.5 w-40" />
            <Pulse className="h-2.5 w-24" />
          </div>
          <Pulse className="h-7 w-20 rounded-md flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function BackupScheduleSkeleton() {
  return (
    <div className="space-y-4" style={{ minHeight: 80 }}>
      <div className="space-y-1.5">
        <Pulse className="h-3 w-24" />
        <Pulse className="h-9 w-full rounded-lg" />
      </div>
      <div className="space-y-1.5">
        <Pulse className="h-3 w-28" />
        <Pulse className="h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function AuditLogsSkeleton({ rows = 6, mobile = false }: { rows?: number; mobile?: boolean }) {
  if (mobile) {
    return (
      <div className="space-y-2">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="animate-pulse bg-card border rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Pulse className="h-5 w-24 rounded" />
              <Pulse className="h-3 w-28" />
            </div>
            <div className="flex items-center justify-between">
              <Pulse className="h-3.5 w-20" />
              <Pulse className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-border">
          {[28, 20, 16, 40, 20].map((w, j) => (
            <td key={j} className="px-4 py-3">
              <Pulse className={`h-3.5`} style={{ width: `${w}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
