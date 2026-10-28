import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { config } from "@/Config";
import Hive from "@/types/Hive";
import fetchingService from "@/services/FetchingService";

const useLastBlocks = (
  headBlockNum?: number,
  limit: number = config.lastBlocksForWidget
) => {
  const {
    data: lastBlocks = [],
    isPending: lastBlocksDataLoading,
    isError: lastBlocksDataError,
  } = useQuery({
    queryKey: ["lastBlocks", headBlockNum, limit],
    queryFn: () => fetchingService.getLastBlocks(limit),
    refetchOnWindowFocus: false,
    // Each head block is a new key; keep showing the previous list meanwhile.
    placeholderData: keepPreviousData,
  });

  return {
    lastBlocksData: lastBlocks,
    lastBlocksDataLoading,
    lastBlocksDataError,
  };
};

export default useLastBlocks;
