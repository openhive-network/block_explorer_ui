import { UseQueryResult, useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useBlockRawData = (
  blockNumber: number | string,
  includeVirtual: boolean
) => {
  const {
    data: rawBlockdata,
    isLoading: rawBlockdataLoading,
    error: rawBlockdataError,
  }: UseQueryResult<Hive.BlockDetails> = useQuery({
    queryKey: ["raw_block", blockNumber, includeVirtual],
    queryFn: () => fetchingService.getBlock(blockNumber, includeVirtual),
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
