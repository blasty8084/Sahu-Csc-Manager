import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Smartphone, Monitor, Globe, Wifi, WifiOff, Database, Server, Shield,
  CheckCircle2, AlertCircle, Clock, BookOpen, Cpu, Cloud, Lock,
  Fingerprint, Bell, FileSpreadsheet, Download,
} from "lucide-react";

declare const __APP_VERSION__: string;
const APP_VERSION = __APP_VERSION__;

const CHANGELOG = [
  {
    date: "2026-06-18",
    changes: [
      "Auto receipt number (CSC-YYYY-NNNN) added to all ledger entries",
      "Service type dropdown now scrollable — all 22 services accessible",
      "Docs & System Requirements page added",
    ],
  },
  {
    date: "2026-06-17",
    changes: [
      "Forgot-password merged into single 4-step flow (identifier → OTP → new password → success)",
      "Accepts username, email, or mobile as reset identifier",
      "OTP resend timer raised to 120 seconds",
    ],
  },
  {
    date: "2026-06-16",
    changes: [
      "Mobile header v2: 3-layer frosted design (gradient accent stripe + white main bar + navy greeting sub-bar)",
      "Avatar chip replaces hamburger icon to open nav drawer",
      "Dashboard mobile cards v2: gradient accent stripe + gradient icon badge + shadow",
    ],
  },
  {
    date: "2026-06-15",
    changes: [
      "Multi-device session management with device info, browser, OS, IP tracking",
      "Session revocation: revoke individual, revoke others, revoke all",
      "Idle auto-logout after 30 min with 2-min warning dialog",
    ],
  },
  {
    date: "2026-06-14",
    changes: [
      "PWA offline mode: ledger entries queue offline, sync on reconnect",
      "Push notifications via VAPID web-push",
      "App & Offline Status page with live diagnostics",
    ],
  },
  {
    date: "2026-06-13",
    changes: [
      "Initial release: Ledger, AePS Cash, Reports, Services, Dashboard",
      "Role-based access: Admin + Operator + User",
      "PostgreSQL session store — sessions survive server restarts",
    ],
  },
];

const SYSTEM_REQUIREMENTS = [
  {
    platform: "Android",
    icon: Smartphone,
    iconColor: "#3ddc84",
    recommended: "Android 8.0+ (Oreo)",
    minimum: "Android 6.0 (Marshmallow)",
    browser: "Chrome 80+ (recommended) or Samsung Browser 12+",
    install: [
      "Open the app link in Chrome",
      'Tap "Add to Home Screen" banner at bottom',
      "Or tap the ⋮ menu → Add to Home screen",
      "App installs like a native app — no Play Store needed",
    ],
    note: "Works offline after first visit. Push notifications supported.",
    badge: "Full PWA Support",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    platform: "iOS / iPhone / iPad",
    icon: Smartphone,
    iconColor: "#007aff",
    recommended: "iOS 16.4+ for push notifications",
    minimum: "iOS 14.0",
    browser: "Safari (required for iOS PWA install)",
    install: [
      "Open the app link in Safari",
      'Tap the Share button (□↑) at the bottom',
      'Scroll down and tap "Add to Home Screen"',
      'Tap "Add" in the top-right corner',
    ],
    note: "Push notifications require iOS 16.4+ and Safari. Chrome/Firefox on iOS cannot install PWA.",
    badge: "PWA via Safari",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    platform: "Windows / Mac / Linux",
    icon: Monitor,
    iconColor: "#0b2c60",
    recommended: "Windows 10+, macOS 12+, Ubuntu 20.04+",
    minimum: "Any OS with a modern browser",
    browser: "Chrome 80+, Edge 80+, Firefox 90+ (Chrome/Edge recommended for PWA install)",
    install: [
      "Open the app link in Chrome or Edge",
      "Click the install icon (⊕) in the address bar",
      'Or click the browser menu → "Install SAHU CSC"',
      "App opens in its own window without browser UI",
    ],
    note: "Full offline support. Desktop notifications via browser. Excel export works on all platforms.",
    badge: "Full PWA Support",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    platform: "Web Browser (No Install)",
    icon: Globe,
    iconColor: "#f97316",
    recommended: "Any modern browser",
    minimum: "Chrome 60+, Firefox 70+, Safari 13+, Edge 80+",
    browser: "Use the app link directly — no installation required",
    install: [
      "Simply open the link in your browser",
      "Login with your username and password",
      "Bookmark the page for quick access",
      "All features work in the browser without install",
    ],
    note: "Some PWA features (offline mode, push notifications, home screen shortcut) require installation.",
    badge: "Works in Browser",
    badgeColor: "bg-amber-100 text-amber-700",
  },
];

const FEATURES = [
  { icon: BookOpen, label: "Ledger Management", desc: "Track all credits, debits, and running balance with auto receipt numbers" },
  { icon: Fingerprint, label: "AePS Cash Management", desc: "Daily AePS session tracking with opening balance and transactions" },
  { icon: FileSpreadsheet, label: "Reports & Excel Export", desc: "Daily, monthly, and service-wise reports with one-click Excel download" },
  { icon: Bell, label: "Push Notifications", desc: "Real-time alerts for large transactions and system events" },
  { icon: WifiOff, label: "Offline Mode", desc: "Create ledger entries offline; they auto-sync when you reconnect" },
  { icon: Shield, label: "Role-Based Access", desc: "Admin, Operator, and User roles with granular permissions" },
  { icon: Lock, label: "Account Security", desc: "5-attempt lockout, idle auto-logout, full audit trail" },
  { icon: Download, label: "Install as App", desc: "Install on any device as a PWA — works like a native app" },
];

const ARCH = [
  { layer: "Frontend", tech: "React 18 + Vite", detail: "TypeScript, Tailwind CSS v4, shadcn/ui components" },
  { layer: "State & Data", tech: "TanStack Query v5", detail: "Server state, caching, optimistic updates, offline sync" },
  { layer: "Offline Storage", tech: "IndexedDB", detail: "5 stores: pending ledger, cache, user session, reports, notifications" },
  { layer: "PWA", tech: "Workbox + Service Worker", detail: "Offline caching, background sync, push notifications, install prompt" },
  { layer: "API", tech: "Express 5 (Node.js 20)", detail: "TypeScript, OpenAPI spec → Orval codegen → typed hooks" },
  { layer: "Auth", tech: "express-session + bcrypt", detail: "PostgreSQL session store, multi-device sessions, RBAC" },
  { layer: "Database", tech: "PostgreSQL + Drizzle ORM", detail: "Type-safe queries, schema migrations, per-user data isolation" },
  { layer: "Push", tech: "VAPID web-push", detail: "Server-sent push notifications to subscribed devices" },
];

export default function About() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0b2c60 0%, #1a4a9e 60%, #0f3872 100%)" }}
        >
          <div style={{ height: 3, background: "linear-gradient(90deg, #0b2c60, #f97316, #fb923c)" }} />
          <div className="px-6 py-6 flex items-center gap-4">
            <div
              className="flex items-center justify-center rounded-2xl flex-shrink-0"
              style={{
                width: 56, height: 56,
                background: "rgba(255,255,255,0.12)",
                border: "2px solid rgba(255,255,255,0.18)",
              }}
            >
              <img src="/sahu-logo.png" alt="SAHU CSC" className="w-10 h-10 object-contain rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-white">SAHU <span style={{ color: "#f97316" }}>CSC</span></h1>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(249,115,22,0.25)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.3)" }}
                >
                  v{APP_VERSION}
                </span>
              </div>
              <p className="text-white/60 text-xs mt-0.5">Management Platform · Odisha CSC</p>
              <p className="text-white/40 text-[10px] mt-1">Last updated: June 2026</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="sysreq">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="sysreq">System Requirements</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="changelog">Changelog</TabsTrigger>
          </TabsList>

          {/* ── System Requirements ── */}
          <TabsContent value="sysreq" className="space-y-4 mt-4">
            {/* Feature list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="flex items-start gap-3 bg-card border rounded-xl p-3.5">
                    <div
                      className="flex items-center justify-center rounded-xl flex-shrink-0"
                      style={{ width: 36, height: 36, background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", boxShadow: "0 3px 8px rgba(11,44,96,0.25)" }}
                    >
                      <Icon size={16} color="#fff" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{f.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Platform cards */}
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pt-2">Installation by Device</h2>
            <div className="space-y-4">
              {SYSTEM_REQUIREMENTS.map((req) => {
                const Icon = req.icon;
                return (
                  <div key={req.platform} className="bg-card border rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/20">
                      <div
                        className="flex items-center justify-center rounded-xl flex-shrink-0"
                        style={{ width: 36, height: 36, background: req.iconColor + "18", border: `1.5px solid ${req.iconColor}30` }}
                      >
                        <Icon size={18} style={{ color: req.iconColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{req.platform}</p>
                        <p className="text-xs text-muted-foreground">{req.browser}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${req.badgeColor}`}>{req.badge}</span>
                    </div>
                    <div className="px-4 py-3 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground font-medium">Recommended</p>
                          <p className="font-semibold mt-0.5">{req.recommended}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium">Minimum</p>
                          <p className="font-semibold mt-0.5">{req.minimum}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold mb-1.5">How to install:</p>
                        <ol className="space-y-1">
                          {req.install.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <span
                                className="flex-shrink-0 flex items-center justify-center rounded-full font-bold text-white"
                                style={{ width: 16, height: 16, background: "#0b2c60", fontSize: 9, marginTop: 1 }}
                              >
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg px-3 py-2">
                        <AlertCircle size={12} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-700 dark:text-amber-400">{req.note}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connectivity requirements */}
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pt-2">Connectivity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Wifi, label: "Online (Full)", desc: "All features including push notifications, real-time sync, reports, and Excel export.", color: "#059669" },
                { icon: Cloud, label: "Slow / 2G", desc: "Basic features work. Dashboard loads from cache. Ledger uses offline queue.", color: "#f97316" },
                { icon: WifiOff, label: "Offline", desc: "Login works (24-hr cache). Ledger entries saved locally and synced on reconnect.", color: "#e11d48" },
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="bg-card border rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon size={16} style={{ color: c.color }} />
                      <p className="text-sm font-semibold">{c.label}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Architecture ── */}
          <TabsContent value="architecture" className="space-y-4 mt-4">
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/20">
                <p className="text-sm font-semibold">Tech Stack</p>
                <p className="text-xs text-muted-foreground">All layers running in the same Replit monorepo (pnpm workspaces)</p>
              </div>
              <div className="divide-y">
                {ARCH.map((a, i) => (
                  <div key={i} className="px-4 py-3 flex items-start gap-3">
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-lg"
                      style={{ width: 32, height: 32, background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", boxShadow: "0 2px 6px rgba(11,44,96,0.25)" }}
                    >
                      <Cpu size={14} color="#fff" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{a.layer}</p>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(249,115,22,0.12)", color: "#f97316" }}
                        >
                          {a.tech}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security overview */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/20">
                <p className="text-sm font-semibold">Security Overview</p>
              </div>
              <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  "Session-based auth (no JWTs) via PostgreSQL session store",
                  "Passwords hashed with bcrypt (12 salt rounds)",
                  "Account lockout after 5 failed attempts (15-min lock)",
                  "Idle auto-logout after 30 minutes of inactivity",
                  "Full audit trail: every login, logout, data change",
                  "Per-user data isolation — users can't see each other's data",
                  "RBAC with granular permissions (admin / operator / user)",
                  "OTP-based password reset with 120s resend cooldown",
                  "Multi-device sessions — revoke any device remotely",
                  "VAPID push keys with auto-generation on startup",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data flow */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/20">
                <p className="text-sm font-semibold">Data Flow</p>
              </div>
              <div className="px-4 py-4 space-y-2">
                {[
                  { from: "Frontend (React PWA)", arrow: "→", to: "API Server (Express 5)", detail: "HTTPS requests with session cookie auth" },
                  { from: "API Server", arrow: "→", to: "PostgreSQL DB", detail: "Drizzle ORM type-safe queries, per-user WHERE filters" },
                  { from: "Offline client", arrow: "→", to: "IndexedDB", detail: "Ledger entries queued locally, synced on reconnect" },
                  { from: "API Server", arrow: "→", to: "Browser (Push)", detail: "VAPID web-push to subscribed devices" },
                  { from: "Service Worker", arrow: "→", to: "Cache API", detail: "Workbox: StaleWhileRevalidate / NetworkFirst strategies" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="font-semibold px-2 py-1 rounded bg-muted">{row.from}</span>
                    <span className="text-muted-foreground font-bold">{row.arrow}</span>
                    <span className="font-semibold px-2 py-1 rounded bg-muted">{row.to}</span>
                    <span className="text-muted-foreground">— {row.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── Changelog ── */}
          <TabsContent value="changelog" className="space-y-3 mt-4">
            {CHANGELOG.map((entry, idx) => (
              <div key={entry.date} className="bg-card border rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/20">
                  <div
                    className="flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{
                      width: 32, height: 32,
                      background: idx === 0
                        ? "linear-gradient(135deg, #f97316, #ea580c)"
                        : "linear-gradient(135deg, #0b2c60, #1a4a9e)",
                      boxShadow: idx === 0 ? "0 2px 8px rgba(249,115,22,0.35)" : "0 2px 6px rgba(11,44,96,0.25)",
                    }}
                  >
                    <Clock size={13} color="#fff" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{entry.date}</p>
                    {idx === 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600">Latest</span>
                    )}
                  </div>
                </div>
                <ul className="px-4 py-3 space-y-1.5">
                  {entry.changes.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center py-4 space-y-1">
          <p className="text-xs text-muted-foreground">SAHU CSC Management Platform v{APP_VERSION}</p>
          <p className="text-[10px] text-muted-foreground/60">Built for Odisha Common Service Centers · © 2026</p>
        </div>
      </div>
    </Layout>
  );
}
