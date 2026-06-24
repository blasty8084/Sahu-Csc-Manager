import React from "react";

export function AdminAlertEmail() {
  return (
    <div style={{ backgroundColor: "#f8fafc", padding: "40px 20px", fontFamily: "sans-serif", minHeight: "100vh" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)" }}>
        
        {/* Header */}
        <div style={{ borderTop: "4px solid #0b2c60", padding: "24px 32px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, color: "#0b2c60", fontSize: "20px", fontWeight: "700", letterSpacing: "-0.5px" }}>SAHU CSC</h1>
          </div>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", letterSpacing: "1px" }}>ACTION REQUIRED</span>
        </div>

        {/* Body */}
        <div style={{ padding: "32px" }}>
          <h2 style={{ margin: "0 0 16px 0", color: "#1e293b", fontSize: "18px", fontWeight: "600" }}>New Registration Pending</h2>
          <p style={{ margin: "0 0 24px 0", color: "#475569", fontSize: "14px", lineHeight: "1.6" }}>
            A new agent application requires your review. Please check the details below and take appropriate action.
          </p>

          {/* Info Card */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "6px", overflow: "hidden", marginBottom: "24px" }}>
            <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ flex: 1, padding: "12px 16px", backgroundColor: "#f8fafc", fontSize: "12px", color: "#64748b", fontWeight: "500" }}>Applicant Name</div>
              <div style={{ flex: 2, padding: "12px 16px", fontSize: "14px", color: "#1e293b" }}>Ramesh Kumar</div>
            </div>
            <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ flex: 1, padding: "12px 16px", backgroundColor: "#f8fafc", fontSize: "12px", color: "#64748b", fontWeight: "500" }}>Phone</div>
              <div style={{ flex: 2, padding: "12px 16px", fontSize: "14px", color: "#1e293b" }}>+91 9876543210</div>
            </div>
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1, padding: "12px 16px", backgroundColor: "#f8fafc", fontSize: "12px", color: "#64748b", fontWeight: "500" }}>Submitted</div>
              <div style={{ flex: 2, padding: "12px 16px", fontSize: "14px", color: "#1e293b" }}>Oct 24, 2024, 10:30 AM</div>
            </div>
          </div>

          <a href="#" style={{ display: "inline-block", backgroundColor: "#ffffff", color: "#0b2c60", textDecoration: "none", padding: "10px 20px", borderRadius: "6px", fontSize: "14px", fontWeight: "500", border: "1px solid #0b2c60", marginBottom: "24px" }}>
            Review Application
          </a>

          {/* Note */}
          <div style={{ borderLeft: "3px solid #e2e8f0", paddingLeft: "16px", color: "#64748b", fontSize: "13px", lineHeight: "1.5" }}>
            Log in to the admin portal to approve or reject this request. Pending applications will expire after 7 days.
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
