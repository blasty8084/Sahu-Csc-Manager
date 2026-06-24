export function OtpEmail() {
  return (
    <div style={{ background: '#eef2f7', minHeight: '100vh', padding: '40px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', background: '#ffffff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        {/* Header */}
        <div style={{ background: '#0b2c60', padding: '32px 24px', textAlign: 'center', color: '#ffffff' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔒</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>SAHU CSC</div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>Management Platform · Odisha</div>
        </div>
        
        {/* Badge Strip */}
        <div style={{ background: '#f97316', color: '#ffffff', padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px' }}>
          PASSWORD RESET
        </div>

        {/* Body */}
        <div style={{ padding: '32px 24px' }}>
          <h2 style={{ fontSize: '20px', color: '#111827', marginTop: 0, marginBottom: '16px' }}>Hi there!</h2>
          <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.5', marginTop: 0, marginBottom: '24px' }}>
            We received a request to reset your password. Use the OTP below to complete the process.
          </p>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
            {['4', '8', '2', '7', '1', '9'].map((digit, i) => (
              <div key={i} style={{ width: '46px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontFamily: 'monospace', fontWeight: 'bold', color: '#0b2c60', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', boxShadow: '0 2px 0 0 rgba(0,0,0,0.05)' }}>
                {digit}
              </div>
            ))}
          </div>

          <div style={{ border: '2px dashed #f97316', borderRadius: '8px', padding: '16px', textAlign: 'center', marginBottom: '24px', background: '#fff7ed' }}>
             <div style={{ fontSize: '14px', color: '#c2410c', marginBottom: '4px', fontWeight: 600 }}>Or copy the code</div>
             <div style={{ fontSize: '28px', fontFamily: 'monospace', fontWeight: 'bold', color: '#9a3412', letterSpacing: '4px' }}>482719</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ background: '#f97316', color: '#ffffff', padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              ⏱ Expires at 03:45 PM · valid for 10 minutes
            </div>
          </div>

          <div style={{ borderLeft: '4px solid #f97316', background: '#f8fafc', padding: '16px', color: '#0b2c60', fontSize: '14px', lineHeight: '1.5', borderRadius: '0 8px 8px 0' }}>
            <strong>Security Notice:</strong> If you didn't request a password reset, you can safely ignore this email. Your account is secure.
            <br/><br/>
            <span style={{ color: '#64748b' }}>For <strong>Email Verification</strong> during registration, a similar OTP will be sent.</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: '#f1f5f9', padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px', borderTop: '1px solid #e2e8f0' }}>
          <div><strong>SAHU CSC</strong> · Common Service Center</div>
          <div style={{ marginTop: '4px' }}>Odisha, India</div>
        </div>
      </div>
    </div>
  );
}
