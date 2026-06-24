export function OtpEmail() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '40px 20px', minHeight: '100vh', background: 'linear-gradient(135deg, #0b2c60 0%, #1a4a8a 50%, #f97316 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '520px', background: '#ffffff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(to right, #0b2c60, #1a3f8a)', padding: '32px 24px', textAlign: 'center', color: '#ffffff' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔒</div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>SAHU CSC</h1>
        </div>
        
        <div style={{ background: 'linear-gradient(to right, #f97316, #ea580c)', padding: '8px 24px', textAlign: 'center' }}>
          <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: 800, letterSpacing: '1px' }}>PASSWORD RESET</span>
        </div>

        <div style={{ padding: '40px 32px' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 800, color: '#0b2c60' }}>Hi there! 👋</h2>
          <p style={{ margin: '0 0 32px 0', fontSize: '16px', color: '#4b5563', lineHeight: 1.6 }}>
            We received a request to reset your password. Use the OTP below to complete the process.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
            {['4', '9', '2', '8', '1', '5'].map((digit, i) => (
              <div key={i} style={{ width: '48px', height: '56px', background: '#ffffff', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px', fontWeight: 800, color: '#0b2c60', boxShadow: '0 8px 16px rgba(11,44,96,0.1)', border: '1px solid rgba(11,44,96,0.05)', fontFamily: 'monospace' }}>
                {digit}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ background: 'linear-gradient(to right, #f97316, #ea580c)', padding: '6px 16px', borderRadius: '999px', color: '#fff', fontSize: '13px', fontWeight: 700 }}>
              ⏳ Expires in 10 minutes
            </span>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #f97316', fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
            <strong style={{ color: '#0b2c60' }}>Didn't request this?</strong> If you didn't ask to reset your password, you can safely ignore this email.
          </div>
        </div>

        <div style={{ background: 'linear-gradient(to right, #0b2c60, #1a3f8a)', padding: '24px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 600 }}>SAHU CSC PLATFORM</p>
        </div>
      </div>
    </div>
  )
}
