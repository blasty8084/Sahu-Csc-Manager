
import { useState } from "react";

const TABS = [
  { id: "info", label: "Personal Info", emoji: "✏️" },
  { id: "security", label: "Security", emoji: "🔒" },
  { id: "sessions", label: "Sessions", emoji: "📱" },
  { id: "prefs", label: "Preferences", emoji: "🎨" },
  { id: "business", label: "Business", emoji: "🏢", admin: true },
  { id: "system", label: "System", emoji: "⚙️", admin: true },
];

export function V2() {
  const [active, setActive] = useState("info");

  return (
    <div className="min-h-screen bg-[#f4f6fb] font-sans">
      {/* Top Header */}
      <div style={{ background: "linear-gradient(135deg, #0b2c60, #0f3872)" }} className="px-8 pt-8 pb-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30">A</div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#f97316] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow">✎</button>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Sahu Admin</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-white/60">admin@sahucsc.in</span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#f97316]/80 text-white tracking-wide">Admin</span>
              </div>
            </div>
            <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors">
              🚪 Logout
            </button>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1 overflow-x-auto pb-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-colors whitespace-nowrap ${
                  active === tab.id
                    ? "bg-[#f4f6fb] text-[#0b2c60]"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                {tab.admin && <span className="text-[9px] uppercase font-bold px-1 py-px rounded bg-[#f97316]/60 text-white">Admin</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {active === "info" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-5">Personal Information</h2>
            <div className="grid grid-cols-2 gap-5">
              {[["Full Name","Sahu Admin"],["Email","admin@sahucsc.in"],["Mobile","9876543210"],["Address","Odisha, India"]].map(([l,v])=>(
                <div key={l}>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{l}</label>
                  <input defaultValue={v} className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#0b2c60]" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bio</label>
                <textarea className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50" rows={3} placeholder="Tell us about yourself…" />
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button className="px-5 py-2 text-sm bg-[#0b2c60] text-white rounded-xl font-semibold hover:bg-[#0f3872]">Save Changes</button>
            </div>
          </div>
        )}

        {active === "security" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm max-w-lg">
            <h2 className="text-base font-bold text-gray-900 mb-5">Change Password</h2>
            <div className="space-y-4">
              {["Current Password","New Password","Confirm New Password"].map(l=>(
                <div key={l}>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{l}</label>
                  <input type="password" placeholder="••••••••" className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50" />
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
              Password must be 8+ characters with uppercase, lowercase, and a number.
            </div>
            <button className="mt-5 px-5 py-2 text-sm bg-[#0b2c60] text-white rounded-xl font-semibold w-full">Update Password</button>
          </div>
        )}

        {active === "sessions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Active Sessions</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">Logout Others</button>
                <button className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-xl font-medium">Logout All</button>
              </div>
            </div>
            {[{device:"Chrome on Windows",ip:"192.168.1.1",current:true,time:"Now"},{device:"Safari on iOS",ip:"192.168.1.5",current:false,time:"2h ago"},{device:"Firefox on Linux",ip:"192.168.1.8",current:false,time:"1d ago"}].map((s,i)=>(
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#0b2c60]/10 flex items-center justify-center text-lg">💻</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{s.device}</p>
                    {s.current && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-700">Current</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">IP {s.ip} · {s.time}</p>
                </div>
                {!s.current && <button className="text-xs text-red-500 border border-red-200 px-3 py-1 rounded-lg">Revoke</button>}
              </div>
            ))}
          </div>
        )}

        {active === "prefs" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm max-w-lg">
            <h2 className="text-base font-bold text-gray-900 mb-5">Preferences</h2>
            <div className="space-y-5">
              {[{label:"Theme",opts:["Light","Dark"]},{label:"Language",opts:["English","Hindi","Odia"]},{label:"Dashboard Layout",opts:["Default","Compact","Expanded"]}].map(p=>(
                <div key={p.label}>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{p.label}</label>
                  <div className="flex gap-2 mt-2">
                    {p.opts.map((o,i)=>(
                      <button key={o} className={`px-4 py-2 text-sm rounded-xl border font-medium transition-colors ${i===0?"bg-[#0b2c60] text-white border-[#0b2c60]":"border-gray-200 text-gray-600 hover:border-[#0b2c60]/40"}`}>{o}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 px-5 py-2 text-sm bg-[#0b2c60] text-white rounded-xl font-semibold w-full">Save Preferences</button>
          </div>
        )}

        {active === "business" && (
          <div className="bg-white rounded-2xl border-2 border-[#f97316]/30 p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-gray-900">Business Information</h2>
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#f97316]/10 text-[#f97316]">Admin Only</span>
            </div>
            <p className="text-xs text-gray-400 mb-5">Displayed on receipts, PDF exports, and reports</p>
            <div className="grid grid-cols-2 gap-5">
              {[["Business Name","SAHU CSC"],["Mobile","9876543210"],["Email",""],["Website",""]].map(([l,v])=>(
                <div key={l}>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{l}</label>
                  <input defaultValue={v} placeholder={l} className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Address</label>
                <textarea rows={2} placeholder="Business Address" className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50" />
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button className="px-5 py-2 text-sm bg-[#f97316] text-white rounded-xl font-semibold">Save Business Info</button>
            </div>
          </div>
        )}

        {active === "system" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">System Settings</h2>
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#f97316]/10 text-[#f97316]">Admin Only</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-5">
              {[{label:"Auto Backup",desc:"Automatic database backups",on:true},{label:"User Registration",desc:"New users can register",on:true}].map(s=>(
                <div key={s.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${s.on?"bg-[#0b2c60]":"bg-gray-300"}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${s.on?"right-0.5":"left-0.5"}`} />
                  </div>
                </div>
              ))}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Currency</label>
                <select className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50"><option>INR</option></select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Backup Frequency (days)</label>
                <input type="number" defaultValue={7} className="mt-1.5 w-32 px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 block" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
