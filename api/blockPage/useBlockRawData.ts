import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

const useBlockRawData = (blockNumber: number) => {
  const {
    data: rawBlockdata,
    isLoading: rawBlockdataLoading,
    error: rawBlockdataError,
  }: UseQueryResult<Hive.BlockDetails> = useQuery({
    queryKey: ["raw_block", blockNumber],
    queryFn: () => fetchingService.getBlockRaw(blockNumber),
    refetchOnWindowFocus: false,
  });

  return {
    rawBlockdata,
    loading: rawBlockdataLoading,
    error: rawBlockdataError
  };
};

export default useBlockRawData;
