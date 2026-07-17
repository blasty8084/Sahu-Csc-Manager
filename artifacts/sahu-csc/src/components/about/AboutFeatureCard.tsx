import {
  Smartphone, Monitor, Globe, Wifi, WifiOff,
  Bell, Cloud, Download, Fingerprint, BarChart3,
  BookOpen, Key, Lock, Mail, RefreshCw,
  Shield, ShieldCheck, Users, Laptop2,
} from "lucide-react";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────

const FEATURES: { icon: LucideIcon; color: string; label: string; desc: string }[] = [
  { icon: BookOpen,    color: "#0b2c60", label: "Ledger Management",        desc: "Credits, debits, running balance, auto receipt numbers (CSC-YYYY-NNNN) with QR verification" },
  { icon: Fingerprint, color: "#059669", label: "AePS Cash Management",     desc: "Daily AePS session with opening balance, withdrawals, deposits and running total" },
  { icon: BarChart3,   color: "#7c3aed", label: "Reports & Excel Export",   desc: "Daily, monthly, service-wise reports with one-click .xlsx download" },
  { icon: Users,       color: "#0b2c60", label: "Udhari Khata",             desc: "Customer credit ledger — track debts, send WhatsApp reminders, export PDF statements" },
  { icon: Mail,        color: "#f97316", label: "Transactional Email",      desc: "V2 dark premium HTML emails for OTP, approval, rejection, broadcast, and password reset" },
  { icon: Bell,        color: "#e11d48", label: "Push Notifications",       desc: "Real-time VAPID push alerts for transactions, approvals, and system events" },
  { icon: WifiOff,     color: "#0369a1", label: "Offline Mode",             desc: "Create ledger entries offline; IndexedDB queue auto-syncs on reconnect" },
  { icon: Shield,      color: "#059669", label: "Role-Based Access",        desc: "Admin, Operator, User roles with granular permissions and per-user data isolation" },
  { icon: Lock,        color: "#dc2626", label: "Account Security",         desc: "3-attempt lockout (5 min), bcrypt-12 hashing, idle auto-logout, full audit + security-event trail" },
  { icon: Key,         color: "#d97706", label: "Password Reset",           desc: "OTP-based 4-step reset flow; accepts username, email, or mobile as identifier" },
  { icon: ShieldCheck, color: "#0891b2", label: "Two-Factor Authentication",desc: "Authenticator app (Google Authenticator, Authy, any TOTP app via QR) or email OTP — 30-second RFC 6238 codes, replay protection, backup code health bar, regenerate without disabling 2FA" },
  { icon: Laptop2,     color: "#7c3aed", label: "Device & Session Control", desc: "New-device verification, single active session per account, trusted-device list with remote revoke" },
  { icon: RefreshCw,   color: "#0b2c60", label: "Backup & Restore",         desc: "Scheduled pg_dump backups with selective-table import and configurable retention" },
  { icon: Download,    color: "#7c3aed", label: "Install as App",           desc: "Install on Android, iOS, or desktop as a PWA — works like a native app offline" },
];

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

// ── Component ─────────────────────────────────────────────────────────────────

export default function AboutFeatureCard() {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
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
            { icon: Wifi,    label: t("about.online_full"), desc: "All features — push, real-time sync, reports, Excel export.", color: "#059669" },
            { icon: Cloud,   label: t("about.slow_2g"),     desc: "Basic features. Dashboard from cache. Ledger uses offline queue.", color: "#f97316" },
            { icon: WifiOff, label: t("pwa.offline"),       desc: "Login from 24-hr cache. Entries saved locally, synced on reconnect.", color: "#e11d48" },
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
    </div>
  );
}
