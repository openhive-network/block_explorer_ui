import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { config } from "@/Config";
import useCommentSearch from "@/api/common/useCommentSearch";
import CustomPagination from "@/components/CustomPagination";
import DetailedOperationCard from "@/components/DetailedOperationCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Explorer from "@/types/Explorer";
import useOperationTypes from "@/api/common/useOperationsTypes";
import OperationTypesDialog from "@/components/OperationTypesDialog";

const COMMENT_OPERATIONS = [1, 19, 53, 61, 63, 0, 72];
const FILTERS = "filters";
const SPLIT = "-";

const Comments: React.FC = () => {
  const [searchParams, setSearchParams] = useState<{
    accountName?: string;
    permlink?: string;
    fromBlock?: string;
    toBlock?: string;
    page: number;
  }>({ page: 1 });
  const [filters, setFilters] = useState<number[]>([]);
  const commentSearch = useCommentSearch();
  const [previousCommentSearchProps, setPreviousCommentSearchProps] = useState<
    Explorer.CommentSearchProps | undefined
  >(undefined);
  const router = useRouter();

  const { accountName, permlink, fromBlock, toBlock, page } = searchParams;

  const operationsTypes =
    useOperationTypes().operationsTypes?.filter((operation) =>
      COMMENT_OPERATIONS.includes(operation.op_type_id)
    ) || [];

  const startCommentSearch = (filters: number[]) => {
    if (accountName) {
      const commentSearchProps: Explorer.CommentSearchProps = {
        accountName,
        permlink,
        fromBlock: fromBlock ? Number(fromBlock) : undefined,
        toBlock: toBlock ? Number(toBlock) : undefined,
        operations: !!filters.length ? filters : undefined,
      };
      commentSearch.searchCommentOperations(commentSearchProps);
      setPreviousCommentSearchProps(commentSearchProps);
      let urlParams = searchParams;
      (Object.keys(searchParams) as (keyof typeof searchParams)[]).forEach(
        (key) => {
          if (!searchParams[key]) {
            delete urlParams[key];
          }
        }
      );
      router.replace({ query: { ...router.query, ...urlParams } });
    }
  };

  const changeCommentSearchPagination = (newPageNum: number) => {
    if (previousCommentSearchProps?.accountName) {
      const newSearchProps: Explorer.CommentSearchProps = {
        ...previousCommentSearchProps,
        pageNumber: newPageNum,
      };
      commentSearch.searchCommentOperations(newSearchProps);
      setSearchParams({ ...searchParams, page: newPageNum });
      router.replace({ query: { ...router.query, page: newPageNum } });
    }
  };

  const handleFiltersChange = (filters: number[]) => {
    setFilters(filters);
    startCommentSearch(filters);
    if (!!filters.length) {
      router.replace({
        query: { ...router.query, [FILTERS]: filters.join(SPLIT) },
      });
    } else {
      delete router.query[FILTERS];
      router.replace({
        query: { ...router.query },
      });
    }
  };

  useEffect(() => {
    setSearchParams({
      accountName: accountName || (router.query.accountName as string),
      permlink: router.query.permlink as string,
      fromBlock: router.query.fromBlock as string,
      toBlock: router.query.toBlock as string,
      page: Number(router.query.page) || page,
    });
    router.query[FILTERS] &&
      setFilters(
        (router.query[FILTERS] as string)
          ?.split(SPLIT)
          .map((filter) => Number(filter))
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]);

  return (
    <div className="w-full md:w-4/5">
      <div className="bg-explorer-dark-gray text-white p-4 rounded-[6px] w-full">
        <div className="flex flex-col m-2">
          <label className="mx-2">Account name</label>
          <Input
            className="w-1/2"
            type="text"
            value={accountName}
            onChange={(e) =>
              setSearchParams({ ...searchParams, accountName: e.target.value })
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
              setSearchParams({ ...searchParams, permlink: e.target.value })
            }
            placeholder="---"
          />
        </div>
        <div className="flex items-center m-2">
          <div className="flex flex-col w-full">
            <label className="mx-2">From block</label>
            <Input
              type="number"
              value={fromBlock}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  fromBlock: e.target.value,
                })
              }
              placeholder="1"
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="mx-2">To block</label>
            <Input
              type="number"
              value={toBlock}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  toBlock: e.target.value,
                })
              }
              placeholder={"Headblock"}
            />
          </div>
        </div>

        <div className="flex items-center justify-between m-2">
          <Button
            className=" bg-blue-800 hover:bg-blue-600 rounded-[4px]"
            onClick={() => startCommentSearch(filters)}
            disabled={!accountName?.length}
          >
            <span>Search</span>{" "}
            {commentSearch.commentSearchDataLoading && (
              <Loader2 className="animate-spin mt-1 h-4 w-4 ml-3 ..." />
            )}
          </Button>
          <OperationTypesDialog
            operationTypes={operationsTypes}
            setSelectedOperations={handleFiltersChange}
            selectedOperations={filters}
            colorClass="bg-gray-500 ml-2"
            triggerTitle={"Operation Filters"}
          />
        </div>
      </div>
      {commentSearch.commentSearchData && (
        <>
          <div className="w-full flex justify-center mt-4">
            <CustomPagination
              currentPage={page}
              totalCount={commentSearch.commentSearchData?.total_operations}
              pageSize={config.standardPaginationSize}
              onPageChange={changeCommentSearchPagination}
              shouldScrollToTop={false}
            />
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
