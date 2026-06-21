const routeImports: Record<string, () => Promise<unknown>> = {
  "/":               () => import("@/pages/dashboard"),
  "/ledger":         () => import("@/pages/ledger"),
  "/aeps":           () => import("@/pages/aeps"),
  "/services":       () => import("@/pages/services"),
  "/reports":        () => import("@/pages/reports"),
  "/notifications":  () => import("@/pages/notifications"),
  "/profile":        () => import("@/pages/profile"),
  "/sessions":       () => import("@/pages/sessions"),
  "/pwa-status":     () => import("@/pages/pwa-status"),
  "/download-app":   () => import("@/pages/download-app"),
  "/users":          () => import("@/pages/users"),
  "/audit-logs":     () => import("@/pages/audit-logs"),
  "/backups":        () => import("@/pages/backups"),
  "/server-health":  () => import("@/pages/server-health"),
};

const prefetched = new Set<string>();

export function prefetch(href: string): void {
  if (prefetched.has(href)) return;
  const loader = routeImports[href];
  if (!loader) return;
  prefetched.add(href);
  loader().catch(() => {
    prefetched.delete(href);
  });
}
