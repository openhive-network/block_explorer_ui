import { Dispatch, SetStateAction, useEffect, useState } from "react";
import moment from "moment";

import SearchRanges from "@/components/searchRanges/SearchRanges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchesContext } from "@/contexts/SearchesContext";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import { getLocalStorage, removeStorageItem } from "@/utils/LocalStorage";
import Hive from "@/types/Hive";

import type { PowerActivityTabSearchParams } from "./PowerActivityTabContent";
import { defaultPowerActivityTabSearchParams } from "./PowerActivityTabContent";

type VestingFilterOption = {
  key: Hive.VestingHistoryFilter;
  labelKey: string;
};

const VESTING_FILTER_OPTIONS: VestingFilterOption[] = [
  { key: "all", labelKey: "powerActivityTable.filterAll" },
  { key: "power_up", labelKey: "accountHpActivityCard.poweredUp" },
  { key: "power_down_init", labelKey: "accountHpActivityCard.scheduledDown" },
  { key: "power_down_fill", labelKey: "accountHpActivityCard.poweredDown" },
];

const GRANULARITY_OPTIONS: {
  key: "daily" | "monthly" | "yearly";
  labelKey: string;
}[] = [
  { key: "daily", labelKey: "common.daily" },
  { key: "monthly", labelKey: "common.monthly" },
  { key: "yearly", labelKey: "common.yearly" },
];

interface PowerActivitySearchProps {
  paramsState: PowerActivityTabSearchParams;
  setParams: (next: PowerActivityTabSearchParams) => void;
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setIsFiltersActive: Dispatch<SetStateAction<boolean>>;
  showCustomRange: boolean;
  setShowCustomRange: Dispatch<SetStateAction<boolean>>;
}

type DatePreset = {
  label: string;
  lastTime?: number;
  timeUnit?: "days" | "weeks" | "months";
  lastBlocks?: number;
  custom?: boolean;
};

const PowerActivitySearch: React.FC<PowerActivitySearchProps> = ({
  paramsState,
  setParams,
  isVisible,
  setIsVisible,
  setIsFiltersActive,
  showCustomRange,
  setShowCustomRange,
}) => {
  const { t } = useI18n();
  const { searchRanges } = useSearchesContext();
  const { checkTemporaryHeadBlockNumber } = useHeadBlockNumber();
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);
  const [pendingPresetLabel, setPendingPresetLabel] = useState<string | null>(
    null
  );

  const datePresets: DatePreset[] = [
    { label: "1k blocks", lastBlocks: 1000 },
    { label: "7d", lastTime: 7, timeUnit: "days" },
    { label: "30d", lastTime: 30, timeUnit: "days" },
    { label: "90d", lastTime: 90, timeUnit: "days" },
    { label: "1y", lastTime: 12, timeUnit: "months" },
    { label: "All" },
    { label: "Custom", custom: true },
  ];

  const handleSearch = async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await searchRanges.getRangesValues();

    setParams({
      ...paramsState,
      fromBlock: payloadFromBlock,
      toBlock: payloadToBlock,
      fromDate: payloadStartDate,
      toDate: payloadEndDate,
      lastBlocks:
        searchRanges.rangeSelectKey === "lastBlocks"
          ? searchRanges.lastBlocksValue
          : undefined,
      lastTime:
        searchRanges.rangeSelectKey === "lastTime"
          ? searchRanges.lastTimeUnitValue
          : undefined,
      timeUnit:
        searchRanges.rangeSelectKey === "lastTime"
          ? searchRanges.timeUnitSelectKey
          : undefined,
      rangeSelectKey: searchRanges.rangeSelectKey,
      page: undefined,
    });
  };

  const applyDatePreset = async (preset: DatePreset) => {
    if (preset.custom) {
      setShowCustomRange(true);
      setPendingPresetLabel("Custom");
      return;
    }
    setShowCustomRange(
      preset.lastTime !== undefined || preset.lastBlocks !== undefined
    );
    setPendingPresetLabel(preset.label);

    const {
      setRangeSelectKey,
      setTimeUnitSelectKey,
      setLastTimeUnitValue,
      setLastBlocksValue,
    } = searchRanges;

    const baseParams: PowerActivityTabSearchParams = {
      ...paramsState,
      fromBlock: undefined,
      toBlock: undefined,
      fromDate: undefined,
      toDate: undefined,
      lastBlocks: undefined,
      lastTime: undefined,
      timeUnit: undefined,
      page: undefined,
    };

    if (preset.lastBlocks !== undefined) {
      setRangeSelectKey("lastBlocks");
      setLastBlocksValue(preset.lastBlocks);
      const headBlock = await checkTemporaryHeadBlockNumber();
      const computedFromBlock = Number(headBlock) - preset.lastBlocks;
      setParams({
        ...baseParams,
        fromBlock: computedFromBlock > 0 ? computedFromBlock : undefined,
        lastBlocks: preset.lastBlocks,
        rangeSelectKey: "lastBlocks",
      });
      return;
    }

    if (preset.lastTime === undefined) {
      setRangeSelectKey("none");
      setParams({ ...baseParams, rangeSelectKey: "none" });
      return;
    }

    const timeUnit = preset.timeUnit ?? "days";
    setRangeSelectKey("lastTime");
    setTimeUnitSelectKey(timeUnit);
    setLastTimeUnitValue(preset.lastTime);

    const fromDate = moment()
      .subtract(preset.lastTime, timeUnit)
      .milliseconds(0)
      .toDate();

    setParams({
      ...baseParams,
      fromDate,
      lastTime: preset.lastTime,
      timeUnit,
      rangeSelectKey: "lastTime",
    });
  };

  const matchedPresetLabel = (() => {
    if (paramsState.rangeSelectKey === "none") return "All";
    if (paramsState.rangeSelectKey === "lastBlocks") {
      const match = datePresets.find(
        (p) => p.lastBlocks === paramsState.lastBlocks
      );
      return match?.label ?? null;
    }
    if (paramsState.rangeSelectKey !== "lastTime") return null;
    const match = datePresets.find(
      (p) =>
        p.lastTime === paramsState.lastTime &&
        p.timeUnit === paramsState.timeUnit
    );
    return match?.label ?? null;
  })();

  useEffect(() => {
    const hasRange =
      paramsState.rangeSelectKey && paramsState.rangeSelectKey !== "none";
    if (hasRange && matchedPresetLabel === null) {
      setShowCustomRange(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedPresetLabel, paramsState.rangeSelectKey]);

  const derivedPresetLabel =
    matchedPresetLabel ?? (showCustomRange ? "Custom" : null);
  const activePresetLabel = pendingPresetLabel ?? derivedPresetLabel;

  useEffect(() => {
    if (
      pendingPresetLabel !== null &&
      derivedPresetLabel === pendingPresetLabel
    ) {
      setPendingPresetLabel(null);
    }
  }, [derivedPresetLabel, pendingPresetLabel]);

  const handleVestingFilterChange = (filter: Hive.VestingHistoryFilter) => {
    setParams({
      ...paramsState,
      vestingFilter: filter,
      page: undefined,
    });
  };

  const handleGranularityChange = (
    granularity: "daily" | "monthly" | "yearly"
  ) => {
    setParams({ ...paramsState, granularity });
  };

  const handleFilterClear = () => {
    const {
      setRangeSelectKey,
      setTimeUnitSelectKey,
      setLastTimeUnitValue,
      setLastBlocksValue,
    } = searchRanges;

    // accountName must be carried or useURLParams.setParams bails on its
    // interpolation-param guard and the URL (and thus the filters) never reset.
    setParams({
      ...defaultPowerActivityTabSearchParams,
      accountName: paramsState.accountName,
    });
    setRangeSelectKey("lastTime");
    setTimeUnitSelectKey("days");
    setLastTimeUnitValue(30);
    setLastBlocksValue(1000);
    setIsVisible(false);
    setIsFiltersActive(false);
    setShowCustomRange(false);
    setPendingPresetLabel(null);
    removeStorageItem("is_power_activity_filters_visible");
  };

  // The tab's default window is "Last 30 days"; anything other than that, a
  // non-"all" event filter, or a non-daily granularity counts as active.
  const isDefaultRange =
    paramsState.rangeSelectKey === "lastTime" &&
    paramsState.lastTime === 30 &&
    (paramsState.timeUnit ?? "days") === "days";

  const hasActiveFilters = Boolean(
    (paramsState.vestingFilter && paramsState.vestingFilter !== "all") ||
    (paramsState.granularity && paramsState.granularity !== "daily") ||
    !isDefaultRange
  );

  useEffect(() => {
    setIsFiltersActive(hasActiveFilters);
    if (hasActiveFilters) {
      const persisted = getLocalStorage(
        "is_power_activity_filters_visible",
        true
      );
      setIsVisible(persisted);
    } else {
      setIsVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActiveFilters]);

  const activeVestingFilter = paramsState.vestingFilter ?? "all";
  const activeGranularity = paramsState.granularity ?? "daily";

  return (
    <Card
      className={cn(
        "mb-4 overflow-hidden transition-all duration-500 ease-in max-h-0 opacity-0 mt-4",
        {
          "max-h-full opacity-100": isVisible,
        }
      )}
    >
      <CardHeader>
        <CardTitle className="text-left">{t("common.filters")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
          <span className="text-sm text-gray-500 sm:mr-4">
            {t("powerActivitySearch.eventType")}:
          </span>
          <div
            className="flex items-stretch self-start max-w-full overflow-x-auto rounded-full border border-navbar-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label={t("powerActivitySearch.eventType")}
          >
            {VESTING_FILTER_OPTIONS.map((option, idx) => {
              const isActive = activeVestingFilter === option.key;
              const isFirst = idx === 0;
              const isLast = idx === VESTING_FILTER_OPTIONS.length - 1;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleVestingFilterChange(option.key)}
                  aria-pressed={isActive}
                  data-testid={`power-activity-filter-${option.key}`}
                  className={cn(
                    "px-2 py-1 text-xs sm:px-4 sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors",
                    !isLast && "border-r border-navbar-border",
                    isFirst && "rounded-l-full",
                    isLast && "rounded-r-full",
                    isActive
                      ? "bg-blue-500 text-white"
                      : "bg-theme hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  {t(option.labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
          <span className="text-sm text-gray-500 sm:mr-4">
            {t("hpMomentumFullChartDialog.granularity")}:
          </span>
          <div
            className="flex items-stretch self-start max-w-full overflow-x-auto rounded-full border border-navbar-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label={t("hpMomentumFullChartDialog.granularity")}
          >
            {GRANULARITY_OPTIONS.map((option, idx) => {
              const isActive = activeGranularity === option.key;
              const isFirst = idx === 0;
              const isLast = idx === GRANULARITY_OPTIONS.length - 1;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleGranularityChange(option.key)}
                  aria-pressed={isActive}
                  className={cn(
                    "px-2 py-1 text-xs sm:px-4 sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors",
                    !isLast && "border-r border-navbar-border",
                    isFirst && "rounded-l-full",
                    isLast && "rounded-r-full",
                    isActive
                      ? "bg-blue-500 text-white"
                      : "bg-theme hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  {t(option.labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
          <span className="text-sm text-gray-500 sm:mr-1">
            {t("balanceHistorySearch.quickRange")}:
          </span>
          <div
            className="flex items-stretch self-start max-w-full overflow-x-auto rounded-full border border-navbar-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label={t("balanceHistorySearch.quickRangeAria")}
          >
            {datePresets.map((preset, idx) => {
              const isActive = activePresetLabel === preset.label;
              const isFirst = idx === 0;
              const isLast = idx === datePresets.length - 1;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyDatePreset(preset)}
                  aria-pressed={isActive}
                  className={cn(
                    "px-2 py-1 text-xs sm:px-4 sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors",
                    !isLast && "border-r border-navbar-border",
                    isFirst && "rounded-l-full",
                    isLast && "rounded-r-full",
                    isActive
                      ? "bg-blue-500 text-white"
                      : "bg-theme hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {showCustomRange && (
          <SearchRanges
            rangesProps={searchRanges}
            setIsSearchButtonDisabled={setIsSearchButtonDisabled}
          />
        )}

        <div className="flex items-center justify-between mt-10">
          {showCustomRange ? (
            <div>
              <Button
                onClick={handleSearch}
                data-testid="apply-filters"
                disabled={isSearchButtonDisabled}
              >
                {t("common.search")}
              </Button>
              {isSearchButtonDisabled ? (
                <label className="ml-2 text-gray-300 dark:text-gray-500">
                  {t("balanceHistorySearch.valueFieldEmpty")}
                </label>
              ) : null}
            </div>
          ) : (
            <div />
          )}
          <Button onClick={handleFilterClear} data-testid="clear-filters">
            {t("common.clear")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PowerActivitySearch;
