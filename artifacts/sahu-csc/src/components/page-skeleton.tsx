import React from "react";

function Shimmer({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(90deg, rgba(11,44,96,0.07) 25%, rgba(11,44,96,0.03) 50%, rgba(11,44,96,0.07) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite linear",
        ...style,
      }}
    />
  );
}

function MobilePageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen md:hidden" style={{ background: "#f1f5f9" }}>

      {/* ── v2 Header: 3-layer matching real header ── */}
      <div className="shrink-0">
        {/* Layer 1: 3px gradient accent stripe */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #0b2c60, #f97316)" }} />

        {/* Layer 2: white frosted main bar (60px) */}
        <div
          className="flex items-center justify-between px-4"
          style={{ height: 60, background: "#fff", boxShadow: "0 1px 0 rgba(11,44,96,0.06)" }}
        >
          {/* Left: badge + brand text */}
          <div className="flex items-center gap-2.5">
            <div
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: "linear-gradient(135deg, #0b2c60 0%, #1a4a9e 100%)",
                opacity: 0.15,
              }}
            />
            <div className="space-y-1.5">
              <Shimmer className="h-3 w-16 rounded-full" />
              <Shimmer className="h-2 w-10 rounded-full" style={{ opacity: 0.6 }} />
            </div>
          </div>
          {/* Right: bell + avatar */}
          <div className="flex items-center gap-2">
            <Shimmer className="h-8 w-8 rounded-full" />
            <Shimmer className="h-8 w-8 rounded-full" />
          </div>
        </div>

        {/* Layer 3: navy greeting sub-bar (44px) */}
        <div
          className="flex items-center justify-between px-4"
          style={{
            height: 44,
            background: "linear-gradient(135deg, #0b2c60, #0f3872)",
          }}
        >
          <Shimmer className="h-2.5 w-28 rounded-full" style={{ background: "rgba(255,255,255,0.12)", backgroundSize: "200% 100%" }} />
          <Shimmer className="h-2 w-20 rounded-full" style={{ background: "rgba(255,255,255,0.08)", backgroundSize: "200% 100%" }} />
        </div>
      </div>

      {/* ── Page content ── */}
      <div className="flex-1 p-4 pb-24 space-y-4 overflow-hidden">

        {/* Stat cards 2×2 — white cards with accent stripe */}
        <div className="grid grid-cols-2 gap-3">
          {["#0b2c60", "#10b981", "#f43f5e", "#f97316"].map((accent, i) => (
            <div
              key={i}
              className="bg-white rounded-xl overflow-hidden"
              style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.07), 0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div style={{ height: 3, background: accent, opacity: 0.35 }} />
              <div className="p-4 space-y-2.5">
                <Shimmer className="h-8 w-8 rounded-lg" />
                <Shimmer className="h-2 w-16 rounded-full" />
                <Shimmer className="h-5 w-20 rounded-full" />
                <Shimmer className="h-2 w-12 rounded-full" style={{ opacity: 0.6 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions — 4 cols */}
        <div className="space-y-2.5">
          <Shimmer className="h-2.5 w-24 rounded-full" />
          <div className="grid grid-cols-4 gap-2.5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl py-4 px-2 flex flex-col items-center gap-2.5"
                style={{ boxShadow: "0 2px 8px rgba(11,44,96,0.07)" }}
              >
                <Shimmer className="h-10 w-10 rounded-xl" />
                <Shimmer className="h-2 w-10 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent transactions list */}
        <div className="space-y-2.5">
          <Shimmer className="h-2.5 w-32 rounded-full" />
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.07)" }}
          >
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < 3 ? "1px solid rgba(11,44,96,0.05)" : undefined }}
              >
                <Shimmer className="h-9 w-9 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Shimmer className="h-2.5 rounded-full" style={{ width: `${52 + (i * 23) % 30}%` }} />
                  <Shimmer className="h-2 w-20 rounded-full" style={{ opacity: 0.6 }} />
                </div>
                <Shimmer className="h-2.5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom nav bar ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center px-2 z-30"
        style={{ height: 64, background: "#fff", borderTop: "1px solid rgba(11,44,96,0.07)", boxShadow: "0 -2px 12px rgba(11,44,96,0.07)" }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 py-2">
            <Shimmer className="h-5 w-5 rounded-lg" />
            <Shimmer className="h-1.5 w-8 rounded-full" style={{ opacity: 0.6 }} />
          </div>
        ))}
      </nav>
    </div>
  );
}

function DesktopPageSkeleton() {
  return (
    <div className="hidden md:flex min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Sidebar */}
      <div
        className="w-64 fixed inset-y-0 flex flex-col"
        style={{ background: "linear-gradient(180deg, #0b2c60 0%, #0d3270 100%)" }}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-5 py-5 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-11 h-11 rounded-xl" style={{ background: "rgba(255,255,255,0.12)" }} />
          <div className="space-y-1.5">
            <div className="h-3 w-20 rounded" style={{ background: "rgba(255,255,255,0.2)" }} />
            <div className="h-2 w-28 rounded" style={{ background: "rgba(255,255,255,0.1)" }} />
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 p-3 space-y-1 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-xl flex items-center px-3 gap-3"
              style={{ background: i === 0 ? "rgba(249,115,22,0.18)" : "rgba(255,255,255,0.04)" }}
            >
              <div className="w-4 h-4 rounded" style={{ background: "rgba(255,255,255,0.12)" }} />
              <div
                className="h-2.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.10)", width: `${50 + (i * 13) % 35}%` }}
              />
            </div>
          ))}
        </div>

        {/* User profile card at bottom */}
        <div className="p-3 shrink-0">
          <div className="h-14 rounded-2xl flex items-center gap-3 px-3" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="w-9 h-9 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 w-20 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
              <div className="h-2 w-14 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-8 shrink-0"
          style={{ height: 64, background: "#fff", borderBottom: "1px solid rgba(11,44,96,0.07)", boxShadow: "0 1px 4px rgba(11,44,96,0.05)" }}
        >
          <div className="space-y-1.5">
            <Shimmer className="h-5 w-28 rounded-full" />
            <Shimmer className="h-3 w-40 rounded-full" style={{ opacity: 0.6 }} />
          </div>
          <div className="flex items-center gap-3">
            <Shimmer className="h-8 w-32 rounded-lg" />
            <Shimmer className="h-8 w-8 rounded-full" />
          </div>
        </div>

        {/* Page content */}
        <div className="p-8 space-y-5 overflow-hidden">
          {/* 4 stat cards */}
          <div className="grid grid-cols-4 gap-4">
            {["#0b2c60", "#10b981", "#f43f5e", "#f97316"].map((accent, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.08)" }}
              >
                <div style={{ height: 3, background: accent, opacity: 0.4 }} />
                <div className="p-5 space-y-3">
                  <div className="flex justify-between">
                    <Shimmer className="h-3 w-16 rounded-full" />
                    <Shimmer className="h-9 w-9 rounded-xl" />
                  </div>
                  <Shimmer className="h-7 w-32 rounded-full" />
                  <Shimmer className="h-2.5 w-24 rounded-full" style={{ opacity: 0.6 }} />
                </div>
              </div>
            ))}
          </div>

          {/* 2-col: chart + list */}
          <div className="grid grid-cols-3 gap-5">
            <div
              className="col-span-2 bg-white rounded-2xl p-6 space-y-4"
              style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.08)" }}
            >
              <Shimmer className="h-4 w-32 rounded-full" />
              <Shimmer className="h-40 w-full rounded-xl" />
            </div>
            <div
              className="bg-white rounded-2xl p-5 space-y-3"
              style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.08)" }}
            >
              <Shimmer className="h-4 w-24 rounded-full" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Shimmer className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Shimmer className="h-2.5 rounded-full" style={{ width: `${55 + (i * 17) % 30}%` }} />
                    <Shimmer className="h-2 w-16 rounded-full" style={{ opacity: 0.6 }} />
                  </div>
                  <Shimmer className="h-2.5 w-14 rounded-full" />
                </div>
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
