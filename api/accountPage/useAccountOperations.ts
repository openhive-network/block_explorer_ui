import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";
import { useEffect } from "react";

const useAccountOperations = (
  accountOperationsProps?: Explorer.AccountSearchOperationsProps,
  liveUpdate?: boolean
) => {
  const {
    data: accountOperations,
    isFetching: isAccountOperationsLoading,
    isError: isAccountOperationsError,
    refetch
  }: UseQueryResult<Hive.AccountOperationsResponse> = useQuery({
    queryKey: ["account_operations", accountOperationsProps],
    queryFn: () => fetchAccountOperations(accountOperationsProps),
    refetchOnWindowFocus: false,
    enabled:
      !!accountOperationsProps?.accountName &&
      !!accountOperationsProps?.accountName.length,
    refetchInterval: liveUpdate ? 3000 : Infinity
  });

  const fetchAccountOperations = async (
    accountOperationsProps: Explorer.AccountSearchOperationsProps | undefined
  ) => {
    if (!accountOperationsProps) return null;
    return await fetchingService.getOpsByAccount(accountOperationsProps);
  };

  useEffect(() => {
    if(liveUpdate) {
      refetch();
    }
  }, [liveUpdate, refetch]);

  return {
    accountOperations,
    isAccountOperationsLoading,
    isAccountOperationsError,
  };
};

export default useAccountOperations;
