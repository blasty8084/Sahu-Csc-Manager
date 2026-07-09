import { useState } from "react";

// V3 Mobile: Full-page scroll with sticky section headers (iOS Settings style)

function Toggle({ on, set }:{ on:boolean; set:()=>void }) {
  return <div onClick={set} style={{width:44,height:24,borderRadius:12,background:on?"#34d399":"#d1d5db",cursor:"pointer",position:"relative",flexShrink:0}}><div style={{position:"absolute",top:2,left:on?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,0.15)",transition:"left 0.2s"}} /></div>;
}

function Row({ label, value, action, last=false }:{ label:string; value?:string; action?:React.ReactNode; last?:boolean }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",borderBottom:last?"none":"1px solid #f3f4f6",background:"#fff"}}>
      <span style={{fontSize:14,color:"#111"}}>{label}</span>
      {value&&<span style={{fontSize:14,color:"#9ca3af"}}>{value}</span>}
      {action}
    </div>
  );
}

function GroupHeader({ label }:{ label:string }) {
  return <p style={{margin:"20px 16px 6px",fontSize:11,fontWeight:700,color:"#6b7280",textTransform:"uppercase" as const,letterSpacing:"0.06em"}}>{label}</p>;
}

function GroupBox({ children }:{ children:React.ReactNode }) {
  return <div style={{background:"#fff",borderRadius:14,border:"1px solid #e5e7eb",overflow:"hidden",marginBottom:4}}>{children}</div>;
}

function InputRow({ label, value="", type="text", disabled=false, last=false }:{ label:string; value?:string; type?:string; disabled?:boolean; last?:boolean }) {
  return (
    <div style={{display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:last?"none":"1px solid #f3f4f6",background:"#fff",gap:12}}>
      <span style={{fontSize:14,color:"#111",width:100,flexShrink:0}}>{label}</span>
      <input type={type} defaultValue={value} disabled={disabled} style={{flex:1,border:"none",outline:"none",fontSize:14,color:disabled?"#9ca3af":"#111",background:"transparent",textAlign:"right" as const}} />
    </div>
  );
}

const TABS = [
  { id:"profile", label:"Profile" },
  { id:"security", label:"Security" },
  { id:"prefs", label:"Prefs" },
  { id:"business", label:"Business" },
  { id:"system", label:"System" },
];

export function V3Mobile() {
  const [tab, setTab] = useState("profile");
  const [reg, setReg] = useState(true);
  const [bk, setBk] = useState(true);

  return (
    <div style={{width:390,minHeight:"100vh",background:"#f2f2f7",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",margin:"0 auto",display:"flex",flexDirection:"column" as const}}>
      {/* Sticky header */}
      <div style={{background:"#f2f2f7",borderBottom:"1px solid #e5e7eb",padding:"48px 16px 0",position:"sticky" as const,top:0,zIndex:10}}>
        <h1 style={{margin:"0 0 16px",fontSize:22,fontWeight:700,color:"#111"}}>Settings</h1>
        <div style={{display:"flex",gap:0,overflowX:"auto" as const,scrollbarWidth:"none" as const}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"9px 16px",border:"none",background:"none",cursor:"pointer",whiteSpace:"nowrap" as const,fontSize:13,fontWeight:tab===t.id?600:400,color:tab===t.id?"#007aff":"#6b7280",borderBottom:tab===t.id?"2px solid #007aff":"2px solid transparent"}}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{flex:1,padding:"8px 0 24px"}}>
        {tab==="profile"&&(
          <>
            {/* Avatar */}
            <div style={{display:"flex",flexDirection:"column" as const,alignItems:"center",padding:"24px 16px 16px"}}>
              <div style={{width:72,height:72,borderRadius:"50%",background:"#0b2c60",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:700,color:"#fff",marginBottom:10}}>A</div>
              <p style={{margin:0,fontWeight:700,fontSize:17}}>Admin User</p>
              <p style={{margin:"3px 0 12px",fontSize:13,color:"#6b7280"}}>Administrator</p>
              <button style={{padding:"7px 20px",borderRadius:20,background:"#007aff",color:"#fff",border:"none",fontSize:13,fontWeight:600,cursor:"pointer"}}>Change Photo</button>
            </div>

            <GroupHeader label="Personal" />
            <GroupBox>
              <InputRow label="Full Name" value="Admin User" />
              <InputRow label="Username" value="admin" disabled />
              <InputRow label="Email" value="admin@sahucsc.in" type="email" />
              <InputRow label="Mobile" value="+91 98765 43210" />
              <InputRow label="Address" value="Bhubaneswar, Odisha" last />
            </GroupBox>
            <div style={{margin:"16px 16px 0"}}>
              <button style={{width:"100%",padding:"12px",borderRadius:10,background:"#0b2c60",color:"#fff",border:"none",fontSize:14,fontWeight:600,cursor:"pointer"}}>Save Changes</button>
            </div>
          </>
        )}

        {tab==="security"&&(
          <>
            <GroupHeader label="Password" />
            <GroupBox>
              <InputRow label="Current" value="" type="password" />
              <InputRow label="New" value="" type="password" />
              <InputRow label="Confirm" value="" type="password" last />
            </GroupBox>
            <div style={{margin:"12px 16px"}}>
              <button style={{width:"100%",padding:"12px",borderRadius:10,background:"#0b2c60",color:"#fff",border:"none",fontSize:14,fontWeight:600,cursor:"pointer"}}>Update Password</button>
            </div>
            <GroupHeader label="Sessions" />
            <GroupBox>
              <Row label="Chrome · Windows" value="Current" />
              <Row label="Firefox · Android" action={<button style={{fontSize:12,color:"#ef4444",border:"none",background:"none",cursor:"pointer",fontWeight:500}}>Revoke</button>} last />
            </GroupBox>
          </>
        )}

        {tab==="prefs"&&(
          <>
            <GroupHeader label="Appearance" />
            <GroupBox>
              <Row label="Theme" action={<select style={{border:"none",fontSize:13,color:"#9ca3af",background:"transparent"}}><option>Light</option><option>Dark</option></select>} />
              <Row label="Language" action={<select style={{border:"none",fontSize:13,color:"#9ca3af",background:"transparent"}}><option>English</option><option>हिंदी</option><option>ଓଡ଼ିଆ</option></select>} />
              <Row label="Dashboard" action={<select style={{border:"none",fontSize:13,color:"#9ca3af",background:"transparent"}}><option>Default</option><option>Compact</option></select>} last />
            </GroupBox>
            <div style={{margin:"12px 16px"}}>
              <button style={{width:"100%",padding:"12px",borderRadius:10,background:"#0b2c60",color:"#fff",border:"none",fontSize:14,fontWeight:600,cursor:"pointer"}}>Save Preferences</button>
            </div>
          </>
        )}

        {tab==="business"&&(
          <>
            <GroupHeader label="Business" />
            <GroupBox>
              <InputRow label="Name" value="SAHU CSC" />
              <InputRow label="Mobile" value="+91 98765 43210" />
              <InputRow label="Email" value="info@sahucsc.in" type="email" />
              <InputRow label="Website" value="sahucsc.in" />
              <InputRow label="Address" value="Bhubaneswar, Odisha" last />
            </GroupBox>
            <div style={{margin:"12px 16px"}}>
              <button style={{width:"100%",padding:"12px",borderRadius:10,background:"#0b2c60",color:"#fff",border:"none",fontSize:14,fontWeight:600,cursor:"pointer"}}>Save Business Info</button>
            </div>
          </>
        )}

        {tab==="system"&&(
          <>
            <GroupHeader label="Access" />
            <GroupBox>
              <Row label="User Registration" action={<Toggle on={reg} set={()=>setReg(!reg)} />} last />
            </GroupBox>
            <p style={{margin:"4px 16px 0",fontSize:12,color:"#9ca3af"}}>{reg?"New users can self-register. Approval required.":"Registration page is hidden."}</p>

            <GroupHeader label="Backup" />
            <GroupBox>
              <Row label="Auto Backup" action={<Toggle on={bk} set={()=>setBk(!bk)} />} last={!bk} />
              {bk&&<InputRow label="Frequency" value="7 days" last />}
            </GroupBox>
          </>
        )}
      </div>
    </div>
  );
}
