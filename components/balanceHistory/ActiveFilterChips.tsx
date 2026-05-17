import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_COIN_TYPE } from "@/components/home/searches/BalanceHistorySearch";
import type {
  VestHpUnit,
  BalanceHistorySearchParams,
} from "@/pages/balanceHistory/[accountName]";
import { useI18n } from "@/i18n/i18n";

interface ActiveFilterChipsProps {
  paramsState: BalanceHistorySearchParams;
  setParams: (p: BalanceHistorySearchParams) => void;
  coinType: string;
  setCoinType: (c: string) => void;
  unit: VestHpUnit;
  setUnit: (u: VestHpUnit) => void;
  settingsDisplayMode: "vests" | "hp";
}

const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  paramsState,
  setParams,
  coinType,
  setCoinType,
  unit,
  setUnit,
  settingsDisplayMode,
}) => {
  const { t } = useI18n();
  const chips: { key: string; label: string; onRemove?: () => void }[] = [];

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
    });
  } else {
    chips.push({ key: "range", label: t("activeFilters.allTime") });
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
        {chips.map((chip) => (
          <span
            key={chip.key}
            className={cn(
              "inline-flex items-center gap-1 py-0.5 rounded-full",
              "bg-blue-100 text-blue-700 text-xs font-medium",
              "dark:bg-blue-950/50 dark:text-blue-300",
              chip.onRemove ? "pl-3 pr-1" : "px-3"
            )}
          >
            {chip.label}
            {chip.onRemove && (
              <button
                type="button"
                onClick={chip.onRemove}
                aria-label={t("activeFilters.remove", { value: chip.label })}
                className="rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
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
