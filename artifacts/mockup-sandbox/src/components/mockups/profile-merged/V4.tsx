
import { useState } from "react";

const CARDS = [
  { id: "photo", label: "Photo", icon: "👤", desc: "Update your profile picture", color: "#0b2c60" },
  { id: "info", label: "Personal Info", icon: "✏️", desc: "Name, email, mobile, bio", color: "#0b2c60" },
  { id: "security", label: "Security", icon: "🔒", desc: "Password & account protection", color: "#6366f1" },
  { id: "sessions", label: "Sessions", icon: "📱", desc: "3 active devices", color: "#059669" },
  { id: "prefs", label: "Preferences", icon: "🎨", desc: "Theme, language, layout", color: "#7c3aed" },
  { id: "business", label: "Business Info", icon: "🏢", desc: "SAHU CSC · Odisha", color: "#f97316", admin: true },
  { id: "system", label: "System", icon: "⚙️", desc: "Backup, registration control", color: "#f97316", admin: true },
];

export function V4() {
  const [open, setOpen] = useState<string | null>(null);
  const cur = CARDS.find(c => c.id === open);

  return (
    <div className="min-h-screen bg-[#f0f2f8] font-sans">
      {/* Hero Banner */}
      <div style={{ background: "linear-gradient(135deg, #0b2c60 0%, #0f3872 100%)" }} className="px-8 py-7 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #f97316 0%, transparent 60%)" }} />
        <div className="max-w-5xl mx-auto flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/15 border-2 border-white/30 flex items-center justify-center text-white text-2xl font-bold backdrop-blur shrink-0">A</div>
          <div>
            <h1 className="text-xl font-bold text-white">Sahu Admin</h1>
            <p className="text-white/60 text-sm mt-0.5">admin@sahucsc.in · <span className="text-[#f97316] font-semibold">Administrator</span></p>
          </div>
          <button className="ml-auto px-3 py-1.5 text-xs text-white/70 border border-white/20 rounded-xl hover:bg-white/10">🚪 Logout</button>
        </div>
      </div>

      {/* Card Grid */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Profile & Settings</h2>
          <p className="text-sm text-gray-500">Click a card to manage that section</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {CARDS.map(card => (
            <button key={card.id} onClick={() => setOpen(card.id)}
              className={`relative text-left bg-white rounded-2xl border-2 p-5 shadow-sm hover:shadow-md transition-all group ${
                card.admin ? "border-[#f97316]/20 hover:border-[#f97316]/50" : "border-gray-200 hover:border-[#0b2c60]/30"
              }`}
            >
              {card.admin && (
                <span className="absolute top-3 right-3 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#f97316]/10 text-[#f97316] tracking-wide">Admin</span>
              )}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ background: `${card.color}18` }}>
                {card.icon}
              </div>
              <p className="font-bold text-gray-900 text-sm">{card.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold" style={{ color: card.color }}>
                <span>Manage</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Inline Drawer Panel */}
        {open && cur && (
          <div className="mt-6 bg-white rounded-2xl border-2 border-[#0b2c60]/20 shadow-lg overflow-hidden">
            <div className={`px-6 py-4 flex items-center gap-3 border-b ${cur.admin ? "border-[#f97316]/20 bg-[#f97316]/5" : "border-gray-100 bg-gray-50"}`}>
              <span className="text-2xl">{cur.icon}</span>
              <div>
                <h3 className="font-bold text-gray-900">{cur.label}</h3>
                {cur.admin && <p className="text-[10px] text-[#f97316] font-semibold uppercase tracking-wide">Admin Only</p>}
              </div>
              <button onClick={() => setOpen(null)} className="ml-auto w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm">✕</button>
            </div>
            <div className="p-6">
              {open === "info" && (
                <div className="grid grid-cols-2 gap-4">
                  {[["Full Name","Sahu Admin"],["Email","admin@sahucsc.in"],["Mobile","9876543210"],["Address","Odisha, India"]].map(([l,v])=>(
                    <div key={l}><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{l}</label><input defaultValue={v} className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50" /></div>
                  ))}
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bio</label>
                    <textarea rows={2} className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50" />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button className="px-4 py-2 text-sm bg-[#0b2c60] text-white rounded-xl font-semibold">Save Changes</button>
                  </div>
                </div>
              )}
              {open === "security" && (
                <div className="max-w-sm space-y-3">
                  {["Current Password","New Password","Confirm Password"].map(l=>(
                    <div key={l}><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{l}</label><input type="password" placeholder="••••••••" className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50" /></div>
                  ))}
                  <button className="w-full px-4 py-2 text-sm bg-[#0b2c60] text-white rounded-xl font-semibold mt-2">Update Password</button>
                </div>
              )}
              {open === "sessions" && (
                <div className="space-y-3">
                  <div className="flex justify-end gap-2 mb-2">
                    <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl text-gray-600">Logout Others</button>
                    <button className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-xl">Logout All</button>
                  </div>
                  {[{d:"Chrome on Windows",ip:"192.168.1.1",c:true},{d:"Safari on iPhone",ip:"192.168.1.5",c:false},{d:"Firefox on Linux",ip:"192.168.1.8",c:false}].map((s,i)=>(
                    <div key={i} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl">
                      <div className="w-9 h-9 rounded-xl bg-[#0b2c60]/8 flex items-center justify-center text-lg">💻</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2"><p className="text-sm font-semibold">{s.d}</p>{s.c&&<span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase">Current</span>}</div>
                        <p className="text-xs text-gray-500">IP {s.ip}</p>
                      </div>
                      {!s.c&&<button className="text-xs text-red-500 border border-red-200 px-2 py-1 rounded-lg">Revoke</button>}
                    </div>
                  ))}
                </div>
              )}
              {open === "prefs" && (
                <div className="space-y-5 max-w-md">
                  {[{label:"Theme",opts:["Light","Dark"]},{label:"Language",opts:["English","Hindi","Odia"]},{label:"Layout",opts:["Default","Compact","Expanded"]}].map(p=>(
                    <div key={p.label}><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{p.label}</label>
                    <div className="flex gap-2 mt-2">{p.opts.map((o,i)=><button key={o} className={`px-4 py-2 text-sm rounded-xl border font-medium ${i===0?"bg-[#0b2c60] text-white border-[#0b2c60]":"border-gray-200 text-gray-600"}`}>{o}</button>)}</div></div>
                  ))}
                  <button className="px-4 py-2 text-sm bg-[#0b2c60] text-white rounded-xl font-semibold">Save</button>
                </div>
              )}
              {open === "business" && (
                <div className="grid grid-cols-2 gap-4">
                  {[["Business Name","SAHU CSC"],["Mobile","9876543210"],["Email",""],["Website",""]].map(([l,v])=>(
                    <div key={l}><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{l}</label><input defaultValue={v} placeholder={l} className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50" /></div>
                  ))}
                  <div className="col-span-2"><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Address</label><textarea rows={2} className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50" /></div>
                  <div className="col-span-2 flex justify-end"><button className="px-4 py-2 text-sm bg-[#f97316] text-white rounded-xl font-semibold">Save</button></div>
                </div>
              )}
              {open === "system" && (
                <div className="space-y-5 max-w-lg">
                  {[{label:"Auto Backup",on:true},{label:"User Registration",on:true}].map(s=>(
                    <div key={s.label} className="flex items-center justify-between py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold">{s.label}</p>
                      <div className={`w-11 h-6 rounded-full relative cursor-pointer ${s.on?"bg-[#0b2c60]":"bg-gray-300"}`}><div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow ${s.on?"right-0.5":"left-0.5"}`}/></div>
                    </div>
                  ))}
                  <div><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Backup Frequency (days)</label><input type="number" defaultValue={7} className="mt-1.5 w-24 block px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50" /></div>
                </div>
              )}
              {open === "photo" && (
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#0b2c60] to-[#1e4fa0] flex items-center justify-center text-white text-4xl font-bold">A</div>
                  <div><p className="font-semibold text-gray-900">Update your photo</p><p className="text-xs text-gray-500 mt-1">JPG, PNG or WEBP · max 5 MB</p><div className="flex gap-2 mt-3"><button className="px-4 py-2 text-sm bg-[#0b2c60] text-white rounded-xl font-medium">Upload</button><button className="px-4 py-2 text-sm border border-red-200 text-red-500 rounded-xl">Remove</button></div></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
