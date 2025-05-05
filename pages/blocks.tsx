import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import BlocksTable from "@/components/blocks/BlocksTable";
import NoResult from "@/components/NoResult";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { Loader2 } from "lucide-react";
import useAllBlocksSearch from "@/hooks/api/blocks/useAllBlocksSearch";
import BlocksSearch, {
  DEFAULT_BLOCKS_SEARCH_PROPS,
} from "@/components/blocks/BlocksSearch";
import BlockAdditionalDetails from "@/components/blocks/BlockAdditionalDetails";
import ScrollTopButton from "@/components/ScrollTopButton";
import PageTitle from "@/components/PageTitle";
import FilterSectionToggle from "@/components/account/FilterSectionToggle";
import useURLParams from "@/hooks/common/useURLParams";
import { convertBooleanArrayToIds } from "@/lib/utils";
import { setLocalStorage, getLocalStorage } from "@/utils/LocalStorage";
import BlockSegments from "@/components/BlockSegments";

const TABLE_CELLS = [
  "",
  "Block",
  "Hash",
  "Transactions",
  "Time",
  "Producer",
  "Reward(VESTS)",
];

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
  additionalDetailsContent: React.ReactNode;
}

const BlocksPage = () => {
  const { operationsTypes } = useOperationsTypes();

  const { paramsState, setParams } = useURLParams(DEFAULT_BLOCKS_SEARCH_PROPS);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [initialToBlock, setInitialToBlock] = useState<number | undefined>(
    undefined
  ); /* initialToBlock is sent to useAllBlocksSearch so that there is no change between the initial search and subsequent pagination clicks because new blocks are being added to the blockchain.*/
  const [isNewSearch, setIsNewSearch] = useState<boolean>(false);

  const pageNum = paramsState.pageNumber;

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
      paramsState.toBlock ? paramsState.toBlock : initialToBlock
    );

  // Store the very first block selected - use toBlock instead of fromBlock.
  const [firstUserSelectedBlock, setFirstUserSelectedBlock] = useState<
    number | undefined
  >();
  useEffect(() => {
    // Initialize the first user selected block only on the first load
    if (paramsState.toBlock !== undefined && isNewSearch) {
      setFirstUserSelectedBlock(paramsState.toBlock);
    }
  }, [paramsState.toBlock, isNewSearch]);

  // Flag indicating whether the data is based on a ranged selection or filtering
  const [isFromRangeSelection, setIsFromRangeSelection] =
    useState<boolean>(false);

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

  const [openBlockNum, setOpenBlockNum] = useState<number | null>(null);
  const [newBlockView, setNewBlockView] = useState<Block | undefined>(
    undefined
  );
  const [isBlockNavigationActive, setIsBlockNavigationActive] = useState(false);

  const [isFiltersActive, setIsFiltersActive] = useState(false);
  const [isBlocksFilterSectionVisible, setIsBlocksFilterSectionVisible] =
    useState(getLocalStorage("is_blocks_filters_visible", true) ?? false);

  const [toBlockHistory, setToBlockHistory] = useState<number[]>([]);
  useEffect(() => {
    if (isNewSearch) setToBlockHistory([]);
  }, [isNewSearch]);

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

  const handlePrevBlock = () => {
    if (!blocksSearchData?.blocks_result || !openBlockNum) return;

    const currentIndex = blocksSearchData.blocks_result.findIndex(
      (block) => block.block_num === openBlockNum
    );

    const newBlockNum =
      blocksSearchData.blocks_result[currentIndex + 1].block_num;
    setIsBlockNavigationActive(true);
    setOpenBlockNum(newBlockNum);
  };

  const handleNextBlock = () => {
    if (!blocksSearchData?.blocks_result || !openBlockNum) return;

    const currentIndex = blocksSearchData.blocks_result.findIndex(
      (block) => block.block_num === openBlockNum
    );

    const newBlockNum =
      blocksSearchData.blocks_result[currentIndex - 1].block_num;
    setIsBlockNavigationActive(true);
    setOpenBlockNum(newBlockNum);
  };

  useEffect(() => {
    if (!blocksSearchData) return;

    const newBlock = blocksSearchData.blocks_result.find(
      (block) => block.block_num === openBlockNum
    );

    setNewBlockView(newBlock);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openBlockNum]);

  const handleToggle = (blockNum: number) => {
    setOpenBlockNum((prevBlockNum) =>
      prevBlockNum === blockNum ? null : blockNum
    );
  };

  const handlePageChange = (newPage: number) => {
    setParams({
      ...paramsState,
      pageNumber: newPage,
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
      pageNumber: undefined,
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
      pageNumber: undefined,
    });

    setIsNewSearch(false);
    setIsFromRangeSelection(true); // data is based on a range selection
  };

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

  const prepareTableData = (): BlockRow[] => {
    if (
      !blocksSearchData ||
      !blocksSearchData.blocks_result ||
      blocksSearchData.total_blocks == 0
    )
      return [];
    const firstBlockInPage = blocksSearchData.blocks_result[0].block_num;
    const lastBlockInPage = blocksSearchData.blocks_result.at(-1)
      ?.block_num as number;
    return blocksSearchData.blocks_result.map((block: Block) => {
      const additionalDetailsContent = (
        <BlockAdditionalDetails
          block={!isBlockNavigationActive ? block : (newBlockView as Block)}
          operationsTypes={operationsTypes}
          handlePrevBlock={handlePrevBlock}
          handleNextBlock={handleNextBlock}
          firstBlockInPage={firstBlockInPage}
          lastBlockInPage={lastBlockInPage}
        />
      );

      return {
        ...block,
        timestamp: formatAndDelocalizeTime(block.created_at),
        additionalDetailsContent: additionalDetailsContent,
      };
    });
  };

  const tableRows = prepareTableData();

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
              openBlockNum={openBlockNum}
              handleToggle={handleToggle}
              TABLE_CELLS={TABLE_CELLS}
              currentPage={pageNum || blocksSearchData.total_pages}
              totalCount={blocksSearchData.total_blocks}
              onPageChange={handlePageChange}
              setIsBlockNavigationActive={setIsBlockNavigationActive}
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
