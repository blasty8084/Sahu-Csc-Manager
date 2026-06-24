import React from 'react';

export function ResetLinkEmail() {
  return (
    <div style={{ backgroundColor: '#0a0f1a', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '520px', backgroundColor: '#0f1e35', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <div style={{ height: '4px', backgroundColor: '#f97316', boxShadow: '0 0 10px rgba(249,115,22,0.6)' }} />
        <div style={{ backgroundColor: '#162040', padding: '24px 32px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h1 style={{ margin: 0, color: '#ffffff', fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>SAHU CSC</h1>
        </div>
        <div style={{ padding: '32px' }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '20px' }}>Hi Meena!</h2>
          <p style={{ margin: '0 0 24px 0', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6' }}>We received a request to reset the password for your SAHU CSC account. Click the button below to choose a new password.</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <a href="#" style={{ backgroundColor: '#f97316', color: '#ffffff', textDecoration: 'none', padding: '14px 28px', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 4px 16px rgba(249,115,22,0.5)' }}>Reset Password</a>
          </div>

          <div style={{ backgroundColor: 'rgba(249,115,22,0.05)', border: '1px dashed rgba(249,115,22,0.4)', borderRadius: '8px', padding: '12px', textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ margin: 0, color: '#f97316', fontSize: '13px', fontWeight: 'bold' }}>This link expires in 30 minutes</p>
          </div>

          <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '13px' }}>If the button doesn't work, copy and paste this URL into your browser:</p>
          <div style={{ backgroundColor: '#1e3a5f', padding: '12px', borderRadius: '6px', wordBreak: 'break-all', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ color: '#e2e8f0', fontSize: '12px', fontFamily: 'monospace' }}>https://sahu-csc.in/reset-password?token=a8f9c2e4b6d7&email=meena%40example.com</span>
          </div>

          <div style={{ backgroundColor: 'rgba(239,68,68,0.05)', borderLeft: '4px solid #ef4444', padding: '16px', borderRadius: '0 8px 8px 0', marginBottom: '16px' }}>
            <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px', lineHeight: '1.5' }}><strong>Security Alert:</strong> If you did not request a password reset, please ignore this email or contact support if you feel your account is at risk.</p>
          </div>
        </div>
        <div style={{ backgroundColor: '#0a0f1a', padding: '24px 32px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '12px' }}>© 2026 SAHU CSC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
