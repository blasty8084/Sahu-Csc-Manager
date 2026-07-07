import React from 'react';
import { BadgeCheck } from 'lucide-react';

export function V2AccountApproved() {
  const accent = '#10b981';
  const accentGlow = 'rgba(16,185,129,0.3)';
  
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      <div style={{ maxWidth: '560px', width: '100%', background: '#0f2244', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        
        {/* Header Section */}
        <div style={{ padding: '40px 32px 32px', textAlign: 'center', background: `linear-gradient(to bottom, rgba(16,185,129,0.15), transparent)`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: accent }}></div>
          
          <div style={{ margin: '0 auto 24px', width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 24px ${accentGlow}` }}>
            <BadgeCheck color="#fff" size={40} />
          </div>
          
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px' }}>SAHU CSC</div>
          <div style={{ color: '#34d399', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600' }}>Status Update</div>
        </div>
        
        {/* Body Section */}
        <div style={{ padding: '0 32px 40px' }}>
          <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: '700', margin: '0 0 24px', textAlign: 'center' }}>Account Approved</h2>
          <p style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.6', margin: '0 0 24px', textAlign: 'center' }}>
            Hi <strong>Rajesh</strong>, great news! Your SAHU CSC account is now active and ready to use.
          </p>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '32px' }}>
            <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0, lineHeight: '1.6' }}>
              You can now log in and access all platform features, track applications, and manage operator services.
            </p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <a href="#" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', textDecoration: 'none', padding: '14px 32px', borderRadius: '999px', fontSize: '16px', fontWeight: '600', boxShadow: `0 8px 20px ${accentGlow}`, transition: 'all 0.2s' }}>
              Open SAHU CSC →
            </a>
          </div>
        </div>
        
      </div>
      
      <div style={{ marginTop: '24px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
        © {new Date().getFullYear()} SAHU CSC Platform, Odisha. All rights reserved.
      </div>
    </div>
  );
}
