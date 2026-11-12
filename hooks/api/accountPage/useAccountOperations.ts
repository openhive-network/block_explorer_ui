import { useQuery, UseQueryResult } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import { keepPreviousDataFor } from "@/hooks/common/keepPreviousDataFor";

const useAccountOperations = (
  accountOperationsProps?: Explorer.AccountSearchOperationsProps,
  liveDataEnabled?: boolean,
  // keepPrevious: show the previous results for the same account while new
  // ones load. Off for callers that read the results as their own state.
  options?: { enabled?: boolean; keepPrevious?: boolean }
) => {
  const { enabled = true, keepPrevious = true } = options || {};
  const fetchAccountOperations = async (
    accountOperationsProps: Explorer.AccountSearchOperationsProps | undefined
  ) => {
    if (!accountOperationsProps) return null;

    return await fetchingService.getOpsByAccount(accountOperationsProps);
  };

  const {
    data: accountOperations,
    isFetching: isAccountOperationsFetching,
    isPending: isAccountOperationsLoading,
    isError: isAccountOperationsError,
    isPlaceholderData: isAccountOperationsPlaceholder,
    refetch: refetchAccountOperations,
  }: UseQueryResult<Hive.AccountOperationsResponse> = useQuery({
    queryKey: ["account_operations", accountOperationsProps, liveDataEnabled],
    queryFn: () => fetchAccountOperations(accountOperationsProps),
    placeholderData: keepPrevious
      ? keepPreviousDataFor(
          (previousKey) =>
            (
              previousKey[1] as
                | Explorer.AccountSearchOperationsProps
                | undefined
            )?.accountName === accountOperationsProps?.accountName
        )
      : undefined,
    refetchOnWindowFocus: false,
    refetchInterval: liveDataEnabled
      ? config.accountRefreshInterval
      : undefined,
    enabled:
      enabled &&
      !!accountOperationsProps?.accountName &&
      !!accountOperationsProps?.accountName.length,
    // User-initiated account search: surface errors via toast even on home.
    meta: { showErrorToast: true },
  });

  return {
    accountOperations,
    isAccountOperationsFetching,
    isAccountOperationsLoading,
    isAccountOperationsError,
    isAccountOperationsPlaceholder,
    refetchAccountOperations,
  };
};

export default useAccountOperations;
