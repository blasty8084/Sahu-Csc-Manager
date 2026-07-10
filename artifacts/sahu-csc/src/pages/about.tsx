import { Layout } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Smartphone, Monitor, Globe, Wifi, WifiOff, Database, Server, Shield,
  CheckCircle2, AlertCircle, Clock, BookOpen, Cpu, Cloud, Lock,
  Fingerprint, Bell, FileSpreadsheet, Download, Mail, Key, RefreshCw,
  Users, BarChart3, Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";

declare const __APP_VERSION__: string;
const APP_VERSION = __APP_VERSION__;

// ── Changelog ────────────────────────────────────────────────────────────────
const CHANGELOG = [
  {
    version: "v3.4.0",
    title: "Receipt Export Layout Refactor",
    date: "2026-07-10",
    accent: "#f97316",
    changes: [
      "Receipt Export page migrated to shared <Layout> — no more duplicate custom header, sidebar, or bottom nav",
      "Desktop: 4-column KPI stat bar → filter row → two-column body (receipt table left, export panel + preview right)",
      "Mobile: top pill tab row (Receipts / By Date / Summary / Export) replaces old fixed bottom nav conflict",
      "TypeScript: added UserOverview interface; removed all unsafe any in users query and map callbacks",
    ],
  },
  {
    version: "v3.3.0",
    title: "Email & Security Hardening",
    date: "2026-07-08",
    accent: "#0b2c60",
    changes: [
      "V2 dark premium email templates — all 7 types with dark gradient card, per-type accent colours, HTML-safe esc() on every dynamic field",
      "OTP email: digit boxes + copy strip; easy tap-to-copy on any email client",
      "SMTP live: Gmail (smtp.gmail.com:587) configured, all transactional emails now deliver",
      "Password policy: 8+ chars, no max, uppercase + lowercase + number + special char",
      "Login lockout tightened to 3 failed attempts → 5-minute lock",
    ],
  },
  {
    version: "v3.2.5",
    title: "Security Upgrade",
    date: "2026-07-06",
    accent: "#0b2c60",
    changes: [
      "Unified password policy applied across registration, reset, profile, and admin flows",
      "Tighter rate limiting on login, register, OTP, and password-reset endpoints",
      "Sensitive fields (address, notes, bio) encrypted at rest with AES-256-GCM",
    ],
  },
  {
    version: "v3.2.0–v3.2.4",
    title: "Performance, Skeletons & Diagnostics",
    date: "2026-07-04–06",
    accent: "#0b2c60",
    changes: [
      "Adaptive animation performance tier (High / Medium / Low) based on CPU, RAM, network, rAF benchmark",
      "All spinners replaced with content-shaped skeletons across every page",
      "Device Performance card on Server Health page showing live FPS and tier",
      "Heap check now uses V8 heap_size_limit (crash ceiling) instead of heapTotal",
    ],
  },
  {
    version: "v3.1.1",
    title: "Receipt Export Redesign",
    date: "2026-07-01",
    accent: "#0b2c60",
    changes: [
      "Receipt Export mobile UI redesigned — fits any screen with height: 100dvh",
      "4-tab bottom nav (Receipts / By Date / Summary / Export) always visible",
      "By Date tab: date range + quick presets + operator filter",
      "Summary tab: 4 colour-coded aggregate stat cards",
    ],
  },
  {
    version: "v3.1.0",
    title: "Backup & Restore",
    date: "2026-06-30",
    accent: "#0b2c60",
    changes: [
      "Backup page redesigned — Minimal Clean UI with 2-column desktop grid",
      "Backup download streams .sql file with Content-Disposition: attachment",
      "Auto-backup scheduler (daily/weekly/custom cron) with configurable retention",
      "Selective table import: replay chosen tables from pg_dump with FK checks disabled",
    ],
  },
  {
    version: "v3.0.0",
    title: "Setup Wizard & SMTP",
    date: "2026-06-25",
    accent: "#0b2c60",
    changes: [
      "Setup Wizard Banner — admin-only banner when secrets missing",
      "GET /api/setup-status public endpoint for secrets readiness check",
      "Automatic DB migration on import via scripts/post-merge.sh",
      "Seed passwords read from ADMIN_PASSWORD / OPERATOR_PASSWORD secrets — never hardcoded",
    ],
  },
  {
    version: "v2.4",
    title: "Udhari Khata",
    date: "2026-06-18",
    accent: "#0b2c60",
    changes: [
      "Full customer credit ledger: You Gave / You Got, WhatsApp reminder, PDF statement",
      "Dashboard Udhari summary card — To Collect / To Pay at a glance",
      "Auto receipt number (CSC-YYYY-NNNN) added to all ledger entries",
    ],
  },
  {
    version: "v2.0",
    title: "PWA & Multi-Device",
    date: "2026-06-13–17",
    accent: "#0b2c60",
    changes: [
      "PWA offline mode: ledger entries queue offline, sync on reconnect",
      "Push notifications via VAPID web-push",
      "Multi-device sessions with device info, browser, OS, IP tracking",
      "Forgot-password: unified 4-step flow (identifier → OTP → new password → success)",
      "Initial release: Ledger, AePS Cash, Reports, Services, Dashboard",
    ],
  },
];

// ── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: BookOpen,      color: "#0b2c60", label: "Ledger Management",       desc: "Credits, debits, running balance, auto receipt numbers (CSC-YYYY-NNNN) with QR verification" },
  { icon: Fingerprint,   color: "#059669", label: "AePS Cash Management",    desc: "Daily AePS session with opening balance, withdrawals, deposits and running total" },
  { icon: BarChart3,     color: "#7c3aed", label: "Reports & Excel Export",  desc: "Daily, monthly, service-wise reports with one-click .xlsx download" },
  { icon: Users,         color: "#0b2c60", label: "Udhari Khata",            desc: "Customer credit ledger — track debts, send WhatsApp reminders, export PDF statements" },
  { icon: Mail,          color: "#f97316", label: "Transactional Email",     desc: "V2 dark premium HTML emails for OTP, approval, rejection, broadcast, and password reset" },
  { icon: Bell,          color: "#e11d48", label: "Push Notifications",      desc: "Real-time VAPID push alerts for transactions, approvals, and system events" },
  { icon: WifiOff,       color: "#0369a1", label: "Offline Mode",            desc: "Create ledger entries offline; IndexedDB queue auto-syncs on reconnect" },
  { icon: Shield,        color: "#059669", label: "Role-Based Access",       desc: "Admin, Operator, User roles with granular permissions and per-user data isolation" },
  { icon: Lock,          color: "#dc2626", label: "Account Security",        desc: "3-attempt lockout (5 min), bcrypt-12 hashing, idle auto-logout, full audit trail" },
  { icon: Key,           color: "#d97706", label: "Password Reset",          desc: "OTP-based 4-step reset flow; accepts username, email, or mobile as identifier" },
  { icon: RefreshCw,     color: "#0b2c60", label: "Backup & Restore",        desc: "Scheduled pg_dump backups with selective-table import and configurable retention" },
  { icon: Download,      color: "#7c3aed", label: "Install as App",          desc: "Install on Android, iOS, or desktop as a PWA — works like a native app offline" },
];

// ── Architecture ─────────────────────────────────────────────────────────────
const ARCH = [
  { layer: "Frontend",       tech: "React 18 + Vite 7",      detail: "TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion" },
  { layer: "State & Data",   tech: "TanStack Query v5",      detail: "Server state, caching, optimistic updates, offline sync" },
  { layer: "Offline Storage",tech: "IndexedDB",              detail: "5 stores: pending ledger, cache, user session, reports, notifications" },
  { layer: "PWA",            tech: "Workbox + SW",           detail: "Offline caching, background sync, push notifications, install prompt" },
  { layer: "API",            tech: "Express 5 (Node 20)",    detail: "TypeScript, typed route handlers, rate limiting, audit logging" },
  { layer: "Auth",           tech: "express-session + bcrypt", detail: "PostgreSQL session store, multi-device sessions, RBAC" },
  { layer: "Database",       tech: "PostgreSQL + Drizzle",   detail: "Type-safe queries, schema migrations, per-user data isolation, AES-256-GCM field encryption" },
  { layer: "Email",          tech: "Nodemailer + Gmail",     detail: "V2 dark HTML templates, SMTP via Gmail App Password, HTML-safe esc() helper" },
  { layer: "Push",           tech: "VAPID web-push",         detail: "Server-sent push to subscribed devices; keys auto-generated on startup" },
];

// ── Security checklist ────────────────────────────────────────────────────────
const SECURITY = [
  "Session-based auth (no JWTs) via PostgreSQL session store",
  "Passwords hashed with bcrypt (12 salt rounds)",
  "Password policy: 8+ chars, upper + lower + number + special char",
  "Rate limiting on login, registration, OTP, and password-reset endpoints",
  "Sensitive fields encrypted at rest (AES-256-GCM, auto-generated key)",
  "HTML-injection-safe esc() applied to all dynamic email fields",
  "Account lockout after 3 failed attempts (5-min lock)",
  "Idle auto-logout after 30 minutes of inactivity",
  "Full audit trail: every login, logout, and data change logged",
  "Per-user data isolation — users can't see each other's data",
  "RBAC with granular permissions (admin / operator / user)",
  "OTP-based password reset with 120 s resend cooldown",
  "Multi-device sessions — revoke any device remotely",
  "VAPID push keys auto-generated and persisted in settings table",
  "Encryption key persisted in settings table (override via ENCRYPTION_KEY secret)",
];

// ── System requirements ───────────────────────────────────────────────────────
const SYSTEM_REQUIREMENTS = [
  {
    platform: "Android",
    icon: Smartphone,
    iconColor: "#3ddc84",
    recommended: "Android 8.0+ (Oreo)",
    minimum: "Android 6.0 (Marshmallow)",
    browser: "Chrome 80+ or Samsung Browser 12+",
    install: [
      "Open the app link in Chrome",
      'Tap "Add to Home Screen" banner or ⋮ menu',
      "App installs like a native app — no Play Store needed",
    ],
    note: "Works offline after first visit. Push notifications supported.",
    badge: "Full PWA",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    platform: "iOS / iPhone / iPad",
    icon: Smartphone,
    iconColor: "#007aff",
    recommended: "iOS 16.4+ for push notifications",
    minimum: "iOS 14.0",
    browser: "Safari only (required for PWA install on iOS)",
    install: [
      "Open the app link in Safari",
      "Tap Share (□↑) → Add to Home Screen",
      'Tap "Add" — app appears on your home screen',
    ],
    note: "Push needs iOS 16.4+ and Safari. Chrome/Firefox on iOS cannot install PWAs.",
    badge: "Safari PWA",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    platform: "Windows / Mac / Linux",
    icon: Monitor,
    iconColor: "#0b2c60",
    recommended: "Windows 10+, macOS 12+, Ubuntu 20.04+",
    minimum: "Any OS with a modern browser",
    browser: "Chrome 80+ or Edge 80+ (recommended for PWA install)",
    install: [
      "Open the app in Chrome or Edge",
      "Click the install icon (⊕) in the address bar",
      "App opens in its own window with no browser UI",
    ],
    note: "Full offline support. Desktop push notifications. Excel export works everywhere.",
    badge: "Full PWA",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    platform: "Web Browser (No Install)",
    icon: Globe,
    iconColor: "#f97316",
    recommended: "Any modern browser",
    minimum: "Chrome 60+, Firefox 70+, Safari 13+",
    browser: "Just open the link — no installation needed",
    install: [
      "Open the app link in any browser",
      "Log in with your username and password",
      "Bookmark for quick access",
    ],
    note: "Offline mode, push notifications, and home-screen shortcut require PWA install.",
    badge: "Browser",
    badgeColor: "bg-amber-100 text-amber-700",
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function About() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">

        {/* ── Header card ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0b2c60 0%, #1a4a9e 60%, #0f3872 100%)" }}>
          <div style={{ height: 3, background: "linear-gradient(90deg, #f97316, #fb923c, #fbbf24)" }} />
          <div className="px-4 py-4 sm:px-6 sm:py-5 flex items-center gap-3 sm:gap-4">
            <div
              className="flex items-center justify-center rounded-2xl flex-shrink-0"
              style={{ width: 52, height: 52, background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.18)" }}
            >
              <img src="/sahu-logo.png" alt="SAHU CSC" className="w-9 h-9 object-contain rounded-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-white">SAHU <span style={{ color: "#f97316" }}>CSC</span></h1>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: "rgba(249,115,22,0.25)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.3)" }}
                >
                  v{APP_VERSION}
                </span>
              </div>
              <p className="text-white/60 text-xs mt-0.5">Management Platform · Odisha CSC</p>
            </div>
            <div className="hidden sm:block text-right flex-shrink-0">
              <p className="text-white/40 text-[10px]">Last updated</p>
              <p className="text-white/60 text-xs font-semibold">10 July 2026</p>
            </div>
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <Tabs defaultValue="changelog">
          <TabsList className="grid grid-cols-3 w-full h-10">
            <TabsTrigger value="changelog"  className="text-[11px] sm:text-sm px-1">Changelog</TabsTrigger>
            <TabsTrigger value="sysreq"     className="text-[11px] sm:text-sm px-1">Features</TabsTrigger>
            <TabsTrigger value="architecture" className="text-[11px] sm:text-sm px-1">Tech Stack</TabsTrigger>
          </TabsList>

          {/* ── Changelog ─────────────────────────────────────────────────── */}
          <TabsContent value="changelog" className="space-y-3 mt-4">
            {CHANGELOG.map((entry, idx) => (
              <div key={idx} className="bg-card border rounded-xl overflow-hidden">
                {/* Entry header */}
                <div
                  className="flex items-center gap-3 px-4 py-2.5"
                  style={{ background: idx === 0 ? "linear-gradient(90deg,rgba(249,115,22,0.08),transparent)" : undefined, borderBottom: "1px solid hsl(var(--border))" }}
                >
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-xl"
                    style={{
                      width: 30, height: 30,
                      background: idx === 0 ? "linear-gradient(135deg,#f97316,#ea580c)" : "linear-gradient(135deg,#0b2c60,#1a4a9e)",
                      boxShadow: idx === 0 ? "0 2px 8px rgba(249,115,22,0.4)" : "0 2px 6px rgba(11,44,96,0.25)",
                    }}
                  >
                    <Clock size={13} color="#fff" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: idx === 0 ? "rgba(249,115,22,0.15)" : "rgba(11,44,96,0.08)", color: idx === 0 ? "#f97316" : "#1a4a9e" }}
                      >
                        {entry.version}
                      </span>
                      <span className="text-sm font-bold truncate">{entry.title}</span>
                      {idx === 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 flex-shrink-0">{t("about.latest")}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{entry.date}</p>
                  </div>
                </div>
                {/* Changes */}
                <ul className="px-4 py-3 space-y-1.5">
                  {entry.changes.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 size={11} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </TabsContent>

          {/* ── Features / System Requirements ────────────────────────────── */}
          <TabsContent value="sysreq" className="space-y-5 mt-4">

            {/* Feature grid */}
            <div>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Platform Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FEATURES.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="flex items-start gap-3 bg-card border rounded-xl p-3">
                      <div
                        className="flex items-center justify-center rounded-xl flex-shrink-0"
                        style={{ width: 34, height: 34, background: f.color + "18", border: `1.5px solid ${f.color}30` }}
                      >
                        <Icon size={15} style={{ color: f.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold leading-snug">{f.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Installation by device */}
            <div>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{t("about.installation_by_device")}</h2>
              <div className="space-y-3">
                {SYSTEM_REQUIREMENTS.map((req) => {
                  const Icon = req.icon;
                  return (
                    <div key={req.platform} className="bg-card border rounded-xl overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-muted/20">
                        <div
                          className="flex items-center justify-center rounded-xl flex-shrink-0"
                          style={{ width: 34, height: 34, background: req.iconColor + "18", border: `1.5px solid ${req.iconColor}30` }}
                        >
                          <Icon size={17} style={{ color: req.iconColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{req.platform}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{req.browser}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${req.badgeColor}`}>{req.badge}</span>
                      </div>
                      <div className="px-4 py-3 space-y-2.5">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground font-medium text-[10px] uppercase tracking-wide">{t("about.recommended")}</p>
                            <p className="font-semibold mt-0.5">{req.recommended}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium text-[10px] uppercase tracking-wide">{t("about.minimum")}</p>
                            <p className="font-semibold mt-0.5">{req.minimum}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">{t("about.how_to_install")}</p>
                          <ol className="space-y-1">
                            {req.install.map((step, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <span
                                  className="flex-shrink-0 flex items-center justify-center rounded-full font-bold text-white"
                                  style={{ width: 15, height: 15, background: "#0b2c60", fontSize: 8, marginTop: 1.5 }}
                                >
                                  {i + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg px-3 py-2">
                          <AlertCircle size={11} className="text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-[11px] text-amber-700 dark:text-amber-400">{req.note}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Connectivity */}
            <div>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{t("about.connectivity")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { icon: Wifi,   label: t("about.online_full"), desc: "All features — push, real-time sync, reports, Excel export.", color: "#059669" },
                  { icon: Cloud,  label: t("about.slow_2g"),     desc: "Basic features. Dashboard from cache. Ledger uses offline queue.", color: "#f97316" },
                  { icon: WifiOff,label: t("pwa.offline"),       desc: "Login from 24-hr cache. Entries saved locally, synced on reconnect.", color: "#e11d48" },
                ].map((c) => {
                  const Icon = c.icon;
                  return (
                    <div key={c.label} className="bg-card border rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: c.color + "18" }}>
                          <Icon size={13} style={{ color: c.color }} />
                        </div>
                        <p className="text-xs font-semibold">{c.label}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{c.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* ── Architecture ──────────────────────────────────────────────── */}
          <TabsContent value="architecture" className="space-y-4 mt-4">

            {/* Tech stack */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/20">
                <p className="text-sm font-semibold">{t("about.tech_stack")}</p>
                <p className="text-[11px] text-muted-foreground">pnpm monorepo on Replit — frontend + API + DB in one repo</p>
              </div>
              <div className="divide-y">
                {ARCH.map((a, i) => (
                  <div key={i} className="px-4 py-3 flex items-start gap-3">
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-lg"
                      style={{ width: 30, height: 30, background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", boxShadow: "0 2px 6px rgba(11,44,96,0.25)" }}
                    >
                      <Cpu size={13} color="#fff" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">{a.layer}</p>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(249,115,22,0.12)", color: "#f97316" }}
                        >
                          {a.tech}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{a.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security overview */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/20">
                <p className="text-sm font-semibold">{t("about.security_overview")}</p>
                <p className="text-[11px] text-muted-foreground">{SECURITY.length} security layers active</p>
              </div>
              <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SECURITY.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data flow */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/20">
                <p className="text-sm font-semibold">{t("about.data_flow")}</p>
              </div>
              <div className="px-4 py-3 space-y-2">
                {[
                  { from: "React PWA",      to: "API Server",    detail: "HTTPS + session cookie auth" },
                  { from: "API Server",     to: "PostgreSQL",    detail: "Drizzle ORM, per-user WHERE filters" },
                  { from: "Offline client", to: "IndexedDB",     detail: "Queue locally, sync on reconnect" },
                  { from: "API Server",     to: "Gmail SMTP",    detail: "Nodemailer, V2 HTML templates" },
                  { from: "API Server",     to: "Browser (Push)",detail: "VAPID web-push to subscribed devices" },
                  { from: "Service Worker", to: "Cache API",     detail: "Workbox StaleWhileRevalidate" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs flex-wrap">
                    <span className="font-semibold px-2 py-0.5 rounded bg-muted whitespace-nowrap">{row.from}</span>
                    <span className="text-muted-foreground font-bold text-[10px]">→</span>
                    <span className="font-semibold px-2 py-0.5 rounded bg-muted whitespace-nowrap">{row.to}</span>
                    <span className="text-muted-foreground text-[11px]">— {row.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="text-center py-3 space-y-1 border-t">
          <p className="text-xs text-muted-foreground font-medium">SAHU CSC Management Platform v{APP_VERSION}</p>
          <p className="text-[10px] text-muted-foreground/50">Built for Odisha Common Service Centers · © 2026 · Updated 10 July 2026</p>
        </div>

      </div>
    </Layout>
  );
}
