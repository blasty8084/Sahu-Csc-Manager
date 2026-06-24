export function AdminAlertEmail() {
  return (
    <div style={{ background: '#eef2f7', minHeight: '100vh', padding: '40px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', background: '#ffffff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        {/* Header */}
        <div style={{ background: '#0b2c60', padding: '32px 24px', textAlign: 'center', color: '#ffffff' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>SAHU CSC</div>
        </div>
        
        {/* Badge Strip */}
        <div style={{ background: '#0b2c60', color: '#ffffff', padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          ACTION REQUIRED
        </div>

        {/* Body */}
        <div style={{ padding: '32px 24px' }}>
          <h2 style={{ fontSize: '20px', color: '#111827', marginTop: 0, marginBottom: '16px' }}>Hi Admin!</h2>
          <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.5', marginTop: 0, marginBottom: '24px' }}>
            A new user has submitted a registration request and is waiting for your approval.
          </p>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
            <div style={{ fontSize: '15px', color: '#1e3a8a', marginBottom: '8px' }}><strong>Applicant:</strong> Suresh Kumar (@suresh_k)</div>
            <div style={{ fontSize: '15px', color: '#1e3a8a', marginBottom: '8px' }}><strong>Email:</strong> suresh@example.com</div>
            <div style={{ fontSize: '15px', color: '#1e3a8a' }}><strong>Submitted:</strong> 24 Jun 2026, 10:30 AM</div>
          </div>

          <div style={{ borderLeft: '4px solid #0b2c60', background: '#f8fafc', padding: '16px', color: '#334155', fontSize: '14px', lineHeight: '1.5', borderRadius: '0 8px 8px 0' }}>
            Log in to SAHU CSC → User Management → Pending to approve or decline.
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
             <a href="#" style={{ display: 'inline-block', background: '#f97316', color: '#ffffff', textDecoration: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}>
               Review Registration
             </a>
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
