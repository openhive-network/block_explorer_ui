import Explorer from "@/types/Explorer";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { Button } from "../ui/button";
import Link from "next/link";
import { Select, SelectContent, SelectTrigger, SelectItem } from "../ui/select";
import { Loader2, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import DetailedOperationCard from "../DetailedOperationCard";
import { config } from "@/Config";
import CustomPagination from "../CustomPagination";
import useCommentSearch from "@/api/common/useCommentSearch";
import useBlockSearch from "@/api/homePage/useBlockSearch";
import useOperationKeys from "@/api/homePage/useOperationKeys";
import useOperationTypes from "@/api/common/useOperationsTypes";
import useBlockByTime from "@/api/common/useBlockByTime";
import useSearchRanges from "../searchRanges/useSearchRanges";
import SearchRanges from "../searchRanges/SearchRanges";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "../ui/tooltip";
import useAccountOperations from "@/api/accountPage/useAccountOperations";
import { getPageUrlParams } from "@/lib/utils";
import JumpToPage from "../JumpToPage";
import { dataToURL } from "@/utils/Hooks";

interface BlockSearchSectionProps {}

const BlockSearchSection: React.FC<BlockSearchSectionProps> = ({}) => {
  const [accountName, setAccountName] = useState<string | undefined>(undefined);
  const [selectedOperationTypes, setSelectedOperationTypes] = useState<
    number[]
  >([]);
  const [
    selectedCommentSearchOperationTypes,
    setSelectedCommentSearchOperationTypes,
  ] = useState<number[]>([]);
  const [fieldContent, setFieldContent] = useState<string | undefined>(
    undefined
  );
  const [permlink, setPermlink] = useState<string | undefined>(undefined);
  const [accordionValue, setAccordionValue] = useState<string>("block");
  const [previousCommentSearchProps, setPreviousCommentSearchProps] = useState<
    Explorer.CommentSearchProps | undefined
  >(undefined);
  const [
    previousAccountOperationsSearchProps,
    setPreviousAccountOperationsSearchProps,
  ] = useState<Explorer.AccountSearchOperationsProps | undefined>(undefined);
  const [commentPaginationPage, setCommentPaginationPage] = useState<number>(1);
  const [accountOperationsPage, setAccountOperationsPage] = useState<
    number | undefined
  >(undefined);
  const [selectedKeys, setSelectedKeys] = useState<string[] | undefined>(
    undefined
  );
  const [lastSearchKey, setLastSearchKey] = useState<
    "block" | "account" | "comment" | undefined
  >(undefined);
  const [blockSearchProps, setBlockSearchProps] = useState<
    Explorer.BlockSearchProps | undefined
  >(undefined);
  const [commentSearchProps, setCommentSearchProps] = useState<
    Explorer.CommentSearchProps | undefined
  >(undefined);
  const [accountOperationsSearchProps, setAccountOperationsSearchProps] =
    useState<Explorer.AccountSearchOperationsProps | undefined>(undefined);
  const [requestFromBlock, setRequestFromBlock] = useState<number | undefined>(
    undefined
  );
  const [requestToBlock, setRequestToBlock] = useState<number | undefined>(
    undefined
  );
  const [singleOperationTypeId, setSingleOperationTypeId] = useState<
    number | undefined
  >(undefined);

  const { operationsTypes } = useOperationTypes() || [];
  const commentSearch = useCommentSearch(commentSearchProps);
  const blockSearch = useBlockSearch(blockSearchProps);
  const { operationKeysData } = useOperationKeys(singleOperationTypeId);
  const { checkBlockByTime } = useBlockByTime();
  const accountOperations = useAccountOperations(accountOperationsSearchProps);

  const searchRanges = useSearchRanges();
  const { getRangesValues } = searchRanges;

  useEffect(() => {
    if (!accountOperationsPage && accountOperations) {
      setAccountOperationsPage(
        accountOperations?.accountOperations?.total_pages
      );
    }
  }, [accountOperations, accountOperationsPage]);

  const setKeysForProperty = (index: number | null) => {
    if (index !== null && operationKeysData?.[index]) {
      setSelectedKeys(operationKeysData[index]);
    } else {
      setSelectedKeys(undefined);
    }
  };

  const startCommentSearch = async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await getRangesValues();
    if (accountName) {
      const commentSearchProps: Explorer.CommentSearchProps = {
        accountName,
        permlink,
        fromBlock: payloadFromBlock,
        toBlock: payloadToBlock,
        startDate: payloadStartDate,
        endDate: payloadEndDate,
        operationTypes: selectedCommentSearchOperationTypes.length
          ? selectedCommentSearchOperationTypes
          : undefined,
      };
      setCommentSearchProps(commentSearchProps);
      setCommentPaginationPage(1);
      setPreviousCommentSearchProps(commentSearchProps);
      setLastSearchKey("comment");
    }

    if (payloadFromBlock) {
      setRequestFromBlock(payloadFromBlock);
    }
    if (payloadToBlock) {
      setRequestToBlock(payloadToBlock);
    }
    if (payloadStartDate) {
      const blockByTime = await checkBlockByTime(payloadStartDate);
      setRequestFromBlock(blockByTime);
    }
    if (payloadEndDate) {
      const blockByTime = await checkBlockByTime(payloadEndDate);
      setRequestToBlock(blockByTime);
    }
  };

  const startAccountOperationsSearch = async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await getRangesValues();
    if (accountName) {
      const accountOperationsSearchProps: Explorer.AccountSearchOperationsProps =
        {
          accountName,
          permlink,
          fromBlock: payloadFromBlock,
          toBlock: payloadToBlock,
          startDate: payloadStartDate,
          endDate: payloadEndDate,
          operationTypes: selectedOperationTypes.length
            ? selectedOperationTypes
            : undefined,
        };
      setLastSearchKey("account");
      setAccountOperationsPage(undefined);
      setAccountOperationsSearchProps(accountOperationsSearchProps);
      setPreviousAccountOperationsSearchProps(accountOperationsSearchProps);
    }
  };

  const startBlockSearch = async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await getRangesValues();
    const blockSearchProps: Explorer.BlockSearchProps = {
      accountName,
      operationTypes: selectedOperationTypes.length
        ? selectedOperationTypes
        : operationsTypes?.map((opType) => opType.op_type_id),
      fromBlock: payloadFromBlock,
      toBlock: payloadToBlock,
      startDate: payloadStartDate,
      endDate: payloadEndDate,
      limit: config.standardPaginationSize,
      deepProps: {
        keys: selectedKeys,
        content: fieldContent,
      },
    };
    setBlockSearchProps(blockSearchProps);
    setLastSearchKey("block");
  };

  const changeCommentSearchPagination = (newPageNum: number) => {
    if (previousCommentSearchProps?.accountName) {
      const newSearchProps: Explorer.CommentSearchProps = {
        ...previousCommentSearchProps,
        pageNumber: newPageNum,
      };
      setCommentSearchProps(newSearchProps);
      setCommentPaginationPage(newPageNum);
    }
  };

  const changeAccountOperationsPagination = (newPageNum: number) => {
    if (previousAccountOperationsSearchProps?.accountName) {
      const newSearchProps: Explorer.AccountSearchOperationsProps = {
        ...previousAccountOperationsSearchProps,
        pageNumber: newPageNum,
      };
      setAccountOperationsSearchProps(newSearchProps);
      setAccountOperationsPage(newPageNum);
    }
  };

  const changeSelectedOperationTypes = (operationTypesIds: number[]) => {
    if (operationTypesIds.length === 1) {
      setSingleOperationTypeId(operationTypesIds[0]);
    } else {
      setFieldContent(undefined);
      setSingleOperationTypeId(undefined);
    }
    setSelectedOperationTypes(operationTypesIds);
  };

  const onSelect = (newValue: string) => {
    setKeysForProperty(Number(newValue));
  };

  const getOperationButtonTitle = (): string => {
    if (selectedOperationTypes && selectedOperationTypes.length === 1)
      return operationsTypes?.[selectedOperationTypes[0]].operation_name || "";
    if (selectedOperationTypes && selectedOperationTypes.length > 1)
      return `${selectedOperationTypes.length} operation types`;
    return "Operation types";
  };

  const getCommentPageLink = () => {
    const urlParams: Explorer.UrlParam[] = [
      {
        paramName: "accountName",
        paramValue: dataToURL(commentSearchProps?.accountName)
      },
      {
        paramName: "permlink",
        paramValue: dataToURL(commentSearchProps?.permlink),
      },
      {
        paramName: "fromBlock",
        paramValue: dataToURL(commentSearchProps?.fromBlock)
      },
      {
        paramName: "toBlock",
        paramValue: dataToURL(commentSearchProps?.toBlock)
      },
      {
        paramName: "filters",
        paramValue: dataToURL(commentSearchProps?.operationTypes)
      },
    ];
    return `comments${getPageUrlParams(urlParams)}`;
  };

  const getAccountPageLink = (accountName: string) => {
    const urlParams: Explorer.UrlParam[] = [
      {
        paramName: "fromBlock",
        paramValue: dataToURL(accountOperationsSearchProps?.fromBlock)
      },
      {
        paramName: "toBlock",
        paramValue: dataToURL(accountOperationsSearchProps?.toBlock)
      },
      {
        paramName: "startDate",
        paramValue: dataToURL(accountOperationsSearchProps?.startDate)
      },
      {
        paramName: "endDate",
        paramValue: dataToURL(accountOperationsSearchProps?.endDate)
      },
      {
        paramName: "filters",
        paramValue: dataToURL(accountOperationsSearchProps?.operationTypes)
      },
      {
        paramName: "rangeSelectKey",
        paramValue: dataToURL(searchRanges.rangeSelectKey)
      },
      {
        paramName: "lastTime",
        paramValue: dataToURL(searchRanges.lastTimeUnitValue)
      },
      {
        paramName: "lastBlocks",
        paramValue: dataToURL(searchRanges.lastBlocksValue)
      },
      {
        paramName: "timeUnit",
        paramValue: dataToURL(searchRanges.timeUnitSelectKey)
      },
    ];
    return `account/${accountName}${getPageUrlParams(urlParams)}`;
  };

  return (
    <div className="mt-6 col-start-1 col-span-4 md:col-span-1 mb-6 md:mb-0">
      <div className=' bg-explorer-dark-gray p-2 h-fit rounded'>
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
              <p className="ml-2">Find block numbers for given properties.</p>
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
              <SearchRanges rangesProps={searchRanges} />
              <div className="flex items-center m-2">
                <OperationTypesDialog
                  operationTypes={operationsTypes}
                  selectedOperations={selectedOperationTypes}
                  setSelectedOperations={changeSelectedOperationTypes}
                  colorClass="bg-gray-500"
                  triggerTitle={getOperationButtonTitle()}
                />
              </div>
              <div className="flex flex-col  m-2">
                <div className="flex items-center">
                  <label className="ml-2">Property</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="bg-white text-black p-2">
                          Pick property from body of operation and its value.
                          You can use that only for single operation.
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
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
                              <div
                                key={key}
                                className={"mx-1"}
                              >
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
                    <SelectContent className="bg-white text-black rounded-sm max-h-[31rem] overflow-y-scroll">
                      {operationKeysData?.map((keys, index) => (
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
                  className=" bg-blue-800 hover:bg-blue-600 rounded"
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
              <p className="ml-2">
                {"Find account's operations for given properties."}
              </p>
              <div className="flex flex-col m-2">
                <label className="mx-2">Account name *</label>
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
              <SearchRanges rangesProps={searchRanges} />
              <div className="flex items-center m-2">
                <OperationTypesDialog
                  operationTypes={operationsTypes}
                  selectedOperations={selectedOperationTypes}
                  setSelectedOperations={changeSelectedOperationTypes}
                  colorClass="bg-gray-500"
                  triggerTitle={getOperationButtonTitle()}
                />
              </div>
              <div className="flex items-center  m-2">
                <Button
                  className=" bg-blue-800 hover:bg-blue-600 rounded"
                  onClick={startAccountOperationsSearch}
                  disabled={!accountName}
                >
                  <span>Search</span>{" "}
                  {accountOperations.isAccountOperationsLoading && (
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
          <AccordionItem value="comment">
            <AccordionTrigger>Comment search</AccordionTrigger>
            <AccordionContent>
              <p className="ml-2">
                Find all operations related to comments of given account or for
                exact permlink.
              </p>
              <div className="flex flex-col m-2">
                <label className="mx-2">Account name *</label>
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
              <SearchRanges rangesProps={searchRanges} />
              <div className="flex items-center m-2">
                <OperationTypesDialog
                  operationTypes={operationsTypes?.filter((opType) =>
                    config.commentOperationsTypeIds.includes(opType.op_type_id)
                  )}
                  selectedOperations={selectedCommentSearchOperationTypes}
                  setSelectedOperations={setSelectedCommentSearchOperationTypes}
                  colorClass="bg-gray-500"
                  triggerTitle={getOperationButtonTitle()}
                />
              </div>
              <div className="flex items-center  m-2">
                <Button
                  className=" bg-blue-800 hover:bg-blue-600 rounded"
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
        <div className=' bg-explorer-dark-gray p-2 md:mx-2 h-fit rounded mt-4'>
          <div className="text-center">Results:</div>
          <div className="flex flex-wrap">
            {blockSearch.blockSearchData.length > 0 ? (
              blockSearch.blockSearchData.map((blockId) => (
                <Link
                  key={blockId}
                  href={`block/${blockId}`}
                >
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
      {!!commentSearch.commentSearchData?.operations_result &&
        lastSearchKey === "comment" && (
          <div>
            <Link href={getCommentPageLink()}>
              <Button className=" bg-blue-800 hover:bg-blue-600 rounded mt-8">
                Go to result page
              </Button>
            </Link>

            <div className="flex justify-center items-center text-black mt-6">
              <CustomPagination
                currentPage={commentPaginationPage}
                totalCount={commentSearch.commentSearchData?.total_operations}
                pageSize={config.standardPaginationSize}
                onPageChange={changeCommentSearchPagination}
                shouldScrollToTop={false}
              />
            </div>
            <div className="flex justify-end items-center">
              <JumpToPage
                currentPage={commentPaginationPage}
                onPageChange={changeCommentSearchPagination}
              />
            </div>

            {commentSearch.commentSearchData?.operations_result.map(
              (foundOperation) => (
                <DetailedOperationCard
                  className="my-6"
                  operation={foundOperation.body}
                  key={foundOperation.operation_id}
                  blockNumber={foundOperation.block_num}
                  date={foundOperation.created_at}
                />
              )
            )}
          </div>
        )}
      {!!accountOperations.accountOperations?.operations_result &&
        lastSearchKey === "account" && (
          <div>
            <Link
              href={getAccountPageLink(
                previousAccountOperationsSearchProps?.accountName || ""
              )}
            >
              <Button className=" bg-blue-800 hover:bg-blue-600 rounded mt-8">
                Go to result page
              </Button>
            </Link>

            <div className="flex justify-center items-center text-black mt-6">
              <CustomPagination
                currentPage={accountOperationsPage || 1}
                totalCount={
                  accountOperations.accountOperations?.total_operations
                }
                pageSize={config.standardPaginationSize}
                onPageChange={changeAccountOperationsPagination}
                shouldScrollToTop={false}
                isMirrored={true}
              />
            </div>
            <div className="flex justify-end items-center">
              <JumpToPage
                currentPage={accountOperationsPage || 1}
                onPageChange={changeAccountOperationsPagination}
              />
            </div>

            {accountOperations.accountOperations?.operations_result.map(
              (foundOperation) => (
                <DetailedOperationCard
                  className="my-6"
                  operation={foundOperation.operation}
                  key={foundOperation.operation_id}
                  blockNumber={foundOperation.block_num}
                  date={new Date(foundOperation.timestamp)}
                />
              )
            )}
          </div>
        )}
    </div>
  );
};

export default BlockSearchSection;
