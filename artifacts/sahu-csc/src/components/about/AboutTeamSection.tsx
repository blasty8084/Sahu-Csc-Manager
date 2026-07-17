declare const __APP_VERSION__: string;
const APP_VERSION = __APP_VERSION__;

export default function AboutTeamSection() {
  return (
    <div className="text-center py-3 space-y-1 border-t">
      <p className="text-xs text-muted-foreground font-medium">SAHU CSC Management Platform v{APP_VERSION}</p>
      <p className="text-[10px] text-muted-foreground/50">Built for Odisha Common Service Centers · © 2026 · Updated 15 July 2026</p>
    </div>
  );
}
