import React from "react";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_COIN_TYPE } from "@/components/home/searches/BalanceHistorySearch";
import type {
  VestHpUnit,
  BalanceHistorySearchParams,
} from "./balanceHistoryParams";
import { useI18n } from "@/i18n/i18n";

interface ActiveFilterChipsProps {
  paramsState: BalanceHistorySearchParams;
  setParams: (p: BalanceHistorySearchParams) => void;
  coinType: string;
  setCoinType: (c: string) => void;
  unit: VestHpUnit;
  setUnit: (u: VestHpUnit) => void;
  settingsDisplayMode: "vests" | "hp";
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

const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  paramsState,
  setParams,
  coinType,
  setCoinType,
  unit,
  setUnit,
  settingsDisplayMode,
  onExpand,
  onExpandRanges,
  isLoading,
}) => {
  const { t } = useI18n();
  const chips: Chip[] = [];

  const isHpView = coinType === "VESTS" && unit === "hp";
  const coinLabel = isHpView ? "HP" : coinType;
  const isCoinDefault = coinType === DEFAULT_COIN_TYPE && !isHpView;
  chips.push({
    key: "coin",
    label: t("activeFilters.coin", { value: coinLabel }),
    onRemove: isCoinDefault
      ? undefined
      : () => {
          setCoinType(DEFAULT_COIN_TYPE);
          setUnit(settingsDisplayMode);
          setParams({
            ...paramsState,
            coinType: DEFAULT_COIN_TYPE,
            page: undefined,
          });
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

  if (coinType !== "VESTS") {
    const savingsIncluded = paramsState.includeSavings !== "no";
    chips.push({
      key: "savings",
      label: savingsIncluded
        ? t("activeFilters.savingsIncluded")
        : t("activeFilters.savingsExcluded"),
      onRemove: savingsIncluded
        ? undefined
        : () => {
            setParams({
              ...paramsState,
              includeSavings: "yes",
              page: undefined,
            });
          },
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

export default ActiveFilterChips;
