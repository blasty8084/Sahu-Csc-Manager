import { Pulse } from "../skeletons/Pulse";

export function AepsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 14px rgba(11,44,96,0.09)" }}>
        <Pulse className="h-1 w-full rounded-none" style={{ background: "rgba(249,115,22,0.15)" }} />
        <div className="px-5 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Pulse className="h-3 w-28" />
              <Pulse className="h-9 w-36" />
            </div>
            <Pulse className="w-12 h-12 rounded-2xl flex-shrink-0" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Pulse className="h-14 rounded-xl" />
            <Pulse className="h-14 rounded-xl" />
          </div>
          <div className="flex gap-2">
            <Pulse className="h-10 flex-1 rounded-xl" />
            <Pulse className="h-10 flex-1 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 border border-border">
            <Pulse className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Pulse className="h-3.5 w-24" />
              <Pulse className="h-3 w-16" />
            </div>
            <Pulse className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
