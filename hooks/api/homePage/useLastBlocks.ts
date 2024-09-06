import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { config } from "@/Config";
import Hive from "@/types/Hive";
import fetchingService from "@/services/FetchingService";

const useLastBlocks = (headBlockNum?: number) => {
  const [lastBlocks, setLastBlocks] = useState<Hive.LastBlocksTypeResponse[]>(
    []
  );

  const { isLoading: lastBlocksDataLoading, isError: lastBlocksDataError } =
    useQuery({
      queryKey: ["lastBlocks", headBlockNum],
      queryFn: () => fetchingService.getLastBlocks(config.lastBlocksForWidget),
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
