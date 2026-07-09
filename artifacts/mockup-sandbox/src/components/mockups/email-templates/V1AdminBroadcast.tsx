export function V1AdminBroadcast() {
  return (
    <div className="min-h-screen bg-[#eef2f7] flex items-center justify-center py-10 px-4 font-sans">
      <div style={{ maxWidth: '560px', width: '100%', backgroundColor: '#ffffff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ backgroundColor: '#0b2c60', padding: '40px 24px', textAlign: 'center', color: '#ffffff' }}>
          <div style={{ display: 'inline-block', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', lineHeight: '56px', fontSize: '24px', marginBottom: '16px' }}>📢</div>
          <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>ADMIN BROADCAST</div>
          <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>SAHU <span style={{ color: '#3b82f6' }}>CSC</span></div>
        </div>
        <div style={{ backgroundColor: '#0b2c60', height: '6px' }}></div>
        
        <div style={{ padding: '36px', color: '#1e293b', fontSize: '16px', lineHeight: '1.6' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#0b2c60', margin: '0 0 24px 0' }}>Hello,</h1>
          
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', marginBottom: '32px' }}>
            <p style={{ margin: '0 0 16px 0' }}>Dear Team,</p>
            <p style={{ margin: '0 0 16px 0' }}>This is to inform all operators that the SAHU CSC platform will undergo scheduled maintenance on 10 July 2026 from 11:00 PM to 2:00 AM IST.</p>
            <p style={{ margin: '0 0 16px 0' }}>During this window, the platform will be temporarily unavailable. Please complete all transactions before the maintenance window.</p>
            <p style={{ margin: '0 0 24px 0' }}>We apologize for any inconvenience.</p>
            <p style={{ margin: '0', fontWeight: 600, color: '#0b2c60' }}>— SAHU CSC Admin Team</p>
          </div>
          
          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 24px 0' }} />
          
          <div style={{ fontStyle: 'italic', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
            This message was sent by your SAHU CSC administrator.
          </div>
        </div>
        
        <div style={{ backgroundColor: '#f1f5f9', padding: '24px 36px', textAlign: 'center', fontSize: '12px', color: '#64748b', borderTop: '1px solid #e2e8f0' }}>
          SAHU CSC · Common Service Center · Odisha, India<br/>
          <span style={{ marginTop: '12px', display: 'inline-block' }}>This is an automated message, please do not reply.</span>
        </div>
      </div>
    </div>
  );
}
