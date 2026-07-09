import React from 'react';
import { KeyRound } from 'lucide-react';

export function V2AdminResetLink() {
  const accent = '#f59e0b';
  const accentGlow = 'rgba(245,158,11,0.3)';
  
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      <div style={{ maxWidth: '560px', width: '100%', background: '#0f2244', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        
        {/* Header Section */}
        <div style={{ padding: '40px 32px 32px', textAlign: 'center', background: `linear-gradient(to bottom, rgba(245,158,11,0.1), transparent)`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: accent }}></div>
          
          <div style={{ margin: '0 auto 24px', width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${accentGlow}` }}>
            <KeyRound color="#fff" size={32} />
          </div>
          
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px' }}>SAHU CSC</div>
          <div style={{ color: '#fbbf24', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600' }}>Admin Action</div>
        </div>
        
        {/* Body Section */}
        <div style={{ padding: '0 32px 40px' }}>
          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '600', margin: '0 0 16px', textAlign: 'center' }}>Password Reset Link</h2>
          <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.6', margin: '0 0 32px', textAlign: 'center' }}>
            Hi <strong>Meena</strong>, your administrator has initiated a password reset for your account <strong style={{ color: '#fff' }}>@meena_op</strong>.
          </p>
          
          <div style={{ textAlign: 'center', margin: '0 0 16px' }}>
            <a href="#" style={{ display: 'block', width: '100%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', textDecoration: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: '600', boxShadow: `0 8px 20px ${accentGlow}`, transition: 'all 0.2s' }}>
              Reset My Password →
            </a>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '8px 16px', borderRadius: '8px', color: '#fbbf24', fontSize: '12px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              ⚠️ Single-use · Expires in 2 hours · Do not share
            </div>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', textAlign: 'center' }}>
            If you did not request this, please contact your administrator immediately. This link is unique to you.
          </div>
        </div>
        
      </div>
      
      <div style={{ marginTop: '24px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
        © {new Date().getFullYear()} SAHU CSC Platform, Odisha. All rights reserved.
      </div>
    </div>
  );
}
