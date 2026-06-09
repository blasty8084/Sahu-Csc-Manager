import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerSW } from "virtual:pwa-register";
import { syncEngine } from "./lib/sync-engine";

registerSW({
  onNeedRefresh() {},
  onOfflineReady() {
    console.info("[PWA] App is ready to work offline");
  },
  onRegisteredSW(swUrl, r) {
    if (r) {
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
    }
  },
});

window.addEventListener("sahu-sync-complete", (e: Event) => {
  const detail = (e as CustomEvent).detail as { synced: number };
  console.info(`[Sync] ${detail.synced} offline entries synced to server`);
});

if (navigator.onLine) {
  syncEngine.sync().catch(() => {});
}

createRoot(document.getElementById("root")!).render(<App />);
