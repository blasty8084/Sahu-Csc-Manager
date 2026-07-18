/**
 * ProfileSessionDialogs — the three AlertDialogs for session revocation on the Profile page.
 * Kept separate so profile.tsx can stay thin.
 */
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { SessionEntry } from "./types";

interface Props {
  revokeId: number | null;
  setRevokeId: (id: number | null) => void;
  revokeMut: { mutate: (id: number) => void };
  revokeOthersOpen: boolean;
  setRevokeOthersOpen: (open: boolean) => void;
  revokeOthersMut: { mutate: () => void };
  otherSessions: SessionEntry[];
  revokeAllOpen: boolean;
  setRevokeAllOpen: (open: boolean) => void;
  revokeAllMut: { mutate: () => void };
  sessions: SessionEntry[];
}

export function ProfileSessionDialogs({
  revokeId, setRevokeId, revokeMut,
  revokeOthersOpen, setRevokeOthersOpen, revokeOthersMut, otherSessions,
  revokeAllOpen, setRevokeAllOpen, revokeAllMut, sessions,
}: Props) {
  return (
    <>
      {/* Revoke single session */}
      <AlertDialog open={revokeId !== null} onOpenChange={() => setRevokeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Session</AlertDialogTitle>
            <AlertDialogDescription>This will immediately log out the selected device.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => { if (revokeId !== null) revokeMut.mutate(revokeId); setRevokeId(null); }}
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout all other devices */}
      <AlertDialog open={revokeOthersOpen} onOpenChange={setRevokeOthersOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout All Other Devices</AlertDialogTitle>
            <AlertDialogDescription>
              Signs out {otherSessions.length} other session{otherSessions.length !== 1 ? "s" : ""}. Your current session stays active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => { revokeOthersMut.mutate(); setRevokeOthersOpen(false); }}
            >
              Logout Others
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout everywhere */}
      <AlertDialog open={revokeAllOpen} onOpenChange={setRevokeAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout Everywhere</AlertDialogTitle>
            <AlertDialogDescription>
              Signs out all {sessions.length} session{sessions.length !== 1 ? "s" : ""} including this device. You'll be redirected to login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => { revokeAllMut.mutate(); setRevokeAllOpen(false); }}
            >
              Logout Everywhere
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
