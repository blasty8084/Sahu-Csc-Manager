import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf-8"));

const rawPort = process.env.PORT;
if (!rawPort) throw new Error("PORT environment variable is required but was not provided.");
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);

const basePath = process.env.BASE_PATH;
if (!basePath) throw new Error("BASE_PATH environment variable is required but was not provided.");

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

      // ── Custom service worker (injectManifest) ──────────────────
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",

      includeAssets: [
        "favicon.svg",
        "apple-touch-icon.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
      ],

      // ── Web App Manifest ────────────────────────────────────────
      manifest: {
        name: "SAHU CSC — Common Service Center",
        short_name: "SAHU CSC",
        description:
          "Business management platform for Common Service Centers — ledger, services, reports & more.",
        theme_color: "#0b2c60",
        background_color: "#ffffff",
        display: "standalone",
        display_override: [
          "window-controls-overlay",
          "standalone",
          "minimal-ui",
          "browser",
        ],
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/?source=pwa",
        id: "sahu-csc-app",
        categories: ["business", "finance", "productivity"],
        lang: "en-IN",
        dir: "ltr",

        // Age rating (IARC)
        iarc_rating_id: "e84b072d-71b3-4d3e-86ae-31a8ce4e53b7",

        // Launch handler — focus existing window instead of opening new one
        launch_handler: {
          client_mode: ["navigate-existing", "auto"],
        },

        // Note-taking capability — "New Entry" opens ledger
        note_taking: {
          new_note_url: "/ledger?new=1",
        },

        // Edge side panel support
        edge_side_panel: {
          preferred_width: 400,
        },

        // Scope extensions (allow same-origin subdomains)
        scope_extensions: [{ origin: "*.replit.app" }],

        // Related applications
        prefer_related_applications: false,
        related_applications: [
          {
            platform: "webapp",
            url: "https://sahu0924.replit.app/manifest.webmanifest",
            id: "sahu-csc-app",
          },
        ],

        // Icons
        icons: [
          { src: "pwa-96x96.png", sizes: "96x96", type: "image/png" },
          { src: "pwa-144x144.png", sizes: "144x144", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],

        // App shortcuts
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

        // Screenshots
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

        // Share target — receive shared text/links → open in ledger
        share_target: {
          action: "/share-target",
          method: "GET",
          params: { title: "title", text: "text", url: "url" },
        },

        // File handlers — open CSV/XLSX files in the app
        file_handlers: [
          {
            action: "/open-file",
            accept: {
              "text/csv": [".csv"],
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
              "application/vnd.ms-excel": [".xls"],
            },
            icons: [{ src: "pwa-96x96.png", sizes: "96x96" }],
            launch_type: "single-client",
          },
        ],

        // Protocol handler — deep-link into the app via web+sahucsc://
        protocol_handlers: [
          { protocol: "web+sahucsc", url: "/?action=%s" },
        ],

        // Home screen widgets (desktop / Android 12+)
        widgets: [
          {
            name: "SAHU CSC Balance",
            short_name: "Balance",
            description: "Current running balance at a glance",
            tag: "balance-widget",
            ms_ac_template: "/widgets/balance-template.json",
            data: "/api/dashboard",
            type: "application/json",
            screenshots: [],
            icons: [{ src: "pwa-96x96.png", sizes: "96x96" }],
            auth: true,
            update: 900,
          },
        ],
      } as any,

      // ── injectManifest workbox config ───────────────────────────
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webp}"],
        globIgnores: ["**/node_modules/**"],
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
