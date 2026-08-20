import { Search } from "lucide-react";
import type { CommunitySortOrder } from "@/hooks/api/communities/useCommunities";
import { useI18n } from "@/i18n/i18n";

interface CommunityControlsProps {
  query: string;
  onQueryChange: (query: string) => void;
  sort: CommunitySortOrder;
  onSortChange: (sort: CommunitySortOrder) => void;
}

const CommunityControls = ({
  query,
  onQueryChange,
  sort,
  onSortChange,
}: CommunityControlsProps) => {
  const { t } = useI18n();

  const sortOptions: { value: CommunitySortOrder; label: string }[] = [
    { value: "rank", label: t("communityControls.sortByRank") },
    { value: "subs", label: t("communityControls.sortBySubscribers") },
    { value: "new", label: t("communityControls.sortByNewest") },
  ];

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative flex-grow">
        <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
          <Search className="h-5 w-5 text-slate-400" />
        </span>
        <input
          type="text"
          placeholder={t("communityControls.searchPlaceholder")}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white py-2 ps-10 pe-4 shadow-sm transition-colors placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500"
        />
      </div>

      {/* Sort Dropdown */}
      <div className="flex-shrink-0">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as CommunitySortOrder)}
          className="w-full rounded-md border border-slate-300 bg-white py-2 ps-3 pe-8 shadow-sm transition-colors sm:w-48 dark:border-slate-700 dark:bg-slate-800"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CommunityControls;
