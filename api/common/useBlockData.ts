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

  const {
    data: blockOperations,
    isLoading: trxLoading,
    error: trxError,
  }: UseQueryResult<Hive.OperationResponse[]> = useQuery({
    queryKey: [`block_operations`, blockNumber, blockFilters],
    queryFn: () => fetchingService.getOpsByBlock(blockNumber, blockFilters),
    refetchOnWindowFocus: false,
  });

  const blockError = (blockOperations as { [key: string]: any })?.code || null;

  return {
    blockDetails,
    blockOperations,
    loading: blockDetailsLoading || trxLoading,
    error: blockDetailsError || trxError,
    blockError,
  };
};

export default useBlockData;
