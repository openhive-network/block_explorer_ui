import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

const useOperationsCountInBlock = (blockNumber: number) => {
  const {
    data: operationsCountInBlock,
    isLoading: operationsCountInBlockLoading,
    error: operationsCountInBlockError,
  }: UseQueryResult<Hive.OperationsCount[]> = useQuery({
    queryKey: ["operations_by_blocks", blockNumber],
    queryFn: () => fetchingService.getOperationsCountInBlock(blockNumber),
    refetchOnWindowFocus: false,
  });

  return {
    operationsCountInBlock,
    countLoading: operationsCountInBlockLoading,
    error: operationsCountInBlockError
  };
};

export default useOperationsCountInBlock;
