import { lazy, Suspense, useRef, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Layout } from "@/components/layout";

// Lazy-load chart-heavy report components so vendor-charts (410 kB) is only
// fetched when the page mounts — not bundled with the main app shell.
const MobileReports = lazy(() => import("@/components/reports/MobileReports"));
const DesktopReports = lazy(() => import("@/components/reports/DesktopReports"));

/** Triggers once when the sentinel div enters the viewport (200 px look-ahead). */
function useIntersectionOnce(rootMargin = "200px") {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible, rootMargin]);

  return { ref, visible };
}

// ══════════════════════════════════════════════════════════════════════════════
// ENTRY POINT
// ══════════════════════════════════════════════════════════════════════════════
export default function Reports() {
  const isMobile = useIsMobile();
  const { ref, visible } = useIntersectionOnce("0px");

  return (
    <Layout>
      {/* Sentinel div — IntersectionObserver fires as soon as it is in view.
          min-height keeps the layout stable while the chunk loads. */}
      <div ref={ref} style={{ minHeight: "60vh" }}>
        <Suspense
          fallback={
            <div className="space-y-4 p-4">
              <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
              <div className="h-64 rounded-2xl bg-muted animate-pulse" />
              <div className="h-64 rounded-2xl bg-muted animate-pulse" />
            </div>
          }
        >
          {visible && (isMobile ? <MobileReports /> : <DesktopReports />)}
        </Suspense>
      </div>
    </Layout>
  );
}
