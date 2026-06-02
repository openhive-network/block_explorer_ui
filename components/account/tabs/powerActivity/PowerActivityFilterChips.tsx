import React from "react";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
import Hive from "@/types/Hive";

import type { PowerActivityTabSearchParams } from "./PowerActivityTabContent";

interface PowerActivityFilterChipsProps {
  paramsState: PowerActivityTabSearchParams;
  setParams: (next: PowerActivityTabSearchParams) => void;
  onExpand?: () => void;
  onExpandRanges?: () => void;
  isLoading?: boolean;
}

type Chip = {
  key: string;
  label: string;
  onRemove?: () => void;
  onClick?: () => void;
};

const VESTING_FILTER_LABEL_KEYS: Record<Hive.VestingHistoryFilter, string> = {
  all: "powerActivityTable.filterAll",
  power_up: "accountHpActivityCard.poweredUp",
  power_down_init: "accountHpActivityCard.scheduledDown",
  power_down_fill: "accountHpActivityCard.poweredDown",
};

const GRANULARITY_LABEL_KEYS: Record<"daily" | "monthly" | "yearly", string> = {
  daily: "common.daily",
  monthly: "common.monthly",
  yearly: "common.yearly",
};

const PowerActivityFilterChips: React.FC<PowerActivityFilterChipsProps> = ({
  paramsState,
  setParams,
  onExpand,
  onExpandRanges,
  isLoading,
}) => {
  const { t } = useI18n();
  const chips: Chip[] = [];

  const activeVestingFilter = paramsState.vestingFilter ?? "all";
  const isDefaultFilter = activeVestingFilter === "all";
  chips.push({
    key: "event-type",
    label: t("activeFilters.eventType", {
      value: t(VESTING_FILTER_LABEL_KEYS[activeVestingFilter]),
    }),
    onRemove: isDefaultFilter
      ? undefined
      : () => {
          setParams({
            ...paramsState,
            vestingFilter: "all",
            page: undefined,
          });
        },
  });

  const activeGranularity = paramsState.granularity ?? "daily";
  const isDefaultGranularity = activeGranularity === "daily";
  chips.push({
    key: "granularity",
    label: `${t("hpMomentumFullChartDialog.granularity")}: ${t(
      GRANULARITY_LABEL_KEYS[activeGranularity]
    )}`,
    onClick: onExpand,
    onRemove: isDefaultGranularity
      ? undefined
      : () => {
          setParams({ ...paramsState, granularity: "daily" });
        },
  });

  const resetDateRange = () => {
    setParams({
      ...paramsState,
      fromBlock: undefined,
      toBlock: undefined,
      fromDate: undefined,
      toDate: undefined,
      lastBlocks: undefined,
      lastTime: undefined,
      timeUnit: undefined,
      rangeSelectKey: "none",
      page: undefined,
    });
  };

  if (paramsState.rangeSelectKey === "lastTime" && paramsState.lastTime) {
    const timeUnit = paramsState.timeUnit ?? "days";
    const labelKey =
      timeUnit === "weeks"
        ? "activeFilters.lastWeeks"
        : timeUnit === "months"
          ? "activeFilters.lastMonths"
          : "activeFilters.lastDays";
    chips.push({
      key: "range",
      label: t(labelKey, { value: paramsState.lastTime }),
      onRemove: resetDateRange,
      onClick: onExpandRanges,
    });
  } else if (
    paramsState.rangeSelectKey === "lastBlocks" &&
    paramsState.lastBlocks
  ) {
    chips.push({
      key: "range",
      label: t("activeFilters.lastBlocks", {
        value: paramsState.lastBlocks.toLocaleString(),
      }),
      onRemove: resetDateRange,
      onClick: onExpandRanges,
    });
  } else if (
    paramsState.fromDate ||
    paramsState.toDate ||
    paramsState.fromBlock ||
    paramsState.toBlock
  ) {
    chips.push({
      key: "range",
      label: t("activeFilters.customRange"),
      onRemove: resetDateRange,
      onClick: onExpandRanges,
    });
  } else {
    chips.push({
      key: "range",
      label: t("activeFilters.allTime"),
      onClick: onExpandRanges,
    });
  }

  return (
    <div className="sticky top-[3.2rem] md:top-[4rem] z-30 bg-theme pb-3">
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
            className={cn(
              "inline-flex items-center rounded-full",
              "bg-blue-100 text-blue-700 text-xs font-medium",
              "dark:bg-blue-950/50 dark:text-blue-300"
            )}
          >
            <button
              type="button"
              onClick={chip.onClick ?? onExpand}
              className={cn(
                "py-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors cursor-pointer",
                chip.onRemove ? "pl-3 pr-2" : "px-3"
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
                className="rounded-full p-0.5 mr-1 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PowerActivityFilterChips;
