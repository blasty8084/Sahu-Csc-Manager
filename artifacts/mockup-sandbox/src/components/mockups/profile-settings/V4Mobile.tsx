import { useState } from "react";

// V4 Mobile: Dark sidebar drawer + card grid (matches V4 Desktop)

const TABS = [
  { id:"profile", label:"Profile", icon:"👤" },
  { id:"security", label:"Security", icon:"🔒" },
  { id:"prefs", label:"Prefs", icon:"🎨" },
  { id:"business", label:"Business", icon:"🏢" },
  { id:"system", label:"System", icon:"⚙️" },
];

function Field({ label, value="", type="text", disabled=false }:{ label:string; value?:string; type?:string; disabled?:boolean }) {
  return (
    <div style={{marginBottom:13}}>
      <label style={{display:"block",fontSize:10,fontWeight:700,color:"#6b7280",marginBottom:4,textTransform:"uppercase" as const,letterSpacing:"0.06em"}}>{label}</label>
      <input type={type} defaultValue={value} disabled={disabled} style={{width:"100%",padding:"11px 14px",borderRadius:10,border:"1.5px solid #e5e7eb",fontSize:14,color:disabled?"#9ca3af":"#111",background:disabled?"#f9fafb":"#fff",boxSizing:"border-box" as const}} />
    </div>
  );
}

function Toggle({ on, set }:{ on:boolean; set:()=>void }) {
  return <div onClick={set} style={{width:44,height:24,borderRadius:12,background:on?"#22c55e":"#e5e7eb",cursor:"pointer",position:"relative",flexShrink:0}}><div style={{position:"absolute",top:2,left:on?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,0.2)",transition:"left 0.2s"}} /></div>;
}

function PrimaryBtn({ label }:{ label:string }) {
  return <button style={{width:"100%",padding:"12px",borderRadius:10,background:"#0b2c60",color:"#fff",border:"none",fontSize:14,fontWeight:600,cursor:"pointer",marginTop:4}}>{label}</button>;
}

export function V4Mobile() {
  const [tab, setTab] = useState("profile");
  const [reg, setReg] = useState(true);
  const [bk, setBk] = useState(true);

  return (
    <div style={{width:390,minHeight:"100vh",background:"#f8fafc",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",margin:"0 auto",display:"flex",flexDirection:"column" as const}}>
      {/* Dark top bar */}
      <div style={{background:"#0f172a",padding:"48px 20px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <span style={{fontWeight:800,fontSize:16,color:"#fff"}}>SAHU <span style={{color:"#f97316"}}>CSC</span></span>
          <p style={{margin:"3px 0 0",fontSize:11,color:"rgba(255,255,255,0.4)"}}>Settings & Profile</p>
        </div>
        <div style={{width:36,height:36,borderRadius:"50%",background:"#1e40af",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff"}}>A</div>
      </div>

      {/* Icon tab bar */}
      <div style={{background:"#1e293b",display:"flex",overflowX:"auto" as const,scrollbarWidth:"none" as const}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column" as const,alignItems:"center",gap:4,padding:"10px 16px",border:"none",background:"none",cursor:"pointer",whiteSpace:"nowrap" as const,fontSize:10,fontWeight:600,color:tab===t.id?"#f97316":"rgba(255,255,255,0.45)",borderBottom:tab===t.id?"2px solid #f97316":"2px solid transparent",flexShrink:0}}>
            <span style={{fontSize:18}}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{flex:1,padding:16}}>
        {tab==="profile"&&(
          <>
            {/* Profile card */}
            <div style={{background:"linear-gradient(135deg,#0b2c60,#1e40af)",borderRadius:16,padding:"20px",marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:"rgba(255,255,255,0.15)",border:"2px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:"#fff",flexShrink:0}}>A</div>
              <div style={{flex:1}}>
                <p style={{margin:0,fontWeight:700,fontSize:16,color:"#fff"}}>Admin User</p>
                <p style={{margin:"2px 0 10px",fontSize:12,color:"rgba(255,255,255,0.6)"}}>Administrator</p>
                <button style={{padding:"6px 14px",borderRadius:8,background:"#f97316",color:"#fff",border:"none",fontSize:12,fontWeight:600,cursor:"pointer"}}>Change Photo</button>
              </div>
            </div>

            <div style={{background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:"18px",marginBottom:14}}>
              <p style={{margin:"0 0 14px",fontSize:13,fontWeight:700,color:"#0f172a",textTransform:"uppercase" as const,letterSpacing:"0.04em"}}>Personal Info</p>
              <Field label="Full Name" value="Admin User" />
              <Field label="Username" value="admin" disabled />
              <Field label="Email" value="admin@sahucsc.in" type="email" />
              <Field label="Mobile" value="+91 98765 43210" />
              <Field label="Address" value="Bhubaneswar, Odisha" />
              <PrimaryBtn label="Save Changes" />
            </div>
          </>
        )}

        {tab==="security"&&(
          <>
            <div style={{background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:"18px",marginBottom:14}}>
              <p style={{margin:"0 0 14px",fontSize:13,fontWeight:700,color:"#0f172a",textTransform:"uppercase" as const,letterSpacing:"0.04em"}}>Password</p>
              <Field label="Current Password" type="password" />
              <Field label="New Password" type="password" />
              <Field label="Confirm Password" type="password" />
              <PrimaryBtn label="Update Password" />
            </div>
            <div style={{background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:"18px"}}>
              <p style={{margin:"0 0 12px",fontSize:13,fontWeight:700,color:"#0f172a",textTransform:"uppercase" as const,letterSpacing:"0.04em"}}>Sessions</p>
              {[{d:"Chrome · Windows",t:"Current",c:true},{d:"Firefox · Android",t:"2 hrs ago",c:false}].map(s=>(
                <div key={s.d} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid #f3f4f6"}}>
                  <div><p style={{margin:0,fontSize:13,fontWeight:500}}>{s.d}</p><p style={{margin:"2px 0 0",fontSize:11,color:"#9ca3af"}}>{s.t}</p></div>
                  {s.c?<span style={{fontSize:11,color:"#16a34a",fontWeight:700,background:"#f0fdf4",padding:"3px 10px",borderRadius:20}}>This device</span>:<button style={{fontSize:12,color:"#ef4444",border:"none",background:"none",cursor:"pointer",fontWeight:500}}>Revoke</button>}
                </div>
              ))}
            </div>
          </>
        )}

        {tab==="prefs"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[{icon:"☀️",label:"Theme",opts:["Light","Dark"]},{icon:"🌐",label:"Language",opts:["English","हिंदी","ଓଡ଼ିଆ"]},{icon:"📊",label:"Dashboard",opts:["Default","Compact"]},{icon:"🔔",label:"Notifications",opts:["On","Off"]}].map(p=>(
              <div key={p.label} style={{background:"#fff",borderRadius:14,border:"1px solid #e5e7eb",padding:"16px 14px"}}>
                <div style={{fontSize:22,marginBottom:8}}>{p.icon}</div>
                <p style={{margin:"0 0 8px",fontSize:13,fontWeight:600,color:"#0f172a"}}>{p.label}</p>
                <select style={{width:"100%",padding:"7px 10px",borderRadius:8,border:"1.5px solid #e5e7eb",fontSize:12,background:"#fff"}}>{p.opts.map(o=><option key={o}>{o}</option>)}</select>
              </div>
            ))}
            <div style={{gridColumn:"span 2"}}><PrimaryBtn label="Save Preferences" /></div>
          </div>
        )}

        {tab==="business"&&(
          <div style={{background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:"18px"}}>
            <p style={{margin:"0 0 14px",fontSize:13,fontWeight:700,color:"#0f172a",textTransform:"uppercase" as const,letterSpacing:"0.04em"}}>Business Info</p>
            <Field label="Name" value="SAHU CSC" />
            <Field label="Mobile" value="+91 98765 43210" />
            <Field label="Email" value="info@sahucsc.in" type="email" />
            <Field label="Website" value="sahucsc.in" />
            <Field label="Address" value="Bhubaneswar, Odisha" />
            <PrimaryBtn label="Save Business Info" />
          </div>
        )}

        {tab==="system"&&(
          <>
            {[
              {title:"User Registration",sub:reg?"Open — users can register":"Closed — page hidden",on:reg,set:()=>setReg(v=>!v),ok:reg},
              {title:"Auto Backup",sub:bk?"Backups scheduled":"No automatic backups",on:bk,set:()=>setBk(v=>!v),ok:bk},
            ].map(s=>(
              <div key={s.title} style={{background:"#fff",borderRadius:14,border:`1.5px solid ${s.ok?"#bbf7d0":"#e5e7eb"}`,padding:"16px 18px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{flex:1,paddingRight:12}}>
                  <p style={{margin:0,fontSize:14,fontWeight:600,color:"#0f172a"}}>{s.title}</p>
                  <p style={{margin:"3px 0 0",fontSize:12,color:"#9ca3af"}}>{s.sub}</p>
                </div>
                <Toggle on={s.on} set={s.set} />
              </div>
            ))}
            {bk&&(
              <div style={{background:"#fff",borderRadius:14,border:"1px solid #e5e7eb",padding:"16px 18px"}}>
                <p style={{margin:"0 0 10px",fontSize:13,fontWeight:600,color:"#0f172a"}}>Backup every</p>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <input type="number" defaultValue={7} style={{width:70,padding:"9px 12px",borderRadius:8,border:"1.5px solid #e5e7eb",fontSize:14}} />
                  <span style={{fontSize:13,color:"#6b7280"}}>days</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
