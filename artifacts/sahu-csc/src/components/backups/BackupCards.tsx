// Shared presentational primitives for the Backups page

export function NavyCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-sm overflow-hidden [border-top:3px_solid_var(--brand-navy-800)] ${className}`}>
      {children}
    </div>
  );
}

export function CardHead({ icon, title, description, right }: {
  icon: React.ReactNode; title: string; description?: string; right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-100 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-800/60">
      <div className="flex items-center gap-2.5">
        <span className="text-[var(--brand-navy-800)]">{icon}</span>
        <div>
          <p className="font-semibold text-[var(--brand-navy-800)] text-sm leading-tight">{title}</p>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
