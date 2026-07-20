import { Badge } from "@/components/ui/badge";

interface UserStatusBadgeProps {
  isActive: boolean;
}

export function UserStatusBadge({ isActive }: UserStatusBadgeProps) {
  return (
    <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
