import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";
import { useState } from "react";
import Hive from "@/types/Hive";
import { useUserSettingsContext } from "@/components/contexts/UserSettingsContext";

const useLastBlocks = (headBlockNum?: number) => {
  const [lastBlocks, setLastBlocks] = useState<Hive.LastBlocksTypeResponse[]>([]);

  const {
    isLoading: lastBlocksDataLoading,
    isError: lastBlocksDataError,
  }  = useQuery({
    queryKey: ["lastBlocks", headBlockNum],
    queryFn: () => fetchingService.getLastBlocks(config.lastBlocksForWidget),
    refetchOnWindowFocus: false,
    onSuccess: (data: Hive.LastBlocksTypeResponse[]) => setLastBlocks(data)
  });

  return { lastBlocksData: lastBlocks, lastBlocksDataLoading, lastBlocksDataError };
};

export default useLastBlocks;
