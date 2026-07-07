import React from 'react';
import { Megaphone } from 'lucide-react';

export function V2AdminBroadcast() {
  const accent = '#a78bfa';
  const accentGlow = 'rgba(167,139,250,0.3)';
  
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      <div style={{ maxWidth: '560px', width: '100%', background: '#0f2244', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        
        {/* Header Section */}
        <div style={{ padding: '40px 32px 32px', textAlign: 'center', background: `linear-gradient(to bottom, rgba(167,139,250,0.1), transparent)`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: accent }}></div>
          
          <div style={{ margin: '0 auto 24px', width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${accentGlow}` }}>
            <Megaphone color="#fff" size={30} />
          </div>
          
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px' }}>SAHU CSC</div>
          <div style={{ color: '#c4b5fd', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600' }}>Platform Announcement</div>
        </div>
        
        {/* Body Section */}
        <div style={{ padding: '0 32px 40px' }}>
          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '600', margin: '0 0 24px', textAlign: 'center' }}>Message from Admin</h2>
          
          <div style={{ background: '#13284f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
            <p style={{ color: '#fff', fontSize: '15px', lineHeight: '1.7', margin: '0 0 16px' }}>
              Dear Team,
            </p>
            <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.7', margin: '0 0 16px' }}>
              Scheduled maintenance will take place on <strong>10 July 2026, 11:00 PM – 2:00 AM IST</strong>.
            </p>
            <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.7', margin: '0 0 16px' }}>
              The platform will be temporarily unavailable during this time. Please complete all pending transactions and log out before this window to avoid any disruption.
            </p>
            <p style={{ color: '#fff', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
              — SAHU CSC Admin
            </p>
          </div>
          
          <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 20px' }} />
          
          <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', margin: 0 }}>
            Sent by your administrator to all active platform users.
          </p>
        </div>
        
      </div>
      
      <div style={{ marginTop: '24px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
        © {new Date().getFullYear()} SAHU CSC Platform, Odisha. All rights reserved.
      </div>
    </div>
  );
}
