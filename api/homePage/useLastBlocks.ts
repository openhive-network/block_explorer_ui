import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";

const useLastBlocks = () => {
  const {
    data: lastBlocksData,
    isLoading: lastBlocksDataLoading,
    isError: lastBlocksDataError,
  }  = useQuery({
    queryKey: ["lastBlocks"],
    queryFn: () => fetchingService.getLastBlocks(config.lastBlocksForWidget),
    refetchOnWindowFocus: false,
  });

  return { lastBlocksData, lastBlocksDataLoading, lastBlocksDataError };
};

export default useLastBlocks;
