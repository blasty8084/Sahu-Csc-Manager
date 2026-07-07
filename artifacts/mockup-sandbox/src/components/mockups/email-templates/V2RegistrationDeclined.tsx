import React from 'react';
import { XCircle } from 'lucide-react';

export function V2RegistrationDeclined() {
  const accent = '#f43f5e';
  const accentGlow = 'rgba(244,63,94,0.3)';
  
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      <div style={{ maxWidth: '560px', width: '100%', background: '#0f2244', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        
        {/* Header Section */}
        <div style={{ padding: '40px 32px 32px', textAlign: 'center', background: `linear-gradient(to bottom, rgba(244,63,94,0.1), transparent)`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: accent }}></div>
          
          <div style={{ margin: '0 auto 24px', width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${accentGlow}` }}>
            <XCircle color="#fff" size={32} />
          </div>
          
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px' }}>SAHU CSC</div>
          <div style={{ color: '#fb7185', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600' }}>Status Update</div>
        </div>
        
        {/* Body Section */}
        <div style={{ padding: '0 32px 40px' }}>
          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '600', margin: '0 0 20px', textAlign: 'center' }}>Registration Not Approved</h2>
          <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px' }}>
            Hi <strong>Priya</strong>,<br /><br />
            Thank you for applying to join the SAHU CSC platform. We have reviewed your application, but we could not approve your registration request at this time.
          </p>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderLeft: `4px solid ${accent}`, padding: '20px', borderRadius: '0 8px 8px 0', marginBottom: '32px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Reason provided</div>
            <div style={{ color: '#fff', fontSize: '15px', lineHeight: '1.5' }}>
              The provided CSC ID could not be verified against the central database. Please ensure you have entered the exact ID registered with the district office.
            </div>
          </div>
          
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', margin: '0 0 0', textAlign: 'center' }}>
            If you believe this was an error, please double-check your credentials and submit a new request, or contact our support team.
          </p>
        </div>
        
      </div>
      
      <div style={{ marginTop: '24px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
        © {new Date().getFullYear()} SAHU CSC Platform, Odisha. All rights reserved.
      </div>
    </div>
  );
}
