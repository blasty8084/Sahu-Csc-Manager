export function V1OtpVerification() {
  return (
    <div className="min-h-screen bg-[#eef2f7] flex items-center justify-center py-10 px-4 font-sans">
      <div style={{ maxWidth: '560px', width: '100%', backgroundColor: '#ffffff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ backgroundColor: '#0b2c60', padding: '40px 24px', textAlign: 'center', color: '#ffffff' }}>
          <div style={{ display: 'inline-block', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', lineHeight: '56px', fontSize: '24px', marginBottom: '16px' }}>✅</div>
          <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>EMAIL VERIFICATION</div>
          <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>SAHU <span style={{ color: '#16a34a' }}>CSC</span></div>
        </div>
        <div style={{ backgroundColor: '#16a34a', height: '6px' }}></div>
        
        <div style={{ padding: '36px', color: '#1e293b', fontSize: '16px', lineHeight: '1.6' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#0b2c60', margin: '0 0 16px 0' }}>Hi there!</h1>
          <p style={{ margin: '0 0 24px 0' }}>Welcome to SAHU CSC! Use the one-time password below to verify your email address and activate your account.</p>
          
          <div style={{ textAlign: 'center', margin: '32px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
              {["4", "7", "2", "8", "1", "9"].map((digit, i) => (
                <div key={i} style={{ width: '46px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: '#0b2c60', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px' }}>
                  {digit}
                </div>
              ))}
            </div>
            
            <div style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', fontSize: '18px', fontWeight: 600, color: '#334155', letterSpacing: '2px', marginBottom: '16px' }}>
              472819
            </div>
            
            <div>
              <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#f0fdf4', color: '#16a34a', fontSize: '12px', fontWeight: 600, borderRadius: '20px', border: '1px solid rgba(22,163,74,0.3)' }}>
                Expires at 10:45 AM · valid for 10 minutes
              </span>
            </div>
          </div>
          
          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderLeft: '4px solid #0b2c60', borderRadius: '0 10px 10px 0', fontSize: '14px', color: '#475569' }}>
            <strong>Security Notice:</strong> Do not share this code with anyone. SAHU CSC will never ask for this code over phone or email.
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
