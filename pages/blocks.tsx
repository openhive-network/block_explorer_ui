import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import Head from "next/head";
import { Loader2 } from "lucide-react";

import BlocksTable from "@/components/blocks/BlocksTable";
import NoResult from "@/components/NoResult";
import BlocksSearch, {
  DEFAULT_BLOCKS_SEARCH_PROPS,
} from "@/components/blocks/BlocksSearch";
import ScrollTopButton from "@/components/ScrollTopButton";
import PageTitle from "@/components/PageTitle";
import FilterSectionToggle from "@/components/account/FilterSectionToggle";
import BlockNavigation from "@/components/BlockNavigation";

import useAllBlocksSearch from "@/hooks/api/blocks/useAllBlocksSearch";
import useURLParams from "@/hooks/common/useURLParams";
import useBlockNavigation from "@/hooks/common/useBlockNavigation";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";

import { convertBooleanArrayToIds } from "@/lib/utils";
import { setLocalStorage, getLocalStorage } from "@/utils/LocalStorage";
import { Toggle } from "@/components/ui/toggle";
import { useRouter } from "next/router";

interface Operations {
  op_type_id: number;
  op_count: number;
}

export interface Block {
  block_num: number;
  created_at: Date;
  producer_account: string;
  producer_reward: number;
  hash: string;
  operations?: Operations[];
  trx_count: number;
  prev: string;
}

export interface BlockRow extends Block {
  operationCount: number;
  virtualOperationCount: number;
  isNew?: boolean; // Added property to indicate new block
}

const TABLE_CELLS = [
  "Block",
  "Producer",
  "Hash",
  "Prev Hash",
  "Time",
  "Reward(VESTS)",
  "Transactions",
  "Operations",
  "Virtual Operations",
  "",
];

const BlocksPage = () => {

  const { paramsState, setParams } = useURLParams(DEFAULT_BLOCKS_SEARCH_PROPS);
  const pageNum = paramsState.page;
  const router = useRouter();
  const { operationsTypes } = useOperationsTypes();

  // Store the very first block selected so that when we click next in pagination or in block navigation the results are not disrupted by new blocks
  const [firstBlock, setFirstBlock] = useState<number | undefined>(
    paramsState.firstBlock
  );
  const [isNewSearch, setIsNewSearch] = useState<boolean>(true);

  // Filter Visibility State
  const [isFiltersActive, setIsFiltersActive] = useState(false);
  const [isBlocksFilterSectionVisible, setIsBlocksFilterSectionVisible] =
    useState(getLocalStorage("is_blocks_filters_visible", true) ?? false);

  //Live Data
  const [liveDataEnabled, setLiveDataEnabled] = useState(false);
  const changeLiveRefresh = () => {
    setLiveDataEnabled((prev) => !prev);
  };
  // Ref to store previous blocks data for live updates comparison
  const prevBlocksDataRef = useRef<Block[] | null>(null);


  // Data Fetching
  const props = {
    ...paramsState,
    operationTypes: paramsState.filters
      ? convertBooleanArrayToIds(paramsState.filters)
      : null,
  } as any;


  const { blocksSearchData, blocksSearchDataError, blocksSearchDataLoading } =
    useAllBlocksSearch(
      props,
      pageNum,
      //router.query.history?.length == 2 means that we are the very first page where history=[]
      liveDataEnabled &&
        firstBlock &&
        (!paramsState.toBlock || router.query.history?.length == 2)
        ? undefined
        : paramsState.toBlock
          ? paramsState.toBlock
          : paramsState.firstBlock,
      liveDataEnabled
    );



  // Handlers
  const handleFiltersVisibility = () => {
    setIsBlocksFilterSectionVisible(!isBlocksFilterSectionVisible);
    if (isFiltersActive) {
      setLocalStorage(
        "is_blocks_filters_visible",
        !isBlocksFilterSectionVisible
      );
    }
  };

  const updateIsFiltersActive = useCallback((newValue: boolean) => {
    setIsFiltersActive(newValue);
  }, []);

  const handlePageChange = (newPage: number) => {
    setIsNewSearch(false);
    const newParams = {
      ...paramsState,
      page: newPage,
    };

    if (!paramsState.toBlock) {
      newParams.firstBlock = blocksSearchData?.block_range.to;
    }

    setParams(newParams);
  };

  const {
    handleLoadNextBlocks,
    handleLoadPreviousBlocks,
    hasMoreBlocks,
    hasPreviousBlocks,
    isFromRangeSelection,
  } = useBlockNavigation(
    paramsState.toBlock,
    blocksSearchData,
    paramsState,
    setParams,
    false,
    firstBlock
  );

  // Data Preparation
  const getOperationsCounts = useCallback(
    (operations: Operations[] | undefined) => {
      if (!operations || !operationsTypes) {
        return {
          operationCount: 0,
          virtualOperationCount: 0,
        };
      }

      let operationCount = 0;
      let virtualOperationCount = 0;

      const operationTypesMap = new Map<number, any>();
      for (const operationType of operationsTypes) {
        operationTypesMap.set(operationType.op_type_id, operationType);
      }

      if (operations) {
        for (const op of operations) {
          const operationType = operationTypesMap.get(op.op_type_id);
          if (operationType) {
            if (operationType.is_virtual) {
              virtualOperationCount += op.op_count;
            } else {
              operationCount += op.op_count;
            }
          }
        }
      }

      return {
        operationCount,
        virtualOperationCount,
      };
    },
    [operationsTypes]
  );

  const tableRows = useMemo(() => {
    if (!blocksSearchData?.blocks_result) {
      return [];
    }

    // Determine new blocks for highlighting, only when liveDataEnabled is true and when we are in very first page of history
    let newBlocks: number[] = [];
    if (
      liveDataEnabled &&
      prevBlocksDataRef.current &&
      (router.query.history?.length == 2 || !router.query.history)
    ) {
      const existingBlockNums = prevBlocksDataRef.current.map(
        (block) => block.block_num
      );
      newBlocks = blocksSearchData.blocks_result
        .map((block) => block.block_num)
        .filter((blockNum) => !existingBlockNums.includes(blockNum));
    }

    return blocksSearchData.blocks_result.map((block) => {
      const { operationCount, virtualOperationCount } = getOperationsCounts(
        block.operations
      );
      const isNew = liveDataEnabled && newBlocks.includes(block.block_num);

      return {
        ...block,
        operationCount,
        virtualOperationCount,
        isNew,
      };
    });
  }, [blocksSearchData?.blocks_result, getOperationsCounts, liveDataEnabled]);

  // Update the ref with the current blocks data for the next comparison if liveDataEnabled
  useEffect(() => {
    if (liveDataEnabled) {
      prevBlocksDataRef.current = blocksSearchData?.blocks_result || null;
    } else {
      prevBlocksDataRef.current = null;
    }
  }, [blocksSearchData?.blocks_result, liveDataEnabled]);

  useEffect(() => {
    if (isNewSearch && !paramsState.firstBlock) {
      // New Search
      setFirstBlock(blocksSearchData?.block_range.to);
    } else if (paramsState.toBlock !== undefined && !paramsState.firstBlock) {
      setFirstBlock(paramsState.toBlock);
    } else {
      setFirstBlock(paramsState.firstBlock);
    }

  }, [paramsState.toBlock, paramsState.firstBlock, blocksSearchData]);

  return (
    <>
      <Head>
        <title>Blocks - Hive Explorer</title>
      </Head>

      <div className="page-container">

        <div className="flex items-start justify-between w-full bg-theme rounded">
          <div className="ml-6">
            <PageTitle
              title="Hive Blocks"
              className="py-4"
            />
          </div>
          {/* Live Data Toggle */}
          <div className="w-full sm:w-auto mt-4 top-0">
            <Toggle
              checked={liveDataEnabled}
              onClick={changeLiveRefresh}
              className="text-base whitespace-nowrap"
              leftLabel="Live Data"
            />
          </div>
          <div className="flex-shrink-0 mt-2">
            <FilterSectionToggle
              isFiltersActive={isFiltersActive}
              toggleFilters={handleFiltersVisibility}
            />
          </div>
        </div>
        <div className="mt-4">
          <BlocksSearch
            isVisible={isBlocksFilterSectionVisible}
            setIsVisible={setIsBlocksFilterSectionVisible}
            setIsFiltersActive={updateIsFiltersActive}
            setIsNewSearch={setIsNewSearch}
            isNewSearch={isNewSearch}
            isFiltersActive={isFiltersActive}
            isFromRangeSelection={isFromRangeSelection}
            firstUserSelectedBlock={firstBlock}
          />
        </div>

        <BlockNavigation
          fromBlock={blocksSearchData?.block_range.from}
          toBlock={blocksSearchData?.block_range.to}
          hasPrevious={hasPreviousBlocks}
          hasNext={hasMoreBlocks}
          loadPreviousBlocks={handleLoadPreviousBlocks}
          loadNextBlocks={handleLoadNextBlocks}
          urlParams={paramsState}
          className="md:pr-36 rounded"
        />

        {blocksSearchDataLoading && !liveDataEnabled ? (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
          </div>
        ) : blocksSearchData?.blocks_result &&
          blocksSearchData?.blocks_result.length > 0 ? (
          <>
            <BlocksTable
              rows={tableRows}
              paramsState={paramsState}
              TABLE_CELLS={TABLE_CELLS}
              currentPage={pageNum || blocksSearchData.total_pages}
              totalCount={blocksSearchData.total_blocks}
              onPageChange={handlePageChange}
            />
          </>
        ) : !blocksSearchDataLoading ? (
          <NoResult />
        ) : null}
        <div className="fixed bottom-[10px] right-0 flex flex-col items-end justify-end px-3 md:px-12">
          <ScrollTopButton />
        </div>
      </div>

    </>
  );
};

export default BlocksPage;
