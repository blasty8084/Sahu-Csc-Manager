import React from "react";

export function DeclinedEmail() {
  return (
    <div style={{ backgroundColor: "#f8fafc", padding: "40px 20px", fontFamily: "sans-serif", minHeight: "100vh" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)" }}>
        
        {/* Header */}
        <div style={{ borderTop: "4px solid #dc2626", padding: "24px 32px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, color: "#0b2c60", fontSize: "20px", fontWeight: "700", letterSpacing: "-0.5px" }}>SAHU CSC</h1>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "32px" }}>
          <h2 style={{ margin: "0 0 16px 0", color: "#1e293b", fontSize: "18px", fontWeight: "600" }}>Hi Priya!</h2>
          <p style={{ margin: "0 0 24px 0", color: "#475569", fontSize: "14px", lineHeight: "1.6" }}>
            We've reviewed your recent application for a SAHU CSC agent account. Unfortunately, we are unable to approve your application at this time.
          </p>

          <div style={{ border: "1px dashed #fca5a5", backgroundColor: "#fef2f2", padding: "16px", borderRadius: "6px", marginBottom: "24px" }}>
            <p style={{ margin: 0, color: "#991b1b", fontSize: "14px", fontWeight: "500" }}>
              Reason: Account quota full for this region.
            </p>
          </div>

          {/* Contact Note */}
          <div style={{ borderLeft: "3px solid #e2e8f0", paddingLeft: "16px", color: "#64748b", fontSize: "13px", lineHeight: "1.5" }}>
            If you believe this is an error or would like to be added to the waitlist, please contact our support team.
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
