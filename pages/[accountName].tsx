import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import DetailedOperationCard from "@/components/DetailedOperationCard";
import JSONCard from "@/components/JSONCard";
import AccountMainCard from "@/components/account/AccountMainCard";
import AccountWitnessVotesCard from "@/components/account/AccountWitnessVotesCard";
import VotersDialog from "@/components/Witnesses/VotersDialog";
import VotesHistoryDialog from "@/components/Witnesses/VotesHistoryDialog";
import useAccountDetails from "@/api/accountPage/useAccountDetails";
import useAccountOperations from "@/api/accountPage/useAccountOperations";
import useWitnessDetails from "@/api/common/useWitnessDetails";
import AccountPagination from "@/components/account/AccountTopBar";
import useAccountOperationTypes from "@/api/accountPage/useAccountOperationTypes";
import { useOperationsFormatter, useURLParams } from "@/utils/Hooks";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Hive from "@/types/Hive";
import useSearchRanges from "@/components/searchRanges/useSearchRanges";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import ScrollTopButton from "@/components/ScrollTopButton";
import { useUserSettingsContext } from "@/components/contexts/UserSettingsContext";
import AccountDetailsCard from "@/components/account/AccountDetailsCard";
import Head from "next/head";

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
  filters: number[];
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

  const [isVotersModalOpen, setIsVotersModalOpen] = useState(false);
  const [isVotesHistoryModalOpen, setIsVotesHistoryModalOpen] = useState(false);
  const [initialSearch, setInitialSearch] = useState<boolean>(false);
  const [filters, setFilters] = useState<number[]>([]);

  const searchRanges = useSearchRanges();

  const { settings } = useUserSettingsContext();

  const { accountDetails } = useAccountDetails(accountNameFromRoute);
  const { accountOperations, isAccountOperationsLoading } =
    useAccountOperations({
      accountName: accountNameFromRoute,
      operationTypes: filtersParam.length ? filtersParam : undefined,
      pageNumber: paramsState.page,
      fromBlock: fromBlockParam,
      toBlock: toBlockParam,
      startDate: fromDateParam,
      endDate: toDateParam,
    });
  const { accountOperationTypes } =
    useAccountOperationTypes(accountNameFromRoute);

  const { witnessDetails } = useWitnessDetails(
    accountNameFromRoute,
    !!accountDetails?.is_witness
  );

  const handleOpenVotersModal = () => {
    setIsVotersModalOpen(!isVotersModalOpen);
  };

  const formattedAccountOperations = useOperationsFormatter(
    accountOperations?.operations_result
  ) as Hive.OperationResponse[];

  const handleOpenVotesHistoryModal = () => {
    setIsVotesHistoryModalOpen(!isVotesHistoryModalOpen);
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

  const handleOperationTypeChange = (newFilters: number[]) => {
    setFilters(newFilters);
    setParams({ ...paramsState, filters: newFilters, page: undefined });
  };

  useEffect(() => {
    if (!paramsState.page && accountOperations) {
      setParams({
        ...paramsState,
        page: accountOperations.total_pages,
      });
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
    setIsVotersModalOpen(false);
    setIsVotesHistoryModalOpen(false);
  }, [accountNameFromRoute]);

  if (!accountDetails) {
    return (
      <Loader2 className="animate-spin mt-1 text-black h-12 w-12 ml-3 ..." />
    );
  }

  return (
    <>
    <Head>
    <title>@{accountNameFromRoute} - Hive Explorer</title>
    </Head>
      <div className="flex items-center justify-end w-full min-h-[64px] bg-explorer-orange -mt-4 px-2 md:px-8 fixed z-20">
        {paramsState.page && accountOperations && (
          <AccountPagination
            page={paramsState.page}
            setPage={(page: number) => setParams({ ...paramsState, page })}
            accountOperations={accountOperations}
            accountOperationTypes={accountOperationTypes || []}
            onOperationsSelect={handleOperationTypeChange}
            selectedFilters={filters}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 text-white mx-8 mt-12 md:mt-14 w-full">
        <div className="mt-2 col-start-1 col-span-1">
          <AccountMainCard
            accountDetails={accountDetails}
            accountName={accountNameFromRoute}
            openVotersModal={handleOpenVotersModal}
            openVotesHistoryModal={handleOpenVotesHistoryModal}
          />
          <AccountDetailsCard
            header="Properties"
            userDetails={accountDetails}
          />
          <JSONCard
            header="JSON Metadata"
            json={accountDetails.json_metadata}
            showCollapseButton={true}
          />
          <JSONCard
            header="Posting JSON Metadata"
            json={accountDetails.posting_json_metadata}
            showCollapseButton={true}
          />
          <AccountDetailsCard
            header="Witness Properties"
            userDetails={witnessDetails}
          />
          <AccountWitnessVotesCard voters={accountDetails.witness_votes} />
          <VotersDialog
            accountName={accountNameFromRoute}
            isVotersOpen={isVotersModalOpen}
            changeVotersDialogue={handleOpenVotersModal}
          />
          <VotesHistoryDialog
            accountName={accountNameFromRoute}
            isVotesHistoryOpen={isVotesHistoryModalOpen}
            changeVoteHistoryDialogue={handleOpenVotesHistoryModal}
          />
        </div>

        <div
          className="col-start-1 md:col-start-2 col-span-1 md:col-span-3"
          data-testid="account-operation-list"
        >
          <div>
            <div className="bg-explorer-dark-gray text-white p-4 rounded-[6px] mx-2">
              <div className="ml-2">Ranges</div>
              <SearchRanges rangesProps={searchRanges} />
              <div className="flex items-center justify-between m-2">
                <Button
                  className=" bg-blue-800 hover:bg-blue-600 rounded"
                  onClick={() => handleSearch(true)}
                >
                  <span>Apply filters</span>{" "}
                </Button>
                <Button
                  className=" bg-blue-800 hover:bg-blue-600 rounded-[4px]"
                  onClick={() => handleFilterClear()}
                >
                  <span>Clear filters</span>{" "}
                </Button>
              </div>
            </div>
            {!isAccountOperationsLoading &&
            !accountOperations?.total_operations ? (
              <div className="w-full my-4 text-black text-center">
                No operations were found.
              </div>
            ) : isAccountOperationsLoading || !page ? (
              <div className="flex justify-center text-center items-center">
                <Loader2 className="animate-spin mt-1 text-black h-12 w-12 ml-3 ..." />
              </div>
            ) : settings.rawJsonView ? (
              accountOperations?.operations_result?.map(
                (operation: Hive.OperationResponse) => (
                  <div
                    className="m-2"
                    key={`${operation.operation_id}_${operation.timestamp}`}
                  >
                    <DetailedOperationCard
                      operation={operation.operation}
                      operationId={operation.operation_id}
                      date={new Date(operation.timestamp)}
                      blockNumber={operation.block_num}
                      transactionId={operation.trx_id}
                      key={operation.timestamp}
                      isShortened={operation.is_modified}
                    />
                  </div>
                )
              )
            ) : (
              formattedAccountOperations?.map(
                (operation: Hive.OperationResponse) => (
                  <div
                    className="m-2"
                    key={`${operation.operation_id}_${operation.timestamp}`}
                  >
                    <DetailedOperationCard
                      operation={operation.operation}
                      operationId={operation.operation_id}
                      date={new Date(operation.timestamp)}
                      blockNumber={operation.block_num}
                      transactionId={operation.trx_id}
                      key={operation.timestamp}
                      isShortened={operation.is_modified}
                    />
                  </div>
                )
              )
            )}
          </div>
        </div>
        <div className="fixed bottom-[10px] right-0 flex flex-col items-end justify-end px-3 md:px-12">
          <ScrollTopButton />
        </div>
      </div>
    </>
  );
}
