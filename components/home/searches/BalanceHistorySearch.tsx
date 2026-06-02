// *** Operations related code is commented out now ***
// TODO: Remove code in future if it won't be used

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";

// import useURLParams from "@/hooks/common/useURLParams";
// import OperationTypesDialog from "@/components/OperationTypesDialog";
// import useAccountOperationTypes from "@/hooks/api/accountPage/useAccountOperationTypes";
import { useSearchesContext } from "@/contexts/SearchesContext";
import { cn } from "@/lib/utils";
import { removeStorageItem, getLocalStorage } from "@/utils/LocalStorage";
import { defaultBalanceHistorySearchParams } from "@/components/account/tabs/balanceHistory/balanceHistoryParams";
import { useI18n } from "@/i18n/i18n";

export const DEFAULT_COIN_TYPE = "HIVE";

type CoinOption = {
  key: "HIVE" | "VESTS" | "HP" | "HBD";
  coinType: string;
  unit?: "vests" | "hp";
};

const COIN_OPTIONS: CoinOption[] = [
  { key: "HIVE", coinType: "HIVE" },
  { key: "VESTS", coinType: "VESTS", unit: "vests" },
  { key: "HP", coinType: "VESTS", unit: "hp" },
  { key: "HBD", coinType: "HBD" },
];

const BalanceHistorySearch = ({
  paramsState,
  setParams,
  isVisible,
  setIsVisible,
  setIsFiltersActive,
  isFiltersActive,
  coinType,
  setCoinType,
  unit,
  setUnit,
  showCustomRange,
  setShowCustomRange,
}: any) => {
  const { t } = useI18n();
  // const [coinType, setCoinType] = useState<string>(
  //   paramsState.coinType ?? DEFAULT_COIN_TYPE
  // ); // State to store the selected coin name
  const [includeSavings, setIncludeSavings] = useState<string>(
    paramsState.includeSavings
  );
  const router = useRouter();
  const { searchRanges } = useSearchesContext();
  const { checkTemporaryHeadBlockNumber } = useHeadBlockNumber();
  const accountNameFromRoute = (router.query.accountName as string)?.slice(1);
  // const { accountOperationTypes } =
  //   useAccountOperationTypes(accountNameFromRoute);
  // const [selectedOperationTypes, setSelectedOperationTypes] = useState<
  //   number[]
  // >([]);
  // const [singleOperationTypeId, setSingleOperationTypeId] = useState<
  //   number | undefined
  // >(undefined);
  // const [fieldContent, setFieldContent] = useState<string>("");
  // const [selectedKeys, setSelectedKeys] = useState<string[] | undefined>(
  //   undefined
  // );
  // const [selectedIndex, setSelectedIndex] = useState<string>("");

  // const changeSelectedOperationTypes = (operationTypesIds: number[]) => {
  //   if (operationTypesIds.length === 1) {
  //     setSingleOperationTypeId(operationTypesIds[0]);
  //   } else {
  //     setSingleOperationTypeId(undefined);
  //   }
  //   setSelectedKeys(undefined);
  //   setFieldContent("");
  //   setSelectedOperationTypes(operationTypesIds);
  // };

  // const {
  //   filters: filtersParam,
  //   fromBlock: fromBlockParam,
  //   toBlock: toBlockParam,
  //   fromDate: fromDateParam,
  //   toDate: toDateParam,
  //   lastBlocks: lastBlocksParam,
  //   timeUnit: timeUnitParam,
  //   lastTime: lastTimeParam,
  //   rangeSelectKey,
  //   page,
  // } = paramsState;

  // const [initialSearch, setInitialSearch] = useState<boolean>(false);
  // const [filters, setFilters] = useState<boolean[] | undefined>(undefined);
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);

  const handleSearch = async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await searchRanges.getRangesValues();

    const props = {
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
    };

    setParams(props);
  };

  const handleCoinTypeChange = (newCoinType: string) => {
    setCoinType(newCoinType);
    let paramsUpdate = {
      ...paramsState,
      coinType: newCoinType,
      page: undefined,
    };

    if (newCoinType === "VESTS") {
      paramsUpdate.includeSavings = "no";
      setIncludeSavings("no");
    } else {
      paramsUpdate.includeSavings = "yes";
      setIncludeSavings("yes");
    }

    setParams(paramsUpdate);
  };

  const handleCoinOptionChange = (option: CoinOption) => {
    if (option.unit && setUnit) setUnit(option.unit);
    handleCoinTypeChange(option.coinType);
  };

  const activeCoinKey: CoinOption["key"] =
    coinType === "VESTS"
      ? unit === "hp"
        ? "HP"
        : "VESTS"
      : (coinType as "HIVE" | "HBD");

  const handleSavingsChange = () => {
    setIncludeSavings(includeSavings == "yes" ? "no" : "yes");
    setParams({
      ...paramsState,
      includeSavings: includeSavings == "yes" ? "no" : "yes",
      page: undefined, // Reset the page when the coin type changes
    });
  };

  type DatePreset = {
    label: string;
    lastTime?: number;
    timeUnit?: "days" | "weeks" | "months";
    lastBlocks?: number;
    custom?: boolean;
  };

  const [pendingPresetLabel, setPendingPresetLabel] = useState<string | null>(
    null
  );

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

    const baseParams = {
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

  const datePresets: DatePreset[] = [
    { label: "1k blocks", lastBlocks: 1000 },
    { label: "7d", lastTime: 7, timeUnit: "days" },
    { label: "30d", lastTime: 30, timeUnit: "days" },
    { label: "90d", lastTime: 90, timeUnit: "days" },
    { label: "1y", lastTime: 12, timeUnit: "months" },
    { label: "All" },
    { label: "Custom", custom: true },
  ];

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
  }, []);

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

  const handleFilterClear = () => {
    const {
      setRangeSelectKey,
      setTimeUnitSelectKey,
      setLastTimeUnitValue,
      setLastBlocksValue,
    } = searchRanges;

    const props = {
      ...defaultBalanceHistorySearchParams,
      accountName: accountNameFromRoute,
      coinType: DEFAULT_COIN_TYPE,
    };

    setParams(props);

    setRangeSelectKey("none");
    setTimeUnitSelectKey("days");
    setLastTimeUnitValue(30);
    setLastBlocksValue(1000);
    setCoinType(DEFAULT_COIN_TYPE);
    setIncludeSavings("yes");

    setIsVisible(false);
    setIsFiltersActive(false);
    setShowCustomRange(false);
    setPendingPresetLabel(null);

    removeStorageItem("is_balance_filters_visible");
  };

  const hasActiveFilters = Boolean(
    (paramsState.filters?.length ?? 0) ||
    paramsState.fromBlock ||
    paramsState.toBlock ||
    paramsState.fromDate ||
    paramsState.toDate ||
    paramsState.coinType !== DEFAULT_COIN_TYPE ||
    paramsState.includeSavings !== "yes"
  );

  useEffect(() => {
    setIsFiltersActive(hasActiveFilters);

    if (hasActiveFilters) {
      const persisted = getLocalStorage("is_balance_filters_visible", true);
      setIsVisible(persisted);
    } else {
      setIsVisible(false);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActiveFilters]);

  const buttonLabel = t("balanceHistorySearch.valueFieldEmpty");

  return (
    <>
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
              {t("balanceHistorySearch.coin")}:
            </span>
            <div
              className="inline-flex items-stretch self-start rounded-full border border-navbar-border overflow-hidden"
              role="group"
              aria-label={t("balanceHistorySearch.coinTypeAria")}
            >
              {COIN_OPTIONS.map((option, idx) => {
                const isActive = activeCoinKey === option.key;
                const isFirst = idx === 0;
                const isLast = idx === COIN_OPTIONS.length - 1;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleCoinOptionChange(option)}
                    aria-pressed={isActive}
                    data-testid={`balance-coin-type-${option.key.toLowerCase()}`}
                    className={cn(
                      "px-2 py-1 text-xs sm:px-4 sm:text-sm font-medium whitespace-nowrap transition-colors",
                      !isLast && "border-r border-navbar-border",
                      isFirst && "rounded-l-full",
                      isLast && "rounded-r-full",
                      isActive
                        ? "bg-blue-500 text-white"
                        : "bg-theme hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    {option.key}
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
              className="inline-flex items-stretch self-start rounded-full border border-navbar-border overflow-hidden"
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
                      "px-2 py-1 text-xs sm:px-4 sm:text-sm font-medium whitespace-nowrap transition-colors",
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
          <div className="flex items-center mb-3 mt-4">
            <input
              type="checkbox"
              id="includeSavings"
              checked={includeSavings == "yes" ? true : false}
              onChange={handleSavingsChange}
              disabled={coinType === "VESTS"}
              className="mr-2 h-4 w-4 accent-blue-500"
              data-testid="savings-checkbox"
            />
            <label
              htmlFor="includeSavings"
              className={cn({ "text-gray-500": coinType === "VESTS" })}
            >
              {t("balanceHistorySearch.savings")}
            </label>
          </div>
          {/* Operations Types commented for now
          <div className="flex items-center mb-10 mt-2">
        <OperationTypesDialog
          operationTypes={accountOperationTypes}
          selectedOperations={selectedOperationTypes}
          setSelectedOperations={/*changeSelectedOperationTypes}
          buttonClassName="bg-gray-500"
          triggerTitle={/*getOperationButtonTitle(
            selectedOperationTypes,
            accountOperationTypes
          )}
        />
      </div> */}
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
                  <label className="ml-2 text-gray-300 dark:text-gray-500 ">
                    {buttonLabel}
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
    </>
  );
};

export default BalanceHistorySearch;
