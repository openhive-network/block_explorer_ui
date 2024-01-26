import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";

const useLastBlocks = (headBlockNum?: number) => {
  const {
    data: lastBlocksData,
    isLoading: lastBlocksDataLoading,
    isError: lastBlocksDataError,
  }  = useQuery({
    queryKey: ["lastBlocks", headBlockNum],
    queryFn: () => fetchingService.getLastBlocks(config.lastBlocksForWidget),
    refetchOnWindowFocus: false,
  });

  return { lastBlocksData, lastBlocksDataLoading, lastBlocksDataError };
};

export default useLastBlocks;
