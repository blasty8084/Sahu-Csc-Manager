import { CheckCircle2, Cpu } from "lucide-react";
import { useTranslation } from "react-i18next";

// ── Data ─────────────────────────────────────────────────────────────────────

const ARCH = [
  { layer: "Frontend",        tech: "React 19 + Vite 7",        detail: "TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion" },
  { layer: "State & Data",    tech: "TanStack Query v5",         detail: "Server state, caching, optimistic updates, offline sync; cache persisted to IndexedDB via idb-keyval (async, non-blocking)" },
  { layer: "Offline Storage", tech: "IndexedDB",                 detail: "5 stores: pending ledger, cache, user session, reports, notifications" },
  { layer: "PWA",             tech: "Workbox + SW",              detail: "Offline caching, background sync, push notifications, install prompt" },
  { layer: "API",             tech: "Express 5 (Node 20)",       detail: "TypeScript, typed route handlers, rate limiting, audit logging" },
  { layer: "Auth",            tech: "express-session + bcrypt",  detail: "PostgreSQL session store, multi-device sessions, RBAC" },
  { layer: "Database",        tech: "PostgreSQL + Drizzle",      detail: "Type-safe queries, schema migrations, per-user data isolation, AES-256-GCM field encryption" },
  { layer: "Email",           tech: "Nodemailer + Gmail",        detail: "V2 dark HTML templates, SMTP via Gmail App Password, HTML-safe esc() helper" },
  { layer: "Push",            tech: "VAPID web-push",            detail: "Server-sent push to subscribed devices; keys auto-generated on startup" },
];

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
  "OTP-based password reset with 120-second email resend cooldown",
  "Multi-device sessions — revoke any device remotely",
  "VAPID push keys auto-generated and persisted in settings table",
  "Encryption key persisted in settings table (override via ENCRYPTION_KEY secret)",
  "Optional two-factor authentication — TOTP authenticator app or email OTP, with encrypted secrets and one-time backup codes",
  "New-device login triggers a 2FA/verification challenge; only one device session stays active per account at a time",
  "One-time first-login permission walkthrough (location, notifications, and file manager access) for every new user",
  "Dedicated security event log (security_logs) records failed logins, lockouts, and 2FA challenges separately from the general audit trail",
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AboutStats() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
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
            { from: "React PWA",      to: "API Server",     detail: "HTTPS + session cookie auth" },
            { from: "API Server",     to: "PostgreSQL",     detail: "Drizzle ORM, per-user WHERE filters" },
            { from: "Offline client", to: "IndexedDB",      detail: "Queue locally, sync on reconnect" },
            { from: "API Server",     to: "Gmail SMTP",     detail: "Nodemailer, V2 HTML templates" },
            { from: "API Server",     to: "Browser (Push)", detail: "VAPID web-push to subscribed devices" },
            { from: "Service Worker", to: "Cache API",      detail: "Workbox StaleWhileRevalidate" },
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
    </div>
  );
}
