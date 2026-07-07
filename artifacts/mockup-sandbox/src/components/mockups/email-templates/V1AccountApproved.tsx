export function V1AccountApproved() {
  return (
    <div className="min-h-screen bg-[#eef2f7] flex items-center justify-center py-10 px-4 font-sans">
      <div style={{ maxWidth: '560px', width: '100%', backgroundColor: '#ffffff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ backgroundColor: '#0b2c60', padding: '40px 24px', textAlign: 'center', color: '#ffffff' }}>
          <div style={{ display: 'inline-block', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', lineHeight: '56px', fontSize: '24px', marginBottom: '16px' }}>✅</div>
          <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>REGISTRATION APPROVED</div>
          <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>SAHU <span style={{ color: '#16a34a' }}>CSC</span></div>
        </div>
        <div style={{ backgroundColor: '#16a34a', height: '6px' }}></div>
        
        <div style={{ padding: '36px', color: '#1e293b', fontSize: '16px', lineHeight: '1.6' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#0b2c60', margin: '0 0 16px 0' }}>Hi Rajesh!</h1>
          <p style={{ margin: '0 0 24px 0' }}>Great news — your SAHU CSC account registration has been approved. You can now log in and start using the platform.</p>
          
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '14px', padding: '32px 24px', textAlign: 'center', margin: '32px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>Account Approved</div>
            <p style={{ margin: '0', color: '#15803d', fontSize: '15px' }}>Your account is active and ready to use.</p>
          </div>
          
          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderLeft: '4px solid #0b2c60', borderRadius: '0 10px 10px 0', fontSize: '14px', color: '#475569' }}>
            <strong>Next Steps:</strong> Open the SAHU CSC app and log in with your registered username and password to get started.
          </div>
        </div>
        
        <div style={{ backgroundColor: '#f1f5f9', padding: '24px 36px', textAlign: 'center', fontSize: '12px', color: '#64748b', borderTop: '1px solid #e2e8f0' }}>
          SAHU CSC · Common Service Center · Odisha, India<br/>
          <span style={{ marginTop: '12px', display: 'inline-block' }}>This is an automated message, please do not reply.</span>
        </div>
      </div>
    </div>
  );
}
