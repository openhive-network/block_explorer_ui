import React from "react";
import FilterChipsBar, {
  FilterChip,
  buildRangeChip,
} from "@/components/ui/FilterChipsBar";
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
  const chips: FilterChip[] = [];

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

  chips.push(buildRangeChip(paramsState, t, resetDateRange, onExpandRanges));

  return (
    <FilterChipsBar
      sticky
      chips={chips}
      onExpand={onExpand}
      isLoading={isLoading}
    />
  );
};

export default PowerActivityFilterChips;
