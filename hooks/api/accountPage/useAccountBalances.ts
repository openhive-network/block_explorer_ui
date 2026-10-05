import { useQuery, UseQueryResult } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

// inlineErrors: the caller shows its own message (e.g. "account not found"),
// so skip the global toast and don't retry a definitive "does not exist".
const useAccountBalances = (
  accountName: string,
  { inlineErrors = false }: { inlineErrors?: boolean } = {}
) => {
  const {
    data: accountBalancesData,
    isLoading: accountBalancesDataLoading,
    isError: accountBalancesDataError,
  }: UseQueryResult<Hive.AccountBalancesResponse> = useQuery({
    queryKey: ["account_balances", accountName],
    queryFn: () => fetchingService.getAccountBalances(accountName),
    refetchOnWindowFocus: false,
    enabled: !!accountName && !!accountName.length,
    ...(inlineErrors
      ? { meta: { suppressErrorToast: true }, retry: false }
      : {}),
  });

  return {
    accountBalancesData,
    accountBalancesDataLoading,
    accountBalancesDataError,
  };
};

export default useAccountBalances;
