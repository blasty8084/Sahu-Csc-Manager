import { useState } from "react";

const NAV_TABS = [
  { id: "profile", label: "My Profile", icon: "👤" },
  { id: "security", label: "Security", icon: "🔒" },
  { id: "preferences", label: "Preferences", icon: "🎨" },
  { id: "business", label: "Business Info", icon: "🏢" },
  { id: "system", label: "System", icon: "⚙️" },
];

function SideNav({ active, setActive }: { active: string; setActive: (id: string) => void }) {
  return (
    <aside style={{ width: 220, flexShrink: 0, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 4, padding: "24px 12px" }}>
      <div style={{ padding: "0 8px 16px", borderBottom: "1px solid #f0f0f0", marginBottom: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" }}>Account</p>
      </div>
      {NAV_TABS.slice(0, 3).map(t => (
        <button key={t.id} onClick={() => setActive(t.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: active === t.id ? "linear-gradient(135deg, #0b2c60, #1a4a9e)" : "transparent", color: active === t.id ? "#fff" : "#374151", fontWeight: active === t.id ? 600 : 400, fontSize: 14, transition: "all 0.15s", textAlign: "left" }}>
          <span style={{ fontSize: 16 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
      <div style={{ padding: "16px 8px 8px", borderBottom: "1px solid #f0f0f0", marginTop: 8, marginBottom: 4 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" }}>Admin Settings</p>
      </div>
      {NAV_TABS.slice(3).map(t => (
        <button key={t.id} onClick={() => setActive(t.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: active === t.id ? "linear-gradient(135deg, #0b2c60, #1a4a9e)" : "transparent", color: active === t.id ? "#fff" : "#374151", fontWeight: active === t.id ? 600 : 400, fontSize: 14, transition: "all 0.15s", textAlign: "left" }}>
          <span style={{ fontSize: 16 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </aside>
  );
}

function ProfileSection() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Avatar hero */}
      <div style={{ background: "linear-gradient(135deg, #0b2c60 0%, #1a4a9e 100%)", borderRadius: 16, padding: "32px 32px 24px", display: "flex", alignItems: "center", gap: 28 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #fb923c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 800, color: "#fff", border: "3px solid rgba(255,255,255,0.3)", boxShadow: "0 8px 24px rgba(249,115,22,0.4)" }}>A</div>
          <button style={{ position: "absolute", bottom: -2, right: -2, width: 28, height: 28, borderRadius: "50%", background: "#f97316", border: "2px solid #fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>📷</button>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, color: "#fff", fontSize: 22, fontWeight: 700 }}>Admin User</h2>
          <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.7)", fontSize: 14 }}>admin@sahucsc.in · +91 98765 43210</p>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <span style={{ background: "rgba(249,115,22,0.2)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>🛡 Admin</span>
            <span style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>● Active</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button style={{ padding: "8px 18px", borderRadius: 8, background: "#f97316", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Change Photo</button>
          <button style={{ padding: "8px 18px", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontSize: 13, cursor: "pointer" }}>Remove</button>
        </div>
      </div>

      {/* Form grid */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "24px 28px" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: "#0b2c60", display: "flex", alignItems: "center", gap: 8 }}>👤 Personal Information</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[["Full Name", "Admin User"], ["Username", "admin"], ["Email", "admin@sahucsc.in"], ["Mobile", "+91 98765 43210"]].map(([label, val]) => (
            <div key={label}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>{label}</label>
              <input defaultValue={val} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111", background: label === "Username" ? "#f9fafb" : "#fff", boxSizing: "border-box" }} disabled={label === "Username"} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>Address</label>
          <input defaultValue="Bhubaneswar, Odisha" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>Bio</label>
          <textarea rows={3} defaultValue="CSC operator managing digital services for rural Odisha." style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111", resize: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
          <button style={{ padding: "10px 28px", borderRadius: 8, background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function SecuritySection() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "24px 28px" }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#0b2c60" }}>🔒 Change Password</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6b7280" }}>Member since 15 January 2024</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {["Current Password", "New Password", "Confirm Password"].map(l => (
            <div key={l}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>{l}</label>
              <input type="password" placeholder={`Enter ${l.toLowerCase()}`} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
          <button style={{ padding: "10px 28px", borderRadius: 8, background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Update Password</button>
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "24px 28px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0b2c60" }}>🖥 Active Sessions</h3>
        {[["Chrome on Windows", "192.168.1.1", "Current session", "#dcfce7", "#15803d"], ["Firefox on Android", "103.12.45.67", "2 hours ago", "#f1f5f9", "#64748b"]].map(([dev, ip, when, bg, col]) => (
          <div key={dev} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderRadius: 10, background: bg, marginBottom: 10 }}>
            <span style={{ fontSize: 24 }}>{dev.includes("Android") ? "📱" : "💻"}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111" }}>{dev}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>{ip} · {when}</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: col }}>{when === "Current session" ? "● This device" : "Revoke"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreferencesSection() {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "24px 28px" }}>
      <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: "#0b2c60" }}>🎨 Preferences</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {[
          { icon: "☀️", label: "Theme", sub: "Choose your preferred colour scheme", value: "Light" },
          { icon: "🌐", label: "Language", sub: "Select your display language", value: "English" },
          { icon: "📊", label: "Dashboard Layout", sub: "How your dashboard is arranged", value: "Default" },
        ].map(p => (
          <div key={p.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #eff6ff, #dbeafe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{p.icon}</div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111" }}>{p.label}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>{p.sub}</p>
              </div>
            </div>
            <select defaultValue={p.value} style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, color: "#111", background: "#fff" }}>
              <option>{p.value}</option>
            </select>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
        <button style={{ padding: "10px 28px", borderRadius: 8, background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Save Preferences</button>
      </div>
    </div>
  );
}

function BusinessSection() {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "24px 28px" }}>
      <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: "#0b2c60" }}>🏢 Business Information</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[["Business Name", "SAHU CSC"], ["Address", "Bhubaneswar, Odisha"], ["Mobile", "+91 98765 43210"], ["Email", "info@sahucsc.in"], ["Website", "sahucsc.in"], ["Currency", "INR (₹)"]].map(([label, val]) => (
          <div key={label}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>{label}</label>
            <input defaultValue={val} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111", boxSizing: "border-box" }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
        <button style={{ padding: "10px 28px", borderRadius: 8, background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Save Business Info</button>
      </div>
    </div>
  );
}

function SystemSection() {
  const [regOpen, setRegOpen] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${regOpen ? "#bbf7d0" : "#fecaca"}`, padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#0b2c60", display: "flex", alignItems: "center", gap: 8 }}>{regOpen ? "🔓" : "🔒"} Registration Control</h3>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Control whether new users can self-register. All registrations require admin approval.</p>
          </div>
          <div onClick={() => setRegOpen(!regOpen)} style={{ width: 48, height: 26, borderRadius: 13, background: regOpen ? "#22c55e" : "#e5e7eb", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
            <div style={{ position: "absolute", top: 3, left: regOpen ? 25 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
          </div>
        </div>
        <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: regOpen ? "#f0fdf4" : "#fef2f2", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>{regOpen ? "✅" : "⛔"}</span>
          <p style={{ margin: 0, fontSize: 13, color: regOpen ? "#15803d" : "#dc2626", fontWeight: 500 }}>{regOpen ? "Registrations are open — new users can submit requests." : "Registrations closed — registration page shows a closed message."}</p>
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "24px 28px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0b2c60" }}>💾 Backup Settings</h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #f3f4f6" }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111" }}>Automatic Backups</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>Automatically backup database on a schedule</p>
          </div>
          <div onClick={() => setAutoBackup(!autoBackup)} style={{ width: 48, height: 26, borderRadius: 13, background: autoBackup ? "#0b2c60" : "#e5e7eb", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
            <div style={{ position: "absolute", top: 3, left: autoBackup ? 25 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
          </div>
        </div>
        {autoBackup && (
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>Backup Frequency (days)</label>
            <input type="number" defaultValue={7} style={{ width: 80, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14 }} />
          </div>
        )}
      </div>
    </div>
  );
}

export function Desktop() {
  const [active, setActive] = useState("profile");

  const sectionMap: Record<string, JSX.Element> = {
    profile: <ProfileSection />,
    security: <SecuritySection />,
    preferences: <PreferencesSection />,
    business: <BusinessSection />,
    system: <SystemSection />,
  };

  const titles: Record<string, string> = {
    profile: "My Profile", security: "Security", preferences: "Preferences",
    business: "Business Info", system: "System Settings",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Top header */}
      <div style={{ background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", padding: "16px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#0b2c60" }}>S</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>SAHU <span style={{ color: "#f97316" }}>CSC</span></span>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>Profile & Settings</span>
      </div>

      <div style={{ display: "flex", maxWidth: 1100, margin: "0 auto", padding: "32px 24px", gap: 24 }}>
        <SideNav active={active} setActive={setActive} />
        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0b2c60" }}>{titles[active]}</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Manage your {titles[active].toLowerCase()} settings</p>
          </div>
          {sectionMap[active]}
        </main>
      </div>
    </div>
  );
}
