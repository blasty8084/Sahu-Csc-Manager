import React from "react";

export function OtpEmail() {
  return (
    <div style={{ backgroundColor: "#f8fafc", padding: "40px 20px", fontFamily: "sans-serif", minHeight: "100vh" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)" }}>
        
        {/* Header */}
        <div style={{ borderTop: "4px solid #f97316", padding: "24px 32px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, color: "#0b2c60", fontSize: "20px", fontWeight: "700", letterSpacing: "-0.5px" }}>SAHU CSC</h1>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "12px" }}>Common Service Center</p>
          </div>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", letterSpacing: "1px" }}>PASSWORD RESET</span>
        </div>

        {/* Body */}
        <div style={{ padding: "32px" }}>
          <h2 style={{ margin: "0 0 16px 0", color: "#1e293b", fontSize: "18px", fontWeight: "600" }}>Hi there!</h2>
          <p style={{ margin: "0 0 24px 0", color: "#475569", fontSize: "14px", lineHeight: "1.6" }}>
            We received a request to reset your password. Use the verification code below to complete the process.
          </p>

          {/* OTP Boxes */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px", justifyContent: "center" }}>
            {["4", "8", "2", "9", "1", "5"].map((digit, i) => (
              <div key={i} style={{ width: "40px", height: "48px", border: "1px solid #cbd5e1", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "600", color: "#0b2c60", backgroundColor: "#f8fafc" }}>
                {digit}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div style={{ border: "1px dashed #cbd5e1", padding: "8px 16px", borderRadius: "4px", backgroundColor: "#f8fafc", fontFamily: "monospace", fontSize: "14px", color: "#475569", letterSpacing: "2px" }}>
              482915
            </div>
            <span style={{ fontSize: "12px", color: "#f97316", border: "1px solid #fdba74", padding: "4px 8px", borderRadius: "4px", backgroundColor: "#fff7ed" }}>
              Expires in 10 mins
            </span>
          </div>

          {/* Security Note */}
          <div style={{ borderLeft: "3px solid #e2e8f0", paddingLeft: "16px", color: "#64748b", fontSize: "13px", lineHeight: "1.5" }}>
            If you didn't request this, you can safely ignore this email. Your password won't be changed until you verify this code.
          </div>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: "#f8fafc", padding: "24px 32px", borderTop: "1px solid #e2e8f0", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
          <p style={{ margin: "0 0 8px 0" }}>© 2024 SAHU CSC. All rights reserved.</p>
          <p style={{ margin: 0 }}>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </div>
  );
}
