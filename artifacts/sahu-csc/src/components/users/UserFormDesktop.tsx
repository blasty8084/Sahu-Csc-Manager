import type { UseFormReturn } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Eye, EyeOff, Mail, Phone, Shield, User, Users as UsersIcon, X } from "lucide-react";
import type { UserForm } from "./users.constants";

interface UserFormDesktopProps {
  setShowForm: (v: boolean) => void;
  editUser: any;
  form: UseFormReturn<UserForm>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void> | void;
  saving: boolean;
  showPassword: boolean;
  setShowPassword: (v: boolean | ((p: boolean) => boolean)) => void;
}

export function UserFormDesktop({
  setShowForm,
  editUser,
  form,
  onSubmit,
  saving,
  showPassword,
  setShowPassword,
}: UserFormDesktopProps) {
  return (
    <>
      <div onClick={() => setShowForm(false)} style={{ position: "fixed", inset: 0, background: "rgba(11,44,96,0.40)", backdropFilter: "blur(4px)", zIndex: 49 }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>

        {/* LEFT INFO PANEL */}
        <div style={{ width: 380, flexShrink: 0, background: "linear-gradient(160deg,#0b2c60 0%,#0f3872 55%,#1a4a9e 100%)", display: "flex", flexDirection: "column", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(249,115,22,0.12)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, position: "relative" }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#f97316,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(249,115,22,0.40)" }}>
              <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
            </div>
            <div><span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>SAHU </span><span style={{ color: "#f97316", fontWeight: 900, fontSize: 16 }}>CSC</span></div>
          </div>
          <div style={{ position: "relative", marginBottom: 28 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(249,115,22,0.20)", border: "2px solid rgba(249,115,22,0.35)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <UsersIcon size={30} color="#f97316" />
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 8, padding: "4px 10px", marginBottom: 10 }}>
              <Shield size={11} color="#f97316" />
              <span style={{ color: "#f97316", fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>User Management</span>
            </div>
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, lineHeight: 1.2, marginBottom: 8 }}>
              {editUser ? `Edit ${editUser.fullName || editUser.username}` : "Add New User"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 13, lineHeight: 1.7 }}>
              {editUser
                ? "Update this user's credentials, role, or account status."
                : "Create a new user account and assign a role to control their access."}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto", position: "relative" }}>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 2 }}>Role Permissions</p>
            {[
              { role: "Admin", desc: "Full access to all features and users", color: "#ef4444" },
              { role: "Operator", desc: "Can manage ledger, AePS, Udhari & reports", color: "#3b82f6" },
              { role: "User", desc: "Read-only access to own data", color: "#94a3b8" },
            ].map(({ role, desc, color }) => (
              <div key={role} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "11px 16px", border: form.watch("role") === role.toLowerCase() ? `1px solid ${color}` : "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{role}</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 11, marginTop: 3, marginLeft: 16 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8fafc" }}>
          <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0b2c60", margin: 0 }}>{editUser ? "Edit User" : "Add New User"}</h2>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>Fill in the details below to {editUser ? "update this account" : "create a new account"}</p>
            </div>
            <button onClick={() => setShowForm(false)} style={{ width: 38, height: 38, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={16} color="#64748b" />
            </button>
          </div>

          <form onSubmit={onSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 22, maxWidth: 640 }}>

              {/* Username + Full Name */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Username *</label>
                  <div style={{ position: "relative" }}>
                    <User size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input {...form.register("username", { required: true })} placeholder="e.g. ravi_kumar" data-testid="input-username"
                      style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                      onFocus={e => (e.target.style.borderColor = "#0b2c60")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Full Name</label>
                  <div style={{ position: "relative" }}>
                    <User size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input {...form.register("fullName")} placeholder="Full name" data-testid="input-fullname"
                      style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                      onFocus={e => (e.target.style.borderColor = "#0b2c60")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Email Address *</label>
                <div style={{ position: "relative" }}>
                  <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input type="email" {...form.register("email", { required: true })} placeholder="email@example.com" data-testid="input-email"
                    style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                    onFocus={e => (e.target.style.borderColor = "#0b2c60")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
              </div>

              {/* Mobile + Role */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Mobile</label>
                  <div style={{ position: "relative" }}>
                    <Phone size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input {...form.register("mobile")} placeholder="9999999999" data-testid="input-mobile"
                      style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                      onFocus={e => (e.target.style.borderColor = "#0b2c60")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Role *</label>
                  <Select value={form.watch("role")} onValueChange={(v) => form.setValue("role", v)}>
                    <SelectTrigger style={{ height: 50, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#0b2c60", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
                  {editUser ? "New Password" : "Password *"}
                  {editUser && <span style={{ fontWeight: 400, textTransform: "none" as const, color: "#94a3b8", marginLeft: 6 }}>(leave blank to keep current)</span>}
                </label>
                <div style={{ position: "relative" }}>
                  <Shield size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input type={showPassword ? "text" : "password"} {...form.register("password", { required: !editUser })} placeholder="Minimum 8 characters" data-testid="input-password"
                    style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 46, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                    onFocus={e => (e.target.style.borderColor = "#0b2c60")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                  <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
                    {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                  </button>
                </div>
              </div>

              {/* Active toggle — edit only */}
              {editUser && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", borderRadius: 14, padding: "16px 18px", border: "1.5px solid #e2e8f0" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60", marginBottom: 2 }}>Account Active</p>
                    <p style={{ fontSize: 12, color: "#94a3b8" }}>Inactive accounts cannot log in</p>
                  </div>
                  <Switch checked={form.watch("isActive")} onCheckedChange={(v) => form.setValue("isActive", v)} id="user-active-desk" />
                </div>
              )}
            </div>

            <div style={{ padding: "20px 40px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 14 }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
              <button type="submit" disabled={saving} data-testid="button-save-user"
                style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(11,44,96,0.30)", opacity: saving ? 0.7 : 1 }}>
                <CheckCircle2 size={18} />
                {saving ? "Saving…" : editUser ? "Save Changes" : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
