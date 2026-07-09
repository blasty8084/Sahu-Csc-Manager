import { useState } from "react";

// Variant 4: Dark sidebar + card grid (modern dashboard style)

const MENU = [
  { id:"profile", label:"My Profile", icon:"👤", badge:null },
  { id:"security", label:"Security", icon:"🔒", badge:null },
  { id:"preferences", label:"Preferences", icon:"🎨", badge:null },
  { id:"business", label:"Business Info", icon:"🏢", badge:null },
  { id:"system", label:"System", icon:"⚙️", badge:"Admin" },
];

function Field({ label, value="", type="text", disabled=false }:{ label:string; value?:string; type?:string; disabled?:boolean }) {
  return (
    <div>
      <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:5,textTransform:"uppercase" as const,letterSpacing:"0.06em"}}>{label}</label>
      <input type={type} defaultValue={value} disabled={disabled} style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1.5px solid #e5e7eb",fontSize:14,color:disabled?"#9ca3af":"#111",background:disabled?"#f9fafb":"#fff",boxSizing:"border-box" as const}} />
    </div>
  );
}

function Toggle({ on, set }:{ on:boolean; set:()=>void }) {
  return <div onClick={set} style={{width:44,height:24,borderRadius:12,background:on?"#22c55e":"#e5e7eb",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}><div style={{position:"absolute",top:2,left:on?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,0.2)",transition:"left 0.2s"}} /></div>;
}

function PrimaryBtn({ label }:{ label:string }) {
  return <button style={{padding:"10px 24px",borderRadius:8,background:"#0b2c60",color:"#fff",border:"none",fontSize:13,fontWeight:600,cursor:"pointer"}}>{label}</button>;
}

export function V4Desktop() {
  const [tab, setTab] = useState("profile");
  const [reg, setReg] = useState(true);
  const [bk, setBk] = useState(true);

  return (
    <div style={{minHeight:"100vh",display:"flex",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      {/* Dark sidebar */}
      <aside style={{width:220,background:"#0f172a",display:"flex",flexDirection:"column" as const,padding:"24px 12px",flexShrink:0}}>
        <div style={{padding:"0 12px 24px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
          <span style={{fontWeight:800,fontSize:15,color:"#fff"}}>SAHU <span style={{color:"#f97316"}}>CSC</span></span>
        </div>
        <div style={{flex:1,paddingTop:16}}>
          <p style={{margin:"0 12px 8px",fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",textTransform:"uppercase" as const,letterSpacing:"0.08em"}}>Settings</p>
          {MENU.map(m=>(
            <button key={m.id} onClick={()=>setTab(m.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",borderRadius:10,border:"none",background:tab===m.id?"rgba(255,255,255,0.1)":"transparent",color:tab===m.id?"#fff":"rgba(255,255,255,0.55)",cursor:"pointer",textAlign:"left" as const,fontSize:13,fontWeight:tab===m.id?600:400,marginBottom:2}}>
              <span style={{fontSize:16}}>{m.icon}</span>
              <span style={{flex:1}}>{m.label}</span>
              {m.badge&&<span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:20,background:"rgba(249,115,22,0.2)",color:"#f97316"}}>{m.badge}</span>}
            </button>
          ))}
        </div>
        {/* User chip at bottom */}
        <div style={{padding:"16px 12px 0",borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"#1e40af",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0}}>A</div>
          <div style={{flex:1,minWidth:0}}><p style={{margin:0,fontSize:12,fontWeight:600,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>Admin User</p><p style={{margin:0,fontSize:10,color:"rgba(255,255,255,0.4)"}}>admin</p></div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{flex:1,background:"#f8fafc",minWidth:0,overflow:"auto" as const}}>
        <div style={{padding:"32px 36px"}}>
          {tab==="profile"&&(
            <>
              {/* Profile hero card */}
              <div style={{background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:"24px 28px",marginBottom:20,display:"flex",alignItems:"center",gap:20}}>
                <div style={{position:"relative",flexShrink:0}}>
                  <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#0b2c60,#1e40af)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:700,color:"#fff"}}>A</div>
                  <div style={{position:"absolute",bottom:0,right:0,width:24,height:24,borderRadius:"50%",background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,cursor:"pointer"}}>📷</div>
                </div>
                <div style={{flex:1}}>
                  <h2 style={{margin:0,fontSize:20,fontWeight:700,color:"#111"}}>Admin User</h2>
                  <p style={{margin:"4px 0 0",fontSize:13,color:"#6b7280"}}>admin · Administrator · Member since Jan 2024</p>
                </div>
                <button style={{padding:"8px 18px",borderRadius:8,background:"#fff",border:"1px solid #e5e7eb",fontSize:12,fontWeight:600,color:"#374151",cursor:"pointer"}}>Change Photo</button>
              </div>

              {/* 2-col form */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {[["Full Name","Admin User",false],["Username","admin",true],["Email","admin@sahucsc.in",false],["Mobile","+91 98765 43210",false]].map(([l,v,d])=>(
                  <div key={l as string} style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:"18px 20px"}}>
                    <Field label={l as string} value={v as string} disabled={d as boolean} />
                  </div>
                ))}
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:"18px 20px",gridColumn:"span 2"}}>
                  <Field label="Address" value="Bhubaneswar, Odisha" />
                </div>
              </div>
              <div style={{marginTop:20,display:"flex",justifyContent:"flex-end"}}><PrimaryBtn label="Save Profile" /></div>
            </>
          )}

          {tab==="security"&&(
            <div style={{maxWidth:520}}>
              <h1 style={{margin:"0 0 20px",fontSize:18,fontWeight:700,color:"#111"}}>Security</h1>
              <div style={{background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:"24px",marginBottom:20}}>
                <p style={{margin:"0 0 16px",fontSize:14,fontWeight:600,color:"#111"}}>Change Password</p>
                <div style={{display:"flex",flexDirection:"column" as const,gap:14}}>
                  <Field label="Current Password" type="password" />
                  <Field label="New Password" type="password" />
                  <Field label="Confirm Password" type="password" />
                </div>
                <div style={{marginTop:18}}><PrimaryBtn label="Update Password" /></div>
              </div>
              <h3 style={{margin:"0 0 10px",fontSize:13,fontWeight:700,color:"#374151",textTransform:"uppercase" as const,letterSpacing:"0.04em"}}>Active Sessions</h3>
              {[{d:"Chrome on Windows",ip:"192.168.1.1",t:"Current",c:true},{d:"Firefox on Android",ip:"103.12.45.67",t:"2h ago",c:false}].map(s=>(
                <div key={s.d} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderRadius:10,background:"#fff",border:"1px solid #e5e7eb",marginBottom:8}}>
                  <div><p style={{margin:0,fontSize:14,fontWeight:500}}>{s.d}</p><p style={{margin:"2px 0 0",fontSize:12,color:"#9ca3af"}}>{s.ip} · {s.t}</p></div>
                  {s.c?<span style={{fontSize:11,color:"#16a34a",fontWeight:600,background:"#f0fdf4",padding:"4px 10px",borderRadius:20}}>This device</span>:<button style={{fontSize:12,color:"#ef4444",border:"none",background:"none",cursor:"pointer",fontWeight:500}}>Revoke</button>}
                </div>
              ))}
            </div>
          )}

          {tab==="preferences"&&(
            <div style={{maxWidth:560}}>
              <h1 style={{margin:"0 0 20px",fontSize:18,fontWeight:700,color:"#111"}}>Preferences</h1>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
                {[{icon:"☀️",label:"Theme",opts:["Light","Dark"]},{icon:"🌐",label:"Language",opts:["English","हिंदी","ଓଡ଼ିଆ"]},{icon:"📊",label:"Dashboard",opts:["Default","Compact"]}].map(p=>(
                  <div key={p.label} style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:"18px"}}>
                    <div style={{fontSize:24,marginBottom:10}}>{p.icon}</div>
                    <p style={{margin:"0 0 4px",fontSize:13,fontWeight:600,color:"#111"}}>{p.label}</p>
                    <select style={{width:"100%",padding:"8px 10px",borderRadius:7,border:"1px solid #e5e7eb",fontSize:12,marginTop:8}}>{p.opts.map(o=><option key={o}>{o}</option>)}</select>
                  </div>
                ))}
              </div>
              <div style={{marginTop:20,display:"flex",justifyContent:"flex-end"}}><PrimaryBtn label="Save Preferences" /></div>
            </div>
          )}

          {tab==="business"&&(
            <div style={{maxWidth:600}}>
              <h1 style={{margin:"0 0 20px",fontSize:18,fontWeight:700,color:"#111"}}>Business Information</h1>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {[["Business Name","SAHU CSC"],["Website","sahucsc.in"],["Mobile","+91 98765 43210"],["Email","info@sahucsc.in"]].map(([l,v])=>(
                  <div key={l} style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:"18px 20px"}}><Field label={l} value={v} /></div>
                ))}
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:"18px 20px",gridColumn:"span 2"}}><Field label="Address" value="Bhubaneswar, Odisha" /></div>
              </div>
              <div style={{marginTop:20,display:"flex",justifyContent:"flex-end"}}><PrimaryBtn label="Save Business Info" /></div>
            </div>
          )}

          {tab==="system"&&(
            <div style={{maxWidth:560}}>
              <h1 style={{margin:"0 0 20px",fontSize:18,fontWeight:700,color:"#111"}}>System Settings</h1>
              {[
                {title:"User Registration",sub:reg?"New users can self-register":"Registration is closed",node:<Toggle on={reg} set={()=>setReg(!reg)} />,status:reg?"Open":"Closed",ok:reg},
                {title:"Auto Backup",sub:"Schedule regular database backups",node:<Toggle on={bk} set={()=>setBk(!bk)} />,status:bk?"Enabled":"Disabled",ok:bk},
              ].map(s=>(
                <div key={s.title} style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:"20px 22px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <p style={{margin:0,fontSize:14,fontWeight:600,color:"#111"}}>{s.title}</p>
                    <p style={{margin:"3px 0 6px",fontSize:12,color:"#9ca3af"}}>{s.sub}</p>
                    <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:s.ok?"#f0fdf4":"#fef2f2",color:s.ok?"#16a34a":"#dc2626"}}>{s.status}</span>
                  </div>
                  {s.node}
                </div>
              ))}
              {bk&&<div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:"20px 22px"}}>
                <p style={{margin:"0 0 10px",fontSize:13,fontWeight:600,color:"#111"}}>Backup Frequency</p>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <input type="number" defaultValue={7} style={{width:80,padding:"9px 12px",borderRadius:8,border:"1px solid #e5e7eb",fontSize:14}} />
                  <span style={{fontSize:13,color:"#6b7280"}}>days between backups</span>
                </div>
              </div>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
