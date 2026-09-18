import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountOpenOrders = (
  accountName: string,
  options?: { enabled?: boolean }
) => {
  const { enabled = true } = options || {};

  const {
    data: openOrders,
    isLoading: isOpenOrdersLoading,
    isError: isOpenOrdersError,
  }: UseQueryResult<Hive.OpenOrder[]> = useQuery({
    queryKey: ["account_open_orders", accountName],
    queryFn: () => fetchingService.getOpenOrders(accountName),
    refetchOnWindowFocus: false,
    enabled: enabled && !!accountName,
    staleTime: 30 * 1000,
    meta: { suppressErrorToast: true },
  });

  return { openOrders, isOpenOrdersLoading, isOpenOrdersError };
};

export default useAccountOpenOrders;
