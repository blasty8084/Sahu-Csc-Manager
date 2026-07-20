import { Pulse } from "./Pulse";

export function NotificationsSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-xl px-4 py-3 flex items-start gap-3 border border-border shadow-sm">
          <Pulse className="w-9 h-9 rounded-xl flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Pulse className="h-3.5 w-40" />
              <Pulse className="h-3 w-10 flex-shrink-0" />
            </div>
            <Pulse className="h-3 w-full" />
            <Pulse className="h-3 w-3/4" />
          </div>
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

export function PreferencesSkeleton() {
  return (
    <div className="space-y-4 max-w-xl">
      {[120, 160, 100].map((w, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-5 space-y-3">
          <Pulse className="h-4 w-28" />
          <Pulse className={`h-10 w-full`} />
          {i === 1 && <Pulse className="h-10 w-full" />}
        </div>
      ))}
    </div>
  );
}

export function SessionsListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse flex items-start gap-3 p-3 rounded-lg border border-border bg-background">
          <Pulse className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Pulse className="h-3.5 w-40" />
            <Pulse className="h-2.5 w-28" />
          </div>
          <Pulse className="h-6 w-16 rounded-md flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function AdminSessionsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((g) => (
        <div key={g} className="rounded-xl border border-border bg-card p-3 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Pulse className="w-6 h-6 rounded-full flex-shrink-0" />
            <Pulse className="h-3 w-28" />
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 pl-2">
              <Pulse className="w-7 h-7 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <Pulse className="h-3 w-32" />
                <Pulse className="h-2.5 w-20" />
              </div>
              <Pulse className="h-6 w-16 rounded-md flex-shrink-0" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function UsersOverviewSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-3.5 flex items-center gap-3">
          <Pulse className="w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <Pulse className="h-3.5 w-32" />
            <Pulse className="h-2.5 w-20" />
          </div>
          <div className="flex-shrink-0 text-right space-y-1">
            <Pulse className="h-4 w-20" />
            <Pulse className="h-2.5 w-14" />
          </div>
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

export function ProfileToggleSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border" style={{ minHeight: 64 }}>
      <div className="flex items-center gap-3 flex-1">
        <Pulse className="w-9 h-9 rounded-full flex-shrink-0" />
        <div className="space-y-1.5">
          <Pulse className="h-3.5 w-32" />
          <Pulse className="h-2.5 w-44" />
        </div>
      </div>
      <Pulse className="h-6 w-11 rounded-full flex-shrink-0" />
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="space-y-4" style={{ minHeight: "60vh" }}>
      <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
        <Pulse className="w-16 h-16 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Pulse className="h-4 w-40" />
          <Pulse className="h-3 w-28" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-4 space-y-2">
            <Pulse className="h-3 w-24" />
            <Pulse className="h-9 w-full rounded-lg" />
          </div>
        ))}
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
