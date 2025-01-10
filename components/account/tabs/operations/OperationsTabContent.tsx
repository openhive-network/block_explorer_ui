// TODO: This component should be investigated and rebuild in more simple way.
// Possible improvements: handleSearch function , reduce count of use effects.
// I believe we could use much less code and export what is nacessary to other components or utils functions and leave component less crowded than it is now

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";

import SearchRanges from "@/components/searchRanges/SearchRanges";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import OperationsTable from "@/components/OperationsTable";
import useURLParams from "@/hooks/common/useURLParams";
import useSearchRanges from "@/hooks/common/useSearchRanges";
import { defaultSearchParams } from "@/pages/[accountName]";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import {
  convertBooleanArrayToIds,
  convertOperationResultsToTableOperations,
} from "@/lib/utils";
import Hive from "@/types/Hive";
import AccountPagination from "../../AccountPagination";
import useAccountOperations from "@/hooks/api/accountPage/useAccountOperations";

interface OpeationTabContentProps {
  liveDataEnabled: boolean;
}

const OperationTabContent: React.FC<OpeationTabContentProps> = ({
  liveDataEnabled,
}) => {
  const router = useRouter();
  const searchRanges = useSearchRanges();

  const { paramsState, setParams } = useURLParams(
    {
      ...defaultSearchParams,
    },
    ["accountName"]
  );

  const [filters, setFilters] = useState<boolean[]>([]);
  const [initialSearch, setInitialSearch] = useState<boolean>(false);
  const [lastPage, setLastPage] = useState<number | undefined>(undefined);

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

  const accountNameFromRoute = (router.query.accountName as string)?.replace(
    "@",
    ""
  );
  const accountOperationsProps = {
    accountName: accountNameFromRoute,
    operationTypes: filtersParam.length
      ? convertBooleanArrayToIds(filtersParam)
      : undefined,
    pageNumber: paramsState.page,
    fromBlock: fromBlockParam,
    toBlock: toBlockParam,
    startDate: fromDateParam,
    endDate: toDateParam,
  };
  const { accountOperations, isAccountOperationsLoading } =
    useAccountOperations(accountOperationsProps, liveDataEnabled);

  const formattedAccountOperations = useOperationsFormatter(
    accountOperations
  ) as Hive.AccountOperationsResponse;

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

  const handleOperationTypeChange = (newFilters: boolean[]) => {
    setFilters(newFilters);
    setParams({ ...paramsState, filters: newFilters, page: undefined });
  };

  const buildOperationView = () => {
    if (!isAccountOperationsLoading && !accountOperations?.total_operations) {
      return (
        <div className="w-full my-4 text-text text-center">
          No operations were found.
        </div>
      );
    } else if (isAccountOperationsLoading) {
      return (
        <div className="flex justify-center text-center items-center">
          <Loader2 className="animate-spin mt-1 text-text h-12 w-12 ml-3 ..." />
        </div>
      );
    } else {
      return (
        <div>
          <div
            className={
              "flex justify-center items-center text-text my-4 sticky z-20 bg-explorer-bg-start top-16"
            }
          >
            {accountOperations && (page || lastPage) && (
              <AccountPagination
                accountName={accountNameFromRoute}
                page={page ? page : lastPage || 0}
                setPage={(page: number | undefined) =>
                  setParams({ ...paramsState, page })
                }
                accountOperations={accountOperations}
                onOperationsSelect={handleOperationTypeChange}
                selectedFilters={filters}
              />
            )}
          </div>

          <OperationsTable
            operations={convertOperationResultsToTableOperations(
              formattedAccountOperations?.operations_result || []
            )}
            unformattedOperations={convertOperationResultsToTableOperations(
              accountOperations?.operations_result || []
            )}
          />
        </div>
      );
    }
  };

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
      if (!initialSearch && !isAccountOperationsLoading && accountOperations) {
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

  useEffect(() => {
    if (!page && accountOperations) {
      setLastPage(accountOperations.total_pages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountOperations, page]);

  useEffect(() => {
    if (paramsState && !initialSearch) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsState]);

  useEffect(() => {
    if (
      router.query.page &&
      accountOperations &&
      (Number(router.query.page) <= 0 ||
        Number(router.query.page) > accountOperations.total_pages)
    ) {
      router.replace({
        query: {
          ...router.query,
          page: accountOperations.total_pages,
        },
      });
    }
  }, [router, accountOperations]);

  return (
    <TabsContent value="operations">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Ranges</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchRanges rangesProps={searchRanges} />
          <div className="flex items-center justify-between m-2">
            <Button
              onClick={() => handleSearch(true)}
              data-testid="apply-filters"
            >
              <span>Apply filters</span>{" "}
            </Button>
            <Button
              onClick={handleFilterClear}
              data-testid="clear-filters"
            >
              <span>Clear filters</span>{" "}
            </Button>
          </div>
        </CardContent>
      </Card>
      {buildOperationView()}
    </TabsContent>
  );
};

export default OperationTabContent;
