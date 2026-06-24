import React from "react";

export function ApprovedEmail() {
  return (
    <div style={{ backgroundColor: "#f8fafc", padding: "40px 20px", fontFamily: "sans-serif", minHeight: "100vh" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)" }}>
        
        {/* Header */}
        <div style={{ borderTop: "4px solid #16a34a", padding: "24px 32px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, color: "#0b2c60", fontSize: "20px", fontWeight: "700", letterSpacing: "-0.5px" }}>SAHU CSC</h1>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "1px solid #16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto", color: "#16a34a", fontSize: "24px" }}>
            ✓
          </div>
          
          <h2 style={{ margin: "0 0 8px 0", color: "#16a34a", fontSize: "16px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>Account Approved</h2>
          <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: "14px" }}>You're ready to get started</p>
          
          <div style={{ textAlign: "left" }}>
            <h3 style={{ margin: "0 0 12px 0", color: "#1e293b", fontSize: "18px", fontWeight: "600" }}>Hi Rahul!</h3>
            <p style={{ margin: "0 0 24px 0", color: "#475569", fontSize: "14px", lineHeight: "1.6" }}>
              Your SAHU CSC agent account has been reviewed and approved. You can now log in to the platform and start managing services for your community.
            </p>
            
            <a href="#" style={{ display: "inline-block", backgroundColor: "#0b2c60", color: "#ffffff", textDecoration: "none", padding: "12px 24px", borderRadius: "6px", fontSize: "14px", fontWeight: "500", border: "1px solid #0b2c60" }}>
              Log in to Dashboard
            </a>
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
