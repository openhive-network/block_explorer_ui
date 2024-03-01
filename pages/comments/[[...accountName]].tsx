import React, { use, useEffect, useRef, useState } from "react";
import { config } from "@/Config";
import useCommentSearch from "@/api/common/useCommentSearch";
import CustomPagination from "@/components/CustomPagination";
import DetailedOperationCard from "@/components/DetailedOperationCard";
import Explorer from "@/types/Explorer";
import useOperationTypes from "@/api/common/useOperationsTypes";
import JumpToPage from "@/components/JumpToPage";
import { dataToURL, useURLParams } from "@/utils/Hooks";
import CommentsSearch from "@/components/home/searches/CommentsSearch";
import { useRouter } from "next/router";
import { formatAccountName } from "@/utils/StringUtils";
import useSearchRanges from "@/components/searchRanges/useSearchRanges";
import { getPageUrlParams } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const defaultSearchParams: Explorer.CommentSearchParams = {
  accountName: undefined,
  permlink: undefined,
  fromBlock: undefined,
  toBlock: undefined,
  startDate: undefined,
  endDate: undefined,
  lastBlocks: undefined,
  lastTime: undefined,
  timeUnit: "days",
  rangeSelectKey: "none",
  page: 1,
  operationTypes: undefined,
};

const Comments: React.FC = () => {
  const [initialSearch, setInitialSearch] = useState(false);
  const [commentSearchProps, setCommentSearchProps] = useState<
    Explorer.CommentSearchProps | undefined
  >(undefined);
  const [previousCommentSearchProps, setPreviousCommentSearchProps] = useState<
    Explorer.CommentSearchProps | undefined
  >(undefined);

  const router = useRouter();
  const searchRanges = useSearchRanges();

  const commentSearch = useCommentSearch(formatSearchProps(commentSearchProps));
  const { paramsState, setParams } = useURLParams(defaultSearchParams, [
    "accountName",
    "permlink",
  ]);

  const operationsTypes =
    useOperationTypes().operationsTypes?.filter((operation) =>
      config.commentOperationsTypeIds.includes(operation.op_type_id)
    ) || [];

  const startCommentSearch = async (props: Explorer.CommentSearchParams) => {
    if (!!props.accountName) {
      setCommentSearchProps(props as Explorer.CommentSearchProps);
      setPreviousCommentSearchProps(props as Explorer.CommentSearchProps);
      setParams({ ...paramsState, ...props });
      setInitialSearch(true);
    }
  };

  function formatSearchProps(props?: Explorer.CommentSearchProps) {
    if (props) {
      if (Array.isArray(props.accountName)) {
        props.accountName = formatAccountName(props.accountName[0]);
      } else {
        props.accountName = formatAccountName(props.accountName);
      }
    }
    return props;
  }

  const changeCommentSearchPagination = (newPageNum: number) => {
    if (previousCommentSearchProps?.accountName) {
      const newSearchProps: Explorer.CommentSearchProps = {
        ...previousCommentSearchProps,
        pageNumber: newPageNum,
      };
      setCommentSearchProps(newSearchProps);
      setParams({ ...paramsState, page: newPageNum });
    }
  };

  useEffect(() => {
    if (paramsState && !initialSearch) {
      startCommentSearch(paramsState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsState]);

  return (
    <div className="w-full md:w-4/5" data-testid="comments-search-comments-page">
      <Card>
        <CardContent className="py-2">
          <CommentsSearch
            startCommentsSearch={startCommentSearch}
            operationsTypes={operationsTypes}
            data={paramsState}
            loading={commentSearch.commentSearchDataLoading}
          />
        </CardContent>
      </Card>
      {commentSearch.commentSearchData && (
        <>
          <div className="w-full flex justify-center items-center mt-4">
            <CustomPagination
              currentPage={paramsState.page}
              totalCount={commentSearch.commentSearchData?.total_operations}
              pageSize={config.standardPaginationSize}
              onPageChange={changeCommentSearchPagination}
              shouldScrollToTop={false}
            />
            <div className="justify-self-end">
              <JumpToPage
                currentPage={paramsState.page}
                onPageChange={changeCommentSearchPagination}
              />
            </div>
          </div>
          {commentSearch.commentSearchData?.operations_result?.map(
            (foundOperation) => (
              <DetailedOperationCard
                className="my-6 text-white"
                operation={foundOperation.body}
                key={foundOperation.operation_id}
                blockNumber={foundOperation.block_num}
                date={foundOperation.created_at}
              />
            )
          )}
        </>
      )}
    </div>
  );
};

export default Comments;
