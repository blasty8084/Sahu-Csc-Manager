import { Pulse } from "../skeletons/Pulse";

export function UdhariListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm">
          <div className="px-4 py-3.5 flex items-center gap-3">
            <Pulse className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5 min-w-0">
              <Pulse className="h-3.5 w-32" />
              <Pulse className="h-3 w-24" />
            </div>
            <div className="flex-shrink-0 space-y-1 text-right">
              <Pulse className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function UdhariSummarySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 mb-3">
      {[0, 1].map((i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm">
          <Pulse className="h-[3px] w-full rounded-none" style={{ background: "rgba(11,44,96,0.1)" }} />
          <div className="p-3 space-y-1.5">
            <Pulse className="h-2.5 w-16" />
            <Pulse className="h-6 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function UdhariCustomerHeaderSkeleton() {
  return (
    <div className="space-y-4" style={{ minHeight: "60vh" }}>
      <div className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm">
        <Pulse className="h-1 w-full rounded-none" style={{ background: "rgba(11,44,96,0.1)" }} />
        <div className="px-5 py-5 flex items-center gap-4">
          <Pulse className="w-12 h-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Pulse className="h-4 w-36" />
            <Pulse className="h-3 w-24" />
          </div>
        </div>
        <div className="px-5 pb-5">
          <Pulse className="h-16 w-full rounded-xl" />
        </div>
      </div>
      <div className="flex gap-2">
        <Pulse className="h-10 flex-1 rounded-xl" />
        <Pulse className="h-10 flex-1 rounded-xl" />
      </div>
    </div>
  );
}
