export function V1RegistrationDeclined() {
  return (
    <div className="min-h-screen bg-[#eef2f7] flex items-center justify-center py-10 px-4 font-sans">
      <div style={{ maxWidth: '560px', width: '100%', backgroundColor: '#ffffff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ backgroundColor: '#0b2c60', padding: '40px 24px', textAlign: 'center', color: '#ffffff' }}>
          <div style={{ display: 'inline-block', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', lineHeight: '56px', fontSize: '24px', marginBottom: '16px' }}>❌</div>
          <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>REGISTRATION DECLINED</div>
          <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>SAHU <span style={{ color: '#dc2626' }}>CSC</span></div>
        </div>
        <div style={{ backgroundColor: '#dc2626', height: '6px' }}></div>
        
        <div style={{ padding: '36px', color: '#1e293b', fontSize: '16px', lineHeight: '1.6' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#0b2c60', margin: '0 0 16px 0' }}>Hi Priya!</h1>
          <p style={{ margin: '0 0 24px 0' }}>We're sorry to inform you that your SAHU CSC registration request has been declined.</p>
          
          <div style={{ backgroundColor: '#fff7ed', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '14px', padding: '24px', margin: '32px 0' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#9a3412', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason provided:</div>
            <p style={{ margin: '0', color: '#c2410c', fontSize: '15px' }}>The submitted documents could not be verified. Please contact your local CSC administrator.</p>
          </div>
          
          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderLeft: '4px solid #f97316', borderRadius: '0 10px 10px 0', fontSize: '14px', color: '#475569' }}>
            If you believe this is a mistake or would like clarification, please contact your SAHU CSC administrator directly.
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
