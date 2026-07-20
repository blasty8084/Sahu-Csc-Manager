import { Pulse } from "../skeletons/Pulse";

export function LedgerSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 border border-border shadow-sm">
          <Pulse className="w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <Pulse className="h-3.5 w-32" />
            <Pulse className="h-3 w-20" />
          </div>
          <div className="flex-shrink-0 text-right space-y-1">
            <Pulse className="h-4 w-16" />
            <Pulse className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LedgerBalanceSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm mb-4">
      <Pulse className="h-1 w-full rounded-none" style={{ background: "rgba(11,44,96,0.1)" }} />
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="space-y-1.5">
          <Pulse className="h-3 w-20" />
          <Pulse className="h-8 w-28" />
        </div>
        <Pulse className="w-11 h-11 rounded-xl flex-shrink-0" />
      </div>
    </div>
  );
}
