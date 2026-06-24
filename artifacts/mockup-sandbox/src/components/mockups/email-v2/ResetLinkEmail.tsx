import React from "react";

export function ResetLinkEmail() {
  return (
    <div style={{ backgroundColor: "#f8fafc", padding: "40px 20px", fontFamily: "sans-serif", minHeight: "100vh" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)" }}>
        
        {/* Header */}
        <div style={{ borderTop: "4px solid #f97316", padding: "24px 32px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, color: "#0b2c60", fontSize: "20px", fontWeight: "700", letterSpacing: "-0.5px" }}>SAHU CSC</h1>
          </div>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", letterSpacing: "1px" }}>ADMIN-ASSISTED RESET</span>
        </div>

        {/* Body */}
        <div style={{ padding: "32px" }}>
          <h2 style={{ margin: "0 0 16px 0", color: "#1e293b", fontSize: "18px", fontWeight: "600" }}>Password Reset Requested</h2>
          <p style={{ margin: "0 0 24px 0", color: "#475569", fontSize: "14px", lineHeight: "1.6" }}>
            An administrator has initiated a password reset for your account. Click the button below to set a new password.
          </p>

          <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
            <a href="#" style={{ display: "inline-block", backgroundColor: "#0b2c60", color: "#ffffff", textDecoration: "none", padding: "12px 24px", borderRadius: "6px", fontSize: "14px", fontWeight: "500" }}>
              Reset Password
            </a>
            <span style={{ fontSize: "12px", color: "#64748b", border: "1px solid #e2e8f0", padding: "4px 8px", borderRadius: "4px", backgroundColor: "#f8fafc" }}>
              Valid for 24 hours
            </span>
          </div>

          <p style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "13px" }}>Or copy and paste this link into your browser:</p>
          <div style={{ backgroundColor: "#f8fafc", padding: "12px", borderRadius: "4px", border: "1px solid #e2e8f0", fontFamily: "monospace", fontSize: "12px", color: "#475569", wordBreak: "break-all", marginBottom: "24px" }}>
            https://sahucsc.com/reset-password?token=a8f9b2c4d5e6f7g8h9i0j1k2l3m4n5o6
          </div>

          {/* Security Note */}
          <div style={{ borderLeft: "3px solid #ef4444", paddingLeft: "16px", color: "#64748b", fontSize: "13px", lineHeight: "1.5" }}>
            If you did not request this and suspect unauthorized activity, please contact your administrator immediately.
          </div>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: "#f8fafc", padding: "24px 32px", borderTop: "1px solid #e2e8f0", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
          <p style={{ margin: "0 0 8px 0" }}>© 2024 SAHU CSC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
