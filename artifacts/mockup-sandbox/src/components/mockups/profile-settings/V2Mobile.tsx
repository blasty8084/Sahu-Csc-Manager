import { useState } from "react";

// V2 Mobile: Navy header + icon chip tabs + saffron accent

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
      <label style={{display:"block",fontSize:11,fontWeight:600,color:"#6b7280",marginBottom:4}}>{label}</label>
      <input type={type} defaultValue={value} disabled={disabled} style={{width:"100%",padding:"11px 14px",borderRadius:10,border:"1.5px solid #e5e7eb",fontSize:14,color:disabled?"#9ca3af":"#111",background:disabled?"#f9fafb":"#fff",boxSizing:"border-box" as const}} />
    </div>
  );
}

function SaveBtn({ label="Save" }:{ label?:string }) {
  return <button style={{width:"100%",padding:"13px",borderRadius:12,background:"linear-gradient(135deg,#0b2c60,#1e40af)",color:"#fff",border:"none",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:6}}>{label}</button>;
}

function Toggle({ on, set }:{ on:boolean; set:()=>void }) {
  return <div onClick={set} style={{width:46,height:26,borderRadius:13,background:on?"#f97316":"#d1d5db",cursor:"pointer",position:"relative",flexShrink:0}}><div style={{position:"absolute",top:3,left:on?23:3,width:20,height:20,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,0.15)",transition:"left 0.2s"}} /></div>;
}

export function V2Mobile() {
  const [tab, setTab] = useState("profile");
  const [reg, setReg] = useState(true);
  const [bk, setBk] = useState(true);

  return (
    <div style={{width:390,minHeight:"100vh",background:"#f8fafc",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",margin:"0 auto",display:"flex",flexDirection:"column" as const}}>
      {/* Navy gradient header */}
      <div style={{background:"linear-gradient(135deg,#0b2c60,#1e40af)",padding:"48px 20px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
          <div style={{width:40,height:40,borderRadius:12,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"#fff"}}>A</div>
          <div>
            <p style={{margin:0,fontWeight:700,fontSize:15,color:"#fff"}}>Admin User</p>
            <p style={{margin:"2px 0 0",fontSize:12,color:"rgba(255,255,255,0.6)"}}>Administrator</p>
          </div>
        </div>
        {/* Icon tab chips */}
        <div style={{display:"flex",gap:8,overflowX:"auto" as const,scrollbarWidth:"none" as const,paddingBottom:2}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:20,border:"none",cursor:"pointer",whiteSpace:"nowrap" as const,fontSize:12,fontWeight:600,background:tab===t.id?"#f97316":"rgba(255,255,255,0.12)",color:"#fff",flexShrink:0}}>
              <span style={{fontSize:14}}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{flex:1,padding:"16px"}}>
        {tab==="profile"&&(
          <>
            {/* Avatar row */}
            <div style={{background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:"18px",marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:58,height:58,borderRadius:"50%",background:"linear-gradient(135deg,#0b2c60,#1e40af)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:"#fff",flexShrink:0}}>A</div>
              <div style={{flex:1}}>
                <p style={{margin:"0 0 3px",fontWeight:700,fontSize:15}}>Admin User</p>
                <p style={{margin:"0 0 10px",fontSize:12,color:"#6b7280"}}>admin@sahucsc.in</p>
                <button style={{padding:"6px 14px",borderRadius:8,background:"#0b2c60",color:"#fff",border:"none",fontSize:12,fontWeight:600,cursor:"pointer"}}>Change Photo</button>
              </div>
            </div>
            <div style={{background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:"18px",marginBottom:14}}>
              <p style={{margin:"0 0 14px",fontSize:13,fontWeight:600,color:"#374151"}}>Personal Information</p>
              <Field label="Full Name" value="Admin User" />
              <Field label="Username" value="admin" disabled />
              <Field label="Email" value="admin@sahucsc.in" type="email" />
              <Field label="Mobile" value="+91 98765 43210" />
              <Field label="Address" value="Bhubaneswar, Odisha" />
              <SaveBtn label="Save Changes" />
            </div>
          </>
        )}
        {tab==="security"&&(
          <>
            <div style={{background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:"18px",marginBottom:14}}>
              <p style={{margin:"0 0 14px",fontSize:13,fontWeight:600,color:"#374151"}}>Change Password</p>
              <Field label="Current Password" type="password" />
              <Field label="New Password" type="password" />
              <Field label="Confirm Password" type="password" />
              <SaveBtn label="Update Password" />
            </div>
            <div style={{background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:"18px"}}>
              <p style={{margin:"0 0 12px",fontSize:13,fontWeight:600,color:"#374151"}}>Sessions</p>
              {[{d:"Chrome · Windows",t:"Current",c:true},{d:"Firefox · Android",t:"2 hrs ago",c:false}].map(s=>(
                <div key={s.d} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid #f3f4f6"}}>
                  <div><p style={{margin:0,fontSize:13,fontWeight:500}}>{s.d}</p><p style={{margin:"2px 0 0",fontSize:11,color:"#9ca3af"}}>{s.t}</p></div>
                  {s.c?<span style={{fontSize:11,color:"#16a34a",fontWeight:700,background:"#f0fdf4",padding:"3px 10px",borderRadius:20}}>Current</span>:<button style={{fontSize:12,color:"#ef4444",border:"1px solid #fecaca",borderRadius:8,padding:"5px 10px",background:"#fff",cursor:"pointer"}}>Revoke</button>}
                </div>
              ))}
            </div>
          </>
        )}
        {tab==="prefs"&&(
          <div style={{background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:"18px"}}>
            <p style={{margin:"0 0 14px",fontSize:13,fontWeight:600,color:"#374151"}}>Preferences</p>
            {[{l:"Theme",opts:["Light","Dark"]},{l:"Language",opts:["English","हिंदी","ଓଡ଼ିଆ"]},{l:"Dashboard",opts:["Default","Compact"]}].map((p,i,a)=>(
              <div key={p.l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:i<a.length-1?"1px solid #f3f4f6":"none"}}>
                <p style={{margin:0,fontSize:14}}>{p.l}</p>
                <select style={{padding:"8px 10px",borderRadius:8,border:"1.5px solid #e5e7eb",fontSize:13}}>{p.opts.map(o=><option key={o}>{o}</option>)}</select>
              </div>
            ))}
            <div style={{marginTop:12}}><SaveBtn label="Save Preferences" /></div>
          </div>
        )}
        {tab==="business"&&(
          <div style={{background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:"18px"}}>
            <p style={{margin:"0 0 14px",fontSize:13,fontWeight:600,color:"#374151"}}>Business Info</p>
            <Field label="Name" value="SAHU CSC" />
            <Field label="Mobile" value="+91 98765 43210" />
            <Field label="Email" value="info@sahucsc.in" type="email" />
            <Field label="Website" value="sahucsc.in" />
            <Field label="Address" value="Bhubaneswar, Odisha" />
            <SaveBtn label="Save Business Info" />
          </div>
        )}
        {tab==="system"&&(
          <>
            <div style={{background:"#fff",borderRadius:16,border:`1.5px solid ${reg?"#bbf7d0":"#fecaca"}`,padding:"18px",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{flex:1,paddingRight:12}}>
                  <p style={{margin:0,fontSize:14,fontWeight:600}}>{reg?"Registrations Open":"Registrations Closed"}</p>
                  <p style={{margin:"3px 0 0",fontSize:12,color:"#9ca3af"}}>{reg?"New users can register":"Registration page is closed"}</p>
                </div>
                <Toggle on={reg} set={()=>setReg(!reg)} />
              </div>
            </div>
            <div style={{background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:"18px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingBottom:bk?14:0,borderBottom:bk?"1px solid #f3f4f6":"none"}}>
                <div><p style={{margin:0,fontSize:14,fontWeight:600}}>Auto Backup</p><p style={{margin:"3px 0 0",fontSize:12,color:"#9ca3af"}}>Schedule regular backups</p></div>
                <Toggle on={bk} set={()=>setBk(!bk)} />
              </div>
              {bk&&<div style={{marginTop:14}}><Field label="Frequency (days)" value="7" type="number" /></div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
