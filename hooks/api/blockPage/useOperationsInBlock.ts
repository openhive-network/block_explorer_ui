import { UseQueryResult, useQuery } from "@tanstack/react-query";

import Hive from "@/types/Hive";
import fetchingService from "@/services/FetchingService";

const useOperationsCountInBlock = (blockNumber: number | string) => {
  const {
    data: operationsCountInBlock,
    isLoading: operationsCountInBlockLoading,
    error: operationsCountInBlockError,
  }: UseQueryResult<Hive.LastBlocksTypeResponse> = useQuery({
    queryKey: ["operations_by_blocks", blockNumber],
    queryFn: () => fetchingService.getOperationsCountInBlock(blockNumber),
    enabled: !!blockNumber,
    refetchOnWindowFocus: false,
  });

  return {
    operationsCountInBlock,
    countLoading: operationsCountInBlockLoading,
    error: operationsCountInBlockError,
  };
};

export default useOperationsCountInBlock;
