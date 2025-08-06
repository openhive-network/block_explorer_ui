import { Search, SortAsc, SortDesc } from "lucide-react";
import { useI18n } from "@/i18n/i18n";

export type ProposalStatusFilter = "all" | "active" | "inactive" | "expired";
export type ProposalSortOrder =
  | "by_total_votes"
  | "by_creator"
  | "by_start_date"
  | "by_end_date";

export type ProposalSortDirection = "ascending" | "descending";

export type Budget = {
  key: string;
  label: string;
  value: string;
};

interface ProposalControlsProps {
  currentStatus: ProposalStatusFilter;
  onStatusChange: (status: ProposalStatusFilter) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  sortOrder: ProposalSortOrder;
  sortDirection: ProposalSortDirection;
  onSortChange: (order: ProposalSortOrder) => void;
  onSortDirectionChange: (direction: ProposalSortDirection) => void;
  budgets: Budget[];
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
  budgets,
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

  const SORT_DIRECTION: { value: ProposalSortDirection; labelKey: string }[] = [
    { value: "ascending", labelKey: "proposalControls.ascending" },
    { value: "descending", labelKey: "proposalControls.descending" },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 dark:border-slate-800 dark:bg-theme md:flex-row md:items-center md:justify-between">
      <div className="flex-shrink-0 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        <div className="flex items-center space-x-1">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onStatusChange(option.value)}
              className={`w-full rounded-md px-4 py-1.5 text-sm font-semibold transition-colors duration-200
                ${
                  currentStatus === option.value
                    ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }
              `}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-center items-center">
        <ul className="flex gap-2">
          {budgets.map(({ key, label, value }) => (
            <li
              className="p-2 text-center"
              key={key}
            >
              <div
                className={
                  "p-2  font-semibold rounded flex-shrink-0 rounded-lg bg-slate-100  dark:bg-slate-800 text-slate-500  dark:text-slate-400 "
                }
              >
                {value}
              </div>
              <small className="text-slate-500  dark:text-slate-400">
                {label}
              </small>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-grow">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
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
            className="block w-full rounded-lg border-slate-300 bg-slate-50 py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>
        <div className="relative flex-shrink-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
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
            onChange={(e) => onSortChange(e.target.value as ProposalSortOrder)}
            className="block w-full appearance-none rounded-lg border-slate-300 bg-slate-50 py-2 pl-10 pr-8 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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

          <select
            value={sortDirection}
            onChange={(e) =>
              onSortDirectionChange(e.target.value as ProposalSortDirection)
            }
            className="block w-full appearance-none rounded-lg border-slate-300 bg-slate-50 py-2 pl-10 pr-8 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {SORT_DIRECTION.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
