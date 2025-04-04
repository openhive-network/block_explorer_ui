import React, { useState } from "react";
import Head from "next/head";
import BlocksTable from "@/components/blocks/BlocksTable";
import { useSearchesContext } from "@/contexts/SearchesContext";
import NoResult from "@/components/NoResult";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { Loader2 } from "lucide-react";
import useAllBlocksSearch from "@/hooks/api/blocks/useAllBlocksSearch";
import BlocksSearch from "@/components/blocks/BlocksSearch";
import BlockAdditionalDetails from "@/components/blocks/BlockAdditionalDetails";
import ScrollTopButton from "@/components/ScrollTopButton";

const TABLE_CELLS = [
  "",
  "Block",
  "Hash",
  "Transactions",
  "Time",
  "Producer",
  "Reward",
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
  const { allBlocksSearchProps, setAllBlocksSearchProps } =
    useSearchesContext();
  const { operationsTypes } = useOperationsTypes();
  const [toBlock, setToBlock] = useState<number | undefined>(
    allBlocksSearchProps?.toBlock
  );

  const pageNum = allBlocksSearchProps?.pageNumber;

  const { blocksSearchData, blocksSearchDataError, blocksSearchDataLoading } =
    useAllBlocksSearch(allBlocksSearchProps, pageNum, toBlock);

  const [openBlockNum, setOpenBlockNum] = useState<number | null>(null);

  const handleToggle = (blockNum: number) => {
    setOpenBlockNum((prevBlockNum) =>
      prevBlockNum === blockNum ? null : blockNum
    );
  };

  const handlePageChange = (newPage: number) => {
    const newSearchProps: any = {
      ...allBlocksSearchProps,
      pageNumber: newPage,
      toBlock: blocksSearchData?.block_range.to,
    };
    setAllBlocksSearchProps(newSearchProps);
  };

  const prepareTableData = (): BlockRow[] => {
    if (!blocksSearchData || !blocksSearchData.blocks_result) return [];

    return blocksSearchData.blocks_result.map((block: Block) => {
      const additionalDetailsContent = (
        <BlockAdditionalDetails
          block={block}
          operationsTypes={operationsTypes}
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
        <BlocksSearch />

        {blocksSearchDataLoading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
          </div>
        ) : blocksSearchData?.blocks_result &&
          blocksSearchData?.blocks_result.length > 0 ? (
          <>
            <div className="mt-2">
              <BlocksTable
                rows={tableRows}
                openBlockNum={openBlockNum}
                handleToggle={handleToggle}
                TABLE_CELLS={TABLE_CELLS}
                currentPage={pageNum || blocksSearchData.total_pages}
                totalCount={blocksSearchData.total_blocks}
                onPageChange={handlePageChange}
              />
            </div>
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
