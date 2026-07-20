import { Button } from "@/components/ui/button";
import { KeyRound, Link2, Pencil, Trash2 } from "lucide-react";

interface UserActionMenuProps {
  user: any;
  /** true = mobile sizes (h-8 w-8, icon 13); false = desktop sizes (h-7 w-7, icon 12) */
  mobile?: boolean;
  openResetLink: (user: any) => void;
  setResetPwUser: (user: any) => void;
  setResetPwValue: (v: string) => void;
  setResetPwConfirm: (v: string) => void;
  setResetPwShow: (v: boolean) => void;
  openEdit: (user: any) => void;
  setDeleteId: (id: number) => void;
}

export function UserActionMenu({
  user,
  mobile = false,
  openResetLink,
  setResetPwUser,
  setResetPwValue,
  setResetPwConfirm,
  setResetPwShow,
  openEdit,
  setDeleteId,
}: UserActionMenuProps) {
  const sz = mobile ? "h-8 w-8" : "h-7 w-7";
  const iconSz = mobile ? 13 : 12;

  const handleResetPw = () => {
    setResetPwUser(user);
    setResetPwValue("");
    setResetPwConfirm("");
    setResetPwShow(false);
  };

  return (
    <div className="flex gap-1">
      <Button
        variant="ghost" size="icon" className={`${sz} text-orange-600 hover:text-orange-700`}
        title="Generate reset link (no email)" onClick={() => openResetLink(user)}
      >
        <Link2 size={iconSz} />
      </Button>
      <Button
        variant="ghost" size="icon" className={`${sz} text-blue-600 hover:text-blue-700`}
        title="Reset password" onClick={handleResetPw}
      >
        <KeyRound size={iconSz} />
      </Button>
      <Button
        variant="ghost" size="icon" className={sz}
        onClick={() => openEdit(user)}
      >
        <Pencil size={iconSz} />
      </Button>
      <Button
        variant="ghost" size="icon" className={`${sz} text-destructive`}
        onClick={() => setDeleteId(user.id)}
      >
        <Trash2 size={iconSz} />
      </Button>
    </div>
  );
}
