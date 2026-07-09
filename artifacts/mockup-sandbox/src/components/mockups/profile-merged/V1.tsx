
export function V1() {
  const nav = [
    { id: "photo", label: "Photo", icon: "👤" },
    { id: "info", label: "Personal Info", icon: "✏️" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "sessions", label: "Sessions", icon: "📱" },
    { id: "prefs", label: "Preferences", icon: "🎨" },
    { id: "business", label: "Business Info", icon: "🏢" },
    { id: "system", label: "System", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex font-sans">
      {/* Sticky Left Sidebar */}
      <aside className="w-60 shrink-0 sticky top-0 h-screen bg-white border-r border-gray-200 flex flex-col">
        {/* User Card */}
        <div className="px-5 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0b2c60] to-[#1e4fa0] flex items-center justify-center text-white font-bold text-lg shrink-0">A</div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">Admin User</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#0b2c60]/10 text-[#0b2c60] uppercase tracking-wide">Admin</span>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {nav.map((item, i) => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors text-left ${
                i === 0
                  ? "bg-[#0b2c60]/8 text-[#0b2c60] font-semibold border-r-2 border-[#0b2c60]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto py-8 px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account, security, and admin settings</p>
        </div>

        {/* Photo Section */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-[#0b2c60]/10 flex items-center justify-center text-sm">👤</div>
            <h2 className="font-bold text-gray-900">Photo</h2>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0b2c60] to-[#1e4fa0] flex items-center justify-center text-white text-3xl font-bold">A</div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#f97316] rounded-full flex items-center justify-center text-white text-xs shadow-md">✎</button>
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Profile Photo</p>
              <p className="text-xs text-gray-500 mt-0.5">JPG, PNG or WEBP · max 5 MB</p>
              <div className="flex gap-2 mt-2">
                <button className="px-3 py-1 text-xs bg-[#0b2c60] text-white rounded-lg font-medium">Change Photo</button>
                <button className="px-3 py-1 text-xs border border-red-200 text-red-500 rounded-lg font-medium">Remove</button>
              </div>
            </div>
          </div>
        </section>

        {/* Personal Info */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-[#0b2c60]/10 flex items-center justify-center text-sm">✏️</div>
            <h2 className="font-bold text-gray-900">Personal Info</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[["Full Name","Sahu Admin"],["Email","admin@sahucsc.in"],["Mobile","9876543210"],["Address","Odisha, India"]].map(([l,v])=>(
              <div key={l}>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{l}</label>
                <input defaultValue={v} className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0b2c60] bg-gray-50" />
              </div>
            ))}
          </div>
          <textarea className="mt-4 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50" rows={2} placeholder="Bio…" />
          <div className="flex justify-end mt-3">
            <button className="px-4 py-2 text-sm bg-[#0b2c60] text-white rounded-xl font-semibold hover:bg-[#0f3872] transition-colors">Save Changes</button>
          </div>
        </section>

        {/* Security */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-[#0b2c60]/10 flex items-center justify-center text-sm">🔒</div>
            <h2 className="font-bold text-gray-900">Security</h2>
          </div>
          <div className="space-y-3">
            {["Current Password","New Password","Confirm Password"].map(l=>(
              <div key={l}>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{l}</label>
                <input type="password" placeholder="••••••••" className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50" />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-3">
            <button className="px-4 py-2 text-sm bg-[#0b2c60] text-white rounded-xl font-semibold">Update Password</button>
          </div>
        </section>

        {/* Business Info (Admin) */}
        <section className="bg-white rounded-2xl border-2 border-[#f97316]/30 p-6 mb-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-[#f97316]/10 flex items-center justify-center text-sm">🏢</div>
            <h2 className="font-bold text-gray-900">Business Info</h2>
            <span className="ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#f97316]/10 text-[#f97316] tracking-wide">Admin</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">Displayed on receipts and reports</p>
          <div className="grid grid-cols-2 gap-4">
            {["Business Name","Address","Mobile","Email","Website"].map(l=>(
              <div key={l} className={l==="Address"||l==="Website" ? "col-span-2" : ""}>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{l}</label>
                <input placeholder={l} className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50" />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-3">
            <button className="px-4 py-2 text-sm bg-[#f97316] text-white rounded-xl font-semibold">Save Business Info</button>
          </div>
        </section>

        {/* System (Admin) */}
        <section className="bg-white rounded-2xl border-2 border-[#f97316]/30 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-[#f97316]/10 flex items-center justify-center text-sm">⚙️</div>
            <h2 className="font-bold text-gray-900">System Settings</h2>
            <span className="ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#f97316]/10 text-[#f97316] tracking-wide">Admin</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-800">Auto Backup</p>
                <p className="text-xs text-gray-500">Automatic database backups</p>
              </div>
              <div className="w-10 h-5 bg-[#0b2c60] rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-800">User Registration</p>
                <p className="text-xs text-green-600 font-medium">Currently Open</p>
              </div>
              <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Backup Frequency (days)</label>
              <input type="number" defaultValue={7} className="mt-1 w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
