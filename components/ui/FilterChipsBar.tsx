import React from "react";
import { Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";

export interface FilterChip {
  key: string;
  label: string;
  onRemove?: () => void;
  onClick?: () => void;
}

export interface RangeChipParams {
  rangeSelectKey?: string;
  lastTime?: number;
  timeUnit?: string;
  lastBlocks?: number;
  fromDate?: unknown;
  toDate?: unknown;
  fromBlock?: unknown;
  toBlock?: unknown;
}

// The date-range chip shared by every tab with a SearchRanges filter.
export const buildRangeChip = (
  params: RangeChipParams,
  t: (key: string, options?: Record<string, unknown>) => string,
  resetRange: () => void,
  onExpandRanges?: () => void
): FilterChip => {
  if (params.rangeSelectKey === "lastTime" && params.lastTime) {
    const labelKey =
      params.timeUnit === "weeks"
        ? "activeFilters.lastWeeks"
        : params.timeUnit === "months"
          ? "activeFilters.lastMonths"
          : "activeFilters.lastDays";
    return {
      key: "range",
      label: t(labelKey, { value: params.lastTime }),
      onRemove: resetRange,
      onClick: onExpandRanges,
    };
  }
  if (params.rangeSelectKey === "lastBlocks" && params.lastBlocks) {
    return {
      key: "range",
      label: t("activeFilters.lastBlocks", {
        value: params.lastBlocks.toLocaleString(),
      }),
      onRemove: resetRange,
      onClick: onExpandRanges,
    };
  }
  if (params.fromDate || params.toDate || params.fromBlock || params.toBlock) {
    return {
      key: "range",
      label: t("activeFilters.customRange"),
      onRemove: resetRange,
      onClick: onExpandRanges,
    };
  }
  return {
    key: "range",
    label: t("activeFilters.allTime"),
    onClick: onExpandRanges,
  };
};

interface FilterChipsBarProps {
  chips: FilterChip[];
  // Default action for chips without their own onClick, e.g. open the filters.
  onExpand?: () => void;
  isLoading?: boolean;
  // Pins the bar under the navbar while the page scrolls.
  sticky?: boolean;
  className?: string;
}

const FilterChipsBar: React.FC<FilterChipsBarProps> = ({
  chips,
  onExpand,
  isLoading,
  sticky = false,
  className,
}) => {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        sticky && "sticky top-[3.2rem] md:top-[4rem] z-30 bg-theme pb-3",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2 bg-theme rounded-md border border-gray-200 dark:border-gray-700 shadow-sm px-3 py-2">
        <span className="text-sm text-gray-500">
          {t("activeFilters.title")}:
        </span>
        {isLoading && (
          <Loader2
            size={14}
            className="animate-spin text-gray-500"
            aria-label={t("activeFilters.updating")}
          />
        )}
        {chips.map((chip) => (
          <span
            key={chip.key}
            className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 text-xs font-medium dark:bg-blue-950/50 dark:text-blue-300"
          >
            <button
              type="button"
              onClick={chip.onClick ?? onExpand}
              className={cn(
                "py-0.5 rounded-full text-current hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors cursor-pointer",
                chip.onRemove ? "ps-3 pe-2" : "px-3"
              )}
              aria-label={t("activeFilters.edit", { value: chip.label })}
            >
              {chip.label}
            </button>
            {chip.onRemove && (
              <button
                type="button"
                onClick={chip.onRemove}
                aria-label={t("activeFilters.remove", { value: chip.label })}
                className="rounded-full p-0.5 me-1 text-current hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
              >
                <X size={12} className="text-current" />
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default FilterChipsBar;
