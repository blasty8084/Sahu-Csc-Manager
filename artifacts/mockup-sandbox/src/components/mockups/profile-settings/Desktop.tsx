import { useState } from "react";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "preferences", label: "Preferences" },
  { id: "business", label: "Business" },
  { id: "system", label: "System" },
];

function Field({ label, value = "", type = "text", disabled = false }: { label: string; value?: string; type?: string; disabled?: boolean }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>{label}</label>
      <input
        type={type}
        defaultValue={value}
        disabled={disabled}
        style={{
          width: "100%", padding: "9px 12px", borderRadius: 8,
          border: "1px solid #e5e7eb", fontSize: 14, color: disabled ? "#9ca3af" : "#111",
          background: disabled ? "#f9fafb" : "#fff", boxSizing: "border-box" as const,
          outline: "none"
        }}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111" }}>{title}</h3>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

function SaveBtn({ label = "Save Changes" }: { label?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
      <button style={{ padding: "9px 20px", borderRadius: 8, background: "#0b2c60", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        {label}
      </button>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{ width: 42, height: 24, borderRadius: 12, background: checked ? "#0b2c60" : "#d1d5db", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 2, left: checked ? 20 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
    </div>
  );
}

function ProfileTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
      <Section title="Profile Photo">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#0b2c60", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff", flexShrink: 0 }}>A</div>
          <div>
            <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 14, color: "#111" }}>Admin User</p>
            <p style={{ margin: "0 0 10px", fontSize: 13, color: "#6b7280" }}>admin · Administrator</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", fontSize: 12, cursor: "pointer", color: "#374151" }}>Change Photo</button>
              <button style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid #fecaca", background: "#fff", fontSize: 12, cursor: "pointer", color: "#ef4444" }}>Remove</button>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Personal Information">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Full Name" value="Admin User" />
          <Field label="Username" value="admin" disabled />
          <Field label="Email" value="admin@sahucsc.in" type="email" />
          <Field label="Mobile" value="+91 98765 43210" />
        </div>
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
          <Field label="Address" value="Bhubaneswar, Odisha" />
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>Bio</label>
            <textarea rows={3} defaultValue="CSC operator serving rural Odisha." style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, resize: "none" as const, boxSizing: "border-box" as const }} />
          </div>
        </div>
        <SaveBtn />
      </Section>
    </div>
  );
}

function SecurityTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
      <Section title="Change Password">
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          <Field label="Current Password" type="password" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="New Password" type="password" />
            <Field label="Confirm Password" type="password" />
          </div>
        </div>
        <SaveBtn label="Update Password" />
      </Section>
      <Section title="Active Sessions">
        {[
          { device: "Chrome on Windows", ip: "192.168.1.1", time: "Current session", current: true },
          { device: "Firefox on Android", ip: "103.12.45.67", time: "2 hours ago", current: false },
        ].map(s => (
          <div key={s.device} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#111" }}>{s.device}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>{s.ip} · {s.time}</p>
            </div>
            {s.current
              ? <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>● Current</span>
              : <button style={{ fontSize: 12, color: "#ef4444", border: "none", background: "none", cursor: "pointer", fontWeight: 500 }}>Revoke</button>}
          </div>
        ))}
      </Section>
    </div>
  );
}

function PreferencesTab() {
  return (
    <Section title="Preferences">
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {[
          { label: "Theme", sub: "Light or dark mode", options: ["Light", "Dark"] },
          { label: "Language", sub: "Display language", options: ["English", "हिंदी", "ଓଡ଼ିଆ"] },
          { label: "Dashboard Layout", sub: "Widget arrangement", options: ["Default", "Compact"] },
        ].map((p, i, arr) => (
          <div key={p.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#111" }}>{p.label}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>{p.sub}</p>
            </div>
            <select style={{ padding: "7px 10px", borderRadius: 7, border: "1px solid #e5e7eb", fontSize: 13, color: "#374151", background: "#fff" }}>
              {p.options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>
      <SaveBtn label="Save Preferences" />
    </Section>
  );
}

function BusinessTab() {
  return (
    <Section title="Business Information">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Business Name" value="SAHU CSC" />
        <Field label="Website" value="sahucsc.in" />
        <Field label="Mobile" value="+91 98765 43210" />
        <Field label="Email" value="info@sahucsc.in" type="email" />
      </div>
      <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
        <Field label="Address" value="Bhubaneswar, Odisha" />
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>Currency</label>
          <select style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, background: "#fff" }}>
            <option>INR (₹)</option><option>USD ($)</option>
          </select>
        </div>
      </div>
      <SaveBtn label="Save Business Info" />
    </Section>
  );
}

function SystemTab() {
  const [regOpen, setRegOpen] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
      <Section title="Registration Control">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#111" }}>{regOpen ? "Registrations Open" : "Registrations Closed"}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>
              {regOpen ? "New users can submit registration requests." : "The registration page shows a closed message."}
            </p>
          </div>
          <Toggle checked={regOpen} onChange={() => setRegOpen(!regOpen)} />
        </div>
      </Section>
      <Section title="Backup Settings">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: autoBackup ? 14 : 0, borderBottom: autoBackup ? "1px solid #f3f4f6" : "none" }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#111" }}>Automatic Backups</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>Schedule regular database backups</p>
          </div>
          <Toggle checked={autoBackup} onChange={() => setAutoBackup(!autoBackup)} />
        </div>
        {autoBackup && (
          <div style={{ marginTop: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>Backup Frequency (days)</label>
            <input type="number" defaultValue={7} style={{ width: 80, padding: "9px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14 }} />
          </div>
        )}
      </Section>
    </div>
  );
}

export function Desktop() {
  const [active, setActive] = useState("profile");
  const titles: Record<string, string> = { profile: "Profile", security: "Security", preferences: "Preferences", business: "Business", system: "System Settings" };
  const content: Record<string, React.ReactNode> = { profile: <ProfileTab />, security: <SecurityTab />, preferences: <PreferencesTab />, business: <BusinessTab />, system: <SystemTab /> };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Minimal header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 32px", display: "flex", alignItems: "center", height: 56, gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#0b2c60" }}>SAHU <span style={{ color: "#f97316" }}>CSC</span></span>
        <span style={{ color: "#d1d5db" }}>·</span>
        <span style={{ fontSize: 14, color: "#6b7280" }}>Settings</span>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px", display: "flex", gap: 24 }}>
        {/* Sidebar */}
        <nav style={{ width: 180, flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 2 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActive(t.id)} style={{
                padding: "9px 14px", borderRadius: 8, border: "none", textAlign: "left" as const, fontSize: 14,
                fontWeight: active === t.id ? 600 : 400,
                background: active === t.id ? "#eff6ff" : "transparent",
                color: active === t.id ? "#0b2c60" : "#374151",
                cursor: "pointer"
              }}>{t.label}</button>
            ))}
          </div>
        </nav>

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: "#111" }}>{titles[active]}</h1>
          {content[active]}
        </main>
      </div>
    </div>
  );
}
