import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import useSearchRanges from "@/hooks/common/useSearchRanges";
import useURLParams from "@/hooks/common/useURLParams";

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
  filters: boolean[];
  coinType?: string; 
}

const defaultSearchParams: AccountSearchParams = {
  accountName: undefined,
  fromBlock: undefined,
  toBlock: undefined,
  fromDate: undefined,
  toDate: undefined,
  lastBlocks: undefined,
  lastTime: undefined,
  timeUnit: "days",
  rangeSelectKey: "none",
  page: undefined,
  filters: [],
  coinType: "HIVE", // Default to HIVE
};

const BalanceHistorySearch = () => {
  const [coinType, setCoinType] = useState<string>("HIVE"); // State to store the selected coin name
  const COIN_TYPES = ["HIVE", "VESTS", "HBD"];
  const router = useRouter();
  const accountNameFromRoute = (router.query.accountName as string)?.slice(1);

  const { paramsState, setParams } = useURLParams(
    {
      ...defaultSearchParams,
    },
    ["accountName"]
  );

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
  const [filters, setFilters] = useState<boolean[]>([]);
 

  const searchRanges = useSearchRanges();

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
    setParams({ ...paramsState, coinType: newCoinType });
    
  };

  const handleFilterClear = () => {
    const newPage = rangeSelectKey !== "none" ? undefined : page;
    setParams({
      ...defaultSearchParams,
      accountName: accountNameFromRoute,
      page: newPage,
    });
    searchRanges.setRangeSelectKey("none");
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


  return (
    <>
      <p className="m-2 mb-6 mt-6">
        Find balance history of given account by coin and range.
      </p>
     
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-3">
              <select
                value={coinType}
                onChange={(e) => handleCoinTypeChange(e.target.value)}
                className="w-[180px] border border-gray-300 p-2 rounded bg-theme dark:bg-theme"
              >
                {COIN_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            
          </div>
          <SearchRanges rangesProps={searchRanges} />
          <div className="flex items-center justify-between m-2">
            <Button onClick={() => handleSearch(true)} data-testid="apply-filters">
              <span>Apply filters</span>
            </Button>
            <Button onClick={() => handleFilterClear()} data-testid="clear-filters">
              <span>Clear filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default BalanceHistorySearch;
