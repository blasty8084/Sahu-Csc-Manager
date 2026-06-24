import React from 'react';

export function AdminAlertEmail() {
  return (
    <div style={{ backgroundColor: '#0a0f1a', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '520px', backgroundColor: '#0f1e35', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <div style={{ height: '4px', backgroundColor: '#3b82f6', boxShadow: '0 0 10px rgba(59,130,246,0.6)' }} />
        <div style={{ backgroundColor: '#162040', padding: '24px 32px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h1 style={{ margin: 0, color: '#ffffff', fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>SAHU CSC</h1>
          <p style={{ margin: '4px 0 0 0', color: '#3b82f6', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>System Alert</p>
        </div>
        <div style={{ padding: '32px' }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '20px' }}>Hi Admin!</h2>
          <p style={{ margin: '0 0 24px 0', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6' }}>A new user registration has been submitted and is pending your review.</p>
          
          <div style={{ backgroundColor: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>Name</span>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>Suresh Kumar</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>Phone</span>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>+91 98765 43210</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>Location</span>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>Bhubaneswar, Odisha</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <a href="#" style={{ backgroundColor: '#3b82f6', color: '#ffffff', textDecoration: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 12px rgba(59,130,246,0.4)' }}>Review Application</a>
          </div>

          <div style={{ backgroundColor: 'rgba(59,130,246,0.05)', borderLeft: '4px solid #3b82f6', padding: '16px', borderRadius: '0 8px 8px 0', marginBottom: '16px' }}>
            <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px', lineHeight: '1.5' }}>You can approve or decline this request directly from the admin dashboard.</p>
          </div>
        </div>
        <div style={{ backgroundColor: '#0a0f1a', padding: '24px 32px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '12px' }}>© 2026 SAHU CSC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
