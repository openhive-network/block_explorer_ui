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
    queryFn: () => fetchingService.getBlockGlobalState(blockNumber),
    enabled: !!blockNumber,
    refetchOnWindowFocus: false,
  });

  return {
    blockDetails,
    loading: blockDetailsLoading,
    error: blockDetailsError,
  };
};

export default useBlockData;
