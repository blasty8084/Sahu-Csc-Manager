/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

import { clientsClaim } from "workbox-core";
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import {
  NetworkOnly,
  StaleWhileRevalidate,
  NetworkFirst,
  CacheFirst,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { BackgroundSyncPlugin } from "workbox-background-sync";

// ─── Core ─────────────────────────────────────────────────────────────────────
self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

// ─── Precaching (injected by vite-plugin-pwa) ─────────────────────────────────
precacheAndRoute(self.__WB_MANIFEST);

// ─── Navigation fallback (SPA) ────────────────────────────────────────────────
const navRoute = new NavigationRoute(
  new NetworkFirst({
    cacheName: "navigate",
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
  { denylist: [/^\/api\//] },
);
registerRoute(navRoute);

// ─── Background Sync — retry failed ledger writes ─────────────────────────────
const ledgerSyncPlugin = new BackgroundSyncPlugin("ledger-bg-sync", {
  maxRetentionTime: 24 * 60, // 24 hours in minutes
});

// ─── API routes ───────────────────────────────────────────────────────────────
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/auth/"),
  new NetworkOnly(),
);

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/dashboard"),
  new StaleWhileRevalidate({
    cacheName: "api-dashboard",
    plugins: [
      new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 5 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/reports"),
  new StaleWhileRevalidate({
    cacheName: "api-reports",
    plugins: [
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 10 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/settings"),
  new StaleWhileRevalidate({
    cacheName: "api-settings",
    plugins: [
      new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 30 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/profile"),
  new StaleWhileRevalidate({
    cacheName: "api-profile",
    plugins: [
      new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 5 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/preferences"),
  new StaleWhileRevalidate({
    cacheName: "api-preferences",
    plugins: [
      new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 30 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/services"),
  new NetworkFirst({
    cacheName: "api-services",
    networkTimeoutSeconds: 8,
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

// Ledger GETs — NetworkFirst with background sync for mutating requests
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith("/api/ledger") && request.method === "GET",
  new NetworkFirst({
    cacheName: "api-ledger",
    networkTimeoutSeconds: 8,
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 5 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

// Ledger mutations — queue for Background Sync when offline
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith("/api/ledger") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(request.method),
  new NetworkOnly({ plugins: [ledgerSyncPlugin] }),
  "POST",
);
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith("/api/ledger") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(request.method),
  new NetworkOnly({ plugins: [ledgerSyncPlugin] }),
  "PUT",
);
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith("/api/ledger") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(request.method),
  new NetworkOnly({ plugins: [ledgerSyncPlugin] }),
  "DELETE",
);

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/notifications"),
  new NetworkFirst({
    cacheName: "api-notifications",
    networkTimeoutSeconds: 8,
    plugins: [
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 2 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

// ─── Static assets ────────────────────────────────────────────────────────────
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "image-cache",
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

registerRoute(
  ({ request }) => request.destination === "font",
  new CacheFirst({
    cacheName: "font-cache",
    plugins: [
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

// ─── Push notifications ───────────────────────────────────────────────────────
self.addEventListener("push", (event: PushEvent) => {
  const data = event.data?.json() as {
    title?: string;
    body?: string;
    url?: string;
    type?: string;
  } | null ?? {};

  const title = data.title ?? "SAHU CSC";
  const body = data.body ?? "You have a new notification.";
  const url = data.url ?? "/notifications";

  const options = {
    body,
    icon: "/pwa-192x192.png",
    badge: "/pwa-96x96.png",
    data: { url },
    actions: [
      { action: "open", title: "Open" },
      { action: "dismiss", title: "Dismiss" },
    ],
    requireInteraction: false,
    silent: false,
  } as NotificationOptions;

  event.waitUntil(self.registration.showNotification(title, options));
});

// ─── Notification click ───────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl: string = (event.notification.data as { url?: string })?.url ?? "/notifications";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list): Promise<unknown> => {
        for (const client of list) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            (client as WindowClient).navigate(targetUrl);
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      }),
  );
});

// ─── Periodic background sync ─────────────────────────────────────────────────
self.addEventListener("periodicsync", (event: Event) => {
  const periodicEvent = event as unknown as {
    tag: string;
    waitUntil: (p: Promise<unknown>) => void;
  };
  if (periodicEvent.tag === "sync-ledger-data") {
    periodicEvent.waitUntil(
      fetch("/api/dashboard", { credentials: "include" }).catch(() => {}),
    );
  }
});

// ─── Background sync event (manual from sync-engine) ─────────────────────────
self.addEventListener("sync", (event: Event) => {
  const syncEvent = event as unknown as {
    tag: string;
    waitUntil: (p: Promise<unknown>) => void;
  };
  if (syncEvent.tag === "ledger-bg-sync") {
    syncEvent.waitUntil(
      self.clients.matchAll({ type: "window" }).then((list) => {
        list.forEach((c) => c.postMessage({ type: "BG_SYNC_TRIGGERED" }));
      }),
    );
  }
});

// ─── Message handler ──────────────────────────────────────────────────────────
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
