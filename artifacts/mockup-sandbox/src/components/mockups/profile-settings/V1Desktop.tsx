import { useState } from "react";

// Variant 1: Sidebar nav + white cards (clean minimal)

const TABS = ["Profile","Security","Preferences","Business","System"];

function Field({ label, value="", type="text", disabled=false }:{ label:string; value?:string; type?:string; disabled?:boolean }) {
  return (
    <div>
      <label style={{display:"block",fontSize:12,fontWeight:600,color:"#6b7280",marginBottom:4}}>{label}</label>
      <input type={type} defaultValue={value} disabled={disabled} style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #e5e7eb",fontSize:14,color:disabled?"#9ca3af":"#111",background:disabled?"#f9fafb":"#fff",boxSizing:"border-box" as const}} />
    </div>
  );
}

function Card({ title, children }:{ title:string; children:React.ReactNode }) {
  return (
    <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden",marginBottom:16}}>
      <div style={{padding:"14px 20px",borderBottom:"1px solid #f3f4f6"}}><p style={{margin:0,fontSize:14,fontWeight:600,color:"#111"}}>{title}</p></div>
      <div style={{padding:20}}>{children}</div>
    </div>
  );
}

function SaveBtn({ label="Save Changes" }:{ label?:string }) {
  return <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}><button style={{padding:"8px 20px",borderRadius:8,background:"#0b2c60",color:"#fff",border:"none",fontSize:13,fontWeight:600,cursor:"pointer"}}>{label}</button></div>;
}

function Toggle({ on, set }:{ on:boolean; set:()=>void }) {
  return <div onClick={set} style={{width:42,height:24,borderRadius:12,background:on?"#0b2c60":"#d1d5db",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}><div style={{position:"absolute",top:2,left:on?20:2,width:20,height:20,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",transition:"left 0.2s"}} /></div>;
}

export function V1Desktop() {
  const [tab, setTab] = useState("Profile");
  const [reg, setReg] = useState(true);
  const [bk, setBk] = useState(true);

  const content: Record<string,React.ReactNode> = {
    Profile: (
      <>
        <Card title="Photo">
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:60,height:60,borderRadius:"50%",background:"#0b2c60",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:"#fff"}}>A</div>
            <div>
              <p style={{margin:"0 0 2px",fontWeight:600,fontSize:14,color:"#111"}}>Admin User</p>
              <p style={{margin:"0 0 8px",fontSize:12,color:"#6b7280"}}>admin · Administrator</p>
              <div style={{display:"flex",gap:8}}>
                <button style={{padding:"5px 12px",borderRadius:7,border:"1px solid #e5e7eb",background:"#fff",fontSize:12,cursor:"pointer"}}>Change</button>
                <button style={{padding:"5px 12px",borderRadius:7,border:"1px solid #fecaca",background:"#fff",fontSize:12,cursor:"pointer",color:"#ef4444"}}>Remove</button>
              </div>
            </div>
          </div>
        </Card>
        <Card title="Personal Information">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Field label="Full Name" value="Admin User" /><Field label="Username" value="admin" disabled />
            <Field label="Email" value="admin@sahucsc.in" type="email" /><Field label="Mobile" value="+91 98765 43210" />
          </div>
          <div style={{marginTop:14}}><Field label="Address" value="Bhubaneswar, Odisha" /></div>
          <SaveBtn />
        </Card>
      </>
    ),
    Security: (
      <>
        <Card title="Change Password">
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:12}}>
            <Field label="Current Password" type="password" />
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Field label="New Password" type="password" /><Field label="Confirm" type="password" /></div>
          </div>
          <SaveBtn label="Update Password" />
        </Card>
        <Card title="Active Sessions">
          {[{d:"Chrome on Windows",ip:"192.168.1.1",t:"Current session",c:true},{d:"Firefox on Android",ip:"103.12.45.67",t:"2 hours ago",c:false}].map(s=>(
            <div key={s.d} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #f3f4f6"}}>
              <div><p style={{margin:0,fontSize:14,fontWeight:500,color:"#111"}}>{s.d}</p><p style={{margin:"2px 0 0",fontSize:12,color:"#9ca3af"}}>{s.ip} · {s.t}</p></div>
              {s.c?<span style={{fontSize:12,color:"#16a34a",fontWeight:600}}>● Current</span>:<button style={{fontSize:12,color:"#ef4444",border:"none",background:"none",cursor:"pointer"}}>Revoke</button>}
            </div>
          ))}
        </Card>
      </>
    ),
    Preferences: (
      <Card title="Preferences">
        {[{label:"Theme",opts:["Light","Dark"]},{label:"Language",opts:["English","हिंदी","ଓଡ଼ିଆ"]},{label:"Dashboard",opts:["Default","Compact"]}].map((p,i,a)=>(
          <div key={p.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderBottom:i<a.length-1?"1px solid #f3f4f6":"none"}}>
            <p style={{margin:0,fontSize:14,color:"#111"}}>{p.label}</p>
            <select style={{padding:"7px 10px",borderRadius:7,border:"1px solid #e5e7eb",fontSize:13}}>{p.opts.map(o=><option key={o}>{o}</option>)}</select>
          </div>
        ))}
        <SaveBtn label="Save Preferences" />
      </Card>
    ),
    Business: (
      <Card title="Business Information">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Field label="Name" value="SAHU CSC" /><Field label="Website" value="sahucsc.in" />
          <Field label="Mobile" value="+91 98765 43210" /><Field label="Email" value="info@sahucsc.in" type="email" />
        </div>
        <div style={{marginTop:14}}><Field label="Address" value="Bhubaneswar, Odisha" /></div>
        <SaveBtn label="Save Business Info" />
      </Card>
    ),
    System: (
      <>
        <Card title="Registration Control">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div><p style={{margin:0,fontSize:14,fontWeight:500,color:"#111"}}>{reg?"Open":"Closed"}</p><p style={{margin:"2px 0 0",fontSize:12,color:"#9ca3af"}}>{reg?"New users can register.":"Registration is closed."}</p></div>
            <Toggle on={reg} set={()=>setReg(!reg)} />
          </div>
        </Card>
        <Card title="Backup">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingBottom:bk?14:0,borderBottom:bk?"1px solid #f3f4f6":"none"}}>
            <div><p style={{margin:0,fontSize:14,fontWeight:500,color:"#111"}}>Auto Backup</p><p style={{margin:"2px 0 0",fontSize:12,color:"#9ca3af"}}>Schedule regular backups</p></div>
            <Toggle on={bk} set={()=>setBk(!bk)} />
          </div>
          {bk&&<div style={{marginTop:14}}><Field label="Frequency (days)" value="7" type="number" /></div>}
        </Card>
      </>
    ),
  };

  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"0 28px",height:52,display:"flex",alignItems:"center"}}>
        <span style={{fontWeight:700,fontSize:15,color:"#0b2c60"}}>SAHU <span style={{color:"#f97316"}}>CSC</span></span>
        <span style={{color:"#d1d5db",margin:"0 10px"}}>·</span>
        <span style={{fontSize:13,color:"#6b7280"}}>Settings</span>
      </div>
      <div style={{maxWidth:900,margin:"0 auto",padding:"28px 24px",display:"flex",gap:24}}>
        <nav style={{width:160,flexShrink:0,display:"flex",flexDirection:"column" as const,gap:2}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 12px",borderRadius:8,border:"none",textAlign:"left" as const,fontSize:13,fontWeight:tab===t?600:400,background:tab===t?"#eff6ff":"transparent",color:tab===t?"#0b2c60":"#374151",cursor:"pointer"}}>{t}</button>
          ))}
        </nav>
        <main style={{flex:1,minWidth:0}}>
          <h1 style={{margin:"0 0 20px",fontSize:18,fontWeight:700,color:"#111"}}>{tab}</h1>
          {content[tab]}
        </main>
      </div>
    </div>
  );
}
