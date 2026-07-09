import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function V2OtpVerification() {
  const accent = '#10b981';
  const accentGlow = 'rgba(16,185,129,0.3)';
  
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      <div style={{ maxWidth: '560px', width: '100%', background: '#0f2244', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        
        {/* Header Section */}
        <div style={{ padding: '40px 32px 32px', textAlign: 'center', background: `linear-gradient(to bottom, rgba(16,185,129,0.1), transparent)`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: accent }}></div>
          
          <div style={{ margin: '0 auto 24px', width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${accentGlow}` }}>
            <CheckCircle2 color="#fff" size={32} />
          </div>
          
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px' }}>SAHU CSC</div>
          <div style={{ color: '#34d399', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600' }}>Email Verification</div>
        </div>
        
        {/* Body Section */}
        <div style={{ padding: '0 32px 40px' }}>
          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '600', margin: '0 0 16px', textAlign: 'center' }}>Verify Your Email</h2>
          <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.6', margin: '0 0 32px', textAlign: 'center' }}>
            We received a request to verify this email address. Please use the verification code below to complete your setup.
          </p>
          
          <div style={{ background: '#0b1e3d', border: `1px dashed ${accent}`, borderRadius: '12px', padding: '32px', textAlign: 'center', marginBottom: '24px', boxShadow: `inset 0 0 20px rgba(0,0,0,0.5), 0 0 15px ${accentGlow}` }}>
            <div style={{ color: '#fff', fontSize: '36px', fontFamily: 'monospace', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {['4','7','2','8','1','9'].map((digit, i) => (
                <span key={i} style={{ width: '48px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(16,185,129,0.5)`, borderRadius: '8px', boxShadow: `0 0 10px ${accentGlow}` }}>
                  {digit}
                </span>
              ))}
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ display: 'inline-block', background: 'linear-gradient(to right, rgba(16,185,129,0.1), rgba(16,185,129,0.2))', border: `1px solid rgba(16,185,129,0.3)`, borderRadius: '999px', padding: '6px 16px', color: '#10b981', fontSize: '13px', fontWeight: '500' }}>
              ⏱ Expires in 10 minutes
            </span>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: `4px solid ${accent}`, padding: '16px 20px', borderRadius: '0 8px 8px 0', color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>
            <strong style={{ color: '#fff' }}>Security Note:</strong> We will never ask for this code over the phone. Do not share it with anyone.
          </div>
        </div>
        
      </div>
      
      <div style={{ marginTop: '24px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
        © {new Date().getFullYear()} SAHU CSC Platform, Odisha. All rights reserved.
      </div>
    </div>
  );
}
