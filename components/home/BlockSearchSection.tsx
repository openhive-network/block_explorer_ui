import Explorer from "@/types/Explorer";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { Button } from "../ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
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
import useAccountOperations from "@/api/accountPage/useAccountOperations";
import { getPageUrlParams } from "@/lib/utils";
import JumpToPage from "../JumpToPage";
import { dataToURL } from "@/utils/Hooks";
import { getOperationButtonTitle } from "@/utils/UI";
import BlockSearch from "./searches/BlockSearch";
import AccountSearch from "./searches/AccountSearch";

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

  const startAccountOperationsSearch = async (accountOperationsSearchProps: Explorer.AccountSearchOperationsProps) => {
      setLastSearchKey("account");
      setAccountOperationsPage(undefined);
      setAccountOperationsSearchProps(accountOperationsSearchProps);
      setPreviousAccountOperationsSearchProps(accountOperationsSearchProps);
  };

  const startBlockSearch = async (blockSearchProps: Explorer.BlockSearchProps) => {
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
    <div className="mt-6 col-start-1 col-span-4 md:col-span-1 mb-6 md:mb-0 flex flex-col gap-y-6"  data-testid="block-search-section">
      <div className=' bg-explorer-dark-gray p-4 h-fit rounded'>
        <div className="text-center text-xl">Search</div>
        <Accordion
          type="single"
          className="w-full"
          value={accordionValue}
          onValueChange={setAccordionValue}
        >
          <BlockSearch 
            startBlockSearch={startBlockSearch}
            operationsTypes={operationsTypes}
            loading={blockSearch.blockSearchDataLoading}
          />
          <AccountSearch 
            startAccountOperationsSearch={startAccountOperationsSearch}
            operationsTypes={operationsTypes}
            loading={accountOperations.isAccountOperationsLoading}
          />
          <AccordionItem value="comment">
            <AccordionTrigger>Comment search</AccordionTrigger>
            <AccordionContent className="px-2 flex flex-col gap-y-4">
              <p className="ml-2">
                Find all operations related to comments of given account or for
                exact permlink.
              </p>
              <div className="flex flex-col">
                <label className="ml-2">Account name *</label>
                <Input
                  className="w-1/2 md:w-1/3 bg-gray-700"
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
              <div className="flex flex-col">
                <label className="ml-2">Permlink</label>
                <Input
                  className="w-full bg-gray-700"
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
              <div className="flex items-center">
                <OperationTypesDialog
                  operationTypes={operationsTypes?.filter((opType) =>
                    config.commentOperationsTypeIds.includes(opType.op_type_id)
                  )}
                  selectedOperations={selectedCommentSearchOperationTypes}
                  setSelectedOperations={setSelectedCommentSearchOperationTypes}
                  buttonClassName="bg-gray-500"
                  triggerTitle={getOperationButtonTitle(selectedOperationTypes, operationsTypes)}
                />
              </div>
              <div className="flex items-center">
                <Button
                  className=" bg-blue-800 hover:bg-blue-600 rounded"
                  onClick={startCommentSearch}
                  disabled={!accountName}
                >
                  <span>Search</span>{" "}
                  {commentSearch.commentSearchDataLoading && (
                    <Loader2 className="animate-spin h-4 w-4  ..." />
                  )}
                </Button>
                {!accountName && (
                  <label className=" text-muted-foreground">
                    Set account name
                  </label>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      {blockSearch.blockSearchData && lastSearchKey === "block" && (
        <div className=' bg-explorer-dark-gray p-2 md: h-fit rounded'>
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
              <div className="flex justify-center w-full">
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
              <Button className=" bg-blue-800 hover:bg-blue-600 rounded">
                Go to result page
              </Button>
            </Link>

            <div className="flex justify-center items-center text-black">
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
              <Button className=" bg-blue-800 hover:bg-blue-600 rounded">
                Go to result page
              </Button>
            </Link>

            <div className="flex justify-center items-center text-black">
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
