import { Label } from "@/components/ui/label";

// ─── CmdCard ─────────────────────────────────────────────────────────────────
interface CmdCardProps {
  title: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function CmdCard({ title, icon, adminOnly, action, children }: CmdCardProps) {
  return (
    <div className={`rounded-xl border bg-card shadow-sm overflow-hidden ${adminOnly ? "border-orange-200 dark:border-orange-900/40" : ""}`}>
      <div className={`flex items-center justify-between px-5 py-3.5 border-b ${adminOnly ? "bg-orange-50/60 dark:bg-orange-950/20" : "bg-muted/30"}`}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${adminOnly ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400" : "bg-primary/10 text-primary"}`}>
            {icon}
          </div>
          <h2 className="text-sm font-bold">{title}</h2>
          {adminOnly && (
            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
              Admin
            </span>
          )}
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ─── FormField ────────────────────────────────────────────────────────────────
interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

export function FormField({ label, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
