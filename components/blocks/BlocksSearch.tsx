import React, {
  useState,
  useEffect,
  useCallback,
  SetStateAction,
  Dispatch,
} from "react";
import { useRouter } from "next/router";
import moment from "moment";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import { getOperationButtonTitle } from "@/utils/UI";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  cn,
  convertBooleanArrayToIds,
  convertIdsToBooleanArray,
} from "@/lib/utils";
import { trimAccountName } from "@/utils/StringUtils";
import AutocompleteInput from "@/components/ui/AutoCompleteInput";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import useURLParams from "@/hooks/common/useURLParams";
import useSearchRanges from "@/hooks/common/useSearchRanges";
import NoValueErrorMessage from "../home/searches/NoValueErrorMessage";
import { removeStorageItem, getLocalStorage } from "@/utils/LocalStorage";
import { useI18n } from "@/i18n/i18n";

export const DEFAULT_BLOCKS_SEARCH_PROPS: Explorer.AllBlocksSearchProps = {
  limit: config.standardPaginationSize,
  rangeSelectKey: "none",
  accountName: undefined,
  fromBlock: undefined,
  toBlock: undefined,
  startDate: undefined,
  endDate: undefined,
  lastBlocks: undefined,
  lastTime: undefined,
  timeUnit: "days",
  page: undefined,
  filters: null,
};

const RANGE_PRESETS = [
  { key: "lastHour", value: 1, unit: "hours" },
  { key: "last24h", value: 24, unit: "hours" },
  { key: "last7d", value: 7, unit: "days" },
  { key: "last30d", value: 30, unit: "days" },
] as const;

interface BlocksSearchProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setIsFiltersActive: (newValue: boolean) => void;
  setIsNewSearch: (value: boolean) => void;
  isNewSearch: boolean;
  isFiltersActive: boolean;
  isFromRangeSelection: boolean;
  firstUserSelectedBlock: number | undefined;
}

const BlocksSearch = ({
  isVisible,
  setIsVisible,
  setIsFiltersActive,
  isNewSearch,
  setIsNewSearch,
  isFiltersActive,
  isFromRangeSelection,
  firstUserSelectedBlock,
}: BlocksSearchProps) => {
  const router = useRouter();
  const { t } = useI18n();

  const searchRanges = useSearchRanges(
    DEFAULT_BLOCKS_SEARCH_PROPS.rangeSelectKey
  );

  const { operationsTypes } = useOperationsTypes();

  const { paramsState, setParams } = useURLParams(DEFAULT_BLOCKS_SEARCH_PROPS);

  const [accountName, setAccountName] = useState<string>(
    paramsState.accountName || ""
  );

  useEffect(() => {
    if (!router.isReady) return;
    if (paramsState.accountName) {
      setAccountName(paramsState.accountName);
    }
  }, [router.isReady, paramsState]);

  const [totalPages, setTotalPages] = useState<number | null>(null);

  const handleOperationSelect = useCallback(
    (operationTypes: number[] | null) => {
      const filters = convertIdsToBooleanArray(operationTypes);
      const newParams: Explorer.AllBlocksSearchProps = {
        ...paramsState,
        accountName: accountName ? trimAccountName(accountName) : undefined,
        filters: filters || null,
        page: totalPages !== null ? totalPages : undefined,
        history: undefined,
      };
      setParams(newParams);
      setIsNewSearch(false);
    },
    [paramsState, setParams, totalPages, setIsNewSearch, accountName]
  );

  const {
    getRangesValues,
    setRangesValues,
    setLastTimeUnitValue,
    setRangeSelectKey,
    setTimeUnitSelectKey,
    setFromBlock,
    setToBlock,
    setStartDate,
    setEndDate,
    setLastBlocksValue,
  } = searchRanges;

  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);

  const handleStartBlockSearch = useCallback(async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await getRangesValues();

    setIsNewSearch(true);

    const newParams: Explorer.AllBlocksSearchProps = {
      ...paramsState,
      accountName:
        accountName !== "" ? trimAccountName(accountName) : undefined,
      fromBlock: payloadFromBlock,
      toBlock: payloadToBlock,
      startDate: payloadStartDate,
      endDate: payloadEndDate,
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
      limit: config.standardPaginationSize,
      page: undefined,
      history: undefined,
      firstBlock: undefined,
    };
    setParams(newParams);
  }, [
    accountName,
    setParams,
    paramsState,
    searchRanges,
    getRangesValues,
    setIsNewSearch,
  ]);

  // Builds the payload directly: the setters below have not flushed yet, so
  // getRangesValues() would read stale values.
  const applyPreset = useCallback(
    (value: number, unit: "hours" | "days") => {
      setRangeSelectKey("lastTime");
      setLastTimeUnitValue(value);
      setTimeUnitSelectKey(unit);
      setIsNewSearch(true);

      setParams({
        ...paramsState,
        accountName: accountName ? trimAccountName(accountName) : undefined,
        fromBlock: undefined,
        toBlock: undefined,
        startDate: moment().subtract(value, unit).milliseconds(0).toDate(),
        endDate: undefined,
        lastBlocks: undefined,
        lastTime: value,
        timeUnit: unit,
        rangeSelectKey: "lastTime",
        limit: config.standardPaginationSize,
        page: undefined,
        history: undefined,
        firstBlock: undefined,
      });
    },
    [
      accountName,
      paramsState,
      setParams,
      setIsNewSearch,
      setRangeSelectKey,
      setLastTimeUnitValue,
      setTimeUnitSelectKey,
    ]
  );

  const handleFilterClear = useCallback(() => {
    setIsNewSearch(true);
    const newParams: Explorer.AllBlocksSearchProps = {
      ...DEFAULT_BLOCKS_SEARCH_PROPS,
      page: undefined,
      history: undefined,
      firstBlock: undefined,
    };

    setAccountName("");
    setIsFiltersActive(false);
    setIsVisible(false);
    setParams(newParams);
    setRangesValues(DEFAULT_BLOCKS_SEARCH_PROPS as any);
    setFromBlock(undefined);
    setToBlock(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setLastBlocksValue(undefined);
    setLastTimeUnitValue(undefined);
    setRangeSelectKey("none");
    setParams(DEFAULT_BLOCKS_SEARCH_PROPS);
    removeStorageItem("is_blocks_filters_visible");
  }, [
    setParams,
    setIsVisible,
    setIsFiltersActive,
    setRangesValues,
    setFromBlock,
    setToBlock,
    setStartDate,
    setEndDate,
    setLastBlocksValue,
    setLastTimeUnitValue,
    setRangeSelectKey,
    setIsNewSearch,
  ]);

  const hasActiveFilters = Boolean(
    (paramsState.filters?.length ?? 0) ||
    paramsState.fromBlock ||
    paramsState.toBlock ||
    paramsState.startDate ||
    paramsState.endDate ||
    paramsState.accountName
  );

  // Applying a filter collapses the panel and surfaces the pulsing dot on the
  // Filters toggle instead — a requested behaviour, not a bug. Leave it alone.
  useEffect(() => {
    setIsFiltersActive(hasActiveFilters);

    if (hasActiveFilters) {
      const persisted = getLocalStorage("is_blocks_filters_visible", true);
      setIsVisible(persisted);
    } else {
      setIsVisible(false);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActiveFilters]);

  //When we are in Block Range we need to preserve the firstBlock
  useEffect(() => {
    if (
      isFromRangeSelection === true &&
      firstUserSelectedBlock &&
      paramsState.rangeSelectKey == "blockRange" &&
      !isNewSearch
    ) {
      searchRanges.setToBlock(firstUserSelectedBlock);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFromRangeSelection, firstUserSelectedBlock, searchRanges]);

  return (
    <>
      <Card
        className={cn(
          "mb-4 overflow-hidden transition-all duration-500 ease-in max-h-0 opacity-0",
          {
            "max-h-fit opacity-100 overflow-visible": isVisible,
          }
        )}
      >
        <CardHeader>
          <CardTitle className="text-start text-xl">
            {t("common.filters")}
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-fit">
          <div className="flex flex-col mb-4">
            <AutocompleteInput
              value={accountName}
              onChange={setAccountName}
              placeholder={t("accountSearch.accountName")}
              inputType="account_name"
              className="bg-theme border-0 border-b-2 w-1/2"
            />
          </div>
          <div className="mb-4 flex w-full flex-col gap-y-2">
            <Label className="text-xs">{t("blocksPage.presets.label")}</Label>
            <div className="flex flex-wrap gap-1.5">
              {RANGE_PRESETS.map((preset) => {
                const active =
                  paramsState.rangeSelectKey === "lastTime" &&
                  paramsState.lastTime === preset.value &&
                  paramsState.timeUnit === preset.unit;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    data-testid={`range-preset-${preset.key}`}
                    onClick={() => applyPreset(preset.value, preset.unit)}
                    aria-pressed={active}
                    className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                      active
                        ? "border-indigo-500 bg-indigo-500 text-white"
                        : "border-gray-300 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-indigo-950/50"
                    }`}
                  >
                    {t(`blocksPage.presets.${preset.key}`)}
                  </button>
                );
              })}
            </div>
          </div>
          <SearchRanges
            rangesProps={searchRanges}
            setIsSearchButtonDisabled={setIsSearchButtonDisabled}
          />
          <div className="flex items-center mb-4">
            <OperationTypesDialog
              operationTypes={operationsTypes}
              selectedOperations={convertBooleanArrayToIds(
                paramsState.filters ?? []
              )}
              setSelectedOperations={handleOperationSelect}
              buttonClassName="bg-gray-500"
              triggerTitle={getOperationButtonTitle(
                convertBooleanArrayToIds(paramsState.filters ?? []),
                operationsTypes
              )}
            />
          </div>
          <div className="flex justify-between mt-2">
            <div>
              <Button
                data-testid="block-search-btn"
                onClick={handleStartBlockSearch}
                disabled={isSearchButtonDisabled}
              >
                {t("common.search")}
              </Button>
              <NoValueErrorMessage
                accountName={true}
                isSearchButtonDisabled={isSearchButtonDisabled}
              />
            </div>
            <Button
              onClick={handleFilterClear}
              data-testid="clear-filters"
              className="ml-2"
            >
              <span>{t("common.clear")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default BlocksSearch;
