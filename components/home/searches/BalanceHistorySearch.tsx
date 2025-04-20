import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import useURLParams from "@/hooks/common/useURLParams";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import useAccountOperationTypes from "@/hooks/api/accountPage/useAccountOperationTypes";
import { useSearchesContext } from "@/contexts/SearchesContext";
import { cn } from "@/lib/utils";

interface AccountSearchParams {
  accountName?: string | undefined;
  fromBlock: number | undefined;
  toBlock: number | undefined;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  lastBlocks: number | undefined;
  lastTime: number | undefined;
  timeUnit: string | undefined;
  rangeSelectKey: string | undefined;
  page: number | undefined;
  filters: boolean[] | undefined;
  coinType?: string;
}

const defaultSearchParams: AccountSearchParams = {
  accountName: undefined,
  fromBlock: undefined,
  toBlock: undefined,
  fromDate: undefined,
  toDate: undefined,
  lastBlocks: undefined,
  lastTime: 30,
  timeUnit: "days",
  rangeSelectKey: "lastTime",
  page: undefined,
  filters: undefined,
  coinType: "HIVE", // Default to HIVE
};

const COIN_TYPES = ["HIVE", "VESTS", "HBD"];

const BalanceHistorySearch = ({
  paramsState,
  setParams,
  isBalanceFilterSectionVisible,
  setIsFiltersActive,
}: any) => {
  const [coinType, setCoinType] = useState<string>(
    paramsState.coinType ?? "HIVE"
  ); // State to store the selected coin name
  const router = useRouter();
  const { searchRanges } = useSearchesContext();
  const accountNameFromRoute = (router.query.accountName as string)?.slice(1);
  const { accountOperationTypes } =
    useAccountOperationTypes(accountNameFromRoute);
  const [selectedOperationTypes, setSelectedOperationTypes] = useState<
    number[]
  >([]);
  const [singleOperationTypeId, setSingleOperationTypeId] = useState<
    number | undefined
  >(undefined);
  const [fieldContent, setFieldContent] = useState<string>("");
  const [selectedKeys, setSelectedKeys] = useState<string[] | undefined>(
    undefined
  );
  const [selectedIndex, setSelectedIndex] = useState<string>("");

  const changeSelectedOperationTypes = (operationTypesIds: number[]) => {
    if (operationTypesIds.length === 1) {
      setSingleOperationTypeId(operationTypesIds[0]);
    } else {
      setSingleOperationTypeId(undefined);
    }
    setSelectedKeys(undefined);
    setFieldContent("");
    setSelectedOperationTypes(operationTypesIds);
  };

  const {
    filters: filtersParam,
    fromBlock: fromBlockParam,
    toBlock: toBlockParam,
    fromDate: fromDateParam,
    toDate: toDateParam,
    lastBlocks: lastBlocksParam,
    timeUnit: timeUnitParam,
    lastTime: lastTimeParam,
    rangeSelectKey,
    page,
  } = paramsState;

  const [initialSearch, setInitialSearch] = useState<boolean>(false);
  const [filters, setFilters] = useState<boolean[] | undefined>(undefined);
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);

  const handleSearch = async (resetPage?: boolean) => {
    if (
      !initialSearch &&
      (!!fromDateParam ||
        !!toDateParam ||
        !!fromBlockParam ||
        !!toBlockParam ||
        !!lastBlocksParam ||
        !!lastTimeParam ||
        !!filtersParam?.length)
    ) {
      fromDateParam && searchRanges.setStartDate(fromDateParam);
      toDateParam && searchRanges.setEndDate(toDateParam);
      fromBlockParam && searchRanges.setFromBlock(fromBlockParam);
      toBlockParam && searchRanges.setToBlock(toBlockParam);
      lastBlocksParam && searchRanges.setLastBlocksValue(lastBlocksParam);
      timeUnitParam && searchRanges.setTimeUnitSelectKey(timeUnitParam);
      rangeSelectKey && searchRanges.setRangeSelectKey(rangeSelectKey);
      searchRanges.setLastTimeUnitValue(lastTimeParam);
      setFilters(filtersParam);
      setInitialSearch(true);
    } else {
      if (!initialSearch) {
        setInitialSearch(true);
      }

      const {
        payloadFromBlock,
        payloadToBlock,
        payloadStartDate,
        payloadEndDate,
      } = await searchRanges.getRangesValues();

      setParams({
        ...paramsState,
        filters: filters,
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
        page: resetPage ? undefined : page,
      });
    }
  };

  const handleCoinTypeChange = (newCoinType: string) => {
    setCoinType(newCoinType);
    setParams({
      ...paramsState,
      coinType: newCoinType,
      page: undefined, // Reset the page when the coin type changes
    });
  };

  const handleFilterClear = () => {
    const newPage = rangeSelectKey !== "none" ? undefined : page;
    setParams({
      ...defaultSearchParams,
      accountName: accountNameFromRoute,
      page: newPage,
      lastTime: undefined,
      rangeSelectKey: "none",
      timeUnit: undefined,
    });
    setIsFiltersActive(false);
    searchRanges.setRangeSelectKey("none");
    searchRanges.setTimeUnitSelectKey("days");
    searchRanges.setLastTimeUnitValue(undefined);
    setFilters([]);
  };

  useEffect(() => {
    if (paramsState.coinType) {
      setCoinType(paramsState.coinType);
    }
    if (paramsState && !initialSearch) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsState]);

  useEffect(() => {
    let filtersActive = false;
    Object.keys(defaultSearchParams).forEach((key) => {
      if (key === "accountName" || key === "page") return;

      const param = paramsState[key as keyof typeof defaultSearchParams];
      const defaultParam =
        defaultSearchParams[key as keyof typeof defaultSearchParams];

      if (param !== defaultParam) {
        filtersActive = true;
      }
    });
    setIsFiltersActive(filtersActive);
  }, [paramsState, setIsFiltersActive]);

  const buttonLabel = `Value field can't be empty`;

  return (
    <>
      <Card
        className={cn(
          "mb-4 overflow-hidden transition-all duration-500 ease-in max-h-0 opacity-0 mt-4",
          {
            "max-h-full opacity-100": isBalanceFilterSectionVisible,
          }
        )}
      >
        <CardHeader>
          <CardTitle className="">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-3">
            <select
              value={coinType}
              onChange={(e) => handleCoinTypeChange(e.target.value)}
              className="w-[180px] border border-gray-300 p-2 rounded bg-theme dark:bg-theme"
            >
              {COIN_TYPES.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>
          </div>
          <SearchRanges
            rangesProps={searchRanges}
            setIsSearchButtonDisabled={setIsSearchButtonDisabled}
          />
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
            <div>
              <Button
                onClick={() => handleSearch(true)}
                data-testid="apply-filters"
                disabled={isSearchButtonDisabled}
              >
                Search{" "}
              </Button>
              {isSearchButtonDisabled ? (
                <label className="ml-2 text-gray-300 dark:text-gray-500 ">
                  {buttonLabel}
                </label>
              ) : null}
            </div>
            <Button
              onClick={() => handleFilterClear()}
              data-testid="clear-filters"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default BalanceHistorySearch;