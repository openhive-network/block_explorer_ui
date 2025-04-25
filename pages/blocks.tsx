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
    useAllBlocksSearch(props, pageNum, initialToBlock);

  useEffect(() => {
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
  const [isBalanceFilterSectionVisible, setIsBalanceFilterSectionVisible] =
    useState(false);

  const handleFiltersVisibility = () => {
    setIsBalanceFilterSectionVisible(!isBalanceFilterSectionVisible);
  };

  const updateIsFiltersActive = useCallback((newValue: boolean) => {
    setIsFiltersActive(newValue);
  }, []);

  const handlePrevBlock = () => {
    if (!openBlockNum) return;

    setIsBlockNavigationActive(true);
    setOpenBlockNum(() => openBlockNum - 1);
  };
  const handleNextBlock = () => {
    if (!openBlockNum) return;

    setIsBlockNavigationActive(true);
    setOpenBlockNum(() => openBlockNum + 1);
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
    });
    setIsNewSearch(false);
  };

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
            <PageTitle title="Hive Blocks" className="py-4" />
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
            isBlocksFilterSectionVisible={isBalanceFilterSectionVisible}
            setIsFiltersActive={updateIsFiltersActive}
            setInitialToBlock={setInitialToBlock}
            setIsNewSearch={setIsNewSearch}
          />
        </div>
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
