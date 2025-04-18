import { UseQueryResult, useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useBlockData = (blockNumber: number | string) => {
  const {
    data: blockDetails,
    isLoading: blockDetailsLoading,
    error: blockDetailsError,
  }: UseQueryResult<Hive.BlockDetails> = useQuery({
    queryKey: ["block_details", blockNumber],
    queryFn: () => fetchBlockGlobalState(blockNumber),
    refetchOnWindowFocus: false,
  });

  const fetchBlockGlobalState = async (blockNumber: number | string) => {
    if (!blockNumber) return null;
    const response = await fetchingService.getBlockGlobalState(blockNumber);
    return response;
  };

  return {
    blockDetails,
    loading: blockDetailsLoading,
    error: blockDetailsError,
  };
};

export default useBlockData;
