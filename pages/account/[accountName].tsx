import { useEffect, useState } from "react";
import AccountDetailsCard from "../../components/account/AccountDetailsCard";
import { useRouter } from "next/router";
import DetailedOperationCard from "@/components/DetailedOperationCard";
import JSONCard from "@/components/JSONCard";
import AccountMainCard from "@/components/account/AccountMainCard";
import AccountWitnessVotesCard from "@/components/account/AccountWitnessVotesCard";
import VotersDialog from "@/components/Witnesses/VotersDialog";
import VotesHistoryDialog from "@/components/Witnesses/VotesHistoryDialog";
import PageNotFound from "@/components/PageNotFound";
import useAccountDetails from "@/api/accountPage/useAccountDetails";
import useAccountOperations from "@/api/accountPage/useAccountOperations";
import useWitnessDetails from "@/api/common/useWitnessDetails";
import AccountPagination from "@/components/account/AccountPagination";
import useAccountOperationTypes from "@/api/accountPage/useAccountOperationTypes";
import { config } from "@/Config";
import { useURLParams } from "@/utils/Hooks";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DateTimePicker from "react-datetime-picker";
import ScrollTopButton from "@/components/ScrollTopButton";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import Hive from "@/types/Hive";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import useSearchRanges from "@/components/searchRanges/useSearchRanges";

interface AccountSearchParams {
  accountName?: string | undefined;
  fromBlock: number | undefined;
  toBlock: number | undefined;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  page: number | undefined;
  lastBlocks: number | undefined;
  lastTime: number | undefined;
  timeUnit: string | undefined;
  filters: number[];
}

const defaultSearchParams: AccountSearchParams = {
  accountName: undefined,
  fromBlock: undefined,
  toBlock: undefined,
  fromDate: undefined,
  toDate: undefined,
  page: undefined,
  lastBlocks: undefined,
  lastTime: undefined,
  timeUnit: undefined,
  filters: [],
};

export default function Account() {
  const router = useRouter();

  const accountNameFromRoute = router.query.accountName as string;

  const { paramsState, setParams } = useURLParams({
    ...defaultSearchParams,
    accountName: accountNameFromRoute,
  });

  const {
    filters,
    fromBlock: fromBlockParam,
    toBlock: toBlockParam,
    fromDate: fromDateParam,
    toDate: toDateParam,
    lastBlocks: lastBlocksParam,
    timeUnit: timeUnitParam,
    lastTime: lastTimeParam,
    page,
  } = paramsState;

  const [isVotersModalOpen, setIsVotersModalOpen] = useState(false);
  const [isVotesHistoryModalOpen, setIsVotesHistoryModalOpen] = useState(false);
  const [fromBlock, setFromBlock] = useState<number>();
  const [toBlock, setToBlock] = useState<number>();
  const [fromDate, setFromDate] = useState<Date>(new Date(0));
  const [toDate, setToDate] = useState<Date>(new Date());
  const [lastBlocks, setLastBlocks] = useState<number>();
  const [initialSearch, setInitialSearch] = useState<boolean>(false);

  const {
    timeSelectOptions,
    setTimeUnitSelectKey,
    lastTimeUnitValue,
    setLastTimeUnitValue,
    timeUnitSelectKey,
    getRangesValues,
  } = useSearchRanges();

  const { accountDetails } = useAccountDetails(accountNameFromRoute);
  const { accountOperations, isAccountOperationsLoading } =
    useAccountOperations({
      accountName: accountNameFromRoute,
      operationTypes: filters.length ? filters : undefined,
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

  useEffect(() => {
    if (!paramsState.page && accountOperations) {
      setParams({ ...paramsState, page: accountOperations.total_pages });
    }
  }, [accountOperations, paramsState, setParams]);

  const handleOpenVotersModal = () => {
    setIsVotersModalOpen(!isVotersModalOpen);
  };

  const handleOpenVotesHistoryModal = () => {
    setIsVotesHistoryModalOpen(!isVotesHistoryModalOpen);
  };

  const handleSearch = async () => {
    if (
      !initialSearch &&
      (fromDateParam ||
        toDateParam ||
        fromBlockParam ||
        toBlockParam ||
        lastBlocksParam ||
        lastTimeParam ||
        timeUnitParam)
    ) {
      setFromDate(fromDateParam ?? new Date(0));
      setToDate(toDateParam ?? new Date());
      setFromBlock(fromBlockParam);
      setToBlock(toBlockParam);
      setLastBlocks(lastBlocksParam);
      timeUnitParam && setTimeUnitSelectKey(timeUnitParam);
      lastTimeParam && setLastTimeUnitValue(lastTimeParam);
      setInitialSearch(true);
    } else {
      const {
        payloadFromBlock,
        payloadToBlock,
        payloadStartDate,
        payloadEndDate,
      } = await getRangesValues();

      setParams({
        ...paramsState,
        fromBlock: payloadFromBlock || fromBlock,
        toBlock: payloadToBlock || toBlock,
        fromDate: payloadStartDate || fromDate,
        toDate: payloadEndDate || toDate,
        lastBlocks,
        lastTime: lastTimeUnitValue,
        timeUnit: timeUnitSelectKey,
        page: undefined,
      });
    }
  };

  const setNumericValue = (value: number, fieldSetter: Function) => {
    if (value === 0) {
      fieldSetter(undefined);
    } else {
      fieldSetter(value);
    }
  };

  useEffect(() => {
    if (paramsState && !initialSearch) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsState]);

  if (!accountDetails) {
    return "Loading ...";
  }
  if (!accountOperations?.total_operations && !isAccountOperationsLoading) {
    return <PageNotFound message={`Account not found.`} />;
  }

  return (
    <>
      <div className="bg-explorer-orange items-center fixed grid grid-flow-row-dense grid-cols-3 top-14 md:top-16 right-0 left-0 p-2 z-10">
        <div className="col-span-3 md:col-span-2 md:justify-self-end justify-self-center z-20 max-w-full">
          {paramsState.page && accountOperations && (
            <AccountPagination
              page={paramsState.page}
              setPage={(page: number) => setParams({ ...paramsState, page })}
              accountOperations={accountOperations}
              accountName={accountNameFromRoute}
              setOperationFilters={(newFilters: number[]) =>
                setParams({ ...paramsState, filters: newFilters })
              }
              operationFilters={filters}
            />
          )}
        </div>

        <div className="justify-self-end col-span-3 md:col-span-1">
          <div className="grid gap-x-5 grid-flow-row-dense grid-cols-2">
            <div className="justify-self-end self-center">
              <ScrollTopButton />
            </div>
            <OperationTypesDialog
              operationTypes={accountOperationTypes}
              setSelectedOperations={(newFilters: number[]) =>
                setParams({
                  ...paramsState,
                  page: undefined,
                  filters: newFilters,
                })
              }
              selectedOperations={filters}
              colorClass="bg-explorer-dark-gray"
              triggerTitle={"Operation Filters"}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 text-white mx-8 mt-24 md:mt-14 w-full">
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

        <div className="col-start-1 md:col-start-2 col-span-1 md:col-span-3">
          <div>
            <div className="bg-explorer-dark-gray text-white p-4 rounded-[6px] mx-2">
              <div className="flex items-center m-2">
                <div className="flex flex-col w-full">
                  <label className="mx-2">From date</label>
                  <DateTimePicker
                    value={fromDate}
                    onChange={(date) => setFromDate(date!)}
                    className="text-explorer-turquoise border border-explorer-turquoise"
                    calendarClassName="text-gray-800"
                    format="yyyy/MM/dd HH:mm:ss"
                    clearIcon={null}
                    calendarIcon={null}
                    disableClock
                    showLeadingZeros={false}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label className="mx-2">To date</label>
                  <DateTimePicker
                    value={toDate}
                    onChange={(date) => setToDate(date!)}
                    className="text-explorer-turquoise border border-explorer-turquoise"
                    calendarClassName="text-gray-800"
                    format="yyyy/MM/dd HH:mm:ss"
                    clearIcon={null}
                    calendarIcon={null}
                    disableClock
                    showLeadingZeros={false}
                  />
                </div>
              </div>
              <div className="flex items-center m-2">
                <div className="flex flex-col w-full">
                  <label className="mx-2">From block</label>
                  <Input
                    type="number"
                    value={fromBlock}
                    onChange={(e) => setFromBlock(Number(e.target.value))}
                    placeholder="1"
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label className="mx-2">To block</label>
                  <Input
                    type="number"
                    value={toBlock}
                    onChange={(e) => setToBlock(Number(e.target.value))}
                    placeholder={"Headblock"}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label className="mx-2">Last Blocks</label>
                  <Input
                    type="number"
                    value={lastBlocks}
                    onChange={(e) => setLastBlocks(Number(e.target.value))}
                    placeholder="Last Blocks"
                  />
                </div>
              </div>
              <label className="mx-2 ml-4">Last Time</label>
              <div className="flex items-center justify-center w-full px-2">
                <div className="flex flex-col w-full">
                  <Input
                    type="number"
                    value={lastTimeUnitValue || ""}
                    onChange={(e) =>
                      setNumericValue(
                        Number(e.target.value),
                        setLastTimeUnitValue
                      )
                    }
                    placeholder={"Last"}
                  />
                </div>
                <Select onValueChange={setTimeUnitSelectKey}>
                  <SelectTrigger>
                    {
                      timeSelectOptions.find(
                        (selectOption) => selectOption.key === timeUnitSelectKey
                      )?.name
                    }
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black rounded-[2px] max-h-[31rem]">
                    {timeSelectOptions.map((selectOption, index) => (
                      <SelectItem
                        className="m-1 text-center"
                        key={index}
                        value={selectOption.key}
                        defaultChecked={false}
                      >
                        {selectOption.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between m-2">
                <Button
                  className=" bg-blue-800 hover:bg-blue-600 rounded-[4px]"
                  onClick={handleSearch}
                >
                  <span>Search</span>{" "}
                </Button>
              </div>
            </div>
            {isAccountOperationsLoading || !page ? (
              <div className="flex justify-center text-center items-center">
                Loading ...
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}
