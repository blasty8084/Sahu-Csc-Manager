import { useState } from "react";

// Variant 2: Top horizontal tabs + two-column layout

const TABS = [
  { id:"profile", label:"Profile", icon:"👤" },
  { id:"security", label:"Security", icon:"🔒" },
  { id:"preferences", label:"Preferences", icon:"🎨" },
  { id:"business", label:"Business", icon:"🏢" },
  { id:"system", label:"System", icon:"⚙️" },
];

function Field({ label, value="", type="text", disabled=false }:{ label:string; value?:string; type?:string; disabled?:boolean }) {
  return (
    <div>
      <label style={{display:"block",fontSize:12,fontWeight:500,color:"#6b7280",marginBottom:5}}>{label}</label>
      <input type={type} defaultValue={value} disabled={disabled} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1.5px solid #f0f0f0",fontSize:14,color:disabled?"#9ca3af":"#111",background:disabled?"#fafafa":"#fff",boxSizing:"border-box" as const}} />
    </div>
  );
}

function Btn({ label, secondary }:{ label:string; secondary?:boolean }) {
  return <button style={{padding:"9px 22px",borderRadius:10,background:secondary?"#fff":"#0b2c60",color:secondary?"#374151":"#fff",border:secondary?"1.5px solid #e5e7eb":"none",fontSize:13,fontWeight:600,cursor:"pointer"}}>{label}</button>;
}

function Toggle({ on, set }:{ on:boolean; set:()=>void }) {
  return <div onClick={set} style={{width:46,height:26,borderRadius:13,background:on?"#f97316":"#e5e7eb",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}><div style={{position:"absolute",top:3,left:on?23:3,width:20,height:20,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,0.15)",transition:"left 0.2s"}} /></div>;
}

export function V2Desktop() {
  const [tab, setTab] = useState("profile");
  const [reg, setReg] = useState(true);
  const [bk, setBk] = useState(true);

  return (
    <div style={{minHeight:"100vh",background:"#fff",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      {/* Header with gradient accent */}
      <div style={{background:"linear-gradient(135deg,#0b2c60,#1e40af)",padding:"0 36px",display:"flex",alignItems:"center",height:60,gap:16}}>
        <span style={{fontWeight:800,fontSize:16,color:"#fff",letterSpacing:-0.3}}>SAHU <span style={{color:"#f97316"}}>CSC</span></span>
        <div style={{flex:1}} />
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff"}}>A</div>
          <span style={{color:"rgba(255,255,255,0.85)",fontSize:13}}>Admin</span>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{borderBottom:"1.5px solid #f0f0f0",padding:"0 36px",display:"flex",gap:4}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:7,padding:"14px 16px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:tab===t.id?600:400,color:tab===t.id?"#0b2c60":"#6b7280",borderBottom:tab===t.id?"2px solid #0b2c60":"2px solid transparent"}}>
            <span style={{fontSize:16}}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div style={{maxWidth:900,margin:"0 auto",padding:"32px 36px"}}>
        {tab==="profile"&&(
          <div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:32}}>
            {/* Left: avatar */}
            <div style={{display:"flex",flexDirection:"column" as const,alignItems:"center",gap:14,padding:"28px 20px",background:"#fafafa",borderRadius:16,border:"1px solid #f0f0f0",height:"fit-content"}}>
              <div style={{width:88,height:88,borderRadius:"50%",background:"linear-gradient(135deg,#0b2c60,#1e40af)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,fontWeight:700,color:"#fff"}}>A</div>
              <div style={{textAlign:"center" as const}}>
                <p style={{margin:0,fontWeight:700,fontSize:16,color:"#111"}}>Admin User</p>
                <p style={{margin:"4px 0 0",fontSize:12,color:"#9ca3af"}}>Administrator</p>
              </div>
              <div style={{display:"flex",flexDirection:"column" as const,gap:8,width:"100%"}}>
                <Btn label="Change Photo" />
                <Btn label="Remove Photo" secondary />
              </div>
              <p style={{margin:0,fontSize:11,color:"#9ca3af",textAlign:"center" as const}}>JPG, PNG, WEBP · max 5 MB</p>
            </div>
            {/* Right: form */}
            <div>
              <h2 style={{margin:"0 0 20px",fontSize:16,fontWeight:700,color:"#111"}}>Personal Information</h2>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <Field label="Full Name" value="Admin User" /><Field label="Username" value="admin" disabled />
                <Field label="Email" value="admin@sahucsc.in" type="email" /><Field label="Mobile" value="+91 98765 43210" />
              </div>
              <div style={{marginTop:16,display:"grid",gap:16}}>
                <Field label="Address" value="Bhubaneswar, Odisha" />
                <div>
                  <label style={{display:"block",fontSize:12,fontWeight:500,color:"#6b7280",marginBottom:5}}>Bio</label>
                  <textarea rows={3} defaultValue="CSC operator serving rural Odisha." style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1.5px solid #f0f0f0",fontSize:14,resize:"none" as const,boxSizing:"border-box" as const}} />
                </div>
              </div>
              <div style={{marginTop:20,display:"flex",gap:10}}><Btn label="Save Changes" /><Btn label="Discard" secondary /></div>
            </div>
          </div>
        )}

        {tab==="security"&&(
          <div style={{maxWidth:540}}>
            <h2 style={{margin:"0 0 20px",fontSize:16,fontWeight:700,color:"#111"}}>Security</h2>
            <div style={{background:"#fafafa",borderRadius:16,border:"1px solid #f0f0f0",padding:"24px",marginBottom:20}}>
              <p style={{margin:"0 0 16px",fontSize:14,fontWeight:600,color:"#111"}}>Change Password</p>
              <div style={{display:"flex",flexDirection:"column" as const,gap:14}}>
                <Field label="Current Password" type="password" />
                <Field label="New Password" type="password" />
                <Field label="Confirm Password" type="password" />
              </div>
              <div style={{marginTop:20}}><Btn label="Update Password" /></div>
            </div>
            <h3 style={{margin:"0 0 12px",fontSize:14,fontWeight:600,color:"#111"}}>Active Sessions</h3>
            {[{d:"Chrome on Windows",ip:"192.168.1.1",t:"Now",c:true},{d:"Firefox on Android",ip:"103.12.45.67",t:"2 hrs ago",c:false}].map(s=>(
              <div key={s.d} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderRadius:12,background:"#fafafa",border:"1px solid #f0f0f0",marginBottom:10}}>
                <div><p style={{margin:0,fontSize:14,fontWeight:500}}>{s.d}</p><p style={{margin:"3px 0 0",fontSize:12,color:"#9ca3af"}}>{s.ip} · {s.t}</p></div>
                {s.c?<span style={{fontSize:12,color:"#16a34a",fontWeight:600,background:"#f0fdf4",padding:"4px 10px",borderRadius:20}}>Current</span>:<button style={{fontSize:12,color:"#ef4444",border:"1px solid #fecaca",borderRadius:8,padding:"4px 10px",background:"#fff",cursor:"pointer"}}>Revoke</button>}
              </div>
            ))}
          </div>
        )}

        {tab==="preferences"&&(
          <div style={{maxWidth:540}}>
            <h2 style={{margin:"0 0 20px",fontSize:16,fontWeight:700,color:"#111"}}>Preferences</h2>
            <div style={{background:"#fafafa",borderRadius:16,border:"1px solid #f0f0f0",padding:"8px 0"}}>
              {[{label:"Theme",sub:"Light or dark interface",opts:["Light","Dark"]},{label:"Language",sub:"Display language",opts:["English","हिंदी","ଓଡ଼ିଆ"]},{label:"Dashboard",sub:"Widget layout",opts:["Default","Compact"]}].map((p,i,a)=>(
                <div key={p.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px",borderBottom:i<a.length-1?"1px solid #f0f0f0":"none"}}>
                  <div><p style={{margin:0,fontSize:14,fontWeight:500,color:"#111"}}>{p.label}</p><p style={{margin:"2px 0 0",fontSize:12,color:"#9ca3af"}}>{p.sub}</p></div>
                  <select style={{padding:"8px 12px",borderRadius:8,border:"1px solid #e5e7eb",fontSize:13}}>{p.opts.map(o=><option key={o}>{o}</option>)}</select>
                </div>
              ))}
            </div>
            <div style={{marginTop:20}}><Btn label="Save Preferences" /></div>
          </div>
        )}

        {tab==="business"&&(
          <div style={{maxWidth:600}}>
            <h2 style={{margin:"0 0 20px",fontSize:16,fontWeight:700,color:"#111"}}>Business Information</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <Field label="Business Name" value="SAHU CSC" /><Field label="Website" value="sahucsc.in" />
              <Field label="Mobile" value="+91 98765 43210" /><Field label="Email" value="info@sahucsc.in" type="email" />
            </div>
            <div style={{marginTop:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <Field label="Address" value="Bhubaneswar, Odisha" />
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:500,color:"#6b7280",marginBottom:5}}>Currency</label>
                <select style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1.5px solid #f0f0f0",fontSize:14}}><option>INR (₹)</option><option>USD ($)</option></select>
              </div>
            </div>
            <div style={{marginTop:20}}><Btn label="Save Business Info" /></div>
          </div>
        )}

        {tab==="system"&&(
          <div style={{maxWidth:540}}>
            <h2 style={{margin:"0 0 20px",fontSize:16,fontWeight:700,color:"#111"}}>System Settings</h2>
            <div style={{background:"#fafafa",borderRadius:16,border:"1px solid #f0f0f0",padding:"20px 24px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <p style={{margin:0,fontSize:14,fontWeight:600,color:"#111"}}>User Registration</p>
                  <p style={{margin:"4px 0 0",fontSize:12,color:"#9ca3af"}}>Allow new users to self-register</p>
                  <span style={{display:"inline-block",marginTop:8,fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,background:reg?"#f0fdf4":"#fef2f2",color:reg?"#16a34a":"#dc2626"}}>{reg?"Open":"Closed"}</span>
                </div>
                <Toggle on={reg} set={()=>setReg(!reg)} />
              </div>
            </div>
            <div style={{background:"#fafafa",borderRadius:16,border:"1px solid #f0f0f0",padding:"20px 24px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div><p style={{margin:0,fontSize:14,fontWeight:600,color:"#111"}}>Auto Backup</p><p style={{margin:"4px 0 0",fontSize:12,color:"#9ca3af"}}>Scheduled database backups</p></div>
                <Toggle on={bk} set={()=>setBk(!bk)} />
              </div>
              {bk&&<div style={{marginTop:16,paddingTop:16,borderTop:"1px solid #f0f0f0"}}>
                <label style={{display:"block",fontSize:12,fontWeight:500,color:"#6b7280",marginBottom:5}}>Every (days)</label>
                <input type="number" defaultValue={7} style={{width:80,padding:"9px 12px",borderRadius:8,border:"1px solid #e5e7eb",fontSize:14}} />
              </div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
