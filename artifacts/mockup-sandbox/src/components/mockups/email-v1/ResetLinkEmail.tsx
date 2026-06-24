export function ResetLinkEmail() {
  return (
    <div style={{ background: '#eef2f7', minHeight: '100vh', padding: '40px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', background: '#ffffff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        {/* Header */}
        <div style={{ background: '#0b2c60', padding: '32px 24px', textAlign: 'center', color: '#ffffff' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔒</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>SAHU CSC</div>
        </div>
        
        {/* Badge Strip */}
        <div style={{ background: '#f97316', color: '#ffffff', padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px' }}>
          ADMIN-ASSISTED RESET
        </div>

        {/* Body */}
        <div style={{ padding: '32px 24px' }}>
          <h2 style={{ fontSize: '20px', color: '#111827', marginTop: 0, marginBottom: '16px' }}>Hi Meena!</h2>
          <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.5', marginTop: 0, marginBottom: '24px' }}>
            Your administrator has generated a secure password reset link for your account. Click the button below to choose a new password.
          </p>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
             <a href="#" style={{ display: 'inline-block', background: '#f97316', color: '#ffffff', textDecoration: 'none', padding: '14px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}>
               🔒 Reset My Password
             </a>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c', padding: '8px 16px', borderRadius: '9999px', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              ⏱ Expires at 04:00 PM · valid 10 minutes · one-time use only
            </div>
          </div>

          <div style={{ borderLeft: '4px solid #f97316', background: '#f8fafc', padding: '16px', marginBottom: '24px', borderRadius: '0 8px 8px 0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>If the button doesn't work, copy and paste this link:</div>
            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#0f172a', wordBreak: 'break-all' }}>
              https://sahu-csc.app/reset-password?token=a8b3c9f2...
            </div>
          </div>

          <div style={{ borderLeft: '4px solid #dc2626', background: '#fef2f2', padding: '16px', color: '#991b1b', fontSize: '14px', lineHeight: '1.5', borderRadius: '0 8px 8px 0' }}>
            <strong>Security Notice:</strong> Only use this link if your administrator told you to expect it. Never share this link with anyone.
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
