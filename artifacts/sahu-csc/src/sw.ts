/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { StaleWhileRevalidate, NetworkFirst, CacheFirst, NetworkOnly } from "workbox-strategies";
import { BackgroundSyncPlugin } from "workbox-background-sync";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { enable as enableNavigationPreload } from "workbox-navigation-preload";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

enableNavigationPreload();

// Precache all Vite build assets (manifest injected by vite-plugin-pwa)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => { event.waitUntil(self.clients.claim()); });

// ─── Background Sync: offline queue for POST requests ────────────
const ledgerBgSync = new BackgroundSyncPlugin("offline-ledger-queue", {
  maxRetentionTime: 24 * 60,
});
const aepsBgSync = new BackgroundSyncPlugin("offline-aeps-queue", {
  maxRetentionTime: 24 * 60,
});

// ─── Runtime Caching ─────────────────────────────────────────────

// Auth — always network only, never cache
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/auth/"),
  new NetworkOnly()
);

// Push API — network only
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/push/"),
  new NetworkOnly()
);

// Dashboard — stale-while-revalidate (5 min)
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/dashboard"),
  new StaleWhileRevalidate({
    cacheName: "api-dashboard",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 5 * 60 }),
    ],
  })
);

// Reports — stale-while-revalidate (10 min)
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/reports"),
  new StaleWhileRevalidate({
    cacheName: "api-reports",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 10 * 60 }),
    ],
  })
);

// Settings & Preferences — stale-while-revalidate (30 min)
registerRoute(
  ({ url }) =>
    url.pathname.startsWith("/api/settings") ||
    url.pathname.startsWith("/api/preferences"),
  new StaleWhileRevalidate({
    cacheName: "api-settings",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 30 * 60 }),
    ],
  })
);

// Profile — stale-while-revalidate (5 min)
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/profile"),
  new StaleWhileRevalidate({
    cacheName: "api-profile",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 5 * 60 }),
    ],
  })
);

// Services — network-first (1 hr)
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/services"),
  new NetworkFirst({
    cacheName: "api-services",
    networkTimeoutSeconds: 8,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 }),
    ],
  })
);

// Ledger GET — network-first (5 min)
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith("/api/ledger") && request.method === "GET",
  new NetworkFirst({
    cacheName: "api-ledger",
    networkTimeoutSeconds: 8,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 5 * 60 }),
    ],
  })
);

// Ledger POST — background sync when offline
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith("/api/ledger") && request.method === "POST",
  new NetworkOnly({ plugins: [ledgerBgSync] }),
  "POST"
);

// AePS GET — network-first (5 min)
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith("/api/aeps") && request.method === "GET",
  new NetworkFirst({
    cacheName: "api-aeps",
    networkTimeoutSeconds: 8,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 5 * 60 }),
    ],
  })
);

// AePS POST — background sync when offline
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith("/api/aeps") && request.method === "POST",
  new NetworkOnly({ plugins: [aepsBgSync] }),
  "POST"
);

// Notifications — network-first (2 min)
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/notifications"),
  new NetworkFirst({
    cacheName: "api-notifications",
    networkTimeoutSeconds: 8,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 2 * 60 }),
    ],
  })
);

// Images — cache-first (30 days)
registerRoute(
  ({ url }) => /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/.test(url.pathname),
  new CacheFirst({
    cacheName: "image-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// Fonts — cache-first (1 year)
registerRoute(
  ({ url }) => /\.(?:woff2|woff|ttf|eot)$/.test(url.pathname),
  new CacheFirst({
    cacheName: "font-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
);

// Navigation (SPA) — serve cached app shell, exclude API and special routes
const handler = createHandlerBoundToURL("/");
const navigationRoute = new NavigationRoute(handler, {
  denylist: [/^\/api\//, /^\/share-target/, /^\/open-file/],
});
registerRoute(navigationRoute);

// ─── Push Notifications ───────────────────────────────────────────
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? "SAHU CSC";
  const options = {
    body: data.body ?? "You have a new notification",
    icon: "/pwa-192x192.png",
    badge: "/pwa-96x96.png",
    tag: data.tag ?? "sahu-csc-notif",
    data: { url: data.url ?? "/" },
    vibrate: [200, 100, 200],
    requireInteraction: data.requireInteraction ?? false,
    actions: data.actions ?? [],
  } as NotificationOptions;
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data?.url ?? "/") as string;
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            return (client as WindowClient).navigate(targetUrl);
          }
        }
        return self.clients.openWindow(targetUrl);
      })
  );
});

self.addEventListener("notificationclose", (event) => {
  console.info("[SW] Notification closed:", event.notification.tag);
});

// ─── Periodic Background Sync ─────────────────────────────────────
self.addEventListener("periodicsync", (event: any) => {
  if (event.tag === "sync-ledger-data") {
    event.waitUntil(
      Promise.all([
        fetch("/api/dashboard").catch(() => {}),
        fetch("/api/ledger?limit=10").catch(() => {}),
      ])
    );
  }
});

// ─── Background Sync complete — notify page ───────────────────────
self.addEventListener("sync", (event: any) => {
  if ((event.tag as string).startsWith("workbox-background-sync:")) {
    event.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: "BACKGROUND_SYNC_COMPLETE", tag: event.tag })
        );
      })
    );
  }
});

// ─── Message handler ──────────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "REGISTER_PERIODIC_SYNC") {
    // Acknowledged — periodic sync is registered from the page
  }
});
