import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import { getOperationButtonTitle } from "@/utils/UI";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { trimAccountName } from "@/utils/StringUtils";
import AutocompleteInput from "@/components/ui/AutoCompleteInput";
import { useSearchesContext } from "@/contexts/SearchesContext";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import FilterSectionToggle from "../account/FilterSectionToggle";
import useURLParams from "@/hooks/common/useURLParams";
import useSearchRanges from "@/hooks/common/useSearchRanges";
import NoValueErrorMessage from "../home/searches/NoValueErrorMessage";

const DEFAULT_BLOCKS_SEARCH_PROPS: Partial<Explorer.AllBlocksSearchProps> = {
  limit: config.standardPaginationSize,
  rangeSelectKey: "none",
  accountName: undefined,
  operationTypes: undefined,
  fromBlock: undefined,
  toBlock: undefined,
  startDate: undefined,
  endDate: undefined,
  lastBlocks: undefined,
  lastTime: undefined,
  timeUnit: "days",
};

const BlocksSearch = ({
  isBlocksFilterSectionVisible,
  setIsFiltersActive,
}: any) => {
  const router = useRouter();
  const { allBlocksSearchProps, setAllBlocksSearchProps } =
    useSearchesContext();

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
    if (!router.isReady || !router.query.accountName) return;
    const accounNameFromRoute = trimAccountName(
      router.query.accountName as string
    );
    setAccountName(accounNameFromRoute);
  }, [router.isReady, router.query.accountName]);

  const [selectedOperationTypes, setSelectedOperationTypes] = useState<
    number[] | null
  >(
    paramsState.operationTypes
      ? Array.isArray(paramsState.operationTypes)
        ? paramsState.operationTypes
        : [paramsState.operationTypes]
      : null
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

  const [isVisible, setIsVisible] = useState(false);
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);

  const changeSelectedOperationTypes = useCallback(
    (operationTypesIds: number[] | null) => {
      setSelectedOperationTypes(operationTypesIds);
      setAllBlocksSearchProps(
        (prev: Explorer.AllBlocksSearchProps | undefined) => {
          return {
            ...prev,
            operationTypes: operationTypesIds,
            limit: config.standardPaginationSize,
            page: undefined,
          };
        }
      );
    },
    [setAllBlocksSearchProps]
  );

  const handleStartBlockSearch = useCallback(async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await getRangesValues();

    const allBlocksSearchProps = {
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
    };

    setAllBlocksSearchProps(allBlocksSearchProps);
    setRangesValues(allBlocksSearchProps as any);
    setParams(allBlocksSearchProps);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    accountName,
    selectedOperationTypes,
    getRangesValues,
    setAllBlocksSearchProps,
    setParams,
    searchRanges.rangeSelectKey,
    searchRanges.timeUnitSelectKey,
    searchRanges.lastBlocksValue,
    searchRanges.lastTimeUnitValue,
    setRangesValues,
  ]);

  const handleFilterClear = useCallback(() => {
    setAccountName("");
    setSelectedOperationTypes(null);
    setAllBlocksSearchProps(undefined);
    setIsFiltersActive(false);
    setRangesValues(DEFAULT_BLOCKS_SEARCH_PROPS as any);
    setFromBlock(undefined);
    setToBlock(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setLastBlocksValue(undefined);
    setLastTimeUnitValue(undefined);
    setRangeSelectKey("none");
    setTimeUnitSelectKey(undefined);
    setParams(DEFAULT_BLOCKS_SEARCH_PROPS);
  }, [
    setAllBlocksSearchProps,
    setRangesValues,
    setParams,
    setFromBlock,
    setToBlock,
    setStartDate,
    setEndDate,
    setLastBlocksValue,
    setLastTimeUnitValue,
    setRangeSelectKey,
    setTimeUnitSelectKey,
    setIsFiltersActive,
  ]);

  useEffect(() => {
    let filtersActive = false;

    Object.keys(DEFAULT_BLOCKS_SEARCH_PROPS).forEach((key) => {
      if (key === "limit") return;

      const param =
        paramsState[key as keyof typeof DEFAULT_BLOCKS_SEARCH_PROPS];
      const defaultParam =
        DEFAULT_BLOCKS_SEARCH_PROPS[
          key as keyof typeof DEFAULT_BLOCKS_SEARCH_PROPS
        ];

      if (param !== defaultParam) {
        filtersActive = true;
      }
    });

    setIsFiltersActive(filtersActive);
    setIsVisible(filtersActive);
  }, [paramsState, setIsFiltersActive]);

  return (
    <>
      <Card
        className={cn(
          "mb-4 overflow-hidden transition-all duration-500 ease-in max-h-0 opacity-0",
          {
            "max-h-fit opacity-100": isBlocksFilterSectionVisible,
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
              selectedOperations={selectedOperationTypes || []}
              setSelectedOperations={changeSelectedOperationTypes}
              buttonClassName="bg-gray-500"
              triggerTitle={getOperationButtonTitle(
                selectedOperationTypes,
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
