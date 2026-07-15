import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldCheck, Trash2, Loader2, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, deviceIcon, timeAgo } from "@/components/profile/utils";

interface DeviceEntry {
  id: number;
  deviceName: string;
  ipAddress: string | null;
  isTrusted: boolean;
  trustedUntil: string | null;
  lastActive: string;
  createdAt: string;
}

// ── Trusted device list — mirrors the fingerprint-based device_sessions
// table (distinct from the plain user_sessions "Sessions" list above). ──
export function DevicesSection() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [forgetId, setForgetId] = useState<number | null>(null);
  const [forgetAllOpen, setForgetAllOpen] = useState(false);

  const { data: devices = [], isLoading } = useQuery<DeviceEntry[]>({
    queryKey: ["auth-devices"],
    queryFn: () => apiFetch("/auth/devices"),
  });

  const forgetMut = useMutation({
    mutationFn: (id: number) => apiFetch(`/auth/devices/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["auth-devices"] }); toast.success("Device forgotten"); },
    onError: (e: any) => toast({ variant: "destructive", title: e.message }),
  });

  const forgetAllMut = useMutation({
    mutationFn: () => apiFetch("/auth/devices/all", { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["auth-devices"] }); toast.success("All devices forgotten", "Every device will require verification on next login."); },
    onError: (e: any) => toast({ variant: "destructive", title: e.message }),
  });

  if (isLoading) return <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>;

  if (devices.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4 text-center">
        <p className="text-xs text-muted-foreground">No recognised devices yet. Devices are remembered after your first 2FA/device verification.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {devices.map((d) => {
        const DevIcon = deviceIcon(d.deviceName);
        const trustActive = d.isTrusted && d.trustedUntil && new Date(d.trustedUntil).getTime() > Date.now();
        return (
          <div key={d.id} className="flex items-start gap-3 p-3 rounded-lg border bg-background">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <DevIcon size={15} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-sm">{d.deviceName}</span>
                {trustActive && (
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 gap-1 border-green-300 text-green-700">
                    <ShieldCheck size={9} />Trusted until {new Date(d.trustedUntil!).toLocaleDateString()}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {d.ipAddress && <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={10} />{d.ipAddress}</span>}
                <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock size={10} />Last active {timeAgo(d.lastActive)}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setForgetId(d.id)} disabled={forgetMut.isPending} className="text-destructive hover:bg-destructive/10 h-7 text-xs gap-1 shrink-0">
              <Trash2 size={12} />Forget
            </Button>
          </div>
        );
      })}

      <Button variant="outline" size="sm" className="w-full text-xs border-orange-300 text-orange-700 mt-1" onClick={() => setForgetAllOpen(true)}>
        Forget All Devices
      </Button>

      <AlertDialog open={forgetId !== null} onOpenChange={() => setForgetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Forget Device</AlertDialogTitle>
            <AlertDialogDescription>
              This device will require 2FA/device verification again on its next login, and its active session (if any) will be signed out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => { if (forgetId !== null) forgetMut.mutate(forgetId); setForgetId(null); }}>
              Forget Device
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={forgetAllOpen} onOpenChange={setForgetAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Forget All Devices</AlertDialogTitle>
            <AlertDialogDescription>
              Every device — including this one — will require 2FA/device verification on its next login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => { forgetAllMut.mutate(); setForgetAllOpen(false); }}>
              Forget All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
