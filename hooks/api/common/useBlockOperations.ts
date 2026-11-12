import { UseQueryResult, useQuery } from "@tanstack/react-query";

import Hive from "@/types/Hive";
import fetchingService from "@/services/FetchingService";
import { keepPreviousDataFor } from "@/hooks/common/keepPreviousDataFor";

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
    isPending: trxLoading,
    isPlaceholderData: blockOperationsShowingPrevious,
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
    // Same block only: another block's operations never show while one loads.
    placeholderData: keepPreviousDataFor<Hive.TotalOperationsResponse>(
      (previousKey) => previousKey[1] === blockNumber
    ),
    refetchOnWindowFocus: false,
    enabled: !!blockNumber,
  });

  const blockError = (blockOperations as { [key: string]: any })?.code || null;

  return {
    blockOperations,
    trxLoading,
    blockOperationsShowingPrevious,
    blockError,
  };
};

export default useBlockOperations;
