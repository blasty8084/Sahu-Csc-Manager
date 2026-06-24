import React from 'react';

export function BroadcastEmail() {
  return (
    <div style={{ backgroundColor: '#0a0f1a', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '520px', backgroundColor: '#0f1e35', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <div style={{ height: '4px', backgroundColor: '#f97316', boxShadow: '0 0 10px rgba(249,115,22,0.6)' }} />
        <div style={{ backgroundColor: '#162040', padding: '24px 32px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h1 style={{ margin: 0, color: '#ffffff', fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>SAHU CSC</h1>
          <p style={{ margin: '4px 0 0 0', color: '#f97316', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Important Announcement</p>
        </div>
        <div style={{ padding: '32px' }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '20px' }}>Hello,</h2>
          <p style={{ margin: '0 0 16px 0', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6' }}>We are excited to announce a new service added to the SAHU CSC platform. Starting tomorrow, you will be able to process utility bill payments directly from your dashboard.</p>
          <p style={{ margin: '0 0 24px 0', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6' }}>This new feature comes with an updated commission structure. Please check the "Services" tab for more details.</p>
          
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '24px 0' }} />

          <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', lineHeight: '1.5', fontStyle: 'italic' }}>Note: The platform will undergo a brief maintenance window tonight from 2:00 AM to 3:00 AM IST to deploy these updates.</p>
          
        </div>
        <div style={{ backgroundColor: '#0a0f1a', padding: '24px 32px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '12px' }}>© 2026 SAHU CSC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
