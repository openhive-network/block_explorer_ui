import React, { use, useEffect, useRef, useState } from "react";
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
import { useURLParams } from "@/utils/Hooks";

const FILTERS = "filters";
const SPLIT = "-";

interface SearchParams {
  accountName: string | undefined;
  permlink: string | undefined;
  fromBlock: number | undefined;
  toBlock: number | undefined;
  page: number;
  filters: number[];
}

const defaultSearchParams: SearchParams = {
  page: 1,
  filters: [],
  accountName: undefined,
  fromBlock: undefined,
  toBlock: undefined,
  permlink: undefined,
}

const Comments: React.FC = () => {
  const [accountName, setAccountName] = useState<string>(); 
  const [permlink, setPermlink] = useState<string>();
  const [fromBlock, setFromBlock] = useState<number>();
  const [toBlock, setToBlock] = useState<number>();
  const [initialSearch, setInitialSearch] = useState(false);
  const [commentSearchProps, setCommentSearchProps] = useState<
    Explorer.CommentSearchProps | undefined
  >(undefined);
  const [previousCommentSearchProps, setPreviousCommentSearchProps] = useState<
    Explorer.CommentSearchProps | undefined
  >(undefined);
  const router = useRouter();

  const commentSearch = useCommentSearch(commentSearchProps);
  
  const { paramsState, setParams } = useURLParams(defaultSearchParams);

  const operationsTypes =
    useOperationTypes().operationsTypes?.filter((operation) =>
      config.commentOperationsTypeIds.includes(operation.op_type_id)
    ) || [];

  const startCommentSearch = (params: SearchParams) => {
    if (params.accountName) {
      setParams(params);
      if (!initialSearch) {
        setAccountName(params.accountName);
        setPermlink(params.permlink);
        setFromBlock(params.fromBlock);
        setToBlock(params.toBlock);
      }
      setInitialSearch(true);
      const commentSearchProps: Explorer.CommentSearchProps = {
        accountName: params.accountName,
        permlink: params.permlink,
        fromBlock: params.fromBlock,
        toBlock: params.toBlock,
        operations: !!params.filters?.length ? params.filters : undefined,
      };
      setCommentSearchProps(commentSearchProps);
      setPreviousCommentSearchProps(commentSearchProps);
      setParams(params);
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

  const handleFiltersChange = (filters: number[]) => {
    const newSearchParams = { ...paramsState, filters: filters, page: 1 };
    startCommentSearch(newSearchParams);
    setParams(newSearchParams);
  };

  useEffect(() => {
    if (paramsState && !initialSearch) {
      startCommentSearch(paramsState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query, paramsState]);

  return (
    <div className="w-full md:w-4/5">
      <div className="bg-explorer-dark-gray text-white p-4 rounded-[6px] w-full">
        <div className="flex flex-col m-2">
          <label className="mx-2">Account name</label>
          <Input
            className="w-1/2"
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(!!e.target.value.length ? e.target.value : undefined)}
            placeholder="---"
          />
        </div>
        <div className="flex m-2 flex-col">
          <label className="mx-2">Permlink</label>
          <Input
            className="w-full"
            type="text"
            value={permlink}
            onChange={(e) => setPermlink(!!e.target.value.length ? e.target.value : undefined)}
            placeholder="---"
          />
        </div>
        <div className="flex items-center m-2">
          <div className="flex flex-col w-full">
            <label className="mx-2">From block</label>
            <Input
              type="number"
              value={fromBlock}
              onChange={(e) => setFromBlock(Number(e.target.value))}
              placeholder="1"
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="mx-2">To block</label>
            <Input
              type="number"
              value={toBlock}
              onChange={(e) => setToBlock(Number(e.target.value))}
              placeholder={"Headblock"}
            />
          </div>
        </div>
        <div className="flex items-center justify-between m-2">
          <Button
            className=" bg-blue-800 hover:bg-blue-600 rounded-[4px]"
            onClick={() => startCommentSearch({...paramsState, accountName, permlink, fromBlock, toBlock})}
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
            selectedOperations={paramsState.filters || []}
            colorClass="bg-gray-500 ml-2"
            triggerTitle={"Operation Filters"}
          />
        </div>
      </div>
      {commentSearch.commentSearchData && (
        <>
          <div className="w-full flex justify-center mt-4">
            <CustomPagination
              currentPage={paramsState.page}
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
