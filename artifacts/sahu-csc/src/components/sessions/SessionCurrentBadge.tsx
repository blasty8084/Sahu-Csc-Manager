import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionCard } from "@/components/sessions/SessionCard";
import type { SessionEntry } from "@/components/sessions/SessionCard";

/** "Current Session" card — navy shield, "This Device" badge, and the session detail row. */
export function SessionCurrentBadge({ session }: { session: SessionEntry }) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm">Current Session</CardTitle>
          <Badge variant="default" className="text-[10px] px-1.5 py-0">This Device</Badge>
        </div>
        <CardDescription className="text-xs">You are currently using this session</CardDescription>
      </CardHeader>
      <CardContent>
        <SessionCard session={session} />
      </CardContent>
    </Card>
  );
}
