import { useState } from "react";

// Variant 3: Full-width single page (all sections scroll, sticky sidebar highlights active)

function Field({ label, value="", type="text", disabled=false, half=false }:{ label:string; value?:string; type?:string; disabled?:boolean; half?:boolean }) {
  return (
    <div style={{gridColumn:half?"span 1":"span 2"}}>
      <label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5,letterSpacing:"0.02em"}}>{label}</label>
      <input type={type} defaultValue={value} disabled={disabled} style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #d1d5db",fontSize:14,color:disabled?"#9ca3af":"#111",background:disabled?"#f9fafb":"#fff",boxSizing:"border-box" as const}} />
    </div>
  );
}

function SectionBlock({ id, title, icon, children }:{ id:string; title:string; icon:string; children:React.ReactNode }) {
  return (
    <div id={id} style={{marginBottom:32,scrollMarginTop:80}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <div style={{width:36,height:36,borderRadius:10,background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>
        <h2 style={{margin:0,fontSize:15,fontWeight:700,color:"#0b2c60"}}>{title}</h2>
      </div>
      <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:"24px 28px"}}>{children}</div>
    </div>
  );
}

function Toggle({ on, set }:{ on:boolean; set:()=>void }) {
  return <div onClick={set} style={{width:44,height:24,borderRadius:12,background:on?"#0b2c60":"#d1d5db",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}><div style={{position:"absolute",top:2,left:on?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",transition:"left 0.2s"}} /></div>;
}

function SaveBtn({ label="Save" }:{ label?:string }) {
  return <button style={{padding:"9px 22px",borderRadius:8,background:"#0b2c60",color:"#fff",border:"none",fontSize:13,fontWeight:600,cursor:"pointer"}}>{label}</button>;
}

const NAV = [
  { id:"s-photo", label:"Photo" },
  { id:"s-info", label:"Personal Info" },
  { id:"s-security", label:"Security" },
  { id:"s-prefs", label:"Preferences" },
  { id:"s-business", label:"Business" },
  { id:"s-system", label:"System" },
];

export function V3Desktop() {
  const [active, setActive] = useState("s-photo");
  const [reg, setReg] = useState(true);
  const [bk, setBk] = useState(true);

  return (
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      {/* Top bar */}
      <div style={{position:"sticky" as const,top:0,zIndex:50,background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"0 36px",height:56,display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontWeight:800,fontSize:15,color:"#0b2c60"}}>SAHU <span style={{color:"#f97316"}}>CSC</span></span>
        <span style={{color:"#d1d5db"}}>›</span>
        <span style={{fontSize:13,color:"#374151",fontWeight:500}}>Profile & Settings</span>
      </div>

      <div style={{maxWidth:1000,margin:"0 auto",padding:"32px 24px",display:"flex",gap:28}}>
        {/* Sticky side nav */}
        <aside style={{width:180,flexShrink:0}}>
          <div style={{position:"sticky" as const,top:72}}>
            <p style={{margin:"0 0 10px 12px",fontSize:11,fontWeight:700,color:"#9ca3af",textTransform:"uppercase" as const,letterSpacing:"0.06em"}}>Sections</p>
            {NAV.map(n=>(
              <a key={n.id} href={`#${n.id}`} onClick={()=>setActive(n.id)} style={{display:"block",padding:"8px 12px",borderRadius:8,fontSize:13,fontWeight:active===n.id?600:400,color:active===n.id?"#0b2c60":"#6b7280",background:active===n.id?"#eff6ff":"transparent",textDecoration:"none",marginBottom:2}}>
                {n.label}
              </a>
            ))}
          </div>
        </aside>

        {/* Scrollable content */}
        <main style={{flex:1,minWidth:0}}>
          <SectionBlock id="s-photo" icon="📷" title="Profile Photo">
            <div style={{display:"flex",alignItems:"center",gap:20}}>
              <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#0b2c60,#1e40af)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:700,color:"#fff",flexShrink:0}}>A</div>
              <div>
                <p style={{margin:"0 0 4px",fontWeight:600,fontSize:15,color:"#111"}}>Admin User</p>
                <p style={{margin:"0 0 10px",fontSize:13,color:"#6b7280"}}>admin · Administrator · admin@sahucsc.in</p>
                <div style={{display:"flex",gap:10}}>
                  <button style={{padding:"7px 16px",borderRadius:8,background:"#0b2c60",color:"#fff",border:"none",fontSize:12,fontWeight:600,cursor:"pointer"}}>Change Photo</button>
                  <button style={{padding:"7px 16px",borderRadius:8,background:"#fff",color:"#ef4444",border:"1px solid #fecaca",fontSize:12,cursor:"pointer"}}>Remove</button>
                </div>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock id="s-info" icon="👤" title="Personal Information">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Field label="Full Name" value="Admin User" half /><Field label="Username" value="admin" disabled half />
              <Field label="Email" value="admin@sahucsc.in" type="email" half /><Field label="Mobile" value="+91 98765 43210" half />
              <Field label="Address" value="Bhubaneswar, Odisha" />
              <div style={{gridColumn:"span 2"}}>
                <label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5}}>Bio</label>
                <textarea rows={2} defaultValue="CSC operator serving rural Odisha." style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #d1d5db",fontSize:14,resize:"none" as const,boxSizing:"border-box" as const}} />
              </div>
            </div>
            <div style={{marginTop:18,display:"flex",justifyContent:"flex-end"}}><SaveBtn label="Save Info" /></div>
          </SectionBlock>

          <SectionBlock id="s-security" icon="🔒" title="Security">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
              <div style={{gridColumn:"span 3"}}><Field label="Current Password" type="password" /></div>
              <Field label="New Password" type="password" half /><Field label="Confirm Password" type="password" half />
            </div>
            <div style={{marginTop:18,display:"flex",justifyContent:"flex-end"}}><SaveBtn label="Update Password" /></div>
          </SectionBlock>

          <SectionBlock id="s-prefs" icon="🎨" title="Preferences">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
              {[{label:"Theme",opts:["Light","Dark"]},{label:"Language",opts:["English","हिंदी","ଓଡ଼ିଆ"]},{label:"Dashboard",opts:["Default","Compact"]}].map(p=>(
                <div key={p.label}>
                  <label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5}}>{p.label}</label>
                  <select style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #d1d5db",fontSize:13}}>{p.opts.map(o=><option key={o}>{o}</option>)}</select>
                </div>
              ))}
            </div>
            <div style={{marginTop:18,display:"flex",justifyContent:"flex-end"}}><SaveBtn label="Save Preferences" /></div>
          </SectionBlock>

          <SectionBlock id="s-business" icon="🏢" title="Business Information">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Field label="Business Name" value="SAHU CSC" half /><Field label="Website" value="sahucsc.in" half />
              <Field label="Mobile" value="+91 98765 43210" half /><Field label="Email" value="info@sahucsc.in" type="email" half />
              <Field label="Address" value="Bhubaneswar, Odisha" />
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5}}>Currency</label>
                <select style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #d1d5db",fontSize:13}}><option>INR (₹)</option><option>USD ($)</option></select>
              </div>
            </div>
            <div style={{marginTop:18,display:"flex",justifyContent:"flex-end"}}><SaveBtn label="Save Business Info" /></div>
          </SectionBlock>

          <SectionBlock id="s-system" icon="⚙️" title="System Settings">
            <div style={{display:"flex",flexDirection:"column" as const,gap:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderBottom:"1px solid #f3f4f6"}}>
                <div><p style={{margin:0,fontSize:14,fontWeight:500,color:"#111"}}>User Registration</p><p style={{margin:"3px 0 0",fontSize:12,color:"#9ca3af"}}>{reg?"Open — new users can register":"Closed — registration page hidden"}</p></div>
                <Toggle on={reg} set={()=>setReg(!reg)} />
              </div>
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingBottom:bk?14:0,borderBottom:bk?"1px solid #f3f4f6":"none"}}>
                  <div><p style={{margin:0,fontSize:14,fontWeight:500,color:"#111"}}>Auto Backup</p><p style={{margin:"3px 0 0",fontSize:12,color:"#9ca3af"}}>Schedule regular DB backups</p></div>
                  <Toggle on={bk} set={()=>setBk(!bk)} />
                </div>
                {bk&&<div style={{marginTop:14}}>
                  <label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5}}>Frequency (days)</label>
                  <input type="number" defaultValue={7} style={{width:80,padding:"9px 12px",borderRadius:8,border:"1px solid #d1d5db",fontSize:14}} />
                </div>}
              </div>
            </div>
          </SectionBlock>
        </main>
      </div>
    </div>
  );
}
