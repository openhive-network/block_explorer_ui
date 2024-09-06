import { useQuery } from "@tanstack/react-query";

import Hive from "@/types/Hive";
import fetchingService from "@/services/FetchingService";

const useTransactionData = (transactionId: string) => {
  const { data, isLoading, error } = useQuery<Hive.TransactionResponse, Error>({
    queryKey: [`transaction-${transactionId}`],
    queryFn: () => fetchingService.getTransaction(transactionId),
    refetchOnWindowFocus: false,
    enabled: !!transactionId,
  });

  const trxError = (data as { [key: string]: any })?.code || null;

  return {
    trxData: data,
    trxLoading: isLoading,
    trxError: error || trxError,
  };
};

export default useTransactionData;
