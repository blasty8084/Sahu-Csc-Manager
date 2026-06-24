export function ResetLinkEmail() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '40px 20px', minHeight: '100vh', background: 'linear-gradient(135deg, #0b2c60 0%, #1a4a8a 50%, #f97316 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '520px', background: '#ffffff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(to right, #0b2c60, #1a3f8a)', padding: '32px 24px', textAlign: 'center', color: '#ffffff' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔑</div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>SAHU CSC</h1>
        </div>
        
        <div style={{ background: 'linear-gradient(to right, #f97316, #ea580c)', padding: '8px 24px', textAlign: 'center' }}>
          <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: 800, letterSpacing: '1px' }}>RESET YOUR PASSWORD</span>
        </div>

        <div style={{ padding: '40px 32px' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 800, color: '#0b2c60' }}>Hi there!</h2>
          <p style={{ margin: '0 0 32px 0', fontSize: '16px', color: '#4b5563', lineHeight: 1.6 }}>
            Click the button below to securely reset your password. This link is valid for 1 hour.
          </p>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <a href="#" style={{ display: 'inline-block', background: 'linear-gradient(to right, #f97316, #ea580c)', color: '#ffffff', textDecoration: 'none', padding: '16px 40px', borderRadius: '999px', fontSize: '18px', fontWeight: 800, boxShadow: '0 12px 24px rgba(249,115,22,0.3)' }}>
              Reset Password
            </a>
          </div>

          <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Or copy and paste this URL into your browser:</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#0b2c60', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              https://sahucsc.com/auth/reset?token=9f8d7e6c5b4a3f2e1d
            </p>
          </div>

          <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #ef4444', fontSize: '14px', color: '#7f1d1d', lineHeight: 1.5 }}>
            <strong style={{ color: '#991b1b' }}>Security Notice:</strong> If you didn't request a password reset, your account is still secure. You can safely ignore this email.
          </div>
        </div>

        <div style={{ background: 'linear-gradient(to right, #0b2c60, #1a3f8a)', padding: '24px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 600 }}>SAHU CSC PLATFORM</p>
        </div>
      </div>
    </div>
  )
}
