import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, SortAsc } from "lucide-react";

interface UdhariSearchBarProps {
  q: string;
  setQ: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
}

export function UdhariSearchBar({ q, setQ, sort, setSort }: UdhariSearchBarProps) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2">
      <div className="relative flex-1 min-w-0">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-8 h-9 text-sm w-full" placeholder={t("udhari.search_placeholder")}
          value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger className="h-9 w-[130px] sm:w-[150px] text-xs flex-shrink-0">
          <SortAsc size={12} className="mr-1 text-muted-foreground flex-shrink-0" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">{t("udhari.most_recent")}</SelectItem>
          <SelectItem value="balance_desc">{t("udhari.highest_balance")}</SelectItem>
          <SelectItem value="alpha">{t("udhari.a_to_z")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
