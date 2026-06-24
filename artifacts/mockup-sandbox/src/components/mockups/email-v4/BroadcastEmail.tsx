export function BroadcastEmail() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '40px 20px', minHeight: '100vh', background: 'linear-gradient(135deg, #0b2c60 0%, #1a4a8a 50%, #0d9488 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '520px', background: '#ffffff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(to right, #0b2c60, #0f766e)', padding: '32px 24px', textAlign: 'center', color: '#ffffff' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>📣</div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>SAHU CSC</h1>
        </div>
        
        <div style={{ background: 'linear-gradient(to right, #0d9488, #0f766e)', padding: '8px 24px', textAlign: 'center' }}>
          <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: 800, letterSpacing: '1px' }}>📢 IMPORTANT BROADCAST</span>
        </div>

        <div style={{ padding: '40px 32px' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 800, color: '#0b2c60' }}>System Maintenance Notice</h2>
          <div style={{ fontSize: '16px', color: '#4b5563', lineHeight: 1.7 }}>
            <p style={{ margin: '0 0 16px 0' }}>Dear Retailer,</p>
            <p style={{ margin: '0 0 16px 0' }}>
              Please be informed that the AePS service will be undergoing scheduled maintenance this weekend.
            </p>
            <div style={{ background: '#f0fdfa', borderRadius: '12px', padding: '20px', margin: '24px 0', borderLeft: '4px solid #0d9488' }}>
              <strong style={{ display: 'block', color: '#0f766e', marginBottom: '8px' }}>Maintenance Window:</strong>
              Saturday, 15 Oct, 2:00 AM to 4:00 AM IST
            </div>
            <p style={{ margin: 0 }}>
              During this time, AePS transactions will be unavailable. Other services like Udhari and Ledger will work normally.
            </p>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(to right, #0b2c60, #0f766e)', padding: '24px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 600 }}>SAHU CSC PLATFORM</p>
        </div>
      </div>
    </div>
  )
}
