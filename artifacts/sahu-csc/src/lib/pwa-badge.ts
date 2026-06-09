export function updateAppBadge(count: number) {
  if (typeof navigator === "undefined") return;
  if ("setAppBadge" in navigator) {
    try {
      if (count > 0) {
        (navigator as any).setAppBadge(count);
      } else {
        (navigator as any).clearAppBadge();
      }
    } catch {}
  }
}
