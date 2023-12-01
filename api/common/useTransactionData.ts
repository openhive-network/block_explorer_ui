import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { useQuery } from "@tanstack/react-query";

const useTransactionData = (transactionId: string) => {
  const { data, isLoading, error } = useQuery<
    Hive.TransactionQueryResponse,
    Error
  >({
    queryKey: [`block-${transactionId}`],
    queryFn: () => fetchingService.getTransaction(transactionId),
    refetchOnWindowFocus: false,
  });

  const trxError = (data as { [key: string]: any })?.code || null;

  return {
    trxData: data,
    trxLoading: isLoading,
    trxError: error || trxError,
  };
};

export default useTransactionData;