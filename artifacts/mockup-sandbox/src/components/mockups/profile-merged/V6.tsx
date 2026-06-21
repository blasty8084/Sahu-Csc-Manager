
import { useState } from "react";

const SECTIONS = [
  { id: "photo", label: "Photo", icon: "👤", badge: null },
  { id: "info", label: "Personal Info", icon: "✏️", badge: null },
  { id: "security", label: "Security", icon: "🔒", badge: null },
  { id: "sessions", label: "Active Sessions", icon: "📱", badge: "3" },
  { id: "prefs", label: "Preferences", icon: "🎨", badge: null },
  { id: "business", label: "Business Info", icon: "🏢", badge: "Admin", admin: true },
  { id: "system", label: "System Settings", icon: "⚙️", badge: "Admin", admin: true },
];

export function V6() {
  const [open, setOpen] = useState<Set<string>>(new Set(["info"]));
  const toggle = (id: string) => setOpen(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <div className="min-h-screen bg-[#f0f2f8] font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-8 py-5 flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0b2c60] to-[#1e4fa0] flex items-center justify-center text-white text-xl font-bold">A</div>
            <button className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#f97316] rounded-full flex items-center justify-center text-white text-[9px]">✎</button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-gray-900 text-lg">Sahu Admin</h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#f97316]/10 text-[#f97316] tracking-wide">Admin</span>
            </div>
            <p className="text-sm text-gray-500">admin@sahucsc.in · Profile & Settings</p>
          </div>
          <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-colors font-medium">🚪 Logout</button>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="max-w-3xl mx-auto px-8 py-8 space-y-3">
        {SECTIONS.map(section => (
          <div key={section.id}
            className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all ${
              section.admin
                ? open.has(section.id) ? "border-[#f97316]/40" : "border-[#f97316]/15"
                : open.has(section.id) ? "border-[#0b2c60]/30" : "border-gray-200"
            }`}
          >
            {/* Accordion Header */}
            <button
              onClick={() => toggle(section.id)}
              className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-gray-50/50 transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${section.admin ? "bg-[#f97316]/10" : "bg-[#0b2c60]/8"}`}>
                {section.icon}
              </div>
              <span className="font-semibold text-gray-900">{section.label}</span>
              {section.badge && (
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wide ${
                  section.admin ? "bg-[#f97316]/10 text-[#f97316]" : "bg-[#0b2c60]/10 text-[#0b2c60]"
                }`}>{section.badge}</span>
              )}
              <span className={`ml-auto text-gray-400 transition-transform duration-200 ${open.has(section.id) ? "rotate-180" : ""}`}>▾</span>
            </button>

            {/* Accordion Body */}
            {open.has(section.id) && (
              <div className="border-t border-gray-100 px-6 py-5">
                {section.id === "photo" && (
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0b2c60] to-[#1e4fa0] flex items-center justify-center text-white text-3xl font-bold shrink-0">A</div>
                    <div><p className="font-medium text-gray-900">Profile Photo</p><p className="text-xs text-gray-500 mt-0.5">JPG, PNG or WEBP · max 5 MB</p><div className="flex gap-2 mt-3"><button className="px-3 py-1.5 text-sm bg-[#0b2c60] text-white rounded-xl font-medium">Upload Photo</button><button className="px-3 py-1.5 text-sm border border-red-200 text-red-500 rounded-xl">Remove</button></div></div>
                  </div>
                )}
                {section.id === "info" && (
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {[["Full Name","Sahu Admin"],["Email","admin@sahucsc.in"],["Mobile","9876543210"],["Address","Odisha, India"]].map(([l,v])=>(
                        <div key={l}><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{l}</label><input defaultValue={v} className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#0b2c60]" /></div>
                      ))}
                      <div className="col-span-2"><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bio</label><textarea rows={2} className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50" /></div>
                    </div>
                    <div className="flex justify-end"><button className="px-4 py-2 text-sm bg-[#0b2c60] text-white rounded-xl font-semibold">Save Changes</button></div>
                  </div>
                )}
                {section.id === "security" && (
                  <div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {["Current Password","New Password","Confirm Password"].map(l=>(
                        <div key={l}><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{l}</label><input type="password" placeholder="••••••••" className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50" /></div>
                      ))}
                    </div>
                    <div className="flex justify-end"><button className="px-4 py-2 text-sm bg-[#0b2c60] text-white rounded-xl font-semibold">Update Password</button></div>
                  </div>
                )}
                {section.id === "sessions" && (
                  <div>
                    <div className="flex justify-end gap-2 mb-3">
                      <button className="px-3 py-1 text-xs border border-gray-200 rounded-xl text-gray-600">Logout Others</button>
                      <button className="px-3 py-1 text-xs bg-red-500 text-white rounded-xl">Logout All</button>
                    </div>
                    <div className="space-y-2">
                      {[{d:"Chrome on Windows",ip:"192.168.1.1",c:true},{d:"Safari on iPhone",ip:"192.168.1.5",c:false},{d:"Firefox on Linux",ip:"192.168.1.8",c:false}].map((s,i)=>(
                        <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                          <div className="w-8 h-8 rounded-lg bg-[#0b2c60]/8 flex items-center justify-center text-base">💻</div>
                          <div className="flex-1"><div className="flex items-center gap-2"><p className="text-sm font-semibold">{s.d}</p>{s.c&&<span className="text-[8px] font-bold uppercase px-1.5 py-0.5 bg-green-100 text-green-700 rounded">Current</span>}</div><p className="text-xs text-gray-400">IP {s.ip}</p></div>
                          {!s.c&&<button className="text-xs text-red-500 border border-red-200 px-2 py-1 rounded-lg">Revoke</button>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {section.id === "prefs" && (
                  <div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {[{l:"Theme",o:["Light","Dark"]},{l:"Language",o:["English","Hindi","Odia"]},{l:"Dashboard Layout",o:["Default","Compact","Expanded"]}].map(p=>(
                        <div key={p.l}><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{p.l}</label><div className="flex flex-col gap-1 mt-2">{p.o.map((o,i)=><button key={o} className={`px-3 py-1.5 text-xs rounded-lg border font-medium ${i===0?"bg-[#0b2c60] text-white border-[#0b2c60]":"border-gray-200 text-gray-600"}`}>{o}</button>)}</div></div>
                      ))}
                    </div>
                    <div className="flex justify-end"><button className="px-4 py-2 text-sm bg-[#0b2c60] text-white rounded-xl font-semibold">Save Preferences</button></div>
                  </div>
                )}
                {section.id === "business" && (
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {[["Business Name","SAHU CSC"],["Mobile","9876543210"],["Email",""],["Website",""]].map(([l,v])=>(
                        <div key={l}><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{l}</label><input defaultValue={v} placeholder={l} className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50" /></div>
                      ))}
                      <div className="col-span-2"><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Address</label><textarea rows={2} className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50" /></div>
                    </div>
                    <div className="flex justify-end"><button className="px-4 py-2 text-sm bg-[#f97316] text-white rounded-xl font-semibold">Save Business Info</button></div>
                  </div>
                )}
                {section.id === "system" && (
                  <div>
                    <div className="grid grid-cols-2 gap-5 mb-4">
                      {[{l:"Auto Backup",d:"Nightly DB backups",on:true},{l:"User Registration",d:"New users can register",on:true}].map(s=>(
                        <div key={s.l} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                          <div><p className="text-sm font-semibold">{s.l}</p><p className="text-xs text-gray-500">{s.d}</p></div>
                          <div className={`w-10 h-5 rounded-full relative cursor-pointer ${s.on?"bg-[#0b2c60]":"bg-gray-300"}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow ${s.on?"right-0.5":"left-0.5"}`}/></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-end gap-4">
                      <div><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Backup every (days)</label><input type="number" defaultValue={7} className="mt-1.5 w-24 block px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50" /></div>
                      <div><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Currency</label><select className="mt-1.5 block px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50"><option>INR</option></select></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
