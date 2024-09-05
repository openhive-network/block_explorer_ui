import React, { useEffect, useState } from "react";

import { config } from "@/Config";
import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";
import { formatAccountName } from "@/utils/StringUtils";
import {
  convertBooleanArrayToIds,
  convertCommentsOperationResultToTableOperations,
} from "@/lib/utils";
import useCommentSearch from "@/hooks/common/useCommentSearch";
import useOperationTypes from "@/hooks/common/useOperationsTypes";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import useURLParams from "@/hooks/common/useURLParams";
import useSearchRanges from "@/hooks/common/useSearchRanges";
import CustomPagination from "@/components/CustomPagination";
import JumpToPage from "@/components/JumpToPage";
import CommentsSearch from "@/components/home/searches/CommentsSearch";
import OperationsTable from "@/components/OperationsTable";
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
  filters: undefined,
};

const Comments: React.FC = () => {
  const [initialSearch, setInitialSearch] = useState(false);
  const [commentSearchProps, setCommentSearchProps] = useState<
    Explorer.CommentSearchProps | undefined
  >(undefined);
  const [previousCommentSearchProps, setPreviousCommentSearchProps] = useState<
    Explorer.CommentSearchProps | undefined
  >(undefined);

  const searchRanges = useSearchRanges();

  const commentSearch = useCommentSearch(formatSearchProps(commentSearchProps));
  const { paramsState, setParams } = useURLParams(defaultSearchParams, [
    "accountName",
    "permlink",
  ]);

  const formattedOperations = useOperationsFormatter(
    commentSearch?.commentSearchData
  ) as Hive.CommentOperationResponse;

  const operationsTypes =
    useOperationTypes().operationsTypes?.filter((operation) =>
      config.commentOperationsTypeIds.includes(operation.op_type_id)
    ) || [];

  const startCommentSearch = async (props: Explorer.CommentSearchParams) => {
    if (!!props.accountName) {
      const searchProps = {
        ...(props as Explorer.CommentSearchProps),
        operationTypes: props.filters
          ? convertBooleanArrayToIds(props.filters)
          : undefined,
      };
      setCommentSearchProps(searchProps);
      setPreviousCommentSearchProps(searchProps);
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
    <div
      className="w-full md:w-4/5 px-2 md:px-0"
      data-testid="comments-search-comments-page"
    >
      <Card>
        <CardContent className="pt-2">
          <CommentsSearch
            startCommentsSearch={startCommentSearch}
            operationsTypes={operationsTypes}
            data={paramsState}
            loading={commentSearch.commentSearchDataLoading}
            searchRanges={searchRanges}
          />
        </CardContent>
      </Card>
      {commentSearch.commentSearchData && (
        <>
          <div className="w-full flex justify-center items-center mt-4 mb-2">
            <CustomPagination
              currentPage={paramsState.page}
              totalCount={commentSearch.commentSearchData?.total_operations}
              pageSize={config.standardPaginationSize}
              onPageChange={changeCommentSearchPagination}
            />
            <div className="justify-self-end">
              <JumpToPage
                currentPage={paramsState.page}
                onPageChange={changeCommentSearchPagination}
              />
            </div>
          </div>
          {formattedOperations?.operations_result ? (
            <OperationsTable
              operations={convertCommentsOperationResultToTableOperations(
                formattedOperations?.operations_result
              )}
              unformattedOperations={convertCommentsOperationResultToTableOperations(
                commentSearch.commentSearchData.operations_result
              )}
              className="text-white"
            />
          ) : (
            <div className="flex justify-center w-full text-black">
              No operations matching given criteria
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Comments;
