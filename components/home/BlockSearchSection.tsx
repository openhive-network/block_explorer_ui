import Explorer from "@/types/Explorer"
import Hive from "@/types/Hive";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Dialog } from "../ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { Button } from "../ui/button";
import Link from "next/link";
import { Select, SelectContent, SelectTrigger, SelectItem } from "../ui/select";
import { Loader2, X } from "lucide-react";
import SingleOperationTypeDialog from "../SingleOperationTypeDialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import DetailedOperationCard from "../DetailedOperationCard";
import { config } from "@/Config";
import CustomPagination from "../CustomPagination";
import useCommentSearch from "@/api/common/useCommentSearch";
import useBlockSearch from "@/api/homePage/useBlockSearch";
import useOperationKeys from "@/api/homePage/useOperationKeys";
import useOperationTypes from "@/api/common/useOperationsTypes";
import useHeadBlockNumber from "@/api/common/useHeadBlockNum";
import DateTimePicker from "react-datetime-picker";
import { substractFromDate } from "@/lib/utils";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";


interface BlockSearchSectionProps {};

const rangeSelectOptions = [
  {
    name: "Last blocks",
    key: "lastBlocks"
  },
  {
    name: "Last days/weeks/months",
    key: "lastTime"
  },
  {
    name: "Block range",
    key: "blockRange"
  },
  {
    name: "Time range",
    key: "timeRange"
  }
];

const timeSelectOptions = [
  {
    name: "Days",
    key: "days"
  },
  {
    name: "Weeks",
    key: "weeks"
  },
  {
    name: "Months",
    key: "months"
  }
]


const BlockSearchSection: React.FC<BlockSearchSectionProps> = ({}) => {

  const operationsTypes = useOperationTypes().operationsTypes || [];
  const commentSearch = useCommentSearch();
  const blockSearch = useBlockSearch();
  const operationKeysHook = useOperationKeys();
  const headBlockHook = useHeadBlockNumber();

  const [accountName, setAccountName] = useState<string | undefined>(undefined);
  const [fromBlock, setFromBlock] = useState<number | undefined>(undefined);
  const [toBlock, setToBlock] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(config.firstBlockTime));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date (Date.now()));
  const [lastBlocksValue, setLastBlocksValue] = useState<number | undefined>(undefined);
  const [lastTimeUnitValue, setLastTimeUnitValue] = useState<number | undefined>(undefined);
  const [selectedOperationTypes, setSelectedOperationTypes] = useState<number[]>([]);
  const [selectedCommentSearchOperationTypes, setSelectedCommentSearchOperationTypes] = useState<number[]>([]);
  const [fieldContent, setFieldContent] = useState<string | undefined>(undefined);
  const [permlink, setPermlink] = useState<string | undefined>(undefined);
  const [accordionValue, setAccordionValue] = useState<string>("block");
  const [previousCommentSearchProps, setPreviousCommentSearchProps] = useState<Explorer.CommentSearchProps | undefined>(undefined);
  const [commentPaginationPage, setCommentPaginationPage] = useState<number>(1);
  const [selectedKeys, setSelectedKeys] = useState<string[] | undefined>(undefined);
  const [lastSearchKey, setLastSearchKey] = useState<"block" | "account" | "comment" | undefined>(undefined);
  const [rangeSelectKey, setRangeSelectKey] = useState<string>("lastBlocks");
  const [timeUnitSelectKey, setTimeUnitSelectKey] = useState<string>("days");

  const getOperationKeys = async (
    operationTypeId: number | null
  ) => {
    if (operationTypeId !== null) {
      operationKeysHook.getOperationKeys(operationTypeId);
    } else {
      operationKeysHook.getOperationKeys(undefined);
    }
  };

  const setKeysForProperty = (index: number | null) => {
    if (index !== null && operationKeysHook.operationKeysData?.[index]) {
      setSelectedKeys(operationKeysHook.operationKeysData[index]);
    } else {
      setSelectedKeys(undefined);
    }
  }

  const startCommentSearch = () => {
    if (accountName) {
      const commentSearchProps: Explorer.CommentSearchProps = {
        accountName,
        permlink,
        fromBlock,
        toBlock
      };
      commentSearch.searchCommentOperations(commentSearchProps);
      setPreviousCommentSearchProps(commentSearchProps);
      setLastSearchKey("comment");
    }
  }

  const startBlockSearch = async () => {
    let payloadFromBlock: number | undefined = rangeSelectKey === "blockRange" ? fromBlock : undefined;
    let payloadToBlock: number | undefined = rangeSelectKey === "blockRange" ? toBlock : undefined;
    let payloadStartDate: Date | undefined = rangeSelectKey === "timeRange" ? startDate : undefined;
    let payloadEndDate: Date | undefined = rangeSelectKey === "timeRange" ? endDate : undefined;
    if (lastBlocksValue && rangeSelectKey === "lastBlocks") {
      const currentHeadBlockNumber = await headBlockHook.checkTemporaryHeadBlockNumber();
      payloadFromBlock = Number(currentHeadBlockNumber) - lastBlocksValue;
    }
    if (lastTimeUnitValue && rangeSelectKey === "lastTime") {
      payloadStartDate = substractFromDate(new Date(), lastTimeUnitValue, timeUnitSelectKey);
    }
    const blockSearchProps: Explorer.BlockSearchProps = {
      accountName,
      operations: selectedOperationTypes.length ? selectedOperationTypes : operationsTypes.map((opType) => opType.op_type_id),
      fromBlock: payloadFromBlock,
      toBlock: payloadToBlock,
      startDate: payloadStartDate,
      endDate: payloadEndDate,
      limit: config.standardPaginationSize,
      deepProps: {
        keys: selectedKeys,
        content: fieldContent
      }
    }
    blockSearch.searchBlocksIds(blockSearchProps);
    setLastSearchKey("block");
  }

  const changeCommentSearchPagination = (newPageNum: number) => {
    if (previousCommentSearchProps?.accountName) {
      const newSearchProps: Explorer.CommentSearchProps = {...previousCommentSearchProps, pageNumber: newPageNum};
      commentSearch.searchCommentOperations(newSearchProps);
      setCommentPaginationPage(newPageNum);
    }
  }

  const changeSelectedOperationTypes = (operationTypesIds: number[]) => {
    if (operationTypesIds.length === 1) {
      getOperationKeys(operationTypesIds[0]);
    } else {
      setFieldContent(undefined);
      getOperationKeys(null);
    }
    setSelectedOperationTypes(operationTypesIds);
  }

  const onSelect = (newValue: string) => {
    setKeysForProperty(Number(newValue));
  }

  const getOperationButtonTitle = (): string => {
    if (selectedOperationTypes && selectedOperationTypes.length === 1) return operationsTypes[selectedOperationTypes[0]].operation_name
    if (selectedOperationTypes && selectedOperationTypes.length > 1) return `${selectedOperationTypes.length} operations`
    return "Operations"
  }

  const setNumericValue = (value: number, fieldSetter: Function) => {
    if (value === 0) {
      fieldSetter(undefined);
    } else {
      fieldSetter(value);
    }
  }

  const renderRangeSection = () => {
    return (
      <div className="m-2">
        <Select onValueChange={setRangeSelectKey}>
          <SelectTrigger>
            {rangeSelectOptions.find((selectOption) => selectOption.key === rangeSelectKey)?.name}
          </SelectTrigger>
          <SelectContent className="bg-white text-black rounded-[2px] max-h-[31rem]">
            {rangeSelectOptions.map((selectOption, index) => (
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
        {
          rangeSelectKey === "lastBlocks" &&
            <div className="flex items-center  my-2">
              <div className="flex flex-col w-full">
                <Input
                  type="number"
                  value={lastBlocksValue || ""}
                  onChange={(e) =>
                    setNumericValue(Number(e.target.value), setLastBlocksValue)
                  }
                  placeholder={"Last"}
                />
              </div>
            </div>
        }
        {
          rangeSelectKey === "lastTime" &&
          <>
            <div className="flex items-center justify-center  my-2">
              <div className="flex flex-col w-full ">
                <Input
                  type="number"
                  value={lastTimeUnitValue || ""}
                  onChange={(e) =>
                    setNumericValue(Number(e.target.value), setLastTimeUnitValue)
                  }
                  placeholder={"Last"}
                />
              </div>
              <Select onValueChange={setTimeUnitSelectKey}>
                <SelectTrigger>
                  {timeSelectOptions.find((selectOption) => selectOption.key === timeUnitSelectKey)?.name}
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
          </>
        }
        {
          rangeSelectKey === "blockRange" &&
            <div className="flex items-center  my-2">
              <div className="flex flex-col w-full">
                <label className="mx-2">From block</label>
                <Input
                  type="number"
                  value={fromBlock || ""}
                  onChange={(e) =>
                    setNumericValue(Number(e.target.value), setFromBlock)
                  }
                  placeholder="1"
                />
              </div>
              <div className="flex flex-col w-full">
                <label className="mx-2">To block</label>
                <Input
                  type="number"
                  value={toBlock || ""}
                  onChange={(e) =>
                    setNumericValue(Number(e.target.value), setToBlock)
                  }
                  placeholder={"Headblock"}
                />
              </div>
            </div>
        }
        {
          rangeSelectKey === "timeRange" &&
            <div className="flex items-center  my-2">
              <div className="flex flex-col w-full">
                <label className="mx-2">From date</label>
                <DateTimePicker 
                  value={startDate} 
                  onChange={(date) => setStartDate(date!)}
                  className="text-white ml-2  border"
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
                  value={endDate} 
                  onChange={(date) => setEndDate(date!)}
                  className="text-white ml-2 border"
                  calendarClassName="text-gray-800"
                  format="yyyy/MM/dd HH:mm:ss"
                  clearIcon={null}
                  calendarIcon={null}
                  disableClock
                  showLeadingZeros={false}
                />
              </div>
            </div>
        }

      </div>
    )
  }

  return (
    <div className="mt-6 col-start-1 col-span-4 md:col-span-1 mb-6 md:mb-0">
      <div className=' bg-explorer-dark-gray p-2 rounded-["6px] h-fit rounded'>
        <div className="text-center text-xl">Block Search</div>
        <Accordion
          type="single"
          className="w-full"
          value={accordionValue}
          onValueChange={setAccordionValue}
        >
          <AccordionItem value="block">
            <AccordionTrigger>Block Search</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center m-2">
                <OperationTypesDialog
                  operationTypes={operationsTypes}
                  selectedOperations={selectedOperationTypes}
                  setSelectedOperations={changeSelectedOperationTypes}
                  colorClass="bg-gray-500"
                  triggerTitle={getOperationButtonTitle()}
                />
              </div>
              <div className="flex flex-col m-2">
                <label className="mx-2">Account name</label>
                <Input
                  className="w-1/2"
                  type="text"
                  value={accountName || ""}
                  onChange={(e) =>
                    setAccountName(
                      e.target.value === "" ? undefined : e.target.value
                    )
                  }
                  placeholder="---"
                />
              </div>
              {renderRangeSection()}
              <div className="flex flex-col  m-2">
                <label className="mx-2">Key</label>
                <div className="flex">
                  <Select onValueChange={onSelect}>
                    <SelectTrigger
                      className="justify-normal"
                      disabled={
                        !selectedOperationTypes ||
                        selectedOperationTypes.length !== 1
                      }
                    >
                      {selectedKeys && !!selectedKeys.length ? (
                        selectedKeys.map(
                          (key, index) =>
                            key !== "value" && (
                              <div key={key} className={"mx-1"}>
                                {index !== 1 && "/"} {key}
                              </div>
                            )
                        )
                      ) : (
                        <div className="text-blocked">
                          {!selectedOperationTypes ||
                          selectedOperationTypes.length !== 1
                            ? "Select exactly 1 operation to use key-value search"
                            : "Pick a property"}{" "}
                        </div>
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black rounded-[2px] max-h-[31rem] overflow-y-scroll">
                      {operationKeysHook.operationKeysData?.map((keys, index) => (
                        <SelectItem
                          className="m-1 text-center"
                          key={index}
                          value={index.toFixed(0)}
                          defaultChecked={false}
                        >
                          <div className="flex gap-x-2">
                            {keys.map(
                              (key, index) =>
                                key !== "value" && (
                                  <div key={key}>
                                    {index !== 1 && "/"} {key}{" "}
                                  </div>
                                )
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedKeys && !!selectedKeys.length && (
                    <Button
                      onClick={() => {
                        setKeysForProperty(null);
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex m-2 flex-col">
                <label className="mx-2">Value</label>
                <Input
                  className="w-1/2"
                  type="text"
                  value={fieldContent || ""}
                  onChange={(e) => setFieldContent(e.target.value)}
                  placeholder="---"
                  disabled={
                    !selectedOperationTypes ||
                    selectedOperationTypes.length !== 1
                  }
                />
              </div>
              <div className="flex items-center  m-2">
                <Button
                  className=" bg-blue-800 hover:bg-blue-600 rounded-[4px]"
                  onClick={startBlockSearch}
                >
                  <span>Search</span>{" "}
                  {blockSearch.blockSearchDataLoading && (
                    <Loader2 className="animate-spin mt-1 h-4 w-4 ml-3 ..." />
                  )}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="account">
            <AccordionTrigger>Account search</AccordionTrigger>
            <AccordionContent>
              <div className="flex m-2 flex-col">Coming soon</div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="comment">
            <AccordionTrigger>Comment search</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center m-2">
                <OperationTypesDialog
                  operationTypes={operationsTypes.filter((opType) =>
                    config.commentOperationsTypeIds.includes(opType.op_type_id)
                  )}
                  selectedOperations={selectedCommentSearchOperationTypes}
                  setSelectedOperations={setSelectedCommentSearchOperationTypes}
                  colorClass="bg-gray-500"
                  triggerTitle={getOperationButtonTitle()}
                />
              </div>
              <div className="flex flex-col m-2">
                <label className="mx-2">Account name</label>
                <Input
                  className="w-1/2"
                  type="text"
                  value={accountName || ""}
                  onChange={(e) =>
                    setAccountName(
                      e.target.value === "" ? undefined : e.target.value
                    )
                  }
                  placeholder="---"
                />
              </div>
              <div className="flex m-2 flex-col">
                <label className="mx-2">Permlink</label>
                <Input
                  className="w-full"
                  type="text"
                  value={permlink}
                  onChange={(e) =>
                    setPermlink(
                      e.target.value === "" ? undefined : e.target.value
                    )
                  }
                  placeholder="---"
                />
              </div>
              {renderRangeSection()}
              <div className="flex items-center  m-2">
                <Button
                  className=" bg-blue-800 hover:bg-blue-600 rounded-[4px]"
                  onClick={startCommentSearch}
                  disabled={!accountName}
                >
                  <span>Search</span>{" "}
                  {commentSearch.commentSearchDataLoading && (
                    <Loader2 className="animate-spin mt-1 h-4 w-4 ml-3 ..." />
                  )}
                </Button>
                {!accountName && (
                  <label className="ml-2 text-muted-foreground">
                    Set account name
                  </label>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      {blockSearch.blockSearchData && lastSearchKey === "block" && (
        <div className=' bg-explorer-dark-gray p-2 rounded-["6px] md:mx-2 h-fit rounded mt-4'>
          <div className="text-center">Results:</div>
          <div className="flex flex-wrap">
            {blockSearch.blockSearchData.length > 0 ? (
              blockSearch.blockSearchData.map((blockId) => (
                <Link key={blockId} href={`block/${blockId}`}>
                  <div className="m-1 border border-solid p-1">{blockId}</div>
                </Link>
              ))
            ) : (
              <div className="flex justify-center w-full my-2">
                No blocks matching given criteria
              </div>
            )}
          </div>
        </div>
      )}
      {!!commentSearch.commentSearchData?.operations_result && lastSearchKey === "comment" && (
        <div>
          <div className="text-black mt-6">
            <CustomPagination
              currentPage={commentPaginationPage}
              totalCount={commentSearch.commentSearchData?.total_operations}
              pageSize={config.standardPaginationSize}
              onPageChange={changeCommentSearchPagination}
              shouldScrollToTop={false}
            />
          </div>
          {commentSearch.commentSearchData?.operations_result.map((foundOperation) => (
            <DetailedOperationCard
              className="my-6"
              operation={foundOperation.body}
              key={foundOperation.operation_id}
              blockNumber={foundOperation.block_num}
              date={foundOperation.created_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BlockSearchSection