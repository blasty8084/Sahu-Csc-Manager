import React from "react";

export function BroadcastEmail() {
  return (
    <div style={{ backgroundColor: "#f8fafc", padding: "40px 20px", fontFamily: "sans-serif", minHeight: "100vh" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)" }}>
        
        {/* Header */}
        <div style={{ borderTop: "4px solid #0b2c60", padding: "24px 32px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, color: "#0b2c60", fontSize: "20px", fontWeight: "700", letterSpacing: "-0.5px" }}>SAHU CSC</h1>
          </div>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", letterSpacing: "1px" }}>BROADCAST</span>
        </div>

        {/* Body */}
        <div style={{ padding: "32px" }}>
          <h2 style={{ margin: "0 0 16px 0", color: "#1e293b", fontSize: "18px", fontWeight: "600" }}>System Maintenance Notice</h2>
          
          <div style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6" }}>
            <p style={{ margin: "0 0 16px 0" }}>Dear Agents,</p>
            <p style={{ margin: "0 0 16px 0" }}>
              Please be advised that the SAHU CSC portal will undergo scheduled maintenance this Sunday, October 27th, from 02:00 AM to 04:00 AM IST.
            </p>
            <p style={{ margin: "0 0 16px 0" }}>
              During this time, the AePS and Udhari services will be unavailable. Please complete all pending transactions before the maintenance window begins.
            </p>
            <p style={{ margin: 0 }}>
              Thank you for your cooperation.
              <br /><br />
              Regards,<br />
              SAHU CSC Admin Team
            </p>
          </div>
          
          <div style={{ height: "1px", backgroundColor: "#e2e8f0", margin: "24px 0" }}></div>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: "#f8fafc", padding: "24px 32px", borderTop: "1px solid #e2e8f0", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
          <p style={{ margin: "0 0 8px 0" }}>© 2024 SAHU CSC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
