import { UseQueryResult, useQuery } from "@tanstack/react-query";

import Hive from "@/types/Hive";
import fetchingService from "@/services/FetchingService";

const useBlockOperations = (
  blockNumber: number | string,
  blockFilters?: number[],
  page?: number,
  account?: string,
  keyContent?: string,
  setOfKeys?: string[]
) => {
  const {
    data: blockOperations,
    isLoading: trxLoading,
    error: trxError,
  }: UseQueryResult<Hive.TotalOperationsResponse> = useQuery({
    queryKey: [
      `block_operations`,
      blockNumber,
      blockFilters,
      page,
      account,
      keyContent,
      setOfKeys,
    ],
    queryFn: () =>
      fetchingService.getOpsByBlock(
        blockNumber,
        blockFilters,
        page,
        account,
        keyContent,
        setOfKeys
      ),
    refetchOnWindowFocus: false,
    enabled: !!blockNumber,
  });

  const blockError = (blockOperations as { [key: string]: any })?.code || null;

  return {
    blockOperations,
    trxLoading,
    blockError,
  };
};

export default useBlockOperations;
