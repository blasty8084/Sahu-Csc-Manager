import { type Tab } from "./users.constants";

interface UserTabBarProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  pendingCount: number;
  appealCount: number;
  activeCount: number;
  totalCount: number;
}

const TABS: { key: Tab; label: string; getCount: (p: UserTabBarProps) => number }[] = [
  { key: "pending",  label: "Pending",       getCount: p => p.pendingCount },
  { key: "appeals",  label: "Appeals",       getCount: p => p.appealCount  },
  { key: "active",   label: "Active",        getCount: p => p.activeCount  },
  { key: "all",      label: "All Users",     getCount: p => p.totalCount   },
  { key: "overview", label: "Cash Overview", getCount: () => 0 },
  { key: "aeps",     label: "AePS Overview", getCount: () => 0 },
  { key: "sessions", label: "Sessions",      getCount: () => 0 },
];

export function UserTabBar(props: UserTabBarProps) {
  const { tab, onTabChange } = props;
  return (
    <div className="flex gap-1 border-b border-border overflow-x-auto">
      {TABS.map(({ key, label, getCount }) => {
        const count  = getCount(props);
        const active = tab === key;
        return (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
            {count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                key === "pending"  ? "bg-red-500 text-white" :
                key === "appeals"  ? "bg-orange-500 text-white" :
                "bg-muted text-muted-foreground"
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default UserTabBar;
