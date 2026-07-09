
export function V5() {
  return (
    <div className="min-h-screen bg-[#f0f2f8] font-sans">
      {/* Full-width Command Banner */}
      <div style={{ background: "linear-gradient(135deg, #0b2c60 0%, #0d3270 40%, #0a2555 100%)" }} className="relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-64 h-full opacity-10" style={{ background: "radial-gradient(ellipse at right, #f97316, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #f97316, transparent)" }} />

        <div className="max-w-6xl mx-auto px-8 py-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-white/15 border-2 border-white/30 flex items-center justify-center text-white text-3xl font-bold backdrop-blur">A</div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#f97316] rounded-full flex items-center justify-center text-white text-xs shadow-lg border-2 border-[#0b2c60]">✎</button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">Sahu Admin</h1>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ background: "rgba(249,115,22,0.25)", color: "#fdba74", border: "1px solid rgba(249,115,22,0.3)" }}>Administrator</span>
              </div>
              <p className="text-white/50 text-sm mt-0.5">admin@sahucsc.in</p>
            </div>
            {/* KPI Strip */}
            <div className="flex items-center gap-6">
              {[["24","Active Sessions"],["₹1.2L","Balance"],["7 Days","Next Backup"]].map(([v,l])=>(
                <div key={l} className="text-center">
                  <p className="text-[#f97316] font-bold text-lg">{v}</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-wide">{l}</p>
                </div>
              ))}
            </div>
            <button className="ml-4 px-4 py-2 rounded-xl text-white/70 border border-white/15 hover:bg-white/10 text-sm transition-colors">🚪 Logout</button>
          </div>
        </div>
      </div>

      {/* Two-column content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex gap-8">
          {/* Left column */}
          <div className="flex-1 space-y-5">
            {/* Personal Info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0b2c60]/10 flex items-center justify-center">✏️</div>
                <h2 className="font-bold text-gray-900">Personal Info</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                {[["Full Name","Sahu Admin"],["Email","admin@sahucsc.in"],["Mobile","9876543210"],["Address","Odisha, India"]].map(([l,v])=>(
                  <div key={l}><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{l}</label><input defaultValue={v} className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#0b2c60]" /></div>
                ))}
                <div className="col-span-2"><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bio</label><textarea rows={2} className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50" /></div>
              </div>
              <div className="px-6 pb-5 flex justify-end"><button className="px-4 py-2 text-sm bg-[#0b2c60] text-white rounded-xl font-semibold">Save Changes</button></div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">🔒</div>
                <h2 className="font-bold text-gray-900">Security</h2>
              </div>
              <div className="p-6 grid grid-cols-3 gap-4">
                {["Current Password","New Password","Confirm Password"].map(l=>(
                  <div key={l}><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{l}</label><input type="password" placeholder="••••••••" className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50" /></div>
                ))}
              </div>
              <div className="px-6 pb-5 flex justify-end"><button className="px-4 py-2 text-sm bg-[#0b2c60] text-white rounded-xl font-semibold">Update Password</button></div>
            </div>

            {/* Sessions */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">📱</div>
                <h2 className="font-bold text-gray-900">Active Sessions</h2>
                <div className="ml-auto flex gap-2">
                  <button className="px-3 py-1 text-xs border border-gray-200 rounded-lg text-gray-600">Logout Others</button>
                  <button className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg">Logout All</button>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {[{d:"Chrome on Windows",ip:"192.168.1.1",c:true,t:"Now"},{d:"Safari on iPhone",ip:"192.168.1.5",c:false,t:"2h ago"},{d:"Firefox on Linux",ip:"192.168.1.8",c:false,t:"1d ago"}].map((s,i)=>(
                  <div key={i} className="px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0b2c60]/8 flex items-center justify-center text-lg">💻</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2"><p className="text-sm font-semibold">{s.d}</p>{s.c&&<span className="text-[8px] font-bold uppercase px-1.5 py-0.5 bg-green-100 text-green-700 rounded">Current</span>}</div>
                      <p className="text-xs text-gray-500">IP {s.ip} · {s.t}</p>
                    </div>
                    {!s.c&&<button className="text-xs text-red-500 border border-red-200 px-2 py-1 rounded-lg">Revoke</button>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="w-80 space-y-5">
            {/* Preferences */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">🎨</div>
                <h2 className="font-bold text-gray-900 text-sm">Preferences</h2>
              </div>
              <div className="p-5 space-y-4">
                {[{l:"Theme",o:["Light","Dark"]},{l:"Language",o:["English","Hindi","Odia"]},{l:"Layout",o:["Default","Compact"]}].map(p=>(
                  <div key={p.l}><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{p.l}</label>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">{p.o.map((o,i)=><button key={o} className={`px-3 py-1.5 text-xs rounded-lg border font-medium ${i===0?"bg-[#0b2c60] text-white border-[#0b2c60]":"border-gray-200 text-gray-600"}`}>{o}</button>)}</div></div>
                ))}
                <button className="w-full px-3 py-2 text-sm bg-[#0b2c60] text-white rounded-xl font-semibold">Save</button>
              </div>
            </div>

            {/* Business Info (Admin) */}
            <div className="bg-white rounded-2xl border-2 border-[#f97316]/25 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f97316]/15 flex items-center gap-3" style={{ background: "rgba(249,115,22,0.04)" }}>
                <div className="w-8 h-8 rounded-lg bg-[#f97316]/10 flex items-center justify-center">🏢</div>
                <h2 className="font-bold text-gray-900 text-sm">Business Info</h2>
                <span className="ml-auto text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#f97316]/10 text-[#f97316]">Admin</span>
              </div>
              <div className="p-5 space-y-3">
                {[["Business Name","SAHU CSC"],["Mobile","9876543210"],["Email",""],["Address",""]].map(([l,v])=>(
                  <div key={l}><label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{l}</label><input defaultValue={v} placeholder={l} className="mt-1 w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50" /></div>
                ))}
                <button className="w-full px-3 py-2 text-sm bg-[#f97316] text-white rounded-xl font-semibold">Save</button>
              </div>
            </div>

            {/* System (Admin) */}
            <div className="bg-white rounded-2xl border-2 border-[#f97316]/25 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f97316]/15 flex items-center gap-3" style={{ background: "rgba(249,115,22,0.04)" }}>
                <div className="w-8 h-8 rounded-lg bg-[#f97316]/10 flex items-center justify-center">⚙️</div>
                <h2 className="font-bold text-gray-900 text-sm">System</h2>
                <span className="ml-auto text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#f97316]/10 text-[#f97316]">Admin</span>
              </div>
              <div className="p-5 space-y-3">
                {[{l:"Auto Backup",on:true},{l:"Registration Open",on:true}].map(s=>(
                  <div key={s.l} className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">{s.l}</p>
                    <div className={`w-9 h-5 rounded-full relative cursor-pointer ${s.on?"bg-[#0b2c60]":"bg-gray-300"}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow ${s.on?"right-0.5":"left-0.5"}`}/></div>
                  </div>
                ))}
                <div><label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Backup Freq (days)</label><input type="number" defaultValue={7} className="mt-1 w-20 block px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
