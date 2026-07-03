import type { CSSProperties } from "react";

function Pulse({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={`animate-pulse rounded bg-slate-100 ${className ?? ""}`} style={style} />;
}

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
