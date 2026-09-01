import { Filter } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";

interface FilterSectionToggleProps {
  toggleFilters: () => void;
  isFiltersActive: boolean;
}

const FilterSectionToggle: React.FC<FilterSectionToggleProps> = ({
  toggleFilters,
  isFiltersActive,
}) => {
  const { t } = useI18n();

  return (
    <button
      type="button"
      data-testid="filters-toggle"
      onClick={toggleFilters}
      aria-pressed={isFiltersActive}
      aria-label={t("common.filters")}
      className={cn(
        "group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md",
        "text-sm font-medium transition-all cursor-pointer",
        "border border-transparent",
        isFiltersActive
          ? "bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border-blue-500/20"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/60 dark:hover:bg-gray-800/60"
      )}
    >
      <Filter className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{t("common.filters")}</span>
      {isFiltersActive && (
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
        </span>
      )}
    </button>
  );
};

export default FilterSectionToggle;
