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
import JumpToPage from "@/components/JumpToPage";
import { useURLParams } from "@/utils/Hooks";
import useSearchRanges from "@/components/searchRanges/useSearchRanges";
import SearchRanges from "@/components/searchRanges/SearchRanges";

const FILTERS = "filters";
const SPLIT = "-";

interface CommentSearchParams {
  accountName: string | undefined;
  permlink: string | undefined;
  fromBlock: number | undefined;
  toBlock: number | undefined;
  startDate: Date | undefined;
  toDate: Date | undefined;
  lastBlocks: number | undefined;
  lastTime: number | undefined;
  timeUnit: string | undefined;
  rangeSelectKey: string | undefined;
  page: number;
  filters: number[];
}

const defaultSearchParams: CommentSearchParams = {
  accountName: undefined,
  permlink: undefined,
  fromBlock: undefined,
  toBlock: undefined,
  startDate: undefined,
  toDate: undefined,
  lastBlocks: undefined,
  lastTime: undefined,
  timeUnit: "days",
  rangeSelectKey: "lastBlocks",
  page: 1,
  filters: [],
};

const Comments: React.FC = () => {
  const [accountName, setAccountName] = useState<string>();
  const [permlink, setPermlink] = useState<string>();
  const [initialSearch, setInitialSearch] = useState(false);
  const [commentSearchProps, setCommentSearchProps] = useState<
    Explorer.CommentSearchProps | undefined
  >(undefined);
  const [previousCommentSearchProps, setPreviousCommentSearchProps] = useState<
    Explorer.CommentSearchProps | undefined
  >(undefined);
  const searchRanges = useSearchRanges();

  const commentSearch = useCommentSearch(commentSearchProps);
  const { paramsState, setParams } = useURLParams(defaultSearchParams);

  const operationsTypes =
    useOperationTypes().operationsTypes?.filter((operation) =>
      config.commentOperationsTypeIds.includes(operation.op_type_id)
    ) || [];

  const startCommentSearch = async (params: CommentSearchParams) => {
    if (params.accountName) {
      if (!initialSearch) {
        setAccountName(params.accountName);
        setPermlink(params.permlink);
        params.fromBlock && searchRanges.setFromBlock(params.fromBlock);
        params.toBlock && searchRanges.setToBlock(params.toBlock);
        params.startDate && searchRanges.setStartDate(params.startDate);
        params.toDate && searchRanges.setEndDate(params.toDate);
        params.lastBlocks && searchRanges.setLastBlocksValue(params.lastBlocks);
        params.lastTime && searchRanges.setLastTimeUnitValue(params.lastTime);
        params.rangeSelectKey &&
          searchRanges.setRangeSelectKey(params.rangeSelectKey);
        params.timeUnit && searchRanges.setTimeUnitSelectKey(params.timeUnit);

        const commentSearchProps: Explorer.CommentSearchProps = {
          accountName: params.accountName,
          permlink: params.permlink,
          fromBlock: params.fromBlock,
          toBlock: params.toBlock,
          startDate: params.startDate,
          endDate: params.toDate,
          operationTypes: !!params.filters.length ? params.filters : undefined,
        };

        setCommentSearchProps(commentSearchProps);
        setPreviousCommentSearchProps(commentSearchProps);
        setInitialSearch(true);
      } else {
        const {
          payloadFromBlock,
          payloadToBlock,
          payloadStartDate,
          payloadEndDate,
        } = await searchRanges.getRangesValues();

        const commentSearchProps: Explorer.CommentSearchProps = {
          accountName: params.accountName,
          permlink: params.permlink,
          fromBlock: payloadFromBlock,
          toBlock: payloadToBlock,
          startDate: payloadStartDate,
          endDate: payloadEndDate,
          operationTypes: !!params.filters.length ? params.filters : undefined,
        };

        params.rangeSelectKey = searchRanges.rangeSelectKey;
        params.timeUnit = searchRanges.timeUnitSelectKey;
        params.lastTime = searchRanges.lastTimeUnitValue;

        setCommentSearchProps(commentSearchProps);
        setPreviousCommentSearchProps(commentSearchProps);
        setParams({ ...params, ...commentSearchProps });
      }
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
  }, [paramsState]);

  return (
    <div className="w-full md:w-4/5">
      <div className="bg-explorer-dark-gray text-white p-4 rounded w-full">
        <div className="flex flex-col m-2">
          <label className="mx-2">Account name</label>
          <Input
            className="w-1/2"
            type="text"
            value={accountName}
            onChange={(e) =>
              setAccountName(
                !!e.target.value.length ? e.target.value : undefined
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
              setPermlink(!!e.target.value.length ? e.target.value : undefined)
            }
            placeholder="---"
          />
        </div>
        <SearchRanges rangesProps={searchRanges} />
        <div className="flex items-center justify-between m-2">
          <Button
            className=" bg-blue-800 hover:bg-blue-600 rounded"
            onClick={() =>
              startCommentSearch({ ...paramsState, accountName, permlink })
            }
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
            buttonClassName="bg-gray-500 ml-2"
            triggerTitle={"Operation Filters"}
          />
        </div>
      </div>
      {commentSearch.commentSearchData && (
        <>
          <div className="w-full flex justify-center items-center mt-4 ">
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
