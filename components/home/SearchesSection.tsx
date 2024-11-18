// TODO:
//  This component should be devided to separate components
// Create seprate components to handle logic by search
// Create separate components for search results based on search

// TODO#2:
// Logic for url bulding could be simplified by using URLSearchParams API
// logic in some useEffects also should be simplified

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

import { config } from "@/Config";
import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";
import {
  convertBooleanArrayToIds,
  convertCommentsOperationResultToTableOperations,
  convertIdsToBooleanArray,
  convertOperationResultsToTableOperations,
  getPageUrlParams,
} from "@/lib/utils";
import { dataToURL } from "@/utils/URLutils";
import useCommentSearch from "@/hooks/api/common/useCommentSearch";
import useBlockSearch from "@/hooks/api/homePage/useBlockSearch";
import useOperationTypes from "@/hooks/api/common/useOperationsTypes";
import useSearchRanges from "../../hooks/common/useSearchRanges";
import useAccountOperations from "@/hooks/api/accountPage/useAccountOperations";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import JumpToPage from "../JumpToPage";
import BlockSearch from "./searches/BlockSearch";
import AccountSearch from "./searches/AccountSearch";
import CommentsSearch from "./searches/CommentsSearch";
import CommentsPermlinkSearch from "./searches/CommentPermlinkSearch";
import OperationsTable from "../OperationsTable";
import CustomPagination from "../CustomPagination";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import usePermlinkSearch from "@/hooks/api/common/usePermlinkSearch";
import CommentPermlinkResultTable from "./searches/CommentPermlinkResultTable";

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
    "block" | "account" | "comment" | "comment-permlink" | undefined
  >(undefined);
  const [blockSearchProps, setBlockSearchProps] = useState<
    Explorer.BlockSearchProps | undefined
  >(undefined);
  const [commentSearchProps, setCommentSearchProps] = useState<
    Explorer.CommentSearchProps | undefined
  >(undefined);
  const [permlinkSearchProps, setPermlinkSearchProps] = useState<
    Explorer.PermlinkSearchProps | undefined
  >(undefined);
  const [accountOperationsSearchProps, setAccountOperationsSearchProps] =
    useState<Explorer.AccountSearchOperationsProps | undefined>(undefined);
  const [isAllSearchLoading, setIsAllSearchLoading] = useState<boolean>(false);

  const searchesRef = useRef<HTMLDivElement | null>(null);

  const { operationsTypes } = useOperationTypes() || [];

  const { permlinkSearchData, permlinkSearchDataLoading } =
    usePermlinkSearch(permlinkSearchProps);

  const { commentSearchData, commentSearchDataLoading } =
    useCommentSearch(commentSearchProps);

  const { blockSearchData, blockSearchDataLoading } =
    useBlockSearch(blockSearchProps);

  const accountOperations = useAccountOperations(accountOperationsSearchProps);

  const searchRanges = useSearchRanges("lastBlocks");

  const formattedAccountOperations = useOperationsFormatter(
    accountOperations.accountOperations
  ) as Hive.AccountOperationsResponse;
  const formattedCommentOperations = useOperationsFormatter(
    commentSearchData
  ) as Hive.CommentOperationResponse;

  useEffect(() => {
    if (!accountOperationsPage && accountOperations) {
      setAccountOperationsPage(
        accountOperations?.accountOperations?.total_pages
      );
    }
  }, [accountOperations, accountOperationsPage]);

  useEffect(() => {
    const wasActualized =
      (accountOperations &&
        !accountOperations.isAccountOperationsLoading &&
        lastSearchKey === "account") ||
      (!blockSearchDataLoading && lastSearchKey === "block") ||
      (commentSearchData &&
        !commentSearchDataLoading &&
        lastSearchKey === "comment");
    permlinkSearchData &&
      !permlinkSearchDataLoading &&
      lastSearchKey === "comment-permlink";
    if (isAllSearchLoading && wasActualized) {
      searchesRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setIsAllSearchLoading(false);
    }
  }, [
    accountOperations,
    permlinkSearchData,
    permlinkSearchDataLoading,
    lastSearchKey,
    blockSearchDataLoading,
    commentSearchData,
    commentSearchDataLoading,
    isAllSearchLoading,
  ]);

  const startCommentSearch = async (
    commentSearchProps: Explorer.CommentSearchParams
  ) => {
    const { filters, ...params } = commentSearchProps;
    const props: Explorer.CommentSearchProps = {
      ...params,
      accountName: params.accountName || "",
      operationTypes:
        filters && filters.length
          ? convertBooleanArrayToIds(filters)
          : undefined,
    };
    setIsAllSearchLoading(true);
    setCommentSearchProps(props);
    setCommentPaginationPage(1);
    setPreviousCommentSearchProps(props);
    setLastSearchKey("comment");
  };

  const startCommentPermlinkSearch = async (
    commentPermlinkSearchProps: Explorer.CommentPermlinSearchParams
  ) => {
    const { ...params } = commentPermlinkSearchProps;
    const props: Explorer.PermlinkSearchProps = {
      ...params,
      accountName: params.accountName || "",
    };
    setIsAllSearchLoading(true);
    setPermlinkSearchProps(props);
    setCommentPaginationPage(1);
    setLastSearchKey("comment-permlink");
  };

  const startAccountOperationsSearch = async (
    accountOperationsSearchProps: Explorer.AccountSearchOperationsProps
  ) => {
    setIsAllSearchLoading(true);
    setLastSearchKey("account");
    setAccountOperationsPage(undefined);
    setAccountOperationsSearchProps(accountOperationsSearchProps);
    setPreviousAccountOperationsSearchProps(accountOperationsSearchProps);
  };

  const startBlockSearch = async (
    blockSearchProps: Explorer.BlockSearchProps
  ) => {
    setIsAllSearchLoading(true);
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

    if (commentSearchProps?.operationTypes) {
      urlParams.push({
        paramName: "filters",
        paramValue: dataToURL(
          convertIdsToBooleanArray(commentSearchProps?.operationTypes)
        ),
      });
    }

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
        paramName: "fromDate",
        paramValue: dataToURL(accountOperationsSearchProps?.startDate),
      },
      {
        paramName: "toDate",
        paramValue: dataToURL(accountOperationsSearchProps?.endDate),
      },
      {
        paramName: "rangeSelectKey",
        paramValue: dataToURL(searchRanges.rangeSelectKey),
      },
    ];

    if (!!accountOperationsSearchProps?.operationTypes) {
      urlParams.push({
        paramName: "filters",
        paramValue: dataToURL(
          convertIdsToBooleanArray(accountOperationsSearchProps?.operationTypes)
        ),
      });
    }

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
        paramName: "accountName",
        paramValue: dataToURL(blockSearchProps?.accountName),
      },
      {
        paramName: "keyContent",
        paramValue: dataToURL(blockSearchProps?.deepProps.content),
      },
      {
        paramName: "setOfKeys",
        paramValue: dataToURL(blockSearchProps?.deepProps.keys),
      },
    ];

    if (blockSearchProps?.operationTypes) {
      const booleanTypesArray = convertIdsToBooleanArray(
        blockSearchProps?.operationTypes
      );
      let isFull = !!blockSearchProps?.operationTypes;
      operationsTypes?.forEach((operationType) => {
        if (
          !blockSearchProps?.operationTypes?.includes(operationType.op_type_id)
        )
          isFull = false;
      });
      urlParams.push({
        paramName: "filters",
        paramValue: dataToURL(!isFull ? booleanTypesArray : []),
      });
    }

    return `/block/${blockNumber}${getPageUrlParams(urlParams)}`;
  };

  return (
    <>
      <Card
        className="mt-4"
        data-testid="block-search-section"
      >
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion
            type="single"
            className="w-full"
            value={accordionValue}
            onValueChange={setAccordionValue}
          >
            <AccordionItem value="block">
              <AccordionTrigger className="p-3 mb-2">
                Block Search
              </AccordionTrigger>
              <AccordionContent className="px-2 flex flex-col gap-y-4">
                <BlockSearch
                  startBlockSearch={startBlockSearch}
                  operationsTypes={operationsTypes}
                  loading={blockSearchDataLoading}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="account">
              <AccordionTrigger className="p-3 mb-2">
                Account search
              </AccordionTrigger>
              <AccordionContent className="px-2 flex flex-col gap-y-4">
                <AccountSearch
                  startAccountOperationsSearch={startAccountOperationsSearch}
                  operationsTypes={operationsTypes}
                  loading={accountOperations.isAccountOperationsLoading}
                  searchRanges={searchRanges}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="comment-permlink">
              <AccordionTrigger className="p-3 mb-2">
                Comment permlink search
              </AccordionTrigger>
              <AccordionContent className="px-2 flex flex-col gap-y-4">
                <CommentsPermlinkSearch
                  startCommentPermlinkSearch={(params) =>
                    startCommentPermlinkSearch(params)
                  }
                  loading={permlinkSearchDataLoading}
                  searchRanges={searchRanges}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="comment">
              <AccordionTrigger className="p-3 mb-2">
                Comment search
              </AccordionTrigger>
              <AccordionContent className="px-2 flex flex-col gap-y-4">
                <CommentsSearch
                  startCommentsSearch={(params) => startCommentSearch(params)}
                  operationsTypes={operationsTypes}
                  loading={commentSearchDataLoading}
                  searchRanges={searchRanges}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      <div
        className="pt-4 scroll-mt-16"
        ref={searchesRef}
      >
        {blockSearchData && lastSearchKey === "block" && (
          <div
            className="bg-theme dark:bg-theme p-2 md: h-fit rounded"
            data-testid="result-section"
          >
            <div
              className="text-center"
              data-testid="result-section-header"
            >
              Results:
            </div>
            <div className="flex flex-wrap">
              {blockSearchData.blocks_result.length > 0 ? (
                blockSearchData.blocks_result.map(({ block_num }) => (
                  <Link
                    key={block_num}
                    href={getBlockPageLink(block_num)}
                    data-testid="result-block"
                  >
                    <div className="m-1 border border-solid p-1">
                      {block_num}
                    </div>
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
        {permlinkSearchData && lastSearchKey === "comment-permlink" && (
          <div>
            <div
              className="text-center my-5"
              data-testid="result-section-header"
            >
              Results:
            </div>
            <div className="flex flex-wrap">
              {permlinkSearchData.total_permlinks > 0 ? (
                <CommentPermlinkResultTable
                  data={permlinkSearchData.permlinks_result}
                  accountName={permlinkSearchProps?.accountName}
                />
              ) : (
                <div className="flex justify-center w-full">
                  No permlinks matching given criteria
                </div>
              )}
            </div>
          </div>
        )}
        {commentSearchData &&
          lastSearchKey === "comment" &&
          (!!commentSearchData?.total_operations ? (
            <div>
              <Link href={getCommentPageLink()}>
                <Button data-testid="go-to-result-page">
                  Go to result page
                </Button>
              </Link>

              <div className="flex justify-center items-center text-black dark:text-white">
                <CustomPagination
                  currentPage={commentPaginationPage}
                  totalCount={commentSearchData.total_operations}
                  pageSize={config.standardPaginationSize}
                  onPageChange={changeCommentSearchPagination}
                />
              </div>
              <div className="flex justify-end items-center mb-4">
                <JumpToPage
                  currentPage={commentPaginationPage}
                  onPageChange={changeCommentSearchPagination}
                />
              </div>

              <OperationsTable
                operations={convertCommentsOperationResultToTableOperations(
                  formattedCommentOperations?.operations_result
                )}
                unformattedOperations={convertCommentsOperationResultToTableOperations(
                  commentSearchData.operations_result
                )}
              />
            </div>
          ) : (
            <div className="flex justify-center w-full text-black dark:text-white">
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
                <Button data-testid="go-to-result-page">
                  Go to result page
                </Button>
              </Link>

              <div className="flex justify-center items-center text-black dark:text-white">
                <CustomPagination
                  currentPage={accountOperationsPage || 1}
                  totalCount={
                    accountOperations.accountOperations?.total_operations
                  }
                  pageSize={config.standardPaginationSize}
                  onPageChange={changeAccountOperationsPagination}
                  isMirrored={true}
                />
              </div>
              <div className="flex justify-end items-center mb-4">
                <JumpToPage
                  currentPage={accountOperationsPage || 1}
                  onPageChange={changeAccountOperationsPagination}
                />
              </div>

              <OperationsTable
                operations={convertOperationResultsToTableOperations(
                  formattedAccountOperations?.operations_result
                )}
                unformattedOperations={convertOperationResultsToTableOperations(
                  accountOperations.accountOperations.operations_result
                )}
              />
            </div>
          ) : (
            <div className="flex justify-center w-full text-black dark:text-white">
              No operations matching given criteria
            </div>
          ))}
      </div>
    </>
  );
};

export default SearchesSection;
