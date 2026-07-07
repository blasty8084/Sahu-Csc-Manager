import React from 'react';
import { Bell } from 'lucide-react';

export function V2AdminNewReg() {
  const accent = '#38bdf8';
  const accentGlow = 'rgba(56,189,248,0.3)';
  
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      <div style={{ maxWidth: '560px', width: '100%', background: '#0f2244', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        
        {/* Header Section */}
        <div style={{ padding: '40px 32px 32px', textAlign: 'center', background: `linear-gradient(to bottom, rgba(56,189,248,0.1), transparent)`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: accent }}></div>
          
          <div style={{ margin: '0 auto 24px', width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${accentGlow}` }}>
            <Bell color="#fff" size={30} />
          </div>
          
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px' }}>SAHU CSC</div>
          <div style={{ color: '#7dd3fc', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600' }}>Admin Alert</div>
        </div>
        
        {/* Body Section */}
        <div style={{ padding: '0 32px 40px' }}>
          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '600', margin: '0 0 16px', textAlign: 'center' }}>New Registration Request</h2>
          <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px', textAlign: 'center' }}>
            Hi Admin, a new operator account request has been submitted and is waiting for your review.
          </p>
          
          <div style={{ background: '#13284f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
                <div style={{ color: '#7dd3fc', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', paddingTop: '2px' }}>Applicant</div>
                <div style={{ color: '#fff', fontSize: '15px', textAlign: 'right' }}>Suresh Kumar<br/><span style={{ color: '#94a3b8', fontSize: '14px' }}>@sureshk</span></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
                <div style={{ color: '#7dd3fc', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Email</div>
                <div style={{ color: '#fff', fontSize: '15px' }}>suresh.kumar@gmail.com</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#7dd3fc', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Submitted</div>
                <div style={{ color: '#fff', fontSize: '15px' }}>7 Jul 2026, 9:30 AM</div>
              </div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <a href="#" style={{ display: 'inline-block', border: `2px solid ${accent}`, background: 'transparent', color: accent, textDecoration: 'none', padding: '12px 28px', borderRadius: '999px', fontSize: '15px', fontWeight: '600', transition: 'all 0.2s', boxShadow: `0 0 15px rgba(56,189,248,0.15)` }}>
              Review in Dashboard →
            </a>
          </div>
          
          <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', margin: 0 }}>
            This is an automated administrative notification.
          </p>
        </div>
        
      </div>
      
      <div style={{ marginTop: '24px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
        © {new Date().getFullYear()} SAHU CSC Platform, Odisha. All rights reserved.
      </div>
    </div>
  );
}
