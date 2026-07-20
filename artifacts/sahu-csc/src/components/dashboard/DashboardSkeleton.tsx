import { Pulse } from "../skeletons/Pulse";

export function DashboardServicesSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-card rounded-xl px-4 py-3 flex items-center gap-3 border border-border shadow-sm">
          <Pulse className="w-4 h-4 flex-shrink-0" />
          <Pulse className="h-6 flex-1 rounded-full" />
          <div className="flex-shrink-0 text-right space-y-1">
            <Pulse className="h-3.5 w-14" />
            <Pulse className="h-3 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)" }}>
          <Pulse className="h-[3px] w-full rounded-none" style={{ background: "rgba(11,44,96,0.1)" }} />
          <div className="p-3.5 space-y-2.5">
            <div className="flex items-start justify-between">
              <Pulse className="h-2.5 w-20" />
              <Pulse className="w-[30px] h-[30px] rounded-xl flex-shrink-0" />
            </div>
            <Pulse className="h-6 w-24" />
            <Pulse className="h-2.5 w-16" />
          </div>
        </div>
      ))}
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
