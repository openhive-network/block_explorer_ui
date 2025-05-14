import React, {
  useState,
  useEffect,
  useCallback,
  SetStateAction,
  Dispatch,
} from "react";
import { useRouter } from "next/router";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import { getOperationButtonTitle } from "@/utils/UI";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { Button } from "@/components/ui/button";
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

interface BlocksSearchProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setIsFiltersActive: (newValue: boolean) => void;
  setInitialToBlock: (toBlock: number | undefined) => void;
  setIsNewSearch: (value: boolean) => void;
  isFiltersActive: boolean;
  isFromRangeSelection: boolean;
  firstUserSelectedBlock: number | undefined;
}

const BlocksSearch = ({
  isVisible,
  setIsVisible,
  setIsFiltersActive,
  setInitialToBlock,
  setIsNewSearch,
  isFiltersActive,
  isFromRangeSelection,
  firstUserSelectedBlock,
}: BlocksSearchProps) => {
  const router = useRouter();

  const searchRanges = useSearchRanges(
    DEFAULT_BLOCKS_SEARCH_PROPS.rangeSelectKey
  );

  const { operationsTypes } = useOperationsTypes();

  // Use URL params hook
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

    setInitialToBlock(undefined); // Reset initialToBlock on new search
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
      history:undefined,
    };
    setParams(newParams);
  }, [
    accountName,
    setParams,
    paramsState,
    searchRanges,
    setInitialToBlock,
    getRangesValues,
    setIsNewSearch,
  ]);

  const handleFilterClear = useCallback(() => {
    setIsNewSearch(true);
    setInitialToBlock(undefined); // Reset initialToBlock on clear
    const newParams: Explorer.AllBlocksSearchProps = {
      ...DEFAULT_BLOCKS_SEARCH_PROPS,
      page: undefined,
      history:undefined,
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
    setInitialToBlock,
    setIsNewSearch,
  ]);

  useEffect(() => {
    Object.keys(DEFAULT_BLOCKS_SEARCH_PROPS).forEach((key) => {
      if (key === "limit" || key === "page" || key === "toBlock") return;

      const param =
        paramsState[key as keyof typeof DEFAULT_BLOCKS_SEARCH_PROPS];
      const defaultParam =
        DEFAULT_BLOCKS_SEARCH_PROPS[
          key as keyof typeof DEFAULT_BLOCKS_SEARCH_PROPS
        ];

      const visibleFilters =
        (isFiltersActive &&
          getLocalStorage("is_blocks_filters_visible", true)) ??
        true;

      if (param !== defaultParam) {
        setIsFiltersActive(true);
        setIsVisible(visibleFilters);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsState, isFiltersActive]);

  useEffect(() => {
    if (isFromRangeSelection === true && firstUserSelectedBlock) {
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
            "max-h-fit opacity-100": isVisible,
          }
        )}
      >
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="max-h-fit">
          <div className="flex flex-col mb-4">
            <AutocompleteInput
              value={accountName}
              onChange={setAccountName}
              placeholder="Account name"
              inputType="account_name"
              className="bg-theme border-0 border-b-2 w-1/2"
            />
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
                Search
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
              <span>Clear</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default BlocksSearch;
