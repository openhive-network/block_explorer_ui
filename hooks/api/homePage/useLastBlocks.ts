import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { config } from "@/Config";
import Hive from "@/types/Hive";
import fetchingService from "@/services/FetchingService";

const useLastBlocks = (
  headBlockNum?: number,
  limit: number = config.lastBlocksForWidget
) => {
  const [lastBlocks, setLastBlocks] = useState<Hive.LastBlocksTypeResponse[]>(
    []
  );

  const { isLoading: lastBlocksDataLoading, isError: lastBlocksDataError } =
    useQuery({
      queryKey: ["lastBlocks", headBlockNum, limit],
      queryFn: () => fetchingService.getLastBlocks(limit),
      refetchOnWindowFocus: false,
      onSuccess: (data: Hive.LastBlocksTypeResponse[]) => setLastBlocks(data),
    });

  return {
    lastBlocksData: lastBlocks,
    lastBlocksDataLoading,
    lastBlocksDataError,
  };
};

export default useLastBlocks;
