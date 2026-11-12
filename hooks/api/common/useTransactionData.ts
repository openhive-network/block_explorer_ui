import { useQuery } from "@tanstack/react-query";

import Hive from "@/types/Hive";
import fetchingService from "@/services/FetchingService";
import { keepPreviousDataFor } from "@/hooks/common/keepPreviousDataFor";

const useTransactionData = (transactionId: string, includeVirtual: boolean) => {
  const {
    data,
    isPending: isLoading,
    isPlaceholderData,
    error,
  } = useQuery<Hive.TransactionResponse, Error>({
    queryKey: [`transaction-${transactionId}`, includeVirtual],
    queryFn: () =>
      fetchingService.getTransaction(transactionId, includeVirtual),
    // Toggling virtual operations keeps this transaction on screen meanwhile.
    placeholderData: keepPreviousDataFor<Hive.TransactionResponse>(
      (previousKey) => previousKey[0] === `transaction-${transactionId}`
    ),
    refetchOnWindowFocus: false,
    enabled: !!transactionId,
  });

  const trxError = (data as { [key: string]: any })?.code || null;

  return {
    trxData: data,
    trxLoading: isLoading,
    trxShowingPrevious: isPlaceholderData,
    trxError: error || trxError,
  };
};

export default useTransactionData;
