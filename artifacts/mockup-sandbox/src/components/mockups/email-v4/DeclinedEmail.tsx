export function DeclinedEmail() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '40px 20px', minHeight: '100vh', background: 'linear-gradient(135deg, #0b2c60 0%, #1a4a8a 50%, #f43f5e 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '520px', background: '#ffffff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(to right, #0b2c60, #1a3f8a)', padding: '32px 24px', textAlign: 'center', color: '#ffffff' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚠️</div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>SAHU CSC</h1>
        </div>
        
        <div style={{ background: 'linear-gradient(to right, #f43f5e, #e11d48)', padding: '8px 24px', textAlign: 'center' }}>
          <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: 800, letterSpacing: '1px' }}>APPLICATION UPDATE</span>
        </div>

        <div style={{ padding: '40px 32px' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 800, color: '#0b2c60' }}>Hi Priya,</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#4b5563', lineHeight: 1.6 }}>
            We've reviewed your application for a SAHU CSC account. Unfortunately, we cannot approve it at this time.
          </p>

          <div style={{ border: '2px solid #ffe4e6', borderRadius: '16px', padding: '24px', marginBottom: '32px', background: '#fff1f2' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#e11d48', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase' }}>REASON FOR DECLINE</h3>
            <p style={{ margin: 0, color: '#9f1239', fontSize: '15px', fontWeight: 600 }}>
              The documents provided are illegible. Please submit high-quality scans of your PAN card and Aadhaar.
            </p>
          </div>

          <p style={{ margin: '0 0 32px 0', fontSize: '15px', color: '#4b5563', lineHeight: 1.6 }}>
            You can address these issues and re-apply, or contact support for more details.
          </p>

          <div style={{ textAlign: 'center' }}>
            <a href="#" style={{ display: 'inline-block', background: 'linear-gradient(to right, #0b2c60, #1a3f8a)', color: '#ffffff', textDecoration: 'none', padding: '16px 32px', borderRadius: '999px', fontSize: '16px', fontWeight: 700, boxShadow: '0 10px 20px rgba(11,44,96,0.2)' }}>
              Contact Support
            </a>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(to right, #0b2c60, #1a3f8a)', padding: '24px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 600 }}>SAHU CSC PLATFORM</p>
        </div>
      </div>
    </div>
  )
}
