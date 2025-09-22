import { useSearchesContext } from "@/contexts/SearchesContext";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import ErrorPage from "@/pages/ErrorPage";
import { getAllBlocksPageLink } from "../utils/blockSearchHelpers";
import NoResult from "@/components/NoResult";
import BlocksTable from "@/components/blocks/BlocksTable";
import useAllBlocksSearch from "@/hooks/api/blocks/useAllBlocksSearch";
import { useCallback, useState, useMemo, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Operations, Block } from "@/pages/blocks";
import BlockNavigation from "@/components/BlockNavigation";
import useBlockNavigation from "@/hooks/common/useBlockNavigation";
import { DEFAULT_BLOCKS_SEARCH_PROPS } from "@/components/blocks/BlocksSearch";
import { useI18n } from "@/i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";

const BlockSearchResults = () => {
  const { t } = useI18n();
  const TABLE_CELLS = [
    t("common.block"),
    t("blocksPage.producer"),
    t("blocksPage.time"),
    t("common.transactions"),
    "", 
  ];

  const {
    allBlocksSearchProps,
    setAllBlocksSearchProps,
    searchRanges,
    blockSearchPage,
    setBlockSearchPage,
  } = useSearchesContext();
  const { operationsTypes } = useOperationsTypes();
  const {
    settings: { liveData },
  } = useSettings();
  const prevBlocksDataRef = useRef<Block[] | null>(null);

  const props = {
    ...DEFAULT_BLOCKS_SEARCH_PROPS,
    ...allBlocksSearchProps,
  } as any;

  const { blocksSearchData, blocksSearchDataError, blocksSearchDataLoading } =
    useAllBlocksSearch(props, blockSearchPage, props.toBlock, liveData);

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

  const allBlocksPageLink = getAllBlocksPageLink(
    allBlocksSearchProps,
    searchRanges
  );
  const tableRows = useMemo(() => {
    if (!blocksSearchData?.blocks_result) {
      return [];
    }

    // Determine new blocks for highlighting, only when liveDataEnabled is true and when we are in very first page of history
    let newBlocks: number[] = [];
    if (
      liveData &&
      prevBlocksDataRef.current &&
      blocksSearchData.total_pages === undefined // Make sure we are on first page
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
      const isNew = liveData && newBlocks.includes(block.block_num);

      return {
        ...block,
        operationCount,
        virtualOperationCount,
        isNew,
      };
    });
  }, [
    blocksSearchData?.blocks_result,
    blocksSearchData?.total_pages,
    getOperationsCounts,
    liveData,
  ]);

  const handlePageChange = (newPage: number) => {
    setBlockSearchPage(newPage);
  };

  const {
    handleLoadNextBlocks,
    handleLoadPreviousBlocks,
    hasMoreBlocks,
    hasPreviousBlocks,
  } = useBlockNavigation(
    allBlocksSearchProps?.toBlock,
    blocksSearchData,
    allBlocksSearchProps,
    setAllBlocksSearchProps,
    true,
    allBlocksSearchProps?.firstBlock
  );

  if (blocksSearchDataError) {
    return <ErrorPage />;
  }

  if (!blocksSearchData) return;

  return (
    <>
      {blocksSearchDataLoading && !liveData ? (
        <div className="flex justify-center items-center">
          <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
        </div>
      ) : blocksSearchData?.blocks_result &&
        blocksSearchData?.blocks_result.length > 0 ? (
        <>
          <div className="w-full rounded-t bg-theme pt-1">
            <BlockNavigation
              fromBlock={blocksSearchData?.block_range.from}
              toBlock={blocksSearchData?.block_range.to}
              hasPrevious={hasPreviousBlocks}
              hasNext={hasMoreBlocks}
              loadPreviousBlocks={handleLoadPreviousBlocks}
              loadNextBlocks={handleLoadNextBlocks}
              urlParams={allBlocksSearchProps}
            />
          </div>
          <BlocksTable
            rows={tableRows}
            paramsState={allBlocksSearchProps}
            TABLE_CELLS={TABLE_CELLS}
            currentPage={blockSearchPage || blocksSearchData.total_pages}
            totalCount={blocksSearchData.total_blocks}
            onPageChange={handlePageChange}
            isMainPageTable={true}
            allBlocksPageLink={allBlocksPageLink}
          />
        </>
      ) : !blocksSearchDataLoading ? (
        <NoResult />
      ) : null}
    </>
  );
};

export default BlockSearchResults;
