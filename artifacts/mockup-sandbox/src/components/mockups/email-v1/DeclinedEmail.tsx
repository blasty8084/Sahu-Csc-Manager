export function DeclinedEmail() {
  return (
    <div style={{ background: '#eef2f7', minHeight: '100vh', padding: '40px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', background: '#ffffff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        {/* Header */}
        <div style={{ background: '#0b2c60', padding: '32px 24px', textAlign: 'center', color: '#ffffff' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>❌</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>SAHU CSC</div>
        </div>
        
        {/* Badge Strip */}
        <div style={{ background: '#dc2626', color: '#ffffff', padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px' }}>
          REGISTRATION DECLINED
        </div>

        {/* Body */}
        <div style={{ padding: '32px 24px' }}>
          <h2 style={{ fontSize: '20px', color: '#111827', marginTop: 0, marginBottom: '16px' }}>Hi Priya!</h2>
          <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.5', marginTop: 0, marginBottom: '24px' }}>
            We're sorry, but your recent registration request for the SAHU CSC platform has been declined by the administrator.
          </p>

          <div style={{ border: '2px dashed #f97316', background: '#fff7ed', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', color: '#9a3412', fontWeight: 600 }}>
              Reason provided: Account quota full for this region.
            </div>
          </div>

          <div style={{ borderLeft: '4px solid #f97316', background: '#f8fafc', padding: '16px', color: '#334155', fontSize: '14px', lineHeight: '1.5', borderRadius: '0 8px 8px 0' }}>
            If you believe this is a mistake, please contact your SAHU CSC administrator for further clarification.
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
