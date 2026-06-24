import React from 'react';

export function OtpEmail() {
  return (
    <div style={{ backgroundColor: '#0a0f1a', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '520px', backgroundColor: '#0f1e35', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <div style={{ height: '4px', backgroundColor: '#f97316', boxShadow: '0 0 10px rgba(249,115,22,0.6)' }} />
        <div style={{ backgroundColor: '#162040', padding: '24px 32px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h1 style={{ margin: 0, color: '#ffffff', fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>SAHU CSC</h1>
          <p style={{ margin: '4px 0 0 0', color: '#f97316', fontSize: '14px', letterSpacing: '0.5px' }}>MANAGEMENT PLATFORM</p>
        </div>
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'inline-block', backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginBottom: '24px', letterSpacing: '1px' }}>PASSWORD RESET</div>
          <h2 style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '20px' }}>Hi there!</h2>
          <p style={{ margin: '0 0 24px 0', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6' }}>We received a request to reset your password. Use the verification code below to complete the process:</p>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'center' }}>
            {['4', '9', '2', '8', '1', '5'].map((digit, i) => (
              <div key={i} style={{ width: '40px', height: '48px', backgroundColor: '#1e3a5f', border: '1px solid rgba(249,115,22,0.4)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '24px', fontFamily: 'monospace', fontWeight: 'bold', boxShadow: '0 3px 0 rgba(249,115,22,0.6)' }}>
                {digit}
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: 'rgba(249,115,22,0.05)', border: '1px dashed rgba(249,115,22,0.4)', padding: '16px', borderRadius: '8px', textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Or copy the code:</span>
            <span style={{ color: '#f97316', fontSize: '24px', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '4px' }}>492815</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <span style={{ backgroundColor: '#f97316', color: '#ffffff', padding: '4px 16px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}>Valid for 10 minutes</span>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderLeft: '4px solid #f97316', padding: '16px', borderRadius: '0 8px 8px 0', marginBottom: '32px' }}>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
        </div>
        <div style={{ backgroundColor: '#0a0f1a', padding: '24px 32px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '12px' }}>© 2026 SAHU CSC. All rights reserved.</p>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </div>
  );
}
