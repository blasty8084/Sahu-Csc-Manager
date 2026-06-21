import { useState } from "react";

const ALL_TABS = [
  { id: "profile", label: "Profile", icon: "👤" },
  { id: "security", label: "Security", icon: "🔒" },
  { id: "preferences", label: "Prefs", icon: "🎨" },
  { id: "business", label: "Business", icon: "🏢" },
  { id: "system", label: "System", icon: "⚙️" },
];

function Input({ label, value, type = "text", disabled }: { label: string; value: string; type?: string; disabled?: boolean }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <input type={type} defaultValue={value} disabled={disabled} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: disabled ? "#9ca3af" : "#111", background: disabled ? "#f9fafb" : "#fff", boxSizing: "border-box" }} />
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{ width: 46, height: 25, borderRadius: 13, background: checked ? "#0b2c60" : "#d1d5db", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 2.5, left: checked ? 23 : 2.5, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)", transition: "left 0.2s" }} />
    </div>
  );
}

function SaveBtn({ label = "Save Changes" }: { label?: string }) {
  return (
    <button style={{ width: "100%", padding: "13px", borderRadius: 12, background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>{label}</button>
  );
}

function ProfileTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Avatar card */}
      <div style={{ background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", borderRadius: 16, padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #fb923c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#fff", border: "3px solid rgba(255,255,255,0.3)" }}>A</div>
          <button style={{ position: "absolute", bottom: -2, right: -2, width: 26, height: 26, borderRadius: "50%", background: "#f97316", border: "2px solid #fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>📷</button>
        </div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ margin: 0, color: "#fff", fontSize: 18, fontWeight: 700 }}>Admin User</h2>
          <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.65)", fontSize: 13 }}>admin@sahucsc.in</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10 }}>
            <span style={{ background: "rgba(249,115,22,0.2)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>🛡 Admin</span>
            <span style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>● Active</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, width: "100%" }}>
          <button style={{ flex: 1, padding: "9px", borderRadius: 10, background: "#f97316", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Change Photo</button>
          <button style={{ flex: 1, padding: "9px", borderRadius: 10, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontSize: 13, cursor: "pointer" }}>Remove</button>
        </div>
      </div>

      {/* Form card */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Personal Information</h3>
        <Input label="Full Name" value="Admin User" />
        <Input label="Username" value="admin" disabled />
        <Input label="Email" value="admin@sahucsc.in" type="email" />
        <Input label="Mobile" value="+91 98765 43210" />
        <Input label="Address" value="Bhubaneswar, Odisha" />
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>Bio</label>
          <textarea rows={3} defaultValue="CSC operator managing digital services for rural Odisha." style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, resize: "none", boxSizing: "border-box" }} />
        </div>
        <SaveBtn />
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Change Password</h3>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "#6b7280" }}>Member since 15 January 2024</p>
        <Input label="Current Password" value="" type="password" />
        <Input label="New Password" value="" type="password" />
        <Input label="Confirm Password" value="" type="password" />
        <SaveBtn label="Update Password" />
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px" }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Active Sessions</h3>
        {[{ dev: "Chrome on Windows", ip: "192.168.1.1", when: "Current session", current: true }, { dev: "Firefox on Android", ip: "103.12.45.67", when: "2 hours ago", current: false }].map(s => (
          <div key={s.dev} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: s.current ? "#f0fdf4" : "#f8fafc", border: `1px solid ${s.current ? "#bbf7d0" : "#e5e7eb"}`, marginBottom: 10 }}>
            <span style={{ fontSize: 22 }}>{s.dev.includes("Android") ? "📱" : "💻"}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#111" }}>{s.dev}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280" }}>{s.ip} · {s.when}</p>
            </div>
            {s.current
              ? <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d" }}>This device</span>
              : <button style={{ fontSize: 11, fontWeight: 600, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Revoke</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreferencesTab() {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px" }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Preferences</h3>
      {[{ icon: "☀️", label: "Theme", sub: "Colour scheme", opts: ["Light", "Dark"] }, { icon: "🌐", label: "Language", sub: "Display language", opts: ["English", "हिंदी", "ଓଡ଼ିଆ"] }, { icon: "📊", label: "Dashboard", sub: "Layout style", opts: ["Default", "Compact"] }].map(p => (
        <div key={p.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "linear-gradient(135deg, #eff6ff, #dbeafe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{p.icon}</div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#111" }}>{p.label}</p>
              <p style={{ margin: "1px 0 0", fontSize: 11, color: "#9ca3af" }}>{p.sub}</p>
            </div>
          </div>
          <select style={{ padding: "7px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 12, color: "#111" }}>
            {p.opts.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      ))}
      <SaveBtn label="Save Preferences" />
    </div>
  );
}

function BusinessTab() {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px" }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Business Information</h3>
      <Input label="Business Name" value="SAHU CSC" />
      <Input label="Address" value="Bhubaneswar, Odisha" />
      <Input label="Mobile" value="+91 98765 43210" />
      <Input label="Email" value="info@sahucsc.in" type="email" />
      <Input label="Website" value="sahucsc.in" />
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>Currency</label>
        <select style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, background: "#fff", boxSizing: "border-box" }}>
          <option>INR (₹)</option><option>USD ($)</option>
        </select>
      </div>
      <SaveBtn label="Save Business Info" />
    </div>
  );
}

function SystemTab() {
  const [regOpen, setRegOpen] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, border: `1.5px solid ${regOpen ? "#bbf7d0" : "#fca5a5"}`, padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>{regOpen ? "🔓" : "🔒"} Registration Control</h3>
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>Control whether new users can self-register. All registrations require admin approval.</p>
          </div>
          <Toggle checked={regOpen} onChange={() => setRegOpen(!regOpen)} />
        </div>
        <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: regOpen ? "#f0fdf4" : "#fef2f2" }}>
          <p style={{ margin: 0, fontSize: 12, color: regOpen ? "#15803d" : "#dc2626", fontWeight: 500 }}>{regOpen ? "✅ Registrations are open." : "⛔ Registrations are closed."}</p>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px" }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>💾 Backup Settings</h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: autoBackup ? 14 : 0 }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#111" }}>Automatic Backups</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280" }}>Backup database on a schedule</p>
          </div>
          <Toggle checked={autoBackup} onChange={() => setAutoBackup(!autoBackup)} />
        </div>
        {autoBackup && (
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>Frequency (days)</label>
            <input type="number" defaultValue={7} style={{ width: 80, padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14 }} />
          </div>
        )}
      </div>
    </div>
  );
}

export function Mobile() {
  const [active, setActive] = useState("profile");

  const tabMap: Record<string, JSX.Element> = {
    profile: <ProfileTab />,
    security: <SecurityTab />,
    preferences: <PreferencesTab />,
    business: <BusinessTab />,
    system: <SystemTab />,
  };

  return (
    <div style={{ width: 390, minHeight: "100vh", background: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", margin: "0 auto", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", padding: "48px 20px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", fontSize: 18, cursor: "pointer" }}>←</button>
        <div>
          <h1 style={{ margin: 0, color: "#fff", fontSize: 18, fontWeight: 800 }}>Profile & Settings</h1>
          <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Manage your account</p>
        </div>
      </div>

      {/* Tab scroll bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", overflowX: "auto", display: "flex", padding: "0 4px" }}>
        {ALL_TABS.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 14px", border: "none", background: "none", cursor: "pointer", color: active === t.id ? "#0b2c60" : "#9ca3af", borderBottom: active === t.id ? "2.5px solid #f97316" : "2.5px solid transparent", fontWeight: active === t.id ? 700 : 400, fontSize: 11, whiteSpace: "nowrap", transition: "all 0.15s" }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
        {tabMap[active]}
      </div>
    </div>
  );
}
