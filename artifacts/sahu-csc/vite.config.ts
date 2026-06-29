import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf-8"));

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 5000;
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);

const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",

      includeAssets: [
        "favicon.ico",
        "sahu-logo.png",
        "apple-touch-icon.png",
        "pwa-96x96.png",
        "pwa-144x144.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
      ],

      manifest: {
        name: "SAHU CSC — Common Service Center",
        short_name: "SAHU CSC",
        description:
          "Business management platform for Common Service Centers — ledger, services, reports & more.",
        theme_color: "#0b2c60",
        background_color: "#ffffff",
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone", "minimal-ui", "browser"],
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/?source=pwa",
        id: "sahu-csc-app",
        categories: ["business", "finance", "productivity"],
        lang: "en-IN",
        dir: "ltr",
        prefer_related_applications: false,
        launch_handler: {
          client_mode: ["navigate-existing", "auto"],
        },
        icons: [
          { src: "pwa-96x96.png", sizes: "96x96", type: "image/png" },
          { src: "pwa-144x144.png", sizes: "144x144", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
        shortcuts: [
          {
            name: "Dashboard",
            short_name: "Dashboard",
            description: "View today's summary and stats",
            url: "/?source=shortcut",
            icons: [{ src: "pwa-96x96.png", sizes: "96x96" }],
          },
          {
            name: "New Ledger Entry",
            short_name: "Ledger",
            description: "Open the ledger to add a new entry",
            url: "/ledger?new=1&source=shortcut",
            icons: [{ src: "pwa-96x96.png", sizes: "96x96" }],
          },
          {
            name: "AePS",
            short_name: "AePS",
            description: "AePS cash management",
            url: "/aeps?source=shortcut",
            icons: [{ src: "pwa-96x96.png", sizes: "96x96" }],
          },
          {
            name: "Reports",
            short_name: "Reports",
            description: "View daily and monthly reports",
            url: "/reports?source=shortcut",
            icons: [{ src: "pwa-96x96.png", sizes: "96x96" }],
          },
        ],
        screenshots: [
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "narrow",
            label: "SAHU CSC Dashboard",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "wide",
            label: "SAHU CSC Ledger",
          },
        ],
      } as any,

      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webp}"],
        navigateFallback: "/",
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^\/api\/auth\//,
            handler: "NetworkOnly",
          },
          {
            urlPattern: /^\/api\/dashboard/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-dashboard",
              expiration: { maxEntries: 5, maxAgeSeconds: 5 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^\/api\/reports/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-reports",
              expiration: { maxEntries: 20, maxAgeSeconds: 10 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^\/api\/settings/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-settings",
              expiration: { maxEntries: 5, maxAgeSeconds: 30 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^\/api\/profile/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-profile",
              expiration: { maxEntries: 5, maxAgeSeconds: 5 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^\/api\/preferences/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-preferences",
              expiration: { maxEntries: 5, maxAgeSeconds: 30 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^\/api\/services/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-services",
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^\/api\/ledger/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-ledger",
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^\/api\/notifications/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-notifications",
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 20, maxAgeSeconds: 2 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:woff2|woff|ttf|eot)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "font-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({ root: path.resolve(import.meta.dirname, "..") })
          ),
        ]
      : []),
    {
      name: "html-no-cache",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url ?? "";
          const isHtml = url === "/" || url.startsWith("/?") || url.endsWith(".html");
          if (isHtml) {
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
            res.setHeader("Pragma", "no-cache");
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react":  ["react", "react-dom"],
          "vendor-query":  ["@tanstack/react-query"],
          "vendor-motion": ["framer-motion"],
          "vendor-router": ["wouter"],
          "vendor-charts": ["recharts"],
          "vendor-ui":     ["lucide-react"],
        },
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: { strict: true },
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
