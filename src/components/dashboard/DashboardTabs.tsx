import { ActiveTab } from "./types";

type DashboardTabsProps = {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
};

export function DashboardTabs({ activeTab, onChange }: DashboardTabsProps) {
  return (
    <div className="flex gap-2 border-b border-stone-300">
      {(["items", "orders"] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`h-11 border-b-2 px-4 text-sm font-semibold capitalize ${
            activeTab === tab
              ? "border-red-700 text-red-800"
              : "border-transparent text-stone-500 hover:text-stone-950"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
