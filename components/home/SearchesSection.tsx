import Explorer from "@/types/Explorer";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
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
import useOperationTypes from "@/api/common/useOperationsTypes";
import useSearchRanges from "../searchRanges/useSearchRanges";
import useAccountOperations from "@/api/accountPage/useAccountOperations";
import {
  convertBooleanArrayToIds,
  convertCommentsOperationResultToTableOperations,
  convertIdsToBooleanArray,
  convertOperationResultsToTableOperations,
  getPageUrlParams,
} from "@/lib/utils";
import JumpToPage from "../JumpToPage";
import { dataToURL, useOperationsFormatter } from "@/utils/Hooks";
import BlockSearch from "./searches/BlockSearch";
import AccountSearch from "./searches/AccountSearch";
import CommentsSearch from "./searches/CommentsSearch";
import { useUserSettingsContext } from "../contexts/UserSettingsContext";
import Hive from "@/types/Hive";
import OperationsTable from "../OperationsTable";

interface SearchesSectionProps {}

const SearchesSection: React.FC<SearchesSectionProps> = ({}) => {
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

  const { operationsTypes } = useOperationTypes() || [];
  const commentSearch = useCommentSearch(commentSearchProps);
  const blockSearch = useBlockSearch(blockSearchProps);
  const accountOperations = useAccountOperations(accountOperationsSearchProps);

  const searchRanges = useSearchRanges("lastBlocks");

  const { settings } = useUserSettingsContext();

  const formattedAccountOperations = useOperationsFormatter(
    accountOperations.accountOperations
  ) as Hive.AccountOperationsResponse;
  const formattedCommentOperations = useOperationsFormatter(
    commentSearch.commentSearchData
  ) as Hive.CommentOperationResponse;

  useEffect(() => {
    if (!accountOperationsPage && accountOperations) {
      setAccountOperationsPage(
        accountOperations?.accountOperations?.total_pages
      );
    }
  }, [accountOperations, accountOperationsPage]);

  const startCommentSearch = async (
    commentSearchProps: Explorer.CommentSearchParams
  ) => {
    const { filters, ...params } = commentSearchProps;
    const props: Explorer.CommentSearchProps = {
      ...params,
      accountName: params.accountName || "",
      operationTypes: convertBooleanArrayToIds(filters || []),
    };
    setCommentSearchProps(props);
    setCommentPaginationPage(1);
    setPreviousCommentSearchProps(props);
    setLastSearchKey("comment");
  };

  const startAccountOperationsSearch = async (
    accountOperationsSearchProps: Explorer.AccountSearchOperationsProps
  ) => {
    setLastSearchKey("account");
    setAccountOperationsPage(undefined);
    setAccountOperationsSearchProps(accountOperationsSearchProps);
    setPreviousAccountOperationsSearchProps(accountOperationsSearchProps);
  };

  const startBlockSearch = async (
    blockSearchProps: Explorer.BlockSearchProps
  ) => {
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

  const getCommentPageLink = () => {
    const urlParams: Explorer.UrlParam[] = [
      {
        paramName: "fromBlock",
        paramValue: dataToURL(commentSearchProps?.fromBlock),
      },
      {
        paramName: "toBlock",
        paramValue: dataToURL(commentSearchProps?.toBlock),
      },
      {
        paramName: "filters",
        paramValue: dataToURL(
          convertIdsToBooleanArray(commentSearchProps?.operationTypes || [])
        ),
      },
      {
        paramName: "rangeSelectKey",
        paramValue: dataToURL(searchRanges.rangeSelectKey),
      },
      {
        paramName: "lastTime",
        paramValue: dataToURL(searchRanges.lastTimeUnitValue),
      },
      {
        paramName: "lastBlocks",
        paramValue: dataToURL(searchRanges.lastBlocksValue),
      },
      {
        paramName: "timeUnit",
        paramValue: dataToURL(searchRanges.timeUnitSelectKey),
      },
      {
        paramName: "permlink",
        paramValue: dataToURL(commentSearchProps?.permlink),
      },
    ];
    return `/comments/@${dataToURL(
      commentSearchProps?.accountName
    )}${getPageUrlParams(urlParams)}`;
  };

  const getAccountPageLink = (accountName: string) => {
    const urlParams: Explorer.UrlParam[] = [
      {
        paramName: "fromBlock",
        paramValue: dataToURL(accountOperationsSearchProps?.fromBlock),
      },
      {
        paramName: "toBlock",
        paramValue: dataToURL(accountOperationsSearchProps?.toBlock),
      },
      {
        paramName: "startDate",
        paramValue: dataToURL(accountOperationsSearchProps?.startDate),
      },
      {
        paramName: "endDate",
        paramValue: dataToURL(accountOperationsSearchProps?.endDate),
      },
      {
        paramName: "filters",
        paramValue: dataToURL(
          convertIdsToBooleanArray(
            accountOperationsSearchProps?.operationTypes || []
          )
        ),
      },
      {
        paramName: "rangeSelectKey",
        paramValue: dataToURL(searchRanges.rangeSelectKey),
      },
    ];

    if (searchRanges.rangeSelectKey === "lastTime") {
      urlParams.push({
        paramName: "lastTime",
        paramValue: dataToURL(searchRanges.lastTimeUnitValue),
      });
      urlParams.push({
        paramName: "timeUnit",
        paramValue: dataToURL(searchRanges.timeUnitSelectKey),
      });
    }

    if (searchRanges.rangeSelectKey === "lastBlocks") {
      urlParams.push({
        paramName: "lastBlocks",
        paramValue: dataToURL(searchRanges.lastBlocksValue),
      });
    }

    return `/@${accountName}${getPageUrlParams(urlParams)}`;
  };

  const getBlockPageLink = (blockNumber: number) => {
    const urlParams: Explorer.UrlParam[] = [
      {
        paramName: "filters",
        paramValue: dataToURL(
          convertIdsToBooleanArray(blockSearchProps?.operationTypes || [])
        ),
      },
    ];
    return `/block/${blockNumber}${getPageUrlParams(urlParams)}`;
  };

  return (
    <div
      className="mt-6 col-start-1 col-span-4 md:col-span-1 mb-6 md:mb-0 flex flex-col gap-y-6"
      data-testid="block-search-section"
    >
      <div className=" bg-explorer-dark-gray p-4 h-fit rounded">
        <div className="text-center text-xl">Search</div>
        <Accordion
          type="single"
          className="w-full"
          value={accordionValue}
          onValueChange={setAccordionValue}
        >
          <AccordionItem value="block">
            <AccordionTrigger>Block Search</AccordionTrigger>
            <AccordionContent className="px-2 flex flex-col gap-y-4">
              <BlockSearch
                startBlockSearch={startBlockSearch}
                operationsTypes={operationsTypes}
                loading={blockSearch.blockSearchDataLoading}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="account">
            <AccordionTrigger>Account search</AccordionTrigger>
            <AccordionContent className="px-2 flex flex-col gap-y-4">
              <AccountSearch
                startAccountOperationsSearch={startAccountOperationsSearch}
                operationsTypes={operationsTypes}
                loading={accountOperations.isAccountOperationsLoading}
                searchRanges={searchRanges}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="comment">
            <AccordionTrigger>Comment search</AccordionTrigger>
            <AccordionContent className="px-2 flex flex-col gap-y-4">
              <CommentsSearch
                startCommentsSearch={(params) => startCommentSearch(params)}
                operationsTypes={operationsTypes}
                loading={commentSearch.commentSearchDataLoading}
                searchRanges={searchRanges}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      {blockSearch.blockSearchData && lastSearchKey === "block" && (
        <div
          className=" bg-explorer-dark-gray p-2 md: h-fit rounded"
          data-testid="result-section"
        >
          <div className="text-center" data-testid="result-section-header">
            Results:
          </div>
          <div className="flex flex-wrap">
            {blockSearch.blockSearchData.length > 0 ? (
              blockSearch.blockSearchData.map((blockId) => (
                <Link
                  key={blockId}
                  href={getBlockPageLink(blockId)}
                  data-testid="result-block"
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
      {!!commentSearch.commentSearchData &&
        lastSearchKey === "comment" &&
        (!!commentSearch.commentSearchData.total_operations ? (
          <div>
            <Link href={getCommentPageLink()}>
              <Button
                className=" bg-blue-800 hover:bg-blue-600 rounded"
                data-testid="go-to-result-page"
              >
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

            {settings.rawJsonView ? (
              commentSearch.commentSearchData?.operations_result.map(
                (foundOperation) => (
                  <DetailedOperationCard
                    className="my-6"
                    operation={foundOperation.operation}
                    key={foundOperation.operation_id}
                    blockNumber={foundOperation.block_num}
                    date={foundOperation.created_at}
                  />
                )
              )
            ) : (
              <OperationsTable
                operations={convertCommentsOperationResultToTableOperations(
                  formattedCommentOperations?.operations_result
                )}
              />
            )}
          </div>
        ) : (
          <div className="flex justify-center w-full text-black">
            No operations matching given criteria
          </div>
        ))}
      {!!accountOperations.accountOperations &&
        lastSearchKey === "account" &&
        (!!accountOperations.accountOperations.total_operations ? (
          <div data-testid="operations-card">
            <Link
              href={getAccountPageLink(
                previousAccountOperationsSearchProps?.accountName || ""
              )}
            >
              <Button
                className=" bg-blue-800 hover:bg-blue-600 rounded"
                data-testid="go-to-result-page"
              >
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

            {settings.rawJsonView ? (
              accountOperations.accountOperations?.operations_result.map(
                (foundOperation) => (
                  <DetailedOperationCard
                    className="my-6"
                    operation={foundOperation.operation}
                    key={foundOperation.operation_id}
                    blockNumber={foundOperation.block_num}
                    date={new Date(foundOperation.timestamp)}
                  />
                )
              )
            ) : (
              <OperationsTable
                operations={convertOperationResultsToTableOperations(
                  formattedAccountOperations?.operations_result
                )}
              />
            )}
          </div>
        ) : (
          <div className="flex justify-center w-full text-black">
            No operations matching given criteria
          </div>
        ))}
    </div>
  );
};

export default SearchesSection;
