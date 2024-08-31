import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useAccountDetails from "@/api/accountPage/useAccountDetails";
import useAccountOperations from "@/api/accountPage/useAccountOperations";
import AccountPagination from "@/components/account/AccountTopBar";
import useAccountOperationTypes from "@/api/accountPage/useAccountOperationTypes";
import {
  useMediaQuery,
  useOperationsFormatter,
  useURLParams,
} from "@/utils/Hooks";
import { Loader2, ArrowBigRightDash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Hive from "@/types/Hive";
import useSearchRanges from "@/components/searchRanges/useSearchRanges";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import ScrollTopButton from "@/components/ScrollTopButton";
import Head from "next/head";
import OperationsTable from "@/components/OperationsTable";
import {
  cn,
  convertBooleanArrayToIds,
  convertOperationResultsToTableOperations,
} from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AccountDetailsSection from "@/components/account/AccountDetailsSection";
import MobileAccountNameCard from "@/components/account/MobileAccountNameCard";

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
};

export default function Account() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const accountNameFromRoute = (router.query.accountName as string)?.slice(1);
  const [liveDataEnabled, setLiveDataEnabled] = useState(false);

  const changeLiveRefresh = () => {
    setLiveDataEnabled((prev) => !prev);
  };

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
  const [lastPage, setLastPage] = useState<number | undefined>(undefined);
  const [showMobileAccountDetails, setShowMobileAccountDetails] =
    useState(false);

  const searchRanges = useSearchRanges();

  const { accountDetails, notFound } = useAccountDetails(accountNameFromRoute, liveDataEnabled);
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
  }
  const { accountOperations, isAccountOperationsLoading, refetchAccountOperations } =
    useAccountOperations(accountOperationsProps, liveDataEnabled);
  const { accountOperationTypes } =
  useAccountOperationTypes(accountNameFromRoute);

  const formattedAccountOperations = useOperationsFormatter(
    accountOperations
  ) as Hive.AccountOperationsResponse;

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

  useEffect(() => {
    if (!paramsState.page && accountOperations) {
      setLastPage(accountOperations.total_pages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountOperations, paramsState.page]);

  useEffect(() => {
    if (paramsState && !initialSearch) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsState]);

  const renderAccountDetailsView = () => {
    if (isMobile) {
      return (
        <>
          <div className="fixed pl-0 left-0 top-[50%] z-50">
            <Button
              className="flex justify-center bg-explorer-orange h-[100px] w-[40px] hover:bg-orange-300 align-center [writing-mode:vertical-lr] text-explorer-dark-gray rounded-r"
              onClick={() => setShowMobileAccountDetails(true)}
            >
              <ArrowBigRightDash size={30} />
            </Button>
          </div>

          <div
            className={cn(
              "fixed top-0 left-0 p-5 bg-explorer-dark-gray w-full h-full -translate-x-full duration-500 z-50 overflow-auto",
              { "-translate-x-0": showMobileAccountDetails }
            )}
          >
            <div className="w-full flex items-center justify-end">
              <X
                onClick={() => setShowMobileAccountDetails(false)}
                height={40}
                width={40}
                className="cursor-pointer"
              />
            </div>
            <AccountDetailsSection accountName={accountNameFromRoute} refetchAccountOperations={refetchAccountOperations} liveDataEnabled={liveDataEnabled}
  changeLiveRefresh={changeLiveRefresh}/>
          </div>
        </>
      );
    } else {
      return (
        <div className="col-start-1 col-span-1 flex flex-col gap-y-2">
          <AccountDetailsSection accountName={accountNameFromRoute} refetchAccountOperations={refetchAccountOperations} liveDataEnabled={liveDataEnabled}
  changeLiveRefresh={changeLiveRefresh}/>
        </div>
      );
    }
  };

  if (!accountDetails) {
    return (
      <Loader2 className="animate-spin mt-1 text-black dark:text-white h-12 w-12 ml-3 ..." />
    );
  }

  if (notFound) {
    return <div>Account not found</div>;
  }

  return (
    <>
      <Head>
        <title>@{accountNameFromRoute} - Hive Explorer</title>
      </Head>
      <div className="flex items-center justify-end w-full min-h-[64px] bg-explorer-orange -mt-4 px-2 md:mb-4 md:px-8 fixed z-20">
        {accountOperations && (paramsState.page || lastPage) && (
          <AccountPagination
            page={paramsState.page ? paramsState.page : lastPage || 0}
            setPage={(page: number | undefined) =>
              setParams({ ...paramsState, page })
            }
            isLastPage={!paramsState.page}
            accountOperations={accountOperations}
            accountOperationTypes={accountOperationTypes || []}
            onOperationsSelect={handleOperationTypeChange}
            selectedFilters={filters}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 text-white mx-8 mt-24 lg:mt-16 w-full gap-4 px-2 md:px-4">
        {isMobile && (
          <MobileAccountNameCard accountName={accountNameFromRoute} liveDataEnabled={liveDataEnabled} />
        )}

        {renderAccountDetailsView()}
        <div
          className="col-start-1 md:col-start-2 col-span-1 md:col-span-3"
          data-testid="account-operation-list"
        >
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Ranges</CardTitle>
            </CardHeader>
            <CardContent>
              <SearchRanges rangesProps={searchRanges} />
              <div className="flex items-center justify-between m-2">
                <Button
                  className=" bg-blue-800 hover:bg-blue-600 rounded"
                  onClick={() => handleSearch(true)}
                  data-testid="apply-filters"
                >
                  <span>Apply filters</span>{" "}
                </Button>
                <Button
                  className=" bg-blue-800 hover:bg-blue-600 rounded-[4px]"
                  onClick={() => handleFilterClear()}
                  data-testid="clear-filters"
                >
                  <span>Clear filters</span>{" "}
                </Button>
              </div>
            </CardContent>
          </Card>
          {!isAccountOperationsLoading &&
          !accountOperations?.total_operations ? (
            <div className="w-full my-4 text-black text-center">
              No operations were found.
            </div>
          ) : isAccountOperationsLoading ? (
            <div className="flex justify-center text-center items-center">
              <Loader2 className="animate-spin mt-1 text-black h-12 w-12 ml-3 ..." />
            </div>
          ) : (
            <OperationsTable
              operations={convertOperationResultsToTableOperations(
                formattedAccountOperations?.operations_result
              )}
              unformattedOperations={convertOperationResultsToTableOperations(
                accountOperations?.operations_result || []
              )}
            />
          )}
        </div>
        <div className="fixed bottom-[10px] right-0 flex flex-col items-end justify-end px-3 md:px-12">
          <ScrollTopButton />
        </div>
      </div>
    </>
  );
}
