/**
 * ProfileDesktopBanner — full-width navy gradient command header (desktop only).
 * Renders: avatar + identity on the left, KPI strip on the right.
 */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Trash2, Wifi, User, Clock } from "lucide-react";
import type { SessionEntry } from "./types";

interface Props {
  profile: any;
  displayPicture: string | null | undefined;
  initials: string;
  sessions: SessionEntry[];
  currentSession: SessionEntry | undefined;
  user: any;
  onShowPicker: () => void;
  onDeleteAvatar: () => void;
  uploadPending: boolean;
  deletePending: boolean;
}

export function ProfileDesktopBanner({
  profile, displayPicture, initials,
  sessions, currentSession, user,
  onShowPicker, onDeleteAvatar, uploadPending, deletePending,
}: Props) {
  return (
    <div
      className="-mx-8 -mt-8 mb-6 px-8 py-6"
      style={{ background: "linear-gradient(135deg, #0b2c60 0%, #0d3270 55%, #0f3872 100%)" }}
    >
      <div className="flex items-center justify-between gap-6">
        {/* Left: avatar + identity */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <Avatar className="h-20 w-20 border-2 border-white/20">
              {displayPicture ? <AvatarImage src={displayPicture} alt="Profile" className="object-cover" /> : null}
              <AvatarFallback className="text-3xl font-bold bg-[#f97316] text-white">{initials}</AvatarFallback>
            </Avatar>
            <button type="button" onClick={onShowPicker}
              className="absolute -bottom-1 -right-1 rounded-full bg-[#f97316] text-white p-1.5 shadow-md hover:bg-orange-600 transition-colors">
              <Camera size={12} />
            </button>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{profile?.fullName || profile?.username}</h1>
            <p className="text-sm text-white/55 mt-0.5">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize"
                style={{ background: "rgba(249,115,22,0.18)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.30)" }}>
                {profile?.role}
              </span>
              {profile?.mobile && <span className="text-xs text-white/40">{profile.mobile}</span>}
              <div className="flex gap-2 ml-1">
                <Button size="sm" onClick={onShowPicker} disabled={uploadPending}
                  className="h-7 text-xs gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  <Camera size={11} />{uploadPending ? "Uploading…" : "Change Photo"}
                </Button>
                {displayPicture && (
                  <Button size="sm" onClick={onDeleteAvatar} disabled={deletePending}
                    className="h-7 text-xs gap-1 bg-white/10 hover:bg-white/20 text-white/70 border border-white/20">
                    <Trash2 size={11} />Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: KPI strip */}
        <div className="flex items-center gap-3 shrink-0">
          {[
            { val: String(sessions.length), label: "Active Sessions", icon: <Wifi size={15} /> },
            { val: user?.role ?? "—",        label: "Account Role",    icon: <User size={15} />, capitalize: true },
            { val: currentSession?.rememberMe ? "30 days" : "8 hours", label: "Session Length", icon: <Clock size={15} /> },
          ].map(k => (
            <div key={k.label} className="text-center px-5 py-3 rounded-xl border border-white/12"
              style={{ background: "rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-center gap-1 mb-1" style={{ color: "#fb923c" }}>{k.icon}</div>
              <p className={`text-lg font-bold text-white ${k.capitalize ? "capitalize" : ""}`}>{k.val}</p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{k.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
