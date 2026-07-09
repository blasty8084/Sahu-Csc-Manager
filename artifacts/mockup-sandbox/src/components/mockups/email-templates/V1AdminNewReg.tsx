export function V1AdminNewReg() {
  return (
    <div className="min-h-screen bg-[#eef2f7] flex items-center justify-center py-10 px-4 font-sans">
      <div style={{ maxWidth: '560px', width: '100%', backgroundColor: '#ffffff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ backgroundColor: '#0b2c60', padding: '40px 24px', textAlign: 'center', color: '#ffffff' }}>
          <div style={{ display: 'inline-block', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', lineHeight: '56px', fontSize: '24px', marginBottom: '16px' }}>🔔</div>
          <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>ACTION REQUIRED</div>
          <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>SAHU <span style={{ color: '#3b82f6' }}>CSC</span></div>
        </div>
        <div style={{ backgroundColor: '#2563eb', height: '6px' }}></div>
        
        <div style={{ padding: '36px', color: '#1e293b', fontSize: '16px', lineHeight: '1.6' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#0b2c60', margin: '0 0 16px 0' }}>Hi Admin,</h1>
          <p style={{ margin: '0 0 24px 0' }}>A new registration request is waiting for your review on SAHU CSC.</p>
          
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid rgba(37,99,235,0.25)', borderRadius: '14px', padding: '24px', margin: '32px 0' }}>
            <table style={{ width: '100%', fontSize: '15px', color: '#1e40af', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 600, width: '100px' }}>Applicant:</td>
                  <td style={{ padding: '6px 0' }}>Suresh Kumar (@sureshk)</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 600 }}>Email:</td>
                  <td style={{ padding: '6px 0' }}>suresh.kumar@gmail.com</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 600 }}>Submitted:</td>
                  <td style={{ padding: '6px 0' }}>7 Jul 2026, 9:30 AM</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderLeft: '4px solid #0b2c60', borderRadius: '0 10px 10px 0', fontSize: '14px', color: '#475569' }}>
            Log in to SAHU CSC and go to <strong>User Management → Pending</strong> to approve or decline this request.
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
