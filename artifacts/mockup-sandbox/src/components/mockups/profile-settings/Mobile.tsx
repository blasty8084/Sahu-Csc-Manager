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
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{label}</label>
      <input
        type={type}
        defaultValue={value}
        disabled={disabled}
        style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, color: disabled ? "#9ca3af" : "#111", background: disabled ? "#f9fafb" : "#fff", boxSizing: "border-box" as const }}
      />
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, background: checked ? "#0b2c60" : "#d1d5db", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 2, left: checked ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
    </div>
  );
}

function SaveBtn({ label = "Save Changes" }: { label?: string }) {
  return (
    <button style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#0b2c60", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>{label}</button>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", marginBottom: 14 }}>
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #f3f4f6" }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111" }}>{title}</p>
      </div>
      <div style={{ padding: "16px" }}>{children}</div>
    </div>
  );
}

function ProfileTab() {
  return (
    <div>
      <Card title="Photo">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#0b2c60", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#fff", flexShrink: 0 }}>A</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14, color: "#111" }}>Admin User</p>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "#6b7280" }}>admin · Administrator</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", fontSize: 12, cursor: "pointer" }}>Change</button>
              <button style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid #fecaca", background: "#fff", fontSize: 12, cursor: "pointer", color: "#ef4444" }}>Remove</button>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Personal Information">
        <Field label="Full Name" value="Admin User" />
        <Field label="Username" value="admin" disabled />
        <Field label="Email" value="admin@sahucsc.in" type="email" />
        <Field label="Mobile" value="+91 98765 43210" />
        <Field label="Address" value="Bhubaneswar, Odisha" />
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Bio</label>
          <textarea rows={2} defaultValue="CSC operator serving rural Odisha." style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, resize: "none" as const, boxSizing: "border-box" as const }} />
        </div>
        <SaveBtn />
      </Card>
    </div>
  );
}

function SecurityTab() {
  return (
    <div>
      <Card title="Change Password">
        <Field label="Current Password" type="password" />
        <Field label="New Password" type="password" />
        <Field label="Confirm Password" type="password" />
        <SaveBtn label="Update Password" />
      </Card>

      <Card title="Active Sessions">
        {[
          { device: "Chrome on Windows", ip: "192.168.1.1", time: "Current session", current: true },
          { device: "Firefox on Android", ip: "103.12.45.67", time: "2 hours ago", current: false },
        ].map(s => (
          <div key={s.device} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#111" }}>{s.device}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>{s.ip} · {s.time}</p>
            </div>
            {s.current
              ? <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>● Now</span>
              : <button style={{ fontSize: 12, color: "#ef4444", border: "none", background: "none", cursor: "pointer" }}>Revoke</button>}
          </div>
        ))}
      </Card>
    </div>
  );
}

function PreferencesTab() {
  return (
    <Card title="Preferences">
      {[
        { label: "Theme", opts: ["Light", "Dark"] },
        { label: "Language", opts: ["English", "हिंदी", "ଓଡ଼ିଆ"] },
        { label: "Dashboard Layout", opts: ["Default", "Compact"] },
      ].map((p, i, arr) => (
        <div key={p.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}>
          <p style={{ margin: 0, fontSize: 14, color: "#111" }}>{p.label}</p>
          <select style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13, background: "#fff" }}>
            {p.opts.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      ))}
      <div style={{ marginTop: 12 }}><SaveBtn label="Save Preferences" /></div>
    </Card>
  );
}

function BusinessTab() {
  return (
    <Card title="Business Information">
      <Field label="Business Name" value="SAHU CSC" />
      <Field label="Mobile" value="+91 98765 43210" />
      <Field label="Email" value="info@sahucsc.in" type="email" />
      <Field label="Website" value="sahucsc.in" />
      <Field label="Address" value="Bhubaneswar, Odisha" />
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Currency</label>
        <select style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, background: "#fff" }}>
          <option>INR (₹)</option><option>USD ($)</option>
        </select>
      </div>
      <SaveBtn label="Save Business Info" />
    </Card>
  );
}

function SystemTab() {
  const [regOpen, setRegOpen] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  return (
    <div>
      <Card title="Registration Control">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1, paddingRight: 12 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#111" }}>{regOpen ? "Open" : "Closed"}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>
              {regOpen ? "New users can register." : "Registration page is closed."}
            </p>
          </div>
          <Toggle checked={regOpen} onChange={() => setRegOpen(!regOpen)} />
        </div>
      </Card>

      <Card title="Backup Settings">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: autoBackup ? 14 : 0, borderBottom: autoBackup ? "1px solid #f3f4f6" : "none" }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#111" }}>Automatic Backups</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>Schedule regular backups</p>
          </div>
          <Toggle checked={autoBackup} onChange={() => setAutoBackup(!autoBackup)} />
        </div>
        {autoBackup && (
          <div style={{ marginTop: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Frequency (days)</label>
            <input type="number" defaultValue={7} style={{ width: 80, padding: "9px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14 }} />
          </div>
        )}
      </Card>
    </div>
  );
}

export function Mobile() {
  const [active, setActive] = useState("profile");
  const content: Record<string, React.ReactNode> = { profile: <ProfileTab />, security: <SecurityTab />, preferences: <PreferencesTab />, business: <BusinessTab />, system: <SystemTab /> };

  return (
    <div style={{ width: 390, minHeight: "100vh", background: "#f9fafb", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", margin: "0 auto", display: "flex", flexDirection: "column" as const }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "48px 16px 0" }}>
        <h1 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700, color: "#111" }}>Settings</h1>

        {/* Tab scroll */}
        <div style={{ display: "flex", overflowX: "auto" as const, gap: 0, scrollbarWidth: "none" as const }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              padding: "10px 16px", border: "none", background: "none", cursor: "pointer", whiteSpace: "nowrap" as const,
              fontSize: 13, fontWeight: active === t.id ? 600 : 400,
              color: active === t.id ? "#0b2c60" : "#6b7280",
              borderBottom: active === t.id ? "2px solid #0b2c60" : "2px solid transparent"
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "16px", overflowY: "auto" as const }}>
        {content[active]}
      </div>
    </div>
  );
}
