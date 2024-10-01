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
  const [isAllSearchLoading, setIsAllSearchLoading] = useState<boolean>(false);

  const searchesRef = useRef<HTMLDivElement | null>(null);

  const { operationsTypes } = useOperationTypes() || [];
  const commentSearch = useCommentSearch(commentSearchProps);
  const blockSearch = useBlockSearch(blockSearchProps);
  const accountOperations = useAccountOperations(accountOperationsSearchProps);

  const searchRanges = useSearchRanges("lastBlocks");

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

  useEffect(() => {
    const wasActualized =
      (accountOperations &&
        !accountOperations.isAccountOperationsLoading &&
        lastSearchKey === "account") ||
      (blockSearch &&
        !blockSearch.blockSearchDataLoading &&
        lastSearchKey === "block") ||
      (commentSearch &&
        !commentSearch.commentSearchDataLoading &&
        lastSearchKey === "comment");
    if (isAllSearchLoading && wasActualized) {
      searchesRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setIsAllSearchLoading(false);
    }
  }, [
    accountOperations,
    lastSearchKey,
    blockSearch,
    commentSearch,
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
                  loading={blockSearch.blockSearchDataLoading}
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
            <AccordionItem value="comment">
              <AccordionTrigger className="p-3 mb-2">
                Comment search
              </AccordionTrigger>
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
        </CardContent>
      </Card>
      <div
        className="pt-4 scroll-mt-16"
        ref={searchesRef}
      >
        {blockSearch.blockSearchData && lastSearchKey === "block" && (
          <div
            className=" bg-explorer-gray-light dark:bg-explorer-gray-dark p-2 md: h-fit rounded"
            data-testid="result-section"
          >
            <div
              className="text-center"
              data-testid="result-section-header"
            >
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
                <Button data-testid="go-to-result-page">
                  Go to result page
                </Button>
              </Link>

              <div className="flex justify-center items-center text-black dark:text-white">
                <CustomPagination
                  currentPage={commentPaginationPage}
                  totalCount={commentSearch.commentSearchData?.total_operations}
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
                  commentSearch.commentSearchData.operations_result
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
