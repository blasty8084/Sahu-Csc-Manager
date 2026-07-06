/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

import { clientsClaim } from "workbox-core";
import { precacheAndRoute, cleanupOutdatedCaches, matchPrecache } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { enable as enableNavigationPreload } from "workbox-navigation-preload";
import {
  NetworkOnly,
  StaleWhileRevalidate,
  NetworkFirst,
  CacheFirst,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { Queue } from "workbox-background-sync";
import type { WorkboxPlugin } from "workbox-core/types";

// ─── Core ─────────────────────────────────────────────────────────────────────
self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

// ─── Precaching (injected by vite-plugin-pwa) ─────────────────────────────────
precacheAndRoute(self.__WB_MANIFEST);

// ─── Navigation preload + offline app-shell fallback (PWABuilder pattern) ─────
// Enables the browser to start the network request in parallel with SW boot-up,
// then falls back to the precached SPA shell if the network is unreachable —
// same approach as PWABuilder's offline-page recipe, backed by Workbox's
// versioned precache instead of a hardcoded cache name.
if (self.registration.navigationPreload) {
  enableNavigationPreload();
}

self.addEventListener("fetch", (event: FetchEvent) => {
  if (event.request.mode !== "navigate") return;
  if (new URL(event.request.url).pathname.startsWith("/api/")) return;

  event.respondWith(
    (async () => {
      try {
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) return preloadResponse;
        return await fetch(event.request);
      } catch {
        const cachedShell =
          (await matchPrecache("index.html")) || (await matchPrecache("/"));
        return cachedShell ?? Response.error();
      }
    })(),
  );
});

// ─── Background Sync — retry failed ledger writes ─────────────────────────────
// A custom Queue (instead of BackgroundSyncPlugin) lets us read the live queue
// size and broadcast it to open tabs so the UI can show a real pending count.
const LEDGER_QUEUE_NAME = "ledger-bg-sync";

async function broadcastQueueSize(size: number) {
  const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  clientsList.forEach((c) =>
    c.postMessage({ type: "BG_SYNC_QUEUE_UPDATED", queue: LEDGER_QUEUE_NAME, size }),
  );
}

const ledgerQueue = new Queue(LEDGER_QUEUE_NAME, {
  maxRetentionTime: 24 * 60, // 24 hours in minutes
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request.clone());
      } catch (err) {
        await queue.unshiftRequest(entry);
        await broadcastQueueSize(await queue.size());
        throw err;
      }
    }
    await broadcastQueueSize(await queue.size());
    await self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => list.forEach((c) => c.postMessage({ type: "BG_SYNC_TRIGGERED" })));
  },
});

const ledgerSyncPlugin: WorkboxPlugin = {
  fetchDidFail: async ({ request }) => {
    await ledgerQueue.pushRequest({ request: request.clone() });
    await broadcastQueueSize(await ledgerQueue.size());
  },
};

// A second Queue for AePS + Udhari mutations. These pages primarily rely on
// the app-level `pending_actions` IndexedDB queue (offline-db.ts) for their
// UI, but this SW-level queue also catches failed requests that slip through
// (e.g. a request fired right as the network drops mid-flight) and retries
// them automatically via Background Sync, same as the ledger queue.
const APP_QUEUE_NAME = "app-bg-sync";

async function broadcastAppQueueSize(size: number) {
  const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  clientsList.forEach((c) =>
    c.postMessage({ type: "BG_SYNC_QUEUE_UPDATED", queue: APP_QUEUE_NAME, size }),
  );
}

const appQueue = new Queue(APP_QUEUE_NAME, {
  maxRetentionTime: 24 * 60,
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request.clone());
      } catch (err) {
        await queue.unshiftRequest(entry);
        await broadcastAppQueueSize(await queue.size());
        throw err;
      }
    }
    await broadcastAppQueueSize(await queue.size());
    await self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => list.forEach((c) => c.postMessage({ type: "BG_SYNC_TRIGGERED" })));
  },
});

const appSyncPlugin: WorkboxPlugin = {
  fetchDidFail: async ({ request }) => {
    await appQueue.pushRequest({ request: request.clone() });
    await broadcastAppQueueSize(await appQueue.size());
  },
};

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

// AePS GETs (daily session + all-transactions) — NetworkFirst so recently
// viewed sessions remain available offline
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith("/api/aeps") && request.method === "GET",
  new NetworkFirst({
    cacheName: "api-aeps",
    networkTimeoutSeconds: 8,
    plugins: [
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 5 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

// AePS mutations (open day, add/edit/delete transaction) — queue for
// Background Sync when offline; app also queues these itself for instant UI
// feedback (see offline-db.ts pending_actions + aeps.tsx)
for (const method of ["POST", "PUT", "PATCH", "DELETE"] as const) {
  registerRoute(
    ({ url, request }) =>
      url.pathname.startsWith("/api/aeps") && request.method === method,
    new NetworkOnly({ plugins: [appSyncPlugin] }),
    method,
  );
}

// Udhari GETs (customers list, summary, per-customer entries) — NetworkFirst
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith("/api/udhari") && request.method === "GET",
  new NetworkFirst({
    cacheName: "api-udhari",
    networkTimeoutSeconds: 8,
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 5 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

// Udhari mutations (customer/entry create/update/delete) — queue for
// Background Sync when offline
for (const method of ["POST", "PUT", "PATCH", "DELETE"] as const) {
  registerRoute(
    ({ url, request }) =>
      url.pathname.startsWith("/api/udhari") && request.method === method,
    new NetworkOnly({ plugins: [appSyncPlugin] }),
    method,
  );
}

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

  // Show the notification then sync the OS badge with the real server count.
  // Using an async IIFE inside waitUntil so the SW stays alive for the fetch.
  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, options);
      try {
        const res = await fetch("/api/notifications/unread-count", {
          credentials: "include",
        });
        if (res.ok) {
          const json: { count?: number } = await res.json();
          const unread = json.count ?? 0;
          if ("setAppBadge" in navigator) {
            unread > 0
              ? await (navigator as any).setAppBadge(unread)
              : await (navigator as any).clearAppBadge();
          }
        }
      } catch {
        // Offline or unauthenticated — badge corrects itself when the app opens.
      }
    })()
  );
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

// Note: the "sync" event for the ledger queue is handled internally by the
// `Queue`'s own registered listener (via its `onSync` callback above), which
// replays requests and broadcasts BG_SYNC_TRIGGERED / BG_SYNC_QUEUE_UPDATED.

// ─── Message handler ──────────────────────────────────────────────────────────
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "GET_BG_SYNC_COUNT") {
    event.waitUntil(
      Promise.all([
        ledgerQueue.size().then((size) => {
          event.source?.postMessage({ type: "BG_SYNC_QUEUE_UPDATED", queue: LEDGER_QUEUE_NAME, size });
        }),
        appQueue.size().then((size) => {
          event.source?.postMessage({ type: "BG_SYNC_QUEUE_UPDATED", queue: APP_QUEUE_NAME, size });
        }),
      ]),
    );
  }
});
