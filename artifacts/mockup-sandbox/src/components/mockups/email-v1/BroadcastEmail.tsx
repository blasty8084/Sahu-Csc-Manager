export function BroadcastEmail() {
  return (
    <div style={{ background: '#eef2f7', minHeight: '100vh', padding: '40px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', background: '#ffffff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        {/* Header */}
        <div style={{ background: '#0b2c60', padding: '32px 24px', textAlign: 'center', color: '#ffffff' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📢</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>SAHU CSC</div>
        </div>
        
        {/* Badge Strip */}
        <div style={{ background: '#0b2c60', color: '#ffffff', padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          ADMIN BROADCAST
        </div>

        {/* Body */}
        <div style={{ padding: '32px 24px' }}>
          <h2 style={{ fontSize: '20px', color: '#111827', marginTop: 0, marginBottom: '16px' }}>Hello,</h2>
          <div style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.6', marginTop: 0, marginBottom: '24px', whiteSpace: 'pre-wrap' }}>
            This is a reminder that the SAHU CSC platform will undergo scheduled maintenance on June 25, 2026 from 11:00 PM to 1:00 AM IST.{"\n\n"}
            During this window, the platform will be temporarily unavailable. Please complete any pending transactions before this time.{"\n\n"}
            Apologies for any inconvenience.
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />

          <div style={{ fontStyle: 'italic', color: '#64748b', fontSize: '14px', textAlign: 'center' }}>
            Sent by your SAHU CSC administrator.
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
