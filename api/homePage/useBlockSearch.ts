import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Explorer from "@/types/Explorer";
import { useState } from "react";

const useBlockSearch = (blockSearchProps?: Explorer.BlockSearchProps) => {
  const {
    data: blockSearchData,
    isFetching: blockSearchDataLoading,
    isError: blockSearchDataError,
    refetch
  } = useQuery({
    queryKey: ["blockSearch"],
    queryFn: () => fetchBlocksNumbers(blockSearchProps),
    refetchOnWindowFocus: false,
    enabled: !!blockSearchProps
  });

  const fetchBlocksNumbers = async (blockSearchProps: Explorer.BlockSearchProps | undefined) => {
    if (blockSearchProps) {
      const foundBlocks = await fetchingService.getBlockByOp(blockSearchProps);
      return foundBlocks.map((foundBlock) => foundBlock.block_num);
    } else {
      return await null;
    }
  }

  return { blockSearchData, blockSearchDataLoading, blockSearchDataError, refetch };
};

export default useBlockSearch;
