/**
 * RegionBlocked — full-screen wall shown when the user's region is outside India.
 * Rendered before auth so there's nothing to interact with / bypass.
 */

export default function RegionBlocked() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
      style={{
        background: "linear-gradient(160deg, var(--brand-navy-900) 0%, var(--brand-navy-800) 60%, var(--brand-navy-750) 100%)",
      }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 340,
          height: 340,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, var(--brand-orange-tint-xs) 0%, transparent 70%)",
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 flex flex-col items-center gap-5 rounded-3xl px-8 py-10 mx-4 text-center"
        style={{
          maxWidth: 440,
          background: "var(--brand-white-low)",
          border: "1px solid var(--brand-white-low)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Flag */}
        <div className="text-7xl" aria-hidden="true">🇮🇳</div>

        {/* Title */}
        <div>
          <h1 className="text-white text-2xl font-black tracking-tight">
            SAHU <span style={{ color: "var(--brand-orange)" }}>CSC</span>
          </h1>
          <p className="text-white/50 text-xs mt-1 font-medium tracking-widest uppercase">
            India · Only
          </p>
        </div>

        {/* Divider */}
        <div
          className="w-16 rounded-full"
          style={{ height: 2, background: "linear-gradient(90deg, var(--brand-orange), var(--brand-orange-300))" }}
        />

        {/* Messages in all three app languages */}
        <div className="space-y-3">
          <p className="text-white/90 text-sm leading-relaxed font-medium">
            This service is available to users in{" "}
            <span style={{ color: "var(--brand-orange)" }}>India only</span>.
          </p>
          <p className="text-white/70 text-sm leading-relaxed">
            यह सेवा केवल <span style={{ color: "var(--brand-orange)" }}>भारत</span> में उपलब्ध है।
          </p>
          <p className="text-white/70 text-sm leading-relaxed">
            ଏହି ସେବା କେବଳ <span style={{ color: "var(--brand-orange)" }}>ଭାରତ</span>ରେ ଉପଲବ୍ଧ।
          </p>
        </div>

        {/* Footer note */}
        <p className="text-white/30 text-[11px] leading-relaxed">
          If you are accessing from India and see this message,
          please contact your service provider.
        </p>
      </div>

      {/* Bottom brand */}
      <p className="absolute bottom-6 text-white/20 text-[10px] tracking-widest uppercase">
        CSC · Odisha · India
      </p>
    </div>
  );
}
