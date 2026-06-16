import React from "react";

function Shimmer({ className }: { className: string }) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted)/0.5) 50%, hsl(var(--muted)) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite linear",
      }}
    />
  );
}

function MobilePageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-background md:hidden">
      {/* Top header bar — matches the real navy header */}
      <div className="h-14 bg-sidebar flex items-center px-4 gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bg-white/10" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-20 rounded bg-white/15" />
          <div className="h-2 w-28 rounded bg-white/8" />
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10" />
      </div>

      {/* Page content shimmer */}
      <div className="flex-1 p-4 pb-24 space-y-4 overflow-hidden">
        {/* Greeting row */}
        <div className="space-y-2 pt-1">
          <Shimmer className="h-3 w-32 rounded-full" />
          <Shimmer className="h-5 w-52 rounded-full" />
        </div>

        {/* 2×2 stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-2">
              <Shimmer className="h-9 w-9 rounded-xl" />
              <Shimmer className="h-2.5 w-14 rounded-full" />
              <Shimmer className="h-5 w-20 rounded-full" />
              <Shimmer className="h-2 w-24 rounded-full" />
            </div>
          ))}
        </div>

        {/* Quick actions row */}
        <div className="space-y-2">
          <Shimmer className="h-2.5 w-24 rounded-full" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl py-4 px-1 flex flex-col items-center gap-2">
                <Shimmer className="h-9 w-9 rounded-xl" />
                <Shimmer className="h-2 w-10 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* List rows */}
        <div className="space-y-2">
          <Shimmer className="h-2.5 w-32 rounded-full" />
          {[...Array(4)].map((_, i) => (
            <Shimmer key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex items-center px-4 z-30">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <Shimmer className="h-5 w-5 rounded" />
            <Shimmer className="h-2 w-8 rounded-full" />
          </div>
        ))}
      </nav>
    </div>
  );
}

function DesktopPageSkeleton() {
  return (
    <div className="hidden md:flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 fixed inset-y-0 bg-sidebar flex flex-col p-4 gap-3">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="w-11 h-11 rounded-full bg-white/10" />
          <div className="space-y-1.5">
            <div className="h-3 w-20 rounded bg-white/15" />
            <div className="h-2 w-28 rounded bg-white/8" />
          </div>
        </div>
        <div className="flex-1 space-y-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-white/5 flex items-center px-3 gap-3">
              <div className="w-4 h-4 rounded bg-white/10" />
              <div className="h-2.5 rounded-full bg-white/10" style={{ width: `${50 + (i * 13) % 35}%` }} />
            </div>
          ))}
        </div>
        <div className="h-14 rounded-2xl bg-white/8" />
      </div>

      {/* Main content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Top bar */}
        <div className="h-16 border-b border-border flex items-center justify-between px-8 shrink-0">
          <div className="space-y-1.5">
            <Shimmer className="h-5 w-28 rounded-full" />
            <Shimmer className="h-3 w-40 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <Shimmer className="h-8 w-32 rounded-md" />
            <Shimmer className="h-8 w-8 rounded-full" />
          </div>
        </div>

        {/* Page content */}
        <div className="p-8 space-y-5 overflow-hidden">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <div className="flex justify-between">
                  <Shimmer className="h-3 w-16 rounded-full" />
                  <Shimmer className="h-9 w-9 rounded-xl" />
                </div>
                <Shimmer className="h-7 w-32 rounded-full" />
                <Shimmer className="h-2.5 w-24 rounded-full" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-card border border-border rounded-2xl p-5 space-y-4">
              <Shimmer className="h-4 w-32 rounded-full" />
              <Shimmer className="h-36 w-full rounded-xl" />
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <Shimmer className="h-4 w-24 rounded-full" />
              {[...Array(5)].map((_, i) => (
                <Shimmer key={i} className="h-10 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <MobilePageSkeleton />
      <DesktopPageSkeleton />
    </>
  );
}
