import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface UserFiltersProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  roleFilter: "all" | "admin" | "operator" | "user";
  setRoleFilter: (v: "all" | "admin" | "operator" | "user") => void;
}

export function UserFilters({ searchQuery, setSearchQuery, roleFilter, setRoleFilter }: UserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, username, or email…"
          className="pl-9 pr-9 h-9 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
        <SelectTrigger className="h-9 w-full sm:w-[130px] text-sm shrink-0">
          <SelectValue placeholder="All roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          <SelectItem value="admin">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Admin
            </span>
          </SelectItem>
          <SelectItem value="operator">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Operator
            </span>
          </SelectItem>
          <SelectItem value="user">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />User
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default UserFilters;
