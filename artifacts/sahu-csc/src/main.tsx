import "./lib/i18n";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerSW } from "virtual:pwa-register";
import { syncEngine } from "./lib/sync-engine";

const swRegistration = registerSW({
  onNeedRefresh() {},
  onOfflineReady() {
    console.info("[PWA] App is ready to work offline");
  },
  onRegisteredSW(swUrl, r) {
    if (r) {
      // Check for SW updates every hour
      setInterval(async () => {
        if (!r.installing && navigator.onLine) {
          try {
            const resp = await fetch(swUrl, {
              cache: "no-store",
              headers: { cache: "no-store", "cache-control": "no-cache" },
            });
            if (resp?.status === 200) await r.update();
          } catch {}
        }
      }, 60 * 60 * 1000);

      // Register periodic background sync (hourly data refresh)
      r.active?.postMessage({ type: "REGISTER_PERIODIC_SYNC" });
      navigator.serviceWorker.ready.then(async (reg) => {
        if ("periodicSync" in reg) {
          try {
            const status = await navigator.permissions.query({
              name: "periodic-background-sync" as PermissionName,
            });
            if (status.state === "granted") {
              await (reg as any).periodicSync.register("sync-ledger-data", {
                minInterval: 60 * 60 * 1000, // 1 hour
              });
              console.info("[PWA] Periodic background sync registered");
            }
          } catch {
            // Periodic sync not supported or permission denied — silent fallback
          }
        }
      });
    }
  },
});

// Sync pending offline entries when coming back online
window.addEventListener("sahu-sync-complete", (e: Event) => {
  const detail = (e as CustomEvent).detail as { synced: number };
  console.info(`[Sync] ${detail.synced} offline entries synced to server`);
});

if (navigator.onLine) {
  syncEngine.sync().catch(() => {});
}

createRoot(document.getElementById("root")!).render(<App />);
