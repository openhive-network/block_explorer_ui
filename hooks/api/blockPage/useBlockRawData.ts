import { UseQueryResult, useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useBlockRawData = (blockNumber: number | Date) => {
  const {
    data: rawBlockdata,
    isLoading: rawBlockdataLoading,
    error: rawBlockdataError,
  }: UseQueryResult<Hive.BlockDetails> = useQuery({
    queryKey: ["raw_block", blockNumber],
    queryFn: () => fetchingService.getBlockRaw(blockNumber),
    enabled: !!blockNumber,
    refetchOnWindowFocus: false,
  });

  return {
    rawBlockdata,
    loading: rawBlockdataLoading,
    error: rawBlockdataError,
  };
};

export default useBlockRawData;
