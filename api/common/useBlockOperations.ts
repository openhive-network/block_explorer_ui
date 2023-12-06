import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

const useBlockOperations = (blockNumber: number, blockFilters: number[]) => {

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
    blockOperations,
    trxLoading,
    blockError,
  };
};

export default useBlockOperations;
