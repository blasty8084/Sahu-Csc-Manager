import { ROLE_COLORS } from "./users.constants";

interface UserRoleBadgeProps {
  role: string;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${ROLE_COLORS[role] ?? ""}`}>
      {role}
    </span>
  );
}
