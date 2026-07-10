import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { VitePWA } from "vite-plugin-pwa";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { readFileSync } from "fs";

function readMockupSandboxPort(): number | null {
  try {
    const raw = readFileSync(
      path.resolve(import.meta.dirname, "../.mockup-sandbox-port"),
      "utf-8",
    ).trim();
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

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
    // Compresses raster/SVG assets at build time (lossless-ish defaults) so
    // shipped bundles don't carry unnecessarily large images.
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 80 },
      svg: {
        multipass: true,
      },
    }),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [runtimeErrorOverlay()]
      : []),
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
          {
            name: "Settings",
            short_name: "Settings",
            description: "Application settings",
            url: "/profile?source=shortcut",
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
        share_target: {
          action: "/share-target",
          method: "GET",
          params: { title: "title", text: "text", url: "url" },
        },
        protocol_handlers: [
          { protocol: "web+sahucsc", url: "/?action=%s" },
        ],
        file_handlers: [
          {
            action: "/open-file",
            accept: {
              "text/csv": [".csv"],
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            },
          },
        ],
      } as any,

      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webp}"],
      },

      devOptions: {
        enabled: process.env.NODE_ENV !== "production",
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
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@tanstack/react-query",
      "framer-motion",
      "wouter",
      "lucide-react",
      "i18next",
      "react-i18next",
      "react-hook-form",
      "zod",
      "date-fns",
      "clsx",
      "tailwind-merge",
    ],
  },
  esbuild: {
    legalComments: "none",
    target: "esnext",
  },
  root: path.resolve(import.meta.dirname),
  build: {
    target: "esnext",
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react":   ["react", "react-dom"],
          "vendor-query":   ["@tanstack/react-query"],
          "vendor-motion":  ["framer-motion"],
          "vendor-router":  ["wouter"],
          "vendor-charts":  ["recharts"],
          "vendor-ui":      ["lucide-react"],
          "vendor-radix":   ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-popover", "@radix-ui/react-select", "@radix-ui/react-tabs", "@radix-ui/react-tooltip", "@radix-ui/react-toast", "@radix-ui/react-accordion", "@radix-ui/react-alert-dialog", "@radix-ui/react-avatar", "@radix-ui/react-checkbox", "@radix-ui/react-collapsible", "@radix-ui/react-context-menu", "@radix-ui/react-hover-card", "@radix-ui/react-label", "@radix-ui/react-menubar", "@radix-ui/react-navigation-menu", "@radix-ui/react-progress", "@radix-ui/react-radio-group", "@radix-ui/react-scroll-area", "@radix-ui/react-separator", "@radix-ui/react-slider", "@radix-ui/react-slot", "@radix-ui/react-switch", "@radix-ui/react-toggle", "@radix-ui/react-toggle-group"],
          "vendor-i18n":    ["i18next", "react-i18next"],
          "vendor-forms":   ["react-hook-form", "@hookform/resolvers", "zod"],
          "vendor-date":    ["date-fns", "react-day-picker"],
          "vendor-icons":   ["react-icons"],
          "vendor-misc":    ["sonner", "cmdk", "vaul", "embla-carousel-react", "input-otp", "react-resizable-panels", "next-themes"],
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
      ...(readMockupSandboxPort()
        ? {
            "/__mockup": {
              target: `http://localhost:${readMockupSandboxPort()}`,
              changeOrigin: true,
              ws: true,
            },
          }
        : {}),
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
