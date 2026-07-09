
import { useState } from "react";

const SECTIONS = [
  { id: "photo", label: "Photo", icon: "👤" },
  { id: "info", label: "Personal Info", icon: "✏️" },
  { id: "security", label: "Security", icon: "🔒" },
  { id: "sessions", label: "Sessions", icon: "📱" },
  { id: "prefs", label: "Preferences", icon: "🎨" },
  { id: "business", label: "Business Info", icon: "🏢", admin: true },
  { id: "system", label: "System", icon: "⚙️", admin: true },
];

export function V3() {
  const [active, setActive] = useState("info");
  const cur = SECTIONS.find(s => s.id === active)!;

  return (
    <div className="min-h-screen bg-[#f0f2f8] flex font-sans">
      {/* Left Panel */}
      <div className="w-72 shrink-0 flex flex-col">
        {/* User Hero */}
        <div style={{ background: "linear-gradient(160deg, #0b2c60 0%, #1e4fa0 60%, #f97316 150%)" }} className="px-6 pt-8 pb-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center text-white text-3xl font-bold backdrop-blur">A</div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#f97316] rounded-full flex items-center justify-center text-white text-xs shadow-lg">✎</button>
            </div>
            <h2 className="text-white font-bold text-lg">Sahu Admin</h2>
            <p className="text-white/60 text-xs mt-0.5">admin@sahucsc.in</p>
            <div className="mt-2 px-3 py-1 rounded-full bg-white/15 text-white text-[10px] font-bold uppercase tracking-wide">Admin</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white/80 backdrop-blur border-b border-gray-200 px-6 py-3 grid grid-cols-3 gap-2 text-center">
          {[["24","Sessions"],["₹1.2L","Balance"],["142","Txns"]].map(([v,l])=>(
            <div key={l}>
              <p className="text-sm font-bold text-[#0b2c60]">{v}</p>
              <p className="text-[9px] text-gray-500">{l}</p>
            </div>
          ))}
        </div>

        {/* Section Nav */}
        <nav className="flex-1 bg-white border-r border-gray-200 py-2 overflow-y-auto">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 px-5 py-2">Account</p>
          {SECTIONS.filter(s=>!s.admin).map(s=>(
            <button key={s.id} onClick={()=>setActive(s.id)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-all text-left ${active===s.id?"bg-[#0b2c60]/8 text-[#0b2c60] font-semibold border-r-2 border-[#0b2c60]":"text-gray-600 hover:bg-gray-50"}`}>
              <span className="text-base">{s.icon}</span> {s.label}
            </button>
          ))}
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 px-5 py-2 mt-2">Admin</p>
          {SECTIONS.filter(s=>s.admin).map(s=>(
            <button key={s.id} onClick={()=>setActive(s.id)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-all text-left ${active===s.id?"bg-[#f97316]/8 text-[#f97316] font-semibold border-r-2 border-[#f97316]":"text-gray-600 hover:bg-gray-50"}`}>
              <span className="text-base">{s.icon}</span> {s.label}
              <span className="ml-auto text-[8px] font-bold uppercase px-1 py-px rounded bg-[#f97316]/10 text-[#f97316]">Admin</span>
            </button>
          ))}
        </nav>

        <div className="bg-white border-r border-t border-gray-200 p-4">
          <button className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="flex-1 overflow-y-auto">
        {/* Section Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-10 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${cur.admin?"bg-[#f97316]/10":"bg-[#0b2c60]/10"}`}>{cur.icon}</div>
          <div>
            <h1 className="font-bold text-gray-900 text-base">{cur.label}</h1>
            {cur.admin && <p className="text-[10px] text-[#f97316] font-semibold uppercase tracking-wide">Admin only</p>}
          </div>
        </div>

        <div className="p-8 max-w-2xl">
          {active === "photo" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#0b2c60] to-[#1e4fa0] flex items-center justify-center text-white text-4xl font-bold">A</div>
                <div>
                  <p className="font-bold text-gray-900">Profile Photo</p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP · max 5 MB</p>
                  <div className="flex gap-2 mt-3">
                    <button className="px-4 py-2 text-sm bg-[#0b2c60] text-white rounded-xl font-medium">Upload Photo</button>
                    <button className="px-4 py-2 text-sm border border-red-200 text-red-500 rounded-xl font-medium">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === "info" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm">
              <div className="grid grid-cols-2 gap-5 mb-5">
                {[["Full Name","Sahu Admin"],["Email","admin@sahucsc.in"],["Mobile","9876543210"],["Address","Odisha, India"]].map(([l,v])=>(
                  <div key={l}>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{l}</label>
                    <input defaultValue={v} className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50" />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bio</label>
                  <textarea className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50" rows={3} placeholder="About yourself…" />
                </div>
              </div>
              <button className="px-5 py-2.5 text-sm bg-[#0b2c60] text-white rounded-xl font-semibold">Save Changes</button>
            </div>
          )}

          {active === "security" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm">
              <div className="space-y-4 mb-5">
                {["Current Password","New Password","Confirm Password"].map(l=>(
                  <div key={l}>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{l}</label>
                    <input type="password" placeholder="••••••••" className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50" />
                  </div>
                ))}
              </div>
              <button className="px-5 py-2.5 text-sm bg-[#0b2c60] text-white rounded-xl font-semibold">Update Password</button>
            </div>
          )}

          {active === "sessions" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">3 active sessions</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl text-gray-600">Logout Others</button>
                  <button className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-xl">Logout All</button>
                </div>
              </div>
              {[{device:"Chrome on Windows",ip:"192.168.1.1",current:true,icon:"💻"},{device:"Safari on iPhone",ip:"192.168.1.5",current:false,icon:"📱"},{device:"Firefox on Linux",ip:"192.168.1.8",current:false,icon:"🖥"}].map((s,i)=>(
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#0b2c60]/8 flex items-center justify-center text-xl">{s.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{s.device}</p>
                      {s.current && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-green-100 text-green-700 rounded">Current</span>}
                    </div>
                    <p className="text-xs text-gray-500">IP {s.ip}</p>
                  </div>
                  {!s.current && <button className="text-xs text-red-500 border border-red-200 px-3 py-1 rounded-lg">Revoke</button>}
                </div>
              ))}
            </div>
          )}

          {active === "prefs" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm space-y-6">
              {[{label:"Theme",opts:["Light","Dark"]},{label:"Language",opts:["English","Hindi","Odia"]},{label:"Dashboard Layout",opts:["Default","Compact","Expanded"]}].map(p=>(
                <div key={p.label}>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{p.label}</label>
                  <div className="flex gap-2 mt-2">
                    {p.opts.map((o,i)=>(
                      <button key={o} className={`px-4 py-2 text-sm rounded-xl border font-medium ${i===0?"bg-[#0b2c60] text-white border-[#0b2c60]":"border-gray-200 text-gray-600"}`}>{o}</button>
                    ))}
                  </div>
                </div>
              ))}
              <button className="px-5 py-2.5 text-sm bg-[#0b2c60] text-white rounded-xl font-semibold">Save Preferences</button>
            </div>
          )}

          {active === "business" && (
            <div className="bg-white rounded-2xl border-2 border-[#f97316]/30 p-7 shadow-sm">
              <p className="text-xs text-gray-400 mb-5">Displayed on receipts and PDF exports</p>
              <div className="grid grid-cols-2 gap-5">
                {[["Business Name","SAHU CSC"],["Mobile","9876543210"],["Email",""],["Website",""]].map(([l,v])=>(
                  <div key={l}><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{l}</label><input defaultValue={v} placeholder={l} className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50" /></div>
                ))}
                <div className="col-span-2"><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Address</label><textarea rows={2} className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50" /></div>
              </div>
              <button className="mt-5 px-5 py-2.5 text-sm bg-[#f97316] text-white rounded-xl font-semibold">Save Business Info</button>
            </div>
          )}

          {active === "system" && (
            <div className="bg-white rounded-2xl border-2 border-[#f97316]/30 p-7 shadow-sm space-y-5">
              {[{label:"Auto Backup",desc:"Automatic nightly database backups",on:true},{label:"User Registration",desc:"Allow new user registrations",on:true}].map(s=>(
                <div key={s.label} className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div><p className="text-sm font-semibold">{s.label}</p><p className="text-xs text-gray-500">{s.desc}</p></div>
                  <div className={`w-11 h-6 rounded-full relative cursor-pointer ${s.on?"bg-[#0b2c60]":"bg-gray-300"}`}><div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow ${s.on?"right-0.5":"left-0.5"}`}/></div>
                </div>
              ))}
              <div><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Backup every (days)</label><input type="number" defaultValue={7} className="mt-1.5 w-24 block px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50" /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
