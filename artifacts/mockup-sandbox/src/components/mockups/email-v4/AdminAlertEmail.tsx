export function AdminAlertEmail() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '40px 20px', minHeight: '100vh', background: 'linear-gradient(135deg, #0b2c60 0%, #312e81 50%, #8b5cf6 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '520px', background: '#ffffff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(to right, #312e81, #4c1d95)', padding: '32px 24px', textAlign: 'center', color: '#ffffff' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🛡️</div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>ADMIN ALERT</h1>
        </div>
        
        <div style={{ background: 'linear-gradient(to right, #8b5cf6, #7c3aed)', padding: '8px 24px', textAlign: 'center' }}>
          <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: 800, letterSpacing: '1px' }}>🔔 ACTION REQUIRED</span>
        </div>

        <div style={{ padding: '40px 32px' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 800, color: '#312e81' }}>New Registration</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#4b5563', lineHeight: 1.6 }}>
            A new user has submitted a registration request and is waiting for approval.
          </p>

          <div style={{ border: '2px solid #ede9fe', borderRadius: '16px', padding: '24px', marginBottom: '32px', background: '#ffffff' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '12px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Name</span>
                <span style={{ display: 'block', fontSize: '15px', color: '#312e81', fontWeight: 600 }}>Amit Kumar</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '12px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Phone</span>
                <span style={{ display: 'block', fontSize: '15px', color: '#312e81', fontWeight: 600 }}>+91 98765 43210</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '12px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Location</span>
                <span style={{ display: 'block', fontSize: '15px', color: '#312e81', fontWeight: 600 }}>Bhubaneswar, Odisha</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '12px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Submitted</span>
                <span style={{ display: 'block', fontSize: '15px', color: '#312e81', fontWeight: 600 }}>10 mins ago</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <a href="#" style={{ display: 'inline-block', background: 'linear-gradient(to right, #8b5cf6, #7c3aed)', color: '#ffffff', textDecoration: 'none', padding: '16px 32px', borderRadius: '999px', fontSize: '16px', fontWeight: 700, boxShadow: '0 10px 20px rgba(139,92,246,0.3)' }}>
              Review Application
            </a>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(to right, #312e81, #4c1d95)', padding: '24px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 600 }}>SAHU CSC ADMIN SYSTEM</p>
        </div>
      </div>
    </div>
  )
}
