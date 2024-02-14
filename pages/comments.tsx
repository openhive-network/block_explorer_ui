import React, { use, useEffect, useRef, useState } from "react";
import { config } from "@/Config";
import useCommentSearch from "@/api/common/useCommentSearch";
import CustomPagination from "@/components/CustomPagination";
import DetailedOperationCard from "@/components/DetailedOperationCard";
import Explorer from "@/types/Explorer";
import useOperationTypes from "@/api/common/useOperationsTypes";
import JumpToPage from "@/components/JumpToPage";
import { useURLParams } from "@/utils/Hooks";
import CommentsSearch from "@/components/home/searches/CommentsSearch";
import { useUserSettingsContext } from "@/components/contexts/UserSettingsContext";
import JSONView from "@/components/JSONView";
import { useRouter } from "next/router";

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
  operationTypes: [],
};

const Comments: React.FC = () => {
  const [initialSearch, setInitialSearch] = useState(false);
  const [commentSearchProps, setCommentSearchProps] = useState<
    Explorer.CommentSearchProps | undefined
  >(undefined);
  const [previousCommentSearchProps, setPreviousCommentSearchProps] = useState<
    Explorer.CommentSearchProps | undefined
  >(undefined);
  const { settings } = useUserSettingsContext();

  const router = useRouter();

  const permlinkFromRoute = router.query.permlink;

  const commentSearch = useCommentSearch(commentSearchProps);
  const { paramsState, setParams } = useURLParams(
    defaultSearchParams,
    permlinkFromRoute
      ? [{ key: "accountName", prefix: "@" }, { key: "permlink" }]
      : [{ path: "comments" }, { key: "accountName", prefix: "@" }]
  );

  const operationsTypes =
    useOperationTypes().operationsTypes?.filter((operation) =>
      config.commentOperationsTypeIds.includes(operation.op_type_id)
    ) || [];

  const startCommentSearch = async (props: Explorer.CommentSearchParams) => {
    if (!!props.accountName) {
      props = formatAccountName(props);
      setCommentSearchProps(props as Explorer.CommentSearchProps);
      setPreviousCommentSearchProps(props as Explorer.CommentSearchProps);
      setParams({ ...paramsState, ...props });
      setInitialSearch(true);
    }
  };

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

  const formatAccountName = (params: Explorer.CommentSearchParams) => {
    params.accountName = params.accountName?.replace("@", "");
    return params;
  };

  useEffect(() => {
    if (paramsState && !initialSearch) {
      startCommentSearch(paramsState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsState]);

  return (
    <div className="w-full md:w-4/5">
      <div className="bg-explorer-dark-gray text-white p-4 rounded">
        <CommentsSearch
          startCommentsSearch={startCommentSearch}
          operationsTypes={operationsTypes}
          data={formatAccountName(paramsState)}
          loading={commentSearch.commentSearchDataLoading}
        />
      </div>
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
          {settings.rawJsonView ? (
            <JSONView
              json={commentSearch.commentSearchData?.operations_result}
              className="w-full mt-3 m-auto py-2 px-4 bg-explorer-dark-gray rounded text-white text-xs break-words break-all"
            />
          ) : (
            commentSearch.commentSearchData?.operations_result?.map(
              (foundOperation) => (
                <DetailedOperationCard
                  className="my-6 text-white"
                  operation={foundOperation.body}
                  key={foundOperation.operation_id}
                  blockNumber={foundOperation.block_num}
                  date={foundOperation.created_at}
                />
              )
            )
          )}
        </>
      )}
    </div>
  );
};

export default Comments;
