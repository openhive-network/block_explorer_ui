import React, { useCallback, useEffect, useState } from "react";
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
import BlockSegments from "@/components/BlockSegments";

import useAllBlocksSearch from "@/hooks/api/blocks/useAllBlocksSearch";
import useURLParams from "@/hooks/common/useURLParams";

import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { convertBooleanArrayToIds } from "@/lib/utils";
import { setLocalStorage, getLocalStorage } from "@/utils/LocalStorage";

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
  timestamp: string;
}

const TABLE_CELLS = [
  "Block",
  "Producer",
  "Hash",
  "Prev Hash",
  "Time",
  "Reward(VESTS)",
  "Transactions",
  "",
];

const BlocksPage = () => {
  // URL Parameters and Initial State
  const { paramsState, setParams } = useURLParams(DEFAULT_BLOCKS_SEARCH_PROPS);
  const [initialToBlock, setInitialToBlock] = useState<number | undefined>(undefined);
  const pageNum = paramsState.page;

  // Store the very first block selected - use toBlock instead of fromBlock.
  const [firstUserSelectedBlock, setFirstUserSelectedBlock] = useState<number | undefined>();
  const [isNewSearch, setIsNewSearch] = useState<boolean>(false);

  // Flag indicating whether the data is based on a ranged selection or filtering
  const [isFromRangeSelection, setIsFromRangeSelection] = useState<boolean>(false);
  const [toBlockHistory, setToBlockHistory] = useState<number[]>([]);


  // Filter Visibility State
  const [isFiltersActive, setIsFiltersActive] = useState(false);
  const [isBlocksFilterSectionVisible, setIsBlocksFilterSectionVisible] = useState(
    getLocalStorage("is_blocks_filters_visible", true) ?? false
  );

  // Data Fetching
  const props = {
    ...paramsState,
    operationTypes: paramsState.filters
      ? convertBooleanArrayToIds(paramsState.filters)
      : null,
  } as any;

  const { blocksSearchData, blocksSearchDataError, blocksSearchDataLoading } = useAllBlocksSearch(
    props,
    pageNum,
    paramsState.toBlock ? paramsState.toBlock : initialToBlock
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
    setParams({
      ...paramsState,
      page: newPage,
      toBlock: blocksSearchData?.block_range.to,
    });
    setIsNewSearch(false);
  };

  const handleLoadNextBlocks = () => {
    if (
      !blocksSearchData?.block_range?.to ||
      !blocksSearchData?.block_range?.from
    ) {
      return;
    }

    const currentToBlock = blocksSearchData.block_range.to;
    const nextToBlockParam = blocksSearchData.block_range.from; // The 'from' becomes the new 'to' boundary

    // Save the 'to' block we are navigating AWAY from
    setToBlockHistory((prevHistory) => [...prevHistory, currentToBlock]);

    setParams({
      ...paramsState,
      toBlock: nextToBlockParam, // Set toBlock to the previous 'from'
      page: undefined,
    });
    setIsNewSearch(false);
    setIsFromRangeSelection(true); // data is based on a range selection
  };

  const handleLoadPreviousBlocks = () => {
    if (toBlockHistory.length === 0) {
      return; // Nothing in history to go back to
    }
    // Get the 'to' block boundary we want to return to
    const targetToBlock = toBlockHistory[toBlockHistory.length - 1];

    // Remove the used block from history
    setToBlockHistory((prevHistory) => prevHistory.slice(0, -1));

    setParams({
      ...paramsState,
      toBlock: targetToBlock, // Use the 'to' block from history
      page: undefined,
    });

    setIsNewSearch(false);
    setIsFromRangeSelection(true); // data is based on a range selection
  };


  // Utility Functions
  const checkForMoreBlocks = (): boolean => {
    if (!blocksSearchData?.block_range) {
      return false;
    }

    if (
      paramsState.fromBlock &&
      paramsState.lastBlocks &&
      paramsState.rangeSelectKey === "lastBlocks" &&
      blocksSearchData.block_range.to > paramsState.fromBlock &&
      blocksSearchData.block_range.from != paramsState.fromBlock
    ) {
      return true;
    }

    if (
      paramsState.fromBlock &&
      paramsState.rangeSelectKey === "blockRange" &&
      blocksSearchData.block_range.from > paramsState.fromBlock
    ) {
      return true;
    }

    return (
      blocksSearchData.block_range.from !== 1 &&
      (paramsState.fromBlock === undefined ||
        blocksSearchData.block_range.from < paramsState.fromBlock)
    );
  };

  const checkForPreviousBlocks = (): boolean => {
    if (!blocksSearchData?.block_range) {
      return false;
    }

    return toBlockHistory.length > 0;
  };

  const hasMoreBlocks = checkForMoreBlocks();
  const hasPreviousBlocks = checkForPreviousBlocks();

  // Data Preparation
  const prepareTableData = (): BlockRow[] => {
    if (
      !blocksSearchData ||
      !blocksSearchData.blocks_result ||
      blocksSearchData.total_blocks == 0
    )
      return [];

    return blocksSearchData.blocks_result.map((block: Block) => {
      return {
        ...block,
        timestamp: formatAndDelocalizeTime(block.created_at),
      };
    });
  };

  const tableRows = prepareTableData();


  // useEffect Hooks
    useEffect(() => {
    // Initialize the first user selected block only on the first load
    if (paramsState.toBlock !== undefined && isNewSearch) {
      setFirstUserSelectedBlock(paramsState.toBlock);
    }
  }, [paramsState.toBlock, isNewSearch]);

  useEffect(() => {
    if (isNewSearch) setToBlockHistory([]);
  }, [isNewSearch]);

  useEffect(() => {
    // Update the `initialToBlock` when the data is available.
    if (
      blocksSearchData?.blocks_result &&
      blocksSearchData.blocks_result.length > 0 &&
      !isNewSearch
    ) {
      setInitialToBlock(
        paramsState.toBlock
          ? paramsState.toBlock
          : blocksSearchData.block_range.to
      ); // Store the toBlock
      setIsNewSearch(false);
    }
  }, [
    blocksSearchData,
    paramsState.toBlock,
    blocksSearchData?.block_range.to,
    isNewSearch,
  ]);

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
          <div className="flex-shrink-0 mt-2 mr-2">
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
            setIsFiltersActive={setIsFiltersActive}
            setInitialToBlock={setInitialToBlock}
            setIsNewSearch={setIsNewSearch}
            isFiltersActive={isFiltersActive}
            isFromRangeSelection={isFromRangeSelection}
            firstUserSelectedBlock={firstUserSelectedBlock}
          />
        </div>

        <BlockSegments
          fromBlock={blocksSearchData?.block_range.from}
          toBlock={blocksSearchData?.block_range.to}
          hasPrevious={hasPreviousBlocks}
          hasNext={hasMoreBlocks}
          loadPreviousBlocks={handleLoadPreviousBlocks}
          loadNextBlocks={handleLoadNextBlocks}
          urlParams={paramsState}
          className="md:pr-36 rounded"
        />

        {blocksSearchDataLoading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
          </div>
        ) : blocksSearchData?.blocks_result &&
          blocksSearchData?.blocks_result.length > 0 ? (
          <>
            <BlocksTable
              rows={tableRows}
              filters={paramsState.filters}
              TABLE_CELLS={TABLE_CELLS}
              currentPage={pageNum || blocksSearchData.total_pages}
              totalCount={blocksSearchData.total_blocks}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <NoResult />
        )}
        <div className="fixed bottom-[10px] right-0 flex flex-col items-end justify-end px-3 md:px-12">
          <ScrollTopButton />
        </div>
      </div>
    </>
  );
};

export default BlocksPage;