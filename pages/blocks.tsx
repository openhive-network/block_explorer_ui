import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  // URL Parameters and Initial State
  const { paramsState, setParams } = useURLParams(DEFAULT_BLOCKS_SEARCH_PROPS);
  const [initialToBlock, setInitialToBlock] = useState<number | undefined>(undefined);
  const pageNum = paramsState.page;

  // Store the very first block selected - use toBlock instead of fromBlock.
  const [firstUserSelectedBlock, setFirstUserSelectedBlock] = useState<number | undefined>();
  const [isNewSearch, setIsNewSearch] = useState<boolean>(false);

  // Flag indicating whether the data is based on a ranged selection or filtering
  const [isFromRangeSelection, setIsFromRangeSelection] = useState<boolean>(false);

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

    const { operationsTypes } = useOperationsTypes();

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

  const {
    handleLoadNextBlocks,
    handleLoadPreviousBlocks,
    hasMoreBlocks,
    hasPreviousBlocks,
  } = useBlockNavigation(
    paramsState.toBlock,
    blocksSearchData,
    paramsState,
    setParams,
    false,
    isNewSearch,
    setIsNewSearch,
    setIsFromRangeSelection
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

    return blocksSearchData.blocks_result.map((block) => {
      const { operationCount, virtualOperationCount } = getOperationsCounts(block.operations);
      return {
        ...block,
        operationCount,
        virtualOperationCount,
      };
    });
  }, [blocksSearchData?.blocks_result, getOperationsCounts]);

  // useEffect Hooks
  useEffect(() => {
    // Initialize the first user selected block only on the first load
    if (paramsState.toBlock !== undefined && isNewSearch) {
      setFirstUserSelectedBlock(paramsState.toBlock);
    }
  }, [paramsState.toBlock, isNewSearch]);

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
            setIsFiltersActive={updateIsFiltersActive}
            setInitialToBlock={setInitialToBlock}
            setIsNewSearch={setIsNewSearch}
            isFiltersActive={isFiltersActive}
            isFromRangeSelection={isFromRangeSelection}
            firstUserSelectedBlock={firstUserSelectedBlock}
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

        {blocksSearchDataLoading ? (
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