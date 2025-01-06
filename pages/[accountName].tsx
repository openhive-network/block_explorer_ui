import { useEffect, useState } from "react";
import { Loader2, ArrowBigRightDash, X } from "lucide-react";
import { useRouter } from "next/router";
import Head from "next/head";

import Hive from "@/types/Hive";
import {
  cn,
  convertBooleanArrayToIds,
  convertOperationResultsToTableOperations,
} from "@/lib/utils";
import useAccountOperations from "@/hooks/api/accountPage/useAccountOperations";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import useMediaQuery from "@/hooks/common/useMediaQuery";
import useSearchRanges from "@/hooks/common/useSearchRanges";
import useURLParams from "@/hooks/common/useURLParams";
import AccountTopBar from "@/components/account/AccountTopBar";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import ScrollTopButton from "@/components/ScrollTopButton";
import OperationsTable from "@/components/OperationsTable";
import AccountDetailsSection from "@/components/account/AccountDetailsSection";
import MobileAccountNameCard from "@/components/account/MobileAccountNameCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useConvertedAccountDetails from "@/hooks/common/useConvertedAccountDetails";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import ErrorPage from "./ErrorPage";
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

  const { dynamicGlobalData } = useDynamicGlobal();
  const { formattedAccountDetails: accountDetails, notFound } =
    useConvertedAccountDetails(
      accountNameFromRoute,
      liveDataEnabled,
      dynamicGlobalData
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
  const {
    accountOperations,
    isAccountOperationsLoading,
    refetchAccountOperations,
  } = useAccountOperations(accountOperationsProps, liveDataEnabled);

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

  const renderAccountDetailsView = () => {
    if (isMobile) {
      return (
        <>
          <div className="fixed pl-0 left-0 top-[50%] z-50">
            <Button
              className="flex justify-center bg-explorer-orange h-[100px] w-[40px] hover:bg-orange-300 align-center [writing-mode:vertical-lr] text-explorer-gray-dark rounded-r"
              onClick={() => setShowMobileAccountDetails(true)}
            >
              <ArrowBigRightDash size={30} />
            </Button>
          </div>

          <div
            className={cn(
              "fixed top-0 left-0 p-5 bg-theme dark:bg-theme w-full h-full -translate-x-full duration-500 z-50 overflow-auto",
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
            <AccountDetailsSection
              accountName={accountNameFromRoute}
              refetchAccountOperations={refetchAccountOperations}
              liveDataEnabled={liveDataEnabled}
              changeLiveRefresh={changeLiveRefresh}
              accountDetails={accountDetails}
              dynamicGlobalData={dynamicGlobalData}
            />
          </div>
        </>
      );
    } else {
      return (
        <div className="col-start-1 col-span-1 flex flex-col gap-y-2">
          <AccountDetailsSection
            accountName={accountNameFromRoute}
            refetchAccountOperations={refetchAccountOperations}
            liveDataEnabled={liveDataEnabled}
            changeLiveRefresh={changeLiveRefresh}
            accountDetails={accountDetails}
            dynamicGlobalData={dynamicGlobalData}
          />
        </div>
      );
    }
  };

  // get the accountName and treat it as a string
  const routeAccountName = Array.isArray(router.query.accountName)
    ? router.query.accountName[0] // If it's an array, get the first element
    : router.query.accountName; // Otherwise, treat it as a string directly

  if(routeAccountName  && !routeAccountName.startsWith("@")) 
  {
    return <ErrorPage />;
  }
  
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
          <AccountTopBar
            accountName={accountNameFromRoute}
            page={paramsState.page ? paramsState.page : lastPage || 0}
            setPage={(page: number | undefined) =>
              setParams({ ...paramsState, page })
            }
            accountOperations={accountOperations}
            onOperationsSelect={handleOperationTypeChange}
            selectedFilters={filters}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 text-white mx-8 mt-24 lg:mt-16 w-full gap-4 px-2 md:px-4">
        {isMobile && (
          <MobileAccountNameCard
            accountName={accountNameFromRoute}
            liveDataEnabled={liveDataEnabled}
            accountDetails={accountDetails}
          />
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
                  onClick={() => handleSearch(true)}
                  data-testid="apply-filters"
                >
                  <span>Apply filters</span>{" "}
                </Button>
                <Button
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
                formattedAccountOperations?.operations_result || []
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
