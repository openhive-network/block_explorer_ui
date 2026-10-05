import React from "react";
import FilterChipsBar, {
  FilterChip,
  buildRangeChip,
} from "@/components/ui/FilterChipsBar";
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
  const chips: FilterChip[] = [];

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

  chips.push(buildRangeChip(paramsState, t, resetDateRange, onExpandRanges));

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
    <FilterChipsBar
      sticky
      chips={chips}
      onExpand={onExpand}
      isLoading={isLoading}
    />
  );
};

export default ActiveFilterChips;
