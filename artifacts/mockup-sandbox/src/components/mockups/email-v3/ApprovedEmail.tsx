import React from 'react';

export function ApprovedEmail() {
  return (
    <div style={{ backgroundColor: '#0a0f1a', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '520px', backgroundColor: '#0f1e35', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <div style={{ height: '4px', backgroundColor: '#22c55e', boxShadow: '0 0 10px rgba(34,197,94,0.6)' }} />
        <div style={{ backgroundColor: '#162040', padding: '24px 32px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h1 style={{ margin: 0, color: '#ffffff', fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>SAHU CSC</h1>
        </div>
        <div style={{ padding: '32px' }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '20px' }}>Hi Rahul!</h2>
          <p style={{ margin: '0 0 24px 0', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6' }}>Great news! Your account registration has been reviewed and approved by our administrative team.</p>
          
          <div style={{ backgroundColor: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '20px', textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: '#ffffff', fontSize: '24px' }}>
              ✓
            </div>
            <h3 style={{ margin: '0 0 8px 0', color: '#22c55e', fontSize: '18px' }}>Registration Approved</h3>
            <p style={{ margin: 0, color: '#e2e8f0', fontSize: '14px' }}>You can now log in and access all CSC services.</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <a href="#" style={{ backgroundColor: '#f97316', color: '#ffffff', textDecoration: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 12px rgba(249,115,22,0.4)' }}>Log In to Dashboard</a>
          </div>

          <div style={{ backgroundColor: 'rgba(34,197,94,0.05)', borderLeft: '4px solid #22c55e', padding: '16px', borderRadius: '0 8px 8px 0', marginBottom: '32px' }}>
            <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px', lineHeight: '1.5' }}><strong>Next steps:</strong> Please ensure you have set up your payment wallet and completed your profile details before serving customers.</p>
          </div>
        </div>
        <div style={{ backgroundColor: '#0a0f1a', padding: '24px 32px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '12px' }}>© 2026 SAHU CSC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
