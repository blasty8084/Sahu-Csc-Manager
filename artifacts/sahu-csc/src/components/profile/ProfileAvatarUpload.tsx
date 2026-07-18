/**
 * ProfileAvatarUpload — avatar display + upload/remove controls.
 *
 * Exports two variants:
 *   ProfileAvatarCard    — full card used in the mobile "Profile" drill-in tab
 *   ProfileAvatarSummary — centred stack used on the mobile home screen
 */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Trash2 } from "lucide-react";

interface AvatarBase {
  displayPicture: string | null | undefined;
  initials: string;
  profile: any;
  onShowPicker: () => void;
  onDeleteAvatar: () => void;
  uploadPending: boolean;
  deletePending: boolean;
}

// ── Mobile: avatar card inside the "Profile" section ─────────────────────────
export function ProfileAvatarCard({
  displayPicture, initials, profile,
  onShowPicker, onDeleteAvatar, uploadPending, deletePending,
}: AvatarBase) {
  return (
    <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
      <div className="relative shrink-0">
        <Avatar className="h-16 w-16 border-2 border-border">
          {displayPicture ? <AvatarImage src={displayPicture} alt="Profile" className="object-cover" /> : null}
          <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>
        <button type="button" onClick={onShowPicker}
          className="absolute -bottom-1 -right-1 rounded-full bg-orange-500 text-white p-1.5 shadow">
          <Camera size={11} />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-base truncate">{profile?.fullName || profile?.username}</p>
        <p className="text-xs text-muted-foreground truncate mb-2">{profile?.email}</p>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs capitalize">{profile?.role}</Badge>
          <Button size="sm" variant="outline" onClick={onShowPicker} className="h-7 text-xs gap-1">
            <Camera size={11} />{uploadPending ? "Uploading…" : "Change"}
          </Button>
          {displayPicture && (
            <Button size="sm" variant="outline" className="h-7 text-xs text-destructive gap-1" onClick={onDeleteAvatar} disabled={deletePending}>
              <Trash2 size={11} />Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Mobile: centred avatar summary on the section-list home screen ────────────
export function ProfileAvatarSummary({
  displayPicture, initials, profile, onShowPicker,
}: Pick<AvatarBase, "displayPicture" | "initials" | "profile" | "onShowPicker">) {
  return (
    <>
      <div className="relative mb-3">
        <Avatar className="h-20 w-20 border-2 border-border">
          {displayPicture ? <AvatarImage src={displayPicture} alt="Profile" className="object-cover" /> : null}
          <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>
        <button type="button" onClick={onShowPicker}
          className="absolute -bottom-1 -right-1 rounded-full bg-orange-500 text-white p-1.5 shadow-md">
          <Camera size={12} />
        </button>
      </div>
      <p className="font-bold text-lg">{profile?.fullName || profile?.username}</p>
      <p className="text-sm text-muted-foreground">{profile?.email}</p>
      <Badge variant="outline" className="mt-1.5 text-xs capitalize">{profile?.role}</Badge>
    </>
  );
}
