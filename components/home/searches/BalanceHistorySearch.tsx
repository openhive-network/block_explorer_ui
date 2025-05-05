// *** Operations related code is commented out now ***
// TODO: Remove code in future if it won't be used

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// import useURLParams from "@/hooks/common/useURLParams";
// import OperationTypesDialog from "@/components/OperationTypesDialog";
// import useAccountOperationTypes from "@/hooks/api/accountPage/useAccountOperationTypes";
import { useSearchesContext } from "@/contexts/SearchesContext";
import { cn } from "@/lib/utils";
import { removeStorageItem, getLocalStorage } from "@/utils/LocalStorage";
import { defaultBalanceHistorySearchParams } from "@/pages/balanceHistory/[accountName]";

const COIN_TYPES = ["HIVE", "VESTS", "HBD"];
const DEFAULT_COIN_TYPE = "HIVE";

const BalanceHistorySearch = ({
  paramsState,
  setParams,
  isVisible,
  setIsVisible,
  setIsFiltersActive,
  isFiltersActive,
}: any) => {
  const [coinType, setCoinType] = useState<string>(
    paramsState.coinType ?? DEFAULT_COIN_TYPE
  ); // State to store the selected coin name
  const [includeSavings, setIncludeSavings] = useState<boolean>(
    paramsState.includeSavings ?? false
  );
  const router = useRouter();
  const { searchRanges } = useSearchesContext();
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
    setParams({
      ...paramsState,
      coinType: newCoinType,
      page: undefined, // Reset the page when the coin type changes
      includeSavings: false,
    });
  };

  const handleSavingsChange = () => {
    setIncludeSavings(!includeSavings);
    setParams({
      ...paramsState,
      includeSavings: !includeSavings,
      page: undefined, // Reset the page when the coin type changes
    });
  };

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

    setIsVisible(false);
    setIsFiltersActive(false);

    removeStorageItem("is_balance_filters_visible");
  };

  useEffect(() => {
    Object.keys(defaultBalanceHistorySearchParams).forEach((key) => {
      if (key === "accountName" || key === "page") return;

      const param =
        paramsState[key as keyof typeof defaultBalanceHistorySearchParams];
      const defaultParam =
        defaultBalanceHistorySearchParams[
          key as keyof typeof defaultBalanceHistorySearchParams
        ];

      const visibleFilters =
        (isFiltersActive &&
          getLocalStorage("is_balance_filters_visible", true)) ??
        true;

      if (param !== defaultParam) {
        setIsFiltersActive(true);
        setIsVisible(visibleFilters);
      }
    });

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsState, isFiltersActive]);

  const buttonLabel = `Value field can't be empty`;

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
          {/* Savings checkbox */}
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="includeSavings"
              checked={includeSavings}
              onChange={handleSavingsChange}
              disabled={coinType === "VESTS"}
              className="mr-2 h-4 w-4 accent-blue-500 mt-4"
              data-testid="savings-checkbox"
            />
            <label
              htmlFor="includeSavings"
              className={cn("mt-4", { "text-gray-500": coinType === "VESTS" })}
            >
              Savings
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
            <div>
              <Button
                onClick={handleSearch}
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
              onClick={handleFilterClear}
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
