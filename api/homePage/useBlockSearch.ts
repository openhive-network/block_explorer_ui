import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Explorer from "@/types/Explorer";
import { useState } from "react";

const useBlockSearch = (blockSearchProps?: Explorer.BlockSearchProps) => {
  const {
    data: blockSearchData,
    isFetching: blockSearchDataLoading,
    isError: blockSearchDataError
  } = useQuery({
    queryKey: ["blockSearch", blockSearchProps],
    queryFn: () => fetchBlocksNumbers(blockSearchProps),
    refetchOnWindowFocus: false,
  });

  const fetchBlocksNumbers = async (blockSearchProps: Explorer.BlockSearchProps | undefined) => {
    if (!blockSearchProps) return null;
    const foundBlocks = await fetchingService.getBlockByOp(blockSearchProps);
    return foundBlocks.map((foundBlock) => foundBlock.block_num);
  }

  return { blockSearchData, blockSearchDataLoading, blockSearchDataError };
};

export default useBlockSearch;
