import { Pulse } from "../skeletons/Pulse";

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
