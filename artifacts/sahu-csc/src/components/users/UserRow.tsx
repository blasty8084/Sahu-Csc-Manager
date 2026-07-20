import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserActionMenu } from "./UserActionMenu";

interface UserRowProps {
  user: any;
  selectedIds: Set<number>;
  toggleSelect: (id: number) => void;
  openResetLink: (user: any) => void;
  setResetPwUser: (user: any) => void;
  setResetPwValue: (v: string) => void;
  setResetPwConfirm: (v: string) => void;
  setResetPwShow: (v: boolean) => void;
  openEdit: (user: any) => void;
  setDeleteId: (id: number) => void;
}

/** Mobile card — rendered inside the `sm:hidden` container div */
export function UserRowMobile({ user, selectedIds, toggleSelect, ...actions }: UserRowProps) {
  const initials = (user.fullName || user.username).charAt(0).toUpperCase();
  return (
    <div
      className={`bg-card border rounded-xl p-4 space-y-3 transition-colors ${selectedIds.has(user.id) ? "border-primary/40 bg-primary/5" : ""}`}
      data-testid={`row-user-${user.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Checkbox
            checked={selectedIds.has(user.id)}
            onCheckedChange={() => toggleSelect(user.id)}
            className="shrink-0"
            aria-label={`Select ${user.username}`}
          />
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="text-sm bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium truncate">{user.fullName || user.username}</p>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </div>
        <UserActionMenu user={user} mobile {...actions} />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <UserRoleBadge role={user.role} />
        <UserStatusBadge isActive={user.isActive} />
      </div>
      <div className="text-xs text-muted-foreground space-y-0.5">
        <p>{user.email}</p>
        {user.mobile && <p>{user.mobile}</p>}
        <p>Joined {new Date(user.createdAt).toLocaleDateString("en-IN")}</p>
      </div>
    </div>
  );
}

/** Desktop table row — rendered inside a `<tbody>` */
export function UserRowDesktop({ user, selectedIds, toggleSelect, ...actions }: UserRowProps) {
  const initials = (user.fullName || user.username).charAt(0).toUpperCase();
  return (
    <tr
      className={`transition-colors ${selectedIds.has(user.id) ? "bg-primary/5" : "hover:bg-muted/20"}`}
      data-testid={`row-user-${user.id}`}
    >
      <td className="px-4 py-3">
        <Checkbox checked={selectedIds.has(user.id)} onCheckedChange={() => toggleSelect(user.id)} aria-label={`Select ${user.username}`} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.fullName || user.username}</p>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-xs">{user.email}</p>
        {user.mobile && <p className="text-xs text-muted-foreground">{user.mobile}</p>}
      </td>
      <td className="px-4 py-3"><UserRoleBadge role={user.role} /></td>
      <td className="px-4 py-3"><UserStatusBadge isActive={user.isActive} /></td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleDateString("en-IN")}</td>
      <td className="px-4 py-3"><UserActionMenu user={user} {...actions} /></td>
    </tr>
  );
}
