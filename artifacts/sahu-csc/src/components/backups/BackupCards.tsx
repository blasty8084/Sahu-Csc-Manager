// Shared presentational primitives for the Backups page

export function NavyCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden [border-top:3px_solid_#0b2c60] ${className}`}>
      {children}
    </div>
  );
}

export function CardHead({ icon, title, description, right }: {
  icon: React.ReactNode; title: string; description?: string; right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
      <div className="flex items-center gap-2.5">
        <span className="text-[#0b2c60]">{icon}</span>
        <div>
          <p className="font-semibold text-[#0b2c60] text-sm leading-tight">{title}</p>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
