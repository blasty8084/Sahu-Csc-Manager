import { useState } from "react";

// V1 Mobile: Clean minimal — simple tab underline + white cards

const TABS = ["Profile","Security","Prefs","Business","System"];

function Field({ label, value="", type="text", disabled=false }:{ label:string; value?:string; type?:string; disabled?:boolean }) {
  return (
    <div style={{marginBottom:13}}>
      <label style={{display:"block",fontSize:11,fontWeight:600,color:"#6b7280",marginBottom:4,textTransform:"uppercase" as const,letterSpacing:"0.04em"}}>{label}</label>
      <input type={type} defaultValue={value} disabled={disabled} style={{width:"100%",padding:"10px 13px",borderRadius:9,border:"1px solid #e5e7eb",fontSize:14,color:disabled?"#9ca3af":"#111",background:disabled?"#f9fafb":"#fff",boxSizing:"border-box" as const}} />
    </div>
  );
}

function SaveBtn({ label="Save" }:{ label?:string }) {
  return <button style={{width:"100%",padding:"12px",borderRadius:10,background:"#0b2c60",color:"#fff",border:"none",fontSize:14,fontWeight:600,cursor:"pointer",marginTop:4}}>{label}</button>;
}

function Toggle({ on, set }:{ on:boolean; set:()=>void }) {
  return <div onClick={set} style={{width:44,height:24,borderRadius:12,background:on?"#0b2c60":"#d1d5db",cursor:"pointer",position:"relative",flexShrink:0}}><div style={{position:"absolute",top:2,left:on?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",transition:"left 0.2s"}} /></div>;
}

function Card({ title, children }:{ title:string; children:React.ReactNode }) {
  return (
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #e5e7eb",marginBottom:14}}>
      <div style={{padding:"13px 16px 10px",borderBottom:"1px solid #f3f4f6"}}><p style={{margin:0,fontSize:13,fontWeight:600,color:"#111"}}>{title}</p></div>
      <div style={{padding:16}}>{children}</div>
    </div>
  );
}

export function V1Mobile() {
  const [tab, setTab] = useState("Profile");
  const [reg, setReg] = useState(true);
  const [bk, setBk] = useState(true);

  return (
    <div style={{width:390,minHeight:"100vh",background:"#f9fafb",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",margin:"0 auto",display:"flex",flexDirection:"column" as const}}>
      <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"48px 16px 0"}}>
        <h1 style={{margin:"0 0 16px",fontSize:20,fontWeight:700,color:"#111"}}>Settings</h1>
        <div style={{display:"flex",overflowX:"auto" as const,scrollbarWidth:"none" as const}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"10px 16px",border:"none",background:"none",cursor:"pointer",whiteSpace:"nowrap" as const,fontSize:13,fontWeight:tab===t?600:400,color:tab===t?"#0b2c60":"#6b7280",borderBottom:tab===t?"2px solid #0b2c60":"2px solid transparent"}}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{flex:1,padding:16}}>
        {tab==="Profile"&&(
          <>
            <Card title="Photo">
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:"#0b2c60",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#fff",flexShrink:0}}>A</div>
                <div style={{flex:1}}>
                  <p style={{margin:"0 0 2px",fontWeight:600,fontSize:14}}>Admin User</p>
                  <p style={{margin:"0 0 8px",fontSize:12,color:"#6b7280"}}>admin · Administrator</p>
                  <div style={{display:"flex",gap:8}}>
                    <button style={{padding:"5px 12px",borderRadius:7,border:"1px solid #e5e7eb",background:"#fff",fontSize:12,cursor:"pointer"}}>Change</button>
                    <button style={{padding:"5px 12px",borderRadius:7,border:"1px solid #fecaca",background:"#fff",fontSize:12,cursor:"pointer",color:"#ef4444"}}>Remove</button>
                  </div>
                </div>
              </div>
            </Card>
            <Card title="Personal Info">
              <Field label="Full Name" value="Admin User" />
              <Field label="Username" value="admin" disabled />
              <Field label="Email" value="admin@sahucsc.in" type="email" />
              <Field label="Mobile" value="+91 98765 43210" />
              <Field label="Address" value="Bhubaneswar, Odisha" />
              <SaveBtn label="Save Changes" />
            </Card>
          </>
        )}
        {tab==="Security"&&(
          <>
            <Card title="Change Password">
              <Field label="Current Password" type="password" />
              <Field label="New Password" type="password" />
              <Field label="Confirm Password" type="password" />
              <SaveBtn label="Update Password" />
            </Card>
            <Card title="Sessions">
              {[{d:"Chrome · Windows",t:"Current",c:true},{d:"Firefox · Android",t:"2 hrs ago",c:false}].map(s=>(
                <div key={s.d} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #f3f4f6"}}>
                  <div><p style={{margin:0,fontSize:13,fontWeight:500}}>{s.d}</p><p style={{margin:"2px 0 0",fontSize:11,color:"#9ca3af"}}>{s.t}</p></div>
                  {s.c?<span style={{fontSize:11,color:"#16a34a",fontWeight:600}}>● Now</span>:<button style={{fontSize:12,color:"#ef4444",border:"none",background:"none",cursor:"pointer"}}>Revoke</button>}
                </div>
              ))}
            </Card>
          </>
        )}
        {tab==="Prefs"&&(
          <Card title="Preferences">
            {[{l:"Theme",opts:["Light","Dark"]},{l:"Language",opts:["English","हिंदी","ଓଡ଼ିଆ"]},{l:"Dashboard",opts:["Default","Compact"]}].map((p,i,a)=>(
              <div key={p.l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:i<a.length-1?"1px solid #f3f4f6":"none"}}>
                <p style={{margin:0,fontSize:14,color:"#111"}}>{p.l}</p>
                <select style={{padding:"7px 10px",borderRadius:8,border:"1px solid #e5e7eb",fontSize:13}}>{p.opts.map(o=><option key={o}>{o}</option>)}</select>
              </div>
            ))}
            <div style={{marginTop:12}}><SaveBtn label="Save Preferences" /></div>
          </Card>
        )}
        {tab==="Business"&&(
          <Card title="Business Info">
            <Field label="Name" value="SAHU CSC" />
            <Field label="Mobile" value="+91 98765 43210" />
            <Field label="Email" value="info@sahucsc.in" type="email" />
            <Field label="Website" value="sahucsc.in" />
            <Field label="Address" value="Bhubaneswar, Odisha" />
            <SaveBtn label="Save Business Info" />
          </Card>
        )}
        {tab==="System"&&(
          <>
            <Card title="Registration">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div><p style={{margin:0,fontSize:14,fontWeight:500}}>{reg?"Open":"Closed"}</p><p style={{margin:"2px 0 0",fontSize:12,color:"#9ca3af"}}>{reg?"New users can register":"Registration closed"}</p></div>
                <Toggle on={reg} set={()=>setReg(!reg)} />
              </div>
            </Card>
            <Card title="Backup">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingBottom:bk?14:0,borderBottom:bk?"1px solid #f3f4f6":"none"}}>
                <div><p style={{margin:0,fontSize:14,fontWeight:500}}>Auto Backup</p><p style={{margin:"2px 0 0",fontSize:12,color:"#9ca3af"}}>Schedule backups</p></div>
                <Toggle on={bk} set={()=>setBk(!bk)} />
              </div>
              {bk&&<div style={{marginTop:14}}><Field label="Frequency (days)" value="7" type="number" /></div>}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
