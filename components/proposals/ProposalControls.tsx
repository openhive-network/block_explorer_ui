import { ArrowDown, ArrowUp, Search, SortAsc, SortDesc } from "lucide-react";
import { useI18n } from "@/i18n/i18n";

export type ProposalStatusFilter = "all" | "active" | "inactive" | "expired";
export type ProposalSortOrder =
  | "by_total_votes"
  | "by_creator"
  | "by_start_date"
  | "by_end_date";

export type ProposalSortDirection = "ascending" | "descending";

interface ProposalControlsProps {
  currentStatus: ProposalStatusFilter;
  onStatusChange: (status: ProposalStatusFilter) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  sortOrder: ProposalSortOrder;
  sortDirection: ProposalSortDirection;
  onSortChange: (order: ProposalSortOrder) => void;
  onSortDirectionChange: (direction: ProposalSortDirection) => void;
}

export const ProposalControls = ({
  currentStatus,
  onStatusChange,
  searchQuery,
  onSearch,
  sortOrder,
  sortDirection,
  onSortChange,
  onSortDirectionChange,
}: ProposalControlsProps) => {
  const { t } = useI18n();

  const STATUS_OPTIONS: { value: ProposalStatusFilter; labelKey: string }[] = [
    { value: "active", labelKey: "proposalControls.statusActive" },
    { value: "inactive", labelKey: "proposalControls.statusInactive" },
    { value: "expired", labelKey: "proposalControls.statusExpired" },
    { value: "all", labelKey: "proposalControls.statusAll" },
  ];

  const SORT_OPTIONS: { value: ProposalSortOrder; labelKey: string }[] = [
    { value: "by_total_votes", labelKey: "proposalControls.sortByVotes" },
    { value: "by_start_date", labelKey: "proposalControls.sortByStartDate" },
    { value: "by_end_date", labelKey: "proposalControls.sortByEndDate" },
    { value: "by_creator", labelKey: "proposalControls.sortByCreator" },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-[8px] border bg-white p-4 dark:border-slate-800 dark:bg-theme">
      <div className="flex w-full flex-col flex-wrap items-stretch gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full overflow-x-auto lg:w-auto">
          <div className="inline-flex w-full rounded-[8px] bg-slate-100 p-1 dark:bg-slate-800">
            <div className="flex items-center space-x-1">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onStatusChange(option.value)}
                  className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors duration-200
                    ${
                      currentStatus === option.value
                        ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700"
                        : "text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  type="button"
                >
                  {t(option.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:w-1/2">
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <Search
                className="h-5 w-5 text-slate-400"
                aria-hidden="true"
              />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={t("proposalControls.searchPlaceholder")}
              className="block w-full rounded-[8px] border-slate-300 bg-slate-50 py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              aria-label={t("proposalControls.searchPlaceholder")}
            />
          </div>
          <div className="flex w-full items-stretch gap-2 sm:w-auto">
            <div className="relative w-full sm:w-60">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                {sortDirection === "descending" ? (
                  <SortDesc
                    className="h-5 w-5 text-slate-400"
                    aria-hidden="true"
                  />
                ) : (
                  <SortAsc
                    className="h-5 w-5 text-slate-400"
                    aria-hidden="true"
                  />
                )}
              </div>

              <select
                value={sortOrder}
                onChange={(e) =>
                  onSortChange(e.target.value as ProposalSortOrder)
                }
                className="block w-full rounded-[8px] border-slate-300 bg-slate-50 py-2.5 pl-9 pr-3 text-sm focus:z-10 focus:border-purple-500 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                aria-label={t("proposalControls.sortBy")}
              >
                {SORT_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() =>
                onSortDirectionChange(
                  sortDirection === "descending" ? "ascending" : "descending"
                )
              }
              className={`inline-flex items-center justify-center rounded-[8px] border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium transition-colors hover:bg-buttonBg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white ${
                sortDirection === "descending"
                  ? "shadow-sm dark:bg-slate-700"
                  : ""
              }`}
              title={
                sortDirection === "descending"
                  ? t("proposalControls.descending")
                  : t("proposalControls.ascending")
              }
              aria-label={t("proposalControls.sortDirection")}
              aria-pressed={sortDirection === "descending"}
            >
              {sortDirection === "descending" ? (
                <ArrowDown
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              ) : (
                <ArrowUp
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              )}
              <span className="sr-only">
                {t("proposalControls.sortDirection")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
