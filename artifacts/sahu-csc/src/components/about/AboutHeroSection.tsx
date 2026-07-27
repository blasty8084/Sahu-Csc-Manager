declare const __APP_VERSION__: string;
const APP_VERSION = __APP_VERSION__;

export default function AboutHeroSection() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, var(--brand-navy-800) 0%, var(--brand-navy-600) 60%, var(--brand-navy-700) 100%)" }}>
      <div style={{ height: 3, background: "linear-gradient(90deg, var(--brand-orange), var(--brand-orange-400), var(--brand-orange-300))" }} />
      <div className="px-4 py-4 sm:px-6 sm:py-5 flex items-center gap-3 sm:gap-4">
        <div
          className="flex items-center justify-center rounded-2xl flex-shrink-0"
          style={{ width: 52, height: 52, background: "var(--brand-white-mid)", border: "2px solid var(--brand-white-high)" }}
        >
          <img src="/sahu-logo.png" alt="SAHU CSC" className="w-9 h-9 object-contain rounded-xl" loading="lazy" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-black text-white">SAHU <span style={{ color: "var(--brand-orange)" }}>CSC</span></h1>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: "var(--brand-orange-tint-md)", color: "var(--brand-orange-400)", border: "1px solid var(--brand-orange-border)" }}
            >
              v{APP_VERSION}
            </span>
          </div>
          <p className="text-white/60 text-xs mt-0.5">Management Platform · Odisha CSC</p>
        </div>
        <div className="hidden sm:block text-right flex-shrink-0">
          <p className="text-white/40 text-[10px]">Last updated</p>
          <p className="text-white/60 text-xs font-semibold">27 July 2026 · v4</p>
        </div>
      </div>
    </div>
  );
}
