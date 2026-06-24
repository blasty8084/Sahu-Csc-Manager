import React from 'react';

export function DeclinedEmail() {
  return (
    <div style={{ backgroundColor: '#0a0f1a', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '520px', backgroundColor: '#0f1e35', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <div style={{ height: '4px', backgroundColor: '#ef4444', boxShadow: '0 0 10px rgba(239,68,68,0.6)' }} />
        <div style={{ backgroundColor: '#162040', padding: '24px 32px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h1 style={{ margin: 0, color: '#ffffff', fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>SAHU CSC</h1>
        </div>
        <div style={{ padding: '32px' }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '20px' }}>Hi Priya!</h2>
          <p style={{ margin: '0 0 24px 0', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6' }}>We've reviewed your account registration. Unfortunately, we cannot approve it at this time due to the following reason:</p>
          
          <div style={{ backgroundColor: 'rgba(239,68,68,0.05)', border: '1px dashed #ef4444', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#ef4444', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason for Decline:</h3>
            <p style={{ margin: 0, color: '#e2e8f0', fontSize: '14px', lineHeight: '1.5' }}>"Aadhar card image provided is blurry and unreadable. Please provide a clear, scanned copy."</p>
          </div>

          <div style={{ backgroundColor: 'rgba(249,115,22,0.05)', borderLeft: '4px solid #f97316', padding: '16px', borderRadius: '0 8px 8px 0', marginBottom: '32px' }}>
            <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px', lineHeight: '1.5' }}><strong>What can you do?</strong> You can submit a new registration request with the correct details and clearer documents. If you have questions, reply to this email.</p>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <a href="#" style={{ backgroundColor: 'transparent', color: '#f97316', textDecoration: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', border: '1px solid #f97316' }}>Contact Support</a>
          </div>
        </div>
        <div style={{ backgroundColor: '#0a0f1a', padding: '24px 32px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '12px' }}>© 2026 SAHU CSC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
