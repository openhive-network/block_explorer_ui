import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

const useBlockData = (blockNumber: number, blockFilters: number[]) => {
  const {
    data: blockDetails,
    isLoading: blockDetailsLoading,
    error: blockDetailsError,
  }: UseQueryResult<Hive.BlockDetails> = useQuery({
    queryKey: ["block_details", blockNumber],
    queryFn: () => fetchingService.getBlock(blockNumber),
    refetchOnWindowFocus: false,
  });

  return {
    blockDetails,
    loading: blockDetailsLoading,
    error: blockDetailsError
  };
};

export default useBlockData;
