import { useState } from "react";
import { Lock, UserPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useRegistrationStatus } from "@/hooks/use-registration-status";
import { ProfileToggleSkeleton } from "@/components/skeletons";

export function RegistrationControlSection() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: regStatus, isLoading: regLoading } = useRegistrationStatus();
  const [toggling, setToggling] = useState(false);
  const isOpen = regStatus?.open ?? false;

  const toggle = async (open: boolean) => {
    setToggling(true);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/settings/registration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ open }),
      });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["registration-status"] });
      toast({ title: open ? "Registration Opened" : "Registration Closed" });
    } catch {
      toast({ title: "Failed to update registration", variant: "destructive" });
    } finally {
      setToggling(false);
    }
  };

  if (regLoading) return <ProfileToggleSkeleton />;
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${isOpen ? "border-green-200 bg-green-50/50 dark:border-green-900/40 dark:bg-green-950/20" : "border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20"}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isOpen ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
          {isOpen
            ? <UserPlus size={16} className="text-green-600 dark:text-green-400" />
            : <Lock size={16} className="text-red-500 dark:text-red-400" />
          }
        </div>
        <div>
          <p className="text-sm font-semibold">{isOpen ? "Registrations Open" : "Registrations Closed"}</p>
          <p className="text-xs text-muted-foreground">
            {isOpen ? "New users can submit registration requests." : "Registration page shows a closed message."}
          </p>
        </div>
      </div>
      <Switch checked={isOpen} onCheckedChange={toggle} disabled={toggling} className="shrink-0 ml-4" />
    </div>
  );
}
