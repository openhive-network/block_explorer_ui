import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

const useBlockOperations = (
  blockNumber: number,
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
  });

  const blockError = (blockOperations as { [key: string]: any })?.code || null;

  return {
    blockOperations,
    trxLoading,
    blockError,
  };
};

export default useBlockOperations;
